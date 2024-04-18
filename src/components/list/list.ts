import { LitElement, html } from 'lit';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcListHeaderComponent from './list-header.js';
import IgcListItemComponent from './list-item.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
@themes(all)
export default class IgcListComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-list';
  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(this, IgcListItemComponent, IgcListHeaderComponent);
  }

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'list';
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}
