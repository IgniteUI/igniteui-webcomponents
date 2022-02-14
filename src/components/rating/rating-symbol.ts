import { html, LitElement } from 'lit';

/**
 *
 * Used when a custom icon/symbol/element needs to be passed to the igc-rating component.
 *
 * @element igc-rating-symbol
 *
 * @slot - Default slot for projected symbols/icons.
 */
export default class IgcRatingSymbolComponent extends LitElement {
  public static readonly tagName = 'igc-rating-symbol';

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating-symbol': IgcRatingSymbolComponent;
  }
}
