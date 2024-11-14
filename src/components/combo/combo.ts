import { LitElement, type TemplateResult, html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  findElementFromEventPath,
  isEmpty,
  partNameMap,
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
@themes(all)
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

  private _value: ComboValue<T>[] = [];

  @state()
  private _activeDescendant!: string;

  @state()
  private _displayValue = '';

  private _filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
    matchDiacritics: false,
  };

  protected override get __validators() {
    return comboValidators;
  }

  protected navigationController = new NavigationController<T>(this);
  protected selectionController = new SelectionController<T>(this);
  protected dataController = new DataController<T>(this);

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  @query('[part="search-input"]')
  protected input!: IgcInputComponent;

  @query('igc-input#target')
  private target!: IgcInputComponent;

  @query('igc-combo-list')
  private list!: IgcComboListComponent;

  /** The data source used to generate the list of options. */
  /* treatAsRef */
  @property({ attribute: false })
  public data: Array<T> = [];

  /**
   * The outlined attribute of the control.
   * @attr outlined
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * Enables single selection mode and moves item filtering to the main input.
   * @attr single-select
   */
  @property({ attribute: 'single-select', reflect: true, type: Boolean })
  public singleSelect = false;

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
  @property({ attribute: 'autofocus-list', type: Boolean })
  public autofocusList = false;

  /**
   * The label attribute of the control.
   * @attr label
   */
  @property({ type: String })
  public label!: string;

  /**
   * The placeholder attribute of the control.
   * @attr placeholder
   */
  @property({ type: String })
  public placeholder!: string;

  /**
   * The placeholder attribute of the search input.
   * @attr placeholder-search
   */
  @property({ attribute: 'placeholder-search', type: String })
  public placeholderSearch = 'Search';

  /**
   * Sets the open state of the component.
   * @attr open
   */
  @property({ type: Boolean })
  public open = false;

  /**
   * The key in the data source used when selecting items.
   * @attr value-key
   */
  @property({ attribute: 'value-key', reflect: false })
  public valueKey?: Keys<T>;

  /**
   * The key in the data source used to display items in the list.
   * @attr display-key
   */
  @property({ attribute: 'display-key', reflect: false })
  public displayKey?: Keys<T> = this.valueKey;

  /**
   * The key in the data source used to group items in the list.
   * @attr group-key
   */
  @property({ attribute: 'group-key', reflect: false })
  public groupKey?: Keys<T> = this.displayKey;

  /**
   * Sorts the items in each group by ascending or descending order.
   * @attr group-sorting
   * @type {"asc" | "desc" | "none"}
   */
  @property({ attribute: 'group-sorting', reflect: false })
  public groupSorting: GroupingDirection = 'asc';

  /**
   * An object that configures the filtering of the combo.
   * @attr filtering-options
   * @type {FilteringOptions<T>}
   * @param filterKey - The key in the data source used when filtering the list of options.
   * @param caseSensitive - Determines whether the filtering operation should be case sensitive.
   * @param matchDiacritics -If true, the filter distinguishes between accented letters and their base letters.
   */
  @property({ attribute: 'filtering-options', type: Object })
  public get filteringOptions(): FilteringOptions<T> {
    return this._filteringOptions;
  }

  public set filteringOptions(value: Partial<FilteringOptions<T>>) {
    this._filteringOptions = { ...this._filteringOptions, ...value };
    this.requestUpdate('pipeline');
  }

  /**
   * Enables the case sensitive search icon in the filtering input.
   * @attr case-sensitive-icon
   */
  @property({ type: Boolean, attribute: 'case-sensitive-icon', reflect: false })
  public caseSensitiveIcon = false;

  /**
   * Disables the filtering of the list of options.
   * @attr disable-filtering
   */
  @property({ type: Boolean, attribute: 'disable-filtering', reflect: false })
  public disableFiltering = false;

  /* blazorSuppress */
  /**
   * The template used for the content of each combo item.
   * @type {ComboItemTemplate<T>}
   */
  @property({ attribute: false })
  public itemTemplate: ComboItemTemplate<T> = ({ item }) => {
    const template = this.displayKey ? `${item[this.displayKey]}` : `${item}`;
    return html`${template}`;
  };

  /* blazorSuppress */
  /**
   * The template used for the content of each combo group header.
   * @type {ComboItemTemplate<T>}
   */
  @property({ attribute: false })
  public groupHeaderTemplate: ComboItemTemplate<T> = ({ item }) => {
    return html`${this.groupKey && item[this.groupKey]}`;
  };

  @state()
  protected dataState: Array<ComboRecord<T>> = [];

  @watch('data')
  protected dataChanged() {
    if (isEmpty(this.data)) return;
    this.dataState = structuredClone(this.data) as ComboRecord<T>[];

    if (this.hasUpdated) {
      this.pipeline();
    }

    this.requestUpdate('value');
  }

  @watch('valueKey')
  protected updateDisplayKey() {
    this.displayKey = this.displayKey ?? this.valueKey;
  }

  @watch('displayKey')
  protected updateFilterKey() {
    if (!this.filteringOptions.filterKey) {
      this.filteringOptions = { filterKey: this.displayKey };
    }
  }

  @watch('groupKey')
  @watch('groupSorting')
  @watch('pipeline')
  protected async pipeline() {
    this.dataState = await this.dataController.apply([...this.data]);
  }

  @watch('open')
  protected toggleDirectiveChange() {
    this._rootClickController.update();
  }

  @watch('disableFiltering')
  protected updateOnDisableFiltering() {
    this.resetSearchTerm();
    this.pipeline();
  }

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: async () => {
      if (!this.handleClosing()) return;
      this.open = false;

      await this.updateComplete;
      this.emitEvent('igcClosed');
    },
  });

  constructor() {
    super();

    this.addEventListener('blur', () => {
      const { selected } = this.selectionController;

      if (isEmpty(selected)) {
        this._displayValue = '';
        this.resetSearchTerm();
      }

      this.invalid = !this.checkValidity();
    });

    this.addEventListener(
      'keydown',
      this.navigationController.navigateHost.bind(this.navigationController)
    );
  }

  protected resetSearchTerm() {
    this.dataController.searchTerm = '';
  }

  @watch('singleSelect', { waitUntilFirstUpdate: true })
  protected resetState() {
    this.selectionController.selected.clear();
    this.updateValue();
    this.resetSearchTerm();
    this.navigationController.active = -1;
  }

  @watch('value')
  protected selectItems() {
    if (!this._value || isEmpty(this._value)) {
      this.selectionController.deselect([]);
    } else {
      this.selectionController.deselect([]);
      this.selectionController.select(this._value as Item<T>[]);
    }

    this.updateValue();
  }

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
  public set value(items: ComboValue<T>[]) {
    const oldValue = this._value;
    this._value = items;
    this.requestUpdate('value', oldValue);
  }

  /**
   * Returns the current selection as a list of comma separated values,
   * represented by the value key, when provided.
   */
  @property({ attribute: true, type: Array })
  public get value(): ComboValue<T>[] {
    return this._value;
  }

  protected override _setDefaultValue(current: string | null): void {
    this.defaultValue = JSON.parse(current ?? '[]');
  }

  protected override _setFormValue(): void {
    if (!this.name) {
      return;
    }

    const items = this._value;

    if (isEmpty(items)) {
      super._setFormValue(null);
      return;
    }

    const data = new FormData();

    if (this.singleSelect) {
      data.set(this.name, `${items[0]}`);
    } else {
      for (const item of items) {
        data.append(this.name, `${item}`);
      }
    }

    super._setFormValue(data);
  }

  protected async updateValue() {
    if (isEmpty(this.data)) return;
    const selected = Array.from(this.selectionController.selected);

    this._value = this.selectionController.getValue(selected, this.valueKey!);
    this._displayValue = this.selectionController
      .getValue(selected, this.displayKey!)
      .join(', ');

    if (this.target && this.singleSelect) {
      this.target.value = this._displayValue;
    }

    this._setFormValue();
    this._validate();

    await this.updateComplete;
    this.list.requestUpdate();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions) {
    this.target.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur() {
    this.target.blur();
    super.blur();
  }

  protected normalizeSelection(items: Item<T> | Item<T>[] = []): Item<T>[] {
    return Array.isArray(items) ? items : [items];
  }

  /**
   * Returns the current selection as an array of objects as provided in the `data` source.
   */
  public get selection(): Array<T> {
    return Array.from(this.selectionController.selected.values());
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
    const _items = this.normalizeSelection(items);
    this.selectionController.select(_items, false);
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
    const _items = this.normalizeSelection(items);
    this.selectionController.deselect(_items, false);
    this.updateValue();
  }

  protected async handleMainInput(e: CustomEvent) {
    this._show();
    this.dataController.searchTerm = e.detail;

    // wait for the dataState to update after filtering
    await this.updateComplete;

    const matchIndex = this.dataState.findIndex((i) => !i.header);
    this.navigationController.active = e.detail.length > 0 ? matchIndex : -1;

    // update the list after changing the active item
    this.list.requestUpdate();

    // clear the selection upon typing
    this.clearSingleSelection();
  }

  protected handleSearchInput(e: CustomEvent) {
    this.dataController.searchTerm = e.detail;
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
      this.list.focus();
    }

    if (!this.autofocusList) {
      this.input.focus();
    }

    return true;
  }

  /** Shows the list of options. */
  public async show(): Promise<boolean> {
    return this._show(false);
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
    this.navigationController.active = -1;
    return true;
  }

  /** Hides the list of options. */
  public async hide(): Promise<boolean> {
    return this._hide(false);
  }

  protected _toggle(emit = true) {
    return this.open ? this._hide(emit) : this._show(emit);
  }

  /** Toggles the list of options. */
  public async toggle(): Promise<boolean> {
    return this._toggle(false);
  }

  protected itemRenderer: ComboRenderFunction<T> = (
    item: ComboRecord<T>,
    index: number
  ): TemplateResult => {
    const record = item;
    const dataItem = this.data.at(record.dataIndex);
    const active = this.navigationController.active === index;
    const selected = this.selectionController.selected.has(dataItem!);
    const headerTemplate = html`<igc-combo-header part="group-header"
      >${this.groupHeaderTemplate({ item: record.value })}</igc-combo-header
    >`;

    const itemPosition = index + 1;
    const itemId = this.id
      ? `${this.id}-item-${itemPosition}`
      : `item-${itemPosition}`;

    if (active) {
      this._activeDescendant = itemId;
    }

    const itemTemplate = html`<igc-combo-item
      id=${itemId}
      part=${partNameMap({ item: true, selected, active })}
      aria-setsize=${this.dataState.length}
      aria-posinset=${itemPosition}
      exportparts="checkbox, checkbox-indicator, checked"
      @click=${this.itemClickHandler.bind(this)}
      .index=${index}
      ?active=${active}
      ?selected=${selected}
      ?hide-checkbox=${this.singleSelect}
      >${this.itemTemplate({ item: record.value })}</igc-combo-item
    >`;

    return html`${this.groupKey && record.header
      ? headerTemplate
      : itemTemplate}`;
  };

  protected listKeydownHandler(event: KeyboardEvent) {
    const target = event
      .composedPath()
      .find(
        (el) => el instanceof IgcComboListComponent
      ) as IgcComboListComponent;

    if (target) {
      this.navigationController.navigateList(event, target);
    }
  }

  protected itemClickHandler(event: MouseEvent) {
    const input = this.singleSelect ? this.target : this.input;
    const target = findElementFromEventPath<IgcComboItemComponent>(
      IgcComboItemComponent.tagName,
      event
    )!;

    this.toggleSelect(target.index);
    input.focus();

    if (this.singleSelect) {
      this._hide();
    }
  }

  protected toggleSelect(index: number) {
    const { dataIndex } = this.dataState.at(index)!;

    this.selectionController.changeSelection(dataIndex);
    this.navigationController.active = index;
    this.updateValue();
  }

  protected selectByIndex(index: number) {
    const { dataIndex } = this.dataState.at(index)!;

    this.selectionController.selectByIndex(dataIndex);
    this.navigationController.active = index;
    this.updateValue();
  }

  protected navigateTo(item: T) {
    this.navigationController.navigateTo(item, this.list);
  }

  protected clearSingleSelection() {
    const { selected } = this.selectionController;
    const selection = selected.values().next().value;

    if (selection) {
      const item = this.valueKey ? selection[this.valueKey] : selection;
      this.selectionController.deselect([item], !isEmpty(selected));
      this._value = [];
    }
  }

  protected handleClearIconClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.singleSelect) {
      this.resetSearchTerm();
      this.clearSingleSelection();
    } else {
      this.selectionController.deselect([], true);
    }

    this.updateValue();
    this.navigationController.active = -1;
  }

  protected handleMainInputKeydown(e: KeyboardEvent) {
    this.navigationController.navigateMainInput(e, this.list);
  }

  protected handleSearchInputKeydown(e: KeyboardEvent) {
    this.navigationController.navigateSearchInput(e, this.list);
  }

  protected toggleCaseSensitivity() {
    this.filteringOptions = {
      caseSensitive: !this.filteringOptions.caseSensitive,
    };
  }

  protected get hasPrefixes() {
    return this.inputPrefix.length > 0;
  }

  protected get hasSuffixes() {
    return this.inputSuffix.length > 0;
  }

  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  private renderToggleIcon() {
    return html`
      <span
        slot="suffix"
        part="${partNameMap({
          'toggle-icon': true,
          filled: this.value.length > 0,
        })}"
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
    const { selected } = this.selectionController;

    return html`<span
      slot="suffix"
      part="clear-icon"
      @click=${this.handleClearIconClick}
      ?hidden=${isEmpty(selected)}
    >
      <slot name="clear-icon">
        <igc-icon
          name="input_clear"
          collection="default"
          aria-hidden="true"
        ></igc-icon>
      </slot>
    </span>`;
  }

  private renderMainInput() {
    return html`<igc-input
      id="target"
      slot="anchor"
      role="combobox"
      aria-controls="dropdown"
      aria-owns="dropdown"
      aria-expanded=${this.open ? 'true' : 'false'}
      aria-describedby="combo-helper-text"
      aria-disabled=${this.disabled}
      exportparts="container: input, input: native-input, label, prefix, suffix"
      @click=${(e: MouseEvent) => {
        e.preventDefault();
        this._toggle(true);
      }}
      placeholder=${ifDefined(this.placeholder)}
      label=${ifDefined(this.label)}
      @igcChange=${this._stopPropagation}
      @focus=${() => {
        requestAnimationFrame(() => {
          this.target.select();
        });
      }}
      @igcInput=${this.handleMainInput}
      @keydown=${this.handleMainInputKeydown}
      .value=${this._displayValue}
      .disabled=${this.disabled}
      .required=${this.required}
      .invalid=${live(this.invalid)}
      .outlined=${this.outlined}
      .autofocus=${this.autofocus}
      ?readonly=${!this.singleSelect}
    >
      <span slot=${this.hasPrefixes && 'prefix'}>
        <slot name="prefix"></slot>
      </span>
      ${this.renderClearIcon()}
      <span slot=${this.hasSuffixes && 'suffix'}>
        <slot name="suffix"></slot>
      </span>
      ${this.renderToggleIcon()}
    </igc-input>`;
  }

  private renderSearchInput() {
    return html`<div
      part="filter-input"
      ?hidden=${this.disableFiltering || this.singleSelect}
    >
      <igc-input
        .value=${this.dataController.searchTerm}
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
          part=${partNameMap({
            'case-icon': true,
            active: this.filteringOptions.caseSensitive ?? false,
          })}
          @click=${this.toggleCaseSensitivity}
        ></igc-icon>
      </igc-input>
    </div>`;
  }

  private renderEmptyTemplate() {
    return html`<div part="empty" ?hidden=${this.dataState.length > 0}>
      <slot name="empty">The list is empty</slot>
    </div>`;
  }

  private renderList() {
    const hasItems = this.dataState.length > 0;

    return html`<div
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
        .items=${this.dataState}
        .renderItem=${this.itemRenderer}
        ?hidden=${!hasItems}
      >
      </igc-combo-list>
      ${this.renderEmptyTemplate()}
      <div part="footer">
        <slot name="footer"></slot>
      </div>
    </div>`;
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
