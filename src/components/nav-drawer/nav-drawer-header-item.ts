import { html, LitElement } from 'lit';
import { styles } from './nav-drawer-header-item.material.css';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export class IgcNavDrawerHeaderItemComponent extends LitElement {
  /** @private */
  public static styles = [styles];

  protected render() {
    return html`<slot></slot>`;
  }
}
