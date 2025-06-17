import { LitElement, html } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcDropdownItemComponent from './dropdown-item.js';
import { styles } from './themes/dropdown-group.base.css.js';
import { all } from './themes/group.js';
import { styles as shared } from './themes/shared/group/dropdown-group.common.css.js';

/**
 * A container for a group of `igc-dropdown-item` components.
 *
 * @element igc-dropdown-group
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
@themes(all)
export default class IgcDropdownGroupComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDropdownGroupComponent);
  }

  /* blazorSuppress */
  /** All child `igc-dropdown-item`s. */
  @queryAssignedElements({
    flatten: true,
    selector: IgcDropdownItemComponent.tagName,
  })
  public items!: Array<IgcDropdownItemComponent>;

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'group',
      },
    });
  }

  protected override render() {
    return html`
      <label part="label">
        <slot name="label"></slot>
      </label>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-group': IgcDropdownGroupComponent;
  }
}
