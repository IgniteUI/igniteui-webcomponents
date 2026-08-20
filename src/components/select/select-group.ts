import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { watch } from '#internals/decorators/watch.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from '../dropdown/themes/dropdown-group.base.css.js';
import { all } from '../dropdown/themes/group.js';
import { styles as shared } from '../dropdown/themes/shared/group/dropdown-group.common.css.js';
import IgcSelectItemComponent from './select-item.js';

const Slots = setSlots('label');

/**
 * A container for a group of select items.
 * @element igc-select-group
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
export default class IgcSelectGroupComponent extends LitElement {
  public static readonly tagName = 'igc-select-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectGroupComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'group',
    },
    aria: () => ({ ariaDisabled: `${this.disabled}` }),
  });

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    initial: true,
    onChange: this._labelChange,
  });

  private controlledItems!: Array<IgcSelectItemComponent>;

  /** All child select items. */
  @queryAssignedElements({
    flatten: true,
    selector: IgcSelectItemComponent.tagName,
  })
  public items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({
    flatten: true,
    selector: `${IgcSelectItemComponent.tagName}:not([disabled])`,
  })
  protected activeItems!: Array<IgcSelectItemComponent>;

  private _observerCallback({
    changes: { attributes },
  }: MutationControllerParams<IgcSelectItemComponent>) {
    for (const { node: item } of attributes) {
      if (!this.disabled) {
        this.controlledItems = this.activeItems;
      }

      if (this.disabled && !item.disabled) {
        item.disabled = true;
      }
    }
  }

  /**
   * Whether the group item and all its children are disabled.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  constructor() {
    super();

    addThemingController(this, all);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcSelectItemComponent.tagName],
      config: {
        attributeFilter: ['disabled'],
        subtree: true,
      },
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.controlledItems = this.activeItems;

    this.disabledChange();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected disabledChange() {
    for (const item of this.controlledItems) {
      item.disabled = this.disabled;
    }
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
    'igc-select-group': IgcSelectGroupComponent;
  }
}
