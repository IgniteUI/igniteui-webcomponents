import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseOptionLikeComponent } from '../common/mixins/option.js';
import { styles } from './themes/dropdown-item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item/dropdown-item.common.css.js';

/**
 * Represents an item in a dropdown list.
 *
 * @element igc-dropdown-item
 *
 * @slot prefix - Renders content before the item's main content.
 * @slot - Renders the item's main content.
 * @slot suffix - Renders content after the item's main content.
 *
 * @csspart prefix - The prefix wrapper of the igc-dropdown-item.
 * @csspart content - The main content wrapper of the igc-dropdown-item.
 * @csspart suffix - The suffix wrapper of the igc-dropdown-item.
 */
export default class IgcDropdownItemComponent extends IgcBaseOptionLikeComponent {
  public static readonly tagName = 'igc-dropdown-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDropdownItemComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-item': IgcDropdownItemComponent;
  }
}
