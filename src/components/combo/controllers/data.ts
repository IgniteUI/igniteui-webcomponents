import type { ReactiveController } from 'lit';
import { resolveLocale } from '#internals/i18n/locale.js';
import { sameItems } from '#internals/utils/arrays.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';

import type IgcComboComponent from '../combo.js';
import FilterDataOperation from '../operations/filter.js';
import GroupDataOperation from '../operations/group.js';
import type {
  ComboRecord,
  FilteringOptions,
  GroupingOptions,
  Keys,
} from '../types.js';

/** The fields of the combo that the data state reads. */
export type DataStateHost<T extends object> = Pick<
  IgcComboComponent<T>,
  | 'addController'
  | 'requestUpdate'
  | 'data'
  | 'locale'
  | 'filteringOptions'
  | 'valueKey'
  | 'displayKey'
  | 'groupKey'
  | 'groupSorting'
  | 'totalItemCount'
  | 'showSelectAll'
  | 'groupSelection'
  | 'singleSelect'
>;

/** The record of each item to load. See `totalItemCount`. */
const PLACEHOLDER: ComboRecord<never> = Object.freeze({
  value: undefined as never,
  header: false,
  position: -1,
  kind: 'placeholder',
});

/** The record of the select-all option. See `showSelectAll`. */
const SELECT_ALL: ComboRecord<never> = Object.freeze({
  value: undefined as never,
  header: false,
  position: -1,
  kind: 'select-all',
});

/** Whether the record holds an item of `data`. */
export function isItemRecord<T extends object>(
  record?: ComboRecord<T>
): boolean {
  return !!record && !record.header && !record.kind;
}

/* blazorSuppress */
export class DataState<T extends object> implements ReactiveController {
  //#region Internal state
  private readonly _host: DataStateHost<T>;
  private readonly _filtering = new FilterDataOperation<T>();
  private readonly _grouping = new GroupDataOperation<T>();
  private _compareCollator?: Intl.Collator;
  private _collatorLocale?: string;

  /** The data source, indexed into records. See {@link hostUpdate}. */
  private _indexed: ComboRecord<T>[] = [];
  private _source?: T[];
  /** The pipeline inputs of the last check. See {@link _inputsChanged}. */
  private _inputs: unknown[] = [];
  /** The state of each toggle option at {@link _toggleVersion}. See {@link selectionOf}. */
  private readonly _toggleStates = new Map<number, boolean | 'mixed'>();
  private _toggleVersion?: number;

  private _dataState: ComboRecord<T>[] = [];
  private _optionCount = 0;
  private _loadedLength = 0;
  private _searchTerm = '';

  //#endregion

  //#region Public state accessors

  /** Read-only: the virtualized list shares it and it can be the indexed source. */
  public get dataState(): readonly ComboRecord<T>[] {
    return this._dataState;
  }

  /** The number of options in {@link dataState}: the `aria-setsize` of each option. See {@link isOption}. */
  public get optionCount(): number {
    return this._optionCount;
  }

  /** The number of records in {@link dataState} before the placeholders. */
  public get loadedLength(): number {
    return this._loadedLength;
  }

  /**
   * `totalItemCount` as a whole number in remote mode. `Infinity` while it is
   * not set or not a finite number, or in local mode.
   */
  public get totalCount(): number {
    const total = Math.floor(this._host.totalItemCount ?? Number.NaN);

    return this.filteringOptions.mode === 'remote' && Number.isFinite(total)
      ? total
      : Number.POSITIVE_INFINITY;
  }

  /** Whether the group headers are options. See `groupSelection`. */
  public get selectableGroups(): boolean {
    return (
      Boolean(this._host.groupKey) &&
      this._host.groupSelection &&
      !this._host.singleSelect
    );
  }

  /** The index of the first option, or `-1`. See {@link isOption}. */
  public get firstOptionIndex(): number {
    return this._dataState.findIndex((record) => this.isOption(record));
  }

