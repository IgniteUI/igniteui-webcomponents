import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './toast.material.css';

/**
 * An toast component is used as a representation of a user identity
 * typically in a user profile.
 *
 * @element igc-toast
 *
 * @slot - Renders an icon inside the default slot.
 *
 * @csspart base - The base wrapper of the toast.
 * @csspart initials - The initials wrapper of the toast.
 * @csspart image - The image wrapper of the toast.
 * @csspart icon - The icon wrapper of the toast.
 */
export default class IgcToastComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-toast';

  /** @private */
  public static styles = [styles];

  /** The text of the toast. */
  @property()
  public message!: string;

  @property()
  public position!: 'top' | 'middle' | 'bottom';

  constructor() {
    super();
    this.message = 'Toast message';
    this.position = 'bottom';
  }

  _showToast() {}

  protected render() {
    return html`
      <div part="base">
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
