import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/light/header-item/nav-drawer-header-item.base.css.js';
import { styles as fluent } from './themes/light/header-item/nav-drawer-header-item.fluent.css.js';
import {
  styles as bootstrap,
  styles as indigo,
  styles as material,
} from './themes/light/header-item/nav-drawer-header-item.indigo.css.js';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
@themes({ fluent, indigo, bootstrap, material })
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-header-item': IgcNavDrawerHeaderItemComponent;
  }
}
