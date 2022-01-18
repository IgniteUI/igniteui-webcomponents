import { LitElement, html } from 'lit';
import { styles } from './card.media.material.css';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
export default class IgcCardMediaComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-card-media';

  /** @private */
  public static override styles = styles;

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-media': IgcCardMediaComponent;
  }
}
