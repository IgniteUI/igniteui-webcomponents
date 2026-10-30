import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { type SinonSpy, spy } from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  endKey,
  enterKey,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  comboStable,
  openComboPopover,
  items,
} from '#internals/testing/combo.spec.js';
import {
  axeReflectedRelationsOptions,
  suppressResizeObserverLoopError,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateBlur,
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import type IgcInputComponent from '../input/input.js';
import type IgcVirtualScrollComponent from '../virtualization/virtualization.js';
import IgcComboComponent from './combo.js';

describe('Combo', () => {
  let input: IgcInputComponent;
  let searchInput: IgcInputComponent;

  let list: IgcVirtualScrollComponent;

  before(() => {
    defineComponents(IgcComboComponent);
    suppressResizeObserverLoopError();
  });

  describe('Remote data', () => {
    type Place = { id: string; name: string; letter: string };

    const PLACES = [
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
    ] as const;

    /** A fake server. Each response has new objects, as parsed JSON has. */
    function search(text: string, skip = 0, top = 10): Place[] {
      return PLACES.filter(([, name]) =>
        name.toLowerCase().includes(text.toLowerCase())
      )
        .slice(skip, skip + top)
        .map(([id, name]) => ({ id, name, letter: name[0] }));
    }

    let remote: IgcComboComponent<Place>;
    let eventSpy: SinonSpy;
    let searchNative: HTMLInputElement;
    let mainNative: HTMLInputElement;

    const checked = () =>
      items(remote)
        .filter((item) => item.selected)
        .map((item) => item.textContent?.trim());

    const itemFor = (name: string) =>
      items(remote).find((item) => item.textContent?.trim() === name)!;

    const details = (name: string) =>
      eventSpy.withArgs(name).args.map(([, init]) => init.detail);

    const searchEvents = () =>
      details('igcSearchInput').map(({ searchText }) => searchText);

    beforeEach(async () => {
      remote = await fixture<IgcComboComponent<Place>>(
        html`<igc-combo
          .data=${search('')}
          value-key="id"
          display-key="name"
        ></igc-combo>`
      );
      remote.setAttribute('filtering-options', '{"mode": "remote"}');
      await elementUpdated(remote);

      input = remote.renderRoot.querySelector('igc-input#target')!;
      searchInput = remote.renderRoot.querySelector('[part="search-input"]')!;
      list = remote.renderRoot.querySelector('igc-virtual-scroll')!;
      mainNative = input.renderRoot.querySelector('input')!;
      searchNative = searchInput.renderRoot.querySelector('input')!;
      eventSpy = spy(remote, 'emitEvent');
    });

    it('takes the mode from the `filtering-options` attribute', () => {
      expect(remote.filteringOptions.mode).to.equal('remote');
      expect(remote.filteringOptions.filterKey).to.equal('name');
    });

    it('emits igcSearchInput when the user changes the search text', async () => {
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'ber' });
      simulateInput(searchNative, { value: '' });

      expect(searchEvents()).to.eql(['ber', '']);
    });

    it('does not filter the options in remote mode', async () => {
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'ber' });
      await comboStable(remote);

      expect(items(remote)).lengthOf(10);
      expect(searchInput.value).to.equal('ber');

      remote.filteringOptions = { mode: 'local' };
      await comboStable(remote);

      expect(items(remote)).lengthOf(0);
    });

    it('emits igcSearchInput in local mode too', async () => {
      remote.filteringOptions = { mode: 'local' };
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'bu' });

      expect(searchEvents()).to.eql(['bu']);
    });

    it('emits igcSearchInput from the main input in single selection, also when it is cleared', async () => {
      remote.singleSelect = true;
      await elementUpdated(remote);

      simulateInput(mainNative, { value: 'ber' });
      await comboStable(remote);

      expect(items(remote)).lengthOf(10);

      simulateInput(mainNative, { value: '' });
      await elementUpdated(remote);

      expect(searchEvents()).to.eql(['ber', '']);
    });

    it('emits igcSearchInput when a user action clears the search text, not on a property change', async () => {
      remote.singleSelect = true;
      remote.filteringOptions = { mode: 'local' };
      await elementUpdated(remote);

      simulateInput(mainNative, { value: 'a' });
      await comboStable(remote);

      simulateKeyboard(list, enterKey);
      await elementUpdated(remote);
      expect(remote.value).to.eql(['AMS']);

      simulateInput(mainNative, { value: 'b' });
      await elementUpdated(remote);
      remote.disableFiltering = true;
      await elementUpdated(remote);

      simulateInput(mainNative, { value: 'c' });
      await elementUpdated(remote);

      expect(searchEvents()).to.eql(['a', '', 'b']);
    });

    it('clears the search input and reports it when a blur clears the search text', async () => {
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'xyz' });
      await elementUpdated(remote);

      simulateBlur(remote);
      await elementUpdated(remote);

      expect(searchInput.value).to.equal('');
      expect(searchEvents()).to.eql(['xyz', '']);
    });

    it('activates no option of the old results on input in single selection', async () => {
      remote.singleSelect = true;
      await elementUpdated(remote);

      simulateInput(mainNative, { value: 'sof' });
      await comboStable(remote);

      simulateKeyboard(input, enterKey);
      await elementUpdated(remote);

      expect(items(remote).some((item) => item.active)).to.be.false;
      expect(remote.value).to.be.empty;
    });

    it('hides the case-sensitive icon in remote mode', async () => {
      remote.caseSensitiveIcon = true;
      await elementUpdated(remote);

      const icon = searchInput.querySelector('[part~="case-icon"]')!;
      expect(icon.slot).to.be.empty;

      remote.filteringOptions = { mode: 'local' };
      await elementUpdated(remote);

      expect(icon.slot).to.equal('suffix');
    });

    it('keeps the igcInput of the inputs inside', async () => {
      const inputSpy = spy();
      remote.addEventListener('igcInput', inputSpy);
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'ber' });

      remote.singleSelect = true;
      await elementUpdated(remote);
      simulateInput(mainNative, { value: 'ber' });

      expect(inputSpy).not.called;
    });

    it('keeps the selection when a search replaces the data (issue 2519)', async () => {
      await openComboPopover(remote);

      // 1. Check Amsterdam and Athens.
      simulateClick(itemFor('Amsterdam'));
      simulateClick(itemFor('Athens'));
      await comboStable(remote);
      expect(remote.value).to.eql(['AMS', 'ATH']);

      // 2. A search for "ber" replaces the data.
      remote.data = search('ber');
      await comboStable(remote);

      expect(remote.value).to.eql(['AMS', 'ATH']);
      expect(remote.selection.map(({ id }) => id)).to.eql(['AMS', 'ATH']);
      expect(input.value).to.equal('Amsterdam, Athens');

      // 3. Check Berlin.
      simulateClick(itemFor('Berlin'));
      await comboStable(remote);
      expect(remote.value).to.eql(['AMS', 'ATH', 'BER']);

      // 4. Clearing the search loads the first page again.
      remote.data = search('');
      await comboStable(remote);

      expect(remote.value).to.eql(['AMS', 'ATH', 'BER']);
      expect(remote.selection.map(({ id }) => id)).to.eql([
        'AMS',
        'ATH',
        'BER',
      ]);
      expect(remote.selection[0]).to.equal(remote.data[0]);
      expect(checked()).to.eql(['Amsterdam', 'Athens']);
      expect(input.value).to.equal('Amsterdam, Athens, Berlin');
    });

    it('deselects a selected item that the data does not hold', async () => {
      remote.select(['AMS', 'ATH']);
      remote.data = search('ber');
      await elementUpdated(remote);

      remote.deselect('AMS');
      await elementUpdated(remote);

      expect(remote.value).to.eql(['ATH']);
      expect(input.value).to.equal('Athens');
    });

    it('selects an object that the data does not hold', async () => {
      const oslo = { id: 'OSL', name: 'Oslo', letter: 'O' };

      remote.select(oslo);
      await elementUpdated(remote);

      expect(remote.value).to.eql(['OSL']);
      expect(remote.selection).to.eql([oslo]);
      expect(input.value).to.equal('Oslo');

      remote.data = search('oslo');
      await openComboPopover(remote);

      expect(remote.selection[0]).to.equal(remote.data[0]);
      expect(checked()).to.eql(['Oslo']);
    });

    it('selects an object that the data does not hold without a value key', async () => {
      const oslo = { id: 'OSL', name: 'Oslo', letter: 'O' };

      remote.valueKey = undefined;
      remote.select(oslo);
      await elementUpdated(remote);

      expect(remote.value).to.eql([oslo]);
      expect(remote.selection).to.eql([oslo]);
    });

    it('selects all the data and keeps the other selected items with select()', async () => {
      remote.select('AMS');
      remote.data = search('ber');
      await elementUpdated(remote);

      remote.select();
      await elementUpdated(remote);

      expect(remote.value).to.eql(['BER', 'BRN', 'BGO', 'ALB', 'AMS']);
    });

    it('selects each value one time with select() before a new data syncs', async () => {
      remote.data = search('ber');
      remote.value = ['BER'];
      remote.data = search('ber');
      remote.select();
      await elementUpdated(remote);

      expect(remote.value).to.eql(['BER', 'BRN', 'BGO', 'ALB']);
    });

    it('emits igcDataRequest near the end of the data, in data coordinates', async () => {
      remote.groupKey = 'letter';
      await openComboPopover(remote);

      expect(details('igcDataRequest')).to.eql([{ startIndex: 10, count: 20 }]);
    });

    it('does not repeat igcDataRequest until the data grows', async () => {
      await openComboPopover(remote);

      remote.data = [...remote.data];
      await openComboPopover(remote);

      expect(details('igcDataRequest')).lengthOf(1);

      remote.data = [...remote.data, ...search('', 10, 5)];
      await comboStable(remote);
      list.scrollToIndex(14);
      await comboStable(remote);

      expect(details('igcDataRequest')).to.eql([
        { startIndex: 10, count: 20 },
        { startIndex: 15, count: 20 },
      ]);
    });

    it('requests the next page of a new search with the same length', async () => {
      await openComboPopover(remote);

      simulateInput(searchNative, { value: 'b' });
      remote.data = search('b');
      await comboStable(remote);

      expect(details('igcDataRequest')).to.eql([
        { startIndex: 10, count: 20 },
        { startIndex: 10, count: 20 },
      ]);
    });

    it('requests the next page when the data is replaced without a search', async () => {
      await openComboPopover(remote);

      remote.data = search('');
      await comboStable(remote);

      expect(details('igcDataRequest')).to.eql([
        { startIndex: 10, count: 20 },
        { startIndex: 10, count: 20 },
      ]);
    });

    it('requests the same page again when the list opens again', async () => {
      await openComboPopover(remote);
      await remote.hide();
      await openComboPopover(remote);

      expect(details('igcDataRequest')).to.eql([
        { startIndex: 10, count: 20 },
        { startIndex: 10, count: 20 },
      ]);
    });

    it('does not emit igcDataRequest in local mode, while closed or without data', async () => {
      await comboStable(remote);
      expect(details('igcDataRequest')).to.be.empty;

      remote.data = [];
      await openComboPopover(remote);
      expect(details('igcDataRequest')).to.be.empty;

      await remote.hide();
      remote.filteringOptions = { mode: 'local' };
      remote.data = search('');
      await openComboPopover(remote);

      expect(details('igcDataRequest')).to.be.empty;
    });

    describe('Placeholders and loading', () => {
      const placeholders = () =>
        items(remote).filter((item) => item.part.contains('placeholder'));

      const loadingPart = () =>
        remote.renderRoot.querySelector<HTMLElement>('[part="loading"]');

      it('pads the list to `totalItemCount` with placeholder options in remote mode', async () => {
        remote.totalItemCount = 12;
        await openComboPopover(remote);
        list.scrollToIndex(11);
        await comboStable(remote);

        const [first, second] = placeholders();

        expect(items(remote)).lengthOf(12);
        expect(placeholders()).lengthOf(2);
        expect(items(remote)[0].getAttribute('aria-setsize')).to.equal('12');
        expect(first.getAttribute('aria-posinset')).to.equal('11');
        expect(second.getAttribute('aria-posinset')).to.equal('12');
        expect(second.getAttribute('aria-setsize')).to.equal('12');
        expect(second.getAttribute('aria-disabled')).to.equal('true');
        expect(second.getAttribute('aria-label')).to.equal('Loading');
        expect(details('igcDataRequest')).to.eql([
          { startIndex: 10, count: 2 },
        ]);

        await expect(remote).shadowDom.to.be.accessible(
          axeReflectedRelationsOptions
        );

        for (const total of [Number.POSITIVE_INFINITY, Number.NaN]) {
          remote.totalItemCount = total;
          await comboStable(remote);

          expect(items(remote)).lengthOf(10);
        }

        remote.totalItemCount = 12;
        remote.filteringOptions = { mode: 'local' };
        await comboStable(remote);

        expect(items(remote)).lengthOf(10);
      });

      it('shows the empty message, not placeholders, for an empty data', async () => {
        remote.data = [];
        remote.totalItemCount = 12;
        await openComboPopover(remote);

        expect(items(remote)).to.be.empty;
        expect(
          remote.renderRoot.querySelector('[part="empty"]')!.checkVisibility()
        ).to.be.true;
      });

      it('requests more items when `totalItemCount` no longer stops them', async () => {
        remote.totalItemCount = 10;
        await openComboPopover(remote);

        expect(details('igcDataRequest')).to.be.empty;

        // No placeholders come, so the list reports no change.
        remote.totalItemCount = undefined;
        await comboStable(remote);

        expect(details('igcDataRequest')).to.eql([
          { startIndex: 10, count: 20 },
        ]);
      });

      it('leaves the select-all option out of the requests and counts it in the positions', async () => {
        remote.showSelectAll = true;
        remote.totalItemCount = 12;
        await openComboPopover(remote);
        list.scrollToIndex(list.data.length - 1);
        await comboStable(remote);

        expect(details('igcDataRequest')).to.eql([
          { startIndex: 10, count: 2 },
        ]);
        expect(placeholders().at(-1)!.getAttribute('aria-posinset')).to.equal(
          '13'
        );

        remote.selectAllItems();

        expect(remote.value).to.eql(search('').map(({ id }) => id));
      });

      it('requests the rendered placeholders, up to `totalItemCount`', async () => {
        remote.totalItemCount = 100;
        await openComboPopover(remote);

        simulateKeyboard(list, endKey);
        await comboStable(remote);

        remote.data = [...remote.data, ...search('', 10, 5)];
        await comboStable(remote);

        expect(details('igcDataRequest')).to.eql([
          { startIndex: 10, count: 20 },
          { startIndex: 15, count: 85 },
        ]);

        remote.totalItemCount = 20;
        remote.data = [...remote.data, ...search('', 15, 5)];
        await comboStable(remote);

        expect(details('igcDataRequest')).lengthOf(2);
      });

      it('does not select a placeholder', async () => {
        remote.totalItemCount = 12;
        await openComboPopover(remote);

        simulateKeyboard(list, endKey);
        simulateKeyboard(list, spaceBar);
        simulateClick(placeholders().at(-1)!);
        await elementUpdated(remote);

        expect(remote.value).to.be.empty;

        remote.selectAllItems();

        expect(remote.value).to.eql(search('').map(({ id }) => id));
      });

      it('keeps the single selection list open on Enter or a click on a placeholder', async () => {
        remote.singleSelect = true;
        remote.totalItemCount = 12;
        await openComboPopover(remote);

        simulateKeyboard(list, endKey);
        simulateKeyboard(list, enterKey);
        simulateClick(placeholders().at(-1)!);
        await elementUpdated(remote);

        expect(details('igcClosing')).to.be.empty;
        expect(remote.open).to.be.true;
      });

      it('shows a spinner in place of the toggle icon and a loading message in an empty list', async () => {
        const empty =
          remote.renderRoot.querySelector<HTMLElement>('[part="empty"]')!;
        const toggle = remote.renderRoot.querySelector(
          '[part~="toggle-icon"]'
        )!;
        const icon = toggle.querySelector('igc-icon')!;
        const { width } = toggle.getBoundingClientRect();

        remote.data = [];
        remote.loading = true;
        await openComboPopover(remote);

        const spinner = loadingPart()!;

        expect(remote).to.have.attribute('loading');
        expect(toggle.contains(spinner)).to.be.true;
        expect(spinner.checkVisibility()).to.be.true;
        expect(icon.checkVisibility({ visibilityProperty: true })).to.be.false;
        expect(toggle.getBoundingClientRect().width).to.equal(width);
        const center = getCenterPoint(icon);
        const { x, y } = getCenterPoint(spinner);

        expect(x).to.be.closeTo(center.x, 0.5);
        expect(y).to.be.closeTo(center.y, 0.5);
        expect(internalsOf(spinner)?.getARIA('role')).to.equal('progressbar');
        expect(spinner.getAttribute('aria-label')).to.equal('Loading');
        expect(empty.innerText).to.equal('Loading');

        await expect(remote).shadowDom.to.be.accessible(
          axeReflectedRelationsOptions
        );

        remote.loading = false;
        await elementUpdated(remote);

        expect(spinner.checkVisibility()).to.be.false;
        expect(icon.checkVisibility({ visibilityProperty: true })).to.be.true;
        expect(empty.innerText).to.equal('The list is empty');
      });

      it('centers the ring of the spinner on the toggle icon, and removes the spinner after loading', async () => {
        const icon = remote.renderRoot.querySelector(
          '[part~="toggle-icon"] igc-icon'
        )!;

        remote.loading = true;
        await openComboPopover(remote);

        const ring = loadingPart()!.shadowRoot!.querySelector('[part~="svg"]')!;
        const center = getCenterPoint(icon);
        const { x, y } = getCenterPoint(ring);

        expect(x).to.be.closeTo(center.x, 0.5);
        expect(y).to.be.closeTo(center.y, 0.5);

        remote.loading = false;
        await elementUpdated(remote);

        expect(loadingPart()).to.be.null;
      });

      it('does not move the list when the spinner shows', async () => {
        await openComboPopover(remote);
        const { top } = list.getBoundingClientRect();

        remote.loading = true;
        await elementUpdated(remote);

        expect(list.getBoundingClientRect().top).to.equal(top);
      });

      it('takes the colors of the spinner and the skeletons from their parts', async () => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(
          'igc-combo::part(loading) { color: rgb(1, 2, 3); } igc-combo::part(placeholder) { color: rgb(4, 5, 6); }'
        );
        const reference = await fixture<HTMLDivElement>(
          html`<div
            style="background: color-mix(in srgb, rgb(4, 5, 6) 16%, transparent)"
          ></div>`
        );

        await withDocumentSheets([sheet], async () => {
          remote.totalItemCount = 12;
          remote.loading = true;
          await openComboPopover(remote);
          list.scrollToIndex(11);
          await comboStable(remote);

          const placeholder = placeholders().at(-1)!;
          const skeleton = placeholder.querySelector('span')!;
          const box = placeholder.renderRoot
            .querySelector('igc-checkbox')!
            .renderRoot.querySelector('[part~="control"]')!;

          const stop = loadingPart()!.shadowRoot!.querySelector(
            '[part~="gradient_start"]'
          )!;

          expect(getComputedStyle(stop).stopColor).to.equal('rgb(1, 2, 3)');
          const { backgroundColor } = getComputedStyle(reference);

          expect(getComputedStyle(skeleton).backgroundColor).to.equal(
            backgroundColor
          );
          expect(getComputedStyle(box, '::after').backgroundColor).to.equal(
            backgroundColor
          );
        });
      });

      it('replaces the spinner with the `loading` slot', async () => {
        const custom = document.createElement('span');
        custom.slot = 'loading';
        remote.append(custom);
        remote.loading = true;
        await openComboPopover(remote);

        const slot = remote.renderRoot.querySelector<HTMLSlotElement>(
          'slot[name="loading"]'
        )!;

        expect(slot.assignedElements()).to.eql([custom]);
        expect(custom.checkVisibility()).to.be.true;
        expect(loadingPart()!.checkVisibility()).to.be.false;
      });
    });
  });
});
