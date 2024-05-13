import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseOptionLikeComponent } from '../common/mixins/option.js';
import { styles } from '../dropdown/themes/dropdown-item.base.css.js';
import { all } from '../dropdown/themes/item.js';
import { styles as shared } from '../dropdown/themes/shared/item/dropdown-item.common.css.js';

/**
 * Represents an item in a select list.
 *
 * @element igc-select-item
 *
 * @slot - Renders the all content bar the prefix and suffix.
 * @slot prefix - Renders content before the main content area.
 * @slot suffix - Renders content after the main content area.
 *
 * @csspart prefix - The prefix wrapper.
 * @csspart content - The main content wrapper.
 * @csspart suffix - The suffix wrapper.
 */
@themes(all)
export default class IgcSelectItemComponent extends IgcBaseOptionLikeComponent {
  public static readonly tagName = 'igc-select-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSelectItemComponent);
  }

  @watch('active')
  protected activeChange() {
    this.tabIndex = this.active ? 0 : -1;

    if (this.active) {
      this.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-item': IgcSelectItemComponent;
  }
}
