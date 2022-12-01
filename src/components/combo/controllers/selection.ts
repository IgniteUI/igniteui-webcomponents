import { ReactiveController } from 'lit';
import { ComboRecord, ComboHost, Values, ComboChangeType } from '../types.js';

export class SelectionController<T extends object>
  implements ReactiveController
{
  private _selected: Set<T> = new Set();

  public getValue(items: T[]) {
    return items
      .map((value) => {
        if (typeof value === 'object') {
          return this.host.displayKey ? value[this.host.displayKey] : value;
        } else {
          return value;
        }
      })
      .join(', ');
  }

  private handleChange(newValue: string, items: T[], type: ComboChangeType) {
    return this.host.emitEvent('igcChange', {
      cancelable: true,
      detail: { newValue, items, type },
    });
  }

  private getItemsByValueKey(keys: Values<T>[]) {
    return keys.map((key) =>
      this.host.dataState.find((i) => i[this.host.valueKey!] === key)
    );
  }

  private selectValueKeys(values: Values<T>[]) {
    if (values.length === 0) return;

    values.forEach((value) => {
      const item = this.host.dataState.find(
        (i) => i[this.host.valueKey!] === value
      );

      if (item) {
        this._selected.add(item);
      }
    });
  }

  private deselectValueKeys(values: Values<T>[]) {
    if (values.length === 0) return;

    values.forEach((value) => {
      const item = this.host.dataState.find(
        (i) => i[this.host.valueKey!] === value
      );

      if (item) {
        this._selected.delete(item);
      }
    });
  }

  private selectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      this._selected.add(item as ComboRecord<T>);
    });
  }

  private deselectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      this._selected.delete(item as ComboRecord<T>);
    });
  }

  private selectAll() {
    this.host.dataState
      .filter((i) => !i.header)
      .forEach((item) => {
        this._selected.add(item);
      });

    this.host.requestUpdate('selected');
  }

  private deselectAll() {
    this._selected.clear();
    this.host.requestUpdate('selected');
  }

  public async select(items?: T[] | Values<T>[], emit = false) {
    if (!items || items.length === 0) {
      this.selectAll();
      return;
    }

    const values = this.getItemsByValueKey(items as Values<T>[]);
    const selected = Array.from(this._selected.values());
    const payload = [...values, ...selected] as T[];

    if (
      emit &&
      !this.handleChange(this.getValue(payload), values as T[], 'selection')
    ) {
      return;
    }

    if (this.host.valueKey) {
      this.selectValueKeys(items as Values<T>[]);
    } else {
      this.selectObjects(items as T[]);
    }

    this.host.requestUpdate('selected');
  }

  public async deselect(items?: T[] | Values<T>[], emit = false) {
    if (!items || items.length === 0) {
      this.deselectAll();
      return;
    }

    const values = this.getItemsByValueKey(items as Values<T>[]);
    const selected = Array.from(this._selected.values());
    const payload = structuredClone(selected);

    payload.splice(selected.indexOf(values[0] as T));

    if (
      emit &&
      !this.handleChange(this.getValue(payload), values as T[], 'deselection')
    ) {
      return;
    }

    if (this.host.valueKey) {
      this.deselectValueKeys(items as Values<T>[]);
    } else {
      this.deselectObjects(items as T[]);
    }

    this.host.requestUpdate('selected');
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
