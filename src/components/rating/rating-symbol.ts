import { html, LitElement } from 'lit';

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
