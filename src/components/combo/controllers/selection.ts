import { isEmpty } from '#internals/utils/arrays.js';
import { isObject } from '#internals/utils/types.js';
import type IgcComboComponent from '../combo.js';
import type { ComboValue, Item } from '../types.js';

/** The fields of the combo that the selection reads. */
export type ComboSelectionHost<T extends object> = Pick<
  IgcComboComponent<T>,
  | 'data'
  | 'valueKey'
  | 'displayKey'
  | 'value'
  | 'singleSelect'
  | 'open'
  | 'selectionCommit'
>;

/**
 * The selected records of the combo: the committed selection, and the pending
 * selection of the confirm mode while the list is open. It resolves values and
 * objects to the records of `data`, and keeps the selected records that `data`
 * does not hold. It sends no events.
 */
export class ComboSelection<T extends object> {
  private readonly _host: ComboSelectionHost<T>;
  private _index?: Map<Item<T>, number[]>;
  private _indexSize = 0;
  private _selected: Set<T> = new Set();
  /** Read it through {@link pending}. */
  private _pending?: Set<T>;

  constructor(host: ComboSelectionHost<T>) {
    this._host = host;
  }

  /** The committed selection: `selection`, `value` and the text of the input. */
  public get selected(): ReadonlySet<T> {
    return this._selected;
  }

  public get confirmMode(): boolean {
    return this._host.selectionCommit === 'confirm' && !this._host.singleSelect;
  }

  /**
   * The pending selection, which exists while the list is open in the confirm
   * mode of `selectionCommit`. It starts as a copy of {@link selected}.
   */
  public get pending(): ReadonlySet<T> | undefined {
    return this._lazyPending;
  }

  /** The selection that the list shows and the user changes. */
  public get current(): ReadonlySet<T> {
    return this._target;
  }

  private get _lazyPending(): Set<T> | undefined {
    if (this._host.open && this.confirmMode) {
      return (this._pending ??= new Set(this._selected));
    }

    this._pending = undefined;
    return undefined;
  }

  /** The set that the changes of the user go to. See {@link current}. */
  private get _target(): Set<T> {
    return this._lazyPending ?? this._selected;
  }

  /** The next read of {@link pending} copies {@link selected} again. */
  public dropPending(): void {
    this._pending = undefined;
  }

  /** Call when `data` or `valueKey` is set. */
  public invalidateIndex(): void {
    this._index = undefined;
  }

  /**
   * Maps each value to the positions of its records, in data-source order.
   * The size check finds in-place growth or shrink, but not a replaced element.
   */
  private get _dataIndex(): Map<Item<T>, number[]> {
    const { data } = this._host;

    if (!this._index || this._indexSize !== data.length) {
      this._index = Map.groupBy(data.keys(), (position) =>
        this.keyOf(data[position])
      );
      this._indexSize = data.length;
    }

    return this._index;
  }

  /** The key of the record in the value index. Unlike {@link _valueOf}, it has no fallback. */
  public keyOf(record: T): Item<T> {
    const { valueKey } = this._host;
    return valueKey ? record[valueKey] : record;
  }

  /** The `valueKey` property of `item`, or `item` when that property is not set. */
  private _valueOf(item: T): ComboValue<T> {
    const { valueKey } = this._host;
    return (valueKey ? item[valueKey] : undefined) ?? item;
  }

  public toValues(items: Iterable<T>): ComboValue<T>[] {
    return Array.from(items, (item) => this._valueOf(item));
  }

  /**
   * Resolves values or objects to records: the records of `data` in
   * data-source order, then the selected records and the objects that `data`
   * does not hold. A repeated value resolves one time, so the change event
   * has no duplicates.
   */
  public resolve(items: Item<T>[]): T[] {
    const { data } = this._host;
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

      // A pending record of the value comes before a committed one.
      selected ??= this._byValue(this._selected.union(this.current));
      const record =
        selected.get(value) ?? (isObject(item) ? (item as T) : undefined);

      if (record) {
        others.add(record);
      }
    }

