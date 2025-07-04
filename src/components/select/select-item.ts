import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
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
 * @csspart prefix - The prefix wrapper of the igc-select-item.
 * @csspart content - The main content wrapper of the igc-select-item.
 * @csspart suffix - The suffix wrapper of the igc-select-item.
 */
export default class IgcSelectItemComponent extends IgcBaseOptionLikeComponent {
  public static readonly tagName = 'igc-select-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectItemComponent);
  }

  /**
   * Whether the item is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public override set active(value: boolean) {
    this._active = Boolean(value);
    this.tabIndex = this._active ? 0 : -1;
  }

  public override get active(): boolean {
    return this._active;
  }

  constructor() {
    super();
    addThemingController(this, all);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-item': IgcSelectItemComponent;
  }
}
