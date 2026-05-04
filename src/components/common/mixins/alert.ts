import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addAnimationController } from '../../../animations/player.js';
import { fadeIn, fadeOut } from '../../../animations/presets/fade/index.js';
import type { AbsolutePosition } from '../../types.js';
import { addInternalsController } from '../controllers/internals.js';

function getVisibleAncestor(startNode: Node): HTMLElement | null {
  let node: Node | null = startNode.parentNode;

  while (node) {
    if (node instanceof ShadowRoot) {
      node = node.host;
      continue;
    }

    if (node instanceof HTMLElement && node.checkVisibility()) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
}

export abstract class IgcBaseAlertLikeComponent extends LitElement {
  protected readonly _player = addAnimationController(this);

  protected _autoHideTimeout?: ReturnType<typeof setTimeout>;

  private get _isContained(): boolean {
    return this.positioning === 'container';
  }

  // TODO: Move this to styles, i.e. :host([position="top"]) { top: anchor(top); } etc.
  private get _containerPosition(): string {
    switch (this.position) {
      case 'top':
        return 'anchor(top)';
      case 'bottom':
        return 'calc(anchor(bottom) - 25%)';
      default:
        return 'anchor(center)';
    }
  }

  /**
   * Whether the component is in shown state.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Determines the duration in ms in which the component will be visible.
   * @attr display-time
   */
  @property({ type: Number, attribute: 'display-time' })
  public displayTime = 4000;

  /**
   * Determines whether the component should close after the `displayTime` is over.
   * @attr keep-open
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
  public keepOpen = false;

  /**
   * Sets the position of the component in the viewport.
   * @attr
   */
  @property({ reflect: true })
  public position: AbsolutePosition = 'bottom';

  @property({ reflect: true })
  public positioning: 'viewport' | 'container' = 'viewport';

  constructor() {
    super();

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
    if (props.has('displayTime')) {
      this._setAutoHideTimer();
    }

    if (props.has('keepOpen')) {
      this.keepOpen
        ? clearTimeout(this._autoHideTimeout)
        : this._setAutoHideTimer();
    }

    if (this.open && (props.has('positioning') || props.has('position'))) {
      this._hidePopover();
      this._showPopover();
    }

    super.update(props);
  }

  private _showPopover(): boolean {
    if (!this._isContained) {
      this.showPopover();
      return true;
    }

    const visibleAncestor = getVisibleAncestor(this);
    if (!visibleAncestor) {
      return false;
    }

    this.style.top = this._containerPosition;
    this.style.left = 'anchor(center)';
    this.showPopover({ source: visibleAncestor });
    return true;
  }

  private _hidePopover(): void {
    this.hidePopover();

    if (this._isContained) {
      this.style.removeProperty('top');
      this.style.removeProperty('left');
    }
  }

  private async _setOpenState(open: boolean): Promise<boolean> {
    let state: boolean;

    if (open) {
      this.open = open;

      if (!this._showPopover()) {
        this.open = false;
        return false;
      }

      state = await this._player.playExclusive(fadeIn());
      this._setAutoHideTimer();
    } else {
      clearTimeout(this._autoHideTimeout);
      state = await this._player.playExclusive(fadeOut());
      this._hidePopover();
      this.open = open;
    }

    return state;
  }

  private _setAutoHideTimer(): void {
    clearTimeout(this._autoHideTimeout);
    if (this.open && this.displayTime > 0 && !this.keepOpen) {
      this._autoHideTimeout = setTimeout(() => this.hide(), this.displayTime);
    }
  }

  /** Opens the component. */
  public async show(): Promise<boolean> {
    return this.open ? false : this._setOpenState(true);
  }

  /** Closes the component. */
  public async hide(): Promise<boolean> {
    return this.open ? this._setOpenState(false) : false;
  }

  /** Toggles the open state of the component. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}
