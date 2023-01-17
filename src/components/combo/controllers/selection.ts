import { ReactiveController } from 'lit';
import {
  ComboRecord,
  ComboHost,
  Values,
  IgcComboChangeEventArgs,
} from '../types.js';

export class SelectionController<T extends object>
  implements ReactiveController
{
  private _selected: Set<T> = new Set();

  public get dataState() {
    // @ts-expect-error protected access
    return this.host.dataState;
  }

  public resetSearchTerm() {
    // @ts-expect-error protected access
    this.host.resetSearchTerm();
  }

  public getValue(items: T[]) {
    return items
      .map((value) => {
        if (typeof value === 'object' && value !== null) {
          return this.host.displayKey
            ? String(value[this.host.displayKey])
            : String(value);
        } else {
          return String(value);
        }
      })
      .join(', ');
  }

  private handleChange(detail: IgcComboChangeEventArgs) {
    this.host.requestUpdate('value');
    return this.host.emitEvent('igcChange', { cancelable: true, detail });
  }

  private getItemsByValueKey(keys: Values<T>[]) {
    return keys.map((key) =>
      this.dataState.find((i) => i[this.host.valueKey!] === key)
    );
  }

  private selectValueKeys(keys: Values<T>[]) {
    if (keys.length === 0) return;

    this.getItemsByValueKey(keys).forEach((item) => {
      return item && this._selected.add(item);
    });
  }

  private deselectValueKeys(keys: Values<T>[]) {
    if (keys.length === 0) return;

    this.getItemsByValueKey(keys).forEach((item) => {
      return item && this._selected.delete(item);
    });
  }

  private selectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      const i = this.dataState.includes(item as ComboRecord<T>);
      if (i) {
        this._selected.add(item);
      }
    });
  }

  private deselectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      const i = this.dataState.includes(item as ComboRecord<T>);
      if (i) {
        this._selected.delete(item);
      }
    });
  }

  private selectFirst() {
    const items = this.dataState.filter((i) => !i.header);

    if (items.length > 0) {
      this._selected.add(items[0]);
    }
    this.host.requestUpdate();
  }

  private selectAll() {
    this.dataState
      .filter((i) => !i.header)
      .forEach((item) => {
        this._selected.add(item);
      });
    this.host.requestUpdate();
  }

  private deselectAll() {
    this._selected.clear();
    this.host.requestUpdate();
  }

  public async select(items?: T[] | Values<T>[], emit = false) {
    const { simplified } = this.host;

    if (!items || items.length === 0) {
      simplified ? this.selectFirst() : this.selectAll();
      return;
    }

    if (simplified) {
      this._selected.clear();
      this.resetSearchTerm();
    }

    const _items = simplified ? items.slice(0, 1) : items;

    const values = this.host.valueKey
      ? this.getItemsByValueKey(_items as Values<T>[])
      : _items;
    const selected = Array.from(this._selected.values());
    const payload = [...values, ...selected] as T[];

    if (
      emit &&
      !this.handleChange({
        newValue: this.getValue(payload),
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

  public async deselect(items?: T[] | Values<T>[], emit = false) {
    if (!items || items.length === 0) {
      if (
        emit &&
        !this.handleChange({
          newValue: '',
          items: Array.from(this.selected),
          type: 'deselection',
        })
      ) {
        return;
      }
      this.deselectAll();
      return;
    }

    const _items = this.host.simplified ? items.slice(0, 1) : items;
    const values = this.host.valueKey
      ? this.getItemsByValueKey(_items as Values<T>[])
      : _items;
    const selected = Array.from(this._selected.values());
    const payload = structuredClone(selected);

    payload.splice(selected.indexOf(values[0] as T));

    if (
      emit &&
      !this.handleChange({
        newValue: this.getValue(payload),
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

  public get selected(): Set<T> {
    return this._selected;
  }

  public changeSelection(index: number) {
    const item = this.dataState[index];

    if (this.host.valueKey) {
      !this.selected.has(item)
        ? this.select([item[this.host.valueKey]], true)
        : this.deselect([item[this.host.valueKey]], true);
    } else {
      !this.selected.has(item)
        ? this.select([item], true)
        : this.deselect([item], true);
    }
  }

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public hostDisconnected() {}
}
