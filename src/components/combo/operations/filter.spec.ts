import { expect } from '@open-wc/testing';

import type { DataState } from '../controllers/data.js';
import type { ComboRecord, FilteringOptions } from '../types.js';
import FilterDataOperation from './filter.js';

type City = { name: string; country: string };

/**
 * The filter operation only reads `searchTerm` and `filteringOptions` off the
 * data state, so a plain stand-in keeps these tests off the component lifecycle.
 */
function stateStub(
  searchTerm: string,
  filteringOptions: FilteringOptions<City>
): DataState<City> {
  return { searchTerm, filteringOptions } as DataState<City>;
}

function records(...values: City[]): ComboRecord<City>[] {
  return values.map((value, index) => ({
    value,
    header: false,
    position: index + 1,
  }));
}

describe('Combo filter operation', () => {
  const data = records(
    { name: 'Sofia', country: 'Bulgaria' },
    { name: 'Plovdiv', country: 'Bulgaria' },
    { name: 'São Paulo', country: 'Brazil' }
  );

  const defaults: FilteringOptions<City> = {
    filterKey: 'name',
    caseSensitive: false,
    matchDiacritics: false,
  };

  let filter: FilterDataOperation<City>;

  beforeEach(() => {
    filter = new FilterDataOperation<City>();
  });

  const names = (result: ComboRecord<City>[]) =>
    result.map((record) => record.value.name);

  it('returns the input untouched when there is no search term', () => {
    const result = filter.apply(data, stateStub('', defaults));
    expect(result).to.equal(data);
  });

  it('matches case-insensitively and ignores diacritics by default', () => {
    expect(names(filter.apply(data, stateStub('sof', defaults)))).to.eql([
      'Sofia',
    ]);
    expect(names(filter.apply(data, stateStub('sao', defaults)))).to.eql([
      'São Paulo',
    ]);
  });

  it('honors filterKey', () => {
    const options = { ...defaults, filterKey: 'country' as const };
    expect(names(filter.apply(data, stateStub('bulg', options)))).to.eql([
      'Sofia',
      'Plovdiv',
    ]);
  });

  // The operation memoizes each record's normalized text, so every option that
  // feeds that normalization has to invalidate the cache when it changes.
  it('re-normalizes when caseSensitive changes between passes', () => {
    expect(names(filter.apply(data, stateStub('sof', defaults)))).to.eql([
      'Sofia',
    ]);

    const sensitive = { ...defaults, caseSensitive: true };
    expect(filter.apply(data, stateStub('sof', sensitive))).to.be.empty;
    expect(names(filter.apply(data, stateStub('Sof', sensitive)))).to.eql([
      'Sofia',
    ]);

    expect(names(filter.apply(data, stateStub('sof', defaults)))).to.eql([
      'Sofia',
    ]);
  });

  it('re-normalizes when matchDiacritics changes between passes', () => {
    expect(names(filter.apply(data, stateStub('sao', defaults)))).to.eql([
      'São Paulo',
    ]);

    const exact = { ...defaults, matchDiacritics: true };
    expect(filter.apply(data, stateStub('sao', exact))).to.be.empty;
    expect(names(filter.apply(data, stateStub('são', exact)))).to.eql([
      'São Paulo',
    ]);

    expect(names(filter.apply(data, stateStub('sao', defaults)))).to.eql([
      'São Paulo',
    ]);
  });

  it('re-normalizes when filterKey changes between passes', () => {
    expect(filter.apply(data, stateStub('bulg', defaults))).to.be.empty;

    const byCountry = { ...defaults, filterKey: 'country' as const };
    expect(names(filter.apply(data, stateStub('bulg', byCountry)))).to.eql([
      'Sofia',
      'Plovdiv',
    ]);

    expect(filter.apply(data, stateStub('bulg', defaults))).to.be.empty;
  });
});
