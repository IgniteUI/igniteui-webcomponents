import { html, LitElement } from 'lit';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/header-item.base.css.js';
import { all } from './themes/header-item.js';
import { styles as shared } from './themes/shared/header-item/header-item.common.css.js';

/**
 * A wrapper for navigation drawer's header.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcNavDrawerHeaderItemComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
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
