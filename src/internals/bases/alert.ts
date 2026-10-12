import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addAnimationController } from '#animations/player.js';
import { fadeIn, fadeOut } from '#animations/presets/fade/index.js';
import type {
  AbsolutePosition,
  NotificationPositioning,
} from '../../components/types.js';
import { addCommandController } from '../controllers/command.js';
import { addHostListeners } from '../controllers/host-listeners.js';
import { addInternalsController } from '../controllers/internals.js';
import { createMutationController } from '../controllers/mutation-observer.js';
import { createTimer } from '../timing.js';
import { getRoot, getVisibleAncestor, isPopoverOpen } from '../utils/dom.js';
import { nanoid } from '../utils/strings.js';

/** The names that open components add to the `anchor-name` of a container. */
const containerAnchors = new WeakMap<HTMLElement, Set<string>>();

function applyAnchorNames(container: HTMLElement, names: Set<string>): void {
  const value = [...names].join(', ');
  if (container.style.getPropertyValue('anchor-name') !== value) {
    container.style.setProperty('anchor-name', value);
  }
}

/**
 * Adds `name` to the `anchor-name` of `container`. Adds nothing and returns
 * `false` when the container has anchor names of its own.
 */
function addAnchorName(container: HTMLElement, name: string): boolean {
  let names = containerAnchors.get(container);

  if (!names) {
    const own = getComputedStyle(container).getPropertyValue('anchor-name');
    if (own !== 'none') {
      return false;
    }

    names = new Set();
    containerAnchors.set(container, names);
  }

  names.add(name);
  applyAnchorNames(container, names);
  return true;
}

function removeAnchorName(container: HTMLElement, name: string): void {
  const names = containerAnchors.get(container);
  // The container has anchor names of its own now.
  if (!names) {
    return;
  }

  names.delete(name);

  if (!names.size) {
    containerAnchors.delete(container);
  }

  applyAnchorNames(container, names);
}

/* omitModule */
export abstract class IgcBaseAlertLikeComponent extends LitElement {
  protected readonly _player = addAnimationController(this);

  private readonly _autoHideTimer = createTimer(() => this.hide());
  private readonly _anchorName = `--igc-alert-${nanoid(10)}`;

  // A new `style` attribute, such as from a template binding, drops the anchor.
  private readonly _anchorObserver = createMutationController(this, {
    callback: this._applyAnchor,
    config: { attributeFilter: ['style'] },
    target: (): Element[] => (this._anchor ? [this._anchor, this] : []),
  });

  /** The container that anchors the component in `container` positioning. */
  private _anchor?: HTMLElement;

  /** The positioning of the shown popover. */
  private _shownAs?: NotificationPositioning;

  /** Whether the pointer or the keyboard focus is in the component. */
  private readonly _holds = new Set<'pointer' | 'focus'>();

  /** Whether `hide()` fades the component out. */
  private _closing = false;

  /** Counts the open state changes, so that only the last fade-out closes. */
  private _transitions = 0;

  /** Whether the component is open and does not fade out. */
  private get _isShown(): boolean {
    return this.open && !this._closing;
  }

  /**
   * Sets the open state of the component.
   *
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Sets the time in milliseconds that the component stays visible.
   * The time stops while the pointer or the keyboard focus is in the
   * component, and starts again when both leave.
   *
   * @attr display-time
   * @default 4000
   */
  @property({ type: Number, attribute: 'display-time' })
  public displayTime = 4000;

  /**
   * Keeps the component open after the `displayTime` is over.
   *
   * @attr keep-open
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
  public keepOpen = false;

  /**
   * Sets the position of the component in the viewport or in the container.
   *
   * @attr position
   * @default 'bottom'
   */
  @property({ reflect: true })
  public position: AbsolutePosition = 'bottom';

  /**
   * Sets the positioning strategy of the component.
   *
   * `viewport` - positions against the viewport, ignoring every ancestor.
   * `container` - positions inside the bounding box of the closest visible
   * ancestor, at the place that `position` sets.
   *
   * @attr positioning
   * @default 'viewport'
   */
  @property({ reflect: true })
  public positioning: NotificationPositioning = 'viewport';

