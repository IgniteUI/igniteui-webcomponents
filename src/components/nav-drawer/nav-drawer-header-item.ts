import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles as indigo } from './styles/indigo/nav-drawer-header-item.indigo.css.js';
import { styles } from './styles/nav-drawer-header-item.base.css.js';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
@themes({ indigo })
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';
  public static override styles = styles;

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-header-item': IgcNavDrawerHeaderItemComponent;
  }
}
