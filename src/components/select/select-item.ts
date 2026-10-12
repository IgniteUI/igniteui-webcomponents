import { property } from 'lit/decorators.js';
import { IgcBaseOptionLikeComponent } from '#internals/bases/option.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/dropdown/themes/item.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from '../dropdown/themes/dropdown-item.base.css.js';
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
 * @csspart prefix - The prefix wrapper of the select item.
 * @csspart content - The main content wrapper of the select item.
 * @csspart suffix - The suffix wrapper of the select item.
 */
export default class IgcSelectItemComponent extends IgcBaseOptionLikeComponent {
  public static readonly tagName = 'igc-select-item';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectItemComponent);
  }

  /**
   * Whether the item is active.
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