  constructor() {
    super();

    addCommandController(this)
      .set('--show', this.show)
      .set('--hide', this.hide)
      .set('--toggle', this.toggle);

    addInternalsController(this, {
      initialARIA: {
        role: 'status',
        ariaLive: 'polite',
      },
    });

    addHostListeners(this, {
      events: [
        'pointerenter',
        'pointerleave',
        'pointerdown',
        'focusin',
        'focusout',
      ],
      listener: this._handleHold,
    });
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.popover = 'manual';

    // After a move, the update shows the popover again.
    if (this.open) {
      this.requestUpdate();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._holds.clear();
    this._autoHideTimer.stop();
    this._hidePopover();
  }

  protected override update(props: PropertyValues<this>): void {
    const reshow =
      this.open && this.isConnected && this._shownAs !== this.positioning;

    if (reshow) {
      this._hidePopover();
      this._showPopover();
    } else if (!this.open && props.has('open')) {
      this._holds.clear();
      this._hidePopover();
    }

    if (
      reshow ||
      props.has('open') ||
      props.has('displayTime') ||
      props.has('keepOpen')
    ) {
      this._setAutoHideTimer();
    }

    super.update(props);
  }

  private readonly _handleHold = (event: Event): void => {
    switch (event.type) {
      case 'pointerenter':
        this._holds.add('pointer');
        break;
      case 'pointerleave':
        this._holds.delete('pointer');
        break;
      case 'focusin':
        // A pointer click on the action does not hold the component open.
        if ((event.composedPath()[0] as Element).matches(':focus-visible')) {
          this._holds.add('focus');
        }
        break;
      default:
        // A `pointerdown` also ends the focus hold. A click on the element
        // with the keyboard focus fires no `focusin`, and it stays focus-visible.
        this._holds.delete('focus');
    }

    this._setAutoHideTimer();
  };

  private _showPopover(): boolean {
    if (this.positioning !== 'container') {
      this.showPopover();
    } else {
      const container = getVisibleAncestor(this);
      if (!container) {
        return false;
      }

      // An anchor name reaches only its own tree, and the container may have
      // anchor names of its own. Otherwise the container is the source of the
      // popover, and the browser moves the popover after it in the tab order.
      if (
        getRoot(container) === getRoot(this) &&
        addAnchorName(container, this._anchorName)
      ) {
        this._anchor = container;
        this._applyAnchor();
        this._anchorObserver.observe();
        this.showPopover();
      } else {
        this.showPopover({ source: container });
      }
    }

    this._shownAs = this.positioning;
    return true;
  }

  private _hidePopover(): void {
    if (isPopoverOpen(this)) {
      this.hidePopover();
    }

    this._shownAs = undefined;
    if (this._anchor) {
      this._anchorObserver.disconnect();
      removeAnchorName(this._anchor, this._anchorName);
      this.style.removeProperty('position-anchor');
      this._anchor = undefined;
    }
  }

  private _applyAnchor(): void {
    const container = this._anchor;
    if (!container) {
      return;
    }

    const names = containerAnchors.get(container);
    const value = container.style.getPropertyValue('anchor-name');

    // The container got anchor names of its own, so it becomes the source.
    if (!names || (value && value !== [...names].join(', '))) {
      containerAnchors.delete(container);
      this._hidePopover();
      this._showPopover();
      return;
    }

    applyAnchorNames(container, names);
    if (this.style.getPropertyValue('position-anchor') !== this._anchorName) {
      this.style.setProperty('position-anchor', this._anchorName);
    }
  }

  private async _setOpenState(open: boolean): Promise<boolean> {
    const transition = ++this._transitions;
    this._closing = !open;

    if (open) {
      // During the fade-out, the popover is still open.
      if (!this.open && !this._showPopover()) {
        return false;
      }

      this.open = true;
      const state = await this._player.playExclusive(fadeIn());
      this._setAutoHideTimer();
      return state;
    }

    this._autoHideTimer.stop();
    const state = await this._player.playExclusive(fadeOut());

    // A `show()` during the fade-out keeps the component open.
    if (transition === this._transitions) {
      this._closing = false;
      this._hidePopover();
      this.open = false;
    }

    return state;
  }

  private _setAutoHideTimer(): void {
    this._autoHideTimer.stop();
    if (
      this.isConnected &&
      this._isShown &&
      this.displayTime > 0 &&
      !this.keepOpen &&
      !this._holds.size
    ) {
      this._autoHideTimer.start(this.displayTime);
    }
  }

  /**
   * Opens the component, also during the fade-out of `hide()`. When it is
   * already open, the display time starts again, and the promise resolves to
   * `false`. It also resolves to `false` when `container` positioning finds no
   * visible ancestor.
   */
  public async show(): Promise<boolean> {
    if (this._isShown) {
      this._setAutoHideTimer();
      return false;
    }

    return this._setOpenState(true);
  }

  /**
   * Closes the component. Resolves to `false` when it is already closed or
   * fades out.
   */
  public async hide(): Promise<boolean> {
    return this._isShown ? this._setOpenState(false) : false;
  }

  /** Toggles the component. Resolves to `true` when the state changed. */
  public async toggle(): Promise<boolean> {
    return this._isShown ? this.hide() : this.show();
  }
}