    return [
      ...Array.from(positions)
        .sort((a, b) => a - b)
        .map((position) => data[position]),
      ...others,
    ];
  }

  /** The values of {@link current} after `records` apply: the `newValue` of the change event. */
  public preview(records: T[], selecting: boolean): ComboValue<T>[] {
    const current = this.current;

    if (selecting) {
      return this.toValues(
        this._host.singleSelect ? records : new Set([...current, ...records])
      );
    }

    const removed = new Set(records);

    return this.toValues(
      Iterator.from(current).filter((item) => !removed.has(item))
    );
  }

  /** Adds `records` to {@link current}, or removes them. */
  public apply(records: T[], selecting: boolean): void {
    const target = this._target;

    for (const item of records) {
      selecting ? target.add(item) : target.delete(item);
    }
  }

  /**
   * While the list has a pending selection, adds the records of the values of
   * `value` that have none to {@link selected}, as a new `data` does. For
   * example, a remote source gives them to `select()`.
   * @returns Whether {@link selected} changed.
   */
  public resolveValues(records: T[]): boolean {
    const { value } = this._host;

    // `selected` has at most one record for each value.
    if (this.pending && this._selected.size < value.length) {
      this._selected = this._recordsOf(
        value,
        new Set(records).union(this._selected)
      );
      return true;
    }

    return false;
  }

  /** Selects all the records of `data`, and keeps the selected records that `data` does not hold. */
  public selectAll(): void {
    const all = new Set(this._host.data).union(this._selectedOutsideData());

    if (this.pending) {
      this._pending = all;
    } else {
      this._selected = all;
    }
  }

  /** Clears the committed selection. The pending selection does not change. */
  public clear(): void {
    this._selected = new Set();
  }

  /** The records that `pending` adds to {@link selected} or removes from it. */
  public changes(pending: ReadonlySet<T>): T[] {
    return [...pending.symmetricDifference(this._selected)];
  }

  /**
   * Makes `pending`, as the host read it before the change event, the
   * committed selection. The `value` setter then gives each value its record.
   */
  public commit(pending: ReadonlySet<T>): void {
    this._selected = new Set(pending);
  }

  /** Gives {@link selected} the records of `values`. A value that `data` does not hold keeps its record. */
  public syncFromValue(values: ComboValue<T>[]): void {
    this._selected = this._recordsOf(values, this._selected);
  }

  /**
   * Before a new `data`: the values that have a record, while the list has a
   * pending selection and some values of `value` have none. Only a value
   * without a record can get a new record. Pass it to {@link syncPending}.
   */
  public knownValues(): Set<ComboValue<T>> | undefined {
    return this.pending && this._selected.size < this._host.value.length
      ? new Set(this.toValues(this._selected))
      : undefined;
  }

  /**
   * After a new `data` and the sync of {@link selected} with `value`: gives the
   * pending selection the records of the new `data`, and the records that the
   * values outside `known` got, because the user could not deselect them.
   */
  public syncPending(known: Set<ComboValue<T>> | undefined): void {
    const pending = this.pending;

    if (pending) {
      const values = this.toValues(pending);

      if (known) {
        values.push(
          ...this.toValues(this._selected).filter((value) => !known.has(value))
        );
      }

      this._pending = this._recordsOf(values, pending);
    }
  }

  /** The values and the display text of {@link selected}, in one pass. */
  public project(): { values: ComboValue<T>[]; text: string } {
    const { displayKey } = this._host;
    const values: ComboValue<T>[] = [];
    const display: string[] = [];

    for (const item of this._selected) {
      values.push(this._valueOf(item));
      display.push(String((displayKey ? item[displayKey] : undefined) ?? item));
    }

    return { values, text: display.join(', ') };
  }

  /** The records of `values`. A value that `data` does not hold keeps its record in `previous`. */
  private _recordsOf(
    values: ComboValue<T>[],
    previous: ReadonlySet<T>
  ): Set<T> {
    const records = new Set<T>();

    if (isEmpty(values)) {
      return records;
    }

    const { data } = this._host;
    const index = this._dataIndex;
    let byValue: Map<ComboValue<T>, T> | undefined;

    for (const value of values) {
      // Only the first record of the value, unlike `resolve()`.
      const position = index.get(value)?.[0];
      const record =
        position === undefined
          ? (byValue ??= this._byValue(previous)).get(value)
          : data[position];

      if (record !== undefined) {
        records.add(record);
      }
    }

    return records;
  }

  /** The selected records whose values `data` does not hold. */
  private _selectedOutsideData(): Set<T> {
    const index = this._dataIndex;

    return new Set(
      Iterator.from(this.current).filter(
        (record) => !index.has(this.keyOf(record))
      )
    );
  }

  private _byValue(selected: ReadonlySet<T>): Map<ComboValue<T>, T> {
    return new Map(
      Iterator.from(selected).map((record): [ComboValue<T>, T] => [
        this._valueOf(record),
        record,
      ])
    );
  }
}
