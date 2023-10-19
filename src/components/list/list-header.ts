import { LitElement, html } from 'lit';

import { styles } from './themes/header.base.css.js';
import { all } from './themes/header.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
@themes(all)
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
