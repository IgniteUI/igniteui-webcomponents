import { html, LitElement } from 'lit';
import { registerComponent } from '../common/util.js';
import { styles } from './rating-symbol.base.css.js';

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

  public static register() {
    registerComponent(this);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.slot = this.slot.length > 0 ? this.slot : 'symbol';
  }

  protected override render() {
    return html`
      <div part="symbol full">
        <slot> </slot>
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
