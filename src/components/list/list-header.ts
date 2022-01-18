import { html, LitElement } from 'lit';
import { styles } from './list-header.material.css';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
export default class IgcListHeaderComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-list-header';

  /** @private */
  public static override styles = styles;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'separator');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-header': IgcListHeaderComponent;
  }
}
