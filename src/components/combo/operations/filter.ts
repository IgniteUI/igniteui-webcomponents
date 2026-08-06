import type { DataState } from '../controllers/data.js';
import type { ComboRecord, FilteringOptions } from '../types.js';

/**
 * Filters combo records against the current search term.
 *
 * @remarks
 * Normalizing a record's searchable text (lower-casing and stripping
 * diacritics) dominates the cost of a filter pass, and every keystroke filters
 * the same records again. The normalized text is therefore memoized per record
 * and only recomputed when the normalization inputs change - records themselves
 * are replaced when the data source changes, so the weak cache drops stale
 * entries on its own.
 */
export default class FilterDataOperation<T extends object> {
  private _cache = new WeakMap<ComboRecord<T>, string>();
  private _signature?: string;

  protected normalize(
    value: string,
    { caseSensitive, matchDiacritics }: FilteringOptions<T>
  ): string {
    const text = caseSensitive ? value : value.toLocaleLowerCase();
    return matchDiacritics
      ? text
      : text.normalize('NFKD').replace(/\p{M}/gu, '');
  }

  /** Drops the memoized text whenever the normalization inputs change. */
  private _syncCache({
    filterKey,
    caseSensitive,
    matchDiacritics,
  }: FilteringOptions<T>): void {
    const signature = `${String(filterKey)}|${caseSensitive}|${matchDiacritics}`;

    if (this._signature !== signature) {
      this._signature = signature;
      this._cache = new WeakMap();
    }
  }

  private _textOf(
    record: ComboRecord<T>,
    options: FilteringOptions<T>
  ): string {
    let text = this._cache.get(record);

    if (text === undefined) {
      const { filterKey } = options;
      const value = record.value;

      text = this.normalize(`${filterKey ? value[filterKey] : value}`, options);
      this._cache.set(record, text);
    }

    return text;
  }

  public apply(
    data: ComboRecord<T>[],
    controller: DataState<T>
  ): ComboRecord<T>[] {
    const { searchTerm, filteringOptions } = controller;

    this._syncCache(filteringOptions);

    if (!searchTerm) {
      return data;
    }

    const term = this.normalize(searchTerm, filteringOptions);

    return data.filter((record) =>
      this._textOf(record, filteringOptions).includes(term)
    );
  }
}
