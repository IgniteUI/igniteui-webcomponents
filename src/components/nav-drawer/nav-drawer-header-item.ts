import { html, LitElement } from 'lit';
import { themes } from '../../theming';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
@themes({
  material: './nav-drawer/styles/material/nav-drawer-header-item.material.scss',
  bootstrap:
    './nav-drawer/styles/bootstrap/nav-drawer-header-item.bootstrap.scss',
  indigo: './nav-drawer/styles/indigo/nav-drawer-header-item.indigo.scss',
  fluent: './nav-drawer/styles/fluent/nav-drawer-header-item.fluent.scss',
})
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-header-item': IgcNavDrawerHeaderItemComponent;
  }
}
