import { DataController } from '../controllers/data.js';
import { ComboRecord, GroupingDirection, Keys, Values } from '../types.js';

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

  public apply(data: T[], controller: DataController<T>) {
    const {
      groupingOptions: { groupKey, valueKey, displayKey, direction },
    } = controller;

    if (!groupKey) return data;

    const result = new Map();

    data.forEach((item: T) => {
      if (typeof item !== 'object' || item === null) return;

      const key = item[groupKey!] ?? 'Other';
      const group = result.get(key) ?? <ComboRecord<T>>[];

      if (group.length === 0) {
        group.push({
          [valueKey as Keys<T>]: key,
          [displayKey as Keys<T>]: key,
          [groupKey as Keys<T>]: key,
          header: true,
        });
      }

      group.push(item);

      group.sort((a: ComboRecord<T>, b: ComboRecord<T>) => {
        if (!a.header && !b.header) {
          return this.compareObjects(a, b, displayKey!, direction);
        }
        return 1;
      });

      result.set(key, group);
    });

    return Array.from(result.values()).flat();
  }
}
