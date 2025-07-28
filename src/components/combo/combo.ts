import { html, LitElement, nothing, type TemplateResult } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  createFormValueState,
  type FormValueOf,
} from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  asArray,
  equal,
  findElementFromEventPath,
  first,
  isEmpty,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcComboItemComponent from './combo-item.js';
import IgcComboListComponent from './combo-list.js';
import { DataController } from './controllers/data.js';
import { NavigationController } from './controllers/navigation.js';
import { SelectionController } from './controllers/selection.js';
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
  IgcComboComponentEventMap,
  Item,
  Keys,
} from './types.js';
import { comboValidators } from './validators.js';

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
  EventEmitterMixin<IgcComboComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-combo';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
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

  protected override get __validators() {
    return comboValidators;
  }

  private readonly _rootClickController = addRootClickController(this, {
    onHide: async () => {
      if (!this.handleClosing()) {
        return;
      }
      this.open = false;

      await this.updateComplete;
      this.emitEvent('igcClosed');
    },
  });

  protected override readonly _formValue: FormValueOf<ComboValue<T>[]> =
    createFormValueState<ComboValue<T>[]>(this, {
      initialValue: [],
      transformers: {
        setValue: asArray,
        setDefaultValue: asArray,
      },
    });
  private _data: T[] = [];

  private _valueKey?: Keys<T>;
  private _displayKey?: Keys<T>;
  private _groupKey?: Keys<T>;

  private _disableFiltering = false;
  private _singleSelect = false;

  private _groupSorting: GroupingDirection = 'asc';
  private _filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
    matchDiacritics: false,
  };

  @state()
  private _activeDescendant!: string;

  @state()
  private _displayValue = '';

  protected _state = new DataController<T>(this);
  protected _selection = new SelectionController<T>(this, this._state);
  protected _navigation = new NavigationController<T>(this, this._state);

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: HTMLElement[];

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: HTMLElement[];

  @query('[part="search-input"]')
  protected _searchInput!: IgcInputComponent;

  @query('#target', true)
  private _input!: IgcInputComponent;

  @query(IgcComboListComponent.tagName, true)
  private _list!: IgcComboListComponent;

  /** The data source used to generate the list of options. */
  /* treatAsRef */
  @property({ attribute: false })
  public set data(value: T[]) {
    if (this._data === value) {
      return;
    }
    this._data = asArray(value);
    const pristine = this._pristine;
    this.value = asArray(this.value);
    this._pristine = pristine;
    this._state.runPipeline();
  }

  public get data() {
    return this._data;
  }

  /**
   * The outlined attribute of the control.
   * @attr outlined
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
    if (this._singleSelect === Boolean(value)) {
      return;
    }

    this._singleSelect = Boolean(value);
    this._selection.clear();
    if (this.hasUpdated) {
      this.updateValue();
      this.resetSearchTerm();
      this._navigation.active = -1;
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
   */
  @property({ type: Boolean, attribute: 'autofocus-list' })
  public autofocusList = false;

  /**
   * The label attribute of the control.
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * The placeholder attribute of the control.
   * @attr placeholder
   */
  @property()
  public placeholder!: string;

  /**
   * The placeholder attribute of the search input.
   * @attr placeholder-search
   */
  @property({ attribute: 'placeholder-search' })
  public placeholderSearch = 'Search';

  /**
   * Sets the open state of the component.
   * @attr open
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

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
  public set groupKey(value: Keys<T> | undefined) {
    if (this._groupKey !== value) {
      this._groupKey = value;
      this._state.runPipeline();
    }
  }

  public get groupKey() {
    return this._groupKey;
  }

  /**
   * Sorts the items in each group by ascending or descending order.
   * @attr group-sorting
   * @default asc
   * @type {"asc" | "desc" | "none"}
   */
  @property({ attribute: 'group-sorting' })
  public set groupSorting(value: GroupingDirection) {
    if (this._groupSorting !== value) {
      this._groupSorting = value;
      this._state.runPipeline();
    }
  }

  public get groupSorting() {
    return this._groupSorting;
  }

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
    const options = { ...this._filteringOptions, ...value };
    if (!equal(options, this._filteringOptions)) {
      this._filteringOptions = options;
      this._state.runPipeline();
    }
  }

  public get filteringOptions(): FilteringOptions<T> {
    return this._filteringOptions;
  }

  /**
   * Enables the case sensitive search icon in the filtering input.
   * @attr case-sensitive-icon
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
    this.resetSearchTerm();
  }

  public get disableFiltering(): boolean {
    return this._disableFiltering;
  }

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
    html`${this.groupKey && item[this.groupKey]}`;

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
    this._formValue.value = items;
    if (this.hasUpdated) {
      this._updateSelection();
      this.updateValue();
    }
  }

  /**
   * Returns the current selection as a list of comma separated values,
   * represented by the value key, when provided.
   */
  public get value(): ComboValue<T>[] {
    return this._formValue.value;
  }

  protected _updateSelection() {
    this._selection.deselect();
    if (!isEmpty(this.value)) {
      this._selection.select(this.value);
    }
  }

  @watch('open')
  protected toggleDirectiveChange() {
    this._rootClickController.update();
  }

  constructor() {
    super();

    addThemingController(this, all);
    addSafeEventListener(this, 'blur', this._handleBlur);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);

    // TODO
    this.addEventListener(
      'keydown',
      this._navigation.navigateHost.bind(this._navigation)
    );
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this._updateSelection();
    this.updateValue(this.hasUpdated);
    this._pristine = true;
    this._state.runPipeline();
  }

  protected override _restoreDefaultValue(): void {
    this._formValue.value = this._formValue.defaultValue;
    this._updateSelection();
    this.updateValue(true);
    this._validate();
  }

  protected override _setDefaultValue(current: string | null): void {
    this.defaultValue = JSON.parse(current ?? '[]');
  }

  protected override _setFormValue(): void {
    if (isEmpty(this.value)) {
      super._setFormValue(null);
      return;
    }

    if (this.singleSelect) {
      super._setFormValue(`${first(this.value)}`);
      return;
    }

    if (this.name) {
      const value = new FormData();
      for (const item of this.value) {
        value.append(this.name, `${item}`);
      }
      super._setFormValue(value);
    }
  }

  protected resetSearchTerm() {
    this._state.searchTerm = '';
  }

  protected updateValue(initial = false) {
    if (isEmpty(this.data)) {
      return;
    }
    this._formValue.value = this._selection.getSelectedValuesByKey(
      this.valueKey
    );
    this._displayValue = this._selection
      .getSelectedValuesByKey(this.displayKey)
      .join(', ');

    this._setFormValue();

    if (!initial) {
      this._validate();
      this._list.requestUpdate();
    }
  }

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions) {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur() {
    this._input.blur();
  }

  /**
   * Returns the current selection as an array of objects as provided in the `data` source.
   */
  public get selection(): T[] {
    return this._selection.asArray;
  }

  /**
   * Selects option(s) in the list by either reference or valueKey.
   * If not argument is provided all items will be selected.
   * @param { Item<T> | Items<T> } items - One or more items to be selected. Multiple items should be passed as an array.
   * When valueKey is specified, the corresponding value should be used in place of the item reference.
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
  public select(items?: Item<T> | Item<T>[]) {
    this._selection.select(items);
    this.updateValue();
  }

  /**
   * Deselects option(s) in the list by either reference or valueKey.
   * If not argument is provided all items will be deselected.
   * @param { Item<T> | Items<T> } items - One or more items to be deselected. Multiple items should be passed as an array.
   * When valueKey is specified, the corresponding value should be used in place of the item reference.
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
  public deselect(items?: Item<T> | Item<T>[]) {
    this._selection.deselect(items);
    this.updateValue();
  }

  protected async handleMainInput({ detail }: CustomEvent<string>) {
    this._setTouchedState();
    this._show();
    this._state.searchTerm = detail;

    // wait for the dataState to update after filtering
    await this.updateComplete;

    const matchIndex = this._state.dataState.findIndex((i) => !i.header);
    this._navigation.active = detail ? matchIndex : -1;

    // update the list after changing the active item
    this._list.requestUpdate();

    // clear the selection upon typing
    this.clearSingleSelection();
  }

  protected _handleFocusIn() {
    this._setTouchedState();
  }

  protected override _handleBlur() {
    if (this._selection.isEmpty) {
      this._displayValue = '';
      this.resetSearchTerm();
    }
    super._handleBlur();
  }

  protected handleSearchInput({ detail }: CustomEvent<string>) {
    this._state.searchTerm = detail;
  }

  protected handleOpening() {
    return this.emitEvent('igcOpening', { cancelable: true });
  }

  protected handleClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected async _show(emitEvent = true) {
    if (this.open || (emitEvent && !this.handleOpening())) {
      return false;
    }

    this.open = true;
    await this.updateComplete;

    if (emitEvent) {
      this.emitEvent('igcOpened');
    }

    if (!this.singleSelect) {
      this._list.focus();
    }

    if (!this.autofocusList) {
      this._searchInput.focus();
    }

    return true;
  }

  /** Shows the list of options. */
  public async show(): Promise<boolean> {
    return await this._show(false);
  }

  protected async _hide(emitEvent = true) {
    if (!this.open || (emitEvent && !this.handleClosing())) {
      return false;
    }

    this.open = false;
    await this.updateComplete;

    if (emitEvent) {
      this.emitEvent('igcClosed');
    }
    this._navigation.active = -1;
    return true;
  }

  /** Hides the list of options. */
  public async hide(): Promise<boolean> {
    return await this._hide(false);
  }

  protected _toggle(emit = true) {
    return this.open ? this._hide(emit) : this._show(emit);
  }

  /** Toggles the list of options. */
  public async toggle(): Promise<boolean> {
    return await this._toggle(false);
  }

  private _getActiveDescendantId(index: number) {
    const position = index + 1;
    const id = this.id ? `${this.id}-item-${position}` : `item-${position}`;

    return { id, position };
  }

  protected itemRenderer: ComboRenderFunction<T> = (
    item: ComboRecord<T>,
    index: number
  ) => {
    if (!item) {
      return html`${nothing}`;
    }

    if (this.groupKey && item.header) {
      return html`
        <igc-combo-header part="group-header">
          ${this.groupHeaderTemplate({ item: item.value })}
        </igc-combo-header>
      `;
    }

    const { id, position } = this._getActiveDescendantId(index);
    const active = this._navigation.active === index;
    const selected = this._selection.has(this.data.at(item.dataIndex));

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

  protected listKeydownHandler(event: KeyboardEvent) {
    const target = findElementFromEventPath<IgcComboListComponent>(
      IgcComboListComponent.tagName,
      event
    );

    if (target) {
      this._navigation.navigateList(event, target);
    }
  }

  protected itemClickHandler(event: PointerEvent) {
    this._setTouchedState();
    const target = findElementFromEventPath<IgcComboItemComponent>(
      IgcComboItemComponent.tagName,
      event
    );

    if (!target) {
      return;
    }

    this.toggleSelect(target.index);

    if (this.singleSelect) {
      this._input.focus();
      this._hide();
    } else {
      this._searchInput.focus();
    }
  }

  protected toggleSelect(index: number) {
    const { dataIndex } = this._state.dataState.at(index)!;

    this._selection.changeSelection(dataIndex);
    this._navigation.active = index;
    this.updateValue();
  }

  protected selectByIndex(index: number) {
    const { dataIndex } = this._state.dataState.at(index)!;

    this._selection.selectByIndex(dataIndex);
    this._navigation.active = index;
    this.updateValue();
  }

  protected clearSingleSelection() {
    const _selection = this._selection.asArray;
    const selection = first(_selection);

    if (selection) {
      const item = this.valueKey ? selection[this.valueKey] : selection;
      this._selection.deselect(item, !isEmpty(_selection));
      this._formValue.value = [];
    }
  }

  protected handleClearIconClick(e: PointerEvent) {
    e.stopPropagation();

    if (this.singleSelect) {
      this.resetSearchTerm();
      this.clearSingleSelection();
    } else {
      this._selection.deselect([], true);
    }

    this.updateValue();
    this._navigation.active = -1;
  }

  protected handleMainInputKeydown(e: KeyboardEvent) {
    this._setTouchedState();
    this._navigation.navigateMainInput(e, this._list);
  }

  protected handleSearchInputKeydown(e: KeyboardEvent) {
    this._navigation.navigateSearchInput(e, this._list);
  }

  protected toggleCaseSensitivity() {
    this.filteringOptions = {
      caseSensitive: !this.filteringOptions.caseSensitive,
    };
  }

  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  private renderToggleIcon() {
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

  private renderClearIcon() {
    return html`
      <span
        slot="suffix"
        part="clear-icon"
        @click=${this.handleClearIconClick}
        ?hidden=${this._selection.isEmpty}
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

  private renderMainInput() {
    return html`
      <igc-input
        id="target"
        slot="anchor"
        role="combobox"
        aria-controls="dropdown"
        aria-owns="dropdown"
        aria-expanded=${this.open}
        aria-describedby="combo-helper-text"
        aria-disabled=${this.disabled}
        exportparts="container: input, input: native-input, label, prefix, suffix"
        @click=${this._toggle}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        @igcChange=${this._stopPropagation}
        @igcInput=${this.handleMainInput}
        @keydown=${this.handleMainInputKeydown}
        .value=${this._displayValue}
        .disabled=${this.disabled}
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        .autofocus=${this.autofocus}
        ?readonly=${!this.singleSelect}
      >
        <span slot=${!isEmpty(this.inputPrefix) && 'prefix'}>
          <slot name="prefix"></slot>
        </span>
        ${this.renderClearIcon()}
        <span slot=${!isEmpty(this.inputSuffix) && 'suffix'}>
          <slot name="suffix"></slot>
        </span>
        ${this.renderToggleIcon()}
      </igc-input>
    `;
  }

  private renderSearchInput() {
    return html`
      <div
        part="filter-input"
        ?hidden=${this.disableFiltering || this.singleSelect}
      >
        <igc-input
          .value=${this._state.searchTerm}
          part="search-input"
          placeholder=${this.placeholderSearch}
          exportparts="input: search-input"
          @igcInput=${this.handleSearchInput}
          @keydown=${this.handleSearchInputKeydown}
        >
          <igc-icon
            slot=${this.caseSensitiveIcon && 'suffix'}
            name="case_sensitive"
            collection="default"
            part=${partMap({
              'case-icon': true,
              active: this.filteringOptions.caseSensitive ?? false,
            })}
            @click=${this.toggleCaseSensitivity}
          ></igc-icon>
        </igc-input>
      </div>
    `;
  }

  private renderEmptyTemplate() {
    return html`
      <div part="empty" ?hidden=${!isEmpty(this._state.dataState)}>
        <slot name="empty">The list is empty</slot>
      </div>
    `;
  }

  private renderList() {
    return html`
      <div
        .inert=${!this.open}
        @keydown=${this.listKeydownHandler}
        part="list-wrapper"
      >
        ${this.renderSearchInput()}
        <div part="header">
          <slot name="header"></slot>
        </div>
        <igc-combo-list
          aria-multiselectable=${!this.singleSelect}
          id="dropdown"
          part="list"
          role="listbox"
          tabindex="0"
          aria-labelledby="target"
          aria-activedescendant=${ifDefined(this._activeDescendant)}
          .items=${this._state.dataState}
          .renderItem=${this.itemRenderer}
          ?hidden=${isEmpty(this._state.dataState)}
          @click=${this.itemClickHandler}
        >
        </igc-combo-list>
        ${this.renderEmptyTemplate()}
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  private renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'combo-helper-text',
      hasHelperText: true,
    });
  }

  protected override render() {
    return html`
      <igc-popover ?open=${this.open} flip shift same-width>
        ${this.renderMainInput()} ${this.renderList()}
      </igc-popover>
      ${this.renderHelperText()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
