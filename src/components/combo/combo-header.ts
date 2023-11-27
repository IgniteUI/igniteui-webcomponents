import { LitElement, html } from 'lit';

import { styles } from './themes/combo-header.base.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { all } from '../dropdown/themes/header.js';

/* blazorSuppress */
@themes(all)
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
