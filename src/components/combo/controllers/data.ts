import { ReactiveController } from 'lit';
import GroupDataOperation from '../operations/group.js';
import FilterDataOperation from '../operations/filter.js';
import {
  ComboHost,
  ComboRecord,
  FilteringOptions,
  GroupingOptions,
} from '../types.js';

export class DataController<T extends object> implements ReactiveController {
  protected grouping = new GroupDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();
  private _searchTerm = '';

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

  public hostConnected() {}

  public async apply(data: T[]): Promise<ComboRecord<T>[]> {
    data = this.filtering.apply(data, this);
    data = this.grouping.apply(data, this);

    return data as ComboRecord<T>[];
  }
}
