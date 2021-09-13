import { LitElement, html } from 'lit';
import { styles } from './card.content.material.css';

/** A wrapper for card text content
 * @element - igc-card-content
 *
 * @slot - Renders the card text content
 */
export class IgcCardContent extends LitElement {
  static styles = styles;

  render() {
    return html`<slot></slot>`;
  }
}
