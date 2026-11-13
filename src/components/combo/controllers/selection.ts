import { isEmpty, startsWith } from '#internals/utils/arrays.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import { isObject } from '#internals/utils/types.js';
import type IgcComboComponent from '../combo.js';
import type { ComboValue, Item } from '../types.js';

const newPositions = (): number[] => [];

/** The fields of the combo that the selection reads. */
export type ComboSelectionHost<T extends object> = Pick<
  IgcComboComponent<T>,
  | 'data'
  | 'valueKey'
  | 'displayKey'
  | 'singleSelect'
  | 'open'
  | 'selectionCommit'
>;

/**
 * The values of a selection in order, each with its record, or `undefined` for
 * a value that has no record yet.
 */
export type SelectionEntries<T extends object> = Map<
  ComboValue<T>,
  T | undefined
>;

/**
 * The selected values and records of the combo: the committed selection, and
 * the pending selection of the confirm mode while the list is open. It
 * resolves values and objects to the records of `data`, and keeps the selected
 * records and the values that `data` does not hold. One record for each value.
 * It sends no events.
 */
export class ComboSelection<T extends object> {
  private readonly _host: ComboSelectionHost<T>;
  private _index?: Map<Item<T>, number[]>;
  /** The items of {@link _index}. See {@link _dataIndex}. */
  private _indexed: T[] = [];
  private _indexStale = false;
  private _version = 0;
  /** The committed selection: `value`, `selection` and the text of the input. */
  private _committed: SelectionEntries<T> = new Map();
  /** Read it through {@link pending}. */
  private _pending?: SelectionEntries<T>;

  constructor(host: ComboSelectionHost<T>) {
    this._host = host;
  }

  /** The records of the committed selection: `selection`. */
  public get selected(): T[] {
    return this.recordsOf(this._committed);
  }

  /** Whether the committed selection has a record. */
  public get hasRecords(): boolean {
    return Iterator.from(this._committed.values()).some(
      (record) => record !== undefined
    );
  }

  /** Changes when the records of the committed or the pending selection can change. */
  public get version(): number {
    return this._version;
  }

  public get confirmMode(): boolean {
    return this._host.selectionCommit === 'confirm' && !this._host.singleSelect;
  }

  /**
   * The pending selection, which exists while the list is open in the confirm
   * mode of `selectionCommit`. It starts as a copy of the committed selection.
   */
  public get pending(): ReadonlyMap<ComboValue<T>, T | undefined> | undefined {
    return this._lazyPending;
  }

  private get _lazyPending(): SelectionEntries<T> | undefined {
    if (this._host.open && this.confirmMode) {
      this._pending ??= new Map(this._committed);
      return this._pending;
    }

    this.dropPending();
    return undefined;
  }

  /** The selection that the list shows and the user changes. */
  private get _current(): SelectionEntries<T> {
    return this._lazyPending ?? this._committed;
  }

  /** The number of values of the selection that the list shows. */
  public get size(): number {
    return this._current.size;
  }

  /**
   * Whether the value of `record` has a record in the selection that the list
   * shows, so a record that repeats a selected value shows as selected too.
   */
  public has(record: T): boolean {
    return this._current.get(this._valueOf(record)) !== undefined;
  }

  /** The records of the selection that the list shows. */
  public currentRecords(): T[] {
    return this.recordsOf(this._current);
  }

  /** The records of `entries`, in order. */
  public recordsOf(entries: ReadonlyMap<ComboValue<T>, T | undefined>): T[] {
    return Iterator.from(entries.values())
      .filter((record) => record !== undefined)
      .toArray();
  }

  /** The next read of {@link pending} copies the committed selection again. */
  public dropPending(): void {
    if (this._pending) {
      this._pending = undefined;
      this._version++;
    }
  }

  /** Call when `data` is set, also to the same array. */
  public invalidateIndex(): void {
    this._indexStale = true;
  }

  /** Call when `valueKey` changes: the records get their new values. */
  public rekey(): void {
    this._index = undefined;
    this._committed = this._rekeyed(this._committed);

    if (this._pending) {
      this._pending = this._rekeyed(this._pending);
    }

    this._version++;
  }

