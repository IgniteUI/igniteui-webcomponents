import { expect } from '@open-wc/testing';
import { spy } from 'sinon';

import type { ComboRecord, FilteringOptions } from '../types.js';
import { DataState, type DataStateHost } from './data.js';

type City = { id: number; name: string; country: string };

const cities: City[] = [
  { id: 1, name: 'Sofia', country: 'Bulgaria' },
  { id: 2, name: 'Plovdiv', country: 'Bulgaria' },
  { id: 3, name: 'Berlin', country: 'Germany' },
  { id: 4, name: 'Hamburg', country: 'Germany' },
  { id: 5, name: 'Paris', country: 'France' },
];
const [sofia, plovdiv, , , paris] = cities;

const remote: FilteringOptions<City> = { filterKey: 'name', mode: 'remote' };

function setup(overrides: Partial<DataStateHost<City>> = {}) {
  const host: DataStateHost<City> = {
    addController: () => {},
    requestUpdate: spy(),
    data: cities,
    locale: 'en',
    filteringOptions: {
      filterKey: 'name',
      caseSensitive: false,
      matchDiacritics: false,
    },
    valueKey: 'id',
    displayKey: 'name',
    groupKey: undefined,
    groupSorting: 'asc',
    totalItemCount: undefined,
    showSelectAll: false,
    groupSelection: false,
    singleSelect: false,
    ...overrides,
  };
  const state = new DataState<City>(host);

  state.hostUpdate();
  return { host, state };
}

/** A short name for each record: the city name, `#group` for a header, or the kind. */
function names(records: readonly ComboRecord<City>[]): string[] {
  return records.map((record) =>
    record.header ? `#${record.group}` : (record.kind ?? record.value.name)
  );
}

function positions(records: readonly ComboRecord<City>[]): number[] {
  return records.map((record) => record.position);
}

