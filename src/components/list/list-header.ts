import { LitElement, html } from 'lit';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/header.base.css.js';
import { all } from './themes/header.js';
import { styles as shared } from './themes/shared/header/list-header.common.css.js';

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
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'separator';
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
