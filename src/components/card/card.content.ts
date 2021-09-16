import { LitElement, html } from 'lit';
import { styles } from './card.content.material.css';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
export class IgcCardContent extends LitElement {
  static styles = styles;

  render() {
    return html`<slot></slot>`;
  }
}
