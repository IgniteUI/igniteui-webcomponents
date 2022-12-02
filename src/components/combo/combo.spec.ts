import { html } from 'lit';
// import sinon from 'sinon';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
// import IgcInputComponent from '../input/input';
import IgcComboComponent from './combo.js';
// import IgcComboItemComponent from './combo-item.js';
// import IgcComboListComponent from './combo-list.js';
// import IgcComboHeaderComponent from './combo-header.js';

describe('Combo Component', () => {
  interface City {
    id: string;
    name: string;
    country: string;
    zip: string;
  }

  // let input: IgcInputComponent;
  // let searchInput: IgcInputComponent;

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
    {
      id: 'JP01',
      name: 'Tokyo',
      country: 'Japan',
      zip: '163-8001',
    },
    {
      id: 'JP02',
      name: 'Yokohama',
      country: 'Japan',
      zip: '781-0240',
    },
    {
      id: 'JP03',
      name: 'Osaka',
      country: 'Japan',
      zip: '552-0021',
    },
  ];

  let combo: IgcComboComponent<City>;
  // const comboItems = (el: IgcComboItemComponent) =>
  //   [...el.querySelectorAll('igc-combo-item')] as IgcComboItemComponent[];

  before(() => {
    defineComponents(IgcComboComponent);
  });

  describe('', () => {
    beforeEach(async () => {
      combo = await fixture<IgcComboComponent<City>>(
        html`<igc-combo
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
        ></igc-combo>`
      );

      // input = combo.shadowRoot!.querySelector(
      //   '[part="input"]'
      // ) as IgcInputComponent;
      // searchInput = combo.shadowRoot!.querySelector(
      //   '[part="search-input"]'
      // ) as IgcInputComponent;
    });

    it('is accessible.', async () => {
      combo.open = true;
      combo.label = 'Simple Select';
      await elementUpdated(combo);
      await expect(combo).to.be.accessible();
    });
  });
});
// const pressKey = (
//   target: HTMLElement,
//   key: string,
//   times = 1,
//   options?: Object
// ) => {
//   for (let i = 0; i < times; i++) {
//     target.dispatchEvent(
//       new KeyboardEvent('keydown', {
//         key: key,
//         bubbles: true,
//         composed: true,
//         ...options,
//       })
//     );
//   }
// };
