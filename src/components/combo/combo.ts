import {
  ComboResourceStringsEN,
  type IComboResourceStrings,
} from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import { registerComponent } from '../common/definitions/register.js';
import { addI18nController } from '../common/i18n/i18n-controller.js';
import { IgcBaseComboBoxComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  asArray,
  bindIf,
  first,
  getElementFromPath,
  isDefined,
  isEmpty,
  stopPropagation,
} from '../common/util.js';
import type { Validator } from '../common/validators.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcComboItemComponent from './combo-item.js';
import IgcComboListComponent from './combo-list.js';
import { DataState } from './controllers/data.js';
import { ComboNavigationController } from './controllers/navigation.js';
import { styles } from './themes/combo.base.css.js';
import { styles as shared } from './themes/shared/combo.common.css.js';
import { all } from './themes/themes.js';
import type {
  ComboItemTemplate,
  ComboRecord,
  ComboRenderFunction,
  ComboValue,
  FilteringOptions,
  GroupingDirection,
  IgcComboChangeEventArgs,
  IgcComboComponentEventMap,
  Item,
  Keys,
  Values,
} from './types.js';
import { comboValidators } from './validators.js';

const SLOTS = setSlots(
  'prefix',
  'suffix',
  'header',
  'footer',
  'empty',
  'helper-text',
  'toggle-icon',
  'clear-icon',
  'value-missing',
  'custom-error',
  'invalid'
);

/* blazorSupportsVisualChildren */
/**
 * The Combo component is similar to the Select component in that it provides a list of options from which the user can make a selection.
 * In contrast to the Select component, the Combo component displays all options in a virtualized list of items,
 * meaning the combo box can simultaneously show thousands of options, where one or more options can be selected.
 * Additionally, users can create custom item templates, allowing for robust data visualization.
 * The Combo component features case-sensitive filtering, grouping, complex data binding, dynamic addition of values and more.
 *
 * @element igc-combo
 *
 * @slot prefix - Renders content before the input of the combo.
 * @slot suffix - Renders content after the input of the combo.
 * @slot header - Renders a container before the list of options of the combo.
 * @slot footer - Renders a container after the list of options of the combo.
 * @slot empty - Renders content when the combo dropdown list has no items/data.
 * @slot helper-text - Renders content below the input of the combo.
 * @slot toggle-icon - Renders content inside the suffix container of the combo.
 * @slot clear-icon - Renders content inside the suffix container of the combo.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the control's selection has changed.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart label - The encapsulated text label of the combo.
 * @csspart input - The main input field of the combo.
 * @csspart native-input - The native input of the main input field of the combo.
 * @csspart prefix - The prefix wrapper of the combo.
 * @csspart suffix - The suffix wrapper of the combo.
 * @csspart toggle-icon - The toggle icon wrapper of the combo.
 * @csspart clear-icon - The clear icon wrapper of the combo.
 * @csspart case-icon - The case icon wrapper of the combo.
 * @csspart helper-text - The helper text wrapper of the combo.
 * @csspart search-input - The search input field of the combo.
 * @csspart list-wrapper - The list of options wrapper of the combo.
 * @csspart list - The list of options box of the combo.
 * @csspart item - Represents each item in the list of options of the combo.
 * @csspart group-header - Represents each header in the list of options of the combo.
 * @csspart active - Appended to the item parts list when the item is active of the combo.
 * @csspart selected - Appended to the item parts list when the item is selected of the combo.
 * @csspart checkbox - Represents each checkbox of each list item of the combo.
 * @csspart checkbox-indicator - Represents the checkbox indicator of each list item of the combo.
 * @csspart checked - Appended to checkbox parts list when checkbox is checked in the combo.
 * @csspart header - The container holding the header content of the combo.
 * @csspart footer - The container holding the footer content of the combo.
 * @csspart empty - The container holding the empty content of the combo.
 */
@blazorAdditionalDependencies('IgcIconComponent, IgcInputComponent')
@blazorIndirectRender
export default class IgcComboComponent<
  T extends object = any,
> extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcComboComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxComponent>
  >(IgcBaseComboBoxComponent)
) {
  public static readonly tagName = 'igc-combo';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcComboComponent,
      IgcIconComponent,
      IgcComboListComponent,
      IgcComboItemComponent,
      IgcComboHeaderComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcValidationContainerComponent
    );
  }

  // #region Internal state and controllers

  protected override get __validators(): Validator<IgcComboComponent<T>>[] {
    return comboValidators;
  }

  private readonly _slots = addSlotController(this, { slots: SLOTS });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  protected readonly _i18nController = addI18nController<IComboResourceStrings>(
    this,
    {
      defaultEN: ComboResourceStringsEN,
    }
  );

  protected override readonly _formValue = createFormValueState<
    ComboValue<T>[]
  >(this, {
    initialValue: [],
    transformers: {
      setValue: asArray,
      setDefaultValue: asArray,
      setFormValue: (value) => {
        if (isEmpty(value) || !this.name) {
          return null;
        }

        if (this.singleSelect) {
          return String(first(value));
        }

        const formData = new FormData();

        for (const item of value) {
          formData.append(this.name, String(item));
        }

        return formData;
      },
    },
  });

  /** The primary input of the combo component. */
  private readonly _inputRef = createRef<IgcInputComponent>();

  /** The search input of the combo component. */
  private readonly _searchRef = createRef<IgcInputComponent>();

  /** The combo virtualized dropdown list. */
  private readonly _listRef = createRef<IgcComboListComponent>();

  private readonly _state = new DataState<T>(this);
  private readonly _navigation = new ComboNavigationController(
    this,
    this._state,
    {
      input: this._inputRef,
      search: this._searchRef,
      list: this._listRef,
      interactions: {
        show: () => this._show(true),
        hide: () => this._hide(true),
        toggleSelection: (index: number) => this._toggleSelection(index),
        select: (index: number) => this._selectByIndex(index),
        clearSelection: () => this._clearSelection(),
      },
    }
  );

  private _data: T[] = [];
  private _valueKey?: Keys<T>;
  private _displayKey?: Keys<T>;
  private _placeholderSearch?: string;
  private _disableFiltering = false;
  private _singleSelect = false;
  private _selected: Set<T> = new Set();
  private _filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
    matchDiacritics: false,
  };

  @state()
  private set _activeIndex(index: number) {
    this._navigation.active = index;
  }

  private get _activeIndex(): number {
    return this._navigation.active;
  }

  @state()
  private set _searchTerm(value: string) {
    this._state.searchTerm = value;
  }

  private get _searchTerm(): string {
    return this._state.searchTerm;
  }

  @state()
  private _activeDescendant?: string;

  @state()
  private _displayValue = '';

  private get _mainAriaLabel(): string {
    return isEmpty(this._selected)
      ? this.resourceStrings.combo_aria_label_no_options!
      : this.resourceStrings.combo_aria_label_options!;
  }

  // #endregion

  //#region Public attributes and properties

  /** The data source used to generate the list of options. */
  /* treatAsRef */
  @property({ attribute: false })
  public set data(value: T[]) {
    if (this._data !== value) {
      this._data = asArray(value);
    }
  }

  public get data(): T[] {
    return this._data;
  }

  /**
   * The outlined attribute of the control.
   * @attr outlined
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * Enables single selection mode and moves item filtering to the main input.
   * @attr single-select
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'single-select' })
  public set singleSelect(value: boolean) {
    this._singleSelect = Boolean(value);
    this._syncSelectionFromValue();

    if (this.hasUpdated) {
      const pristine = this._pristine;
      this._activeIndex = -1;
      this._searchTerm = '';
      this._formValue.setValueAndFormState(this.value);
      this._pristine = pristine;
    }
  }

  public get singleSelect(): boolean {
    return this._singleSelect;
  }

  /**
   * The autofocus attribute of the control.
   * @attr autofocus
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * Focuses the list of options when the menu opens.
   * @attr autofocus-list
   * @default false
   */
  @property({ type: Boolean, attribute: 'autofocus-list' })
  public autofocusList = false;

  /**
   * Gets/Sets the locale used for getting language, affecting resource strings.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
    this._state.updateLocale(value);
  }

  public get locale(): string {
    return this._i18nController.locale;
  }

  /**
   * The label attribute of the control.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The placeholder attribute of the control.
   * @attr placeholder
   */
  @property()
  public placeholder?: string;

  /**
   * The placeholder attribute of the search input.
   * @attr placeholder-search
   */
  @property({ attribute: 'placeholder-search' })
  public set placeholderSearch(value: string | undefined) {
    this._placeholderSearch = value;
  }

  public get placeholderSearch(): string {
    return (
      this._placeholderSearch ??
      this.resourceStrings.combo_filter_search_placeholder ??
      'Search'
    );
  }

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public set resourceStrings(value: IComboResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IComboResourceStrings {
    return this._i18nController.resourceStrings;
  }

  /**
   * The key in the data source used when selecting items.
   * @attr value-key
   */
  @property({ attribute: 'value-key' })
  public set valueKey(value: Keys<T> | undefined) {
    this._valueKey = value;
    this._displayKey = this._displayKey ?? this._valueKey;
  }

  public get valueKey() {
    return this._valueKey;
  }

  /**
   * The key in the data source used to display items in the list.
   * @attr display-key
   */
  @property({ attribute: 'display-key' })
  public set displayKey(value: Keys<T> | undefined) {
    this._displayKey = value;
    if (!this.filteringOptions.filterKey) {
      this.filteringOptions = { filterKey: this.displayKey };
    }
  }

  public get displayKey() {
    return this._displayKey ?? this._valueKey;
  }

  /**
   * The key in the data source used to group items in the list.
   * @attr group-key
   */
  @property({ attribute: 'group-key' })
  public groupKey?: Keys<T> | string;

  /**
   * Sorts the items in each group by ascending or descending order.
   * @attr group-sorting
   * @default "asc"
   * @type {"asc" | "desc" | "none"}
   */
  @property({ attribute: 'group-sorting' })
  public groupSorting: GroupingDirection = 'asc';

  /**
   * An object that configures the filtering of the combo.
   * @attr filtering-options
   * @type {FilteringOptions<T>}
   * @param filterKey - The key in the data source used when filtering the list of options.
   * @param caseSensitive - Determines whether the filtering operation should be case sensitive.
   * @param matchDiacritics -If true, the filter distinguishes between accented letters and their base letters.
   */
  @property({ type: Object, attribute: 'filtering-options' })
  public set filteringOptions(value: Partial<FilteringOptions<T>>) {
    this._filteringOptions = { ...this._filteringOptions, ...value };
  }

  public get filteringOptions(): FilteringOptions<T> {
    return this._filteringOptions;
  }

  /**
   * Enables the case sensitive search icon in the filtering input.
   * @attr case-sensitive-icon
   * @default false
   */
  @property({ type: Boolean, attribute: 'case-sensitive-icon' })
  public caseSensitiveIcon = false;

  /**
   * Disables the filtering of the list of options.
   * @attr disable-filtering
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-filtering' })
  public set disableFiltering(value: boolean) {
    this._disableFiltering = value;
    this._searchTerm = '';
  }

  public get disableFiltering(): boolean {
    return this._disableFiltering;
  }

  /**
   * Hides the clear button.
   * @attr disable-clear
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-clear' })
  public disableClear = false;

  /* blazorSuppress */
  /**
   * The template used for the content of each combo item.
   * @type {ComboItemTemplate<T>}
   */
  @property({ attribute: false })
  public itemTemplate: ComboItemTemplate<T> = ({ item }) =>
    html`${this.displayKey ? item[this.displayKey] : item}`;

  /* blazorSuppress */
  /**
   * The template used for the content of each combo group header.
   * @type {ComboItemTemplate<T>}
   */
  @property({ attribute: false })
  public groupHeaderTemplate: ComboItemTemplate<T> = ({ item }) =>
    html`${this.groupKey && item[this.groupKey as Keys<T>]}`;

  /**
   * Sets the value (selected items). The passed value must be a valid JSON array.
   * If the data source is an array of complex objects, the `valueKey` attribute must be set.
   * Note that when `displayKey` is not explicitly set, it will fall back to the value of `valueKey`.
   *
   * @attr value
   *
   * @example
   * ```tsx
   * <igc-combo
   *  .data=${[
   *    {
   *      id: 'BG01',
   *      name: 'Sofia'
   *    },
   *    {
   *      id: 'BG02',
   *      name: 'Plovdiv'
   *    }
   *  ]}
   *  display-key='name'
   *  value-key='id'
   *  value='["BG01", "BG02"]'>
   *  </igc-combo>
   * ```
   */
  /* blazorPrimitiveValue */
  /* blazorByValueArray */
  /* blazorGenericType */
  /* @tsTwoWayProperty (true, "Change", "Detail.NewValue", false) */
  @property({ type: Array })
  public set value(items: ComboValue<T>[]) {
    this._formValue.setValueAndFormState(items);
    this._syncSelectionFromValue();

    if (this.hasUpdated) {
      this._validate();
    }
  }

  /**
   * Returns the current selection as a list of comma separated values,
   * represented by the value key, when provided.
   */
  public get value(): ComboValue<T>[] {
    return this._formValue.value;
  }

  /**
   * Returns the current selection as an array of objects as provided in the `data` source.
   */
  public get selection(): T[] {
    return Array.from(this._selected);
  }

  //#endregion

  //#region Life-cycle

  constructor() {
    super();

    addThemingController(this, all);
    addSafeEventListener(this, 'blur', this._handleBlur);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
  }

  protected override willUpdate(props: PropertyValues<this>): void {
    if (props.has('open')) {
      this._rootClickController.update();
    }

    if (
      props.has('groupKey') ||
      props.has('groupSorting') ||
      props.has('filteringOptions') ||
      props.has('data')
    ) {
      this._state.invalidate();
    }

    // When data changes, re-sync selection and form
    // This handles the delayed data scenario where value was set before data
    if (props.has('data') && !isEmpty(this.data) && !isEmpty(this.value)) {
      const pristine = this._pristine;
      this._syncSelectionFromValue();
      this._formValue.setValueAndFormState(this.value);
      this._pristine = pristine;
    }
  }

  //#endregion

  // #region Form Associated overrides

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    this._syncSelectionFromValue();
  }

  protected override _setDefaultValue(current: string | null): void {
    try {
      this.defaultValue = JSON.parse(current || '[]');
    } catch {}
  }

  // #endregion

  //#region Overrides for combo box behavior

  protected override async _show(emitEvent = false): Promise<boolean> {
    const [canOpen, _] = await Promise.all([
      super._show(emitEvent),
      this.updateComplete,
    ]);

    if (canOpen) {
      if (!this.singleSelect) {
        this._listRef.value?.focus();
      }

      if (!this.autofocusList) {
        this._searchRef.value?.focus();
      }
    }

    return canOpen;
  }

  protected override async _hide(emitEvent = false): Promise<boolean> {
    const [canClose, _] = await Promise.all([
      super._hide(emitEvent),
      this.updateComplete,
    ]);

    if (canClose) {
      this._activeIndex = -1;
    }

    return canClose;
  }

  //#endregion

  // #region Selection helpers

  /**
   * Resolves user-provided items (value keys or object references)
   * to actual objects from the data source in a single pass.
   */
  private _resolveItems(items: Item<T>[]): T[] {
    if (this.valueKey) {
      const keys = new Set(items as Values<T>[]);
      return this.data.filter((item) => keys.has(item[this.valueKey!]));
    }

    const dataSet = new Set(this.data);
    return (items as T[]).filter((item) => dataSet.has(item));
  }

  /**
   * Gets the value representation of a data record
   * (its value-key property, or the record itself).
   */
  private _resolveItemValue(record: T): Item<T> {
    return this.valueKey ? record[this.valueKey] : record;
  }

  /**
   * Maps data items to their value representations using the given key.
   * When key is undefined, returns the items themselves.
   */
  private _getValues(items: Iterable<T>, key?: Keys<T>): ComboValue<T>[] {
    return Iterator.from(items)
      .map((item) => (key ? item[key] : undefined) ?? item)
      .toArray();
  }

  private _emitSelectionChange(detail: IgcComboChangeEventArgs): boolean {
    return this.emitEvent('igcChange', { cancelable: true, detail });
  }

  private _selectItems(items?: Item<T> | Item<T>[], emit = false): void {
    let collection = asArray(items);

    if (this.singleSelect) {
      this._selected.clear();
      this._searchTerm = '';
    }

    if (isEmpty(collection)) {
      if (!this.singleSelect) {
        this._selected = new Set(this.data);
        this.requestUpdate();
      }
      return;
    }

    if (this.singleSelect) {
      collection = collection.slice(0, 1);
    }

    const resolved = this._resolveItems(collection);

    if (
      emit &&
      !this._emitSelectionChange({
        newValue: this._getValues(
          [...resolved, ...this._selected],
          this.valueKey
        ),
        items: resolved,
        type: 'selection',
      })
    ) {
      return;
    }

    for (const item of resolved) {
      this._selected.add(item);
    }

    this.requestUpdate();
  }

  private _deselectItems(items?: Item<T> | Item<T>[], emit = false): void {
    let collection = asArray(items);

    if (isEmpty(collection)) {
      if (
        emit &&
        !this._emitSelectionChange({
          newValue: [],
          items: Array.from(this._selected),
          type: 'deselection',
        })
      ) {
        return;
      }

      this._selected.clear();
      this.requestUpdate();
      return;
    }

    if (this.singleSelect) {
      collection = collection.slice(0, 1);
    }

    const resolved = this._resolveItems(collection);
    const resolvedSet = new Set(resolved);
    const remaining = Array.from(this._selected).filter(
      (item) => !resolvedSet.has(item)
    );

    if (
      emit &&
      !this._emitSelectionChange({
        newValue: this._getValues(remaining, this.valueKey),
        items: resolved,
        type: 'deselection',
      })
    ) {
      return;
    }

    for (const item of resolved) {
      this._selected.delete(item);
    }

    this.requestUpdate();
  }

  /**
   * Syncs the internal `_selected` set from the current `_formValue`.
   * This is a one-way sync: source of truth (_formValue) → view (_selected).
   */
  private _syncSelectionFromValue(): void {
    this._selected.clear();

    if (!isEmpty(this._formValue.value)) {
      const values = this.singleSelect
        ? asArray(first(this._formValue.value))
        : this._formValue.value;

      if (this.singleSelect && values.length !== this._formValue.value.length) {
        this._formValue.setValueAndFormState(values);
      }

      const items = Iterator.from(values)
        .map((val) => this._findItemByValue(val, this.valueKey))
        .filter(isDefined);

      for (const item of items) {
        this._selected.add(item);
      }
    }

    this._displayValue = this._getValues(this._selected, this.displayKey).join(
      ', '
    );
  }

  /**
   * Finds an item in the data array by its value (or value key).
   * Returns undefined if the item is not found.
   */
  private _findItemByValue(value: ComboValue<T>, key?: Keys<T>): T | undefined {
    return this.data.find((item) => (key ? item[key] : item) === value);
  }

  protected _syncValueFromSelection(initial = false): void {
    const values = this._getValues(this._selected, this.valueKey);
    this._displayValue = this._getValues(this._selected, this.displayKey).join(
      ', '
    );

    this._formValue.setValueAndFormState(values);

    if (!initial) {
      this._validate();
      this._listRef.value?.requestUpdate();
    }
  }

  private _toggleSelection(index: number): void {
    const record = this.data[this._state.dataState[index].dataIndex];

    this._selected.has(record)
      ? this._deselectItems(this._resolveItemValue(record), true)
      : this._selectItems(this._resolveItemValue(record), true);

    this._activeIndex = index;
    this._syncValueFromSelection();
  }

  private _selectByIndex(index: number): void {
    this._selectItems(
      this._resolveItemValue(this.data[this._state.dataState[index].dataIndex]),
      true
    );
    this._activeIndex = index;
    this._syncValueFromSelection();
  }

  private _clearSelection(): void {
    if (this.singleSelect) {
      this._searchTerm = '';
      this._clearSingleSelection();
    } else {
      this._deselectItems([], true);
    }
    this._syncValueFromSelection();
  }

  private _clearSingleSelection(): void {
    const [selection] = this._selected;

    if (selection) {
      this._deselectItems(this._resolveItemValue(selection), true);
      this._formValue.setValueAndFormState([]);
    }
  }

  // #endregion

  //#region Event handlers

  protected async _handleMainInput({
    detail,
  }: CustomEvent<string>): Promise<void> {
    this._setTouchedState();
    this._show(true);
    this._searchTerm = detail;

    // wait for the dataState to update after filtering
    await this.updateComplete;

    this._activeIndex = this._state.dataState.findIndex((i) => !i.header);
    // clear the selection upon typing
    this._clearSingleSelection();
  }

  protected _handleFocusIn(): void {
    this._setTouchedState();
  }

  protected override _handleBlur(): void {
    if (isEmpty(this._selected)) {
      this._searchTerm = '';
    }
    super._handleBlur();
  }

  protected _handleSearchInput({ detail }: CustomEvent<string>): void {
    this._searchTerm = detail;
  }

  private _handleClosing(): void {
    this._hide(true);
  }

  private async _itemClickHandler(event: PointerEvent): Promise<void> {
    const target = getElementFromPath(IgcComboItemComponent.tagName, event);

    if (!target) {
      return;
    }

    this._setTouchedState();
    this._toggleSelection(target.index);

    if (this.singleSelect) {
      this._inputRef.value?.focus();
      await this._hide(true);
    } else {
      this._searchRef.value?.focus();
    }
  }

  private _handleClearIconClick(event: PointerEvent): void {
    event.stopPropagation();
    this._clearSelection();
    this._activeIndex = -1;
  }

  private _handleCaseSensitivity(): void {
    this.filteringOptions = {
      caseSensitive: !this.filteringOptions.caseSensitive,
    };
  }

  //#endregion

  //#region Public methods

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions): void {
    this._inputRef.value?.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur(): void {
    this._inputRef.value?.blur();
  }

  /**
   * Selects option(s) in the list by either reference or valueKey.
   * If not argument is provided all items will be selected.
   * @param { Item<T> | Item<T>[] } items - One or more items to be selected. Multiple items should be passed as an array.
   * When valueKey is specified, the corresponding value should be used in place of the item reference.
   *
   * @example
   * ```typescript
   * const combo<IgcComboComponent<T>> = document.querySelector('igc-combo');
   *
   * // Select one item at a time by reference when valueKey is not specified.
   * combo.select(combo.data[0]);
   *
   * // Select multiple items at a time by reference when valueKey is not specified.
   * combo.select([combo.data[0], combo.data[1]]);
   *
   * // Select one item at a time when valueKey is specified.
   * combo.select('BG01');
   *
   * // Select multiple items at a time when valueKey is specified.
   * combo.select(['BG01', 'BG02']);
   * ```
   */
  public select(items?: Item<T> | Item<T>[]): void {
    this._selectItems(items);
    this._syncValueFromSelection();
  }

  /**
   * Deselects option(s) in the list by either reference or valueKey.
   * If not argument is provided all items will be deselected.
   * @param { Item<T> | Item<T>[] } items - One or more items to be deselected. Multiple items should be passed as an array.
   * When valueKey is specified, the corresponding value should be used in place of the item reference.
   *
   * @example
   * ```typescript
   * const combo<IgcComboComponent<T>> = document.querySelector('igc-combo');
   *
   * // Deselect one item at a time by reference when valueKey is not specified.
   * combo.deselect(combo.data[0]);
   *
   * // Deselect multiple items at a time by reference when valueKey is not specified.
   * combo.deselect([combo.data[0], combo.data[1]]);
   *
   * // Deselect one item at a time when valueKey is specified.
   * combo.deselect('BG01');
   *
   * // Deselect multiple items at a time when valueKey is specified.
   * combo.deselect(['BG01', 'BG02']);
   * ```
   */
  public deselect(items?: Item<T> | Item<T>[]): void {
    this._deselectItems(items);
    this._syncValueFromSelection();
  }

  //#endregion

  protected _itemRenderer: ComboRenderFunction<T> = (
    item: ComboRecord<T>,
    index: number
  ) => {
    if (!item) {
      return nothing as unknown as TemplateResult;
    }

    if (this.groupKey && item.header) {
      return html`
        <igc-combo-header part="group-header">
          ${this.groupHeaderTemplate({ item: item.value })}
        </igc-combo-header>
      `;
    }

    const position = index + 1;
    const id = this.id ? `${this.id}-item-${position}` : `item-${position}`;
    const active = this._activeIndex === index;
    const selected = this._selected.has(this.data[item.dataIndex]);

    if (active) {
      this._activeDescendant = id;
    }

    return html`
      <igc-combo-item
        id=${id}
        part=${partMap({ item: true, selected, active })}
        aria-setsize=${this._state.dataState.length}
        aria-posinset=${position}
        exportparts="checkbox, checkbox-indicator, checked"
        .index=${index}
        ?active=${active}
        ?selected=${selected}
        ?hide-checkbox=${this.singleSelect}
      >
        ${this.itemTemplate({ item: item.value })}
      </igc-combo-item>
    `;
  };

  private _renderToggleIcon() {
    return html`
      <span
        slot="suffix"
        part=${partMap({
          'toggle-icon': true,
          filled: !isEmpty(this.value),
        })}
      >
        <slot name="toggle-icon">
          <igc-icon
            name=${this.open ? 'input_collapse' : 'input_expand'}
            collection="default"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </span>
    `;
  }

  private _renderClearIcon() {
    return html`
      <span
        slot="suffix"
        part="clear-icon"
        @click=${this._handleClearIconClick}
        ?hidden=${this.disableClear || isEmpty(this._selected)}
        aria-label=${ifDefined(
          this.resourceStrings.combo_clearItems_placeholder
        )}
      >
        <slot name="clear-icon">
          <igc-icon
            name="input_clear"
            collection="default"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </span>
    `;
  }

  private _renderMainInput() {
    const hasPrefix = this._slots.hasAssignedElements('prefix');
    const hasSuffix = this._slots.hasAssignedElements('suffix');

    return html`
      <igc-input
        ${ref(this._inputRef)}
        id="target"
        slot="anchor"
        role="combobox"
        aria-controls="dropdown"
        aria-owns="dropdown"
        aria-expanded=${this.open}
        aria-describedby="combo-helper-text"
        aria-disabled=${this.disabled}
        aria-label=${this._mainAriaLabel}
        exportparts="container: input, input: native-input, label, prefix, suffix"
        @click=${this._handleAnchorClick}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        @igcChange=${stopPropagation}
        @igcInput=${this._handleMainInput}
        .value=${this._displayValue}
        .disabled=${this.disabled}
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        .autofocus=${this.autofocus}
        ?readonly=${!this.singleSelect}
      >
        <span slot=${bindIf(hasPrefix, 'prefix')}>
          <slot name="prefix"></slot>
        </span>
        ${this._renderClearIcon()}
        <span slot=${bindIf(hasSuffix, 'suffix')}>
          <slot name="suffix"></slot>
        </span>
        ${this._renderToggleIcon()}
      </igc-input>
    `;
  }

  private _renderSearchInput() {
    return html`
      <div
        part="filter-input"
        ?hidden=${this.disableFiltering || this.singleSelect}
      >
        <igc-input
          ${ref(this._searchRef)}
          .value=${this._searchTerm}
          part="search-input"
          placeholder=${this.placeholderSearch}
          exportparts="input: search-input"
          @igcInput=${this._handleSearchInput}
        >
          <igc-icon
            slot=${bindIf(this.caseSensitiveIcon, 'suffix')}
            name="case_sensitive"
            collection="default"
            part=${partMap({
              'case-icon': true,
              active: this.filteringOptions.caseSensitive,
            })}
            @click=${this._handleCaseSensitivity}
          ></igc-icon>
        </igc-input>
      </div>
    `;
  }

  private _renderEmptyTemplate() {
    return html`
      <div part="empty" ?hidden=${!isEmpty(this._state.dataState)}>
        <slot name="empty">${this.resourceStrings.combo_empty_message}</slot>
      </div>
    `;
  }

  private _renderList() {
    return html`
      <div .inert=${!this.open} part="list-wrapper">
        ${this._renderSearchInput()}
        <div part="header">
          <slot name="header"></slot>
        </div>
        <igc-combo-list
          ${ref(this._listRef)}
          aria-multiselectable=${!this.singleSelect}
          id="dropdown"
          part="list"
          role="listbox"
          tabindex="0"
          aria-labelledby="target"
          aria-activedescendant=${ifDefined(this._activeDescendant)}
          .items=${this._state.dataState}
          .renderItem=${this._itemRenderer}
          ?hidden=${isEmpty(this._state.dataState)}
          @click=${this._itemClickHandler}
        >
        </igc-combo-list>
        ${this._renderEmptyTemplate()}
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  private _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'combo-helper-text',
      hasHelperText: true,
    });
  }

  protected override render() {
    return html`
      <igc-popover ?open=${this.open} flip shift same-width>
        ${this._renderMainInput()} ${this._renderList()}
      </igc-popover>
      ${this._renderHelperText()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
