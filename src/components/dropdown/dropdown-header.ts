import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/header/dropdown-header.base.css';
import { styles as bootstrap } from './themes/light/header/dropdown-header.bootstrap.css.js';
import { styles as fluent } from './themes/light/header/dropdown-header.fluent.css.js';
import { styles as indigo } from './themes/light/header/dropdown-header.indigo.css.js';
import { styles as material } from './themes/light/header/dropdown-header.material.css.js';

/**
 * @element igc-dropdown-header - Represents a header item in a dropdown list.
 *
 * @slot - Renders the header.
 */
@themes({ bootstrap, fluent, indigo, material })
export default class IgcDropdownHeaderComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-header';

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
