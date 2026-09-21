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

  /** The data source, indexed into records. See {@link _isSourceOutdated}. */
  private _indexed: ComboRecord<T>[] = [];
  private _source?: T[];

  private _dataState: ComboRecord<T>[] = [];
  private _itemCount = 0;
  private _searchTerm = '';
  private _dirty = true;

  //#endregion

  //#region Public state accessors

  /**
   * The current state of the data in the combo component.
   *
   * @remarks
   * The collection is shared with the virtualized list and may be the cached
   * indexed source itself, so it is handed out as read-only.
   */
  public get dataState(): readonly ComboRecord<T>[] {
    return this._dataState;
  }

  /** The number of selectable options in {@link dataState}, excluding group headers. */
  public get itemCount(): number {
    return this._itemCount;
  }

  /**
   * The index in {@link dataState} of the first selectable option,
   * or `-1` when there are none.
   */
  public get firstItemIndex(): number {
    return this._dataState.findIndex((record) => !record.header);
  }

  /**
   * Sets the current search term used for filtering the data.
   * Triggers a data pipeline run if the value changes.
   */
  public set searchTerm(value: string) {
    if (this._searchTerm !== value) {
      this._searchTerm = value;
      this.invalidate();
    }
  }

  /** The current search term used for filtering the data. */
  public get searchTerm(): string {
    return this._searchTerm;
  }

  /** The current filtering options for the combo component. */
  public get filteringOptions(): FilteringOptions<T> {
    return this._host.filteringOptions;
  }

  /** The current grouping options for the combo component. */
  public get groupingOptions(): GroupingOptions<T> {
    return {
      valueKey: this._host.valueKey,
      displayKey: this._host.displayKey,
      groupKey: this._host.groupKey as Keys<T>,
      direction: this._host.groupSorting,
    };
  }

  /** The current collator used for comparing values. */
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
   * Lit lifecycle hook - runs before rendering.
   * Executes pipeline if any changes were batched.
   * @internal
   */
  public hostUpdate(): void {
    // A change to the data array in place notifies neither Lit nor
    // `invalidate()`, so a changed length is found here and marks the pipeline
    // dirty. A replaced element of the same length stays unknown and needs a
    // new `data` array.
    if (this._isSourceOutdated()) {
      this._dirty = true;
    }

    this._runPipelineIfDirty();
  }

  /** Whether the indexed source no longer matches the host's data array. */
  private _isSourceOutdated(): boolean {
    const data = this._host.data;
    return this._source !== data || this._indexed.length !== data.length;
  }

  /**
   * Marks the data state as dirty, triggering a pipeline run before next render.
   * This batches multiple changes into a single pipeline execution.
   */
  private _markDirty(): void {
    if (!this._dirty) {
      this._dirty = true;
      this._host.requestUpdate();
    }
  }

  /**
   * Executes the data pipeline if marked dirty.
   * Called during the update lifecycle to batch changes.
   */
  private _runPipelineIfDirty(): void {
    if (!this._dirty) {
      return;
    }

    // The `value` and `header` of a record are fixed for a data item, so the
    // indexed source is built again only if it no longer agrees with the data of
    // the host. A filter-only run, which each keystroke starts, uses it again
    // and allocates no records. Only the derived `position` changes per run.
    // See `_apply`.
    if (this._isSourceOutdated()) {
      this._source = this._host.data;
      this._indexed = this._index(this._source);
    }

    this._dataState = this._apply(this._indexed);
    this._dirty = false;
  }

  //#endregion

  //#region Internal pipeline operations

  /** Converts the raw data items into {@link ComboRecord} objects. */
  private _index(data: T[]): ComboRecord<T>[] {
    return data.map((item, index) => ({
      value: item,
      header: false,
      position: index + 1,
    }));
  }

  /**
   * Filters and groups the indexed source, then numbers the visible options
   * again, so that the `aria-posinset` and `aria-setsize` pair of the list
   * skips the group headers.
   *
   * @remarks
   * `position` is derived view state, and the records belong only to this
   * controller. Each run computes the field before a read, so it is numbered in
   * place. A copy per run would add one allocation to each keystroke.
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

  /**
   * Updates the collator when locale changes.
   */
  public updateLocale(locale: string): void {
    this._compareCollator = new Intl.Collator(locale);
    this._markDirty();
  }

  /**
   * Marks data as dirty when host properties that affect data change.
   */
  public invalidate(): void {
    this._markDirty();
  }

  //#endregion
}
