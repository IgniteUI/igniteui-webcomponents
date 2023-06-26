import { html, LitElement, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/combo.base.css.js';
import { styles as bootstrap } from './themes/light/combo.bootstrap.css.js';
import { styles as material } from './themes/light/combo.material.css.js';
import { styles as fluent } from './themes/light/combo.fluent.css.js';
import { styles as indigo } from './themes/light/combo.indigo.css.js';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcComboListComponent from './combo-list.js';
import IgcComboItemComponent from './combo-item.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcInputComponent from '../input/input.js';
import IgcIconComponent from '../icon/icon.js';
import { NavigationController } from './controllers/navigation.js';
import { SelectionController } from './controllers/selection.js';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import { DataController } from './controllers/data.js';
import { IgcToggleComponent } from '../toggle/types.js';
import {
  Keys,
  ComboRecord,
  GroupingDirection,
  FilteringOptions,
  IgcComboEventMap,
  ComboItemTemplate,
  ComboRenderFunction,
  Item,
} from './types.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { partNameMap } from '../common/util.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import type { ThemeController, Theme } from '../../theming/types.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';

defineComponents(
  IgcIconComponent,
  IgcComboListComponent,
  IgcComboItemComponent,
  IgcComboHeaderComponent,
  IgcInputComponent
);

/* blazorSupportsVisualChildren */
/**
 * @element igc-combo
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content inside the suffix container.
 * @slot clear-icon - Renders content inside the suffix container.
 *
 * @fires igcFocus - Emitted when the select gains focus.
 * @fires igcBlur - Emitted when the select loses focus.
 * @fires igcChange - Emitted when the control's selection has changed.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart label - The encapsulated text label.
 * @csspart input - The main input field.
 * @csspart native-input - The native input of the main input field.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart toggle-icon - The toggle icon wrapper.
 * @csspart clear-icon - The clear icon wrapper.
 * @csspart case-icon - The case icon wrapper.
 * @csspart helper-text - The helper text wrapper.
 * @csspart search-input - The search input field.
 * @csspart list-wrapper - The list of options wrapper.
 * @csspart list - The list of options box.
 * @csspart item - Represents each item in the list of options.
 * @csspart group-header - Represents each header in the list of options.
 * @csspart active - Appended to the item parts list when the item is active.
 * @csspart selected - Appended to the item parts list when the item is selected.
 * @csspart checkbox - Represents each checkbox of each list item.
 * @csspart checkbox-indicator - Represents the checkbox indicator of each list item.
 * @csspart checked - Appended to checkbox parts list when checkbox is checked.
 * @csspart header - The container holding the header content.
 * @csspart footer - The container holding the footer content.
 * @csspart empty - The container holding the empty content.
 */
@themes({ material, bootstrap, fluent, indigo })
@blazorAdditionalDependencies('IgcIconComponent, IgcInputComponent')
@blazorIndirectRender
// TODO: pressing arrow down should scroll to the selected item
export default class IgcComboComponent<T extends object>
  extends EventEmitterMixin<IgcComboEventMap, Constructor<LitElement>>(
    LitElement
  )
  implements Partial<IgcToggleComponent>
{
  public static readonly tagName = 'igc-combo';
  public static styles = styles;
  private _value: string[] = [];
  private _displayValue = '';
  private _filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
    matchDiacritics: false,
  };

  protected navigationController = new NavigationController<T>(this);
  protected selectionController = new SelectionController<T>(this);
  protected dataController = new DataController<T>(this);
  protected toggleController!: IgcToggleController;
  protected themeController!: ThemeController;
  protected theme!: Theme;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

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
   * The name attribute of the control.
   * @attr name
   */
  @property()
  public name!: string;

  /**
   * The disabled attribute of the control.
   * @attr disabled
   */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /**
   * The required attribute of the control.
   * @attr required
   */
  @property({ reflect: true, type: Boolean })
  public required = false;

  /**
   * The invalid attribute of the control.
   * @attr invalid
   */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

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
   * The direction attribute of the control.
   * @attr dir
   */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /**
   * Sets the open state of the component.
   * @attr open
   */
  @property({ type: Boolean })
  public open = false;

  /** @hidden @internal */
  @property({ type: Boolean })
  public flip = true;

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
   * @type {"asc" | "desc"}
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
    if (typeof item !== 'object' || item === null) {
      return String(item) as any;
    }

    if (this.displayKey) {
      return html`${item[this.displayKey]}`;
    }

    return html`${String(item)}`;
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

  /**
   * Sets the component's positioning strategy.
   * @hidden @internal
   */
  public positionStrategy: 'absolute' | 'fixed' = 'fixed';

  /**
   * Whether the dropdown's width should be the same as the target's one.
   * @hidden @internal
   */
  public sameWidth = true;

  @state()
  protected dataState: Array<ComboRecord<T>> = [];

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data) as ComboRecord<T>[];

    if (this.hasUpdated) {
      this.pipeline();
    }
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
    if (!this.target) return;
    this.toggleController.target = this.target;
    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  constructor() {
    super();

    this.toggleController = new IgcToggleController(this, {
      target: this.target,
      closeCallback: async () => {
        if (!this.handleClosing()) return;
        this.open = false;

        await this.updateComplete;
        this.emitEvent('igcClosed');
      },
    });

    this.addEventListener('focus', () => {
      this.emitEvent('igcFocus');
    });

    this.addEventListener('blur', () => {
      const { selected } = this.selectionController;

      if (selected.size === 0) {
        this.target.value = '';
        this.resetSearchTerm();
      }

      this.emitEvent('igcBlur');
    });

    this.addEventListener(
      'keydown',
      this.navigationController.navigateHost.bind(this.navigationController)
    );
  }

  protected themeAdopted(controller: ThemeController) {
    this.themeController = controller;
  }

  protected override willUpdate() {
    this.theme = this.themeController.theme;
  }

  protected override async getUpdateComplete() {
    const result = await super.getUpdateComplete();
    await this.toggleController.rendered;
    return result;
  }

  protected resetSearchTerm() {
    this.dataController.searchTerm = '';
  }

  @watch('singleSelect', { waitUntilFirstUpdate: true })
  protected async resetState() {
    await this.updateComplete;

    this.selectionController.selected.clear();
    this.updateValue();
    this.resetSearchTerm();
    this.navigationController.active = -1;
  }

  @watch('value')
  protected selectItems() {
    if (!this._value || this.value.length === 0) {
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
  public set value(items: string[]) {
    const oldValue = this._value;
    this._value = items;
    this.requestUpdate('value', oldValue);
  }

  /**
   * Returns the current selection as a list of commma separated values,
   * represented by the value key, when provided.
   */
  @property({ attribute: true, type: Array })
  public get value() {
    return this._value;
  }

  protected async updateValue() {
    this._value = this.selectionController.getValue(
      Array.from(this.selectionController.selected)
    );

    this._displayValue = this.selectionController.getDisplayValue(
      Array.from(this.selectionController.selected)
    );

    await this.updateComplete;
    this.target.value = this._displayValue;
    this.list.requestUpdate();
  }

  @watch('value')
  protected validate() {
    this.updateComplete.then(() => this.reportValidity());
  }

  /** Checks the validity of the control. */
  public reportValidity() {
    this.invalid = this.required && this.value.length === 0;
    return !this.invalid;
  }

  /** A wrapper around the reportValidity method to comply with the native input API. */
  public checkValidity() {
    return this.reportValidity();
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
  public get selection() {
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
    const args = { cancelable: true };
    return this.emitEvent('igcOpening', args);
  }

  protected handleClosing(): boolean {
    const args = { cancelable: true };
    return this.emitEvent('igcClosing', args);
  }

  protected async _show(emit = true) {
    if (this.open) return;
    if (emit && !this.handleOpening()) return;
    this.open = true;

    await this.updateComplete;
    emit && this.emitEvent('igcOpened');

    if (!this.singleSelect) {
      this.list.focus();
    }

    if (!this.autofocusList) {
      this.input.focus();
    }
  }

  /** Shows the list of options. */
  public show() {
    this._show(false);
  }

  protected async _hide(emit = true) {
    if (!this.open) return;
    if (emit && !this.handleClosing()) return;
    this.open = false;

    await this.updateComplete;
    emit && this.emitEvent('igcClosed');
    this.navigationController.active = -1;
  }

  /** Hides the list of options. */
  public hide() {
    this._hide(false);
  }

  /** @hidden @internal */
  public _toggle(emit = true) {
    this.open ? this._hide(emit) : this._show(emit);
  }

  /** Toggles the list of options. */
  public toggle() {
    this._toggle(false);
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

    const itemParts = partNameMap({
      item: true,
      selected,
      active,
    });

    const itemTemplate = html`<igc-combo-item
      part="${itemParts}"
      exportparts="checkbox, checkbox-indicator, checked"
      @click=${this.itemClickHandler.bind(this)}
      .index=${index}
      .active=${active}
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

    const target = event
      .composedPath()
      .find(
        (el) => el instanceof IgcComboItemComponent
      ) as IgcComboItemComponent;

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

  protected navigateTo(item: T) {
    this.navigationController.navigateTo(item, this.list);
  }

  protected clearSingleSelection() {
    const { selected } = this.selectionController;
    const selection = selected.values().next().value;

    if (selection) {
      const item = this.valueKey ? selection[this.valueKey] : selection;
      this.selectionController.deselect([item], selected.size > 0);
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

  private renderToggleIcon() {
    const openIcon =
      this.theme === 'material' ? 'keyboard_arrow_up' : 'arrow_drop_up';
    const closeIcon =
      this.theme === 'material' ? 'keyboard_arrow_down' : 'arrow_drop_down';

    return html`
      <span slot="suffix" part="toggle-icon">
        <slot name="toggle-icon">
          <igc-icon
            name=${this.open ? openIcon : closeIcon}
            collection="internal"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </span>
    `;
  }

  private renderClearIcon() {
    const { selected } = this.selectionController;
    const icon = this.theme === 'material' ? 'chip_cancel' : 'clear';

    return html`<span
      slot="suffix"
      part="clear-icon"
      @click=${this.handleClearIconClick}
      ?hidden=${selected.size === 0}
    >
      <slot name="clear-icon">
        <igc-icon
          name="${icon}"
          collection="internal"
          aria-hidden="true"
        ></igc-icon>
      </slot>
    </span>`;
  }

  private renderMainInput() {
    return html`<igc-input
      id="target"
      role="combobox"
      aria-controls="dropdown"
      aria-describedby="helper-text"
      aria-disabled=${this.disabled}
      exportparts="container: input, input: native-input, label, prefix, suffix"
      @click=${(e: MouseEvent) => {
        e.preventDefault();
        this._toggle(true);
      }}
      placeholder=${ifDefined(this.placeholder)}
      label=${ifDefined(this.label)}
      dir=${this.dir}
      @igcChange=${(e: Event) => e.stopPropagation()}
      @igcFocus=${(e: Event) => {
        e.stopPropagation();

        requestAnimationFrame(() => {
          this.target.select();
        });
      }}
      @igcBlur=${(e: Event) => e.stopPropagation()}
      @igcInput=${this.handleMainInput}
      @keydown=${this.handleMainInputKeydown}
      .disabled=${this.disabled}
      .required=${this.required}
      .invalid=${this.invalid}
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
        part="search-input"
        placeholder=${this.placeholderSearch}
        exportparts="input: search-input"
        @igcFocus=${(e: Event) => e.stopPropagation()}
        @igcBlur=${(e: Event) => e.stopPropagation()}
        @igcInput=${this.handleSearchInput}
        @keydown=${this.handleSearchInputKeydown}
        dir=${this.dir}
      >
        <igc-icon
          slot=${this.caseSensitiveIcon && 'suffix'}
          name="case_sensitive"
          collection="internal"
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
    return html`<div
      @keydown=${this.listKeydownHandler}
      part="list-wrapper"
      style=${styleMap({ position: this.positionStrategy })}
      ${this.toggleController.toggleDirective}
    >
      ${this.renderSearchInput()}
      <div part="header">
        <slot name="header"></slot>
      </div>
      <igc-combo-list
        id="dropdown"
        part="list"
        aria-label="${this.label}"
        .items=${this.dataState}
        .renderItem=${this.itemRenderer}
        ?hidden=${this.dataState.length === 0}
      >
      </igc-combo-list>
      ${this.renderEmptyTemplate()}
      <div part="footer">
        <slot name="footer"></slot>
      </div>
    </div>`;
  }

  private renderHelperText() {
    return html`<div
      id="helper-text"
      part="helper-text"
      ?hidden="${this.helperText.length === 0}"
    >
      <slot name="helper-text"></slot>
    </div>`;
  }

  protected override render() {
    return html`
      ${this.renderMainInput()}${this.renderList()}${this.renderHelperText()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
