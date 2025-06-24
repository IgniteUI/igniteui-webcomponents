import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { addAnimationController } from '../../../animations/player.js';
import { fadeIn, fadeOut } from '../../../animations/presets/fade/index.js';
import type { AbsolutePosition } from '../../types.js';
import { addInternalsController } from '../controllers/internals.js';
import { watch } from '../decorators/watch.js';

// It'd be better to have this as a mixin rather than a base class once the analyzer
// knows how to resolve multiple mixin chains

export abstract class IgcBaseAlertLikeComponent extends LitElement {
  protected _autoHideTimeout?: number;

  declare protected abstract _animationPlayer: ReturnType<
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

  @watch('displayTime', { waitUntilFirstUpdate: true })
  protected displayTimeChange() {
    this.setAutoHideTimer();
  }

  @watch('keepOpen', { waitUntilFirstUpdate: true })
  protected keepOpenChange() {
    clearTimeout(this._autoHideTimeout);
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
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this.toggleAnimation('open');
    this.setAutoHideTimer();
    return true;
  }

  /** Closes the component. */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    clearTimeout(this._autoHideTimeout);
    await this.toggleAnimation('close');
    this.open = false;
    return true;
  }

  /** Toggles the open state of the component. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}
