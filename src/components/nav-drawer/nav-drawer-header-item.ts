import { html, LitElement } from 'lit';
import { styles } from './nav-drawer-header-item.material.css';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-nav-drawer-header-item';

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
