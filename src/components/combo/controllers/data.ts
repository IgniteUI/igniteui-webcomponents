import { ReactiveController } from 'lit';
import GroupDataOperation from '../operations/group.js';
import { ComboHost } from '../types.js';

export class DataController<T extends object> implements ReactiveController {
  protected grouping = new GroupDataOperation<T>();
  // protected filtering = new FilterDataOperation<T>();

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public group(data: T[]) {
    return this.grouping.apply(data, this.host);
  }
}
