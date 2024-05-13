import { groupBy } from '../../common/util.js';
import type { DataController } from '../controllers/data.js';
import type { ComboRecord, Keys } from '../types.js';

export default class GroupDataOperation<T extends object> {
  protected orderBy = new Map(
    Object.entries({
      asc: 1,
      desc: -1,
    })
  );

  public apply(data: ComboRecord<T>[], controller: DataController<T>) {
    const {
      groupingOptions: { groupKey, valueKey, displayKey, direction },
    } = controller;

    if (!groupKey) return data;

    const groups = Object.entries(
      groupBy(data, (item) => item.value[groupKey] ?? 'Other')
    );

    if (direction !== 'none') {
      const orderBy = this.orderBy.get(direction);
      groups.sort((a, b) => {
        return orderBy! * controller.compareCollator.compare(a[0], b[0]);
      });
    }

    return groups.flatMap(([group, items]) => {
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
