import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './card.media.material.css';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
@customElement('igc-card-media')
export default class IgcCardMedia extends LitElement {
  /** @private */
  public static styles = styles;

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-media': IgcCardMedia;
  }
}
