import { html, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  getItems,
  IgcComboBoxBaseLikeComponent,
} from '#internals/bases/combo-box.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { addListboxPopup } from '#internals/controllers/listbox-popup.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { FormValueSelectTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { isElement, normalizedTextContent } from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  focusLeftHost,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { all } from '#themes/select/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcSelectGroupComponent from './select-group.js';
import IgcSelectHeaderComponent from './select-header.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css.js';
import { styles as shared } from './themes/shared/select.common.css.js';
import { selectValidators } from './validators.js';

export interface IgcSelectComponentEventMap {
  igcChange: CustomEvent<IgcSelectItemComponent>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

const Slots = setSlots(
  'prefix',
  'suffix',
  'header',
  'footer',
  'helper-text',
  'toggle-icon',
  'toggle-icon-expanded',
  'value-missing',
  'custom-error',
  'invalid'
);

/**
 * Represents a control that provides a menu of options.
 *
 * @element igc-select
 *
 * @slot - Renders the list of select items.
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content that replaces the default toggle icon.
 * @slot toggle-icon-expanded - Renders content for the toggle icon when the component is in open state.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the user selects a different item. The detail is the item.
 * @fires igcOpening - Emitted before the user opens the list of options. Cancelable.
 * @fires igcOpened - Emitted after the list of options opens on a user action.
 * @fires igcClosing - Emitted before the user closes the list of options. Cancelable.
 * @fires igcClosed - Emitted after the list of options closes on a user action.
 *
 * @csspart base - The popup container of the list of options.
 * @csspart list - The list wrapping container for the items of the select.
 * @csspart input - The encapsulated input of the select.
 * @csspart native-input - The native input element of the encapsulated input.
 * @csspart label - The encapsulated text label of the select.
 * @csspart prefix - The prefix wrapper of the input of the select.
 * @csspart suffix - The suffix wrapper of the input of the select.
 * @csspart toggle-icon - The toggle icon wrapper of the select.
 * @csspart filled - Added to the toggle-icon part when the select has a value.
 * @csspart helper-text - The helper text wrapper of the select.
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
@shadowOptions({ delegatesFocus: true })
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcSelectComponentEventMap,
    typeof IgcComboBoxBaseLikeComponent
  >(IgcComboBoxBaseLikeComponent)
) {
  public static readonly tagName = 'igc-select';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcSelectComponent,
      IgcIconComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcSelectGroupComponent,
      IgcSelectHeaderComponent,
      IgcSelectItemComponent
    );
  }

  //#region Internal state

  protected override get __validators() {
    return selectValidators;
  }

  private _searchTerm = '';
  private _lastKeyTime = 0;

  private readonly _slots = addSlotController(this, { slots: Slots });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: undefined,
    transformers: FormValueSelectTransformers,
  });

  private readonly _listbox = addListboxPopup<IgcSelectItemComponent>(this, {
    itemTag: IgcSelectItemComponent.tagName,
    popup: () => this._popup,
    anchor: () => this._input,
    focusItems: true,
    closedKeys: true,
    disabled: () => this.disabled,
    show: () => this._handleAnchorClick(),
    hide: () => this._hide(true),
    onCommit: (item, origin) =>
      this._writeFrom(origin, () => this._updateValue(item.value)),
    // An unmatched value is kept, not discarded - its item may still arrive.
    resolveValue: (): IgcSelectItemComponent | undefined =>
      this.value ? this._listbox.resolve(this.value) : undefined,
    onInitialSelected: (item) => {
      // A `selected` item wins over `value` and becomes the reset default.
      // Assign the default while the control is pristine.
      if (item.value !== this.value) {
        this.defaultValue = item.value;
      }
    },
  });

  @query(IgcInputComponent.tagName, true)
  protected _input!: IgcInputComponent;

  @query('#dropdown')
  protected _list!: HTMLDivElement | null;

  @query('[part="base"]', true)
  protected override readonly _popup!: HTMLDivElement | null;

  protected override get _ownedEditors(): (IgcInputComponent | undefined)[] {
    return [this._input];
  }

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail.value", false) */
  /**
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string | undefined) {
    this._updateValue(value);
    this._listbox.setSelected(
      this._listbox.resolve(this._formValue.value!) ?? null
    );
  }

  public get value(): string | undefined {
    return this._formValue.value;
  }

  /* blazorCSSuppress */
  /**
   * The default value of the control. A form reset restores the value to it.
   * While the value is unchanged since the start or the last form reset, a
   * new default also sets the value. The `value` attribute also sets it.
   */
  public override set defaultValue(value: string | undefined) {
    super.defaultValue = value;
  }

  public override get defaultValue(): string | undefined {
    return this._formValue.defaultValue;
  }

  /**
   * Whether the control has an outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * Whether the control takes the focus after its first render.
   * @attr
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * The distance of the select dropdown from its input.
   * @attr
   */
  @property({ type: Number })
  public distance = 0;

  /**
   * The label of the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /** The preferred placement of the select dropdown around its input.
   * @attr
   */
  @property()
  public placement: PopoverPlacement = 'bottom-start';

  /** Returns the items of the select component. */
  public get items(): IgcSelectItemComponent[] {
    return this._listbox.items;
  }

  /** Returns the groups of the select component. */
  public get groups(): IgcSelectGroupComponent[] {
    return getItems<IgcSelectGroupComponent>(
      this,
      IgcSelectGroupComponent.tagName
    );
  }

