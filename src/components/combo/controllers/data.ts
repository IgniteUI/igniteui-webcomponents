import { ReactiveController } from 'lit';
import GroupDataOperation from '../operations/group.js';
import FilterDataOperation from '../operations/filter.js';
import { ComboHost, ComboRecord } from '../types.js';

export class DataController<T extends object> implements ReactiveController {
  protected grouping = new GroupDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public apply(data: T[]) {
    data = this.filtering.apply(data, this.host);
    data = this.grouping.apply(data, this.host);

    return data as ComboRecord<T>[];
  }
}
