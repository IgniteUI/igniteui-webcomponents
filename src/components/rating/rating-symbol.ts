import { html, LitElement } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/rating-symbol.base.css.js';

/**
 *
 * Used when a custom icon/symbol/element needs to be passed to the igc-rating component.
 *
 * @element igc-rating-symbol
 *
 * @slot - Default slot for projected full symbols/icons.
 * @slot empty - Default slot for projected empty symbols/icons.
 *
 * @csspart symbol - The symbol wrapping container.
 * @csspart full - The full symbol wrapping container.
 * @csspart empty - The empty symbol wrapping container.
 */
export default class IgcRatingSymbolComponent extends LitElement {
  public static readonly tagName = 'igc-rating-symbol';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRatingSymbolComponent);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.slot = this.slot || 'symbol';
  }

  protected override render() {
    return html`
      <div part="symbol full">
        <slot></slot>
      </div>
      <div part="symbol empty">
        <slot name="empty"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating-symbol': IgcRatingSymbolComponent;
  }
}
