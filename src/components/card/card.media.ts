import { html, LitElement } from 'lit';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/light/card.media.material.css.js';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
export default class IgcCardMediaComponent extends LitElement {
  public static readonly tagName = 'igc-card-media';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-media': IgcCardMediaComponent;
  }
}
