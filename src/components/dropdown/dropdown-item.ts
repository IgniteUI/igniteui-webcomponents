import { IgcBaseOptionLikeComponent } from '#internals/bases/option.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/dropdown/themes/item.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './themes/dropdown-item.base.css.js';
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
 * @csspart prefix - The prefix wrapper of the dropdown item.
 * @csspart content - The main content wrapper of the dropdown item.
 * @csspart suffix - The suffix wrapper of the dropdown item.
 */
export default class IgcDropdownItemComponent extends IgcBaseOptionLikeComponent {
  public static readonly tagName = 'igc-dropdown-item';
  public static override styles = [componentBase, styles, shared];

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
