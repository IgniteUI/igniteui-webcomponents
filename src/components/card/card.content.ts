import { html, LitElement } from 'lit';
import { DynamicTheme, theme } from '../../theming';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
export default class IgcCardContentComponent extends LitElement {
  @theme({
    material: './themes/light/card.content.material.scss',
    bootstrap: './themes/light/card.content.bootstrap.scss',
    fluent: './themes/light/card.content.material.scss',
    indigo: './themes/light/card.content.material.scss',
  })
  protected theme!: DynamicTheme;

  public static readonly tagName = 'igc-card-content';

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
    'igc-card-content': IgcCardContentComponent;
  }
}
