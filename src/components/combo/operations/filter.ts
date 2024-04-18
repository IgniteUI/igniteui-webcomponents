import type { DataController } from '../controllers/data.js';
import type { ComboRecord, FilteringOptions } from '../types.js';

export default class FilterDataOperation<T extends object> {
  protected normalize<T extends object>(
    str: string,
    { caseSensitive, matchDiacritics }: FilteringOptions<T>
  ) {
    str = caseSensitive ? str : str.toLocaleLowerCase();
    return matchDiacritics ? str : str.normalize('NFKD').replace(/\p{M}/gu, '');
  }

  public apply(data: ComboRecord<T>[], controller: DataController<T>) {
    const { searchTerm, filteringOptions } = controller;
    const { filterKey: key } = filteringOptions;

    if (!searchTerm) return data;

    const term = this.normalize(searchTerm, filteringOptions);

    return data.filter(({ value }) => {
      const string = key ? `${value[key]}` : `${value}`;
      return this.normalize(string, filteringOptions).includes(term);
    });
  }
}
