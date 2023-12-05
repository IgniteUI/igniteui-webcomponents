import { LitElement, html } from 'lit';

import { styles } from './themes/dropdown-header.base.css.js';
import { all } from './themes/header.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * Represents a header item in a igc-dropdown list.
 *
 * @element igc-dropdown-header
 *
 * @slot - Renders the header.
 */
@themes(all)
export default class IgcDropdownHeaderComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-header';
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
    'igc-dropdown-header': IgcDropdownHeaderComponent;
  }
}
