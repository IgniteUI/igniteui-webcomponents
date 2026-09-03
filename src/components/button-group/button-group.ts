import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import {
  type ButtonGroupContext,
  buttonGroupContext,
} from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { asArray, isEmpty, lastOf } from '#internals/utils/arrays.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { isDefined } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { ButtonGroupSelection, ContentOrientation } from '../types.js';
import { styles } from './themes/group.base.css.js';
import { all } from './themes/group.js';
import { styles as shared } from './themes/shared/group/group.common.css.js';
import IgcToggleButtonComponent from './toggle-button.js';

export interface IgcButtonGroupComponentEventMap {
  igcSelect: CustomEvent<string | undefined>;
  igcDeselect: CustomEvent<string | undefined>;
}

/* blazorAdditionalDependency: IgcToggleButtonComponent */
/**
 * Groups a series of toggle buttons together, exposing features such as layout and selection.
 *
 * @element igc-button-group
 *
 * @slot - Renders the toggle buttons of the group.
 *
 * @fires igcSelect - Emitted when a button is selected through user interaction.
 * @fires igcDeselect - Emitted when a button is deselected through user interaction.
 *
 * @csspart group - The button group container.
 */
export default class IgcButtonGroupComponent extends EventEmitterMixin<
  IgcButtonGroupComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-button-group';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcButtonGroupComponent, IgcToggleButtonComponent);
  }

  //#region Internal state & properties

  /** The values set through the `selectedItems` API, applied once the buttons are rendered. */
  private _selectedItems = new Set<string>();

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._enforceSingleSelection,
  });

  /**
   * The toggle buttons of the group, in DOM order. There are none to report
   * before the first render, when the slot they are assigned to does not exist yet.
   */
  private get _buttons(): IgcToggleButtonComponent[] {
    if (!this.hasUpdated) {
      return [];
    }

    return this._slots.getAssignedElements('[default]', {
      selector: IgcToggleButtonComponent.tagName,
    });
  }

  private get _isMultiple(): boolean {
    return this.selection === 'multiple';
  }

  private get _selectedButtons(): IgcToggleButtonComponent[] {
    return this._buttons.filter((button) => button.selected);
  }

  //#endregion

  //#region Public properties

  /**
   * Disables all buttons inside the group.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * The orientation of the buttons in the group.
   *
   * @attr alignment
   * @default 'horizontal'
   */
  @property({ reflect: true })
  public alignment: ContentOrientation = 'horizontal';

  /**
   * Controls the mode of selection for the button group.
   *
   * @attr selection
   * @default 'single'
   */
  @property({ reflect: false })
  public selection: ButtonGroupSelection = 'single';

  /**
   * Gets/Sets the currently selected buttons (their values).
   * @attr
   */
  @property({ attribute: 'selected-items', type: Array, reflect: false })
  public get selectedItems(): string[] {
    // Buttons are not required to have a value, in which case they report none.
    return this._selectedButtons
      .map((button) => button.value)
      .filter(isDefined);
  }

  public set selectedItems(values: string[]) {
    this._selectedItems = new Set(asArray(values));
    this._selectFromValues(this._selectedItems);
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();
    addThemingController(this, all);

    const context: ButtonGroupContext = {
      instance: this,
      syncSelection: (button) => this._syncSelection(button),
    };

    addContextProvider(this, {
      context: buttonGroupContext,
      watch: ['selection', 'disabled'],
      value: () => context,
    });
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (this.hasUpdated && changedProperties.has('selection')) {
      // The selection modes are not interchangeable - the group starts over.
      this._selectedItems.clear();
      this._applySelection([]);
    }
  }

  protected override firstUpdated(): void {
    if (isEmpty(this._selectedButtons)) {
      // Nothing is selected through the children, fall back to the values passed in.
      this._selectFromValues(this._selectedItems);
    } else {
      // A selection through the children takes priority over the passed in values.
      this._enforceSingleSelection();
    }
  }

  //#endregion

  //#region Private API

  /** Applies `next` as the selection, clearing the state of every other button. */
  private _applySelection(next: IgcToggleButtonComponent[]): void {
    const selection = new Set(next);

    for (const button of this._buttons) {
      button.selected = selection.has(button);
    }
  }

  /** Selects the buttons matching `values`, honoring the selection mode. */
  private _selectFromValues(values: Set<string>): void {
    const matches = this._buttons.filter((button) => values.has(button.value));
    this._applySelection(this._isMultiple ? matches : matches.slice(0, 1));
  }

  /**
   * Reduces a selection made outside of the group - through the children or by
   * adding buttons that bring their own state - to a single button. The last one wins.
   */
  private _enforceSingleSelection(): void {
    const selected = this._selectedButtons;

    if (!this._isMultiple && selected.length > 1) {
      this._applySelection([lastOf(selected)]);
    }
  }

  /** Reconciles the group with a button of its own that has turned selected. */
  private _syncSelection(button: IgcToggleButtonComponent): void {
    if (!this._isMultiple && this._buttons.includes(button)) {
      this._applySelection([button]);
    }
  }

  //#endregion

  //#region Event handlers

  private _handleClick(event: PointerEvent): void {
    if (this.disabled) {
      return;
    }

    const button = getElementFromPath(IgcToggleButtonComponent.tagName, event);

    if (!button || !this._buttons.includes(button)) {
      return;
    }

    this._isMultiple
      ? this._handleMultipleSelection(button)
      : this._handleSingleSelection(button);
  }

  private _handleSingleSelection(button: IgcToggleButtonComponent): void {
    const selected = this._selectedButtons.at(0);

    if (selected === button) {
      // A required selection cannot be toggled off.
      if (this.selection !== 'single-required') {
        this._emitDeselectEvent(button);
      }
      return;
    }

    if (selected) {
      this._emitDeselectEvent(selected);
    }

    this._emitSelectEvent(button);
  }

  private _handleMultipleSelection(button: IgcToggleButtonComponent): void {
    button.selected
      ? this._emitDeselectEvent(button)
      : this._emitSelectEvent(button);
  }

  private _emitSelectEvent(button: IgcToggleButtonComponent): void {
    button.selected = true;
    this.emitEvent('igcSelect', { detail: button.value });
  }

  private _emitDeselectEvent(button: IgcToggleButtonComponent): void {
    button.selected = false;
    this.emitEvent('igcDeselect', { detail: button.value });
  }

  //#endregion

  //#region Render

  protected override render(): TemplateResult {
    return html`
      <div
        part="group"
        role=${this._isMultiple ? 'group' : 'radiogroup'}
        aria-disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </div>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-button-group': IgcButtonGroupComponent;
  }
}
