import { ComboResourceStringsEN } from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { IgcBaseComboBoxComponent } from '#internals/bases/combo-box.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
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
import { isObject } from '#internals/utils/types.js';
import type { Validator } from '#internals/validators.js';
import { all } from '#themes/combo/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import type {
  VirtualScrollItemContext,
  VirtualScrollState,
} from '../virtualization/types.js';
import IgcVirtualScrollComponent, {
  REMOTE_SCROLLING_THRESHOLD,
} from '../virtualization/virtualization.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcComboItemComponent from './combo-item.js';
import { DataState, isItemRecord } from './controllers/data.js';
import { ComboNavigationController } from './controllers/navigation.js';
import { styles } from './themes/combo.base.css.js';
import { styles as shared } from './themes/shared/combo.common.css.js';
import type {
  ComboCloseTrigger,
  ComboGroupHeaderTemplate,
  ComboItemTemplate,
  ComboRecord,
  ComboRenderFunction,
  ComboValue,
  FilteringOptions,
  GroupingDirection,
  IgcComboChangeEventArgs,
  IgcComboClosingEventArgs,
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
  'loading',
  'helper-text',
  'toggle-icon',
  'clear-icon',
  'value-missing',
  'custom-error',
  'invalid'
);

const i18n = {
  defaultEN: ComboResourceStringsEN,
};

const DATA_REQUEST_COUNT = 20;

