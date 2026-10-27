import type { ReactiveController } from 'lit';
import { resolveLocale } from '#internals/i18n/locale.js';

import FilterDataOperation from '../operations/filter.js';
import GroupDataOperation from '../operations/group.js';
import type {
  ComboHost,
  ComboRecord,
  FilteringOptions,
  GroupingOptions,
  Keys,
} from '../types.js';

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
  private readonly _host: ComboHost<T>;
  private readonly _filtering = new FilterDataOperation<T>();
  private readonly _grouping = new GroupDataOperation<T>();
  private _compareCollator?: Intl.Collator;

  /** The data source, indexed into records. See {@link hostUpdate}. */
  private _indexed: ComboRecord<T>[] = [];
  private _source?: T[];

  private _dataState: ComboRecord<T>[] = [];
  private _optionCount = 0;
  private _loadedLength = 0;
  private _searchTerm = '';
  private _dirty = true;

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
  private get _selectableGroups(): boolean {
    return this._host.groupSelection && !this._host.singleSelect;
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
        this.invalidate();
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
    return (this._compareCollator ??= new Intl.Collator(
      resolveLocale(this._host.locale)
    ));
  }

  //#endregion

  //#region Lifecycle and pipeline management

  constructor(host: ComboHost<T>) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Runs the pipeline before render when changes are batched.
   * @internal
   */
  public hostUpdate(): void {
    const data = this._host.data;

    // An in-place change of `data` notifies neither Lit nor `invalidate()`, so
    // check the length here. A replaced element needs a new `data` array.
    // Record `value` and `header` are fixed, so rebuild the index only when the
    // host data changes. A filter-only run allocates no records. See `_apply`.
    if (this._source !== data || this._indexed.length !== data.length) {
      this._source = data;
      this._indexed = this._index(data);
    } else if (!this._dirty) {
      return;
    }

    this._dataState = this._apply(this._indexed);
    this._dirty = false;
  }

  //#endregion

  //#region Internal pipeline operations

  private _index(data: T[]): ComboRecord<T>[] {
    return data.map((item, index) => ({
      value: item,
      header: false,
      position: index + 1,
    }));
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

  /** Whether the record is an option: not a group header, unless {@link _selectableGroups}. */
  public isOption(record: ComboRecord<T>): boolean {
    return !record.header || this._selectableGroups;
  }

  /**
   * Whether the record is an option that toggles the shown items after it:
   * the select-all option, or a group header with {@link _selectableGroups}.
   */
  public isToggle(record: ComboRecord<T>): boolean {
    return (
      record.kind === 'select-all' || (record.header && this._selectableGroups)
    );
  }

  /**
   * The end of the records that the toggle option at `index` toggles: the
   * next group header, or the end of the loaded records.
   */
  public endOf(index: number): number {
    if (!this._dataState[index].header) {
      return this._loadedLength;
    }

    let end = index + 1;

    while (end < this._loadedLength && !this._dataState[end].header) {
      end++;
    }

    return end;
  }

  /** Only group sorting uses the collator, so the data changes only if it exists. */
  public updateLocale(): void {
    if (this._compareCollator) {
      this._compareCollator = undefined;
      this.invalidate();
    }
  }

  /**
   * Call when a host property that affects the data changes. Batches the
   * changes into one pipeline run before the next render.
   */
  public invalidate(): void {
    if (!this._dirty) {
      this._dirty = true;
      this._host.requestUpdate();
    }
  }

  //#endregion
}
