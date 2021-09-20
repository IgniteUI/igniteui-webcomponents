import { LitElement, html } from 'lit';
import { styles } from './card.media.material.css';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
export class IgcCardMedia extends LitElement {
  public static styles = styles;

  protected render() {
    return html`<slot></slot>`;
  }
}
