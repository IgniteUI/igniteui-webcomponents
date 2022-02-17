import { html, LitElement } from 'lit';
import { DynamicTheme, theme } from '../../theming';

/** A container for card's media - could be an image, gif, video
 * @element igc-card-media
 *
 * @slot - Renders the card media content
 */
export default class IgcCardMediaComponent extends LitElement {
  @theme({
    material: './themes/light/card.media.material.scss',
    bootstrap: './themes/light/card.media.material.scss',
    fluent: './themes/light/card.media.material.scss',
    indigo: './themes/light/card.media.material.scss',
  })
  protected theme!: DynamicTheme;
  public static readonly tagName = 'igc-card-media';

  protected override render() {
    return html`
      <style>
        ${this.theme.styles}
      </style>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-media': IgcCardMediaComponent;
  }
}