describe('Combo data state', () => {
  it('numbers the options in the order of data', () => {
    const { state } = setup();

    expect(names(state.dataState)).to.eql([
      'Sofia',
      'Plovdiv',
      'Berlin',
      'Hamburg',
      'Paris',
    ]);
    expect(positions(state.dataState)).to.eql([1, 2, 3, 4, 5]);
    expect(state.optionCount).to.equal(5);
    expect(state.loadedLength).to.equal(5);
  });

  it('filters by the new text of an item after a new data', () => {
    const data = cities.map((city) => ({ ...city }));
    const { host, state } = setup({ data });

    state.searchTerm = 'sof';
    state.hostUpdate();
    expect(names(state.dataState)).to.eql(['Sofia']);

    data[0].name = 'Ruse';
    host.data = [...data];
    state.hostUpdate();

    expect(state.dataState).to.be.empty;
  });

  it('filters by the search term in the next update', () => {
    const { host, state } = setup();

    state.searchTerm = 'r';
    expect(host.requestUpdate).to.have.been.calledOnce;
    expect(state.dataState).to.have.length(5);

    state.hostUpdate();
    expect(names(state.dataState)).to.eql(['Berlin', 'Hamburg', 'Paris']);
    expect(positions(state.dataState)).to.eql([1, 2, 3]);
  });

  it('keeps all the records in remote mode', () => {
    const { state } = setup({ filteringOptions: remote });

    state.searchTerm = 'r';
    state.hostUpdate();
    expect(state.dataState).to.have.length(5);
  });

  it('puts a header before each group, and the headers are not options', () => {
    const { state } = setup({ groupKey: 'country' });

    expect(names(state.dataState)).to.eql([
      '#Bulgaria',
      'Sofia',
      'Plovdiv',
      '#France',
      'Paris',
      '#Germany',
      'Berlin',
      'Hamburg',
    ]);
    expect(positions(state.dataState)).to.eql([-1, 1, 2, -1, 3, -1, 4, 5]);
    expect(state.firstOptionIndex).to.equal(1);
    expect(state.isOption(state.dataState[0])).to.be.false;
    expect(state.isToggle(state.dataState[0])).to.be.false;
  });

  it('makes the headers toggle options with groupSelection', () => {
    const { state } = setup({ groupKey: 'country', groupSelection: true });
    const [header, item] = state.dataState;

    expect(positions(state.dataState)).to.eql([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(state.optionCount).to.equal(8);
    expect(state.firstOptionIndex).to.equal(0);
    expect(state.isOption(header)).to.be.true;
    expect(state.isToggle(header)).to.be.true;
    expect(state.isToggle(item)).to.be.false;
  });

  it('does not make the headers options in single selection', () => {
    const { state } = setup({
      groupKey: 'country',
      groupSelection: true,
      singleSelect: true,
    });

    expect(state.isOption(state.dataState[0])).to.be.false;
    expect(state.optionCount).to.equal(5);
  });

  it('puts the select-all option first, only in multiple selection and with items', () => {
    const { state } = setup({ showSelectAll: true });
    const [selectAll] = state.dataState;

    expect(names(state.dataState)[0]).to.equal('select-all');
    expect(positions(state.dataState).slice(1)).to.eql([2, 3, 4, 5, 6]);
    expect(state.optionCount).to.equal(6);
    expect(state.loadedLength).to.equal(6);
    expect(state.isToggle(selectAll)).to.be.true;

    state.searchTerm = 'xyz';
    state.hostUpdate();
    expect(state.dataState).to.be.empty;

    expect(
      names(setup({ showSelectAll: true, singleSelect: true }).state.dataState)
    ).not.to.include('select-all');
  });

  it('appends a placeholder for each item to load in remote mode', () => {
    const { state } = setup({ filteringOptions: remote, totalItemCount: 8 });

    expect(names(state.dataState).slice(5)).to.eql([
      'placeholder',
      'placeholder',
      'placeholder',
    ]);
    expect(state.loadedLength).to.equal(5);
    expect(state.optionCount).to.equal(8);

    expect(setup({ totalItemCount: 8 }).state.dataState).to.have.length(5);
    expect(
      setup({ filteringOptions: remote, totalItemCount: 8, data: [] }).state
        .dataState
    ).to.be.empty;
  });

  it('counts the total only in remote mode and as a whole number', () => {
    expect(
      setup({ filteringOptions: remote, totalItemCount: 7.9 }).state.totalCount
    ).to.equal(7);
    expect(
      setup({ filteringOptions: remote, totalItemCount: Number.NaN }).state
        .totalCount
    ).to.equal(Number.POSITIVE_INFINITY);
    expect(setup({ totalItemCount: 7 }).state.totalCount).to.equal(
      Number.POSITIVE_INFINITY
    );
  });

  it('gives a group header the items up to the next header', () => {
    const { state } = setup({ groupKey: 'country', groupSelection: true });

    expect(state.itemsOf(0)).to.eql([sofia, plovdiv]);
    expect(state.itemsOf(5).map(({ name }) => name)).to.eql([
      'Berlin',
      'Hamburg',
    ]);
  });

  it('gives the select-all option all the loaded items, one time each', () => {
    const { state } = setup({
      data: [sofia, sofia, plovdiv],
      filteringOptions: remote,
      showSelectAll: true,
      totalItemCount: 10,
    });

    expect(state.itemsOf(0)).to.eql([sofia, plovdiv]);
  });

  it('tells whether none, some or all the items of a toggle option are selected', () => {
    const { state } = setup({ groupKey: 'country', groupSelection: true });

    expect(state.selectionOf(0, new Set())).to.be.false;
    expect(state.selectionOf(0, new Set([paris]))).to.be.false;
    expect(state.selectionOf(0, new Set([sofia]))).to.equal('mixed');
    expect(state.selectionOf(0, new Set([sofia, plovdiv]))).to.be.true;
  });

  it('gives the select-all option the state of all the loaded items', () => {
    const { state } = setup({
      filteringOptions: remote,
      showSelectAll: true,
      totalItemCount: 10,
    });

    expect(state.selectionOf(0, new Set(cities))).to.be.true;
    expect(state.selectionOf(0, new Set([plovdiv]))).to.equal('mixed');
  });

  it('limits the toggle ranges and the shown items to the filtered records', () => {
    const { state } = setup({ groupKey: 'country', groupSelection: true });

    state.searchTerm = 'a';
    state.hostUpdate();

    expect(state.itemsOf(0)).to.eql([sofia]);
    expect(state.selectionOf(0, new Set([sofia]))).to.be.true;
    expect(state.shownItems().map(({ name }) => name)).to.eql([
      'Sofia',
      'Paris',
      'Hamburg',
    ]);
  });

  it('runs the pipeline again when a host field that it reads changes', () => {
    const changes: Partial<DataStateHost<City>>[] = [
      { groupKey: undefined },
      { groupSorting: 'desc' },
      { valueKey: 'name' },
      { displayKey: 'country' },
      { showSelectAll: true },
      { groupSelection: true },
      { singleSelect: true },
      { filteringOptions: { filterKey: 'country', caseSensitive: false } },
      { filteringOptions: { filterKey: 'name', caseSensitive: true } },
      { filteringOptions: { filterKey: 'name', matchDiacritics: true } },
      { filteringOptions: remote },
    ];

    for (const change of changes) {
      const { host, state } = setup({ groupKey: 'country' });
      const records = state.dataState;

      Object.assign(host, change);

      expect(state.hostUpdate(), Object.keys(change)[0]).to.be.true;
      expect(state.dataState).not.to.equal(records);
      expect(state.hostUpdate()).to.be.false;
    }

    const { host, state } = setup({ filteringOptions: remote });

    host.totalItemCount = 8;
    expect(state.hostUpdate()).to.be.true;
    expect(state.optionCount).to.equal(8);
    expect(host.requestUpdate).not.to.have.been.called;
  });

  it('does not run the pipeline for the same fields', () => {
    const { host, state } = setup();

    host.filteringOptions = { ...host.filteringOptions };
    host.data = [...cities];

    expect(state.hostUpdate()).to.be.true;
    expect(state.hostUpdate()).to.be.false;

    host.filteringOptions = { ...host.filteringOptions };
    expect(state.hostUpdate()).to.be.false;
  });

  it('reads only the filter mode in remote mode', () => {
    const { host, state } = setup({ filteringOptions: remote });

    host.filteringOptions = { ...remote, caseSensitive: true };
    expect(state.hostUpdate()).to.be.false;

    host.filteringOptions = { ...remote, mode: 'local' };
    expect(state.hostUpdate()).to.be.true;
  });

  it('gives the group headers the new keys', () => {
    const { host, state } = setup({ groupKey: 'country' });

    host.displayKey = 'country';
    state.hostUpdate();

    const [header] = state.dataState;
    expect(header.header).to.be.true;
    expect(header.value).to.eql({ id: 'Bulgaria', country: 'Bulgaria' });
  });

  it('keeps the records of the loaded items when data grows', () => {
    const { host, state } = setup();
    const records = state.dataState;
    const lyon = { id: 6, name: 'Lyon', country: 'France' };

    host.data = [...cities, lyon];
    state.hostUpdate();

    expect(state.dataState.slice(0, 5)).to.have.ordered.members(records);
    expect(names(state.dataState).at(-1)).to.equal('Lyon');
    expect(positions(state.dataState)).to.eql([1, 2, 3, 4, 5, 6]);

    // The same array, grown in place.
    const data = [...cities];
    host.data = data;
    state.hostUpdate();
    const grown = state.dataState;

    data.push(lyon);
    state.hostUpdate();

    expect(state.dataState.slice(0, 5)).to.have.ordered.members(grown);
  });

  it('indexes all the items again when the loaded items change', () => {
    const { host, state } = setup();
    const [first] = state.dataState;

    host.data = [plovdiv, sofia, ...cities.slice(2)];
    state.hostUpdate();

    expect(names(state.dataState).slice(0, 2)).to.eql(['Plovdiv', 'Sofia']);
    expect(state.dataState).not.to.include(first);
  });

  it('keeps the state of a toggle option for one version of the selection', () => {
    const { state } = setup({ groupKey: 'country', groupSelection: true });
    const selected = new Set([sofia, plovdiv]);

    expect(state.selectionOf(0, selected, 1)).to.be.true;

    selected.delete(plovdiv);
    expect(state.selectionOf(0, selected, 1)).to.be.true;
    expect(state.selectionOf(0, selected, 2)).to.equal('mixed');

    // Without a version, nothing is kept.
    selected.add(plovdiv);
    expect(state.selectionOf(0, selected)).to.be.true;
    expect(state.selectionOf(0, selected, 2)).to.equal('mixed');

    // A pipeline run reads the selection again.
    selected.delete(plovdiv);
    state.searchTerm = 'a';
    state.hostUpdate();
    expect(state.selectionOf(0, selected, 2)).to.be.true;
  });

  it('sorts the groups again in a new locale', () => {
    const { host, state } = setup({ groupKey: 'country' });

    host.locale = 'bg';
    expect(state.hostUpdate()).to.be.true;
    expect(state.compareCollator.resolvedOptions().locale).to.equal('bg');

    // Without groups, the locale does not change the records.
    const ungrouped = setup();

    ungrouped.host.locale = 'bg';
    expect(ungrouped.state.hostUpdate()).to.be.false;
  });
});
