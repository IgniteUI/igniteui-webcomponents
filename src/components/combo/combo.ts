import {
  ComboResourceStringsEN,
  type IComboResourceStrings,
} from 'igniteui-i18n-core';
import { html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import { addRootClickController } from '#internals/controllers/root-click.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import { IgcBaseComboBoxComponent } from '#internals/mixins/combo-box.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { asArray, firstOf, isEmpty } from '#internals/utils/arrays.js';
import {
  addSafeEventListener,
  getElementFromPath,
  stopPropagation,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import type { Validator } from '#internals/validators.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import type { VirtualScrollItemContext } from '../virtualization/types.js';
import IgcVirtualScrollComponent from '../virtualization/virtualization.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcComboItemComponent from './combo-item.js';
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

const i18n: I18nControllerConfig<IComboResourceStrings> = {
  defaultEN: ComboResourceStringsEN,
};

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
@shadowOptions({ delegatesFocus: true })
export default class IgcComboComponent<
  T extends object = any,
> extends I18nMixin(
  FormAssociatedRequiredMixin(
    EventEmitterMixin<
      IgcComboComponentEventMap,
      AbstractConstructor<IgcBaseComboBoxComponent>
    >(IgcBaseComboBoxComponent)
  ),
  i18n
) {
  public static readonly tagName = 'igc-combo';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcComboComponent,
      IgcIconComponent,
      IgcVirtualScrollComponent,
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
          return String(firstOf(value));
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

  @query('#combo-helper-text')
  private readonly _helperText!: IgcValidationContainerComponent | null;

  /** The search input of the combo component. */
  private readonly _searchRef = createRef<IgcInputComponent>();

  /** The combo virtualized dropdown list. */
  private readonly _listRef = createRef<IgcVirtualScrollComponent>();

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

  private _index?: Map<Item<T>, number[]>;
  private _indexSize = 0;
  private _displayKey?: Keys<T>;
  private _placeholderSearch?: string;
  private _selected: Set<T> = new Set();
  // `filterKey` is left unset here - both key fields are still undefined at
  // field-initialization time. The `displayKey` setter fills it in.
  private _filteringOptions: FilteringOptions<T> = {
    filterKey: undefined,
    caseSensitive: false,
    matchDiacritics: false,
  };

  @state()
  private set _activeIndex(index: number) {
    this._navigation.active = index;
    this._listRef.value?.requestUpdate();
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
  private _displayValue = '';

  /** The DOM id of the option rendered at `index` in the current data state. */
  private _itemId(index: number): string {
    const position = index + 1;
    return this.id ? `${this.id}-item-${position}` : `item-${position}`;
  }

  /**
   * Derived from {@link _activeIndex} rather than tracked separately, so that it
   * cannot go stale and does not have to be assigned while rendering an item.
   */
  private get _activeDescendant(): string | undefined {
    return this._activeIndex > -1 ? this._itemId(this._activeIndex) : undefined;
  }

  private get _mainAriaLabel(): string {
    return isEmpty(this._selected)
      ? this.resourceStrings.combo_aria_label_no_options
      : this.resourceStrings.combo_aria_label_options;
  }

  // #endregion

  //#region Public attributes and properties

  /** The data source used to generate the list of options. */
  /* treatAsRef */
  @property({ attribute: false })
  @coercedProperty<T[], IgcComboComponent<T>>({
    transform: ({ value }) => asArray(value),
    onChange: ({ host }) => {
      host._index = undefined;
    },
  })
  public data: T[] = [];

  /**
   * Whether the control has an outlined appearance.
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
  @coercedProperty<boolean, IgcComboComponent<T>>({
    transform: ({ value }) => Boolean(value),
    onChange: ({ host }) => {
      host._syncSelectionFromValue();

      if (host.hasUpdated) {
        host._withPristine(() => {
          host._activeIndex = -1;
          host._searchTerm = '';
          host._formValue.setValueAndFormState(host.value);
        });
      }
    },
  })
  public singleSelect = false;

  /**
   * Whether the control should receive focus automatically.
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
  public override set locale(value: string) {
    super.locale = value;
    this._state.updateLocale(value);
  }

  public override get locale(): string {
    return super.locale;
  }

  /**
   * The label of the control.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The placeholder text of the control.
   * @attr placeholder
   */
  @property()
  public placeholder?: string;

  /**
   * The placeholder text of the search input.
   * @attr placeholder-search
   */
  @property({ attribute: 'placeholder-search' })
  public set placeholderSearch(value: string | undefined) {
    this._placeholderSearch = value;
  }

  public get placeholderSearch(): string {
    return (
      this._placeholderSearch ??
      this.resourceStrings.combo_filter_search_placeholder
    );
  }

  /**
   * The key in the data source used when selecting items.
   * @attr value-key
   */
  @property({ attribute: 'value-key' })
  @coercedProperty<Keys<T> | undefined, IgcComboComponent<T>>({
    onChange: ({ value, host }) => {
      host._displayKey = host._displayKey ?? value;
      host._index = undefined;
    },
  })
  public valueKey?: Keys<T> = undefined;

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
    return this._displayKey ?? this.valueKey;
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
  @coercedProperty<boolean, IgcComboComponent<T>>({
    onChange: ({ host }) => {
      host._searchTerm = '';
    },
  })
  public disableFiltering = false;

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
   * If the data source is an array of complex objects, the `valueKey` must be set.
   * Note that when `displayKey` is not explicitly set, it falls back to the value of `valueKey`.
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

    // TODO: Either fix this in the theming controller or come up with another solution.
    // Check virtualization `willUpdate` for more details.

    // The virtualized list is rendered into this component's own shadow root
    // (light DOM child), sharing it with the theming controller below. Theme
    // changes re-adopt this shadow root's stylesheets wholesale, which would
    // otherwise silently drop the list's own structural stylesheet since
    // nothing else forces it to refresh. Requesting an update lets the list
    // re-verify (and re-adopt, if needed) its stylesheet on its next render.
    addThemingController(this, all, {
      themeChange: () => this._listRef.value?.requestUpdate(),
    });

    // Projects the host's labels and combobox semantics onto the native
    // input inside `igc-input` (see ProjectedARIA for why the host cannot
    // publish these itself). `aria-activedescendant` stays on the listbox,
    // which holds DOM focus while the list is navigated.
    addAriaProjector(this, {
      target: () => this._inputRef.value,
      state: () => ({
        role: 'combobox',
        hasPopup: 'listbox',
        expanded: `${this.open}`,
        disabled: `${this.disabled}`,
        label: this._mainAriaLabel,
        controls: this._listRef.value ? [this._listRef.value] : null,
        describedBy: this._helperText ? [this._helperText] : null,
        labelledBy: this._internals.labels,
      }),
    });
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
      this._withPristine(() => {
        this._syncSelectionFromValue();
        this._formValue.setValueAndFormState(this.value);
      });
    }
  }

  /**
   * Runs `callback`, restoring the pristine flag afterwards.
   *
   * Re-syncing the form value in reaction to a configuration change (as opposed
   * to user interaction) must not count as the control having been dirtied.
   */
  private _withPristine(callback: () => void): void {
    const pristine = this._pristine;

    try {
      callback();
    } finally {
      this._pristine = pristine;
    }
  }

  //#endregion

  // #region Form Associated overrides

  protected override _setDefaultValue(current: string | null): void {
    try {
      this.defaultValue = JSON.parse(current || '[]');
    } catch {
      // A malformed `value` attribute keeps the previous default rather than
      // discarding it - see the "invalid JSON" form integration test.
    }
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

  private _setSingleSelectionDisplayValue(value: string): void {
    if (this.singleSelect && this._inputRef.value) {
      this._inputRef.value.value = value;
    }
  }

  //#endregion

  // #region Selection helpers

  /**
   * Maps every value representation in the data source to the positions of the
   * records carrying it. Built on demand and dropped whenever `data` or
   * `valueKey` changes.
   *
   * Positions (rather than records) are stored so that resolution can hand back
   * matches in data-source order, and duplicate value keys keep resolving to
   * every record that carries them.
   *
   * The size comparison picks up in-place growth or shrink (push/splice) of the
   * same array. Replacing elements without changing the length is not detectable
   * here and still requires reassigning `data`.
   */
  private get _dataIndex(): Map<Item<T>, number[]> {
    if (!this._index || this._indexSize !== this.data.length) {
      this._index = Map.groupBy(this.data.keys(), (position) =>
        this._resolveItemValue(this.data[position])
      );
      this._indexSize = this.data.length;
    }

    return this._index;
  }

  /**
   * Resolves user-provided items (value keys or object references)
   * to actual objects from the data source, in data-source order.
   *
   * @remarks
   * Repeating the same value in `items` resolves it once - a record cannot be
   * selected twice, and duplicates would otherwise reach the change event
   * payload.
   */
  private _resolveItems(items: Item<T>[]): T[] {
    const index = this._dataIndex;
    const positions = new Set<number>();

    for (const item of items) {
      const matches = index.get(item);

      if (matches) {
        for (const position of matches) {
          positions.add(position);
        }
      }
    }

    return Array.from(positions)
      .sort((a, b) => a - b)
      .map((position) => this.data[position]);
  }

  /**
   * Gets the value representation of a data record
   * (its value-key property, or the record itself).
   */
  private _resolveItemValue(record: T): Item<T> {
    return this.valueKey ? record[this.valueKey] : record;
  }

  /**
   * Maps data records to their value representations - the `valueKey` property
   * of each, or the record itself when no `valueKey` is set.
   */
  private _toValues(items: Iterable<T>): ComboValue<T>[] {
    const { valueKey } = this;
    const values: ComboValue<T>[] = [];

    for (const item of items) {
      values.push((valueKey ? item[valueKey] : undefined) ?? item);
    }

    return values;
  }

  /**
   * Recomputes {@link _displayValue} from the current selection and returns its
   * value representation, walking the selection once for both projections.
   */
  private _projectSelection(): ComboValue<T>[] {
    const { valueKey, displayKey } = this;
    const values: ComboValue<T>[] = [];
    const display: string[] = [];

    for (const item of this._selected) {
      values.push((valueKey ? item[valueKey] : undefined) ?? item);
      display.push(String((displayKey ? item[displayKey] : undefined) ?? item));
    }

    this._displayValue = display.join(', ');
    return values;
  }

  private _emitSelectionChange(detail: IgcComboChangeEventArgs): boolean {
    return this.emitEvent('igcChange', { cancelable: true, detail });
  }

  /**
   * Builds the value the component would have if `resolved` were applied to the
   * current selection. Used as the `newValue` payload of the change event.
   */
  private _previewValue(resolved: T[], selecting: boolean): ComboValue<T>[] {
    if (selecting) {
      return this._toValues(
        this.singleSelect ? resolved : new Set([...resolved, ...this._selected])
      );
    }

    const removed = new Set(resolved);

    return this._toValues(
      Iterator.from(this._selected).filter((item) => !removed.has(item))
    );
  }

  /**
   * Adds the given `items` to, or removes them from, the current selection.
   *
   * An empty collection is a "select all" / "deselect all" request. Single
   * selection has no "select all" - it only resets the current selection.
   *
   * When `emit` is set, the cancellable `igcChange` event is fired *before* any
   * mutation takes place, so cancelling it leaves the selection untouched.
   *
   * @returns Whether the change was committed.
   */
  private _updateSelection(
    items: Item<T> | Item<T>[] | undefined,
    type: 'selection' | 'deselection',
    emit: boolean
  ): boolean {
    const singleSelect = this.singleSelect;
    const selecting = type === 'selection';
    const collection = singleSelect
      ? asArray(items).slice(0, 1)
      : asArray(items);

    if (isEmpty(collection)) {
      if (selecting) {
        this._selected = singleSelect ? new Set() : new Set(this.data);

        if (singleSelect) {
          this._searchTerm = '';
        }
      } else {
        if (
          emit &&
          !this._emitSelectionChange({
            newValue: [],
            items: this.selection,
            type,
          })
        ) {
          return false;
        }

        this._selected.clear();
      }

      this.requestUpdate();
      return true;
    }

    const resolved = this._resolveItems(collection);

    if (
      emit &&
      !this._emitSelectionChange({
        newValue: this._previewValue(resolved, selecting),
        items: resolved,
        type,
      })
    ) {
      return false;
    }

    // Past this point the change is committed - only now is it safe to drop
    // the previous single selection and its search term.
    if (selecting && singleSelect) {
      this._selected.clear();
      this._searchTerm = '';
    }

    for (const item of resolved) {
      selecting ? this._selected.add(item) : this._selected.delete(item);
    }

    this.requestUpdate();
    return true;
  }

  /**
   * Syncs the internal `_selected` set from the current `_formValue`.
   * This is a one-way sync: source of truth (_formValue) → view (_selected).
   */
  private _syncSelectionFromValue(): void {
    this._selected.clear();

    if (!isEmpty(this._formValue.value)) {
      const values = this.singleSelect
        ? asArray(firstOf(this._formValue.value))
        : this._formValue.value;

      if (this.singleSelect && values.length !== this._formValue.value.length) {
        this._formValue.setValueAndFormState(values);
      }

      const index = this._dataIndex;

      for (const value of values) {
        // First match only - mirrors resolving a value against the data source
        const position = index.get(value)?.[0];

        if (position !== undefined) {
          this._selected.add(this.data[position]);
        }
      }
    }

    this._projectSelection();
  }

  protected _syncValueFromSelection(): void {
    this._formValue.setValueAndFormState(this._projectSelection());
    this._setSingleSelectionDisplayValue(this._displayValue);
    this._validate();
    this._listRef.value?.requestUpdate();
  }

  /**
   * The data record rendered at `index`, or undefined when that position holds
   * a group header instead of a selectable option.
   *
   * Guarding on this matters: an unresolvable record would reach
   * {@link _updateSelection} as an empty collection, which reads as
   * "select everything".
   */
  private _recordAt(index: number): T | undefined {
    const record = this._state.dataState[index];
    return record && !record.header ? record.value : undefined;
  }

  private _toggleSelection(index: number): void {
    const record = this._recordAt(index);

    if (!record) {
      return;
    }

    this._updateSelection(
      this._resolveItemValue(record),
      this._selected.has(record) ? 'deselection' : 'selection',
      true
    );

    this._activeIndex = index;
    this._syncValueFromSelection();
  }

  private _selectByIndex(index: number): void {
    const record = this._recordAt(index);

    if (!record) {
      return;
    }

    this._updateSelection(this._resolveItemValue(record), 'selection', true);
    this._activeIndex = index;
    this._syncValueFromSelection();
  }

  private _clearSelection(): void {
    if (this.singleSelect) {
      this._searchTerm = '';
      this._clearSingleSelection();
    } else {
      this._updateSelection([], 'deselection', true);
    }
    this._syncValueFromSelection();
  }

  private _clearSingleSelection(): void {
    const [selection] = this._selected;

    // The form state is reset directly rather than through
    // `_syncValueFromSelection` so that the text the user is currently typing
    // into the main input is left alone.
    if (
      selection &&
      this._updateSelection(
        this._resolveItemValue(selection),
        'deselection',
        true
      )
    ) {
      this._formValue.setValueAndFormState([]);
    }
  }

  // #endregion

  //#region Event handlers

  protected async _handleMainInput({
    detail,
  }: CustomEvent<string>): Promise<void> {
    this._setTouchedState();
    void this._show(true);

    // In single selection mode the main input doubles as the filtering input,
    // so it is the only place `disableFiltering` can be honored.
    if (!this.disableFiltering) {
      this._searchTerm = detail;
    }

    // wait for the dataState to update after filtering
    await this.updateComplete;

    this._activeIndex = this._state.firstItemIndex;
    // clear the selection upon typing
    this._clearSingleSelection();
  }

  protected _handleFocusIn(): void {
    this._setTouchedState();
  }

  protected override _handleBlur(): void {
    if (isEmpty(this._selected)) {
      this._searchTerm = '';
      this._setSingleSelectionDisplayValue('');
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
    this._updateSelection(items, 'selection', false);
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
    this._updateSelection(items, 'deselection', false);
    this._syncValueFromSelection();
  }

  //#endregion

  protected _itemRenderer: ComboRenderFunction<T> = (
    context: VirtualScrollItemContext<ComboRecord<T>>
  ) => {
    const { value: item, index } = context;

    if (this.groupKey && item.header) {
      return html`
        <igc-combo-header part="group-header">
          ${this.groupHeaderTemplate({ item: item.value })}
        </igc-combo-header>
      `;
    }

    const active = this._activeIndex === index;
    const selected = this._selected.has(item.value);

    return html`
      <igc-combo-item
        id=${this._itemId(index)}
        part=${partMap({ item: true, selected, active })}
        aria-setsize=${this._state.itemCount}
        aria-posinset=${item.position}
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
        ${renderSlottedIcon({
          slot: 'toggle-icon',
          icon: this.open ? 'input_collapse' : 'input_expand',
        })}
      </span>
    `;
  }

  private _renderClearIcon() {
    return html`
      <span
        slot="suffix"
        part="clear-icon"
        role="button"
        @click=${this._handleClearIconClick}
        ?hidden=${this.disableClear || isEmpty(this._selected)}
        aria-label=${ifDefined(
          this.resourceStrings.combo_clearItems_placeholder
        )}
      >
        ${renderSlottedIcon({ slot: 'clear-icon', icon: 'input_clear' })}
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
        <igc-virtual-scroll
          ${ref(this._listRef)}
          aria-multiselectable=${!this.singleSelect}
          id="dropdown"
          part="list"
          role="listbox"
          tabindex="0"
          aria-labelledby="target"
          over-scan="15"
          aria-activedescendant=${ifDefined(this._activeDescendant)}
          .data=${this._state.dataState}
          .itemTemplate=${this._itemRenderer}
          ?hidden=${isEmpty(this._state.dataState)}
          @click=${this._itemClickHandler}
        >
        </igc-virtual-scroll>
        ${this._renderEmptyTemplate()}
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  private _renderHelperText(): TemplateResult {
    return this._renderValidationContainer({
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
