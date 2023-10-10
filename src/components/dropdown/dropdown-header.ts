import { LitElement, html } from 'lit';

import { styles } from './themes/light/header/dropdown-header.base.css.js';
import { styles as bootstrap } from './themes/light/header/dropdown-header.bootstrap.css.js';
import { styles as fluent } from './themes/light/header/dropdown-header.fluent.css.js';
import { styles as indigo } from './themes/light/header/dropdown-header.indigo.css.js';
import { styles as material } from './themes/light/header/dropdown-header.material.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * @element igc-dropdown-header - Represents a header item in a dropdown list.
 *
 * @slot - Renders the header.
 */
@themes({
  light: { bootstrap, fluent, indigo, material },
  dark: { bootstrap, fluent, indigo, material },
})
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