  public set searchTerm(value: string) {
    if (this._searchTerm !== value) {
      this._searchTerm = value;

      // In remote mode, the term does not change the records.
      if (this.filteringOptions.mode !== 'remote') {
        this._host.requestUpdate();
      }
    }
  }

  public get searchTerm(): string {
    return this._searchTerm;
  }

  public get filteringOptions(): FilteringOptions<T> {
    return this._host.filteringOptions;
  }

  public get groupingOptions(): GroupingOptions<T> {
    return {
      valueKey: this._host.valueKey,
      displayKey: this._host.displayKey,
      groupKey: this._host.groupKey as Keys<T>,
      direction: this._host.groupSorting,
    };
  }

  public get compareCollator(): Intl.Collator {
    if (!this._compareCollator) {
      this._collatorLocale = this._host.locale;
      this._compareCollator = new Intl.Collator(
        resolveLocale(this._collatorLocale)
      );
    }

    return this._compareCollator;
  }

  //#endregion

  //#region Lifecycle and pipeline management

  constructor(host: DataStateHost<T>) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Runs the pipeline before render when `data`, the search term or a host
   * field that the pipeline reads changed. The host also calls it to apply
   * such a change before the next update.
   * @returns Whether it built new records.
   * @internal
   */
  public hostUpdate(): boolean {
    const data = this._host.data;
    const changed = this._inputsChanged();

    // An in-place change of `data` does not notify Lit, so check the length
    // here. A replaced element needs a new `data` array.
    if (this._source !== data || this._indexed.length !== data.length) {
      this._source = data;
      this._indexed = this._index(data);
    } else if (!changed) {
      return false;
    }

    this._dataState = this._apply(this._indexed);
    this._toggleStates.clear();
    return true;
  }

  //#endregion

  //#region Internal pipeline operations

  /**
   * Whether the search term or a host field that the pipeline reads changed
   * since the last call. In remote mode, the term and the filter fields other
   * than `mode` do not change the records. A new locale drops the collator.
   */
  private _inputsChanged(): boolean {
    const host = this._host;
    const { filterKey, caseSensitive, matchDiacritics, mode } =
      host.filteringOptions;
    const inputs = [
      host.valueKey,
      host.displayKey,
      host.groupKey,
      host.groupSorting,
      host.totalItemCount,
      host.showSelectAll,
      host.groupSelection,
      host.singleSelect,
      mode,
      ...(mode === 'remote'
        ? []
        : [filterKey, caseSensitive, matchDiacritics, this._searchTerm]),
    ];
    let changed = !sameItems(inputs, this._inputs);

    this._inputs = inputs;

    if (this._compareCollator && this._collatorLocale !== host.locale) {
      this._compareCollator = undefined;
      changed = true;
    }

    return changed;
  }

  /**
   * The records of `data`. Record `value` and `header` are fixed, so a `data`
   * that starts with the indexed items, such as an appended page, keeps their
   * records. The list then keeps their measured sizes. A filter-only run
   * allocates no records. See {@link _apply}.
   */
  private _index(data: T[]): ComboRecord<T>[] {
    const indexed = this._indexed;
    const kept =
      indexed.length <= data.length &&
      indexed.every((record, index) => record.value === data[index])
        ? indexed.length
        : 0;
    const added = data.slice(kept).map((item, index) => ({
      value: item,
      header: false,
      position: kept + index + 1,
    }));

    return kept ? indexed.concat(added) : added;
  }

