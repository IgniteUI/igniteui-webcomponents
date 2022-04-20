import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/toast.base.css.js';
import { styles as bootstrap } from './themes/toast.bootstrap.css.js';
import { styles as fluent } from './themes/toast.fluent.css.js';
import { styles as indigo } from './themes/toast.indigo.css.js';

/**
 * A toast component is used to show a notification
 *
 * @element igc-toast
 *
 * @csspart base - The base wrapper of the toast.
 */

@themes({ bootstrap, fluent, indigo })
export default class IgcToastComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-toast';

  /** @private */
  public static override styles = [styles];

  private displayTimeout: any;

  /** Determines whether the toast is opened. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Determines the time after which the toast will close */
  @property({ type: Number, reflect: false, attribute: 'display-time' })
  public displayTime = 4000;

  /** Determines whether the toast is closed automatically or not. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
  public keepOpen = false;

  /** Closes the toast. */
  public hide() {
    if (this.open) {
      this.open = false;
    }
  }

  /** Opens the toast. */
  public show() {
    window.clearTimeout(this.displayTimeout);

    if (!this.open) {
      this.open = true;
    }

    if (this.keepOpen === false) {
      this.displayTimeout = setTimeout(() => {
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

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}
