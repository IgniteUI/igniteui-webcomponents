import type { ReactiveController } from 'lit';

import { asArray, isEmpty } from '../../common/util.js';
import type {
  ComboHost,
  ComboValue,
  IgcComboChangeEventArgs,
  Item,
  Keys,
  Values,
} from '../types.js';
import type { DataController } from './data.js';

export class SelectionController<T extends object>
  implements ReactiveController
{
  private _selected: Set<T> = new Set();

  /** Whether the current selection is empty */
  public get isEmpty() {
    return isEmpty(this._selected);
  }

  /** Returns the current selection as an array */
  public get asArray() {
    return Array.from(this._selected);
  }

  /** Whether the current selection has the given item */
  public has(item?: T) {
    return this._selected.has(item!);
  }

  /** Clears the current selection */
  public clear() {
    this._selected.clear();
  }

  public getSelectedValuesByKey(key?: Keys<T>) {
    return this.asArray.map((item) => item[key!] ?? item);
  }

  public getValue(items: T[], key: Keys<T>): ComboValue<T>[] {
    return items.map((item) => item[key] ?? item);
  }

  private handleChange(detail: IgcComboChangeEventArgs) {
    return this.host.emitEvent('igcChange', { cancelable: true, detail });
  }

  private getItemsByValueKey(keys: Values<T>[]) {
    const _keys = new Set(keys);
    return this.host.data.filter((item) =>
      _keys.has(item[this.host.valueKey!])
    );
  }

  private selectValueKeys(keys: Values<T>[]) {
    if (isEmpty(keys)) {
      return;
    }

    for (const item of this.getItemsByValueKey(keys)) {
      this._selected.add(item);
    }
  }

  private deselectValueKeys(keys: Values<T>[]) {
    if (isEmpty(keys)) {
      return;
    }

    for (const item of this.getItemsByValueKey(keys)) {
      this._selected.delete(item);
    }
  }

  private selectObjects(items: T[]) {
    if (isEmpty(items)) {
      return;
    }

    const dataSet = new Set(this.host.data);

    for (const item of items) {
      if (dataSet.has(item)) {
        this._selected.add(item);
      }
    }
  }

  private deselectObjects(items: T[]) {
    if (isEmpty(items)) {
      return;
    }

    const dataSet = new Set(this.host.data);

    for (const item of items) {
      if (dataSet.has(item)) {
        this._selected.delete(item);
      }
    }
  }

  private selectAll() {
    this._selected = new Set(this.host.data);
    this.host.requestUpdate();
  }

  private deselectAll() {
    this.clear();
    this.host.requestUpdate();
  }

  public async select(items?: Item<T> | Item<T>[], emit = false) {
    let _items = asArray(items);
    const singleSelect = this.host.singleSelect;

    if (singleSelect) {
      this.clear();
      this.state.searchTerm = '';
    }

    if (isEmpty(_items)) {
      if (!singleSelect) {
        this.selectAll();
      }
      return;
    }

    if (singleSelect) {
      _items = _items.slice(0, 1);
    }

    const values = this.host.valueKey
      ? this.getItemsByValueKey(_items as Values<T>[])
      : _items;
    const selected = Array.from(this._selected.values());
    const payload = [...values, ...selected] as T[];

    if (
      emit &&
      !this.handleChange({
        newValue: this.getValue(payload, this.host.valueKey!),
        items: values as T[],
        type: 'selection',
      })
    ) {
      return;
    }

    if (this.host.valueKey) {
      this.selectValueKeys(_items as Values<T>[]);
    } else {
      this.selectObjects(_items as T[]);
    }

    this.host.requestUpdate();
  }

  public async deselect(items?: Item<T> | Item<T>[], emit = false) {
    let _items = asArray(items);

    if (isEmpty(_items)) {
      if (
        emit &&
        !this.handleChange({
          newValue: [],
          items: this.asArray,
          type: 'deselection',
        })
      ) {
        return;
      }

      this.deselectAll();
      return;
    }

    if (this.host.singleSelect) {
      _items = _items.slice(0, 1);
    }

    const values = this.host.valueKey
      ? this.getItemsByValueKey(_items as Values<T>[])
      : _items;
    const selected = Array.from(this._selected.values());
    const payload = selected.filter((item) => item !== values[0]);

    if (
      emit &&
      !this.handleChange({
        newValue: this.getValue(payload, this.host.valueKey!),
        items: values as T[],
        type: 'deselection',
      })
    ) {
      return;
    }

    if (this.host.valueKey) {
      this.deselectValueKeys(_items as Values<T>[]);
    } else {
      this.deselectObjects(_items as T[]);
    }

    this.host.requestUpdate();
  }

  public changeSelection(index: number) {
    const valueKey = this.host.valueKey;
    const record = this.host.data[index];
    const item = valueKey ? record[valueKey] : record;

    this.has(record) ? this.deselect(item, true) : this.select(item, true);
  }

  public selectByIndex(index: number) {
    const valueKey = this.host.valueKey;
    const item = this.host.data[index];

    this.select(valueKey ? item[valueKey] : item, true);
  }

  constructor(
    protected host: ComboHost<T>,
    protected state: DataController<T>
  ) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public hostDisconnected() {}
}
