import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addAnimationController } from '../../../animations/player.js';
import { fadeIn, fadeOut } from '../../../animations/presets/fade/index.js';
import type { AbsolutePosition } from '../../types.js';
import { addInternalsController } from '../controllers/internals.js';
import { getVisibleAncestor, isPopoverOpen } from '../util.js';

export abstract class IgcBaseAlertLikeComponent extends LitElement {
  protected readonly _player = addAnimationController(this);

  protected _autoHideTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Whether the component is in shown state.
   *
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Determines the duration in milliseconds in which the component will be visible.
   *
   * @attr display-time
   * @default 4000
   */
  @property({ type: Number, attribute: 'display-time' })
  public displayTime = 4000;

  /**
   * Determines whether the component should close after the `displayTime` is over.
   *
   * @attr keep-open
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
  public keepOpen = false;

  /**
   * Sets the position of the component in the viewport.
   *
   * `bottom` - positions the component at the bottom. This is the default.
   * `middle` - positions the component at the center.
   * `top` - positions the component at the top.
   *
   * @attr position
   * @default 'bottom'
   */
  @property({ reflect: true })
  public position: AbsolutePosition = 'bottom';

  /**
   * Sets the positioning strategy of the component.
   *
   * `viewport` - positions the component relative to the viewport, ignoring any ancestor elements. This is the default behavior.
   * `container` - positions the component relative to the nearest visible ancestor. In this mode, the component will be constrained within the bounding box of the ancestor and will be positioned according to the `position` attribute.
   *
   * @attr positioning
   * @default 'viewport'
   */
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

    clearTimeout(this._autoHideTimeout);
    const state = await this._player.playExclusive(fadeOut());
    this.hidePopover();
    this.open = false;
    return state;
  }

  private _setAutoHideTimer(): void {
    clearTimeout(this._autoHideTimeout);
    if (this.open && this.displayTime > 0 && !this.keepOpen) {
      this._autoHideTimeout = setTimeout(() => this.hide(), this.displayTime);
    }
  }

  /**
   * Opens the component.
   *
   * Returns a promise that resolves to `true` if the component was successfully opened, or `false`
   * if it was already open or could not be shown (e.g., in `container` positioning mode with no visible ancestors).
   */
  public async show(): Promise<boolean> {
    return this.open ? false : this._setOpenState(true);
  }

  /**
   * Closes the component.
   *
   * Returns a promise that resolves to `true` if the component was successfully closed, or `false`
   * if it was already closed.
   */
  public async hide(): Promise<boolean> {
    return this.open ? this._setOpenState(false) : false;
  }

  /**
   * Toggles the open state of the component.
   *
   * Returns a promise that resolves to `true` if the operation completed successfully, or `false`
   * if it was already in the desired state.
   */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}
