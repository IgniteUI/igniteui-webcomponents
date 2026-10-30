import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { type SinonSpy, spy } from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  arrowDown,
  arrowUp,
  enterKey,
  escapeKey,
  homeKey,
  spaceBar,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  type City,
  cities,
  comboStable,
  openComboPopover,
  items,
} from '#internals/testing/combo.spec.js';
import {
  axeReflectedRelationsOptions,
  isFocused,
  suppressResizeObserverLoopError,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { configureTheme } from '#theming/config.js';
import type IgcButtonComponent from '../button/button.js';
import type IgcInputComponent from '../input/input.js';
import type IgcVirtualScrollComponent from '../virtualization/virtualization.js';
import type IgcComboItemComponent from './combo-item.js';
import IgcComboComponent from './combo.js';

describe('Combo', () => {
  let input: IgcInputComponent;
  let searchInput: IgcInputComponent;

  let combo: IgcComboComponent<City>;
  let list: IgcVirtualScrollComponent;

  before(() => {
    defineComponents(IgcComboComponent);
    suppressResizeObserverLoopError();
  });

  describe('Select all methods', () => {
    async function search(text: string): Promise<void> {
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: text }));
      await elementUpdated(combo);
    }

    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
        ></igc-combo>`
      );
      searchInput = combo.renderRoot.querySelector('[part="search-input"]')!;
    });

    it('selects and deselects the items that the list shows', async () => {
      const eventSpy = spy(combo, 'emitEvent');

      await search('o');
      combo.selectAllItems();

      expect(combo.value).to.eql(['BG01', 'BG02', 'US01', 'US02', 'US03']);

      await search('s');
      combo.deselectAllItems();

      expect(combo.value).to.eql(['BG02', 'US01']);
      expect(eventSpy).not.calledWith('igcChange');
    });

    it('selects and deselects all the items with `ignoreFilter`', async () => {
      await search('sof');
      combo.selectAllItems(true);

      expect(combo.value).lengthOf(cities.length);

      combo.deselectAllItems(true);

      expect(combo.value).to.be.empty;
    });

    it('changes nothing when the list shows no items', async () => {
      combo.select('BG01');
      await search('xyz');

      combo.selectAllItems();
      combo.deselectAllItems();

      expect(combo.value).to.eql(['BG01']);
    });

    it('acts on a new data at once', () => {
      combo.data = cities.slice(0, 2);
      combo.selectAllItems();

      expect(combo.value).to.eql(['BG01', 'BG02']);
    });

    it('selects nothing in single selection, and deselects a shown item', async () => {
      combo.singleSelect = true;
      combo.select('US02');
      await elementUpdated(combo);

      combo.selectAllItems();
      expect(combo.value).to.eql(['US02']);

      combo.deselectAllItems();
      expect(combo.value).to.be.empty;
    });
  });

  describe('Select-all option', () => {
    let eventSpy: SinonSpy;

    const selectAll = () =>
      list.querySelector<IgcComboItemComponent>('[part~="select-all"]');

    const ariaOf = (item: Element) => ({
      selected: internalsOf(item)?.getARIA('ariaSelected'),
      checked: internalsOf(item)?.getARIA('ariaChecked') ?? null,
    });

    // The cities whose name has an "o".
    const ids = ['BG01', 'BG02', 'US01', 'US02', 'US03'];

    const changes = () =>
      eventSpy.withArgs('igcChange').args.map(([, { detail }]) => ({
        ...detail,
        items: detail.items.map(({ id }: City) => id),
      }));

    async function search(text: string): Promise<void> {
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: text }));
      await comboStable(combo);
    }

    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
          show-select-all
        ></igc-combo>`
      );
      searchInput = combo.renderRoot.querySelector('[part="search-input"]')!;
      list = combo.renderRoot.querySelector('igc-virtual-scroll')!;
      eventSpy = spy(combo, 'emitEvent');
      await openComboPopover(combo);
    });

    it('comes first in multiple selection and counts as the first option', async () => {
      const first = list.querySelector('[part~="item"], igc-combo-header');
      const [, option] = items(combo);

      expect(first).to.equal(selectAll());
      expect(first!.textContent?.trim()).to.equal('Select all');
      expect(ariaOf(first!)).to.eql({ selected: 'false', checked: null });
      expect(first!.hasAttribute('aria-checked')).to.be.false;
      expect(first!.getAttribute('aria-posinset')).to.equal('1');
      expect(option.getAttribute('aria-posinset')).to.equal('2');
      expect(option.getAttribute('aria-setsize')).to.equal(
        `${cities.length + 1}`
      );

      await expect(combo).shadowDom.to.be.accessible(
        axeReflectedRelationsOptions
      );

      combo.singleSelect = true;
      await comboStable(combo);

      expect(selectAll()).to.be.null;
    });

    it('does not show when the list shows no items', async () => {
      await search('xyz');

      expect(selectAll()).to.be.null;
      expect(
        combo.renderRoot.querySelector('[part="empty"]')!.checkVisibility()
      ).to.be.true;
    });

    it('selects the shown items, then deselects them, with one igcChange each', async () => {
      await search('o');

      simulateClick(selectAll()!);
      await comboStable(combo);

      expect(combo.value).to.eql(ids);
      expect(ariaOf(selectAll()!).selected).to.equal('true');

      simulateClick(selectAll()!);
      await comboStable(combo);

      expect(combo.value).to.be.empty;
      expect(changes()).to.eql([
        { newValue: ids, items: ids, type: 'selection' },
        { newValue: [], items: ids, type: 'deselection' },
      ]);
    });

    it('shows the mixed state and selects only the other shown items', async () => {
      await search('o');
      const [first, ...others] = ids;

      combo.select(first);
      await comboStable(combo);

      const checkbox = selectAll()!.renderRoot.querySelector('igc-checkbox')!;
      const marginOf = (item: Element, part: string) =>
        getComputedStyle(
          item
            .shadowRoot!.querySelector('igc-checkbox')!
            .renderRoot.querySelector(`[part~="${part}"]`)!
        ).scrollMarginTop;
      const style = document.createElement('style');
      style.textContent =
        'igc-combo::part(checkbox indeterminate), igc-combo::part(checkbox-indicator indeterminate) { scroll-margin-top: 7px; }';
      document.head.append(style);

      expect(ariaOf(selectAll()!).selected).to.equal('false');
      expect(checkbox.indeterminate).to.be.true;
      expect(marginOf(selectAll()!, 'control')).to.equal('7px');
      expect(marginOf(selectAll()!, 'indicator')).to.equal('7px');
      expect(marginOf(items(combo)[1], 'control')).to.equal('0px');

      style.remove();

      simulateClick(selectAll()!);
      await comboStable(combo);

      expect(changes().map(({ items }) => items)).to.eql([others]);
      expect(ariaOf(selectAll()!).selected).to.equal('true');
    });

    it('follows a new value while the list is open', async () => {
      combo.value = ['BG01'];
      await comboStable(combo);

      expect(
        selectAll()!.renderRoot.querySelector('igc-checkbox')!.indeterminate
      ).to.be.true;
      expect(items(combo).filter((item) => item.selected)).lengthOf(1);
    });

    it('resets the active option when it shows or hides', async () => {
      // The first city. Without the option, its index is the next city.
      simulateKeyboard(list, homeKey);
      simulateKeyboard(list, arrowDown);
      await comboStable(combo);

      expect(items(combo).filter((item) => item.active)).lengthOf(1);

      combo.showSelectAll = false;
      await comboStable(combo);

      expect(items(combo).some((item) => item.active)).to.be.false;
    });

    it('selects only the clicked item when the item has no value', async () => {
      combo.data = [{ name: 'Nowhere', country: 'Other' } as City, ...cities];
      await comboStable(combo);

      simulateClick(
        items(combo).find((item) => item.textContent?.trim() === 'Nowhere')!
      );
      await comboStable(combo);

      expect(combo.selection.map(({ name }) => name)).to.eql(['Nowhere']);
    });

    it('keeps the selection when igcChange is canceled', async () => {
      combo.addEventListener('igcChange', (event) => event.preventDefault());

      simulateClick(selectAll()!);
      await comboStable(combo);

      expect(combo.value).to.be.empty;
    });

    it('is a keyboard stop that Space toggles', async () => {
      simulateKeyboard(list, homeKey);
      simulateKeyboard(list, spaceBar);
      await comboStable(combo);

      expect(combo.value).lengthOf(cities.length);
      expect(selectAll()!.active).to.be.true;

      simulateKeyboard(list, arrowUp);

      expect(isFocused(searchInput)).to.be.true;
    });
  });

  describe('Group selection', () => {
    let eventSpy: SinonSpy;

    const headers = () => [
      ...list.querySelectorAll<IgcComboItemComponent>('[part~="group-header"]'),
    ];

    const checkboxOf = (item: Element) =>
      item.shadowRoot!.querySelector('igc-checkbox')!;

    const changes = () =>
      eventSpy.withArgs('igcChange').args.map(([, { detail }]) => ({
        ...detail,
        items: detail.items.map(({ id }: City) => id),
      }));

    async function search(text: string): Promise<void> {
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: text }));
      await comboStable(combo);
    }

    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
          group-selection
        ></igc-combo>`
      );
      searchInput = combo.renderRoot.querySelector('[part="search-input"]')!;
      list = combo.renderRoot.querySelector('igc-virtual-scroll')!;
      eventSpy = spy(combo, 'emitEvent');
      await openComboPopover(combo);
    });

    it('renders the group headers as options with a checkbox in multiple selection', async () => {
      const [bulgaria] = headers();
      const [first] = items(combo);

      expect(headers()).lengthOf(2);
      expect(bulgaria.localName).to.equal('igc-combo-item');
      expect(bulgaria.textContent?.trim()).to.equal('Bulgaria');
      expect(internalsOf(bulgaria)?.getARIA('ariaSelected')).to.equal('false');
      expect(checkboxOf(bulgaria)).to.exist;
      // The two headers count as options.
      expect(bulgaria.getAttribute('aria-posinset')).to.equal('1');
      expect(first.getAttribute('aria-posinset')).to.equal('2');
      expect(first.getAttribute('aria-setsize')).to.equal(
        `${cities.length + 2}`
      );

      await expect(combo).shadowDom.to.be.accessible(
        axeReflectedRelationsOptions
      );

      combo.singleSelect = true;
      await comboStable(combo);

      expect(headers().map(({ localName }) => localName)).to.eql([
        'igc-combo-header',
        'igc-combo-header',
      ]);
      expect(items(combo)[0].getAttribute('aria-posinset')).to.equal('1');
      expect(items(combo)[0].getAttribute('aria-setsize')).to.equal(
        `${cities.length}`
      );
    });

    it('selects the shown items of the group, then deselects them, with one igcChange each', async () => {
      await search('o');

      simulateClick(headers()[0]);
      await comboStable(combo);

      expect(combo.value).to.eql(['BG01', 'BG02']);
      expect(internalsOf(headers()[0])?.getARIA('ariaSelected')).to.equal(
        'true'
      );
      expect(combo.open).to.be.true;

      simulateClick(headers()[0]);
      await comboStable(combo);

      expect(combo.value).to.be.empty;
      expect(changes()).to.eql([
        {
          newValue: ['BG01', 'BG02'],
          items: ['BG01', 'BG02'],
          type: 'selection',
        },
        { newValue: [], items: ['BG01', 'BG02'], type: 'deselection' },
      ]);
    });

    it('shows the mixed state and selects only the other items of the group', async () => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(
        'igc-combo::part(checkbox indeterminate) { scroll-margin-top: 7px; }'
      );

      combo.select('BG01');
      await comboStable(combo);

      const [bulgaria, unitedStates] = headers();

      await withDocumentSheets([sheet], () => {
        const control =
          checkboxOf(bulgaria).renderRoot.querySelector('[part~="control"]')!;

        expect(getComputedStyle(control).scrollMarginTop).to.equal('7px');
      });

      expect(checkboxOf(bulgaria).indeterminate).to.be.true;
      expect(internalsOf(bulgaria)?.getARIA('ariaSelected')).to.equal('false');
      expect(checkboxOf(unitedStates).indeterminate).to.be.false;

      simulateClick(bulgaria);
      await comboStable(combo);

      expect(changes().map(({ items }) => items)).to.eql([['BG02', 'BG03']]);
      expect(combo.value).to.eql(['BG01', 'BG02', 'BG03']);
      expect(checkboxOf(headers()[0]).checked).to.be.true;
    });

    it('stops on the group headers with the arrow keys and Home, and Space toggles them', async () => {
      simulateKeyboard(list, homeKey);
      simulateKeyboard(list, spaceBar);
      await comboStable(combo);

      expect(headers()[0].active).to.be.true;
      expect(combo.value).to.eql(['BG01', 'BG02', 'BG03']);

      for (let i = 0; i < 4; i++) {
        simulateKeyboard(list, arrowDown);
      }
      await comboStable(combo);

      expect(headers()[1].active).to.be.true;

      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(combo.value).to.eql(['BG01', 'BG02', 'BG03']);
    });

    it('works with the select-all option', async () => {
      combo.showSelectAll = true;
      await comboStable(combo);

      simulateClick(list.querySelector('[part~="select-all"]')!);
      await comboStable(combo);

      expect(
        headers().map((header) => internalsOf(header)?.getARIA('ariaSelected'))
      ).to.eql(['true', 'true']);
    });

    it('lists an item that data holds twice one time in igcChange', async () => {
      combo.data = [cities[0], ...cities];
      await comboStable(combo);

      simulateClick(headers()[0]);
      await comboStable(combo);

      expect(changes()[0].items).to.eql(['BG01', 'BG02', 'BG03']);
    });

    it('resets the active option when group selection turns off', async () => {
      simulateKeyboard(list, homeKey);
      await comboStable(combo);

      expect(headers()[0].active).to.be.true;

      combo.groupSelection = false;
      await comboStable(combo);

      expect(headers()[0].localName).to.equal('igc-combo-header');
      expect(items(combo).some((item) => item.active)).to.be.false;

      simulateKeyboard(list, homeKey);
      await comboStable(combo);

      expect(items(combo)[0].active).to.be.true;
    });
  });

  describe('Confirm mode', () => {
    const other = { id: 'XX01', name: 'Elsewhere', country: '', zip: '' };
    let eventSpy: SinonSpy;

    const changes = (event: 'igcChange' | 'igcPendingChange' = 'igcChange') =>
      eventSpy.withArgs(event).args.map(([, { detail }]) => ({
        ...detail,
        items: detail.items.map(({ id }: City) => id),
      }));

    const selectedNames = () =>
      items(combo)
        .filter((item) => item.selected)
        .map((item) => item.textContent?.trim());

    async function click(index: number): Promise<void> {
      simulateClick(items(combo)[index]);
      await comboStable(combo);
    }

    const actions = () => [
      ...combo.renderRoot.querySelectorAll<IgcButtonComponent>(
        '[part="actions"] igc-button'
      ),
    ];

    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          .value=${['BG01']}
          value-key="id"
          display-key="name"
          selection-commit="confirm"
        ></igc-combo>`
      );
      input = combo.renderRoot.querySelector('igc-input#target')!;
      searchInput = combo.renderRoot.querySelector('[part="search-input"]')!;
      list = combo.renderRoot.querySelector('igc-virtual-scroll')!;
      eventSpy = spy(combo, 'emitEvent');
      await openComboPopover(combo);
    });

    it('stages the toggles in the open list and keeps the value', async () => {
      await click(1);
      await click(0);

      expect(selectedNames()).to.eql(['Plovdiv']);
      expect(combo.pendingValue).to.eql(['BG02']);
      expect(combo.value).to.eql(['BG01']);
      expect(combo.selection.map(({ id }) => id)).to.eql(['BG01']);
      expect(input.value).to.equal('Sofia');
      expect(changes()).to.be.empty;
      expect(changes('igcPendingChange')).to.eql([
        { newValue: ['BG01', 'BG02'], items: ['BG02'], type: 'selection' },
        { newValue: ['BG02'], items: ['BG01'], type: 'deselection' },
      ]);
    });

    it('applies the pending selection on Enter with one igcChange', async () => {
      simulateKeyboard(list, arrowDown);
      simulateKeyboard(list, spaceBar);
      simulateKeyboard(list, arrowDown);
      simulateKeyboard(list, spaceBar);
      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(combo.value).to.eql(['BG02']);
      expect(input.value).to.equal('Plovdiv');
      expect(changes()).to.eql([
        { newValue: ['BG02'], items: ['BG02', 'BG01'], type: 'commit' },
      ]);
      expect(eventSpy.withArgs('igcClosed')).calledOnceWith('igcClosed', {
        detail: { trigger: 'enter' },
      });
    });

    it('applies the pending selection on Enter in the search input and without an active option', async () => {
      // A handler that changes `newValue` does not change `value`.
      combo.addEventListener(
        'igcChange',
        ({ detail }) => detail.newValue.push('US01'),
        { once: true }
      );

      await click(1);
      simulateKeyboard(searchInput, enterKey);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(combo.value).to.eql(['BG01', 'BG02']);

      await openComboPopover(combo);
      combo.select('BG03');
      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.value).to.eql(['BG01', 'BG02', 'BG03']);
      expect(changes().map(({ type }) => type)).to.eql(['commit', 'commit']);
    });

    it('closes on Enter without igcChange when nothing changes', async () => {
      await click(1);
      await click(1);
      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(changes()).to.be.empty;
    });

    it('keeps the list open with the pending selection when igcChange is canceled', async () => {
      combo.addEventListener('igcChange', (event) => event.preventDefault(), {
        once: true,
      });

      await click(1);
      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.open).to.be.true;
      expect(combo.value).to.eql(['BG01']);
      expect(combo.pendingValue).to.eql(['BG01', 'BG02']);
    });

    it('keeps the pending selection when igcPendingChange is canceled', async () => {
      combo.addEventListener(
        'igcPendingChange',
        (event) => event.preventDefault(),
        { once: true }
      );

      await click(1);

      expect(combo.pendingValue).to.eql(['BG01']);
      expect(selectedNames()).to.eql(['Sofia']);
    });

    it('drops the pending selection on the other closes', async () => {
      const closes = [
        () => simulateKeyboard(list, escapeKey),
        () => simulateClick(input),
        () => combo.hide(),
      ];

      for (const close of closes) {
        await openComboPopover(combo);
        await click(1);

        expect(combo.pendingValue).to.eql(['BG01', 'BG02']);

        await close();
        await comboStable(combo);

        expect(combo.open).to.be.false;
        expect(combo.pendingValue).to.eql(['BG01']);
      }

      await openComboPopover(combo);

      expect(selectedNames()).to.eql(['Sofia']);
      expect(changes()).to.be.empty;

      await click(1);
      combo.open = false;
      await comboStable(combo);
      combo.open = true;
      await comboStable(combo);

      expect(combo.pendingValue).to.eql(['BG01']);
    });

    it('stages the selection methods, and commitSelection() applies them without events', async () => {
      combo.select('BG02');
      combo.deselect('BG01');
      await comboStable(combo);

      expect(selectedNames()).to.eql(['Plovdiv']);
      expect(combo.pendingValue).to.eql(['BG02']);

      combo.selectAllItems();
      expect(combo.pendingValue).lengthOf(cities.length);

      combo.deselect();
      expect(combo.pendingValue).to.be.empty;

      combo.select(other);
      combo.select();
      expect(combo.pendingValue).lengthOf(cities.length + 1);

      combo.deselect('XX01');
      expect(combo.pendingValue).lengthOf(cities.length);

      combo.deselectAllItems();
      combo.select(['BG03', other]);
      expect(combo.value).to.eql(['BG01']);

      combo.commitSelection();
      await comboStable(combo);

      expect(combo.value).to.eql(['BG03', 'XX01']);
      expect(input.value).to.equal('Varna, Elsewhere');
      expect(combo.open).to.be.true;
      expect(selectedNames()).to.eql(['Varna']);
      expect(eventSpy).not.calledWith('igcChange');
      expect(eventSpy).not.calledWith('igcPendingChange');
    });

    it('keeps the pending selection on the same value, and puts the value back with cancelSelection() and a new value', async () => {
      await click(1);
      combo.value = ['BG01'];
      await comboStable(combo);

      expect(combo.pendingValue).to.eql(['BG01', 'BG02']);

      combo.cancelSelection();
      await comboStable(combo);

      expect(combo.open).to.be.true;
      expect(combo.pendingValue).to.eql(['BG01']);
      expect(selectedNames()).to.eql(['Sofia']);

      await click(1);
      combo.value = ['US01'];
      await comboStable(combo);

      expect(combo.pendingValue).to.eql(['US01']);
      expect(selectedNames()).to.eql(['New York']);
    });

    it('clears the value and the pending selection with the clear icon', async () => {
      await click(1);
      simulateClick(combo.renderRoot.querySelector('[part="clear-icon"]')!);
      await comboStable(combo);

      expect(combo.value).to.be.empty;
      expect(combo.pendingValue).to.be.empty;
      expect(selectedNames()).to.be.empty;
      expect(changes()).to.eql([
        { newValue: [], items: ['BG01'], type: 'deselection' },
      ]);
    });

    it('gives the pending selection the records of its values in a new data', async () => {
      await click(1);

      combo.data = cities.map((city) => ({ ...city }));
      await comboStable(combo);

      expect(selectedNames()).to.eql(['Sofia', 'Plovdiv']);

      await click(1);

      expect(combo.pendingValue).to.eql(['BG01']);
    });

    it('keeps the values of value without a record, and resolves them with select()', async () => {
      combo.value = ['BG01', 'XX01'];
      await click(1);

      expect(combo.value).to.eql(['BG01', 'XX01']);

      combo.select(other);
      await comboStable(combo);

      expect(input.value).to.equal('Sofia, Elsewhere');
      expect(combo.value).to.eql(['BG01', 'XX01']);
      expect(combo.pendingValue).to.eql(['BG01', 'BG02', 'XX01']);

      // A second record of the value does not join the selection.
      combo.deselect('XX01');
      combo.select({ ...other });
      await comboStable(combo);

      expect(input.value).to.equal('Sofia, Elsewhere');

      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(changes().map(({ items }) => items)).to.eql([['BG02']]);
      expect(combo.selection.map(({ id }) => id)).to.eql([
        'BG01',
        'BG02',
        'XX01',
      ]);
    });

    it('acts on the value right after a close, and on the pending selection right after an opening', async () => {
      void combo.hide();
      combo.deselect('BG01');

      expect(combo.value).to.be.empty;

      void combo.show();
      combo.select('BG02');

      expect(combo.value).to.be.empty;
      expect(combo.pendingValue).to.eql(['BG02']);
    });

    it('gives the pending selection the records of a new data for the values of value', async () => {
      const later = { id: 'XX02', name: 'Later', country: '', zip: '' };

      combo.value = ['BG01', 'XX02'];
      await click(1);

      combo.data = [...cities, later];
      await comboStable(combo);

      expect(combo.pendingValue).to.eql(['BG01', 'BG02', 'XX02']);

      await click(1);
      simulateKeyboard(list, enterKey);
      await comboStable(combo);

      expect(combo.value).to.eql(['BG01', 'XX02']);
      expect(changes()).to.be.empty;
    });

    it('stages the select-all option and the group header options', async () => {
      combo.showSelectAll = true;
      combo.groupKey = 'country';
      combo.groupSelection = true;
      await comboStable(combo);

      const selectAll = list.querySelector<IgcComboItemComponent>(
        '[part~="select-all"]'
      )!;

      simulateClick(selectAll);
      await comboStable(combo);

      expect(combo.pendingValue).to.have.members(cities.map(({ id }) => id));
      expect(selectAll.selected).to.be.true;

      simulateClick(list.querySelector('[part~="group-header"]')!);
      await comboStable(combo);

      expect(combo.pendingValue).to.have.members(['US01', 'US02', 'US03']);
      expect(combo.value).to.eql(['BG01']);
      expect(changes()).to.be.empty;
      expect(changes('igcPendingChange').map(({ type }) => type)).to.eql([
        'selection',
        'deselection',
      ]);
    });

    it('renders Cancel and Apply as the default footer content', async () => {
      const [cancel, apply] = actions();

      expect(cancel.textContent?.trim()).to.equal('Cancel');
      expect(apply.textContent?.trim()).to.equal('Apply');
      expect(cancel.getAttribute('part')).to.equal('cancel-button');
      expect(apply.getAttribute('part')).to.equal('apply-button');
      await expect(combo).shadowDom.to.be.accessible(
        axeReflectedRelationsOptions
      );

      combo.resourceStrings = { combo_apply: 'OK' };
      await comboStable(combo);

      expect(apply.textContent?.trim()).to.equal('OK');

      try {
        configureTheme('indigo');
        await comboStable(combo);

        expect([cancel.variant, apply.variant]).to.eql([
          'outlined',
          'contained',
        ]);
      } finally {
        configureTheme('bootstrap');
      }

      const footer = document.createElement('div');
      footer.slot = 'footer';
      combo.append(footer);
      await comboStable(combo);

      expect(apply.checkVisibility()).to.be.false;

      footer.remove();
      await comboStable(combo);

      expect(apply.checkVisibility()).to.be.true;

      await combo.hide();

      expect(actions()).to.be.empty;

      await openComboPopover(combo);
      combo.selectionCommit = 'immediate';
      await comboStable(combo);

      expect(actions()).to.be.empty;
    });

    it('applies the pending selection with Apply and closes the list', async () => {
      combo.addEventListener('igcChange', (event) => event.preventDefault(), {
        once: true,
      });

      await click(1);
      simulateClick(actions()[1]);
      await comboStable(combo);

      expect(combo.open).to.be.true;
      expect(combo.value).to.eql(['BG01']);

      simulateClick(actions()[1]);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(combo.value).to.eql(['BG01', 'BG02']);
      expect(isFocused(input)).to.be.true;
      expect(changes().map(({ type }) => type)).to.eql(['commit', 'commit']);
      expect(eventSpy.withArgs('igcClosed')).calledOnceWith('igcClosed', {
        detail: { trigger: 'apply' },
      });
    });

    it('drops the pending selection with Cancel and closes the list', async () => {
      combo.addEventListener('igcClosing', (event) => event.preventDefault(), {
        once: true,
      });

      await click(1);
      simulateClick(actions()[0]);
      await comboStable(combo);

      expect(combo.open).to.be.true;
      expect(combo.pendingValue).to.eql(['BG01']);

      await click(1);
      eventSpy.resetHistory();
      simulateClick(actions()[0]);
      await comboStable(combo);

      expect(combo.open).to.be.false;
      expect(combo.pendingValue).to.eql(['BG01']);
      expect(changes()).to.be.empty;
      expect(eventSpy.withArgs('igcClosed')).calledOnceWith('igcClosed', {
        detail: { trigger: 'cancel' },
      });
    });

    it('moves with Tab from the list to Cancel and Apply, and then closes the list', async () => {
      const [cancel, apply] = actions();

      list.focus();
      await sendKeys({ press: tabKey });

      expect(isFocused(cancel)).to.be.true;

      await sendKeys({ press: tabKey });

      expect(isFocused(apply)).to.be.true;

      await sendKeys({ press: tabKey });
      await comboStable(combo);

      expect(combo.open).to.be.false;
    });

    it('applies each change at once in single selection', async () => {
      combo.singleSelect = true;
      await comboStable(combo);

      await click(1);

      expect(combo.value).to.eql(['BG02']);
      expect(combo.pendingValue).to.eql(['BG02']);
      expect(changes().map(({ type }) => type)).to.eql(['selection']);
      expect(actions()).to.be.empty;
    });
  });
});
