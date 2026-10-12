import { html, LitElement } from 'lit';
import {
  type ARIAState,
  addInternalsController,
} from '../controllers/internals.js';
import { addSlotController, setSlots } from '../controllers/slot.js';

const Slots = setSlots('label');

/** The ARIA state of a group that adds nothing to its role. */
const NO_ARIA: ARIAState = {};

/* omitModule */
/**
 * The shared base of `igc-dropdown-group` and `igc-select-group`: a labelled
 * `group` container for a list of items.
 */
export abstract class IgcGroupBaseComponent extends LitElement {
  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'group',
    },
    aria: () => this._resolveARIA(),
  });

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    initial: true,
    onChange: this._labelChange,
  });

  /** The ARIA state of the host, in addition to its role. Empty by default. */
  protected _resolveARIA(): ARIAState {
    return NO_ARIA;
  }

  /**
   * The label renders in this shadow root, out of reach of an
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
