import { ComboHost } from '../types.js';

export default class FilterDataOperation<T extends object> {
  public apply(data: T[], host: ComboHost<T>) {
    const { searchTerm, filteringOptions } = host;
    const { filterKey, caseSensitive } = filteringOptions;

    if (!searchTerm) return data;

    const term = caseSensitive ? searchTerm : searchTerm.toLocaleLowerCase();

    return data.filter((item: T) => {
      const value = filterKey
        ? (item[filterKey] as any).toString()
        : item.toString();

      return caseSensitive
        ? value.includes(term)
        : value.toLowerCase().includes(term);
    });
  }
}
