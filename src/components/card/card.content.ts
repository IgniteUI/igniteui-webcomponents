import { LitElement, html } from 'lit';
import { styles } from './themes/light/card.content.material.css';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';

  public static override styles = styles;

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContentComponent;
  }
}
