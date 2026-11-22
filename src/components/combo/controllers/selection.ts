import {
  asArray,
  firstOf,
  isEmpty,
  sameItems,
} from '#internals/utils/arrays.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import { isDefined, isObject } from '#internals/utils/types.js';
import type IgcComboComponent from '../combo.js';
import type { ComboValue, Item } from '../types.js';
import { valueOf } from './data.js';

const newPositions = (): number[] => [];

/** The fields of the combo that the selection reads. */
export type ComboSelectionHost<T extends object> = Pick<
  IgcComboComponent<T>,
  | 'requestUpdate'
  | 'data'
  | 'valueKey'
  | 'displayKey'
  | 'singleSelect'
  | 'open'
  | 'selectionCommit'
>;

/** How the selection reads and writes `value`. */
export interface ComboValuePort<T extends object> {
  read(): ComboValue<T>[];
  /** Writes and submits `value`. The caller sets the write origin. */
  write(values: ComboValue<T>[]): void;
}

/**
 * The values of a selection in order, each with its record, or `undefined` for
 * a value that has no record yet.
 */
type SelectionEntries<T extends object> = Map<ComboValue<T>, T | undefined>;
type ReadonlyEntries<T extends object> = ReadonlyMap<
  ComboValue<T>,
  T | undefined
>;

type SelectionType = 'selection' | 'deselection';

/**
 * A change that {@link ComboSelection.apply} makes. Only the propose methods
 * make one. `type`, `items` and `newValue` are the fields of `igcChange`: read
 * them before the apply.
 */
export type ComboSelectionChange<T extends object> = {
  readonly type: SelectionType | 'commit';
  /** The records that the change selects or deselects. */
  readonly items: T[];
  /** The values of the selection that the list shows, after the change. */
  readonly newValue: ComboValue<T>[];
} & (
  | {
      readonly kind: 'records';
      readonly type: SelectionType;
      /** The items of a deselection. The apply forgets their values without a record. */
      readonly named?: Item<T>[];
    }
  | { readonly kind: 'all' }
  | {
      readonly kind: 'commit';
      readonly pending: ReadonlyEntries<T>;
      readonly values: ComboValue<T>[];
    }
);

/** Adds a getter to `fields` for each key of `lazy`. It computes the value on the first read. */
function withLazy<F extends object, L extends object>(
  fields: F,
  lazy: { [K in keyof L]: () => L[K] }
): F & Readonly<L> {
  for (const key of Object.keys(lazy) as (keyof L)[]) {
    let value: L[keyof L] | undefined;

    Object.defineProperty(fields, key, {
      enumerable: true,
      get: () => (value ??= lazy[key]()),
    });
  }

  return fields as F & Readonly<L>;
}

/**
 * The selected values and records of the combo: the committed selection, and
 * the pending selection of the confirm mode while the list is open. It
 * resolves values and objects to the records of `data`, and keeps the selected
 * records and the values that `data` does not hold. One record for each value.
 *
 * It keeps `value` in sync with the committed selection through a
 * {@link ComboValuePort} and owns the display text. Each change is a proposal
 * first, so the host can send its cancelable event before {@link apply}.
 */
export class ComboSelection<T extends object> {
  //#region Internal state

  private readonly _host: ComboSelectionHost<T>;
  private readonly _port: ComboValuePort<T>;
  private readonly _onChange: () => void;
  private _index?: Map<Item<T>, number[]>;
  /** The key of each item of {@link _index}. See {@link _dataIndex}. */
  private _keys: Item<T>[] = [];
  private _indexStale = false;
  private _version = 0;
  /** The committed selection: `value`, `selection` and {@link text}. */
  private _committed: SelectionEntries<T> = new Map();
  /** Read it through {@link _lazyPending}. */
  private _pending?: SelectionEntries<T>;
  private _text = '';
  /** What the last sync with `value` read. See {@link isSynced}. */
  private _syncedWith?: { data: T[]; length: number; value: ComboValue<T>[] };

  //#endregion

