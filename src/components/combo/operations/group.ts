import { groupBy } from '../../common/util.js';
import { DataController } from '../controllers/data.js';
import type { ComboRecord, GroupingDirection, Keys, Values } from '../types.js';

export default class GroupDataOperation<T extends object> {
  protected orderBy = new Map(
    Object.entries({
      asc: 1,
      desc: -1,
    })
  );

  protected resolveValue(record: T, key: Keys<T>) {
    return record[key];
  }

  protected compareValues(first: Values<T>, second: Values<T>) {
    if (typeof first === 'string' && typeof second === 'string') {
      return first.localeCompare(second);
    }
    return first > second ? 1 : first < second ? -1 : 0;
  }

  protected compareObjects(
    first: T,
    second: T,
    key: Keys<T>,
    direction: GroupingDirection
  ) {
    const [a, b] = [
      this.resolveValue(first, key),
      this.resolveValue(second, key),
    ];

    return this.orderBy.get(direction)! * this.compareValues(a, b);
  }

  public apply(data: ComboRecord<T>[], controller: DataController<T>) {
    const {
      groupingOptions: { groupKey, valueKey, displayKey, direction },
    } = controller;

    if (!groupKey) return data;

    const groups = Object.entries(
      groupBy(data, (item) => item.value[groupKey] ?? 'Other')
    );

    return groups.flatMap(([group, items]) => {
      items.sort((a, b) =>
        this.compareObjects(a.value, b.value, displayKey!, direction)
      );

      items.unshift({
        dataIndex: -1,
        header: true,
        value: {
          [valueKey as Keys<T>]: group,
          [displayKey as Keys<T>]: group,
          [groupKey as Keys<T>]: group,
        } as T,
      });

      return items;
    });
  }
}
