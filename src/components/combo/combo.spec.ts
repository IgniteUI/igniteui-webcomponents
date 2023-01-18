import { html } from 'lit';
import sinon from 'sinon';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcInputComponent from '../input/input.js';
import IgcComboComponent from './combo.js';
import IgcComboListComponent from './combo-list.js';
import IgcComboItemComponent from './combo-item.js';

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

  let combo: IgcComboComponent<City>;
  let list: IgcComboListComponent;
  let options: IgcComboListComponent;
  const items = (combo: IgcComboComponent<City>) =>
    [
      ...combo
        .shadowRoot!.querySelector('igc-combo-list')!
        .querySelectorAll('[part~="item"]'),
    ] as IgcComboItemComponent[];

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

      await expect(combo).to.be.accessible({
        ignoredRules: ['aria-hidden-focus', 'nested-interactive'],
      });
    });

    it('is successfully created with default properties.', () => {
      expect(document.querySelector('igc-combo')).to.exist;
      expect(combo.data).to.equal(cities);
      expect(combo.open).to.be.false;
      expect(combo.name).to.be.undefined;
      expect(combo.value).to.equal('');
      expect(combo.disabled).to.be.false;
      expect(combo.required).to.be.false;
      expect(combo.invalid).to.be.false;
      expect(combo.autofocus).to.be.undefined;
      expect(combo.autofocusList).to.be.false;
      expect(combo.label).to.be.undefined;
      expect(combo.placeholder).to.be.undefined;
      expect(combo.placeholderSearch).to.equal('Search');
      expect(combo.outlined).to.be.false;
      expect(combo.dir).to.equal('auto');
      expect(combo.flip).to.be.true;
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

      expect(input.value).to.equal(combo.value);
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
      combo.show();
      await elementUpdated(combo);

      expect(combo.open).to.be.true;
    });

    it('should close the menu upon calling the hide method', async () => {
      combo.hide();
      await elementUpdated(combo);

      expect(combo.open).to.be.false;
    });

    it('should toggle the menu upon calling the toggle method', async () => {
      combo.toggle();
      await elementUpdated(combo);

      expect(combo.open).to.be.true;

      combo.toggle();
      await elementUpdated(combo);

      expect(combo.open).to.be.false;
    });

    it('should open the menu upon clicking on the input', async () => {
      const eventSpy = sinon.spy(combo, 'emitEvent');
      input.click();

      await elementUpdated(combo);

      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');
      expect(combo.open).to.be.true;
    });

    it('should hide the menu upon clicking on the input', async () => {
      const eventSpy = sinon.spy(combo, 'emitEvent');
      combo.show();
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
      const eventSpy = sinon.spy(combo, 'emitEvent');
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
      const eventSpy = sinon.spy(combo, 'emitEvent');
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

    it('should select/deselect an item by value key', async () => {
      const item = cities[0];
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

      const eventSpy = sinon.spy(combo, 'emitEvent');
      expect(eventSpy).not.calledWith('igcChange');
    });

    it('should fire igcChange event on selection/deselection on mouse click', async () => {
      const eventSpy = sinon.spy(combo, 'emitEvent');
      combo.open = true;

      await elementUpdated(combo);
      await list.layoutComplete;

      items(combo)[0].click();
      expect(eventSpy).calledWith('igcChange');
    });

    it('reports validity when required', async () => {
      const validity = sinon.spy(combo, 'reportValidity');

      combo.required = true;
      await elementUpdated(combo);

      combo.checkValidity();
      expect(validity).to.have.returned(false);
      expect(combo.invalid).to.be.true;

      combo.select();
      await elementUpdated(combo);
      combo.checkValidity();

      expect(validity).to.have.returned(true);
      expect(combo.invalid).to.be.false;
    });

    it('reports validity when not required', async () => {
      const validity = sinon.spy(combo, 'reportValidity');

      combo.required = false;
      await elementUpdated(combo);

      combo.checkValidity();
      expect(validity).to.have.returned(true);
      expect(combo.invalid).to.be.false;

      combo.deselect();
      await elementUpdated(combo);
      combo.checkValidity();

      expect(validity).to.have.returned(true);
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
      combo.show();
      await elementUpdated(combo);
      expect(combo.open).to.be.true;

      pressKey(searchInput, 'ArrowUp', 1, { altKey: false });
      expect(combo.open).to.be.false;
    });

    it('activates the first list item when clicking pressing ArrowDown when the search input is on focus', async () => {
      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[0].active).to.be.false;
      pressKey(searchInput, 'ArrowDown', 1, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[0].active).to.be.true;
    });

    it('navigates between the items with ArrowUp and ArrowDown keys', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
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

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, 'Home', 1, { altKey: false });

      await elementUpdated(combo);

      expect(items(combo)[0].active).to.be.true;
    });

    it('should activate the last list item by pressing the End key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, 'End', 1, { altKey: false });

      await elementUpdated(combo);

      const itms = items(combo);
      expect(itms[itms.length - 1].active).to.be.true;
    });

    it('should select the active item by pressing the Space key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, 'ArrowDown', 2, { altKey: false });
      pressKey(options, ' ', 1, { altKey: false });

      await elementUpdated(combo);

      const itms = items(combo);
      expect(itms[1].active).to.be.true;
      expect(itms[1].selected).to.be.true;
      expect(combo.open).to.be.true;
    });

    it('should select the active item and close the menu by pressing the Enter key', async () => {
      combo.autofocusList = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, 'ArrowDown', 2, { altKey: false });
      pressKey(options, 'Enter', 1, { altKey: false });

      await elementUpdated(combo);

      const itms = items(combo);
      expect(itms[1].active).to.be.true;
      expect(itms[1].selected).to.be.true;
      expect(combo.open).to.be.false;
    });

    it('should support a simplified variant', async () => {
      combo.simplified = true;
      await elementUpdated(combo);
      expect(combo.getAttribute('simplified')).to.exist;
    });

    it('should use the main input for filtering in simplified mode', async () => {
      const filter = combo.shadowRoot!.querySelector('[part="filter-input"]');
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      expect(filter!.getAttribute('hidden')).to.exist;
      expect(input.getAttribute('readonly')).to.not.exist;
      expect(items(combo).length).to.equal(cities.length);

      const term = 'sof';
      input.dispatchEvent(new CustomEvent('igcInput', { detail: term }));

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo).length).to.equal(1);
      expect(items(combo)[0].textContent).to.equal('Sofia');
    });

    it('should select the first matched item upon pressing enter after search', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      const term = 'sof';
      input.dispatchEvent(new CustomEvent('igcInput', { detail: term }));

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[0].active).to.be.true;

      pressKey(input, 'Enter');

      await elementUpdated(combo);
      expect(combo.value).to.equal('Sofia');
    });

    it('should select only one item at a time in simplified mode', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      const term = '';
      input.dispatchEvent(new CustomEvent('igcInput', { detail: term }));

      pressKey(input, 'ArrowDown');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].active).to.be.true;
      expect(items(combo)[1].selected).to.be.false;

      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].selected).to.be.true;

      pressKey(options, 'ArrowDown');
      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[1].selected).to.be.false;
      expect(items(combo)[2].selected).to.be.true;
      expect(combo.value).to.equal(cities[2].name);
    });

    it('should clear selection upon changing the search term via input', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      input.dispatchEvent(new CustomEvent('igcInput', { detail: '' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      pressKey(options, ' ');

      await elementUpdated(combo);
      await list.layoutComplete;

      expect(items(combo)[0].selected).to.be.true;

      input.dispatchEvent(new CustomEvent('igcInput', { detail: 'sof' }));

      await elementUpdated(combo);
      await list.layoutComplete;

      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });
    });

    it('should select the first item via the Selection API in simplified mode if no keys are passed', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      combo.select([]);
      await elementUpdated(combo);

      expect(items(combo)[0].selected).to.be.true;
      expect(combo.value).to.equal('Plovdiv');
    });

    it('should select the first key via the Selection API in simplified mode', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      const selection = ['BG01', 'BG02'];
      combo.select(selection);

      await elementUpdated(combo);

      const match = cities.find((i) => i.id === selection[0]);
      expect(combo.value).to.equal(match?.name);

      const selected = items(combo).filter((i) => i.selected);

      expect(selected.length).to.equal(1);
      expect(selected[0].textContent).to.equal(match?.name);
    });

    it('should deselect the first key via the Selection API in simplified mode', async () => {
      combo.simplified = true;
      await elementUpdated(combo);

      combo.show();
      await elementUpdated(combo);
      await list.layoutComplete;

      const selection = ['BG01', 'BG02'];
      combo.select(selection);

      await elementUpdated(combo);

      const match = cities.find((i) => i.id === selection[0]);
      expect(combo.value).to.equal(match?.name);

      combo.deselect(selection);
      await elementUpdated(combo);

      expect(combo.value).to.equal('');
      items(combo).forEach((i) => {
        expect(i.selected).to.be.false;
      });
    });
  });
});

const pressKey = (
  target: HTMLElement,
  key: string,
  times = 1,
  options?: Object
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