  /**
   * @param onChange Called on each change of the selection, to render the rows again.
   */
  constructor(
    host: ComboSelectionHost<T>,
    port: ComboValuePort<T>,
    onChange: () => void
  ) {
    this._host = host;
    this._port = port;
    this._onChange = onChange;
  }

  /** The records of the committed selection: `selection`. */
  public get selected(): T[] {
    return this._recordsOf(this._committed);
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
   * Whether a pending selection takes the changes: the list is open in the
   * confirm mode of `selectionCommit`.
   */
  public get hasPending(): boolean {
    return this._host.open && this.confirmMode;
  }

  /** The values of the pending selection, a copy of the committed one at first. */
  public get pendingValue(): ComboValue<T>[] | undefined {
    const pending = this._lazyPending;
    return pending ? this._valuesOf(pending) : undefined;
  }

  /**
   * The display text of the committed selection at its last projection. A
   * clear while typing keeps it.
   */
  public get text(): string {
    return this._text;
  }

  /** The number of values of the selection that the list shows. */
  public get size(): number {
    return this._current.size;
  }

  private get _lazyPending(): SelectionEntries<T> | undefined {
    if (this.hasPending) {
      this._pending ??= new Map(this._committed);
      return this._pending;
    }

    // This read does not request a render. A render can make it, and that
    // render shows the result.
    if (this._pending) {
      this._pending = undefined;
      this._version++;
    }

    return undefined;
  }

  /** The selection that the list shows and the user changes. */
  private get _current(): SelectionEntries<T> {
    return this._lazyPending ?? this._committed;
  }

  /**
   * Whether the value of `record` has a record in the selection that the list
   * shows, so a record that repeats a selected value shows as selected too.
   */
  public has(record: T): boolean {
    return this._current.get(this._valueOf(record)) !== undefined;
  }

  //#region Proposals

  /**
   * A change of values or objects, in data-source order. Without items, a
   * selection selects all, or clears in single selection, and a deselection
   * deselects all. Single selection takes the first item.
   */
  public propose(
    items: Item<T> | Item<T>[] | undefined,
    type: SelectionType
  ): ComboSelectionChange<T> {
    const { singleSelect } = this._host;
    const named = singleSelect ? asArray(items).slice(0, 1) : asArray(items);

    if (isEmpty(named) && type === 'selection') {
      return singleSelect ? this._proposal([], type) : this._proposeAll();
    }

    const records = isEmpty(named)
      ? this._recordsOf(this._current)
      : this._resolve(named);

    return this._proposal(
      records,
      type,
      type === 'deselection' ? named : undefined
    );
  }

  /**
   * A change of the records of the list, in their order. A toggle selects the
   * records that are not selected, or deselects all when each one is.
   */
  public proposeRecords(
    records: T[],
    type: SelectionType | 'toggle'
  ): ComboSelectionChange<T> {
    if (type !== 'toggle') {
      return this._proposal(records, type);
    }

    const unselected = records.filter((record) => !this.has(record));

    return isEmpty(unselected)
      ? this._proposal(records, 'deselection')
      : this._proposal(unselected, 'selection');
  }

  /** The commit of the pending selection, if there is one and it changes something. */
  public proposeCommit(): ComboSelectionChange<T> | undefined {
    const pending = this._lazyPending;

    if (!pending) {
      return undefined;
    }

    const items = this._changes(pending);
    const values = this._valuesOf(pending);

    // A deselection can name a value without a record, which changes no record.
    if (isEmpty(items) && sameItems(values, this._port.read())) {
      return undefined;
    }

    return withLazy(
      {
        kind: 'commit' as const,
        type: 'commit' as const,
        items,
        pending,
        values,
      },
      // A copy, so a handler cannot change `value` through it.
      { newValue: () => [...values] }
    );
  }

  /**
   * Makes `change`, then writes the committed selection to `value`. See
   * {@link resync}.
   * @returns Whether it wrote `value`.
   */
  public apply(
    change: ComboSelectionChange<T>,
    { keepText = false } = {}
  ): boolean {
    switch (change.kind) {
      case 'all':
        this._selectAll();
        break;
      case 'commit':
        // The commit can give the same values other records, so it always
        // writes `value`.
        this._committed = new Map(change.pending);
        this.assign(change.values);
        return true;
      default:
        // A pending change can give committed values their records.
        if (this._applyRecords(change.items, change.type)) {
          this.project();
        }

        if (change.named) {
          this._forget(change.named);
        }
    }

    return this.resync({ keepText });
  }

  private _proposal(
    items: T[],
    type: SelectionType,
    named?: Item<T>[]
  ): ComboSelectionChange<T> {
    const records = this._firstRecords(items);

    return withLazy(
      { kind: 'records' as const, type, items: records, named },
      { newValue: () => this._preview(records, type) }
    );
  }

  private _proposeAll(): ComboSelectionChange<T> {
    return withLazy(
      { kind: 'all' as const, type: 'selection' as const },
      {
        items: () => this._firstRecords(this._host.data),
        newValue: () => this._valuesOf(this._allEntries()),
      }
    );
  }

  //#endregion

  //#region Value sync

  /**
   * Whether `items` is `value`, and the selection is synced with it and with
   * the current `data`. A new `data` or `valueKey` gives a value its record
   * again. The copy of `value` sees a change of the array in place.
   */
  public isSynced(items: ComboValue<T>[]): boolean {
    const synced = this._syncedWith;
    const { data } = this._host;
    const values = this._asValue(items);

    return (
      synced !== undefined &&
      synced.data === data &&
      synced.length === data.length &&
      sameItems(values, this._port.read()) &&
      sameItems(values, synced.value)
    );
  }

  /**
   * Writes `items` to `value`, one value in single selection, and gives the
   * values their records. A new value drops the pending selection.
   */
  public assign(items: ComboValue<T>[]): void {
    const previous = this._port.read();
    const all = asArray(items);
    const values = this._asValue(all);

    // One write, which keeps the array when nothing is cut.
    this._port.write(values.length === all.length ? all : values);
    this.readValue();

    if (!sameItems(previous, this._port.read())) {
      this.dropPending();
    }
  }

  /**
   * Reads `value` again: one value in single selection, each with its record.
   * Call it when `singleSelect` changes.
   */
  public readValue(): void {
    const current = this._port.read();
    const values = this._asValue(current);

    if (values.length !== current.length) {
      this._port.write(values);
    }

    this._markSynced();
    this._setCommittedValues(values);
    this.project();
  }

  /**
   * After a new `data`: gives `value` and the pending selection the records of
   * `data`. Call it in the `normalize` write origin. It writes `value` only to
   * keep one value in single selection.
   */
  public dataChanged(): void {
    if (!isEmpty(this._host.data) && !isEmpty(this._port.read())) {
      this.readValue();
    }

    this._syncPending();
  }

  /**
   * Writes the committed selection to `value`, unless a pending selection takes
   * the changes. A pending selection does not change `value`, which can hold
   * values without a record. `keepText`, for a clear while typing, keeps
   * {@link text}.
   * @returns Whether it wrote `value`.
   */
  public resync({ keepText = false } = {}): boolean {
    if (this._lazyPending) {
      return false;
    }

    if (!keepText) {
      this.project();
    }

    this._port.write(this._valuesOf(this._committed));
    this._markSynced();
    return true;
  }

  /** Sets {@link text} from the committed selection. The main input binds it. */
  public project(): void {
    const { displayKey } = this._host;
    const text = this._recordsOf(this._committed)
      .map((record) =>
        String((displayKey ? record[displayKey] : undefined) ?? record)
      )
      .join(', ');

    if (text !== this._text) {
      this._text = text;
      this._host.requestUpdate();
    }
  }

  /** `items` as `value` holds them: an array, with one value in single selection. */
  private _asValue(items: ComboValue<T>[] | undefined): ComboValue<T>[] {
    const values = asArray(items);

    return this._host.singleSelect && !isEmpty(values)
      ? asArray(firstOf(values))
      : values;
  }

  private _markSynced(): void {
    const { data } = this._host;

    this._syncedWith = {
      data,
      length: data.length,
      value: [...this._port.read()],
    };
  }

  /**
   * Makes `values` the committed selection. Each value gets its first record in
   * `data`, else keeps its record, else has none.
   */
  private _setCommittedValues(values: ComboValue<T>[]): void {
    const previous = this._committed;
    const next: SelectionEntries<T> = new Map();

    for (const value of values) {
      if (!next.has(value)) {
        next.set(value, this._recordOf(value) ?? previous.get(value));
      }
    }

    this._committed = next;
    this._changed();
  }

  /**
   * After a new `data`: gives each value of the pending selection its first
   * record in `data`, else keeps its record. A value that a pending
   * deselection removed stays out.
   */
  private _syncPending(): void {
    const pending = this._lazyPending;

    if (pending) {
      for (const [value, record] of pending) {
        pending.set(value, this._recordOf(value) ?? record);
      }

      this._changed();
    }
  }

  //#endregion

  //#region Maintenance

  /** The next read of the pending selection copies the committed selection again. */
  public dropPending(): void {
    if (this._pending) {
      this._pending = undefined;
      this._changed();
    }
  }

  /** Call when `data` is set, also to the same array. */
  public invalidateIndex(): void {
    this._indexStale = true;
  }

  /** Call when `valueKey` changes: the records get their new values. */
  public rekey(): void {
    this._index = undefined;
    // The next `value` gives the values their records again.
    this._syncedWith = undefined;
    this._committed = this._rekeyed(this._committed);

    if (this._pending) {
      this._pending = this._rekeyed(this._pending);
    }

    this._changed();
  }

  /** The rows show the selection, so each change renders them again. */
  private _changed(): void {
    this._version++;
    this._host.requestUpdate();
    this._onChange();
  }

  /**
   * A value without a record keeps its value. Each new value gets its first
   * record in `data`, else the first selected record.
   */
  private _rekeyed(entries: SelectionEntries<T>): SelectionEntries<T> {
    const next: SelectionEntries<T> = new Map();

    for (const [value, record] of entries) {
      const key = record === undefined ? value : this._valueOf(record);

      if (!next.has(key)) {
        next.set(
          key,
          record === undefined ? record : (this._recordOf(key) ?? record)
        );
      }
    }

    return next;
  }

  //#endregion

  //#region Records and values

  /**
   * Maps each value to the positions of its records, in data-source order. It
   * keeps the indexed keys, so a `data` that starts with the same keys, such
   * as an appended page, adds only the new items. A replaced element or a key
   * that changed in place shows only after a set of `data` or a change of its
   * length.
   */
  private get _dataIndex(): Map<Item<T>, number[]> {
    const { data } = this._host;
    let index = this._index;
    let keys = this._keys;

    if (index && !this._indexStale && keys.length === data.length) {
      return index;
    }

    if (
      !index ||
      keys.length > data.length ||
      !keys.every((key, position) =>
        Object.is(this._keyOf(data[position]), key)
      )
    ) {
      index = this._index = new Map();
      keys = this._keys = [];
    }

    for (let position = keys.length; position < data.length; position++) {
      const key = this._keyOf(data[position]);

      getOrInsertComputed(index, key, newPositions).push(position);
      keys.push(key);
    }

    this._indexStale = false;
    return index;
  }

  /** The first record in `data` of each value of `records`, one time each, in their order. */
  private _firstRecords(records: T[]): T[] {
    const first = new Map<ComboValue<T>, T>();

    for (const record of records) {
      const value = this._valueOf(record);

      if (!first.has(value)) {
        first.set(value, this._recordOf(value) ?? record);
      }
    }

    return [...first.values()];
  }

  /** The first record of `value` in `data`. */
  private _recordOf(value: ComboValue<T>): T | undefined {
    const position = this._dataIndex.get(value)?.[0];
    return position === undefined ? undefined : this._host.data[position];
  }

  private _recordsOf(entries: ReadonlyEntries<T>): T[] {
    return Iterator.from(entries.values()).filter(isDefined).toArray();
  }

  /** The key of the record in the value index. Unlike {@link _valueOf}, it has no fallback. */
  private _keyOf(record: T): Item<T> {
    const { valueKey } = this._host;
    return valueKey ? record[valueKey] : record;
  }

  private _valueOf(item: T): ComboValue<T> {
    return valueOf(item, this._host.valueKey);
  }

  private _toValue(item: Item<T>): ComboValue<T> {
    return isObject(item) ? this._valueOf(item as T) : item;
  }

  /**
   * The values of `entries`. A value without a record keeps its place until a
   * change names it, in multiple selection only.
   */
  private _valuesOf(entries: ReadonlyEntries<T>): ComboValue<T>[] {
    if (!this._host.singleSelect) {
      return [...entries.keys()];
    }

    return Iterator.from(entries)
      .filter(([, record]) => record !== undefined)
      .map(([value]) => value)
      .toArray();
  }

  /** Drops the values without a record that a deselection names, or all of them. */
  private _forget(items: Item<T>[]): void {
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
  private _resolve(items: Item<T>[]): T[] {
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

  //#endregion

  //#region Record edits

  /** The values of the current selection after `records` apply: the `newValue` of a change. */
  private _preview(records: T[], type: SelectionType): ComboValue<T>[] {
    const next: SelectionEntries<T> = this._replaces(type)
      ? new Map()
      : new Map(this._current);

    this._edit(next, records, type);
    return this._valuesOf(next);
  }

  /** In single selection, a selection replaces the selection. */
  private _replaces(type: SelectionType): boolean {
    return type === 'selection' && this._host.singleSelect;
  }

  /**
   * Adds `records` to `entries`, or removes their values. A value keeps its
   * record and its place, so a value without a record gets one in place.
   */
  private _edit(
    entries: SelectionEntries<T>,
    records: T[],
    type: SelectionType
  ): void {
    for (const record of records) {
      const value = this._valueOf(record);

      if (type === 'deselection') {
        entries.delete(value);
      } else if (entries.get(value) === undefined) {
        entries.set(value, record);
      }
    }
  }

  /**
   * Adds `records` to the current selection, or removes their values. While
   * the list has a pending selection, a committed value without a record gets
   * its record too.
   * @returns Whether the committed selection got records while it was not the current one.
   */
  private _applyRecords(records: T[], type: SelectionType): boolean {
    if (this._replaces(type)) {
      this._clear();
    }

    const current = this._current;
    const committed = this._committed;
    let resolved = false;

    this._edit(current, records, type);

    if (type === 'selection' && current !== committed) {
      for (const record of records) {
        const value = this._valueOf(record);

        if (committed.has(value) && committed.get(value) === undefined) {
          committed.set(value, current.get(value));
          resolved = true;
        }
      }
    }

    this._changed();
    return resolved;
  }

  /**
   * All the records of `data` in data-source order, then the selected records
   * and the values that `data` does not hold.
   */
  private _allEntries(): SelectionEntries<T> {
    const all: SelectionEntries<T> = new Map();

    for (const record of this._host.data) {
      const value = this._valueOf(record);

      if (!all.has(value)) {
        all.set(value, record);
      }
    }

    for (const [value, record] of this._current) {
      if (!all.has(value)) {
        all.set(value, record);
      }
    }

    return all;
  }

  private _selectAll(): void {
    const all = this._allEntries();

    if (this._current === this._committed) {
      this._committed = all;
    } else {
      this._pending = all;
    }

    this._changed();
  }

  /** Clears the committed selection. The pending selection does not change. */
  private _clear(): void {
    this._committed = new Map();
    this._changed();
  }

  /** The records that `pending` adds to the committed selection or removes from it. */
  private _changes(pending: ReadonlyEntries<T>): T[] {
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

  //#endregion
}