  /** A value without a record keeps its value. A repeated value keeps its first record. */
  private _rekeyed(entries: SelectionEntries<T>): SelectionEntries<T> {
    const next: SelectionEntries<T> = new Map();

    for (const [value, record] of entries) {
      const key = record === undefined ? value : this._valueOf(record);

      if (!next.has(key)) {
        next.set(key, record);
      }
    }

    return next;
  }

  /**
   * Maps each value to the positions of its records, in data-source order. It
   * keeps a copy of the indexed items, so a `data` that starts with them, such
   * as an appended page, adds only the new items. A replaced element shows
   * only after a set of `data` or a change of its length.
   */
  private get _dataIndex(): Map<Item<T>, number[]> {
    const { data } = this._host;
    let index = this._index;
    let indexed = this._indexed;

    if (index && !this._indexStale && indexed.length === data.length) {
      return index;
    }

    if (!(index && startsWith(data, indexed))) {
      index = this._index = new Map();
      indexed = this._indexed = [];
    }

    for (let position = indexed.length; position < data.length; position++) {
      getOrInsertComputed(index, this.keyOf(data[position]), newPositions).push(
        position
      );
      indexed.push(data[position]);
    }

    this._indexStale = false;
    return index;
  }

  /** The first record of `value` in `data`. */
  private _recordOf(value: ComboValue<T>): T | undefined {
    const position = this._dataIndex.get(value)?.[0];
    return position === undefined ? undefined : this._host.data[position];
  }

  /** The key of the record in the value index. Unlike {@link _valueOf}, it has no fallback. */
  public keyOf(record: T): Item<T> {
    const { valueKey } = this._host;
    return valueKey ? record[valueKey] : record;
  }

  /** The `valueKey` property of `item`, or `item` when that property is not set. */
  private _valueOf(item: T): ComboValue<T> {
    const { valueKey } = this._host;
    return (valueKey ? item?.[valueKey] : undefined) ?? item;
  }

  public toValues(items: Iterable<T>): ComboValue<T>[] {
    return Array.from(items, (item) => this._valueOf(item));
  }

  private _toValue(item: Item<T>): ComboValue<T> {
    return isObject(item) ? this._valueOf(item as T) : item;
  }

  /**
   * The values of `entries`: `value` or `pendingValue`. A value without a
   * record keeps its place until a change names it, in multiple selection only.
   */
  public valuesOf(
    entries: ReadonlyMap<ComboValue<T>, T | undefined>
  ): ComboValue<T>[] {
    if (!this._host.singleSelect) {
      return [...entries.keys()];
    }

    return Iterator.from(entries)
      .filter(([, record]) => record !== undefined)
      .map(([value]) => value)
      .toArray();
  }

  /** Drops the values without a record that a deselection names, or all of them. */
  public forget(items: Item<T>[]): void {
    const current = this._current;
    const values = isEmpty(items)
      ? current.keys()
      : items.map((item) => this._toValue(item));

    for (const value of values) {
      if (current.get(value) === undefined) {
        current.delete(value);
      }
    }
  }

