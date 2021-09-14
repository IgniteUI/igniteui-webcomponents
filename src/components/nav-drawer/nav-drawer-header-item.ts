import { html, LitElement } from 'lit';

/** A wrapper for navigation drawer's header.
 * @element - igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export class IgcNavDrawerHeaderItemComponent extends LitElement {
  render() {
    return html`<slot></slot>`;
  }
}
