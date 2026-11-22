import { elementUpdated, expect, nextFrame } from '@open-wc/testing';
import { spy } from 'sinon';

import type IgcComboHeaderComponent from '../../components/combo/combo-header.js';
import type IgcComboItemComponent from '../../components/combo/combo-item.js';
import type IgcComboComponent from '../../components/combo/combo.js';
import type { DataStateHost } from '../../components/combo/controllers/data.js';
import type {
  ComboRecord,
  FilteringOptions,
} from '../../components/combo/types.js';
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

/** Checks the text of the active option, which the list also names, or that none is active. */
export function expectActiveOption<T extends object>(
  combo: IgcComboComponent<T>,
  name?: string
): void {
  const list = listOf(combo);
  const item = list.querySelector<HTMLElement>('[active]');

  expect(item?.textContent?.trim()).to.equal(name);
  expect(list.getAttribute('aria-activedescendant')).to.equal(item?.id ?? null);
}

/* The specs of the combo controllers, which run without a combo. */

export type DataCity = { id: number; name: string; country: string };

export const dataCities: DataCity[] = [
  { id: 1, name: 'Sofia', country: 'Bulgaria' },
  { id: 2, name: 'Plovdiv', country: 'Bulgaria' },
  { id: 3, name: 'Berlin', country: 'Germany' },
  { id: 4, name: 'Hamburg', country: 'Germany' },
  { id: 5, name: 'Paris', country: 'France' },
];

export const remoteFiltering: FilteringOptions<DataCity> = {
  filterKey: 'name',
  mode: 'remote',
};

export type FakeComboHost = DataStateHost<DataCity> &
  Pick<IgcComboComponent<DataCity>, 'open'>;

/** The combo fields that the data state and the active option read, with an open list. */
export function fakeComboHost(
  overrides: Partial<FakeComboHost> = {}
): FakeComboHost {
  return {
    addController: () => {},
    requestUpdate: spy(),
    data: dataCities,
    locale: 'en',
    filteringOptions: {
      filterKey: 'name',
      caseSensitive: false,
      matchDiacritics: false,
    },
    valueKey: 'id',
    displayKey: 'name',
    groupKey: undefined,
    groupSorting: 'asc',
    totalItemCount: undefined,
    showSelectAll: false,
    groupSelection: false,
    singleSelect: false,
    open: true,
    ...overrides,
  };
}

/** The item name, `#group` for a header, or the kind of the record. */
export function recordName<T extends { name: string }>(
  record: ComboRecord<T>
): string {
  return record.header
    ? `#${record.group}`
    : (record.kind ?? record.value.name);
}