  /** Returns the selected item from the dropdown or null.  */
  public get selectedItem(): IgcSelectItemComponent | null {
    return this._listbox.selected;
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    addThemingController(this, all);

    // Projects the name and the combobox semantics of the host onto the native
    // input in `igc-input`. See ProjectedARIA.
    addAriaProjector(this, {
      target: () => this._input,
      state: () => ({
        role: 'combobox',
        hasPopup: 'listbox',
        expanded: `${this.open}`,
        controls: this._list ? [this._list] : null,
      }),
    });

    this._listbox.keys
      .set([altKey, arrowDown], this._handleAltArrowDown)
      .set([altKey, arrowUp], this._listbox.close)
      .set(spaceBar, this._handleSpace);

    addSafeEventListener(this, 'keydown', this._handleSearch);
    addSafeEventListener(this, 'focusin', this._setTouchedState);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;

    if (this.autofocus) {
      this.focus();
    }

    this._validate();
  }

  protected override _returnFocus(): void {
    this._input.focus({ preventScroll: true });
  }

  //#endregion

  //#region Keyboard event handlers

  private _handleSearch(event: KeyboardEvent): void {
    // A printable key held with a modifier is a shortcut, not type-ahead.
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (!/^.$/u.test(event.key) || this._listbox.isContentEvent(event)) {
      return;
    }

    event.preventDefault();
    const now = Date.now();

    if (now - this._lastKeyTime > 500) {
      this._searchTerm = '';
    }

    this._lastKeyTime = now;
    this._searchTerm += event.key.toLocaleLowerCase();

    const item = this._listbox.activeItems.find((item) =>
      item.textContent?.trim().toLocaleLowerCase().startsWith(this._searchTerm)
    );

    this._listbox.moveTo(item);
  }

  private _handleSpace(): void {
    if (!this.open) {
      this._handleAnchorClick();
    }
  }

  private _handleAltArrowDown(): void {
    if (!this.open) {
      this._show(true);
      this._focusItemOnOpen();
    }
  }

  //#endregion

  //#region Event listeners

  private _handleFocusOut(event: FocusEvent): void {
    if (focusLeftHost(this, event)) {
      super._handleBlur();
    }
  }

  protected override _handleAnchorClick(): void {
    super._handleAnchorClick();
    this._focusItemOnOpen();
  }

  //#endregion

  //#region Internal API

  private _updateValue(value?: string): void {
    this._formValue.setValueAndFormState(value!);
    // The form value state, not a reactive property, holds the value.
    this.requestUpdate();
  }

  private async _focusItemOnOpen(): Promise<void> {
    await this.updateComplete;

    // On open, navigation starts again from the selection.
    if (this.open) {
      this._listbox.navigate(this._listbox.selected ?? this._listbox.active);
    }
  }

  /**
   * The text of the selected item for the input, without its slotted prefix and
   * suffix and without template marker comments.
   */
  private get _displayValue(): string | undefined {
    const selected = this._listbox.selected;

    if (!selected) {
      return undefined;
    }

    return normalizedTextContent(
      Array.from(selected.childNodes).filter((node) =>
        isElement(node)
          ? !node.hasAttribute('slot')
          : node.nodeType === Node.TEXT_NODE
      )
    );
  }

  //#endregion

  //#region Public API

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur(): void {
    cancelDeferredFocus(this);
    this._input?.blur();
  }

  /* blazorSuppress */
  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string | number): IgcSelectItemComponent | null {
    return this._listbox.navigateTo(value);
  }

  /* blazorSuppress */
  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  public select(value: string | number): IgcSelectItemComponent | null {
    return this._listbox.select(value);
  }

  /**  Resets the current value and selection of the component. */
  public clearSelection(): void {
    this._updateValue();
    this._listbox.clear();
  }

  //#endregion

  protected _renderInputSlots() {
    return html`
      <span slot=${bindIf(this._slots.hasAssignedElements('prefix'), 'prefix')}>
        <slot name="prefix"></slot>
      </span>

      <span slot=${bindIf(this._slots.hasAssignedElements('suffix'), 'suffix')}>
        <slot name="suffix"></slot>
      </span>
    `;
  }

  protected _renderToggleIcon() {
    const parts = { 'toggle-icon': true, filled: !!this.value };
    const iconName = this.open ? 'input_collapse' : 'input_expand';
    const iconHidden =
      this.open && this._slots.hasAssignedElements('toggle-icon-expanded');

    return html`
      <span slot="suffix" part=${partMap(parts)} aria-hidden="true">
        ${renderSlottedIcon({
          slot: 'toggle-icon',
          icon: iconName,
          hidden: iconHidden,
          ariaHidden: false,
        })}
        <slot name="toggle-icon-expanded" ?hidden=${!iconHidden}></slot>
      </span>
    `;
  }

  protected _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'select-helper-text',
      slot: 'anchor',
      hasHelperText: true,
    });
  }

  protected _renderInputAnchor() {
    return html`
      <igc-input
        id="input"
        slot="anchor"
        readonly
        exportparts="container: input, input: native-input, label, prefix, suffix"
        value=${ifDefined(this._displayValue)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        .disabled=${this.disabled}
        .required=${this.required}
        .outlined=${this.outlined}
        @click=${this._handleAnchorClick}
      >
        ${this._renderInputSlots()} ${this._renderToggleIcon()}
      </igc-input>

      ${this._renderHelperText()}
    `;
  }

  protected _renderDropdown() {
    return html`
      <div part="base" .inert=${!this.open}>
        <slot name="header"></slot>
        <div
          id="dropdown"
          role="listbox"
          part="list"
          aria-labelledby="input"
          @click=${this._listbox.handleClick}
        >
          <slot></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }

  protected override render() {
    return html`
      <igc-popover
        ?open=${this.open}
        flip
        same-width
        .offset=${this.distance}
        .placement=${this.placement}
        .scrollStrategy=${this.scrollStrategy}
        @igcPopoverScrollClose=${this._handleClosing}
      >
        ${this._renderInputAnchor()} ${this._renderDropdown()}
      </igc-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}