  /**
   * Filters and groups the indexed source, then numbers the options for
   * `aria-posinset`. Puts the select-all option first, and appends a
   * placeholder for each item of {@link totalCount} that a non-empty `data`
   * does not hold. Only this controller owns the records, so `position`
   * changes in place.
   */
  private _apply(records: ComboRecord<T>[]): ComboRecord<T>[] {
    const result = this._grouping.apply(
      this._filtering.apply(records, this),
      this
    );

    // A group shows only with items, so a result shows items.
    const selectAll =
      result.length > 0 && this._host.showSelectAll && !this._host.singleSelect;

    // The select-all option is the first option.
    let position = selectAll ? 1 : 0;

    for (const record of result) {
      record.position = this.isOption(record) ? ++position : -1;
    }

    // The application loads the first page, so an empty `data` shows the
    // empty message, not placeholders that no request fills.
    const missing = records.length ? this.totalCount - records.length : 0;
    const placeholders = Number.isFinite(missing) && missing > 0 ? missing : 0;

    const head: ComboRecord<T>[] = selectAll ? [SELECT_ALL] : [];

    this._optionCount = position + placeholders;
    this._loadedLength = head.length + result.length;

    if (!(head.length || placeholders)) {
      return result;
    }

    // `result` can be the indexed source, so build a new array.
    const padded = head.concat(result);
    padded.length += placeholders;
    return padded.fill(PLACEHOLDER, this._loadedLength);
  }

  //#endregion

  //#region Public API for host component

  /** Whether the record is an option: not a group header, unless {@link selectableGroups}. */
  public isOption(record: ComboRecord<T>): boolean {
    return !record.header || this.selectableGroups;
  }

  /**
   * Whether the record is an option that toggles the shown items after it:
   * the select-all option, or a group header with {@link selectableGroups}.
   */
  public isToggle(record: ComboRecord<T>): boolean {
    return (
      record.kind === 'select-all' || (record.header && this.selectableGroups)
    );
  }

  /**
   * The end of the records that the toggle option at `index` toggles: the
   * next group header, or the end of the loaded records.
   */
  private _endOf(index: number): number {
    if (!this._dataState[index].header) {
      return this._loadedLength;
    }

    let end = index + 1;

    while (end < this._loadedLength && !this._dataState[end].header) {
      end++;
    }

    return end;
  }

  /** The items of the records from `start` to `end`, each one time. See {@link isItemRecord}. */
  private _itemsIn(start: number, end: number): T[] {
    const records = this._dataState;
    const items = new Set<T>();

    for (let i = start; i < end; i++) {
      if (isItemRecord(records[i])) {
        items.add(records[i].value);
      }
    }

    return [...items];
  }

  /** The items that the list shows. */
  public shownItems(): T[] {
    return this._itemsIn(0, this._loadedLength);
  }

  /** The items that the toggle option at `index` toggles. See {@link isToggle}. */
  public itemsOf(index: number): T[] {
    return this._itemsIn(index + 1, this._endOf(index));
  }

  /**
   * Whether all (`true`), none (`false`) or some (`mixed`) of the items of the
   * toggle option at `index` are in `selected`. These options render on each
   * key and scroll, so with the `version` of `selected`, the state stays until
   * the version changes or the pipeline runs again.
   */
  public selectionOf(
    index: number,
    selected: Pick<ReadonlySet<T>, 'has' | 'size'>,
    version?: number
  ): boolean | 'mixed' {
    if (version === undefined) {
      return this._scanSelection(index, selected);
    }

    if (version !== this._toggleVersion) {
      this._toggleStates.clear();
      this._toggleVersion = version;
    }

    return getOrInsertComputed(this._toggleStates, index, () =>
      this._scanSelection(index, selected)
    );
  }

  /** Stops at the first mix. See {@link selectionOf}. */
  private _scanSelection(
    index: number,
    selected: Pick<ReadonlySet<T>, 'has' | 'size'>
  ): boolean | 'mixed' {
    const records = this._dataState;
    let some = false;
    let every = true;

    if (selected.size) {
      for (let i = index + 1, end = this._endOf(index); i < end; i++) {
        const record = records[i];

        if (!isItemRecord(record)) {
          continue;
        }

        if (selected.has(record.value)) {
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

  //#endregion
}
