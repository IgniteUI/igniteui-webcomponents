import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/dropdown-header.base.css.js';
import { styles as bootstrap } from './themes/light/dropdown-header.bootstrap.css.js';

/**
 * @element igc-dropdown-header - Represents a header item in a dropdown list.
 *
 * @slot - Renders the header.
 */
@themes({ bootstrap })
export default class IgcDropdownHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-dropdown-header';

  public static override styles = styles;

  protected override render() {
    return html`<slot></slot>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-header': IgcDropdownHeaderComponent;
  }
}
