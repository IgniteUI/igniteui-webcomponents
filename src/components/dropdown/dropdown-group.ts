import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcDropdownItemComponent from './dropdown-item.js';
import { styles } from './themes/dropdown-group.base.css.js';
import { all } from './themes/group.js';
import { styles as shared } from './themes/shared/group/dropdown-group.common.css.js';

const Slots = setSlots('label');

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
export default class IgcDropdownGroupComponent extends LitElement {
  public static readonly tagName = 'igc-dropdown-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDropdownGroupComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'group',
    },
  });

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    initial: true,
    onChange: this._labelChange,
  });

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

  /**
   * The label is rendered into this shadow root, out of reach of an
   * `aria-labelledby` on the host, so its text names the `group` directly.
   */
  private _labelChange(): void {
    const label = this._slots.getAssignedText('label', true);
    this._internals.setARIA({ ariaLabel: label || null });
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
