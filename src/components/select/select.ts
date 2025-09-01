import { html, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  spaceBar,
  tabKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { addRootScrollHandler } from '../common/controllers/root-scroll.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  getActiveItems,
  getItems,
  getNextActiveItem,
  getPreviousActiveItem,
  IgcBaseComboBoxLikeComponent,
  setInitialSelectionState,
} from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { FormValueSelectTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  findElementFromEventPath,
  isString,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import type { PopoverScrollStrategy } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcSelectGroupComponent from './select-group.js';
import IgcSelectHeaderComponent from './select-header.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css.js';
import { styles as shared } from './themes/shared/select.common.css.js';
import { all } from './themes/themes.js';
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
 * @slot suffix - Renders content after input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content inside the suffix container.
 * @slot toggle-icon-expanded - Renders content for the toggle icon when the component is in open state.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart list - The list wrapping container for the items of the igc-select.
 * @csspart input - The encapsulated igc-input of the igc-select.
 * @csspart label - The encapsulated text label of the igc-select.
 * @csspart prefix - The prefix wrapper of the input of the igc-select.
 * @csspart suffix - The suffix wrapper of the input of the igc-select.
 * @csspart toggle-icon - The toggle icon wrapper of the igc-select.
 * @csspart helper-text - The helper text wrapper of the igc-select.
 */
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcSelectComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-select';
  public static styles = [styles, shared];

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

  private readonly _rootScrollController = addRootScrollHandler(this, {
    hideCallback: this._handleClosing,
  });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: undefined,
    transformers: FormValueSelectTransformers,
  });

  @state()
  protected _selectedItem: IgcSelectItemComponent | null = null;

  @state()
  protected _activeItem!: IgcSelectItemComponent;

  @query(IgcInputComponent.tagName, true)
  protected _input!: IgcInputComponent;

  protected get _activeItems(): IgcSelectItemComponent[] {
    return Array.from(
      getActiveItems<IgcSelectItemComponent>(
        this,
        IgcSelectItemComponent.tagName
      )
    );
  }

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail.value", false) */
  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public set value(value: string | undefined) {
    this._updateValue(value);
    const item = this._getItem(this._formValue.value!);
    item ? this._setSelectedItem(item) : this._clearSelectedItem();
  }

  public get value(): string | undefined {
    return this._formValue.value;
  }

  /**
   * The outlined attribute of the control.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The autofocus attribute of the control.
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
   * The label attribute of the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The placeholder attribute of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /** The preferred placement of the select dropdown around its input.
   * @attr
   */
  @property()
  public placement: PopoverPlacement = 'bottom-start';

  /**
   * Determines the behavior of the component during scrolling of the parent container.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: PopoverScrollStrategy = 'scroll';

  /** Returns the items of the igc-select component. */
  public get items(): IgcSelectItemComponent[] {
    return Array.from(
      getItems<IgcSelectItemComponent>(this, IgcSelectItemComponent.tagName)
    );
  }

  /** Returns the groups of the igc-select component. */
  public get groups(): IgcSelectGroupComponent[] {
    return Array.from(
      getItems<IgcSelectGroupComponent>(this, IgcSelectGroupComponent.tagName)
    );
  }

  /** Returns the selected item from the dropdown or null.  */
  public get selectedItem(): IgcSelectItemComponent | null {
    return this._selectedItem;
  }

  //#endregion

  //#region Life-cycle hooks and watchers

  @watch('scrollStrategy', { waitUntilFirstUpdate: true })
  protected _scrollStrategyChange(): void {
    this._rootScrollController.update({ resetListeners: true });
  }

  @watch('open', { waitUntilFirstUpdate: true })
  protected _openChange(): void {
    this._rootClickController.update();
    this._rootScrollController.update();
  }

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set([altKey, arrowDown], this._handleAltArrowDown)
      .set([altKey, arrowUp], this._handleAltArrowUp)
      .set(arrowDown, this._handleArrowDown)
      .set(arrowUp, this._handleArrowUp)
      .set(arrowLeft, this._handleArrowUp)
      .set(arrowRight, this._handleArrowDown)
      .set(tabKey, this._handleTab, { preventDefault: false })
      .set(escapeKey, this._handleEscape)
      .set(homeKey, this._handleHome)
      .set(endKey, this._handleEnd)
      .set(spaceBar, this._handleSpace)
      .set(enterKey, this._handleEnter);

    addSafeEventListener(this, 'keydown', this._handleSearch);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);

    if (this.value && !selected) {
      this._selectItem(this._getItem(this.value), false);
    }

    if (selected && selected.value !== this.value) {
      this.defaultValue = selected.value;
      this._selectItem(selected, false);
    }

    if (this.autofocus) {
      this.focus();
    }

    this._validate();
  }

  //#endregion

  //#region Keyboard event handlers

  private _handleSearch(event: KeyboardEvent): void {
    if (!/^.$/u.test(event.key)) {
      return;
    }

    event.preventDefault();
    const now = Date.now();

    if (now - this._lastKeyTime > 500) {
      this._searchTerm = '';
    }

    this._lastKeyTime = now;
    this._searchTerm += event.key.toLocaleLowerCase();

    const item = this._activeItems.find((item) =>
      item.textContent?.trim().toLocaleLowerCase().startsWith(this._searchTerm)
    );

    if (item) {
      this.open ? this._activateItem(item) : this._selectItem(item);
      this._activeItem.focus();
    }
  }

  private _handleEnter(): void {
    this.open && this._activeItem
      ? this._selectItem(this._activeItem)
      : this.handleAnchorClick();
  }

  private _handleSpace(): void {
    if (!this.open) {
      this.handleAnchorClick();
    }
  }

  private _handleArrowDown(): void {
    const item = getNextActiveItem(this.items, this._activeItem);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  private _handleArrowUp(): void {
    const item = getPreviousActiveItem(this.items, this._activeItem);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  private _handleAltArrowDown(): void {
    if (!this.open) {
      this._show(true);
      this._focusItemOnOpen();
    }
  }

  private async _handleAltArrowUp(): Promise<void> {
    if (this.open && (await this._hide(true))) {
      this._input.focus();
    }
  }

  private async _handleEscape(): Promise<void> {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  private _handleTab(event: KeyboardEvent): void {
    if (this.open) {
      event.preventDefault();
      this._selectItem(this._activeItem ?? this._selectedItem);
      this._hide(true);
    }
  }

  private _handleHome(): void {
    const item = this._activeItems.at(0);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  private _handleEnd(): void {
    const item = this._activeItems.at(-1);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  //#endregion

  //#region Event listeners

  private _handleFocusIn(): void {
    this._setTouchedState();
  }

  private _handleFocusOut({ relatedTarget }: FocusEvent): void {
    if (this.contains(relatedTarget as Node)) {
      return;
    }
    super._handleBlur();
  }

  private _handleClick(event: PointerEvent): void {
    const item = findElementFromEventPath<IgcSelectItemComponent>(
      IgcSelectItemComponent.tagName,
      event
    );
    if (item && this._activeItems.includes(item)) {
      this._selectItem(item);
    }
  }

  private _handleChange(item: IgcSelectItemComponent): boolean {
    this._setTouchedState();
    return this.emitEvent('igcChange', { detail: item });
  }

  private _handleClosing(): void {
    this._hide(true);
  }

  protected override handleAnchorClick(): void {
    super.handleAnchorClick();
    this._focusItemOnOpen();
  }

  //#endregion

  //#region Internal API

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    this._formValue.setValueAndFormState(this._formValue.defaultValue);
    const item = this._getItem(this._formValue.value!);
    item ? this._setSelectedItem(item) : this._clearSelectedItem();
  }

  private _activateItem(item: IgcSelectItemComponent): void {
    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = item;
    this._activeItem.active = true;
  }

  private _setSelectedItem(
    item: IgcSelectItemComponent
  ): IgcSelectItemComponent {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = item;
    this._selectedItem.selected = true;

    return this._selectedItem;
  }

  private _selectItem(
    item?: IgcSelectItemComponent,
    emit = true
  ): IgcSelectItemComponent | null {
    if (!item) {
      this._clearSelectedItem();
      this._updateValue();
      return null;
    }

    const shouldFocus = emit && this.open;
    const shouldHide = emit && !this.keepOpenOnSelect;

    if (this._selectedItem === item) {
      if (shouldFocus) this._input.focus();
      return this._selectedItem;
    }

    const newItem = this._setSelectedItem(item);
    this._activateItem(newItem);
    this._updateValue(newItem.value);

    if (emit) this._handleChange(newItem);
    if (shouldFocus) this._input.focus();
    if (shouldHide) this._hide(true);

    return this._selectedItem;
  }

  private _navigateToActiveItem(item?: IgcSelectItemComponent): void {
    if (item) {
      this._activateItem(item);
      this._activeItem.focus({ preventScroll: true });
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _updateValue(value?: string): void {
    this._formValue.setValueAndFormState(value!);
  }

  private _clearSelectedItem(): void {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
  }

  private async _focusItemOnOpen(): Promise<void> {
    await this.updateComplete;
    (this._selectedItem || this._activeItem)?.focus();
  }

  private _getItem(value: string): IgcSelectItemComponent | undefined {
    return this.items.find((item) => item.value === value);
  }

  //#endregion

  //#region Public API

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions): void {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur(): void {
    this._input.blur();
  }

  /** Checks the validity of the control and moves the focus to it if it is not valid. */
  public override reportValidity(): boolean {
    const valid = super.reportValidity();
    if (!valid) this._input.focus();
    return valid;
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
    const item = isString(value) ? this._getItem(value) : this.items[value];

    if (item) {
      this._navigateToActiveItem(item);
    }

    return item ?? null;
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
    const item = isString(value) ? this._getItem(value) : this.items[value];
    return item ? this._selectItem(item, false) : null;
  }

  /**  Resets the current value and selection of the component. */
  public clearSelection(): void {
    this._updateValue();
    this._clearSelectedItem();
  }

  //#endregion

  protected _renderInputSlots() {
    const prefix = this._slots.hasAssignedElements('prefix') ? 'prefix' : '';
    const suffix = this._slots.hasAssignedElements('suffix') ? 'suffix' : '';

    return html`
      <span slot=${prefix}>
        <slot name="prefix"></slot>
      </span>

      <span slot=${suffix}>
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
        <slot name="toggle-icon" ?hidden=${iconHidden}>
          <igc-icon name=${iconName} collection="default"></igc-icon>
        </slot>
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
    const value = this.selectedItem?.textContent?.trim();

    return html`
      <igc-input
        id="input"
        slot="anchor"
        role="combobox"
        readonly
        aria-controls="dropdown"
        aria-describedby="select-helper-text"
        aria-expanded=${this.open}
        exportparts="container: input, input: native-input, label, prefix, suffix"
        value=${ifDefined(value)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        .disabled=${this.disabled}
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        @click=${this.handleAnchorClick}
      >
        ${this._renderInputSlots()} ${this._renderToggleIcon()}
      </igc-input>

      ${this._renderHelperText()}
    `;
  }

  protected _renderDropdown() {
    return html`
      <div part="base" .inert=${!this.open}>
        <div
          id="dropdown"
          role="listbox"
          part="list"
          aria-labelledby="input"
          @click=${this._handleClick}
        >
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  protected override render() {
    return html`
      <igc-popover
        ?open=${this.open}
        flip
        shift
        same-width
        .offset=${this.distance}
        .placement=${this.placement}
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
