import { html, LitElement } from 'lit';

import { themes } from '../../theming/theming-decorator.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcListHeaderComponent from './list-header.js';
import IgcListItemComponent from './list-item.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/container/list.common.css.js';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
@themes(all)
export default class IgcListComponent extends LitElement {
  public static readonly tagName = 'igc-list';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcListComponent,
      IgcListItemComponent,
      IgcListHeaderComponent
    );
  }

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'list',
      },
    });
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
