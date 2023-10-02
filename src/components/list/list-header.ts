import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/light/list-header.base.css.js';
import { styles as indigo } from './themes/light/list-header.indigo.css.js';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
@themes({ light: { indigo }, dark: { indigo } })
export default class IgcListHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-list-header';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'separator');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-header': IgcListHeaderComponent;
  }
}
