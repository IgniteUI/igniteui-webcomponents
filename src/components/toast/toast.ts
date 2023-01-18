import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/toast.base.css.js';
import { styles as bootstrap } from './themes/toast.bootstrap.css.js';
import { styles as fluent } from './themes/toast.fluent.css.js';
import { styles as indigo } from './themes/toast.indigo.css.js';
import { AnimationPlayer, fadeIn, fadeOut } from '../../animations/index.js';

/**
 * A toast component is used to show a notification
 *
 * @element igc-toast
 *
 * @csspart base - The base wrapper of the toast.
 */

@themes({ bootstrap, fluent, indigo })
export default class IgcToastComponent extends LitElement {
  public static readonly tagName = 'igc-toast';
  public static override styles = [styles];

  private displayTimeout!: ReturnType<typeof setTimeout>;
  private animationPlayer!: AnimationPlayer;

  /**
   * Determines whether the toast is opened.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Determines the time after which the toast will close
   * @attr display-time
   */
  @property({ type: Number, reflect: false, attribute: 'display-time' })
  public displayTime = 4000;

  /**
   * Determines whether the toast is closed automatically or not.
   * @attr keep-open
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
  public keepOpen = false;

  public override firstUpdated() {
    this.animationPlayer = new AnimationPlayer(this);
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? fadeIn : fadeOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation),
    ]);

    return event.type === 'finish';
  }

  /** Closes the toast. */
  public async hide() {
    if (this.open) {
      await this.toggleAnimation('close');
      this.open = false;
    }
  }

  /** Opens the toast. */
  public show() {
    window.clearTimeout(this.displayTimeout);

    if (!this.open) {
      this.toggleAnimation('open');
      this.open = true;
    }

    if (this.keepOpen === false) {
      this.displayTimeout = setTimeout(async () => {
        await this.toggleAnimation('close');
        this.open = false;
      }, this.displayTime);
    }
  }

  /** Toggles the open state of the toast. */
  public toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  public override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'alert');
    }
    if (!this.hasAttribute('aria-live')) {
      this.setAttribute('aria-live', 'polite');
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}
