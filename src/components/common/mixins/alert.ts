import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import type { AnimationController } from '../../../animations/player.js';
import { fadeIn, fadeOut } from '../../../animations/presets/fade/index.js';
import type { AbsolutePosition } from '../../types.js';
import { addInternalsController } from '../controllers/internals.js';

// It'd be better to have this as a mixin rather than a base class once the analyzer
// knows how to resolve multiple mixin chains

export abstract class IgcBaseAlertLikeComponent extends LitElement {
  declare protected abstract readonly _player: AnimationController;

  protected _autoHideTimeout?: ReturnType<typeof setTimeout>;

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

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'status',
        ariaLive: 'polite',
      },
    });
  }

  protected override updated(props: PropertyValues<this>): void {
    if (props.has('displayTime')) {
      this._setAutoHideTimer();
    }

    if (props.has('keepOpen')) {
      clearTimeout(this._autoHideTimeout);
    }
  }

  private async _setOpenState(open: boolean): Promise<boolean> {
    let state: boolean;

    if (open) {
      this.open = open;
      state = await this._player.playExclusive(fadeIn());
      this._setAutoHideTimer();
    } else {
      clearTimeout(this._autoHideTimeout);
      state = await this._player.playExclusive(fadeOut());
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
