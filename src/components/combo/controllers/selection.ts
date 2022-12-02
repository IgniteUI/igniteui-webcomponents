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
      this.host.dataState.find((i) => i[this.host.valueKey!] === key)
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
      const i = this.host.dataState.includes(item as ComboRecord<T>);
      if (i) {
        this._selected.add(item);
      }
    });
  }

  private deselectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      const i = this.host.dataState.includes(item as ComboRecord<T>);
      if (i) {
        this._selected.delete(item);
      }
    });
  }

  private selectAll() {
    this.host.dataState
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
    if (!items || items.length === 0) {
      this.selectAll();
      return;
    }

    const values = this.host.valueKey
      ? this.getItemsByValueKey(items as Values<T>[])
      : items;
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
      this.selectValueKeys(items as Values<T>[]);
    } else {
      this.selectObjects(items as T[]);
    }

    this.host.requestUpdate();
  }

  public async deselect(items?: T[] | Values<T>[], emit = false) {
    if (!items || items.length === 0) {
      this.deselectAll();
      return;
    }

    const values = this.host.valueKey
      ? this.getItemsByValueKey(items as Values<T>[])
      : items;
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
      this.deselectValueKeys(items as Values<T>[]);
    } else {
      this.deselectObjects(items as T[]);
    }

    this.host.requestUpdate();
  }

  public get selected(): Set<T> {
    return this._selected;
  }

  public changeSelection(index: number) {
    const item = this.host.dataState[index];

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
