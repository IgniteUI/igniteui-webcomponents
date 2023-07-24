import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/header/combo-header.base.css.js';
import { styles as bootstrap } from '../dropdown/themes/light/header/dropdown-header.bootstrap.css.js';
import { styles as fluent } from '../dropdown/themes/light/header/dropdown-header.fluent.css.js';

/* blazorSuppress */
@themes({ bootstrap, fluent })
export default class IgcComboHeaderComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-header';
  public static override styles = styles;

  protected override render() {
    return html`<slot></slot>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-header': IgcComboHeaderComponent;
  }
}
