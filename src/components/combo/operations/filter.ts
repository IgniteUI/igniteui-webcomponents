import { DataController } from '../controllers/data';

export default class FilterDataOperation<T extends object> {
  public apply(data: T[], controller: DataController<T>) {
    const {
      searchTerm,
      filteringOptions: { filterKey, caseSensitive },
    } = controller;

    if (!searchTerm) return data;

    const term = caseSensitive ? searchTerm : searchTerm.toLocaleLowerCase();

    return data.filter((item: T) => {
      const value = filterKey
        ? (item[filterKey] as any).toString()
        : item.toString();

      return caseSensitive
        ? value.includes(term)
        : value.toLocaleLowerCase().includes(term);
    });
  }
}
