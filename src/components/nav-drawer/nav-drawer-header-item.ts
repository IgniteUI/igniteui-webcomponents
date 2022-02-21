import { html, LitElement } from 'lit';
import { styles } from './styles/bootstrap/nav-drawer-header-item.bootstrap.css';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';

  public static override styles = [styles];

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-header-item': IgcNavDrawerHeaderItemComponent;
  }
}
