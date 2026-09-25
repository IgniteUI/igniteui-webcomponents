import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addAnimationController } from '#animations/player.js';
import { fadeIn, fadeOut } from '#animations/presets/fade/index.js';
import type {
  AbsolutePosition,
  NotificationPositioning,
} from '../../components/types.js';
import { addCommandController } from '../controllers/command.js';
import { addInternalsController } from '../controllers/internals.js';
import { createTimer } from '../timing.js';
import { getVisibleAncestor, isPopoverOpen } from '../utils/dom.js';

/* omitModule */
export abstract class IgcBaseAlertLikeComponent extends LitElement {
  protected readonly _player = addAnimationController(this);

  private readonly _autoHideTimer = createTimer(() => this.hide());

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
   * Sets the position of the component in the viewport.
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
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.popover = 'manual';
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('open')) {
      if (this.open && !isPopoverOpen(this)) {
        this._showPopover();
      } else if (!this.open && isPopoverOpen(this)) {
        this.hidePopover();
      }
    }

    if (this.open && (props.has('positioning') || props.has('position'))) {
      this.hidePopover();
      this._showPopover();
    }

    if (
      props.has('open') ||
      props.has('displayTime') ||
      props.has('keepOpen')
    ) {
      this._setAutoHideTimer();
    }

    super.update(props);
  }

  private _showPopover(): boolean {
    if (this.positioning !== 'container') {
      this.showPopover();
      return true;
    }

    const visibleAncestor = getVisibleAncestor(this);
    if (!visibleAncestor) {
      return false;
    }

    this.showPopover({ source: visibleAncestor });
    return true;
  }

  private async _setOpenState(open: boolean): Promise<boolean> {
    if (open) {
      this.open = true;

      if (!this._showPopover()) {
        this.open = false;
        return false;
      }

      const state = await this._player.playExclusive(fadeIn());
      this._setAutoHideTimer();
      return state;
    }

    this._autoHideTimer.stop();
    const state = await this._player.playExclusive(fadeOut());
    this.hidePopover();
    this.open = false;
    return state;
  }

  private _setAutoHideTimer(): void {
    this._autoHideTimer.stop();
    if (this.open && this.displayTime > 0 && !this.keepOpen) {
      this._autoHideTimer.start(this.displayTime);
    }
  }

  /**
   * Opens the component. Resolves to `false` when it is already open, or
   * when `container` positioning finds no visible ancestor.
   */
  public async show(): Promise<boolean> {
    return this.open ? false : this._setOpenState(true);
  }

  /** Closes the component. Resolves to `false` when it is already closed. */
  public async hide(): Promise<boolean> {
    return this.open ? this._setOpenState(false) : false;
  }

  /** Toggles the component. Resolves to `true` when the state changed. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}
