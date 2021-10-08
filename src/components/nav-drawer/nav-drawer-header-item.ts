import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './nav-drawer-header-item.material.css';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
@customElement('igc-nav-drawer-header-item')
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  /** @private */
  public static styles = [styles];

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-header-item': IgcNavDrawerHeaderItemComponent;
  }
}
