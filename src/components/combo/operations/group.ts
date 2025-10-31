import type { DataController } from '../controllers/data.js';
import type { ComboRecord, Keys } from '../types.js';

const OrderBy = Object.freeze({ asc: 1, desc: -1 });

export default class GroupDataOperation<T extends object> {
  public apply(
    data: ComboRecord<T>[],
    controller: DataController<T>
  ): ComboRecord<T>[] {
    const {
      groupingOptions: { groupKey, valueKey, displayKey, direction },
    } = controller;

    if (!groupKey) {
      return data;
    }

    const grouped = Map.groupBy(
      data,
      (item) => (item.value[groupKey] as string) ?? 'Other'
    );

    const keys = Array.from(grouped.keys());

    if (direction !== 'none') {
      const orderBy = OrderBy[direction];
      keys.sort((a, b) => orderBy * controller.compareCollator.compare(a, b));
    }

    return keys.flatMap((key) => {
      return [
        {
          value: {
            [valueKey as Keys<T>]: key,
            [displayKey as Keys<T>]: key,
            [groupKey as Keys<T>]: key,
          } as T,
          header: true,
          dataIndex: -1,
        },
        ...(grouped.get(key) ?? []),
      ];
    });
  }
}
