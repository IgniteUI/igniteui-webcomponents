import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { resetMouse, sendKeys, sendMouse } from '@web/test-runner-commands';
import { setCurrentI18n } from 'igniteui-i18n-core';
import { match, type SinonSpy, spy } from 'sinon';
import {
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  shiftKey,
  spaceBar,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  ariaOf,
  type City,
  cities,
  comboStable,
  expectActiveOption,
  openComboPopover,
  items,
  layoutComplete,
  getComboDOM,
} from '#internals/testing/combo.spec.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  runAriaProjectionTests,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import {
  axeReflectedRelationsOptions,
  isFocused,
  suppressResizeObserverLoopError,
} from '#internals/testing/helpers.spec.js';
import {
  simulateBlur,
  simulateClick,
  simulateComposingKeys,
  simulateKeyboard,
  simulatePointerDown,
  simulateScroll,
} from '#internals/testing/simulate.spec.js';
import { ValidityHelpers } from '#internals/testing/validity-helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { configureTheme } from '#theming/config.js';
import IgcButtonComponent from '../button/button.js';
import type IgcInputComponent from '../input/input.js';
import IgcComboComponent from './combo.js';
import type { ComboCloseTrigger, ComboItemTemplate } from './types.js';

describe('Combo', () => {
  const citiesWithDiacritics = [
    {
      id: 'US01',
      name: 'New York',
      country: 'Méxícó',
      zip: '10001',
    },
    {
      id: 'JP01',
      name: 'Tokyo',
      country: 'Ángel',
      zip: '163-8001',
    },
    {
      id: 'US02',
      name: 'Boston',
      country: 'Méxícó',
      zip: '02108',
    },
    {
      id: 'US03',
      name: 'San Francisco',
      country: 'Méxícó',
      zip: '94103',
    },
    {
      id: 'JP02',
      name: 'Yokohama',
      country: 'Ángel',
      zip: '781-0240',
    },
    {
      id: 'JP03',
      name: 'Osaka',
      country: 'Ángel',
      zip: '552-0021',
    },
    {
      id: 'BG01',
      name: 'diakritikós',
      country: 'México',
      zip: '1000',
    },
    {
      id: 'BG02',
      name: 'coöperate',
      country: 'México',
      zip: '4000',
    },
    {
      id: 'BG03',
      name: 'Muğams',
      country: 'México',
      zip: '9000',
    },
  ];

  const primitive = [
    0,
    'Sofia',
    4,
    'Varna',
    'varna',
    false,
    { a: 1, b: 2 },
    -1,
    true,
    Number.NaN,
    0,
  ];

  let combo: IgcComboComponent<City>;
  const dom = getComboDOM(() => combo);

  const filterCombo = async (term: string) => {
    dom.input.dispatchEvent(new CustomEvent('igcInput', { detail: term }));
    await elementUpdated(combo);
    // `_handleMainInput` clears the single selection after its own `updateComplete`.
    await elementUpdated(combo);
    await layoutComplete(combo);
  };

  const expectActive = (name?: string) => expectActiveOption(combo, name);

  const searchFor = async (detail: string) => {
    dom.searchInput.dispatchEvent(new CustomEvent('igcInput', { detail }));
    await comboStable(combo);
  };

  before(() => {
    defineComponents(IgcComboComponent);
    suppressResizeObserverLoopError();
  });

  describe('Component', () => {
    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
        ></igc-combo>`
      );
    });

    describe('Rendering and data', () => {
      it('is accessible.', async () => {
        combo.open = true;
        combo.label = 'Simple Combo';

        await elementUpdated(combo);
        await layoutComplete(combo);

        await expect(combo).shadowDom.to.be.accessible(
          axeReflectedRelationsOptions
        );
        await expect(combo).to.be.accessible(axeReflectedRelationsOptions);
      });

      it('picks up items appended to the data array in place', async () => {
        const data = [...cities];
        combo = await fixture<IgcComboComponent<City>>(
          html`<igc-combo
            .data=${data}
            value-key="id"
            display-key="name"
          ></igc-combo>`
        );

        // Warm both the value index and the data pipeline
        combo.select('BG01');
        await openComboPopover(combo);
        expect(items(combo)).lengthOf(cities.length);

        data.push({
          id: 'BG04',
          name: 'Burgas',
          country: 'Bulgaria',
          zip: '8000',
        });
        combo.select('BG04');
        await comboStable(combo);

        expect(combo.value).to.eql(['BG01', 'BG04']);
        expect(items(combo)).lengthOf(cities.length + 1);
      });

      it('picks up items removed from the data array in place', async () => {
        const data = [...cities];
        combo = await fixture<IgcComboComponent<City>>(
          html`<igc-combo
            .data=${data}
            value-key="id"
            display-key="name"
          ></igc-combo>`
        );

        combo.select('BG01');
        await openComboPopover(combo);
        expect(items(combo)).lengthOf(cities.length);

        data.splice(0, 1);
        combo.deselect('BG02');
        await comboStable(combo);

        expect(items(combo)).lengthOf(cities.length - 1);
      });

      it('picks up an item replaced in place when the same data array is set again', async () => {
        const data = [...cities];
        combo = await fixture<IgcComboComponent<City>>(
          html`<igc-combo
            .data=${data}
            value-key="id"
            display-key="name"
          ></igc-combo>`
        );

        // Warm the value index
        combo.select('BG01');

        data[1] = {
          id: 'BG04',
          name: 'Burgas',
          country: 'Bulgaria',
          zip: '8000',
        };
        combo.data = data;
        combo.select('BG04');

        expect(combo.value).to.eql(['BG01', 'BG04']);
      });

      it('is successfully created with default properties.', () => {
        expect(document.querySelector('igc-combo')).to.exist;
        expect(combo.data).to.equal(cities);
        expect(combo.open).to.be.false;
        expect(combo.name).to.be.undefined;
        expect(Array.isArray(combo.value)).to.be.true;
        expect(combo.disabled).to.be.false;
        expect(combo.required).to.be.false;
        expect(combo.invalid).to.be.false;
        expect(combo.autofocus).to.be.undefined;
        expect(combo.autofocusList).to.be.false;
        expect(combo.label).to.be.undefined;
        expect(combo.placeholder).to.be.undefined;
        expect(combo.placeholderSearch).to.equal('Enter a Search Term');
        expect(combo.outlined).to.be.false;
        expect(combo.valueKey).to.equal('id');
        expect(combo.displayKey).to.equal('name');
        expect(combo.groupKey).to.equal('country');
        expect(combo.groupSorting).to.equal('asc');
        expect(combo.filteringOptions).includes({
          filterKey: combo.displayKey,
          caseSensitive: false,
        });
        expect(combo.caseSensitiveIcon).to.be.false;
        expect(combo.disableFiltering).to.be.false;
      });

      it('correctly applies input related properties to encapsulated inputs', async () => {
        combo.label = 'Select Label';
        combo.placeholder = 'Select Placeholder';
        combo.placeholderSearch = 'Select Placeholder';
        await elementUpdated(combo);

        expect(dom.input.placeholder).to.equal(combo.placeholder);
        expect(dom.input.label).to.equal(combo.label);
        expect(dom.input.disabled).to.equal(combo.disabled);
        expect(dom.input.required).to.equal(dom.input.required);
        expect(dom.input.invalid).to.equal(combo.invalid);
        expect(dom.input.outlined).to.equal(combo.outlined);
        expect(dom.input.dir).to.equal(combo.dir);
        expect(dom.input.autofocus).to.equal(combo.autofocus);

        expect(dom.searchInput.placeholder).to.equal(combo.placeholderSearch);
        expect(dom.searchInput.dir).to.equal(combo.dir);
      });

      it('should render all data items as combo-list items', async () => {
        combo.open = true;
        await comboStable(combo);

        const cityNames: string[] = [];

        items(combo).forEach((item) => {
          cityNames.push(item.innerText);
        });

        cities.forEach((city) => {
          expect(cityNames).to.include(city[combo.displayKey!]);
        });
      });

      it('should display primitive values correctly', async () => {
        const combo = await fixture<IgcComboComponent>(
          html`<igc-combo .data=${primitive}></igc-combo>`
        );

        combo.open = true;

        await comboStable(combo);

        const items = combo.renderRoot
          .querySelector('igc-virtual-scroll')!
          .querySelectorAll('[part~="item"]');

        items.forEach((item, index) => {
          expect(item.textContent?.trim()).to.equal(String(primitive[index]));
        });
      });
    });

    describe('Open, close and focus', () => {
      it('should open the menu upon calling the show method', async () => {
        await combo.show();
        expect(combo.open).to.be.true;
      });

      it('should close the menu upon calling the hide method', async () => {
        await combo.hide();
        expect(combo.open).to.be.false;
      });

      it('should toggle the menu upon calling the toggle method', async () => {
        await combo.toggle();
        expect(combo.open).to.be.true;

        await combo.toggle();
        expect(combo.open).to.be.false;
      });

      it('should open the menu upon clicking on the input', async () => {
        const eventSpy = spy(combo, 'emitEvent');

        simulateClick(dom.input);
        await elementUpdated(combo);

        expect(eventSpy).calledWith('igcOpening');
        expect(eventSpy).calledWith('igcOpened');
        expect(combo.open).to.be.true;
      });

      it('should hide the menu upon clicking on the input', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        await combo.show();

        simulateClick(dom.input);
        await elementUpdated(combo);

        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
        expect(combo.open).to.be.false;
      });

      it('should toggle the menu once upon clicking on the label of the input', async () => {
        combo.label = 'Cities';
        await elementUpdated(combo);

        const label = dom.input.renderRoot.querySelector('label')!;
        const eventSpy = spy(combo, 'emitEvent');

        label.click();
        await elementUpdated(combo);

        expect(combo.open).to.be.true;
        expect(eventSpy).calledWith('igcOpening');
        expect(eventSpy).not.calledWith('igcClosing');
        expect(eventSpy).not.calledWith('igcClosed');

        eventSpy.resetHistory();
        label.click();
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).not.calledWith('igcOpening');
      });

      it('should be able to cancel the igcOpening event', async () => {
        combo.open = false;
        combo.addEventListener('igcOpening', (event: CustomEvent) => {
          event.preventDefault();
        });
        const eventSpy = spy(combo, 'emitEvent');

        simulateClick(dom.input);
        await elementUpdated(combo);

        expect(eventSpy).calledOnceWithExactly('igcOpening', {
          cancelable: true,
        });
        expect(eventSpy).not.calledWith('igcOpened');
      });

      it('should be able to cancel the igcClosing event', async () => {
        combo.open = true;
        combo.addEventListener('igcClosing', (event: CustomEvent) => {
          event.preventDefault();
        });
        const eventSpy = spy(combo, 'emitEvent');

        simulateClick(dom.input);
        await elementUpdated(combo);

        expect(eventSpy).calledOnceWithExactly('igcClosing', {
          cancelable: true,
          detail: { trigger: 'toggle' },
        });
        expect(eventSpy).not.calledWith('igcClosed');
      });

      it('should focus the input when the host is focused', async () => {
        combo.focus();
        await elementUpdated(combo);

        expect(document.activeElement).to.equal(combo);
      });

      it('should blur the input when the host is blurred', async () => {
        combo.blur();
        await elementUpdated(combo);

        expect(document.activeElement).not.to.equal(combo);
      });

      it('issue 1987 - do not close the dropdown on user pointer selection', async () => {
        await openComboPopover(combo);

        simulatePointerDown(dom.list);
        await elementUpdated(combo);

        // A pointer selection can end with a click outside the list.
        simulateClick(document.body);
        await elementUpdated(combo);

        expect(combo.open).to.be.true;
      });
    });

    describe('Filtering', () => {
      it('should configure the filtering options by attribute', async () => {
        combo.setAttribute(
          'filtering-options',
          JSON.stringify({ filterKey: 'zip', caseSensitive: true })
        );
        await elementUpdated(combo);

        expect(combo.filteringOptions.filterKey).to.equal('zip');
        expect(combo.filteringOptions.caseSensitive).to.equal(true);
      });

      it('should correctly merge partially provided filtering options', async () => {
        combo.setAttribute(
          'filtering-options',
          JSON.stringify({ caseSensitive: true })
        );
        await elementUpdated(combo);

        expect(combo.filteringOptions.filterKey).not.to.be.undefined;
        expect(combo.filteringOptions.caseSensitive).to.be.true;
      });

      it('should toggle case sensitivity by pressing on the case sensitive icon', async () => {
        const button = combo.renderRoot.querySelector(
          '[part~="case-icon"]'
        ) as HTMLElement;
        expect(combo.filteringOptions.caseSensitive).to.be.false;

        button.click();
        await elementUpdated(combo);

        expect(combo.filteringOptions.caseSensitive).to.be.true;

        button.click();
        await elementUpdated(combo);
        expect(combo.filteringOptions.caseSensitive).to.be.false;
      });

      it('diacritic filtering configuration (matchDiacritics = false)', async () => {
        combo.data = [
          ...cities,
          { country: 'Brazil', id: 'BR01', name: 'São Paulo', zip: '0000' },
        ];
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        await filterCombo('Sao');
        expect(items(combo).length).to.equal(1);

        await filterCombo('São');
        expect(items(combo).length).to.equal(1);
      });

      it('diacritic filtering configuration (matchDiacritics = true)', async () => {
        combo.data = [
          ...cities,
          { country: 'Brazil', id: 'BR01', name: 'São Paulo', zip: '0000' },
        ];
        combo.singleSelect = true;
        combo.filteringOptions = { matchDiacritics: true };
        await elementUpdated(combo);

        await openComboPopover(combo);

        await filterCombo('Sao');
        expect(items(combo)).to.be.empty;

        await filterCombo('São');
        expect(items(combo)).lengthOf(1);
      });

      it('keeps the filter when `singleSelect` is set again to its value', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        await openComboPopover(combo);
        await filterCombo('sof');

        combo.singleSelect = true;
        await comboStable(combo);

        expect(items(combo)).lengthOf(1);
        expect(firstOf(items(combo)).active).to.be.true;

        combo.singleSelect = false;
        await comboStable(combo);

        expect(items(combo)).lengthOf(cities.length);
      });

      it('keeps the search term when `disableFiltering` is set again to its value', async () => {
        await openComboPopover(combo);
        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'sof' })
        );
        await comboStable(combo);

        combo.disableFiltering = false;
        await comboStable(combo);

        expect(dom.searchInput.value).to.equal('sof');
        expect(items(combo)).lengthOf(1);
      });

      it('does not update for the same filtering options', async () => {
        const options = combo.filteringOptions;
        await elementUpdated(combo);

        combo.filteringOptions = { ...options };

        expect(combo.filteringOptions).to.equal(options);
        expect(combo.isUpdatePending).to.be.false;

        combo.filteringOptions = { caseSensitive: true };

        expect(combo.isUpdatePending).to.be.true;
      });

      it('applies filtering options that changed in place', async () => {
        await elementUpdated(combo);

        const options = combo.filteringOptions;
        options.caseSensitive = true;
        combo.filteringOptions = { ...options };

        expect(combo.isUpdatePending).to.be.true;

        await elementUpdated(combo);
        combo.filteringOptions.matchDiacritics = true;
        combo.filteringOptions = { caseSensitive: true };

        expect(combo.isUpdatePending).to.be.true;
      });

      it('filters primitive data by its value', async () => {
        const combo = await fixture<IgcComboComponent>(
          html`<igc-combo .data=${['Sofia', 'Varna', 'Plovdiv']}></igc-combo>`
        );
        await openComboPopover(combo);

        combo.renderRoot
          .querySelector('[part="search-input"]')!
          .dispatchEvent(new CustomEvent('igcInput', { detail: 'var' }));
        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo).map((item) => item.textContent?.trim())).to.eql([
          'Varna',
        ]);
      });

      it('should clear the search term upon toggling disableFiltering', async () => {
        await openComboPopover(combo);
        expect(items(combo).length).to.equal(cities.length);

        await filterCombo('sof');
        expect(items(combo).length).to.equal(1);

        combo.disableFiltering = true;
        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo).length).to.equal(cities.length);
      });

      it('should not filter via the main input when disableFiltering is set', async () => {
        combo.singleSelect = true;
        combo.disableFiltering = true;
        await elementUpdated(combo);

        await openComboPopover(combo);
        expect(items(combo).length).to.equal(cities.length);

        await filterCombo('sof');
        expect(items(combo).length).to.equal(cities.length);
      });
    });

    describe('Selection methods', () => {
      it('should select/deselect an item by value key', async () => {
        const item = firstOf(cities);
        combo.open = true;
        combo.select([item[combo.valueKey!]]);

        await comboStable(combo);

        const selected = items(combo).find((item) => item.selected);
        expect(selected?.innerText).to.equal(item[combo.displayKey!]);

        combo.deselect([item[combo.valueKey!]]);

        await elementUpdated(combo);
        await layoutComplete(combo);

        items(combo).forEach((item) => {
          expect(item.selected).to.be.false;
        });
      });

      it('should select/deselect an item by value when no valueKey is present', async () => {
        combo.valueKey = undefined;
        combo.open = true;
        await elementUpdated(combo);

        const item = firstOf(cities);
        combo.select([item]);

        await comboStable(combo);

        const selected = items(combo).find((item) => item.selected)!;
        expect(selected.innerText).to.equal(item[combo.displayKey!]);

        combo.deselect([item]);
        await elementUpdated(combo);
        expect(items(combo).every((item) => !item.selected)).to.be.true;
      });

      it('should select/deselect all items', async () => {
        combo.select();
        await elementUpdated(combo);

        expect(items(combo).every((item) => item.selected)).to.be.true;

        combo.deselect();
        await elementUpdated(combo);

        expect(items(combo).every((item) => !item.selected)).to.be.true;
      });

      it('Selection API should select nothing in single selection mode if nothing is passed', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        combo.select();
        await elementUpdated(combo);

        expect(items(combo).every((item) => !item.selected)).to.be.true;
        expect(combo.value).to.be.empty;
      });

      it('Selection API should deselect everything in single selection mode if nothing is passed', async () => {
        const selection = 'BG01';

        combo.singleSelect = true;
        await elementUpdated(combo);

        combo.select(selection);
        await elementUpdated(combo);

        expect(combo.value).to.eql([selection]);

        combo.deselect();
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
      });

      it('Selection API should not deselect current value in single selection mode with wrong valueKey passed', async () => {
        const selection = 'BG01';

        combo.singleSelect = true;
        await elementUpdated(combo);

        combo.select(selection);
        await elementUpdated(combo);

        expect(combo.value).to.eql([selection]);

        combo.deselect('US01');
        await elementUpdated(combo);

        expect(combo.value).to.eql([selection]);
      });

      it('should select a single item using valueKey as argument with the Selection API', async () => {
        await openComboPopover(combo);

        const selection = 'BG01';
        combo.select(selection);

        await elementUpdated(combo);

        const match = cities.find((i) => i.id === selection)!;
        expect(firstOf(combo.value)).to.equal(selection);

        const selected = items(combo).filter((i) => i.selected);

        expect(selected).lengthOf(1);
        expect(firstOf(selected).innerText).to.equal(match.name);
      });

      it('should deselect a single item using valueKey as argument with the Selection API', async () => {
        await elementUpdated(combo);

        await openComboPopover(combo);

        const selection = 'BG01';
        combo.select(selection);

        await elementUpdated(combo);

        expect(firstOf(combo.value)).to.equal(selection);

        combo.deselect(selection);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;

        items(combo).forEach((i) => {
          expect(i.selected).to.be.false;
        });
      });

      it('should select the item passed as argument with the Selection API', async () => {
        combo.valueKey = undefined;

        await openComboPopover(combo);

        const item = firstOf(cities);
        combo.select(item);

        await elementUpdated(combo);

        expect(firstOf(combo.value)).to.equal(item);

        const selected = items(combo).filter((i) => i.selected);

        expect(selected).lengthOf(1);
        expect(firstOf(selected).innerText).to.equal(item.name);
      });

      it('should deselect the item passed as argument with the Selection API', async () => {
        combo.valueKey = undefined;
        await elementUpdated(combo);

        await openComboPopover(combo);

        const item = firstOf(cities);
        combo.select(item);

        await elementUpdated(combo);

        expect(firstOf(combo.value)).to.equal(item);

        combo.deselect(item);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(items(combo).every((item) => !item.selected)).to.be.true;
      });

      it('should select item(s) even if the list of items has been filtered', async () => {
        await openComboPopover(combo);

        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'sof' })
        );

        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo)).lengthOf(1);
        expect(firstOf(items(combo)).innerText).to.equal('Sofia');

        // Select an item not visible in the list using the API
        const selection = 'US01';
        combo.select(selection);
        await elementUpdated(combo);

        expect(firstOf(combo.value)).to.equal(selection);

        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: '' })
        );

        await elementUpdated(combo);
        await layoutComplete(combo);

        const selected = items(combo).filter((item) => item.selected);

        expect(selected).lengthOf(1);
        expect(firstOf(selected).innerText).to.equal('New York');
      });

      it('should deselect item(s) even if the list of items has been filtered', async () => {
        const selection = 'US01';
        combo.select(selection);

        await openComboPopover(combo);

        let selected = items(combo).filter((item) => item.selected);

        expect(selected).lengthOf(1);
        expect(firstOf(selected).innerText).to.equal('New York');
        expect(firstOf(combo.value)).to.equal(selection);

        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'sof' })
        );

        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo)).lengthOf(1);
        expect(firstOf(items(combo)).innerText).to.equal('Sofia');

        // Deselect the previously selected item while the list is filtered
        combo.deselect(selection);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;

        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: '' })
        );

        await elementUpdated(combo);
        await layoutComplete(combo);

        selected = items(combo).filter((item) => item.selected);

        expect(selected).to.be.empty;
      });

      it('should be able to get the currently selected items by calling the `selection` getter', async () => {
        combo.select([cities[0].id, cities[1].id, cities[2].id]);
        await elementUpdated(combo);

        expect(combo.selection[0]).to.equal(cities[0]);
        expect(combo.selection[1]).to.equal(cities[1]);
        expect(combo.selection[2]).to.equal(cities[2]);
      });

      it('should set the initial selection by using the `value` attribute', async () => {
        const combo = await fixture<IgcComboComponent>(
          html`<igc-combo
            .data=${primitive}
            .value=${['Sofia', 'Varna']}
          ></igc-combo>`
        );

        await elementUpdated(combo);

        expect(combo.selection[0]).to.equal('Sofia');
        expect(combo.selection[1]).to.equal('Varna');
      });

      it('should set the selection by using the `value` property', async () => {
        combo.value = ['US01', 'US02'];
        await elementUpdated(combo);

        expect(combo.selection[0]).to.equal(cities[3]);
        expect(combo.selection[1]).to.equal(cities[4]);
      });

      it('should preserve value and set selection even when data assignment is delayed', async () => {
        combo.data = [];
        combo.value = ['US01', 'US02'];
        await elementUpdated(combo);

        await new Promise((resolve) => {
          setTimeout(() => {
            combo.data = cities;
            resolve('done');
          }, 200);
        });

        await elementUpdated(combo);
        expect(combo.selection[0]).to.equal(cities[3]);
        expect(combo.selection[1]).to.equal(cities[4]);
      });
    });

    describe('Change events', () => {
      it('should not fire igcChange event on selection/deselection via methods calls', async () => {
        const item = firstOf(cities);
        combo.select([item[combo.valueKey!]]);

        combo.addEventListener('igcChange', (event: CustomEvent) =>
          event.preventDefault()
        );

        const eventSpy = spy(combo, 'emitEvent');
        expect(eventSpy).not.calledWith('igcChange');
      });

      it('should fire igcChange selection type event on mouse click', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        const args = {
          cancelable: true,
          detail: {
            newValue: ['BG01'],
            items: [firstOf(cities)],
            type: 'selection',
          },
        };
        combo.open = true;

        await comboStable(combo);

        firstOf(items(combo)).click();
        expect(combo.value).to.eql(['BG01']);
        expect(eventSpy).calledWithExactly('igcChange', args);
      });

      it('should not repeat a value in newValue when data records share a value key', async () => {
        const twins = [
          { id: 'a', name: 'first-a', country: 'X', zip: '1' },
          { id: 'b', name: 'bee', country: 'X', zip: '2' },
          { id: 'a', name: 'second-a', country: 'X', zip: '3' },
        ];
        combo = await fixture<IgcComboComponent<City>>(
          html`<igc-combo
            .data=${twins}
            value-key="id"
            display-key="name"
          ></igc-combo>`
        );

        // The value setter resolves only the first match, so one 'a' record is selected.
        combo.value = ['a'];
        await elementUpdated(combo);

        let newValue: unknown;
        combo.addEventListener('igcChange', (event: CustomEvent) => {
          newValue = event.detail.newValue;
        });

        await openComboPopover(combo);

        // The twin resolves both 'a' records. One is already selected.
        items(combo)[2].click();
        await elementUpdated(combo);

        expect(newValue).to.eql(combo.value);
      });

      it('lists the new items in newValue after the selected ones, as value does', async () => {
        let newValue: unknown;
        combo.addEventListener('igcChange', (event: CustomEvent) => {
          newValue = event.detail.newValue;
        });

        combo.select(['BG02']);
        await openComboPopover(combo);

        firstOf(items(combo)).click();
        await elementUpdated(combo);

        expect(combo.value).to.eql(['BG02', 'BG01']);
        expect(newValue).to.eql(combo.value);
      });

      it('should fire igcChange deselection type event on mouse click', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        const args = {
          cancelable: true,
          detail: {
            newValue: ['BG02', 'BG03'],
            items: [firstOf(cities)],
            type: 'deselection',
          },
        };
        combo.select(['BG01', 'BG02', 'BG03']);
        combo.open = true;

        await comboStable(combo);

        expect(combo.value).to.eql(['BG01', 'BG02', 'BG03']);

        firstOf(items(combo)).click();
        await elementUpdated(combo);
        expect(combo.value).to.eql(['BG02', 'BG03']);

        expect(eventSpy).calledWithExactly('igcChange', args);
      });

      it('should be able to cancel the selection event', async () => {
        combo.addEventListener('igcChange', (event: CustomEvent) => {
          event.preventDefault();
        });
        const eventSpy = spy(combo, 'emitEvent');
        combo.open = true;

        await comboStable(combo);

        firstOf(items(combo)).click();
        await elementUpdated(combo);

        expect(eventSpy).calledWith('igcChange');
        expect(combo.value).to.be.empty;
      });

      it('should be able to cancel the deselection event', async () => {
        combo.addEventListener('igcChange', (event: CustomEvent) => {
          event.preventDefault();
        });
        const eventSpy = spy(combo, 'emitEvent');
        combo.select(['BG01', 'BG02']);
        combo.open = true;

        await comboStable(combo);

        firstOf(items(combo)).click();
        await elementUpdated(combo);

        expect(eventSpy).calledWith('igcChange');
        expect(combo.value).lengthOf(2);
      });

      it('should keep the previous selection when cancelling the selection event in single selection mode', async () => {
        combo.singleSelect = true;
        combo.select('BG02');
        await elementUpdated(combo);

        combo.addEventListener('igcChange', (event: CustomEvent) => {
          event.preventDefault();
        });
        combo.open = true;

        await comboStable(combo);

        firstOf(items(combo)).click();
        await elementUpdated(combo);

        expect(combo.value).to.eql(['BG02']);
        expect(dom.input.value).to.equal('Plovdiv');
      });

      it('should not stringify values in event', async () => {
        interface CustomValue {
          id: number;
          value: number;
        }

        const data: CustomValue[] = Array.from({ length: 10 }, (_, idx) => ({
          id: idx,
          value: idx,
        }));

        const combo = await fixture<IgcComboComponent<CustomValue>>(
          html`<igc-combo .data=${data} value-key="id"></igc-combo>`
        );

        combo.addEventListener(
          'igcChange',
          ({ detail }) => {
            expect(detail.newValue).to.eql([data[0].id]);
            expect(detail.items).to.eql([data[0]]);
          },
          { once: true }
        );

        await openComboPopover(combo);

        firstOf(items(combo)).click();
        await elementUpdated(combo);

        expect(combo.value).to.eql([0]);
      });
    });

    describe('Clear button', () => {
      it('should clear the selection by pressing on the clear button', async () => {
        combo.select();

        await elementUpdated(combo);

        const button = dom.clearIcon;

        (button! as HTMLSpanElement).click();

        await elementUpdated(combo);
        expect(items(combo).every((item) => !item.selected)).to.be.true;
      });

      it('should hide the clear button when disableClear is true', async () => {
        combo.select();
        await elementUpdated(combo);

        let button = dom.clearIcon;
        expect(button).to.exist;
        expect(button?.hasAttribute('hidden')).to.be.false;

        combo.disableClear = true;
        await elementUpdated(combo);

        button = dom.clearIcon;
        expect(button?.hasAttribute('hidden')).to.be.true;
      });

      it('should show the clear button when disableClear is false', async () => {
        combo.disableClear = true;
        combo.select();
        await elementUpdated(combo);

        let button = dom.clearIcon;
        expect(button?.hasAttribute('hidden')).to.be.true;

        combo.disableClear = false;
        await elementUpdated(combo);

        button = dom.clearIcon;
        expect(button?.hasAttribute('hidden')).to.be.false;
      });

      it('keeps the selection when the clear icon is clicked and igcChange is canceled', async () => {
        combo.select(['BG01', 'BG02']);
        await elementUpdated(combo);

        combo.addEventListener('igcChange', (event) => event.preventDefault());
        simulateClick(dom.clearIcon!);
        await elementUpdated(combo);

        expect(combo.value).to.eql(['BG01', 'BG02']);
      });
    });

    describe('Validity', () => {
      it('reports validity when required', async () => {
        combo.required = true;
        await elementUpdated(combo);

        expect(combo.checkValidity()).to.be.false;
        ValidityHelpers.isValid(combo).to.be.false;

        combo.select();
        await elementUpdated(combo);

        expect(combo.checkValidity()).to.be.true;
        ValidityHelpers.isValid(combo).to.be.true;
      });

      it('reports validity when not required', async () => {
        combo.required = false;
        await elementUpdated(combo);

        expect(combo.checkValidity()).to.be.true;
        ValidityHelpers.isValid(combo).to.be.true;

        combo.deselect();
        await elementUpdated(combo);

        expect(combo.checkValidity()).to.be.true;
        ValidityHelpers.isValid(combo).to.be.true;
      });
    });

    describe('Keyboard navigation', () => {
      it('opens the list of options when Down or Alt+Down keys are pressed', async () => {
        combo.open = false;

        simulateKeyboard(dom.input, arrowDown);
        expect(combo.open).to.be.true;

        combo.open = false;
        simulateKeyboard(dom.input, [altKey, arrowDown]);
        expect(combo.open).to.be.true;
      });

      it('closes the list of options when search input is on focus and the Up key is pressed', async () => {
        await combo.show();
        expect(combo.open).to.be.true;

        simulateKeyboard(dom.searchInput, arrowUp);
        expect(combo.open).to.be.false;
      });

      it('activates the first list item when clicking pressing ArrowDown when the search input is on focus', async () => {
        await openComboPopover(combo);

        expect(items(combo)[0].active).to.be.false;
        simulateKeyboard(dom.searchInput, arrowDown);

        await elementUpdated(combo);

        expect(items(combo)[0].active).to.be.true;
      });

      it('navigates between the items with ArrowUp and ArrowDown keys', async () => {
        combo.autofocusList = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        expect(items(combo)[0].active).to.be.false;
        simulateKeyboard(dom.list, arrowDown, 2);

        await elementUpdated(combo);

        expect(items(combo)[1].active).to.be.true;
        simulateKeyboard(dom.list, arrowUp);

        await elementUpdated(combo);

        expect(items(combo)[0].active).to.be.true;
      });

      it('should activate the first list item by pressing the Home key', async () => {
        combo.autofocusList = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, homeKey);
        await elementUpdated(combo);

        expect(items(combo)[0].active).to.be.true;
      });

      it('should activate the last list item by pressing the End key', async () => {
        combo.autofocusList = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, endKey);
        await elementUpdated(combo);

        const _items = items(combo);
        expect(_items[_items.length - 1].active).to.be.true;
      });

      it('should select the active item by pressing the Space key', async () => {
        combo.autofocusList = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown, 2);
        simulateKeyboard(dom.list, spaceBar);
        await elementUpdated(combo);

        const _items = items(combo);
        expect(_items[1].active).to.be.true;
        expect(_items[1].selected).to.be.true;
        expect(combo.open).to.be.true;
      });

      it('should move focus to the filter input and the close the dropdown on subsequent Arrow Up keypress', async () => {
        await openComboPopover(combo);

        simulateKeyboard(dom.searchInput, arrowDown);
        await elementUpdated(combo);

        expect(isFocused(dom.list)).to.be.true;
        expect(isFocused(dom.searchInput)).to.be.false;

        simulateKeyboard(dom.list, arrowUp);
        await elementUpdated(combo);

        expect(isFocused(dom.list)).to.be.false;
        expect(isFocused(dom.searchInput)).to.be.true;

        simulateKeyboard(dom.searchInput, arrowUp);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
      });

      it('should close the dropdown on Arrow Up when disable-filtering is set', async () => {
        combo.disableFiltering = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        await elementUpdated(combo);

        expect(isFocused(dom.list)).to.be.true;

        simulateKeyboard(dom.list, arrowUp);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
      });

      it('keeps the dropdown open on Arrow Down at the end of the matches in single-select mode', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        await openComboPopover(combo);

        await filterCombo('sof');
        simulateKeyboard(dom.input, arrowDown);
        await elementUpdated(combo);

        expect(combo.open).to.be.true;
        expect(firstOf(items(combo)).active).to.be.true;

        await filterCombo('xxx');
        simulateKeyboard(dom.input, arrowDown);
        await elementUpdated(combo);

        expect(combo.open).to.be.true;
      });

      it('keeps the focus in the list on Arrow Down at the only match', async () => {
        await openComboPopover(combo);
        dom.searchInput.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'sof' })
        );
        await elementUpdated(combo);
        await layoutComplete(combo);

        simulateKeyboard(dom.searchInput, arrowDown);
        await elementUpdated(combo);
        simulateKeyboard(dom.list, arrowDown);
        await elementUpdated(combo);

        expect(isFocused(dom.searchInput)).to.be.false;
        expect(firstOf(items(combo)).active).to.be.true;
      });

      it('should close the dropdown on Arrow Up in single-select mode', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        await elementUpdated(combo);

        simulateKeyboard(dom.list, arrowUp);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
      });

      it('should close the menu by pressing the Tab key', async () => {
        await openComboPopover(combo);

        simulateKeyboard(dom.list, tabKey, 1);
        await elementUpdated(combo);
        expect(combo.open).to.be.false;

        await combo.show();
        simulateKeyboard(dom.searchInput, tabKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;

        await combo.show();
        simulateKeyboard(dom.input, tabKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
      });

      it('should clear the selection by pressing the Escape key when the combo is closed', async () => {
        combo.autofocusList = true;
        combo.select(['BG01', 'BG02']);
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, escapeKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value.length).to.equal(2);

        simulateKeyboard(dom.input, escapeKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value.length).to.equal(0);
      });

      it('closes the menu and focuses the combo on Shift + Tab', async () => {
        await openComboPopover(combo);

        simulateKeyboard(dom.list, [shiftKey, tabKey]);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(isFocused(combo)).to.be.true;
      });

      it('ignores Space on a stale active option after the data changes', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        await comboStable(combo);
        expect(items(combo).some((item) => item.active)).to.be.true;

        combo.data = [];
        await comboStable(combo);

        simulateKeyboard(dom.list, spaceBar);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(eventSpy).not.calledWith('igcChange');
      });

      it('has no active option after it leaves the document and comes back', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        await comboStable(combo);
        expect(items(combo).some((item) => item.active)).to.be.true;

        const parent = combo.parentElement!;
        combo.remove();
        parent.append(combo);
        await comboStable(combo);

        expect(items(combo).some((item) => item.active)).to.be.false;
        expect(dom.list.hasAttribute('aria-activedescendant')).to.be.false;

        simulateKeyboard(dom.list, spaceBar);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(eventSpy).not.calledWith('igcChange');
      });

      it('has no active option after code closes the list and opens it again', async () => {
        for (const singleSelect of [false, true]) {
          combo.singleSelect = singleSelect;
          await openComboPopover(combo);
          simulateKeyboard(dom.list, arrowDown);
          await comboStable(combo);
          expectActive('Sofia');

          combo.open = false;
          await comboStable(combo);
          expectActive();

          combo.open = true;
          await comboStable(combo);
          expectActive();

          combo.open = false;
          await comboStable(combo);
        }
      });

      it('keeps the active option on its item when a search changes the list', async () => {
        await openComboPopover(combo);
        simulateKeyboard(dom.list, arrowDown, 4);
        await comboStable(combo);
        expectActive('New York');

        await searchFor('o');

        expectActive('New York');

        await searchFor('v');

        expectActive();

        // Arrow Up without an active option acts as from the first option.
        dom.list.focus();
        simulateKeyboard(dom.list, arrowUp);
        expect(isFocused(dom.searchInput)).to.be.true;

        simulateKeyboard(dom.list, arrowDown);
        await comboStable(combo);

        expectActive('Plovdiv');
      });

      it('keeps the select-all option or a group header active across a search', async () => {
        combo.showSelectAll = true;
        combo.groupSelection = true;
        await elementUpdated(combo);
        await openComboPopover(combo);

        simulateKeyboard(dom.list, homeKey);
        await comboStable(combo);
        expectActive(combo.resourceStrings.combo_select_all);

        await searchFor('o');
        expectActive(combo.resourceStrings.combo_select_all);

        simulateKeyboard(dom.list, arrowDown);
        await comboStable(combo);
        expectActive('Bulgaria');

        await searchFor('v');
        expectActive('Bulgaria');

        await searchFor('york');
        expectActive();
      });

      it('scrolls to the active option when the list moves it', async () => {
        const many = Array.from({ length: 200 }, (_, i) => ({
          id: `C${i}`,
          name: `City ${i}`,
          country: '',
          zip: '',
        }));
        combo = await fixture<IgcComboComponent<City>>(
          html`<igc-combo
            .data=${many}
            value-key="id"
            display-key="name"
          ></igc-combo>`
        );
        await openComboPopover(combo);

        simulateKeyboard(dom.list, endKey);
        await comboStable(combo);
        expectActive('City 199');

        await searchFor('City 199');
        expectActive('City 199');

        await searchFor('');
        await comboStable(combo);

        expectActive('City 199');
      });

      it('keeps the active option on its item when a new data holds copies of the items', async () => {
        await openComboPopover(combo);
        simulateKeyboard(dom.list, arrowDown);
        await comboStable(combo);
        expectActive('Sofia');

        combo.data = cities.map((city) => ({ ...city })).reverse();
        await comboStable(combo);

        expectActive('Sofia');
      });
    });

    describe('Single selection', () => {
      it('should select the active item and close the menu by pressing Enter in single selection', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        simulateKeyboard(dom.list, enterKey);
        await elementUpdated(combo);

        expect(combo.value).to.eql(['BG01']);
        expect(combo.open).to.be.false;
      });

      it("shouldn't deselect an item if it's already selected on Enter in single selection", async () => {
        const selection = 'BG01';
        combo.singleSelect = true;
        await elementUpdated(combo);

        combo.select(selection);
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, arrowDown);
        simulateKeyboard(dom.list, enterKey);
        await elementUpdated(combo);

        expect(combo.value).to.eql(['BG01']);
        expect(combo.open).to.be.false;
      });

      it('should close the menu by pressing the Tab key in single selection', async () => {
        await openComboPopover(combo);

        simulateKeyboard(dom.list, tabKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;

        await combo.show();
        simulateKeyboard(dom.input, tabKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
      });

      it('should clear the selection by pressing the Escape key in single selection', async () => {
        combo.singleSelect = true;
        combo.select('BG01');
        await elementUpdated(combo);

        await openComboPopover(combo);

        simulateKeyboard(dom.list, escapeKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value.length).to.equal(1);

        simulateKeyboard(dom.input, escapeKey, 1);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value.length).to.equal(0);
      });

      it('should support a single selection variant', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        expect(combo.getAttribute('single-select')).to.exist;
      });

      it('should use the main input for filtering in single selection mode', async () => {
        const filter = combo.renderRoot.querySelector('[part="filter-input"]')!;
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        expect(filter.getAttribute('hidden')).to.exist;
        expect(dom.input.getAttribute('readonly')).to.not.exist;
        expect(items(combo)).lengthOf(cities.length);

        await filterCombo('sof');

        expect(items(combo)).lengthOf(1);
        expect(firstOf(items(combo)).innerText).to.equal('Sofia');
      });

      it('should select the first matched item upon pressing enter after search', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        await filterCombo('sof');

        expect(firstOf(items(combo)).active).to.be.true;

        simulateKeyboard(dom.input, enterKey);
        await elementUpdated(combo);

        expect(firstOf(combo.value)).to.equal('BG01');
      });

      it('activates the first match in the update of the typed text', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        await openComboPopover(combo);

        dom.input.dispatchEvent(new CustomEvent('igcInput', { detail: 'o' }));
        // `elementUpdated` would also wait for a second update.
        await combo.updateComplete;
        const early = dom.list.getAttribute('aria-activedescendant');

        await comboStable(combo);

        expectActive('Sofia');
        expect(early).to.equal(dom.list.getAttribute('aria-activedescendant'));
      });

      it('has no active option while an app keeps the list closed during typing', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        combo.addEventListener(
          'igcOpening',
          (event: CustomEvent) => event.preventDefault(),
          { once: true }
        );

        await filterCombo('o');

        expect(combo.open).to.be.false;
        expectActive();

        // The list opens on the first match, not on the one after it.
        simulateKeyboard(dom.input, arrowDown);
        await comboStable(combo);

        expect(combo.open).to.be.true;
        expectActive('Sofia');
      });

      it('leaves the Enter that commits an IME composition in the main input to the IME', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);
        await filterCombo('sof');

        simulateComposingKeys(dom.input, enterKey);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(combo.open).to.be.true;
      });

      it('should select only one item at a time in single selection mode', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        dom.input.dispatchEvent(new CustomEvent('igcInput', { detail: 'v' }));
        simulateKeyboard(dom.input, arrowDown);

        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(firstOf(items(combo)).active).to.be.true;
        expect(firstOf(items(combo)).selected).to.be.false;

        simulateKeyboard(dom.list, spaceBar);

        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo)[1].selected).to.be.true;

        simulateKeyboard(dom.list, arrowDown);
        simulateKeyboard(dom.list, spaceBar);

        await elementUpdated(combo);

        expect(items(combo)[1].selected).to.be.false;
        expect(items(combo)[2].selected).to.be.true;
      });

      it('keeps the active option on the item that a selection picks from a search', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);
        await openComboPopover(combo);

        await filterCombo('v');
        expectActive('Plovdiv');

        simulateKeyboard(dom.list, arrowDown);
        simulateKeyboard(dom.list, spaceBar);
        await comboStable(combo);

        expect(combo.value).to.eql(['BG03']);
        expectActive('Varna');
      });

      it('should maintain value with repeated selection via input in single selection mode', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        combo.select('BG01');
        await elementUpdated(combo);

        expect(dom.input.value).to.equal('Sofia');

        dom.input.dispatchEvent(new CustomEvent('igcInput', { detail: 'sof' }));
        await elementUpdated(combo);

        simulateKeyboard(dom.input, enterKey);
        await elementUpdated(combo);

        expect(dom.input.value).to.equal('Sofia');
        expect(combo.value).to.eql(['BG01']);
      });

      it('should clear selection upon changing the search term via input', async () => {
        combo.singleSelect = true;
        await elementUpdated(combo);

        await openComboPopover(combo);

        dom.input.dispatchEvent(new CustomEvent('igcInput', { detail: 'v' }));
        simulateKeyboard(dom.input, arrowDown);

        await elementUpdated(combo);
        await layoutComplete(combo);

        simulateKeyboard(dom.list, spaceBar);

        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(items(combo)[1].selected).to.be.true;
        expect(combo.value).to.eql(['BG02']);

        await filterCombo('sof');

        expect(items(combo).every((item) => !item.selected)).to.be.true;
        expect(combo.value).to.be.empty;
      });

      it('issue 2221 - invalid state when tabbing out of a single select combo', async () => {
        combo.singleSelect = true;
        await openComboPopover(combo);

        // Has matches, selects first on tab out
        await filterCombo('sof');
        expect(items(combo)).lengthOf(1);

        simulateKeyboard(dom.input, tabKey);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value).to.eql(['BG01']);

        combo.deselect();
        await openComboPopover(combo);

        // No matches, should clear value on tab out
        await filterCombo('xxx');
        expect(items(combo)).to.be.empty;

        simulateKeyboard(dom.input, tabKey);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value).to.be.empty;
      });

      it('issue 2221 - tabbing out with an existing selection preserves the selection', async () => {
        combo.singleSelect = true;
        combo.select('BG01');
        await elementUpdated(combo);

        expect(dom.input.value).to.equal('Sofia');

        await openComboPopover(combo);

        simulateKeyboard(dom.input, tabKey);
        await elementUpdated(combo);

        expect(combo.open).to.be.false;
        expect(combo.value).to.eql(['BG01']);
        expect(dom.input.value).to.equal('Sofia');
      });

      it('issue 2221 - clicking outside with partial text and no selection clears the input', async () => {
        combo.singleSelect = true;
        await openComboPopover(combo);

        await filterCombo('sof');
        expect(items(combo)).lengthOf(1);

        // A blur without a selection simulates a click outside.
        simulateBlur(combo);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(dom.input.value).to.equal('');
      });

      it('issue 2221 - clicking outside after partial search over existing selection clears the input', async () => {
        combo.singleSelect = true;
        combo.select('BG01');
        await elementUpdated(combo);

        expect(dom.input.value).to.equal('Sofia');

        // Typing clears the existing selection immediately
        await filterCombo('sof');
        expect(combo.value).to.be.empty;

        // Clicking outside (blur) should clear the partial text
        simulateBlur(combo);
        await elementUpdated(combo);

        expect(combo.value).to.be.empty;
        expect(dom.input.value).to.equal('');
      });
    });

    describe('Grouping and templates', () => {
      it('sorts the groups with the collation of the locale', async () => {
        combo.data = [
          { id: 'ZM01', name: 'Lusaka', country: 'Zambia', zip: '10101' },
          { id: 'AT01', name: 'Vienna', country: 'Österreich', zip: '1010' },
          { id: 'BE01', name: 'Brussels', country: 'Belgium', zip: '1000' },
        ];
        combo.groupSorting = 'asc';
        await openComboPopover(combo);

        const headers = () => dom.headers.map((header) => header.innerText);

        expect(headers()).to.eql(['Belgium', 'Österreich', 'Zambia']);

        // Swedish sorts Ö after Z
        combo.locale = 'sv';
        await elementUpdated(combo);
        await layoutComplete(combo);

        expect(headers()).to.eql(['Belgium', 'Zambia', 'Österreich']);
      });

      describe('Collation of the global locale', () => {
        const headers = () => dom.headers.map((header) => header.innerText);

        beforeEach(() => {
          combo.data = [
            { id: 'ZM01', name: 'Lusaka', country: 'Zambia', zip: '10101' },
            { id: 'AT01', name: 'Vienna', country: 'Österreich', zip: '1010' },
            { id: 'BE01', name: 'Brussels', country: 'Belgium', zip: '1000' },
          ];
          combo.groupSorting = 'asc';
        });

        it('sorts the groups with the collation of the global locale', async () => {
          await openComboPopover(combo);
          setCurrentI18n('sv');

          try {
            await elementUpdated(combo);
            await layoutComplete(combo);

            expect(headers()).to.eql(['Belgium', 'Zambia', 'Österreich']);
          } finally {
            setCurrentI18n('en');
          }
        });

        it('sorts the groups with the global locale after the locale attribute is removed', async () => {
          combo.setAttribute('locale', 'sv');
          await openComboPopover(combo);

          combo.removeAttribute('locale');
          await elementUpdated(combo);
          await layoutComplete(combo);

          expect(headers()).to.eql(['Belgium', 'Österreich', 'Zambia']);
        });
      });

      it('does not change the selection when a group header is clicked', async () => {
        const eventSpy = spy(combo, 'emitEvent');
        await openComboPopover(combo);

        simulateClick(firstOf(dom.headers));
        await elementUpdated(combo);

        expect(combo.open).to.be.true;
        expect(combo.value).to.be.empty;
        expect(eventSpy).not.calledWith('igcChange');
      });

      it('passes the group key to the group header template with its own type', async () => {
        type Task = { id: number; name: string; priority?: number };
        const keys = new Set<unknown>();
        const tasks: Task[] = [
          { id: 1, name: 'Write specs', priority: 2 },
          { id: 2, name: 'Fix the bug', priority: 1 },
          { id: 3, name: 'Triage' },
        ];
        const combo = await fixture<IgcComboComponent<Task>>(
          html`<igc-combo
            .data=${tasks}
            value-key="id"
            display-key="name"
            group-key="priority"
          ></igc-combo>`
        );
        combo.groupHeaderTemplate = (group) => {
          keys.add(group.key);
          return html`${group.key}`;
        };
        await openComboPopover(combo);

        expect([...keys]).to.eql([1, 2, 'Other']);
      });

      it('renders a group header template that reads the deprecated item', async () => {
        const headers: City[] = [];
        const legacyTemplate: ComboItemTemplate<City> = ({ item }) => {
          headers.push(item);
          return html`${item.country}`;
        };

        combo.groupHeaderTemplate = legacyTemplate;
        await openComboPopover(combo);

        expect(dom.headers.map((header) => header.innerText)).to.eql([
          'Bulgaria',
          'United States',
        ]);
        expect(firstOf(headers)).to.eql({
          id: 'Bulgaria',
          name: 'Bulgaria',
          country: 'Bulgaria',
        });
      });

      it('re-renders the open list when the templates change', async () => {
        await openComboPopover(combo);

        combo.itemTemplate = ({ item }) => html`New: ${item.name}`;
        combo.groupHeaderTemplate = ({ key }) => html`Group: ${key}`;
        await elementUpdated(combo);
        await elementUpdated(dom.list);

        expect(items(combo).map((item) => item.innerText)).to.eql(
          cities.map((city) => `New: ${city.name}`)
        );
        expect(dom.headers.map((header) => header.innerText)).to.eql([
          'Group: Bulgaria',
          'Group: United States',
        ]);
      });

      it('should sort groups with diacritics and none as groupSorting direction', async () => {
        combo.data = citiesWithDiacritics;
        combo.groupSorting = 'asc';
        combo.open = true;
        await comboStable(combo);

        let comboHeadersLabel = dom.headers.map((header) => header.innerText);
        expect(comboHeadersLabel).to.eql(['Ángel', 'México', 'Méxícó']);

        combo.groupSorting = 'desc';
        await elementUpdated(combo);
        await layoutComplete(combo);

        comboHeadersLabel = dom.headers.map((header) => header.innerText);
        expect(comboHeadersLabel).to.eql(['Méxícó', 'México', 'Ángel']);

        combo.groupSorting = 'none';
        await elementUpdated(combo);
        await layoutComplete(combo);

        comboHeadersLabel = dom.headers.map((header) => header.innerText);
        expect(comboHeadersLabel).to.eql(['Méxícó', 'Ángel', 'México']);
      });
    });

    describe('Inner events', () => {
      async function clickAt(x: number, y: number): Promise<void> {
        await sendMouse({
          type: 'click',
          position: [Math.round(x), Math.round(y)],
        });
      }

      async function clickOn(element: Element): Promise<void> {
        const { x, y } = getCenterPoint(element);
        await clickAt(x, y);
      }

      // The name, the action that blurs the search input, and the number of
      // selection changes that the action makes.
      const blurActions: [string, () => Promise<void>, number][] = [
        ['Tab', () => sendKeys({ press: tabKey }), 0],
        ['Escape', () => sendKeys({ press: escapeKey }), 0],
        ['Arrow Down', () => sendKeys({ press: arrowDown }), 0],
        [
          'a click outside',
          () => clickAt(window.innerWidth - 5, window.innerHeight - 5),
          0,
        ],
        ['an item click', () => clickOn(items(combo)[0]), 1],
      ];

      afterEach(async () => {
        await resetMouse();
      });

      for (const [name, blur, changes] of blurActions) {
        it(`keeps the igcChange of the search input inside on ${name}`, async () => {
          const searchSpy = spy();
          const comboSpy = spy();

          dom.searchInput.addEventListener('igcChange', searchSpy);
          combo.addEventListener('igcChange', comboSpy);

          await openComboPopover(combo);
          expect(isFocused(dom.searchInput)).to.be.true;

          await sendKeys({ type: 'o' });
          await comboStable(combo);
          await blur();
          await comboStable(combo);

          expect(searchSpy).calledOnceWith(match({ detail: 'o' }));
          expect(comboSpy.callCount).to.equal(changes);
          expect(comboSpy).not.calledWithMatch({ detail: match.string });
        });
      }

      it('keeps the events of the virtual scroll inside', async () => {
        const listSpy = spy();
        const comboSpy = spy();

        for (const name of ['igcStateChange', 'igcDataRequest']) {
          dom.list.addEventListener(name, listSpy);
          combo.addEventListener(name, comboSpy);
        }

        await openComboPopover(combo);

        expect(listSpy).calledWithMatch({ type: 'igcStateChange' });
        expect(listSpy).calledWithMatch({ type: 'igcDataRequest' });
        expect(comboSpy).not.called;
      });
    });
  });

  describe('Header and footer slots', () => {
    let header: HTMLButtonElement;
    let cancel: IgcButtonComponent;
    let apply: IgcButtonComponent;
    let buttonBefore: HTMLButtonElement;
    let buttonAfter: HTMLButtonElement;

    const tab = () => sendKeys({ press: tabKey });
    const shiftTab = () => sendKeys({ press: `${shiftKey}+${tabKey}` });

    function expectFocus(element: Element, open = true): void {
      expect(isFocused(element)).to.be.true;
      expect(combo.open).to.equal(open);
    }

    async function openInSingleSelection(): Promise<void> {
      await combo.hide();
      combo.singleSelect = true;
      dom.input.focus();
      await openComboPopover(combo);
    }

    before(() => {
      defineComponents(IgcButtonComponent);
    });

    beforeEach(async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <button id="before">Before</button>
          <igc-combo .data=${cities} value-key="id" display-key="name">
            <button slot="header">Header</button>
            <div slot="footer">
              <igc-button id="cancel">Cancel</igc-button>
              <igc-button id="apply">Apply</igc-button>
            </div>
          </igc-combo>
          <button id="after">After</button>
        </div>
      `);

      combo = container.querySelector<IgcComboComponent<City>>(
        IgcComboComponent.tagName
      )!;
      header = container.querySelector('[slot="header"]')!;
      cancel = container.querySelector('#cancel')!;
      apply = container.querySelector('#apply')!;
      buttonBefore = container.querySelector('#before')!;
      buttonAfter = container.querySelector('#after')!;

      await openComboPopover(combo);
    });

    it('is accessible.', async () => {
      await expect(combo).shadowDom.to.be.accessible(
        axeReflectedRelationsOptions
      );
      await expect(combo).to.be.accessible(axeReflectedRelationsOptions);
    });

    it('moves with Tab from the search input through the header, the list and the footer', async () => {
      expectFocus(dom.searchInput);

      await tab();
      expectFocus(header);

      await tab();
      expectFocus(dom.list);

      await tab();
      expectFocus(cancel);

      await tab();
      expectFocus(apply);
    });

    it('moves back with Shift+Tab from the footer to the search input', async () => {
      apply.focus();

      await shiftTab();
      expectFocus(cancel);

      await shiftTab();
      expectFocus(dom.list);

      await shiftTab();
      expectFocus(header);

      await shiftTab();
      expectFocus(dom.searchInput);
    });

    it('closes the list and moves the focus on with Tab from the last footer control', async () => {
      apply.focus();

      await tab();
      await elementUpdated(combo);

      expectFocus(buttonAfter, false);
    });

    it('moves the focus to the input when the app closes the list from a footer control', async () => {
      apply.focus();
      await combo.hide();

      expectFocus(dom.input, false);
    });

    it('moves the focus to the input when `open` turns off with the focus in the search input', async () => {
      combo.open = false;
      await elementUpdated(combo);

      expectFocus(dom.input, false);
    });

    it('keeps the focus outside the list when the list closes', async () => {
      buttonAfter.focus();
      await combo.hide();

      expectFocus(buttonAfter, false);
    });

    it('closes the list and moves the focus back with Shift+Tab from the search input', async () => {
      await shiftTab();
      await elementUpdated(combo);

      expectFocus(buttonBefore, false);
    });

    it('starts from the main input in single selection', async () => {
      await openInSingleSelection();
      expectFocus(dom.input);

      await tab();
      expectFocus(header);

      await shiftTab();
      expectFocus(dom.input);
    });

    it('selects the active item when Tab leaves the list in single selection', async () => {
      await openInSingleSelection();

      simulateKeyboard(dom.input, arrowDown);
      await elementUpdated(combo);
      apply.focus();

      await tab();
      await elementUpdated(combo);

      expect(combo.value).to.eql(['BG01']);
      expectFocus(buttonAfter, false);
    });

    it('reaches the content of the empty slot when the list is empty', async () => {
      const create = document.createElement('button');
      create.slot = 'empty';
      create.textContent = 'Create';
      combo.append(create);
      combo.data = [];
      await elementUpdated(combo);

      await tab();
      expectFocus(header);

      await tab();
      expectFocus(create);

      await tab();
      expectFocus(cancel);
    });

    it('moves out of a stop inside another stop', async () => {
      const wrapper = document.createElement('div');
      const inner = document.createElement('button');
      wrapper.slot = 'header';
      wrapper.tabIndex = 0;
      wrapper.append(inner);
      combo.prepend(wrapper);
      await elementUpdated(combo);

      inner.focus();

      await tab();
      expectFocus(header);

      await shiftTab();
      expectFocus(inner);

      await shiftTab();
      expectFocus(wrapper);
    });

    it('does not stop on a host that delegates the focus', async () => {
      cancel.tabIndex = 0;
      apply.focus();

      await shiftTab();
      expectFocus(cancel);

      await shiftTab();
      expectFocus(dom.list);
    });

    it('skips a control with `visibility: hidden`', async () => {
      header.style.visibility = 'hidden';
      dom.list.focus();

      await shiftTab();
      expectFocus(dom.searchInput);
    });

    it('leaves a Tab that a slotted control handles to that control', async () => {
      header.addEventListener('keydown', (event) => event.preventDefault());
      header.focus();

      await tab();
      expectFocus(header);
    });

    it('closes the list with Escape from a slotted control and focuses the input', async () => {
      header.focus();

      await sendKeys({ press: escapeKey });
      await elementUpdated(combo);

      expectFocus(dom.input, false);
    });

    it('leaves an Escape that a slotted control handles to that control', async () => {
      header.addEventListener('keydown', (event) => event.preventDefault());
      header.focus();

      await sendKeys({ press: escapeKey });
      await elementUpdated(combo);

      expectFocus(header);
    });

    it('closes the list with Tab from the search input when the slots have no focusable content', async () => {
      header.remove();
      cancel.disabled = true;
      apply.hidden = true;
      await elementUpdated(combo);

      await tab();
      await elementUpdated(combo);

      expectFocus(buttonAfter, false);
    });
  });

  describe('Close trigger', () => {
    let eventSpy: SinonSpy;

    function expectTrigger(trigger: ComboCloseTrigger): void {
      expect(combo.open).to.be.false;
      expect(eventSpy.withArgs('igcClosing')).calledOnceWith('igcClosing', {
        cancelable: true,
        detail: { trigger },
      });
      expect(eventSpy.withArgs('igcClosed')).calledOnceWith('igcClosed', {
        detail: { trigger },
      });
    }

    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
        ></igc-combo>`
      );

      eventSpy = spy(combo, 'emitEvent');

      await openComboPopover(combo);
    });

    const actions: [ComboCloseTrigger, string, () => unknown][] = [
      [
        'enter',
        'Enter in the list',
        () => {
          simulateKeyboard(dom.list, arrowDown);
          simulateKeyboard(dom.list, enterKey);
        },
      ],
      [
        'escape',
        'Escape in the list',
        () => simulateKeyboard(dom.list, escapeKey),
      ],
      [
        'enter',
        'Enter in the main input',
        () => {
          simulateKeyboard(dom.list, arrowDown);
          simulateKeyboard(dom.input, enterKey);
        },
      ],
      ['tab', 'Tab in the list', () => simulateKeyboard(dom.list, tabKey)],
      [
        'tab',
        'Shift+Tab in the list',
        () => simulateKeyboard(dom.list, [shiftKey, tabKey]),
      ],
      [
        'arrow-up',
        'Arrow Up in the main input',
        () => simulateKeyboard(dom.input, arrowUp),
      ],
      [
        'arrow-up',
        'Arrow Up in the search input',
        () => simulateKeyboard(dom.searchInput, arrowUp),
      ],
      ['outside-click', 'a click outside', () => simulateClick(document.body)],
      [
        'arrow-up',
        'Arrow Up at the first item without the search input',
        async () => {
          combo.disableFiltering = true;
          await elementUpdated(combo);
          simulateKeyboard(dom.list, arrowDown);
          simulateKeyboard(dom.list, arrowUp);
        },
      ],
      ['toggle', 'a click on the input', () => simulateClick(dom.input)],
      [
        'selection',
        'an item click in single selection',
        async () => {
          combo.singleSelect = true;
          await comboStable(combo);
          simulateClick(items(combo)[0]);
        },
      ],
    ];

    for (const [trigger, name, action] of actions) {
      it(`reports \`${trigger}\` on ${name}`, async () => {
        await action();
        await elementUpdated(combo);

        expectTrigger(trigger);
      });
    }

    it('keeps the trigger of a close in progress', async () => {
      simulateKeyboard(dom.list, escapeKey);
      simulateClick(document.body);
      await elementUpdated(combo);

      expectTrigger('escape');
      expect(eventSpy).not.calledWithMatch('igcClosing', {
        detail: { trigger: 'outside-click' },
      });
    });

    it('reports the trigger of a later close after a canceled one', async () => {
      combo.addEventListener('igcClosing', (event) => event.preventDefault(), {
        once: true,
      });

      simulateKeyboard(dom.list, escapeKey);
      await elementUpdated(combo);
      expect(combo.open).to.be.true;

      eventSpy.resetHistory();
      simulateClick(document.body);
      await elementUpdated(combo);

      expectTrigger('outside-click');
    });

    it('keeps the detail of the open events empty', async () => {
      await combo.hide();
      simulateClick(dom.input);
      await elementUpdated(combo);

      expect(combo.open).to.be.true;
      expect(eventSpy).calledWith('igcOpening', { cancelable: true });
      expect(eventSpy).calledWith('igcOpened', {});
    });

    it('emits no events on `hide()`', async () => {
      await combo.hide();

      expect(combo.open).to.be.false;
      expect(eventSpy).not.called;
    });
  });

  describe('Scroll strategy', () => {
    let container: HTMLDivElement;

    beforeEach(async () => {
      container = await fixture(html`
        <div style="height: 1200px">
          <igc-combo
            .data=${cities}
            value-key="id"
            display-key="name"
          ></igc-combo>
        </div>
      `);
      combo = container.querySelector<IgcComboComponent<City>>(
        IgcComboComponent.tagName
      )!;
    });

    it('`scroll` behavior', async () => {
      combo.scrollStrategy = 'scroll';
      await openComboPopover(combo);
      await simulateScroll(container, { top: 200 });

      expect(combo.open).to.be.true;
    });

    it('`close` behavior', async () => {
      const eventSpy = spy(combo, 'emitEvent');

      combo.scrollStrategy = 'close';
      await openComboPopover(combo);
      await simulateScroll(container, { top: 200 });

      expect(combo.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.lastCall).calledWith('igcClosed');
    });

    it('reports the `scroll` trigger with the `close` strategy', async () => {
      const eventSpy = spy(combo, 'emitEvent');

      combo.scrollStrategy = 'close';
      await openComboPopover(combo);
      await simulateScroll(container, { top: 200 });

      expect(eventSpy).calledWith('igcClosing', {
        cancelable: true,
        detail: { trigger: 'scroll' },
      });
      expect(eventSpy).calledWith('igcClosed', {
        detail: { trigger: 'scroll' },
      });
    });
  });

  describe('Theming', () => {
    function hasListStyleSheet(): boolean {
      return Array.from(combo.shadowRoot!.adoptedStyleSheets).some((sheet) =>
        Array.from(sheet.cssRules).some((rule) =>
          rule.cssText.startsWith(':where(igc-virtual-scroll)')
        )
      );
    }

    it('keeps the style sheet of the list on a theme change', async () => {
      combo = await fixture<IgcComboComponent<City>>(html`
        <igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
        ></igc-combo>
      `);
      expect(hasListStyleSheet()).to.be.true;

      try {
        configureTheme('material');
        await elementUpdated(combo);

        expect(hasListStyleSheet()).to.be.true;
      } finally {
        configureTheme('bootstrap');
      }
    });
  });

  describe('ARIA', () => {
    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
        ></igc-combo>`
      );
    });

    it('names the input with the selection status only while no label names it', async () => {
      const native = dom.nativeInput;

      expect(native.getAttribute('aria-label')).to.equal(
        combo.resourceStrings.combo_aria_label_no_options
      );

      combo.label = 'Cities';
      await elementUpdated(combo);
      await elementUpdated(dom.input);

      expect(native.hasAttribute('aria-label')).to.be.false;
    });

    it('leaves the disabled state to the native input', async () => {
      const native = dom.nativeInput;

      combo.disabled = true;
      await elementUpdated(combo);
      await elementUpdated(dom.input);

      expect(native.disabled).to.be.true;
      expect(native.hasAttribute('aria-disabled')).to.be.false;
    });

    it('should report posinset/setsize excluding group headers', async () => {
      await openComboPopover(combo);

      const rendered = items(combo);
      expect(rendered).lengthOf(cities.length);
      expect(dom.headers).lengthOf(2);

      for (const [index, item] of rendered.entries()) {
        expect(item.getAttribute('aria-posinset')).to.equal(`${index + 1}`);
        expect(item.getAttribute('aria-setsize')).to.equal(`${cities.length}`);
      }
    });

    it('should renumber posinset/setsize when the options are filtered', async () => {
      await openComboPopover(combo);
      await filterCombo('a');

      const rendered = items(combo);
      expect(rendered.length).to.be.lessThan(cities.length);

      for (const [index, item] of rendered.entries()) {
        expect(item.getAttribute('aria-posinset')).to.equal(`${index + 1}`);
        expect(item.getAttribute('aria-setsize')).to.equal(
          `${rendered.length}`
        );
      }
    });

    it('reports the selection in aria-checked with checkboxes and in aria-selected without them', async () => {
      const expectARIA = (checkboxes: boolean) => {
        const rendered = items(combo);

        expect(rendered.some((item) => item.selected)).to.be.true;
        expect(rendered.map(ariaOf)).to.eql(
          rendered.map(({ selected }) =>
            checkboxes
              ? { selected: null, checked: `${selected}` }
              : { selected: `${selected}`, checked: null }
          )
        );
      };

      combo.value = ['BG01'];
      await openComboPopover(combo);
      expectARIA(true);

      combo.singleSelect = true;
      await comboStable(combo);
      expectARIA(false);

      combo.singleSelect = false;
      await comboStable(combo);
      expectARIA(true);
    });

    it('prefixes the option ids with the id of the combo', async () => {
      combo.id = 'cities';
      await openComboPopover(combo);

      const ids = items(combo).map((item) => item.id);

      expect(ids).to.not.be.empty;
      expect(new Set(ids).size).to.equal(ids.length);
      for (const id of ids) {
        expect(id).to.match(/^cities-item-\d+$/);
      }
    });

    it('should point aria-activedescendant at the active option and drop it on close', async () => {
      await openComboPopover(combo);

      expect(dom.list.getAttribute('aria-activedescendant')).to.be.null;

      simulateKeyboard(dom.list, arrowDown);
      await comboStable(combo);

      const active = items(combo).find((item) => item.active)!;
      expect(active).to.not.be.undefined;
      expect(dom.list.getAttribute('aria-activedescendant')).to.equal(
        active.id
      );

      await combo.hide();
      await elementUpdated(combo);

      expect(dom.list.getAttribute('aria-activedescendant')).to.be.null;
    });
  });

  runExternalLabelAssociationTests({
    tagName: IgcComboComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcComboComponent).renderRoot
        .querySelector<IgcInputComponent>('#target')!
        .renderRoot.querySelector('input')!,
  });

  runAriaProjectionTests({
    tagName: IgcComboComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcComboComponent).renderRoot
        .querySelector<IgcInputComponent>('#target')!
        .renderRoot.querySelector('input')!,
    expected: { role: 'combobox', hasPopup: 'listbox' },
    getControls: (host) => [
      (host as IgcComboComponent).renderRoot.querySelector('#dropdown')!,
    ],
    getDescription: (host) => [
      (host as IgcComboComponent).renderRoot.querySelector(
        '#combo-helper-text'
      )!,
    ],
    openProperty: 'open',
  });

  runFocusBeforeRenderTests(html`<igc-combo label="Label"></igc-combo>`);
});
