import { html, LitElement } from 'lit';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from './themes/dropdown-header.base.css.js';
import { all } from './themes/header.js';
import { styles as shared } from './themes/shared/header/dropdown-header.common.css.js';

/**
 * Represents a header item in a dropdown list.
 *
 * @element igc-dropdown-header
 *
 * @slot - Renders the header.
 */
export default class IgcDropdownHeaderComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDropdownHeaderComponent);
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
    'igc-dropdown-header': IgcDropdownHeaderComponent;
  }
}
