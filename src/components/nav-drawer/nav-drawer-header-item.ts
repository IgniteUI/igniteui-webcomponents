import { html, LitElement } from 'lit';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/nav-drawer/themes/header-item.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './themes/header-item.base.css.js';
import { styles as shared } from './themes/shared/header-item/header-item.common.css.js';

/**
 * Represents a navigation drawer header item.
 * @element igc-nav-drawer-header-item
 *
 * @slot - Renders the header content
 */
export default class IgcNavDrawerHeaderItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-header-item';
  public static override styles = [componentBase, styles, shared];

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