  /**
   * Resolves values or objects to records: the first record of each value in
   * `data`, in data-source order, then the selected records and the objects
   * that `data` does not hold. Each value resolves one time.
   */
  public resolve(items: Item<T>[]): T[] {
    const { data } = this._host;
    const index = this._dataIndex;
    const current = this._current;
    const positions = new Set<number>();
    const others = new Set<T>();

    for (const item of items) {
      const value = this._toValue(item);
      const position = index.get(value)?.[0];

      if (position !== undefined) {
        positions.add(position);
        continue;
      }

      // A pending record of the value comes before a committed one.
      const record =
        current.get(value) ??
        this._committed.get(value) ??
        (isObject(item) ? (item as T) : undefined);

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

  /** The values of the current selection after `records` apply: the `newValue` of the change event. */
  public preview(records: T[], selecting: boolean): ComboValue<T>[] {
    if (selecting && this._host.singleSelect) {
      return this.toValues(records);
    }

    const next = new Map(this._current);
    this._change(next, records, selecting);
    return this.valuesOf(next);
  }

  /**
   * Adds the values of `records` to `entries`, each with its first record in
   * `data`, or removes them. A value keeps its record and its place, so a
   * value without a record gets one in place.
   */
  private _change(
    entries: SelectionEntries<T>,
    records: T[],
    selecting: boolean
  ): void {
    for (const record of records) {
      const value = this._valueOf(record);

      if (!selecting) {
        entries.delete(value);
      } else if (entries.get(value) === undefined) {
        entries.set(value, this._recordOf(value) ?? record);
      }
    }
  }

  /**
   * Adds `records` to the current selection, or removes their values. While
   * the list has a pending selection, a committed value without a record gets
   * its record too, as a new `data` gives it.
   * @returns Whether the committed selection got records while it was not the current one.
   */
  public apply(records: T[], selecting: boolean): boolean {
    const current = this._current;
    const committed = this._committed;
    let resolved = false;

    this._change(current, records, selecting);

    if (selecting && current !== committed) {
      for (const record of records) {
        const value = this._valueOf(record);

        if (committed.has(value) && committed.get(value) === undefined) {
          committed.set(value, current.get(value));
          resolved = true;
        }
      }
    }

    this._version++;
    return resolved;
  }

  /**
   * Selects all the records of `data` in data-source order, then keeps the
   * selected records and the values that `data` does not hold.
   */
  public selectAll(): void {
    const current = this._current;
    const all: SelectionEntries<T> = new Map();

    for (const record of this._host.data) {
      const value = this._valueOf(record);

      if (!all.has(value)) {
        all.set(value, record);
      }
    }

    for (const [value, record] of current) {
      if (!all.has(value)) {
        all.set(value, record);
      }
    }

    if (current === this._committed) {
      this._committed = all;
    } else {
      this._pending = all;
    }

    this._version++;
  }

  /** Clears the committed selection. The pending selection does not change. */
  public clear(): void {
    this._committed = new Map();
    this._version++;
  }

  /** The records that `pending` adds to the committed selection or removes from it. */
  public changes(pending: ReadonlyMap<ComboValue<T>, T | undefined>): T[] {
    const committed = this._committed;
    const added = Iterator.from(pending).filter(
      ([value, record]) =>
        record !== undefined && committed.get(value) !== record
    );
    const removed = Iterator.from(committed).filter(
      ([value, record]) => record !== undefined && pending.get(value) !== record
    );

    return [...added, ...removed].map(([, record]) => record!);
  }

  /**
   * Makes `pending`, as the host read it before the change event, the
   * committed selection. The `value` sync then gives each value its record.
   */
  public commit(pending: ReadonlyMap<ComboValue<T>, T | undefined>): void {
    this._committed = new Map(pending);
    this._version++;
  }

  /**
   * Makes `values` the committed selection. Each value gets its first record in
   * `data`, else keeps its record, else has none.
   */
  public syncFromValue(values: ComboValue<T>[]): void {
    const previous = this._committed;
    const next: SelectionEntries<T> = new Map();

    for (const value of values) {
      if (!next.has(value)) {
        next.set(value, this._recordOf(value) ?? previous.get(value));
      }
    }

    this._committed = next;
    this._version++;
  }

  /**
   * After a new `data`: gives each value of the pending selection its first
   * record in `data`, else keeps its record. A value that a pending
   * deselection removed stays out.
   */
  public syncPending(): void {
    const pending = this._lazyPending;

    if (pending) {
      for (const [value, record] of pending) {
        pending.set(value, this._recordOf(value) ?? record);
      }

      this._version++;
    }
  }

  /** The values and the display text of the committed selection. See {@link valuesOf}. */
  public project(): { values: ComboValue<T>[]; text: string } {
    const { displayKey } = this._host;
    const text = this.recordsOf(this._committed)
      .map((record) =>
        String((displayKey ? record[displayKey] : undefined) ?? record)
      )
      .join(', ');

    return { values: this.valuesOf(this._committed), text };
  }
}
