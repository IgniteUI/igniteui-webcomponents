import { queryAssignedElements } from 'lit/decorators.js';
import { registerComponent } from '#internals/definitions/register.js';
import { IgcGroupBaseComponent } from '#internals/mixins/group.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcDropdownItemComponent from './dropdown-item.js';
import { styles } from './themes/dropdown-group.base.css.js';
import { all } from './themes/group.js';
import { styles as shared } from './themes/shared/group/dropdown-group.common.css.js';

/**
 * A container for a group of dropdown items.
 *
 * @element igc-dropdown-group
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
export default class IgcDropdownGroupComponent extends IgcGroupBaseComponent {
  public static readonly tagName = 'igc-dropdown-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDropdownGroupComponent);
  }

  /* blazorSuppress */
  /** All child dropdown items. */
  @queryAssignedElements({
    flatten: true,
    selector: IgcDropdownItemComponent.tagName,
  })
  public items!: Array<IgcDropdownItemComponent>;

  constructor() {
    super();

    addThemingController(this, all);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-group': IgcDropdownGroupComponent;
  }
}
