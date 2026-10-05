import type { ReactiveController } from 'lit';

import FilterDataOperation from '../operations/filter.js';
import GroupDataOperation from '../operations/group.js';
import type {
  ComboHost,
  ComboRecord,
  FilteringOptions,
  GroupingOptions,
  Keys,
} from '../types.js';

/* blazorSuppress */
export class DataState<T extends object> implements ReactiveController {
  //#region Internal state
  private readonly _host: ComboHost<T>;
  private readonly _filtering = new FilterDataOperation<T>();
  private readonly _grouping = new GroupDataOperation<T>();
  private _compareCollator: Intl.Collator;

  /** The data source, indexed into records. See {@link hostUpdate}. */
  private _indexed: ComboRecord<T>[] = [];
  private _source?: T[];

  private _dataState: ComboRecord<T>[] = [];
  private _itemCount = 0;
  private _searchTerm = '';
  private _dirty = true;

  //#endregion

  //#region Public state accessors

  /** Read-only: the virtualized list shares it and it can be the indexed source. */
  public get dataState(): readonly ComboRecord<T>[] {
    return this._dataState;
  }

  /** The number of selectable options in {@link dataState}, excluding group headers. */
  public get itemCount(): number {
    return this._itemCount;
  }

  /** The index of the first selectable option in {@link dataState}, or `-1`. */
  public get firstItemIndex(): number {
    return this._dataState.findIndex((record) => !record.header);
  }

  public set searchTerm(value: string) {
    if (this._searchTerm !== value) {
      this._searchTerm = value;
      this.invalidate();
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
    return this._compareCollator;
  }

  //#endregion

  //#region Lifecycle and pipeline management

  constructor(host: ComboHost<T>) {
    this._host = host;
    this._host.addController(this);
    this._compareCollator = new Intl.Collator(this._host.locale);
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
   * Filters and groups the indexed source, then numbers the visible options,
   * so `aria-posinset` and `aria-setsize` skip the group headers.
   * Only this controller owns the records, so `position` changes in place.
   */
  private _apply(records: ComboRecord<T>[]): ComboRecord<T>[] {
    const result = this._grouping.apply(
      this._filtering.apply(records, this),
      this
    );

    let position = 0;

    for (const record of result) {
      if (!record.header) {
        record.position = ++position;
      }
    }

    this._itemCount = position;

    return result;
  }

  //#endregion

  //#region Public API for host component

  public updateLocale(locale: string): void {
    this._compareCollator = new Intl.Collator(locale);
    this.invalidate();
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
