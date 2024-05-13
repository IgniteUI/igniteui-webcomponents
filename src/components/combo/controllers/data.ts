import type { ReactiveController } from 'lit';

import FilterDataOperation from '../operations/filter.js';
import GroupDataOperation from '../operations/group.js';
import type {
  ComboHost,
  ComboRecord,
  FilteringOptions,
  GroupingOptions,
} from '../types.js';

export class DataController<T extends object> implements ReactiveController {
  protected grouping = new GroupDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();
  private _searchTerm = '';
  private _compareCollator = new Intl.Collator();

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  public set searchTerm(value: string) {
    this._searchTerm = value;
    this.host.requestUpdate('pipeline');
  }

  public get searchTerm() {
    return this._searchTerm;
  }

  public get filteringOptions(): FilteringOptions<T> {
    return this.host.filteringOptions;
  }

  public get groupingOptions(): GroupingOptions<T> {
    return {
      valueKey: this.host.valueKey,
      displayKey: this.host.displayKey,
      groupKey: this.host.groupKey,
      direction: this.host.groupSorting,
    };
  }

  public get compareCollator(): Intl.Collator {
    return this._compareCollator;
  }

  private index(data: T[]): ComboRecord<T>[] {
    return data.map((item, index) => ({
      value: item,
      header: false,
      dataIndex: index,
    }));
  }

  public hostConnected() {}

  public async apply(data: T[]): Promise<ComboRecord<T>[]> {
    let records = this.index(data);
    records = this.filtering.apply(records, this);
    records = this.grouping.apply(records, this);

    return records;
  }
}
