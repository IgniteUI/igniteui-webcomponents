import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './list-header.material.css';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
@customElement('igc-list-header')
export default class IgcListHeaderComponent extends LitElement {
  /** @private */
  public static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'separator');
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-header': IgcListHeaderComponent;
  }
}
