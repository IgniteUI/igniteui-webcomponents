import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  simulateClick,
  simulateInput,
} from '#internals/testing/simulate.spec.js';
import IgcComboComponent from '../components/combo/combo.js';
import type IgcInputComponent from '../components/input/input.js';
import type IgcVirtualScrollComponent from '../components/virtualization/virtualization.js';
import {
  bindComboDataSource,
  type ComboDataBinding,
  type ComboDataPage,
  type ComboDataRequest,
  type ComboDataSource,
  type ComboDataSourceOptions,
} from './combo-data-source.js';

type Place = { id: string; name: string };

const PLACES: Place[] = [
  ['AMS', 'Amsterdam'],
  ['ATH', 'Athens'],
  ['BAR', 'Barcelona'],
  ['BEL', 'Belgrade'],
  ['BRA', 'Bratislava'],
  ['BRU', 'Brussels'],
  ['BUC', 'Bucharest'],
  ['BUD', 'Budapest'],
  ['CPH', 'Copenhagen'],
  ['DUB', 'Dublin'],
  ['BER', 'Berlin'],
  ['BRN', 'Bern'],
  ['BGO', 'Bergen'],
  ['ALB', 'Alberobello'],
  ['HEL', 'Helsinki'],
  ['LIS', 'Lisbon'],
  ['LON', 'London'],
  ['MAD', 'Madrid'],
  ['OSL', 'Oslo'],
  ['PAR', 'Paris'],
  ['PRG', 'Prague'],
  ['RIG', 'Riga'],
  ['ROM', 'Rome'],
  ['SOF', 'Sofia'],
].map(([id, name]) => ({ id, name }));

/** The results of a search, as new objects, as parsed JSON gives them. */
function page({
  searchText,
  startIndex,
  count,
}: ComboDataRequest): ComboDataPage<Place> {
  const results = PLACES.filter(({ name }) =>
    name.toLowerCase().includes(searchText.toLowerCase())
  );

  return {
    items: results
      .slice(startIndex, startIndex + count)
      .map((place) => ({ ...place })),
    totalCount: results.length,
  };
}

type PendingRequest = {
  request: ComboDataRequest;
  signal: AbortSignal;
  answer: () => void;
  fail: (error: unknown) => void;
};

