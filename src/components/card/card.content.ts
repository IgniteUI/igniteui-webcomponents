import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './card.content.material.css';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
@customElement('igc-card-content')
export default class IgcCardContent extends LitElement {
  /** @private */
  public static styles = styles;

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContent;
  }
}
