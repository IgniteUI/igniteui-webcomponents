import { LitElement, html } from 'lit';
import { styles } from './card.media.material.css';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
export class IgcCardMedia extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  render() {
    return html`<slot></slot>`;
  }
}
