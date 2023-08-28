import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './themes/light/list.base.css.js';
import { styles as bootstrap } from './themes/light/list.bootstrap.css.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcListHeaderComponent from './list-header.js';
import IgcListItemComponent from './list-item.js';

defineComponents(IgcListItemComponent, IgcListHeaderComponent);

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
@themes({ bootstrap })
export default class IgcListComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-list';
  public static override styles = styles;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }

  protected override render() {
    return html` <style>
        :host {
          --component-size: var(--ig-size, var(--ig-size-${this.size}));
        }
      </style>
      <slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}
