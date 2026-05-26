import { html, LitElement } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/card.media.base.css.js';

/**
 * A container component for card media content such as images, GIFs, or videos.
 * This component should be used within an igc-card element to display visual content.
 *
 * @element igc-card-media
 *
 * @slot - Renders the card media content (e.g., img, video elements).
 *
 * @example
 * ```html
 * <igc-card>
 *   <igc-card-media>
 *     <img src="image.jpg" alt="Card image" />
 *   </igc-card-media>
 * </igc-card>
 * ```
 */
export default class IgcCardMediaComponent extends LitElement {
  public static readonly tagName = 'igc-card-media';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCardMediaComponent);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-media': IgcCardMediaComponent;
  }
}
