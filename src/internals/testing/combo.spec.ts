import { elementUpdated, nextFrame } from '@open-wc/testing';

import type IgcComboItemComponent from '../../components/combo/combo-item.js';
import type IgcComboComponent from '../../components/combo/combo.js';
import type IgcVirtualScrollComponent from '../../components/virtualization/virtualization.js';

/* The data and the helpers that the combo spec files share. */

export type City = {
  id: string;
  name: string;
  country: string;
  zip: string;
};

export const cities: City[] = [
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

export async function comboStable<T extends object>(
  combo: IgcComboComponent<T>
) {
  await elementUpdated(combo);
  await nextFrame();
  await layoutComplete(combo);
}

export async function openComboPopover<T extends object>(
  combo: IgcComboComponent<T>
) {
  await combo.show();
  await nextFrame();
  await layoutComplete(combo);
}

export const items = <T extends object>(combo: IgcComboComponent<T>) =>
  [
    ...combo.renderRoot
      .querySelector('igc-virtual-scroll')!
      .querySelectorAll('[part~="item"]'),
  ] as IgcComboItemComponent[];

export const layoutComplete = <T extends object>(combo: IgcComboComponent<T>) =>
  (
    combo.renderRoot.querySelector(
      'igc-virtual-scroll'
    ) as IgcVirtualScrollComponent
  ).layoutComplete;
