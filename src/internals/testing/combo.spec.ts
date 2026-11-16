import { elementUpdated, nextFrame } from '@open-wc/testing';

import type IgcComboHeaderComponent from '../../components/combo/combo-header.js';
import type IgcComboItemComponent from '../../components/combo/combo-item.js';
import type IgcComboComponent from '../../components/combo/combo.js';
import type IgcInputComponent from '../../components/input/input.js';
import type IgcVirtualScrollComponent from '../../components/virtualization/virtualization.js';
import { internalsOf } from '../controllers/internals.js';

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

const listOf = <T extends object>(
  combo: IgcComboComponent<T>
): IgcVirtualScrollComponent =>
  combo.renderRoot.querySelector<IgcVirtualScrollComponent>(
    'igc-virtual-scroll'
  )!;

/** Shadow DOM parts of `host()`, queried on each read so a replaced fixture works. */
export function getComboDOM<T extends object>(
  host: () => IgcComboComponent<T>
) {
  const query = <E extends Element>(selector: string) =>
    host().renderRoot.querySelector<E>(selector);

  return {
    get input() {
      return query<IgcInputComponent>('igc-input#target')!;
    },
    get nativeInput() {
      return this.input.renderRoot.querySelector('input')!;
    },
    /** Hidden in single selection. */
    get searchInput() {
      return query<IgcInputComponent>('[part="search-input"]')!;
    },
    get list() {
      return listOf(host());
    },
    get headers() {
      return Array.from(
        this.list.querySelectorAll<IgcComboHeaderComponent>(
          '[part~="group-header"]'
        )
      );
    },
    get clearIcon() {
      return query<HTMLElement>('[part="clear-icon"]')!;
    },
  };
}

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

export const items = <T extends object>(combo: IgcComboComponent<T>) => [
  ...listOf(combo).querySelectorAll<IgcComboItemComponent>('[part~="item"]'),
];

/** The selection state that an option reports to assistive technology. */
export const ariaOf = (item: Element) => ({
  selected: internalsOf(item)?.getARIA('ariaSelected'),
  checked: internalsOf(item)?.getARIA('ariaChecked'),
});

export const layoutComplete = <T extends object>(combo: IgcComboComponent<T>) =>
  listOf(combo).layoutComplete;
