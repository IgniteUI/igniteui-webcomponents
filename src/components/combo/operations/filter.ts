import { DataController } from '../controllers/data.js';
import { ComboRecord } from '../types.js';

export default class FilterDataOperation<T extends object> {
  public apply(data: ComboRecord<T>[], controller: DataController<T>) {
    const {
      searchTerm,
      filteringOptions: { filterKey, caseSensitive },
    } = controller;

    if (!searchTerm) return data;

    const term = caseSensitive ? searchTerm : searchTerm.toLocaleLowerCase();

    return data.filter((item: ComboRecord<T>) => {
      const value = filterKey
        ? String(item.value[filterKey] as any)
        : String(item.value);

      return caseSensitive
        ? value.includes(term)
        : value.toLocaleLowerCase().includes(term);
    });
  }
}
