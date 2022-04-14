import { html, LitElement } from 'lit';
import { themes } from '../../theming';
import { styles } from './themes/light/dropdown-header.base.css';
import { styles as bootstrap } from './themes/light/dropdown-header.bootstrap.css';

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
