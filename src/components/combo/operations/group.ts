// import type { Values } from '../internal/types.js';
// import type { SortExpression, SortState } from './sort/types.js';

import { ComboHost, ComboRecord, Keys } from '../types.js';

export default class GroupDataOperation<T extends object> {
  public apply(data: T[], host: ComboHost<T>) {
    const { groupKey, valueKey, displayKey } = host;
    const result = new Map();

    data.forEach((item: T) => {
      const key = item[groupKey!];
      const group = result.get(key) ?? <ComboRecord<T>>[];

      if (group.length === 0) {
        group.push({
          [valueKey as Keys<T>]: key,
          [displayKey as Keys<T>]: key,
          [groupKey as Keys<T>]: key,
          header: true,
        });
      }

      group.push(Object.assign(item, { header: false }));
      result.set(key, group);
    });

    return [...result.values()].flat() as Array<ComboRecord<T>>;
  }
}
