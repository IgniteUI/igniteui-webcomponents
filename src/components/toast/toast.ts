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
  public static styles = [styles];

  /** Determines whether the toast is opened. */
  @property({ reflect: true })
  public open!: boolean;

  /** Determines the time after which the toast will close */
  @property({ reflect: false })
  public displayTime!: number;

  /** Determines whether the toast is closed automatically or not. */
  @property({ reflect: true })
  public keepOpen!: boolean;

  /** The text of the toast. */
  @property()
  public message!: string;

  constructor() {
    super();
    this.open = false;
    this.displayTime = 4000;
    this.keepOpen = false;
    this.message = 'Toast message';
  }

  /** Closes the toast. */
  public hide() {
    if (!this.open) {
      return;
    }

    this.open = false;
  }

  /** Opens the toast. */
  public show() {
    if (this.open) {
      return;
    }

    this.open = true;

    setTimeout(this.hide, this.displayTime);
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
    return html`
      <div
        part="base"
        open=${this.open}
        displayTime=${this.displayTime}
        keepOpen=${this.keepOpen}
      >
        <span>${this.message}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}