describe('Combo data source binding', () => {
  let combo: IgcComboComponent<Place>;
  let input: IgcInputComponent;
  let searchNative: HTMLInputElement;
  let requests: PendingRequest[];
  let source: ComboDataSource<Place>;
  let binding: ComboDataBinding;

  /** Lets an answer reach the combo, and the combo render it. */
  async function flush(): Promise<void> {
    await Promise.resolve();
    await elementUpdated(combo);
    await elementUpdated(combo);
  }

  /** Waits for the list to render, so that it can request the next page. */
  async function settle(): Promise<void> {
    await flush();
    await nextFrame();
    await (
      combo.renderRoot.querySelector(
        'igc-virtual-scroll'
      ) as IgcVirtualScrollComponent
    ).layoutComplete;
    await nextFrame();
  }

  async function answer(index: number): Promise<void> {
    requests[index].answer();
    await settle();
  }

  async function open(): Promise<void> {
    simulateClick(input);
    await elementUpdated(combo);
  }

  const bind = (options?: ComboDataSourceOptions) =>
    (binding = bindComboDataSource(combo, source, {
      pageSize: 10,
      ...options,
    }));

  const ids = (items: Place[]) => items.map(({ id }) => id);

  before(() => {
    defineComponents(IgcComboComponent);
  });

  beforeEach(async () => {
    combo = await fixture<IgcComboComponent<Place>>(
      html`<igc-combo value-key="id" display-key="name"></igc-combo>`
    );
    input = combo.renderRoot.querySelector('igc-input#target')!;
    searchNative = combo.renderRoot
      .querySelector<IgcInputComponent>('[part="search-input"]')!
      .renderRoot.querySelector('input')!;

    requests = [];
    source = {
      load: (request, signal) =>
        new Promise((resolve, reject) => {
          requests.push({
            request,
            signal,
            answer: () => resolve(page(request)),
            fail: reject,
          });
        }),
    };
  });

  afterEach(() => {
    binding?.dispose();
  });

  it('sets the remote mode and loads the first page on open', async () => {
    bind();
    expect(combo.filteringOptions.mode).to.equal('remote');

    await open();

    expect(requests.map(({ request }) => request)).to.eql([
      { searchText: '', startIndex: 0, count: 10 },
    ]);

    await answer(0);

    expect(ids(combo.data)).to.eql(ids(PLACES.slice(0, 10)));
  });

  it('appends the next pages near the end and stops at the total count', async () => {
    const list =
      combo.renderRoot.querySelector<IgcVirtualScrollComponent>(
        'igc-virtual-scroll'
      )!;

    bind();
    await open();
    await answer(0);
    await answer(1);
    list.scrollToIndex(19);
    await settle();
    await answer(2);
    list.scrollToIndex(PLACES.length - 1);
    await settle();

    expect(requests.map(({ request }) => request.startIndex)).to.eql([
      0, 10, 20,
    ]);
    expect(requests[1].request.count).to.equal(10);
    expect(ids(combo.data)).to.eql(ids(PLACES));
  });

  it('does not load on open with `loadOnOpen: false`', async () => {
    bind({ loadOnOpen: false });
    await open();

    expect(requests).to.be.empty;
  });

  describe('Search', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });

    it('waits for a pause in the typing and aborts the request in flight', async () => {
      bind({ debounce: 300 });
      await open();

      simulateInput(searchNative, { value: 'b' });
      simulateInput(searchNative, { value: 'be' });
      simulateInput(searchNative, { value: 'ber ' });

      expect(requests[0].signal.aborted).to.be.true;

      clock.tick(299);
      expect(requests).lengthOf(1);

      clock.tick(1);
      expect(requests[1].request).to.eql({
        searchText: 'ber',
        startIndex: 0,
        count: 10,
      });

      requests[1].answer();
      requests[0].answer();
      await flush();

      expect(ids(combo.data)).to.eql(['BER', 'BRN', 'BGO', 'ALB']);
    });

    it('keeps the selection across searches', async () => {
      bind({ debounce: 0 });
      await open();
      requests[0].answer();
      await flush();

      combo.select(['AMS', 'ATH']);
      simulateInput(searchNative, { value: 'ber' });
      clock.tick(0);
      requests.at(-1)!.answer();
      await flush();

      expect(ids(combo.data)).to.eql(['BER', 'BRN', 'BGO', 'ALB']);
      expect(combo.value).to.eql(['AMS', 'ATH']);
      expect(ids(combo.selection)).to.eql(['AMS', 'ATH']);
    });

    it('reports a failed request and keeps the items', async () => {
      const onError = spy();
      const error = new Error('The server is down.');

      bind({ debounce: 0, onError });
      await open();
      requests[0].answer();
      await flush();

      simulateInput(searchNative, { value: 'ber' });
      clock.tick(0);
      requests.at(-1)!.fail(error);
      await flush();

      expect(onError).calledOnceWith(error);
      expect(ids(combo.data)).to.eql(ids(PLACES.slice(0, 10)));
    });

    it('does not load again for the same trimmed text', async () => {
      bind({ debounce: 0 });
      await open();

      simulateInput(searchNative, { value: 'ber' });
      clock.tick(0);
      simulateInput(searchNative, { value: 'ber ' });
      clock.tick(0);

      expect(requests.map(({ request }) => request.searchText)).to.eql([
        '',
        'ber',
      ]);
    });

    it('continues the loaded search after a failed search', async () => {
      bind({ debounce: 0, onError: () => {} });
      await open();
      requests[0].answer();
      await flush();

      simulateInput(searchNative, { value: 'ber' });
      clock.tick(0);
      requests.at(-1)!.fail(new Error('The server is down.'));
      await flush();

      combo.dispatchEvent(
        new CustomEvent('igcDataRequest', {
          detail: { startIndex: 10, count: 20 },
        })
      );

      expect(requests.at(-1)!.request).to.eql({
        searchText: '',
        startIndex: 10,
        count: 10,
      });
    });

    it('loads a search of a closed list on the next opening', async () => {
      bind({ debounce: 0 });
      await open();
      requests[0].answer();
      await flush();
      await combo.hide();

      combo.dispatchEvent(
        new CustomEvent('igcSearchInput', { detail: { searchText: 'ber' } })
      );
      clock.tick(0);
      const before = requests.length;

      await open();

      expect(requests).lengthOf(before + 1);
      expect(requests.at(-1)!.request.searchText).to.equal('ber');
    });
  });

  it('selects the items of preset values one time', async () => {
    const resolve = spy(async (values: unknown[]) =>
      PLACES.filter(({ id }) => values.includes(id)).map((place) => ({
        ...place,
      }))
    );

    combo.value = ['OSL', 'AMS'];
    source.resolve = resolve;
    bind();
    await waitUntil(() => input.value === 'Amsterdam, Oslo');

    expect(resolve).calledOnce;
    expect(resolve.firstCall.args[0]).to.eql(['OSL', 'AMS']);
    expect(combo.value).to.have.members(['OSL', 'AMS']);

    await open();
    await answer(0);

    expect(resolve).calledOnce;
    expect(combo.value).to.have.members(['OSL', 'AMS']);
  });

  it('selects the items of values set later when the list opens', async () => {
    source.resolve = async (values) =>
      PLACES.filter(({ id }) => values.includes(id));
    bind();
    await open();
    await answer(0);
    await combo.hide();

    combo.value = ['OSL'];
    await open();
    await waitUntil(() => input.value === 'Oslo');

    expect(ids(combo.selection)).to.eql(['OSL']);
  });

  it('loads the first page again on refresh', async () => {
    bind();
    await open();
    await answer(0);

    const refresh = binding.refresh();

    expect(requests.at(-1)!.request).to.eql({
      searchText: '',
      startIndex: 0,
      count: 10,
    });

    requests.at(-1)!.answer();
    await refresh;

    expect(ids(combo.data)).to.eql(ids(PLACES.slice(0, 10)));
  });

  it('does not select all the items when resolve finds none', async () => {
    const resolve = spy(async () => []);

    source.resolve = resolve;
    bind();
    await open();
    await answer(0);
    await combo.hide();

    combo.value = ['XXX'];
    await open();
    await waitUntil(() => resolve.called);
    await flush();

    expect(combo.selection).to.be.empty;
  });

  it('calls resolve again after a failure', async () => {
    const onError = spy();
    let fails = true;

    source.resolve = async (values) => {
      if (fails) {
        fails = false;
        throw new Error('The server is down.');
      }
      return PLACES.filter(({ id }) => values.includes(id));
    };

    combo.value = ['OSL'];
    bind({ onError });
    await waitUntil(() => onError.called);

    await open();
    await waitUntil(() => input.value === 'Oslo');

    expect(ids(combo.selection)).to.eql(['OSL']);
  });

  it('gives the mode back and ignores refresh after dispose', async () => {
    bind();
    binding.dispose();
    await binding.refresh();

    expect(combo.filteringOptions.mode).to.be.undefined;
    expect(requests).to.be.empty;
  });

  it('removes its listeners and aborts the request in flight on dispose', async () => {
    bind();
    await open();

    binding.dispose();
    expect(requests[0].signal.aborted).to.be.true;

    await combo.hide();
    await open();
    simulateInput(searchNative, { value: 'ber' });
    await nextFrame();

    expect(requests).lengthOf(1);
  });
});
