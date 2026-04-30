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

  private _dataState: ComboRecord<T>[] = [];
  private _searchTerm = '';
  private _dirty = true;

  //#endregion

  //#region Public state accessors

  /** The current state of the data in the combo component. */
  public get dataState(): Readonly<ComboRecord<T>[]> {
    return this._dataState;
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
    this._runPipelineIfDirty();
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
    if (this._dirty) {
      this._dataState = this._apply(Array.from(this._host.data));
      this._dirty = false;
    }
  }

  //#endregion

  //#region Internal pipeline operations

  /**
   * Initial indexing of the data - converts raw data items into ComboRecord format with metadata.
   */
  private _index(data: T[]): ComboRecord<T>[] {
    return data.map((item, index) => ({
      value: item,
      header: false,
      dataIndex: index,
    }));
  }

  /**
   * Applies the data pipeline: indexing, filtering, and grouping.
   */
  private _apply(data: T[]): ComboRecord<T>[] {
    let records = this._index(data);
    records = this._filtering.apply(records, this);
    records = this._grouping.apply(records, this);

    return records;
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