/* blazorSupportsVisualChildren */
/**
 * The combo lets the user select one or more options from a list. Unlike the select, it shows the options in a
 * virtualized list, so the list can hold thousands of options.
 * The combo supports custom item templates, case-sensitive filtering, grouping and binding to complex data.
 *
 * @element igc-combo
 *
 * @slot prefix - Renders content before the input of the combo.
 * @slot suffix - Renders content after the input of the combo.
 * @slot header - Renders a container before the list of options of the combo.
 * @slot footer - Renders a container after the list of options of the combo.
 * @slot empty - Renders content when the combo dropdown list has no items/data.
 * @slot loading - Renders content that replaces the default spinner while `loading` is set. It is in the input, so a click on it toggles the list, as on the toggle icon.
 * @slot helper-text - Renders content below the input of the combo.
 * @slot toggle-icon - Renders content that replaces the default toggle icon.
 * @slot clear-icon - Renders content that replaces the default clear icon.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted before the user changes the selection. Cancel the event to keep the selection.
 * @fires igcOpening - Emitted before the user opens the list of options. Cancelable.
 * @fires igcOpened - Emitted after the list of options opens on a user action.
 * @fires igcClosing - Emitted before the user closes the list of options. Cancelable. The `trigger` of the detail is the user action that closes the list.
 * @fires igcClosed - Emitted after the list of options closes on a user action. The `trigger` of the detail is the user action that closes the list.
 * @fires igcSearchInput - Emitted when the user changes the text of the search input, or of the main input in single selection mode, and when a selection, a blur or the clear button clears the text.
 * @fires igcDataRequest - Emitted in remote filtering mode when the user scrolls near the end of the options, or to a placeholder of `totalItemCount`. Append the requested items to `data`. It is not emitted again until the length of `data` or the search text changes, or the list opens again.
 *
 * @csspart label - The encapsulated text label of the combo.
 * @csspart input - The main input field of the combo.
 * @csspart native-input - The native input of the main input field of the combo.
 * @csspart prefix - The prefix wrapper of the combo.
 * @csspart suffix - The suffix wrapper of the combo.
 * @csspart toggle-icon - The toggle icon wrapper of the combo.
 * @csspart filled - Added to the toggle-icon part when the combo has a value.
 * @csspart clear-icon - The clear icon wrapper of the combo.
 * @csspart case-icon - The case icon wrapper of the combo.
 * @csspart helper-text - The helper text wrapper of the combo.
 * @csspart filter-input - The wrapper of the search input.
 * @csspart search-input - The search input field of the combo.
 * @csspart list-wrapper - The list of options wrapper of the combo.
 * @csspart list - The list of options box of the combo.
 * @csspart item - Each item in the list of options.
 * @csspart group-header - Each group header in the list of options.
 * @csspart active - Added to the item part when the item is active, to the group-header part when the header is an active option of `groupSelection`, and to the case-icon part while case-sensitive filtering is on.
 * @csspart selected - Added to the item part when the item is selected, and to the group-header part of `groupSelection` when all the shown items of the group are selected.
 * @csspart checkbox - The checkbox of each item in the list.
 * @csspart checkbox-indicator - The checkbox indicator of each item in the list.
 * @csspart checked - Added to the checkbox and checkbox-indicator parts when the checkbox is checked.
 * @csspart indeterminate - Added to the checkbox and checkbox-indicator parts of the select-all option, or of a group header of `groupSelection`, while only some of its shown items are selected.
 * @csspart select-all - Added to the item part of the select-all option.
 * @csspart header - The container holding the header content of the combo.
 * @csspart footer - The container holding the footer content of the combo.
 * @csspart empty - The container holding the empty content of the combo.
 * @csspart loading - The spinner that replaces the toggle icon while `loading` is set. It has the color of the text.
 * @csspart placeholder - Added to the item part of each item to load, which `totalItemCount` adds. Its skeleton has the color of the text.
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
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
      typeof IgcBaseComboBoxComponent
    >(IgcBaseComboBoxComponent)
  ),
  i18n
) {
  public static readonly tagName = 'igc-combo';
  public static override styles = [componentBase, styles, shared];

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

  private readonly _inputRef = createRef<IgcInputComponent>();

  private readonly _searchRef = createRef<IgcInputComponent>();

  private readonly _listRef = createRef<IgcVirtualScrollComponent>();

  private readonly _state = new DataState<T>(this);
  private readonly _navigation = new ComboNavigationController(
    this,
    this._state,
    {
      input: this._inputRef,
      search: this._searchRef,
      list: this._listRef,
      slotted: (slot) => this._slots.getAssignedElements(slot),
      interactions: {
        show: () => this._show(true),
        hide: (trigger) => this._close(trigger),
        toggleSelection: (index: number) => this._selectAt(index, true),
        select: (index: number) => this._selectAt(index, false),
        clearSelection: () => this._clearSelection(),
      },
    }
  );

  private _index?: Map<Item<T>, number[]>;
  private _indexSize = 0;
  private _displayKey?: Keys<T>;
  private _placeholderSearch?: string;
  private _selected: Set<T> = new Set();
  /** The length of `data` at the last `igcDataRequest`. */
  private _lastDataRequest?: number;
  /** The index of the last rendered option, from the list. */
  private _lastRenderedIndex = -1;
  // The `displayKey` setter sets `filterKey`. Both keys are undefined here.
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

  private _itemId(index: number): string {
    const position = index + 1;
    return this.id ? `${this.id}-item-${position}` : `item-${position}`;
  }

  /** Derived from {@link _activeIndex}, so it cannot go stale. */
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

  /**
   * The data source used to generate the list of options. A new data source
   * keeps the selection, also the selected items that it does not hold.
   */
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
   * Whether only one item can be selected. In this mode, the main input
   * filters the list of options.
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
   * Whether the control takes the focus automatically.
   * @attr autofocus
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * Whether the list of options, not the search input, takes the focus when
   * the list opens. It has no effect in single selection mode.
   * @attr autofocus-list
   * @default false
   */
  @property({ type: Boolean, attribute: 'autofocus-list' })
  public autofocusList = false;

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
   * The key in the data source used to display items in the list. Falls back
   * to `valueKey`.
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
   * The sort order of the groups, by their group value. With `none`, the
   * groups keep the order of the data source.
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
   * Whether the search input shows the icon that toggles case-sensitive
   * filtering.
   * @attr case-sensitive-icon
   * @default false
   */
  @property({ type: Boolean, attribute: 'case-sensitive-icon' })
  public caseSensitiveIcon = false;

  /**
   * Whether the filtering of the list of options is disabled. In multiple
   * selection mode, it also hides the search input.
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
   * Whether the clear button is hidden.
   * @attr disable-clear
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-clear' })
  public disableClear = false;

  /**
   * The number of all the items of a remote source, when the source knows it.
   * In remote filtering mode, the list shows a placeholder for each item that
   * `data` does not hold yet, so the scrollbar shows the full list.
   * @attr total-item-count
   */
  @property({ type: Number, attribute: 'total-item-count' })
  public totalItemCount?: number;

  /**
   * Whether the combo loads options. A spinner, which the `loading` slot can
   * replace, then takes the place of the toggle icon, and an empty list shows
   * a loading message instead of the empty message.
   * @attr loading
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public loading = false;

  /**
   * Whether the list starts with an option that selects all the items that it
   * shows, or deselects them when all of them are selected. Only in multiple
   * selection mode.
   * @attr show-select-all
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-select-all' })
  public showSelectAll = false;

  /**
   * Whether a group header is an option that selects the items of its group
   * that the list shows, or deselects them when all of them are selected.
   * Only in multiple selection mode with `groupKey`.
   * @attr group-selection
   * @default false
   */
  @property({ type: Boolean, attribute: 'group-selection' })
  public groupSelection = false;

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
   * @type {ComboGroupHeaderTemplate<T>}
   */
  @property({ attribute: false })
  public groupHeaderTemplate: ComboGroupHeaderTemplate<T> = (group) =>
    html`${group.key}`;

  /**
   * The values of the selected items. With a `valueKey`, each value is that
   * field of an item. Without it, each value is the item itself.
   *
   * The `value` attribute takes a JSON array. For a data source of objects,
   * set `valueKey` to select items through the attribute.
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
   * The values of the selected items. With a `valueKey`, each value is that
   * field of an item. Without it, each value is the item itself.
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

    // Projects combobox semantics onto the native input. `aria-activedescendant`
    // stays on the listbox, which has focus during list navigation.
    addAriaProjector(this, {
      target: () => this._inputRef.value,
      state: () => ({
        role: 'combobox',
        hasPopup: 'listbox',
        expanded: `${this.open}`,
        controls: this._listRef.value ? [this._listRef.value] : null,
      }),
      fallbackLabel: () => this._mainAriaLabel,
    });
    addSafeEventListener(this, 'blur', this._handleBlur);
    addSafeEventListener(this, 'focusin', this._setTouchedState);
  }

  protected override willUpdate(props: PropertyValues<this>): void {
    super.willUpdate(props);

    if (props.has('locale')) {
      this._state.updateLocale();
    }

    // The closed list is inert, so the focus in it would fall to the
    // document. Move it to the input first.
    if (
      props.has('open') &&
      !this.open &&
      this.renderRoot.querySelector('[part="list-wrapper"]:focus-within')
    ) {
      this.focus({ preventScroll: true });
    }

    // The select-all option moves the other records by one, and an active
    // group header can stop being an option.
    if (
      (props.has('showSelectAll') || props.has('groupSelection')) &&
      this.hasUpdated
    ) {
      this._activeIndex = -1;
    }

    if (
      props.has('groupKey') ||
      props.has('groupSorting') ||
      props.has('filteringOptions') ||
      props.has('totalItemCount') ||
      props.has('showSelectAll') ||
      props.has('groupSelection') ||
      props.has('singleSelect') ||
      props.has('data')
    ) {
      this._state.invalidate();
    }

    // Sync the selection when `data` comes after `value`.
    if (props.has('data') && !isEmpty(this.data) && !isEmpty(this.value)) {
      this._withPristine(() => {
        this._syncSelectionFromValue();
        this._formValue.setValueAndFormState(this.value);
      });
    }
  }

  protected override updated(props: PropertyValues<this>): void {
    const opened = props.has('open') && this.open;
    const replaced =
      props.has('data') && props.get('data')?.[0] !== this.data[0];

    // An opening, or a replaced `data` rather than an appended one, starts a
    // new sequence of requests. Opening again also retries a failed request.
    if (opened || replaced) {
      this._lastDataRequest = undefined;
    }

    // The list reports a changed window after its own update, and an
    // unchanged one not at all, so check against the window after it.
    if (opened || props.has('data') || props.has('totalItemCount')) {
      void this._listRef.value?.updateComplete.then(() =>
        this._checkDataRequest()
      );
    }
  }

  //#endregion

  // #region Form Associated overrides

  protected override _setDefaultValue(current: string | null): void {
    try {
      this.defaultValue = JSON.parse(current || '[]');
    } catch {
      // A malformed `value` attribute keeps the previous default.
    }
  }

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    // A form reset never reaches the input in the shadow root, which validates
    // the forwarded `required` on its own.
    this._inputRef.value?.['_resetValidationState']();
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

  protected override async _hide(
    emitEvent = false,
    detail?: IgcComboClosingEventArgs
  ): Promise<boolean> {
    const [canClose, _] = await Promise.all([
      super._hide(emitEvent, detail),
      this.updateComplete,
    ]);

    if (canClose) {
      this._activeIndex = -1;
    }

    return canClose;
  }

  /** Closes the list on a user action, which the close events report. */
  private _close(trigger: ComboCloseTrigger): Promise<boolean> {
    return this._hide(true, { trigger });
  }

  /**
   * Requests more data while the open list renders near the end of `data`,
   * or renders placeholders, up to `totalItemCount`. The `count` covers the
   * rendered placeholders. An empty `data` waits for the first page from the
   * application.
   */
  private _checkDataRequest(): void {
    const { length } = this.data;
    const { loadedLength, totalCount } = this._state;

    if (
      !this.open ||
      !length ||
      this.filteringOptions.mode !== 'remote' ||
      this._lastDataRequest === length ||
      length >= totalCount ||
      this._lastRenderedIndex < loadedLength - REMOTE_SCROLLING_THRESHOLD
    ) {
      return;
    }

    const rendered = this._lastRenderedIndex - loadedLength + 1;

    this._lastDataRequest = length;
    this.emitEvent('igcDataRequest', {
      detail: {
        startIndex: length,
        count: Math.min(
          totalCount - length,
          Math.max(DATA_REQUEST_COUNT, rendered)
        ),
      },
    });
  }

  private _setSingleSelectionDisplayValue(value: string): void {
    if (this.singleSelect && this._inputRef.value) {
      this._inputRef.value.value = value;
    }
  }

  //#endregion

  // #region Selection helpers

  /**
   * Maps each value to the positions of its records, in data-source order.
   * The size check finds in-place growth or shrink, but not a replaced element.
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
   * Resolves values or objects to records: the records of `data` in
   * data-source order, then the selected records and the objects that `data`
   * does not hold. A repeated value resolves one time, so the change event
   * has no duplicates.
   */
  private _resolveItems(items: Item<T>[]): T[] {
    const index = this._dataIndex;
    const positions = new Set<number>();
    const others = new Set<T>();
    let selected: Map<ComboValue<T>, T> | undefined;

    for (const item of items) {
      const value = isObject(item) ? this._valueOf(item as T) : item;
      const found = index.get(value);

      if (found) {
        for (const position of found) {
          positions.add(position);
        }
        continue;
      }

      selected ??= this._selectedByValue();
      const record =
        selected.get(value) ?? (isObject(item) ? (item as T) : undefined);

      if (record) {
        others.add(record);
      }
    }

    return [
      ...Array.from(positions)
        .sort((a, b) => a - b)
        .map((position) => this.data[position]),
      ...others,
    ];
  }

  /** The selected records whose values `data` does not hold. */
  private _selectedOutsideData(): Set<T> {
    const index = this._dataIndex;

    return new Set(
      Iterator.from(this._selected).filter(
        (record) => !index.has(this._resolveItemValue(record))
      )
    );
  }

  private _selectedByValue(
    selected: Set<T> = this._selected
  ): Map<ComboValue<T>, T> {
    return new Map(
      Iterator.from(selected).map((record): [ComboValue<T>, T] => [
        this._valueOf(record),
        record,
      ])
    );
  }

  private _resolveItemValue(record: T): Item<T> {
    return this.valueKey ? record[this.valueKey] : record;
  }

  /** The `valueKey` property of `item`, or `item` when that property is not set. */
  private _valueOf(item: T): ComboValue<T> {
    return (this.valueKey ? item[this.valueKey] : undefined) ?? item;
  }

  private _toValues(items: Iterable<T>): ComboValue<T>[] {
    return Array.from(items, (item) => this._valueOf(item));
  }

  /** Recomputes {@link _displayValue} and returns the selection values in one pass. */
  private _projectSelection(): ComboValue<T>[] {
    const { displayKey } = this;
    const values: ComboValue<T>[] = [];
    const display: string[] = [];

    for (const item of this._selected) {
      values.push(this._valueOf(item));
      display.push(String((displayKey ? item[displayKey] : undefined) ?? item));
    }

    this._displayValue = display.join(', ');
    return values;
  }

  private _emitSelectionChange(detail: IgcComboChangeEventArgs): boolean {
    return this.emitEvent('igcChange', { cancelable: true, detail });
  }

  /** The selection value after `resolved` applies: the `igcChange` `newValue`. */
  private _previewValue(resolved: T[], selecting: boolean): ComboValue<T>[] {
    if (selecting) {
      return this._toValues(
        this.singleSelect ? resolved : new Set([...this._selected, ...resolved])
      );
    }

    const removed = new Set(resolved);

    return this._toValues(
      Iterator.from(this._selected).filter((item) => !removed.has(item))
    );
  }

  /**
   * An empty collection selects or deselects all. Single selection only clears.
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

    if (isEmpty(collection) && selecting) {
      // Selects all items without an event, or clears a single selection.
      this._selected = singleSelect
        ? new Set()
        : new Set(this.data).union(this._selectedOutsideData());

      if (singleSelect) {
        this._searchTerm = '';
      }

      this.requestUpdate();
      return true;
    }

    // An empty deselection deselects every selected item.
    const resolved = isEmpty(collection)
      ? this.selection
      : this._resolveItems(collection);

    return this._applySelection(resolved, type, emit);
  }

  /**
   * Selects or deselects exactly `records`. With `emit`, `igcChange` can
   * cancel the change.
   * @returns Whether the change was committed.
   */
  private _applySelection(
    records: T[],
    type: 'selection' | 'deselection',
    emit: boolean
  ): boolean {
    const selecting = type === 'selection';

    if (
      emit &&
      !this._emitSelectionChange({
        newValue: this._previewValue(records, selecting),
        items: records,
        type,
      })
    ) {
      return false;
    }

    // The change is committed, so drop the previous single selection and search term.
    if (selecting && this.singleSelect) {
      this._selected.clear();
      this._clearSearchTerm(emit);
    }

    for (const item of records) {
      selecting ? this._selected.add(item) : this._selected.delete(item);
    }

    this.requestUpdate();
    return true;
  }

  /**
   * One-way sync from `_formValue` to `_selected`. A value that `data` does
   * not hold keeps its selected record.
   */
  private _syncSelectionFromValue(): void {
    const selected = this._selected;
    let previous: Map<ComboValue<T>, T> | undefined;
    this._selected = new Set();

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
        const record =
          position === undefined
            ? (previous ??= this._selectedByValue(selected)).get(value)
            : this.data[position];

        if (record !== undefined) {
          this._selected.add(record);
        }
      }
    }

    this._projectSelection();
    // The list does not update for a new `value` on its own.
    this._listRef.value?.requestUpdate();
  }

  protected _syncValueFromSelection(): void {
    this._formValue.setValueAndFormState(this._projectSelection());
    this._setSingleSelectionDisplayValue(this._displayValue);
    this._validate();
    this._listRef.value?.requestUpdate();
  }

  /** The items of the records from `start` to `end`, each one time. See {@link isItemRecord}. */
  private _itemsIn(start: number, end: number): T[] {
    const records = this._state.dataState;
    const items = new Set<T>();

    for (let i = start; i < end; i++) {
      if (isItemRecord(records[i])) {
        items.add(records[i].value);
      }
    }

    return [...items];
  }

  /** The items that the list shows. */
  private _shownItems(): T[] {
    // Applies a change of `data` or of the search text that no update has
    // applied yet. The update gives the new records to the list before it
    // renders the selection.
    this._state.hostUpdate();
    this.requestUpdate();

    return this._itemsIn(0, this._state.loadedLength);
  }

  /**
   * Selects the record at `index`. With `toggle`, deselects a selected one.
   * A toggle option toggles its items. See {@link DataState.isToggle}.
   * @returns Whether `index` holds an item or a toggle option.
   */
  private _selectAt(index: number, toggle: boolean): boolean {
    const record = this._state.dataState[index];

    if (isItemRecord(record)) {
      const item = record.value;

      // The record itself, as an item without a value would select all.
      this._applySelection(
        [item],
        toggle && this._selected.has(item) ? 'deselection' : 'selection',
        true
      );
    } else if (record && this._state.isToggle(record)) {
      this._toggleItemsOf(index);
    } else {
      return false;
    }

    this._activeIndex = index;
    this._syncValueFromSelection();
    return true;
  }

  /**
   * Selects the items of the toggle option at `index`, or deselects them when
   * all of them are selected, with one `igcChange` for the items that change.
   */
  private _toggleItemsOf(index: number): void {
    const items = this._itemsIn(index + 1, this._state.endOf(index));
    const unselected = items.filter((item) => !this._selected.has(item));

    this._applySelection(
      unselected.length ? unselected : items,
      unselected.length ? 'selection' : 'deselection',
      true
    );
  }

  /**
   * Whether all (`true`), none (`false`) or some (`mixed`) of the items of the
   * toggle option at `index` are selected. Stops at the first mix, because
   * these options render often.
   */
  private _selectionOf(index: number): boolean | 'mixed' {
    const records = this._state.dataState;
    let some = false;
    let every = true;

    if (this._selected.size) {
      for (let i = index + 1, end = this._state.endOf(index); i < end; i++) {
        const record = records[i];

        if (!isItemRecord(record)) {
          continue;
        }

        if (this._selected.has(record.value)) {
          some = true;
        } else {
          every = false;
        }

        if (some && !every) {
          return 'mixed';
        }
      }
    }

    return some;
  }

  private _clearSelection(): void {
    if (this.singleSelect) {
      this._clearSearchTerm(true);
      this._clearSingleSelection();
    } else {
      this._updateSelection([], 'deselection', true);
    }
    this._syncValueFromSelection();
  }

  private _clearSingleSelection(): void {
    const [selection] = this._selected;

    // Reset the form state directly, not through `_syncValueFromSelection`, to
    // keep the text the user types in the main input.
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

  protected async _handleMainInput(event: CustomEvent<string>): Promise<void> {
    event.stopPropagation();
    this._setTouchedState();
    void this._show(true);

    // In single selection the main input filters, so honor `disableFiltering` here.
    if (!this.disableFiltering) {
      this._searchTerm = event.detail;
      this._emitSearchInput(event.detail);
    }

    // wait for the dataState to update after filtering
    await this.updateComplete;

    // Remote results come later, so no option of the old results becomes active.
    this._activeIndex =
      this.filteringOptions.mode === 'remote'
        ? -1
        : this._state.firstOptionIndex;
    this._clearSingleSelection();
  }

  protected override _handleBlur(): void {
    if (isEmpty(this._selected)) {
      this._clearSearchTerm(true);
      this._setSingleSelectionDisplayValue('');
    }
    super._handleBlur();
  }

  protected _handleSearchInput(event: CustomEvent<string>): void {
    event.stopPropagation();
    this._searchTerm = event.detail;
    this._emitSearchInput(event.detail);
  }

  /** With `emit`, a user action clears the text, so `igcSearchInput` reports it. */
  private _clearSearchTerm(emit: boolean): void {
    if (emit && this._searchTerm) {
      this._emitSearchInput('');
    }

    this._searchTerm = '';
  }

  private _emitSearchInput(searchText: string): void {
    // A new search starts a new sequence of data requests.
    this._lastDataRequest = undefined;
    this.emitEvent('igcSearchInput', { detail: { searchText } });
  }

  private _handleListStateChange(event: CustomEvent<VirtualScrollState>): void {
    event.stopPropagation();
    this._lastRenderedIndex = event.detail.endIndex;
    this._checkDataRequest();
  }

  private async _itemClickHandler(event: PointerEvent): Promise<void> {
    const target = getElementFromPath(IgcComboItemComponent.tagName, event);

    if (!target) {
      return;
    }

    this._setTouchedState();

    // A placeholder selects nothing, so a click keeps the list open.
    if (!this._selectAt(target.index, true)) {
      return;
    }

    if (this.singleSelect) {
      this._inputRef.value?.focus();
      await this._close('selection');
    } else {
      this._searchRef.value?.focus();
    }
  }

  protected override _handleAnchorClick(): void {
    this.open ? this._close('toggle') : this._show(true);
  }

  protected override _handleClosing(): void {
    this._close('outside-click');
  }

  private _handleScrollClose(): void {
    this._close('scroll');
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
   * Selects options in the list by reference or by `valueKey` value. It does
   * not emit `igcChange`. An object that `data` does not hold is selected as
   * it is. Without an argument, it selects all the items of `data`, or clears
   * the selection in single selection mode.
   * @param { Item<T> | Item<T>[] } items - One or more items to select. Pass multiple items as an array.
   * With a `valueKey`, pass the value of an item instead of its reference.
   *
   * @example
   * ```typescript
   * const combo = document.querySelector('igc-combo')!;
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
   * Deselects options in the list by reference or by `valueKey` value. It
   * does not emit `igcChange`. Without an argument, it deselects all items.
   * @param { Item<T> | Item<T>[] } items - One or more items to deselect. Pass multiple items as an array.
   * With a `valueKey`, pass the value of an item instead of its reference.
   *
   * @example
   * ```typescript
   * const combo = document.querySelector('igc-combo')!;
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

  /**
   * Selects all the items that the list shows. It does not emit `igcChange`,
   * and does nothing in single selection mode.
   * @param {boolean} [ignoreFilter=false] - Whether to select all the items of `data`.
   */
  public selectAllItems(ignoreFilter = false): void {
    if (this.singleSelect) {
      return;
    }

    if (ignoreFilter) {
      this.select();
      return;
    }

    this._applySelection(this._shownItems(), 'selection', false);
    this._syncValueFromSelection();
  }

  /**
   * Deselects all the items that the list shows. It does not emit `igcChange`.
   * @param {boolean} [ignoreFilter=false] - Whether to deselect all the items.
   */
  public deselectAllItems(ignoreFilter = false): void {
    if (ignoreFilter) {
      this.deselect();
      return;
    }

    this._applySelection(this._shownItems(), 'deselection', false);
    this._syncValueFromSelection();
  }

  //#endregion

  protected _itemRenderer: ComboRenderFunction<T> = (
    context: VirtualScrollItemContext<ComboRecord<T>>
  ) => {
    const { value: item, index } = context;

    if (this.groupKey && item.header) {
      const content = this.groupHeaderTemplate({
        key: item.group,
        item: item.value,
      });

      return this._state.isToggle(item)
        ? this._renderToggleOption(item, index, content)
        : html`<igc-combo-header part="group-header"
            >${content}</igc-combo-header
          >`;
    }

    if (item.kind === 'select-all') {
      return this._renderToggleOption(
        item,
        index,
        this.resourceStrings.combo_select_all
      );
    }

    const active = this._activeIndex === index;

    const selected = this._selected.has(item.value);
    // One template for both, so a row keeps its element when its item loads.
    const placeholder = item.kind === 'placeholder';
    const { optionCount } = this._state;
    // The placeholders are last and share one record, so the index gives their position.
    const position = placeholder
      ? optionCount - context.count + index + 1
      : item.position;

    return html`
      <igc-combo-item
        id=${this._itemId(index)}
        part=${partMap({ item: true, placeholder, selected, active })}
        aria-setsize=${optionCount}
        aria-posinset=${position}
        aria-disabled=${bindIf(placeholder, 'true')}
        aria-label=${bindIf(placeholder, this.resourceStrings.combo_loading)}
        exportparts="checkbox, checkbox-indicator, checked"
        .index=${index}
        ?active=${active}
        ?selected=${selected}
        ?hide-checkbox=${this.singleSelect}
      >
        ${
          placeholder
            ? // Bars of three lengths look like text.
              html`<span
                style=${styleMap({ inlineSize: `${45 + (index % 3) * 15}%` })}
              ></span>`
            : this.itemTemplate({ item: item.value })
        }
      </igc-combo-item>
    `;
  };

  /**
   * A toggle option: the select-all option or a group header option. Like the
   * other options, it reports only `aria-selected`, so the mixed state of its
   * items shows only on its checkbox.
   */
  private _renderToggleOption(
    { header, position }: ComboRecord<T>,
    index: number,
    content: unknown
  ): TemplateResult {
    const state = this._selectionOf(index);
    const all = state === true;
    const active = this._activeIndex === index;

    return html`
      <igc-combo-item
        id=${this._itemId(index)}
        part=${partMap({
          item: !header,
          'select-all': !header,
          'group-header': header,
          selected: all,
          active,
        })}
        aria-setsize=${this._state.optionCount}
        aria-posinset=${header ? position : 1 /* The select-all option is first. */}
        exportparts="checkbox, checkbox-indicator, checked, indeterminate"
        .index=${index}
        ?active=${active}
        ?selected=${all}
        ?indeterminate=${state === 'mixed'}
      >
        ${content}
      </igc-combo-item>
    `;
  }

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
        <slot name="loading" ?hidden=${!this.loading}>
          <span
            part="loading"
            role="progressbar"
            aria-label=${this.resourceStrings.combo_loading!}
          ></span>
        </slot>
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
          @igcChange=${stopPropagation}
        >
          <igc-icon
            slot=${bindIf(
              this.caseSensitiveIcon && this.filteringOptions.mode !== 'remote',
              'suffix'
            )}
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
        ${this.loading ? this.resourceStrings.combo_loading : nothing}
        <slot name="empty" ?hidden=${this.loading}>
          ${this.resourceStrings.combo_empty_message}
        </slot>
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
          @igcStateChange=${this._handleListStateChange}
          @igcDataRequest=${stopPropagation}
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
    return IgcValidationContainerComponent.create(this, {
      id: 'combo-helper-text',
      hasHelperText: true,
    });
  }

  protected override render() {
    return html`
      <igc-popover
        ?open=${this.open}
        flip
        same-width
        .scrollStrategy=${this.scrollStrategy}
        @igcPopoverScrollClose=${this._handleScrollClose}
      >
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
