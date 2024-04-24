import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { addAnimationController } from '../../../animations/player.js';
import { fadeIn, fadeOut } from '../../../animations/presets/fade/index.js';
import { watch } from '../decorators/watch.js';

// It'd be better to have this as a mixin rather than a base class once the analyzer
// knows how to resolve multiple mixin chains

export abstract class IgcBaseAlertLikeComponent extends LitElement {
  private _internals: ElementInternals;
  protected _autoHideTimeout?: number;

  protected declare abstract _animationPlayer: ReturnType<
    typeof addAnimationController
  >;

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
  public position: 'bottom' | 'middle' | 'top' = 'bottom';

  @watch('displayTime', { waitUntilFirstUpdate: true })
  protected displayTimeChange() {
    this.setAutoHideTimer();
  }

  @watch('keepOpen', { waitUntilFirstUpdate: true })
  protected keepOpenChange() {
    clearTimeout(this._autoHideTimeout);
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'status';
    this._internals.ariaLive = 'polite';
  }

  private async toggleAnimation(state: 'open' | 'close') {
    const animation = state === 'open' ? fadeIn : fadeOut;

    const [_, event] = await Promise.all([
      this._animationPlayer.stopAll(),
      this._animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private setAutoHideTimer() {
    clearTimeout(this._autoHideTimeout);
    if (this.open && this.displayTime > 0 && !this.keepOpen) {
      this._autoHideTimeout = setTimeout(() => this.hide(), this.displayTime);
    }
  }

  /** Opens the component. */
  public async show() {
    if (this.open) {
      return;
    }

    this.open = true;
    await this.toggleAnimation('open');
    this.setAutoHideTimer();
  }

  /** Closes the component. */
  public async hide() {
    if (!this.open) {
      return;
    }

    clearTimeout(this._autoHideTimeout);
    await this.toggleAnimation('close');
    this.open = false;
  }

  /** Toggles the open state of the component. */
  public toggle() {
    this.open ? this.hide() : this.show();
  }
}
