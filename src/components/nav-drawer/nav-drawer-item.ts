import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { styles } from './themes/item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item/item.common.css.js';

/**
 * Represents a navigation drawer item.
 *
 * @element igc-nav-drawer-item
 *
 * @slot content - The content slot for the drawer item.
 * @slot icon - The slot for the icon of the drawer item.
 *
 * @csspart base - The base wrapper of the drawer item.
 * @csspart icon - The icon container.
 * @csspart content - The content container.
 */
export default class IgcNavDrawerItemComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcNavDrawerItemComponent);
  }

  private readonly _slots = addSlotController(this, {
    slots: setSlots('content', 'icon'),
    onChange: this._handleSlotChange,
  });

  @state()
  private _hasContent = true;

  /**
   * Determines whether the drawer is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Determines whether the drawer is active.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected _handleSlotChange(): void {
    this._hasContent = this._slots.hasAssignedElements('content');
  }

  protected override render() {
    const hasNoIcon = !this._slots.hasAssignedNodes('icon', true);

    return html`
      <div part=${partMap({ base: true, mini: !this._hasContent })}>
        <span part="icon" ?hidden=${hasNoIcon}>
          <slot name="icon"></slot>
        </span>
        <span part="content">
          <slot name="content"></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer-item': IgcNavDrawerItemComponent;
  }
}
