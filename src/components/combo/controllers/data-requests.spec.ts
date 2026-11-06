import { aTimeout, expect } from '@open-wc/testing';
import type { PropertyValues } from 'lit';
import { type SinonSpy, spy } from 'sinon';

import type IgcComboComponent from '../combo.js';
import type { ComboFilteringMode } from '../types.js';
import { ComboDataRequests } from './data-requests.js';

type Item = { id: number };

const items = (count: number, start = 0): Item[] =>
  Array.from({ length: count }, (_, i) => ({ id: start + i }));

const list = { updateComplete: Promise.resolve(true) };

function setup(mode: ComboFilteringMode = 'remote') {
  const request = spy();
  const host = {
    open: true,
    data: items(10),
    filteringOptions: { filterKey: undefined, mode },
  };
  const state = { loadedLength: 10, totalCount: 100 };
  const requests = new ComboDataRequests<Item>(host, state, request);

  return { host, state, requests, request };
}

function changed(
  entries: [string, unknown][]
): PropertyValues<IgcComboComponent<Item>> {
  return new Map(entries) as PropertyValues<IgcComboComponent<Item>>;
}

function requested(request: SinonSpy) {
  return request.args.map(([detail]) => detail);
}

describe('Combo data requests', () => {
  it('requests the next items when the window comes near the end of data', () => {
    const { requests, request } = setup();

    requests.rendered(4);
    expect(request.called).to.be.false;

    requests.rendered(5);
    expect(request.calledOnce).to.be.true;
    expect(requested(request)).to.eql([{ startIndex: 10, count: 20 }]);
  });

  it('does not request in local mode', () => {
    const { requests, request } = setup('local');

    requests.rendered(9);
    expect(request.called).to.be.false;
  });

  it('does not request while the list is closed', () => {
    const { host, requests, request } = setup();

    host.open = false;
    requests.rendered(9);
    expect(request.called).to.be.false;
  });

  it('waits for the first page of an empty data', () => {
    const { host, state, requests, request } = setup();

    host.data = [];
    state.loadedLength = 0;
    requests.rendered(9);
    expect(request.called).to.be.false;
  });

  it('does not request when data holds all the items', () => {
    const { state, requests, request } = setup();

    state.totalCount = 10;
    requests.rendered(9);
    expect(request.called).to.be.false;
  });

  it('covers the rendered placeholders with the count', () => {
    const { requests, request } = setup();

    requests.rendered(39);
    expect(requested(request)).to.eql([{ startIndex: 10, count: 30 }]);
  });

  it('stops the count at the total', () => {
    const { state, requests, request } = setup();

    state.totalCount = 25;
    requests.rendered(9);
    expect(requested(request)).to.eql([{ startIndex: 10, count: 15 }]);
  });

  it('requests one time for each length of data', () => {
    const { host, state, requests, request } = setup();

    requests.rendered(9);
    requests.rendered(9);
    expect(request.callCount).to.equal(1);

    host.data = [...host.data, ...items(10, 10)];
    state.loadedLength = 20;
    requests.rendered(19);
    expect(requested(request)).to.eql([
      { startIndex: 10, count: 20 },
      { startIndex: 20, count: 20 },
    ]);
  });

  it('requests the same length again after a reset', () => {
    const { requests, request } = setup();

    requests.rendered(9);
    requests.reset();
    requests.rendered(9);
    expect(request.callCount).to.equal(2);
  });

  it('starts again and checks after the list update when the list opens', async () => {
    const { requests, request } = setup();

    requests.rendered(9);
    requests.afterUpdate(changed([['open', false]]), list);
    expect(request.callCount).to.equal(1);

    await aTimeout(0);
    expect(request.callCount).to.equal(2);
  });

  it('keeps the sequence and does not check when the list closes', async () => {
    const { host, requests, request } = setup();

    requests.rendered(9);
    host.open = false;
    requests.afterUpdate(changed([['open', true]]), list);
    host.open = true;

    await aTimeout(0);
    requests.rendered(9);
    expect(request.callCount).to.equal(1);
  });

  it('does not check for a change of other properties', async () => {
    const { host, requests, request } = setup();

    host.open = false;
    requests.rendered(9);
    host.open = true;
    requests.afterUpdate(changed([['label', 'City']]), list);

    await aTimeout(0);
    expect(request.called).to.be.false;
  });

  it('starts again when data is replaced', async () => {
    const { host, requests, request } = setup();

    requests.rendered(9);
    const previous = host.data;
    host.data = items(10, 100);
    requests.afterUpdate(changed([['data', previous]]), list);

    await aTimeout(0);
    expect(requested(request)).to.eql([
      { startIndex: 10, count: 20 },
      { startIndex: 10, count: 20 },
    ]);
  });

  it('keeps the sequence when data starts with the same item', async () => {
    const { host, requests, request } = setup();

    requests.rendered(9);
    const previous = host.data;
    host.data = [...previous];
    requests.afterUpdate(changed([['data', previous]]), list);

    await aTimeout(0);
    expect(request.callCount).to.equal(1);
  });

  it('checks after the list update when the total changes', async () => {
    const { state, requests, request } = setup();

    state.totalCount = 10;
    requests.rendered(9);
    expect(request.called).to.be.false;

    state.totalCount = 100;
    requests.afterUpdate(changed([['totalItemCount', 10]]), list);
    await aTimeout(0);
    expect(request.callCount).to.equal(1);
  });
});
