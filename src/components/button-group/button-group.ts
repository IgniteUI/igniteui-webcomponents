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
import {
  addContextProvider,
  type ContextProviderController,
} from '#internals/controllers/context-provider.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { asArray, firstOf, isEmpty, lastOf } from '#internals/utils/arrays.js';
import { getRoot } from '#internals/utils/dom.js';
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

  /**
   * The values set through `selectedItems` before there were buttons to apply
   * them to. Read one time when the buttons render, after which the buttons own
   * the state.
   */
  private _selectedItems = new Set<string>();

  private readonly _provider: ContextProviderController<
    typeof buttonGroupContext,
    this
  >;

  /** The button reachable by Tab while the group runs a roving tab index. */
  private _tabStop?: IgcToggleButtonComponent;

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._handleSlotChange,
  });

  /** The toggle buttons of the group, in DOM order. */
  private get _buttons(): IgcToggleButtonComponent[] {
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

  /** The buttons that can take focus. A disabled button is skipped over. */
  private get _enabledButtons(): IgcToggleButtonComponent[] {
    return this._buttons.filter((button) => !button.disabled);
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

    addInternalsController(this, {
      initialARIA: { role: 'radiogroup' },
      reflectRole: true,
      aria: () => ({
        role: this._isMultiple ? 'group' : 'radiogroup',
        ariaDisabled: `${this.disabled}`,
        ariaOrientation: this._isMultiple ? null : this.alignment,
      }),
    });

    const context: ButtonGroupContext = {
      instance: this,
      syncState: (button) => this._syncState(button),
      isTabStop: (button) => this._isTabStop(button),
    };

    this._provider = addContextProvider(this, {
      context: buttonGroupContext,
      watch: ['selection', 'disabled'],
      value: () => context,
    });

    // The single selection modes give radio semantics: one tab stop, and arrow
    // navigation that takes the selection with it. The multiple mode is a group
    // of toggle buttons, and each button is its own tab stop.
    addRovingFocusController<IgcToggleButtonComponent>(this, {
      keybindings: {
        skip: () => this.disabled || this._isMultiple,
        bindingDefaults: { preventDefault: true, repeat: true },
      },
      horizontal: () => this.alignment === 'horizontal',
      vertical: () => this.alignment === 'vertical',
      homeEnd: false,
      items: () => this._enabledButtons,
      current: () => this._getFocusedButton(),
      focusItem: (button) => this._navigate(button),
    });
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (this.hasUpdated && changedProperties.has('selection')) {
      // The selection modes are not interchangeable - the group starts over.
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

    this._updateTabStop();
  }

  //#endregion

  //#region Private API

  /** Applies `next` as the selection, clearing the state of every other button. */
  private _applySelection(next: IgcToggleButtonComponent[]): void {
    const selection = new Set(next);

    for (const button of this._buttons) {
      button.selected = selection.has(button);
    }

    this._updateTabStop();
  }

  /**
   * Finds the tab stop of the group: the selected button, or the first enabled
   * one if there is no selection, which keeps the group reachable.
   *
   * @remarks
   * The buttons apply the tab stop themselves and read it through the context,
   * so a tab stop that moves while no button updates must publish again. That
   * renders every button, so publish only on a real move.
   */
  private _updateTabStop(): void {
    const enabled = this._enabledButtons;
    const next = enabled.find((button) => button.selected) ?? firstOf(enabled);

    if (next !== this._tabStop) {
      this._tabStop = next;
      this._provider.publish();
    }
  }

  /**
   * Each button is its own tab stop outside the single selection modes, as is a
   * button that left the group. A removed button keeps its context, and a
   * former group must not hold it out of the tab order.
   */
  private _isTabStop(button: IgcToggleButtonComponent): boolean {
    return (
      this._isMultiple ||
      button === this._tabStop ||
      !this._buttons.includes(button)
    );
  }

  /** The button holding focus, when it is one of the group. */
  private _getFocusedButton(): IgcToggleButtonComponent | null {
    const button = getRoot(this).activeElement?.closest(
      IgcToggleButtonComponent.tagName
    );

    return button && this._buttons.includes(button) ? button : null;
  }

  /**
   * Moves focus to `button` and takes the selection with it, as a radio group
   * does. The selection moves and never turns off.
   */
  private _navigate(button: IgcToggleButtonComponent): void {
    button.focus();

    if (!button.selected) {
      this._handleSingleSelection(button);
      this._updateTabStop();
    }
  }

  /** Selects the buttons matching `values`, honoring the selection mode. */
  private _selectFromValues(values: Set<string>): void {
    const matches = this._buttons.filter((button) => values.has(button.value));
    this._applySelection(this._isMultiple ? matches : matches.slice(0, 1));
  }

  /**
   * Reduces a selection made outside the group, through the children or through
   * added buttons with their own state, to one button. The last button wins.
   */
  private _enforceSingleSelection(): void {
    const selected = this._selectedButtons;

    if (!this._isMultiple && selected.length > 1) {
      this._applySelection([lastOf(selected)]);
    }
  }

  /** Reconciles the group with the buttons added to or removed from its slot. */
  private _handleSlotChange(): void {
    this._enforceSingleSelection();
    this._updateTabStop();
  }

  /** Reconciles the group with a button of its own that changed state. */
  private _syncState(button: IgcToggleButtonComponent): void {
    if (
      button.selected &&
      !this._isMultiple &&
      this._buttons.includes(button)
    ) {
      // `_applySelection` resolves the tab stop on its own.
      this._applySelection([button]);
    } else {
      this._updateTabStop();
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
      ? this._setSelected(button, !button.selected)
      : this._handleSingleSelection(button);

    // Resolved once the interaction is over - a single selection moves through an
    // intermediate state whose tab stop is never the one it settles on.
    this._updateTabStop();
  }

  private _handleSingleSelection(button: IgcToggleButtonComponent): void {
    const selected = firstOf(this._selectedButtons);

    if (selected === button) {
      // A required selection cannot be toggled off.
      if (this.selection !== 'single-required') {
        this._setSelected(button, false);
      }
      return;
    }

    if (selected) {
      this._setSelected(selected, false);
    }

    this._setSelected(button, true);
  }

  /** Applies a selection made through user interaction, announcing it. */
  private _setSelected(
    button: IgcToggleButtonComponent,
    selected: boolean
  ): void {
    button.selected = selected;
    this.emitEvent(selected ? 'igcSelect' : 'igcDeselect', {
      detail: button.value,
    });
  }

  //#endregion

  //#region Render

  protected override render(): TemplateResult {
    return html`
      <div part="group" @click=${this._handleClick}>
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
