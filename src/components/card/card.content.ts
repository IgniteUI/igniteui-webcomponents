import { html, LitElement } from 'lit';
import { themes } from '../../theming';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
@themes({
  material: './card/themes/light/card.content.material.scss',
  bootstrap: './card/themes/light/card.content.bootstrap.scss',
  fluent: './card/themes/light/card.content.material.scss',
  indigo: './card/themes/light/card.content.material.scss',
})
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContentComponent;
  }
}
