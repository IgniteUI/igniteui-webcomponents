import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './toast.material.css';

/**
 * A toast component is used to show a notification
 *
 * @element igc-toast
 *
 * @csspart base - The base wrapper of the toast.
 */

export default class IgcToastComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-toast';

  /** @private */
  public static styles = styles;

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

  /** The text of the toast. */
  @property({ type: String })
  public message!: string;

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

  protected render() {
    return html` <div part="base">${this.message}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}
