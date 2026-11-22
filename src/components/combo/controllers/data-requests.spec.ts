import { aTimeout, expect } from '@open-wc/testing';
import type { PropertyValues } from 'lit';
import { type SinonSpy, spy } from 'sinon';

import type IgcComboComponent from '../combo.js';
import type { ComboFilteringMode } from '../types.js';
import { ComboDataRequests } from './data-requests.js';
import { newResultsHints } from './results-hint.js';

type Item = { id: number };

const items = (count: number, start = 0): Item[] =>
  Array.from({ length: count }, (_, i) => ({ id: start + i }));

const list = {
  updateComplete: Promise.resolve(true),
  checkVisibility: () => true,
  scrollToIndex: async () => {},
};

function setup(mode: ComboFilteringMode = 'remote') {
  const request = spy();
  const host = {
    open: true,
    data: items(10),
    filteringOptions: { filterKey: undefined, mode },
    valueKey: 'id' as keyof Item | undefined,
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

  it('keeps the sequence for a copy of the same records', async () => {
    const { host, requests, request } = setup();

    requests.rendered(9);
    const previous = host.data;
    host.data = items(10);
    requests.afterUpdate(changed([['data', previous]]), list);

    await aTimeout(0);
    expect(request.callCount).to.equal(1);
  });

  describe('new results', () => {
    const scrolled = () => {
      const scrollToIndex = spy(async (_index: number) => {});
      return { ...list, scrollToIndex };
    };

    it('scroll a shown list to the top at once', () => {
      const { host, requests } = setup();
      const shown = scrolled();
      const previous = host.data;

      host.data = items(10, 100);

      expect(requests.dataChanged(previous, shown)).to.be.true;
      expect(shown.scrollToIndex.calledOnceWith(0)).to.be.true;
    });

    it('come after a search, also with the same first record, or in a shorter data', () => {
      const { host, requests } = setup();
      const previous = host.data;

      requests.searched();
      host.data = [previous[0], ...previous.slice(1).reverse()];
      expect(requests.dataChanged(previous, scrolled())).to.be.true;

      host.data = previous.slice(0, 5);
      expect(requests.dataChanged(previous, scrolled())).to.be.true;
    });

    it('keep the place for a page appended after a search that did not load', () => {
      const { host, requests } = setup();
      const previous = host.data;

      requests.searched();
      host.data = [...previous, ...items(10, 10)];

      expect(requests.dataChanged(previous, scrolled())).to.be.false;
    });

    it('need a value key to compare the first records, and a previous data', () => {
      const { host, requests } = setup();
      const previous = host.data;

      host.valueKey = undefined;
      host.data = items(10, 100);
      expect(requests.dataChanged(previous, scrolled())).to.be.false;

      host.valueKey = 'id';
      expect(requests.dataChanged([], scrolled())).to.be.false;
    });

    it('keep the place for a copy of the same records and an appended page', () => {
      const { host, requests } = setup();
      const previous = host.data;
      const shown = scrolled();

      host.data = items(10);
      expect(requests.dataChanged(previous, shown)).to.be.false;

      host.data = [...previous, ...items(10, 10)];
      expect(requests.dataChanged(previous, shown)).to.be.false;
      expect(shown.scrollToIndex.called).to.be.false;
    });

    it('compare all the old items for an append', () => {
      const { host, requests } = setup();
      const previous = host.data;

      requests.searched();
      host.data = [previous[0], ...items(8, 50), previous[9], ...items(5, 60)];

      expect(requests.dataChanged(previous, scrolled())).to.be.true;
    });

    it('come only in the first data after a search', () => {
      const { host, requests } = setup();
      const previous = host.data;

      requests.searched();
      host.data = items(10);
      expect(requests.dataChanged(previous, scrolled())).to.be.true;
      requests.afterUpdate(changed([['data', previous]]), list);

      const copy = host.data;
      host.data = items(10);
      expect(requests.dataChanged(copy, scrolled())).to.be.false;
    });

    it('follow the hint of a binder until the update of the data', async () => {
      const { host, requests, request } = setup();
      const previous = host.data;

      requests.rendered(9);

      // A first page of the binder with the same records.
      newResultsHints.set(host, true);
      host.data = items(10);
      expect(requests.dataChanged(previous, scrolled())).to.be.true;
      requests.afterUpdate(changed([['data', previous]]), list);

      await aTimeout(0);
      expect(request.callCount).to.equal(2);

      const copy = host.data;
      host.data = items(10);
      expect(requests.dataChanged(copy, scrolled())).to.be.false;

      // A next page of the binder.
      newResultsHints.set(host, false);
      host.data = items(10, 100);
      expect(requests.dataChanged(copy, scrolled())).to.be.false;
    });

    it('do not move the list in local mode', () => {
      const { host, requests } = setup('local');
      const previous = host.data;

      requests.searched();
      host.data = items(10, 100);

      expect(requests.dataChanged(previous, scrolled())).to.be.false;
    });

    it('scroll a hidden list to the top when it opens, before the check', async () => {
      const { host, requests, request } = setup();
      let show = () => {};
      // A hidden list keeps the scroll, and resolves when it shows and scrolls.
      const scrollToIndex = spy(
        (_index: number) =>
          new Promise<void>((resolve) => {
            show = resolve;
          })
      );
      const hidden = { ...list, scrollToIndex };
      const previous = host.data;

      host.data = items(10, 100);
      requests.dataChanged(previous, hidden);
      expect(scrollToIndex.calledOnceWith(0)).to.be.true;

      requests.rendered(9);
      requests.afterUpdate(changed([['open', false]]), hidden);
      await aTimeout(0);

      expect(request.callCount).to.equal(1);

      show();
      await aTimeout(0);

      expect(request.callCount).to.equal(2);
      expect(scrollToIndex.firstCall.calledBefore(request.lastCall)).to.be.true;

      requests.afterUpdate(changed([['open', false]]), hidden);
      await aTimeout(0);

      expect(scrollToIndex.calledOnce).to.be.true;
    });
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
