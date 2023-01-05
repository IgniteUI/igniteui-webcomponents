import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/header/combo-header.base.css.js';
import { styles as bootstrap } from '../dropdown/themes/light/dropdown-header.bootstrap.css.js';
import { styles as fluent } from '../dropdown/themes/light/dropdown-header.fluent.css.js';
import { registerComponent } from '../common/util.js';

@themes({ bootstrap, fluent })
export default class IgcComboHeaderComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-header';
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
    'igc-combo-header': IgcComboHeaderComponent;
  }
}
