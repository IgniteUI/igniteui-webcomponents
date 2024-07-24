import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';

import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  checkValidationSlots,
} from '../common/utils.spec.js';
import type IgcInputComponent from '../input/input.js';
import type IgcComboHeaderComponent from './combo-header.js';
import type IgcComboItemComponent from './combo-item.js';
import type IgcComboListComponent from './combo-list.js';
import IgcComboComponent from './combo.js';

describe('Combo', () => {
  interface City {
    id: string;
    name: string;
    country: string;
    zip: string;
  }

  let input: IgcInputComponent;
  let searchInput: IgcInputComponent;

  const cities: City[] = [
    {
      id: 'BG01',
      name: 'Sofia',
      country: 'Bulgaria',
      zip: '1000',
    },
    {
      id: 'BG02',
      name: 'Plovdiv',
      country: 'Bulgaria',
      zip: '4000',
    },
    {
      id: 'BG03',
      name: 'Varna',
      country: 'Bulgaria',
      zip: '9000',
    },
    {
      id: 'US01',
      name: 'New York',
      country: 'United States',
      zip: '10001',
    },
    {
      id: 'US02',
      name: 'Boston',
      country: 'United States',
      zip: '02108',
    },
    {
      id: 'US03',
      name: 'San Francisco',
      country: 'United States',
      zip: '94103',
    },
  ];

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
  let list: IgcComboListComponent;
  let options: IgcComboListComponent;
  const items = <T extends object>(combo: IgcComboComponent<T>) =>
    [
      ...combo
        .shadowRoot!.querySelector('igc-combo-list')!
        .querySelectorAll('[part~="item"]'),
    ] as IgcComboItemComponent[];

  const filterCombo = async (term: string) => {
    input.dispatchEvent(new CustomEvent('igcInput', { detail: term }));
    await Promise.all([elementUpdated(combo), list.layoutComplete]);
  };

  const headerItems = <T extends object>(combo: IgcComboComponent<T>) =>
    [
      ...combo
        .shadowRoot!.querySelector('igc-combo-list')!
        .querySelectorAll('[part~="group-header"]'),
    ] as IgcComboHeaderComponent[];
  before(() => {
    defineComponents(IgcComboComponent);
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

      options = combo.shadowRoot!.querySelector(
        '[part="list"]'
      ) as IgcComboListComponent;
      input = combo.shadowRoot!.querySelector(
        'igc-input#target'
      ) as IgcInputComponent;
      searchInput = combo.shadowRoot!.querySelector(
        '[part="search-input"]'
      ) as IgcInputComponent;
      list = combo.shadowRoot!.querySelector(
        'igc-combo-list'
      ) as IgcComboListComponent;
    });

    it('is accessible.', async () => {
      combo.open = true;
      combo.label = 'Simple Combo';

      await elementUpdated(combo);
      await list.layoutComplete;

      await expect(combo).shadowDom.to.be.accessible();
      await expect(combo).to.be.accessible();
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
      expect(combo.placeholderSearch).to.equal('Search');
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

      expect(input.placeholder).to.equal(combo.placeholder);
      expect(input.label).to.equal(combo.label);
      expect(input.disabled).to.equal(combo.disabled);
      expect(input.required).to.equal(input.required);
      expect(input.invalid).to.equal(combo.invalid);
      expect(input.outlined).to.equal(combo.outlined);
      expect(input.dir).to.equal(combo.dir);
      expect(input.autofocus).to.equal(combo.autofocus);

      expect(searchInput.placeholder).to.equal(combo.placeholderSearch);
      expect(searchInput.dir).to.equal(combo.dir);
    });

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
      input.click();

      await elementUpdated(combo);

      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');
      expect(combo.open).to.be.true;
    });

    it('should hide the menu upon clicking on the input', async () => {
      const eventSpy = spy(combo, 'emitEvent');
      await combo.show();

      input.click();
      await elementUpdated(combo);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
      expect(combo.open).to.be.false;
    });

    it('should be able to cancel the igcOpening event', async () => {
      combo.open = false;
      combo.addEventListener('igcOpening', (event: CustomEvent) => {
        event.preventDefault();
      });
      const eventSpy = spy(combo, 'emitEvent');
      input.click();
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
      input.click();
      await elementUpdated(combo);

      expect(eventSpy).calledOnceWithExactly('igcClosing', {
        cancelable: true,
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

    it('should render all data items as combo-list items', async () => {
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      const cityNames: string[] = [];

      items(combo).forEach((item) => {
        cityNames.push(item.textContent!);
      });

      cities.forEach((city) => {
        expect(cityNames).to.include(city[combo.displayKey!]);
      });
    });

    it('should configure the filtering options by attribute', async () => {
      combo.setAttribute(
        'filtering-options',
        '{"filterKey": "zip", "caseSensitive": true}'
      );
      await elementUpdated(combo);

      expect(combo.filteringOptions.filterKey).to.equal('zip');
      expect(combo.filteringOptions.caseSensitive).to.equal(true);
    });

    it('should correctly merge partially provided filtering options', async () => {
      combo.setAttribute('filtering-options', '{"caseSensitive": true }');
      await elementUpdated(combo);

      expect(combo.filteringOptions.filterKey).not.to.be.undefined;
      expect(combo.filteringOptions.caseSensitive).to.be.true;
    });

    it('should select/deselect an item by value key', async () => {
      const item = cities[0];
      combo.open = true;
      combo.select([item[combo.valueKey!]]);

      await elementUpdated(combo);
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      const selected = items(combo).find((item) => item.selected);
      expect(selected?.textContent).to.equal(item[combo.displayKey!]);

      combo.deselect([item[combo.valueKey!]]);

      await elementUpdated(combo);
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      items(combo).forEach((item) => {
        expect(item.selected).to.be.false;
      });
    });

    it('should select/deselect an item by value when no valueKey is present', async () => {
      combo.valueKey = undefined;
      combo.open = true;
      await elementUpdated(combo);

      const item = cities[0];
      combo.select([item]);

      await elementUpdated(combo);
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      const selected = items(combo).find((item) => item.selected);
      expect(selected?.textContent).to.equal(item[combo.displayKey!]);

      combo.deselect([item]);

      await elementUpdated(combo);

      items(combo).forEach((item) => {
        expect(item.selected).to.be.false;
      });
    });

    it('should select/deselect all items', async () => {
      combo.select();
      await elementUpdated(combo);

      items(combo).forEach((item) => {
        expect(item.selected).to.be.true;
      });

      combo.deselect();
      await elementUpdated(combo);

      items(combo).forEach((item) => {
        expect(item.selected).to.be.false;
      });
    });

    it('should clear the selection by pressing on the clear button', async () => {
      combo.select();

      await elementUpdated(combo);

      const button = combo.shadowRoot!.querySelector('[part="clear-icon"]');

      (button! as HTMLSpanElement).click();

      await elementUpdated(combo);

      items(combo).forEach((item) => {
        expect(item.selected).to.be.false;
      });
    });

    it('should toggle case sensitivity by pressing on the case sensitive icon', async () => {
      const button = combo.shadowRoot!.querySelector(
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

    it('should not fire igcChange event on selection/deselection via methods calls', async () => {
      const item = cities[0];
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
          items: [cities[0]],
          type: 'selection',
        },
      };
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      items(combo)[0].click();
      expect(combo.value).to.deep.equal(['BG01']);
      expect(eventSpy).calledWithExactly('igcChange', args);
    });

    it('should fire igcChange deselection type event on mouse click', async () => {
      const eventSpy = spy(combo, 'emitEvent');
      const args = {
        cancelable: true,
        detail: {
          newValue: ['BG02', 'BG03'],
          items: [cities[0]],
          type: 'deselection',
        },
      };
      combo.select(['BG01', 'BG02', 'BG03']);
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(combo.value).to.deep.equal(['BG01', 'BG02', 'BG03']);

      items(combo)[0].click();
      await elementUpdated(combo);
      expect(combo.value).to.deep.equal(['BG02', 'BG03']);

      expect(eventSpy).calledWithExactly('igcChange', args);
    });

    it('should be able to cancel the selection event', async () => {
      combo.addEventListener('igcChange', (event: CustomEvent) => {
        event.preventDefault();
      });
      const eventSpy = spy(combo, 'emitEvent');
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      items(combo)[0].click();
      await elementUpdated(combo);

      expect(eventSpy).calledWith('igcChange');
      expect(combo.value.length).to.equal(0);
    });

    it('should be able to cancel the deselection event', async () => {
      combo.addEventListener('igcChange', (event: CustomEvent) => {
        event.preventDefault();
      });
      const eventSpy = spy(combo, 'emitEvent');
      combo.select(['BG01', 'BG02']);
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      items(combo)[0].click();
      await elementUpdated(combo);

      expect(eventSpy).calledWith('igcChange');
      expect(combo.value.length).to.equal(2);
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
      const list = combo.shadowRoot!.querySelector(
        'igc-combo-list'
      ) as IgcComboListComponent;

      combo.addEventListener(
        'igcChange',
        ({ detail }) => {
          expect(detail.newValue).to.eql([data[0].id]);
          expect(detail.items).to.deep.equal([data[0]]);
        },
        { once: true }
      );

      await combo.show();
      await list.layoutComplete;

      items(combo)[0].click();
      await elementUpdated(combo);

      expect(combo.value).to.eql([0]);
    });

    it('reports validity when required', async () => {
      combo.required = true;
      await elementUpdated(combo);

      expect(combo.checkValidity()).to.be.false;
      expect(combo.invalid).to.be.true;

      combo.select();
      await elementUpdated(combo);

      expect(combo.checkValidity()).to.be.true;
      expect(combo.invalid).to.be.false;
    });

    it('reports validity when not required', async () => {
      combo.required = false;
      await elementUpdated(combo);

      expect(combo.checkValidity()).to.be.true;
      expect(combo.invalid).to.be.false;

      combo.deselect();
      await elementUpdated(combo);

      expect(combo.checkValidity()).to.be.true;
      expect(combo.invalid).to.be.false;
    });

    it('opens the list of options when Down or Alt+Down keys are pressed', async () => {
      combo.open = false;
      pressKey(input, 'ArrowDown', 1, { altKey: false });
      expect(combo.open).to.be.true;

      combo.open = false;
      pressKey(input, 'ArrowDown', 1, { altKey: true });
      expect(combo.open).to.be.true;
    });

    it('closes the list of options when search input is on focus and the Up key is pressed', async () => {
      await combo.show();
      expect(combo.open).to.be.true;

      pressKey(searchInput, 'ArrowUp', 1, { altKey: false });
      expect(combo.open).to.be.false;
    });

    it('activates the first list item when clicking pressing ArrowDown when the search input is on focus', async () => {
      await combo.show();
      await list.layoutComplete;

      expect(items(combo)[0].active).to.be.false;
      pressKey(searchInput, 'ArrowDown', 1, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[0].active).to.be.true;
    });

    it('navigates between the items with ArrowUp and ArrowDown keys', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      expect(items(combo)[0].active).to.be.false;
      pressKey(list, 'ArrowDown', 2, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[1].active).to.be.true;
      pressKey(options, 'ArrowUp', 1, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[0].active).to.be.true;
    });

    it('should activate the first list item by pressing the Home key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      pressKey(options, 'Home', 1, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[0].active).to.be.true;
    });

    it('should activate the last list item by pressing the End key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      pressKey(options, 'End', 1, { altKey: false });

      await elementUpdated(combo);

      const itms = items(combo);
      expect(itms[itms.length - 1].active).to.be.true;
    });

    it('should select the active item by pressing the Space key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      pressKey(options, 'ArrowDown', 2, { altKey: false });
      pressKey(options, ' ', 1, { altKey: false });

      await elementUpdated(combo);

      const itms = items(combo);
      expect(itms[1].active).to.be.true;
      expect(itms[1].selected).to.be.true;
      expect(combo.open).to.be.true;
    });

    it('should select the active item and close the menu by pressing Enter in single selection', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      pressKey(options, 'ArrowDown', 1, { altKey: false });
      pressKey(options, 'Enter', 1, { altKey: false });

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

      await combo.show();
      await list.layoutComplete;

      pressKey(options, 'ArrowDown', 1, { altKey: false });
      pressKey(options, 'Enter', 1, { altKey: false });

      await elementUpdated(combo);

      expect(combo.value).to.eql(['BG01']);
      expect(combo.open).to.be.false;
    });

    it('should support a single selection variant', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);
      expect(combo.getAttribute('single-select')).to.exist;
    });

    it('diacritic filtering configuration (matchDiacritics = false)', async () => {
      combo.data = [
        ...cities,
        { country: 'Brazil', id: 'BR01', name: 'São Paulo', zip: '0000' },
      ];
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

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

      await combo.show();
      await list.layoutComplete;

      await filterCombo('Sao');
      expect(items(combo).length).to.equal(0);

      await filterCombo('São');
      expect(items(combo).length).to.equal(1);
    });

    it('should use the main input for filtering in single selection mode', async () => {
      const filter = combo.shadowRoot!.querySelector('[part="filter-input"]');
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      expect(filter!.getAttribute('hidden')).to.exist;
      expect(input.getAttribute('readonly')).to.not.exist;
      expect(items(combo).length).to.equal(cities.length);

      await filterCombo('sof');

      expect(items(combo).length).to.equal(1);
      expect(items(combo)[0].textContent).to.equal('Sofia');
    });

    it('should select the first matched item upon pressing enter after search', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      await filterCombo('sof');

      expect(items(combo)[0].active).to.be.true;

      pressKey(input, 'Enter');

      await elementUpdated(combo);
      expect(combo.value[0]).to.equal('BG01');
    });

    it('should select only one item at a time in single selection mode', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      input.dispatchEvent(new CustomEvent('igcInput', { detail: 'v' }));
      pressKey(input, 'ArrowDown');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[0].active).to.be.true;
      expect(items(combo)[0].selected).to.be.false;

      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].selected).to.be.true;

      pressKey(options, 'ArrowDown', 2);
      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].selected).to.be.false;
      expect(items(combo)[2].selected).to.be.true;
    });

    it('should maintain value with repeated selection via input in single selection mode', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      combo.select('BG01');
      await elementUpdated(combo);

      expect(input.value).to.equal('Sofia');

      input.dispatchEvent(new CustomEvent('igcInput', { detail: 'sof' }));
      await elementUpdated(combo);

      pressKey(input, 'Enter');
      await elementUpdated(combo);

      expect(input.value).to.equal('Sofia');
      expect(combo.value).to.deep.equal(['BG01']);
    });

    it('should clear selection upon changing the search term via input', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      input.dispatchEvent(new CustomEvent('igcInput', { detail: 'v' }));
      pressKey(input, 'ArrowDown');

      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].selected).to.be.true;
      expect(combo.value).to.deep.equal(['BG02']);

      await filterCombo('sof');

      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });

      expect(combo.value).to.deep.equal([]);
    });

    it('Selection API should select nothing in single selection mode if nothing is passed', async () => {
      combo.singleSelect = true;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      combo.select();
      await elementUpdated(combo);

      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });

      expect(combo.value.length).to.equal(0);
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

      expect(combo.value).to.eql([]);
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
      await combo.show();
      await list.layoutComplete;

      const selection = 'BG01';
      combo.select(selection);

      await elementUpdated(combo);

      const match = cities.find((i) => i.id === selection);
      expect(combo.value[0]).to.equal(selection);

      const selected = items(combo).filter((i) => i.selected);

      expect(selected.length).to.equal(1);
      expect(selected[0].textContent).to.equal(match?.name);
    });

    it('should deselect a single item using valueKey as argument with the Selection API', async () => {
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      const selection = 'BG01';
      combo.select(selection);

      await elementUpdated(combo);

      expect(combo.value[0]).to.equal(selection);

      combo.deselect(selection);
      await elementUpdated(combo);

      expect(combo.value.length).to.equal(0);

      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });
    });

    it('should select the item passed as argument with the Selection API', async () => {
      combo.valueKey = undefined;

      await combo.show();
      await list.layoutComplete;

      const item = cities[0];
      combo.select(item);

      await elementUpdated(combo);

      expect(combo.value[0]).to.equal(item);

      const selected = items(combo).filter((i) => i.selected);

      expect(selected.length).to.equal(1);
      expect(selected[0].textContent).to.equal(item?.name);
    });

    it('should deselect the item passed as argument with the Selection API', async () => {
      combo.valueKey = undefined;
      await elementUpdated(combo);

      await combo.show();
      await list.layoutComplete;

      const item = cities[0];
      combo.select(item);

      await elementUpdated(combo);

      expect(combo.value[0]).to.equal(item);

      combo.deselect(item);
      await elementUpdated(combo);

      expect(combo.value.length).to.equal(0);

      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });
    });

    it('should select item(s) even if the list of items has been filtered', async () => {
      await combo.show();
      await list.layoutComplete;

      // Filter the list of items
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: 'sof' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      // Verify we can only see one item in the list
      expect(items(combo).length).to.equal(1);
      expect(items(combo)[0].textContent).to.equal('Sofia');

      // Select an item not visible in the list using the API
      const selection = 'US01';
      combo.select(selection);
      await elementUpdated(combo);

      // The combo value should've updated
      expect(combo.value[0]).to.equal(selection);

      // Let's verify the list of items has been updated
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: '' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      // Get a list of all selected items
      const selected = items(combo).filter((item) => item.selected);

      // We should only see one item as selected
      expect(selected.length).to.equal(1);

      // It should match the one selected via the API
      expect(selected[0].textContent).to.equal('New York');
    });

    it('should deselect item(s) even if the list of items has been filtered', async () => {
      // Select an item via the API
      const selection = 'US01';
      combo.select(selection);

      await combo.show();
      await list.layoutComplete;

      // Get a list of all selected items
      let selected = items(combo).filter((item) => item.selected);

      // We should only see one item as selected
      expect(selected.length).to.equal(1);

      // It should match the one selected via the API
      expect(selected[0].textContent).to.equal('New York');
      expect(combo.value[0]).to.equal(selection);

      // Filter the list of items
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: 'sof' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      // Verify we can only see one item in the list
      expect(items(combo).length).to.equal(1);
      expect(items(combo)[0].textContent).to.equal('Sofia');

      // Deselect the previously selected item while the list is filtered
      combo.deselect(selection);
      await elementUpdated(combo);

      // The value should be updated
      expect(combo.value.length).to.equal(0);

      // Verify the list of items has been updated
      searchInput.dispatchEvent(new CustomEvent('igcInput', { detail: '' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      // Get a list of all selected items again
      selected = items(combo).filter((item) => item.selected);

      // No items should be selected
      expect(selected.length).to.equal(0);
    });

    it('should display primitive values correctly', async () => {
      const combo = await fixture<IgcComboComponent>(
        html`<igc-combo .data=${primitive}></igc-combo>`
      );

      combo.open = true;

      await elementUpdated(combo);

      const items = combo
        .shadowRoot!.querySelector('igc-combo-list')!
        .querySelectorAll('[part~="item"]');

      items.forEach((item, index) => {
        expect(item.textContent).to.equal(String(primitive[index]));
      });
    });

    it('should be able to get the currently selected items by calling the `selectoin` getter', async () => {
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

    it('should sort groups with diacritics and none as groupSorting direction', async () => {
      combo.data = citiesWithDiacritics;
      combo.groupSorting = 'asc';
      combo.open = true;
      await elementUpdated(combo);
      await list.layoutComplete;

      let comboHeadersLabel = headerItems(combo).map(
        (header) => header.innerText
      );
      expect(comboHeadersLabel).to.eql(['Ángel', 'México', 'Méxícó']);

      combo.groupSorting = 'desc';
      await elementUpdated(combo);
      await list.layoutComplete;

      comboHeadersLabel = headerItems(combo).map((header) => header.innerText);
      expect(comboHeadersLabel).to.eql(['Méxícó', 'México', 'Ángel']);

      combo.groupSorting = 'none';
      await elementUpdated(combo);
      await list.layoutComplete;

      comboHeadersLabel = headerItems(combo).map((header) => header.innerText);
      expect(comboHeadersLabel).to.eql(['Méxícó', 'Ángel', 'México']);
    });

    it('should clear the search term upon toggling disableFiltering', async () => {
      await combo.show();
      await list.layoutComplete;
      expect(items(combo).length).to.equal(cities.length);

      await filterCombo('sof');
      expect(items(combo).length).to.equal(1);

      combo.disableFiltering = true;
      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo).length).to.equal(cities.length);
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcComboComponent<City>>(
      html`<igc-combo
        name="combo"
        .data=${cities}
        .value=${['BG01', 'BG02']}
        value-key="id"
        display-key="name"
      ></igc-combo>`
    );

    beforeEach(async () => {
      await spec.setup(IgcComboComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      spec.element.value = [];
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit with value-key (single)', async () => {
      spec.element.singleSelect = true;
      await elementUpdated(spec.element);

      spec.element.value = ['BG01', 'BG02'];
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('BG01');
    });

    it('is associated on submit with value-key (multiple)', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.equal('BG01');
      expect(spec.submit()?.getAll(spec.element.name)).to.eql(['BG01', 'BG02']);
    });

    it('is associated on submit without value-key (single)', async () => {
      const [first, second, _] = cities;

      spec.element.valueKey = undefined;
      spec.element.singleSelect = true;
      await elementUpdated(spec.element);
      spec.element.select([first, second]);
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).not.to.be.null;
    });

    it('is associated on submit without value-key (multiple)', async () => {
      const [first, second, _] = cities;

      spec.element.valueKey = undefined;
      spec.element.select([first, second]);
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).not.to.be.null;
      expect(spec.submit()?.getAll(spec.element.name).length).to.eql(2);
    });

    it('is correctly reset on form reset (multiple)', async () => {
      const initial = spec.element.value;

      spec.element.setAttribute('value', '["BG01", "BG02"]');
      await elementUpdated(spec.element);

      spec.element.value = [];
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.eql(initial);
    });

    it('is correctly reset on form reset (single)', async () => {
      // Initial value is a multiple array. The combo defaults to the first item
      const initial = [spec.element.value[0]];

      spec.element.singleSelect = true;
      await elementUpdated(spec.element);

      spec.element.value = ['US01'];
      await elementUpdated(spec.element);

      expect(spec.element.value).to.eql(['US01']);

      spec.reset();
      expect(spec.element.value).to.eql(initial);
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', async () => {
      spec.element.value = [];
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = ['BG01', 'BG02'];
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });

  describe('Validation message slots', () => {
    let combo: IgcComboComponent;

    async function createFixture(template: TemplateResult) {
      combo = await fixture<IgcComboComponent>(template);
    }

    it('renders value-missing slot', async () => {
      await createFixture(html`
        <igc-combo required>
          <div slot="value-missing"></div>
        </igc-combo>
      `);

      await checkValidationSlots(combo, 'valueMissing');
    });

    it('renders invalid slot', async () => {
      await createFixture(html`
        <igc-combo required>
          <div slot="invalid"></div>
        </igc-combo>
      `);

      await checkValidationSlots(combo, 'invalid');
    });

    it('renders custom-error slot', async () => {
      await createFixture(html`
        <igc-combo>
          <div slot="custom-error"></div>
        </igc-combo>
      `);

      combo.setCustomValidity('invalid');
      await checkValidationSlots(combo, 'customError');
    });
  });
});

const pressKey = (
  target: HTMLElement,
  key: string,
  times = 1,
  options?: object
) => {
  for (let i = 0; i < times; i++) {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: key,
        bubbles: true,
        composed: true,
        ...options,
      })
    );
  }
};
