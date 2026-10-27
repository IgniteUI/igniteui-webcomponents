import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  type ComboItemTemplate,
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCircularProgressComponent,
  type IgcComboChangeEventArgs,
  type IgcComboClosingEventArgs,
  IgcComboComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  bindComboDataSource,
  type ComboDataBinding,
  type ComboDataSource,
} from 'igniteui-webcomponents/extras';
import { registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  scrollingPanel,
  storyStyles,
} from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCircularProgressComponent,
  IgcComboComponent,
  IgcInputComponent
);

registerMaterialIcons('location');

interface City {
  id: string;
  name: string;
  country: string;
}

// region default
const metadata: Meta<IgcComboComponent> = {
  title: 'Combo',
  component: 'igc-combo',
  parameters: {
    docs: {
      description: {
        component:
          'The combo lets the user select one or more options from a list. Unlike the select, it shows the options in a\nvirtualized list, so the list can hold thousands of options.\nThe combo supports custom item templates, case-sensitive filtering, grouping and binding to complex data.',
      },
    },
    actions: {
      handles: [
        'igcChange',
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
        'igcSearchInput',
        'igcDataRequest',
      ],
    },
  },
  argTypes: {
    outlined: {
      type: 'boolean',
      description: 'Whether the control has an outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    singleSelect: {
      type: 'boolean',
      description:
        'Whether only one item can be selected. In this mode, the main input\nfilters the list of options.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control takes the focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocusList: {
      type: 'boolean',
      description:
        'Whether the list of options, not the search input, takes the focus when\nthe list opens. It has no effect in single selection mode.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    placeholderSearch: {
      type: 'string',
      description: 'The placeholder text of the search input.',
      control: 'text',
    },
    valueKey: {
      type: 'string',
      description: 'The key in the data source used when selecting items.',
      control: 'text',
    },
    displayKey: {
      type: 'string',
      description:
        'The key in the data source used to display items in the list. Falls back\nto `valueKey`.',
      control: 'text',
    },
    groupKey: {
      type: 'string',
      description:
        'The key in the data source used to group items in the list.',
      control: 'text',
    },
    groupSorting: {
      type: { name: 'enum', value: ['none', 'asc', 'desc'] },
      description:
        'The sort order of the groups, by their group value. With `none`, the\ngroups keep the order of the data source.',
      options: ['none', 'asc', 'desc'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'asc' } },
    },
    caseSensitiveIcon: {
      type: 'boolean',
      description:
        'Whether the search input shows the icon that toggles case-sensitive\nfiltering.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableFiltering: {
      type: 'boolean',
      description:
        'Whether the filtering of the list of options is disabled. In multiple\nselection mode, it also hides the search input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableClear: {
      type: 'boolean',
      description: 'Whether the clear button is hidden.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    totalItemCount: {
      type: 'number',
      description:
        'The number of all the items of a remote source, when the source knows it.\nIn remote filtering mode, the list shows a placeholder for each item that\n`data` does not hold yet, so the scrollbar shows the full list.',
      control: 'number',
    },
    loading: {
      type: 'boolean',
      description:
        'Whether the combo loads options. A spinner, which the `loading` slot can\nreplace, then takes the place of the toggle icon, and an empty list shows\na loading message instead of the empty message.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showSelectAll: {
      type: 'boolean',
      description:
        'Whether the list starts with an option that selects all the items that it\nshows, or deselects them when all of them are selected. Only in multiple\nselection mode.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    groupSelection: {
      type: 'boolean',
      description:
        'Whether a group header is an option that selects the items of its group\nthat the list shows, or deselects them when all of them are selected.\nOnly in multiple selection mode with `groupKey`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale of the component. Without it, the component takes its own\n`lang`, else the locale of the nearest ancestor that has a `locale` (a\ncomponent) or a `lang`, and then the global locale.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description:
        'Whether the control is required. A required control that has no value,\nor is not checked, fails validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description:
        'Whether the control is disabled. A disabled control is not validated,\nand the form does not submit its value.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description:
        'Whether the control shows the invalid state. It changes only the visual\nstate, not the validity.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Whether the component is open.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'The behavior of the component when a parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
  },
  args: {
    outlined: false,
    singleSelect: false,
    autofocus: false,
    autofocusList: false,
    groupSorting: 'asc',
    caseSensitiveIcon: false,
    disableFiltering: false,
    disableClear: false,
    loading: false,
    showSelectAll: false,
    groupSelection: false,
    required: false,
    disabled: false,
    invalid: false,
    open: false,
    scrollStrategy: 'hide',
  },
};

export default metadata;

interface IgcComboArgs {
  /** Whether the control has an outlined appearance. */
  outlined: boolean;
  /**
   * Whether only one item can be selected. In this mode, the main input
   * filters the list of options.
   */
  singleSelect: boolean;
  /** Whether the control takes the focus automatically. */
  autofocus: boolean;
  /**
   * Whether the list of options, not the search input, takes the focus when
   * the list opens. It has no effect in single selection mode.
   */
  autofocusList: boolean;
  /** The label of the control. */
  label: string;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The placeholder text of the search input. */
  placeholderSearch: string;
  /** The key in the data source used when selecting items. */
  valueKey: string;
  /**
   * The key in the data source used to display items in the list. Falls back
   * to `valueKey`.
   */
  displayKey: string;
  /** The key in the data source used to group items in the list. */
  groupKey: string;
  /**
   * The sort order of the groups, by their group value. With `none`, the
   * groups keep the order of the data source.
   */
  groupSorting: 'none' | 'asc' | 'desc';
  /**
   * Whether the search input shows the icon that toggles case-sensitive
   * filtering.
   */
  caseSensitiveIcon: boolean;
  /**
   * Whether the filtering of the list of options is disabled. In multiple
   * selection mode, it also hides the search input.
   */
  disableFiltering: boolean;
  /** Whether the clear button is hidden. */
  disableClear: boolean;
  /**
   * The number of all the items of a remote source, when the source knows it.
   * In remote filtering mode, the list shows a placeholder for each item that
   * `data` does not hold yet, so the scrollbar shows the full list.
   */
  totalItemCount: number;
  /**
   * Whether the combo loads options. A spinner, which the `loading` slot can
   * replace, then takes the place of the toggle icon, and an empty list shows
   * a loading message instead of the empty message.
   */
  loading: boolean;
  /**
   * Whether the list starts with an option that selects all the items that it
   * shows, or deselects them when all of them are selected. Only in multiple
   * selection mode.
   */
  showSelectAll: boolean;
  /**
   * Whether a group header is an option that selects the items of its group
   * that the list shows, or deselects them when all of them are selected.
   * Only in multiple selection mode with `groupKey`.
   */
  groupSelection: boolean;
  /**
   * The locale of the component. Without it, the component takes its own
   * `lang`, else the locale of the nearest ancestor that has a `locale` (a
   * component) or a `lang`, and then the global locale.
   */
  locale: string;
  /**
   * Whether the control is required. A required control that has no value,
   * or is not checked, fails validation.
   */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /**
   * Whether the control is disabled. A disabled control is not validated,
   * and the form does not submit its value.
   */
  disabled: boolean;
  /**
   * Whether the control shows the invalid state. It changes only the visual
   * state, not the validity.
   */
  invalid: boolean;
  /** Whether the component is open. */
  open: boolean;
  /**
   * The behavior of the component when a parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
}
type Story = StoryObj<IgcComboArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .cmb-stack {
      display: grid;
      gap: 1rem;
      max-width: 36rem;
    }

    .cmb-stack :is(h3, p, table) {
      margin: 0;
    }

    .cmb-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cmb-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

const cities: City[] = [
  { id: 'br-sao', name: 'São Paulo', country: 'Brazil' },
  { id: 'br-rio', name: 'Rio de Janeiro', country: 'Brazil' },
  { id: 'ca-mtl', name: 'Montréal', country: 'Canada' },
  { id: 'ca-tor', name: 'Toronto', country: 'Canada' },
  { id: 'de-ber', name: 'Berlin', country: 'Germany' },
  { id: 'de-muc', name: 'München', country: 'Germany' },
  { id: 'pl-krk', name: 'Kraków', country: 'Poland' },
  { id: 'pl-waw', name: 'Warszawa', country: 'Poland' },
  { id: 'se-mmx', name: 'Malmö', country: 'Sweden' },
  { id: 'se-sto', name: 'Stockholm', country: 'Sweden' },
  { id: 'ch-gva', name: 'Genève', country: 'Switzerland' },
  { id: 'ch-zrh', name: 'Zürich', country: 'Switzerland' },
];

export const Default: Story = {
  // The local data has no remote total.
  argTypes: { totalItemCount: { table: { disable: true } } },
  parameters: {
    docs: {
      description: {
        story:
          'The delivery cities of a shop, grouped by country. `value-key` is the key of the value, `display-key` is the key of the text, and `group-key` makes the groups. The filter ignores case and accents, so "sao" finds "São Paulo" and "zur" finds "Zürich". The combo is a form control with the `combobox` role: the label names it, and the helper text describes it. Use the controls panel to change the state. `single-select` moves the search into the main input.',
      },
    },
  },
  args: {
    label: 'Delivery cities',
    placeholder: 'Choose cities',
    placeholderSearch: 'Search cities',
    valueKey: 'id',
    displayKey: 'name',
    groupKey: 'country',
  },
  render: (args) => html`
    <igc-combo
      style="max-width: 24rem"
      value-key=${args.valueKey}
      display-key=${args.displayKey}
      group-key=${args.groupKey}
      value='["de-ber", "pl-krk"]'
      .label=${args.label}
      .name=${args.name}
      .placeholder=${args.placeholder}
      .placeholderSearch=${args.placeholderSearch}
      .data=${cities}
      .groupSorting=${args.groupSorting}
      .scrollStrategy=${args.scrollStrategy}
      ?case-sensitive-icon=${args.caseSensitiveIcon}
      ?disable-filtering=${args.disableFiltering}
      ?disable-clear=${args.disableClear}
      ?open=${args.open}
      ?autofocus=${args.autofocus}
      ?autofocus-list=${args.autofocusList}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      ?single-select=${args.singleSelect}
      ?show-select-all=${args.showSelectAll}
      ?group-selection=${args.groupSelection}
      ?loading=${args.loading}
    >
      <igc-icon slot="prefix" name="location"></igc-icon>
      <span slot="helper-text">
        We deliver to these cities on the next business day.
      </span>
    </igc-combo>
  `,
};

interface Person {
  id: string;
  name: string;
  team: string;
}

const people: Person[] = [
  { id: 'maya', name: 'Maya Patel', team: 'Design' },
  { id: 'zoe', name: 'Zoë Martin', team: 'Design' },
  { id: 'daniel', name: 'Daniel Okafor', team: 'Frontend' },
  { id: 'sofia', name: 'Sofía Díaz', team: 'Frontend' },
  { id: 'aiko', name: 'Aiko Tanaka', team: 'Frontend' },
  { id: 'liam', name: 'Liam Chen', team: 'Backend' },
  { id: 'noah', name: 'Noah Schmidt', team: 'Backend' },
  { id: 'omar', name: 'Omar Haddad', team: 'Operations' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

// The combo renders the templates in its shadow root, where the styles of the
// page do not apply, so the templates use inline styles.
const muted = 'color: var(--ig-gray-700)';

const personTemplate: ComboItemTemplate<Person> = ({ item }) => html`
  <span style="display: flex; align-items: center; gap: 0.5rem">
    <igc-avatar
      initials=${initials(item.name)}
      shape="circle"
      aria-hidden="true"
      style="--ig-avatar-size: 1.25rem"
    ></igc-avatar>
    ${item.name}
  </span>
`;

export const Reviewers: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The reviewers of a pull request. `itemTemplate` renders an avatar next to each name, and the avatar has `aria-hidden`, so the name of the option is the name of the person. The combo renders the template in its shadow root, where the styles of the page do not apply, so the template uses inline styles. `--ig-avatar-size` sets the avatar to 1.25rem, the smallest avatar size of the themes, so it fits the row of the option. The filter uses the display key, so "sofia" finds "Sofía Díaz". `igcChange` comes before the change and is cancelable: the story cancels a fourth reviewer and tells why in the status message. The `empty` slot replaces the default message when the search finds nobody.',
      },
    },
  },
  render: () => {
    const limit = 3;
    const status = createRef<HTMLElement>();

    const change = (event: CustomEvent<IgcComboChangeEventArgs<Person>>) => {
      const { newValue, type } = event.detail;

      if (type === 'selection' && newValue.length > limit) {
        event.preventDefault();
        status.value!.textContent = `You can request up to ${limit} reviewers. Remove a reviewer first.`;
      } else {
        status.value!.textContent = `${newValue.length} of ${limit} reviewers requested.`;
      }
    };

    return html`
      ${styles}
      <section
        class="cmb-stack cmb-panel"
        aria-labelledby="cmb-reviewers-title"
      >
        <h3 id="cmb-reviewers-title">Fix the date format in exports #482</h3>
        <igc-combo
          label="Reviewers"
          placeholder="Request reviewers"
          placeholder-search="Search people"
          value-key="id"
          display-key="name"
          group-key="team"
          .data=${people}
          .itemTemplate=${personTemplate}
          @igcChange=${change}
        >
          <span slot="helper-text">Request up to ${limit} reviewers.</span>
          <span slot="empty">No one matches your search.</span>
        </igc-combo>
        <p class="muted" role="status" ${ref(status)}></p>
      </section>
    `;
  },
};

interface Zone {
  id: string;
  name: string;
  region: string;
}

const regions: Record<string, string> = {
  America: 'Americas',
  Atlantic: 'Atlantic Ocean',
  Indian: 'Indian Ocean',
  Pacific: 'Pacific Ocean',
};

let zones: Zone[] | undefined;

/** All the time zones of the browser. */
const getZones = (): Zone[] =>
  (zones ??= Intl.supportedValuesOf('timeZone').map((id) => {
    const [region, ...place] = id.split('/');

    return {
      id,
      name: place.length
        ? place.reverse().join(', ').replaceAll('_', ' ')
        : region,
      region: place.length ? (regions[region] ?? region) : 'Other',
    };
  }));

// The list renders only the options in view, so a zone gets its formatter
// when its option renders for the first time.
const formatters = new Map<string, Intl.DateTimeFormat>();

/** The UTC offset of a time zone and the time now in it. */
const zoneTime = (timeZone: string) => {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'longOffset',
      })
    );
  }

  const parts = formatters.get(timeZone)!.formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    offset: part('timeZoneName'),
    time: `${part('hour')}:${part('minute')} ${part('dayPeriod')}`,
  };
};

const zoneTemplate: ComboItemTemplate<Zone> = ({ item }) => {
  const { offset, time } = zoneTime(item.id);

  return html`
    <span>
      ${item.name}
      <span style=${muted}>${offset}, ${time}</span>
    </span>
  `;
};

export const TimeZone: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The time zone setting of a profile. The data is every time zone that the browser knows, more than 400, grouped by region. The list is virtual, so it renders only the options in view. `single-select` puts the search into the main input: type "tokyo" and press Enter to select the first match. Typing clears the selection, so `igcChange` comes first with the `deselection` type. The initial value is the time zone of the browser. Each option shows the UTC offset and the time now in that zone.',
      },
    },
  },
  render: () => {
    const data = getZones();
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const initial = data.some(({ id }) => id === browserZone)
      ? browserZone
      : 'Europe/London';

    const status = createRef<HTMLElement>();

    const change = ({ detail }: CustomEvent<IgcComboChangeEventArgs<Zone>>) => {
      // Typing in the main input clears the selection first, and that
      // deselection lists the old time zone.
      const [zone] = detail.type === 'selection' ? detail.items : [];
      status.value!.textContent = zone
        ? `Meetings now show in the time of ${zone.name} (${zoneTime(zone.id).offset}).`
        : '';
    };

    return html`
      ${styles}
      <section class="cmb-stack cmb-panel" aria-labelledby="cmb-zone-title">
        <h3 id="cmb-zone-title">Regional settings</h3>
        <igc-combo
          label="Time zone"
          placeholder="Search time zones"
          single-select
          value-key="id"
          display-key="name"
          group-key="region"
          .data=${data}
          .value=${[initial]}
          .itemTemplate=${zoneTemplate}
          @igcChange=${change}
        >
          <span slot="helper-text">
            Meetings and reminders use this time zone.
          </span>
          <span slot="empty">No time zone matches your search.</span>
        </igc-combo>
        <p class="muted" role="status" ${ref(status)}></p>
      </section>
    `;
  },
};

const columns = [
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Order date' },
  { key: 'status', label: 'Status' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'channel', label: 'Sales channel' },
  { key: 'country', label: 'Country' },
] as const;

type ColumnKey = (typeof columns)[number]['key'];

const defaultColumns: ColumnKey[] = ['customer', 'date', 'status', 'total'];

const orders: Array<Record<'id' | ColumnKey, string>> = [
  {
    id: '10421',
    customer: 'Maya Patel',
    date: 'Sep 28',
    status: 'Shipped',
    items: '3',
    total: '$248.00',
    channel: 'Web',
    country: 'Canada',
  },
  {
    id: '10422',
    customer: 'Daniel Okafor',
    date: 'Sep 29',
    status: 'Paid',
    items: '1',
    total: '$59.90',
    channel: 'Mobile app',
    country: 'Nigeria',
  },
  {
    id: '10423',
    customer: 'Sofía Díaz',
    date: 'Sep 30',
    status: 'Shipped',
    items: '5',
    total: '$1,120.00',
    channel: 'Store',
    country: 'Spain',
  },
  {
    id: '10424',
    customer: 'Liam Chen',
    date: 'Oct 1',
    status: 'Refunded',
    items: '2',
    total: '$75.50',
    channel: 'Web',
    country: 'Singapore',
  },
];

export const ColumnChooser: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A column chooser for a table of orders. The list is short, so `disable-filtering` removes the search input. The Order column always shows, and it is not in the list. `show-select-all` puts "Select all" first in the list: it shows all the columns, or hides them when all of them show, and its checkbox is indeterminate while only some of them show. `igcChange` gives `newValue`, and the story renders the table from it. "Reset" sets `value` to the default columns. A new `value` does not send `igcChange`, so the button renders the table itself.',
      },
    },
  },
  render: () => {
    let visible: string[] = [...defaultColumns];
    const combo = createRef<IgcComboComponent>();

    const { mount, update } = renderInto(() => {
      const shown = columns.filter(({ key }) => visible.includes(key));

      return html`
        <table>
          <caption class="muted">
            ${shown.length + 1} of ${columns.length + 1} columns
          </caption>
          <thead>
            <tr>
              <th scope="col">Order</th>
              ${shown.map(({ label }) => html`<th scope="col">${label}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${orders.map(
              (order) => html`
                <tr>
                  <th scope="row">#${order.id}</th>
                  ${shown.map(({ key }) => html`<td>${order[key]}</td>`)}
                </tr>
              `
            )}
          </tbody>
        </table>
      `;
    });

    const change = ({ detail }: CustomEvent<IgcComboChangeEventArgs>) => {
      visible = detail.newValue as string[];
      update();
    };

    const reset = () => {
      combo.value!.value = [...defaultColumns];
      visible = [...defaultColumns];
      update();
    };

    return html`
      ${styles}
      <style>
        .cmb-columns {
          max-width: 48rem;
        }

        .cmb-columns .cmb-row {
          align-items: end;
        }

        .cmb-columns igc-combo {
          flex: 1 1 18rem;
        }

        .cmb-table {
          overflow-x: auto;
        }

        .cmb-table table {
          border-collapse: collapse;
          width: 100%;
        }

        .cmb-table caption {
          text-align: start;
          padding-block-end: 0.5rem;
        }

        .cmb-table :is(th, td) {
          padding: 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
          text-align: start;
          white-space: nowrap;
        }
      </style>
      <section
        class="cmb-stack cmb-panel cmb-columns"
        aria-labelledby="cmb-columns-title"
      >
        <h3 id="cmb-columns-title">Orders</h3>
        <div class="cmb-row">
          <igc-combo
            ${ref(combo)}
            label="Columns"
            disable-filtering
            show-select-all
            value-key="key"
            display-key="label"
            .data=${columns}
            .value=${visible}
            @igcChange=${change}
          ></igc-combo>
          <igc-button variant="outlined" @click=${reset}>Reset</igc-button>
        </div>
        <div class="cmb-table" ${mount}></div>
      </section>
    `;
  },
};

const issueLabels = [
  'accessibility',
  'bug',
  'design',
  'documentation',
  'feature',
  'good first issue',
  'help wanted',
  'performance',
  'question',
  'security',
  'testing',
];

const issues = [
  {
    id: 512,
    title: 'Hidden focus ring in high contrast',
    labels: ['accessibility', 'bug'],
  },
  {
    id: 509,
    title: 'A dark theme for the date picker',
    labels: ['design', 'feature'],
  },
  {
    id: 507,
    title: 'Document the grid shortcuts',
    labels: ['documentation', 'good first issue'],
  },
  {
    id: 503,
    title: 'Slow scroll of long lists on phones',
    labels: ['bug', 'performance'],
  },
  {
    id: 498,
    title: 'Sanitize the HTML of chat messages',
    labels: ['security'],
  },
  {
    id: 495,
    title: 'Screen readers read the price twice',
    labels: ['accessibility', 'help wanted'],
  },
  {
    id: 490,
    title: 'How to load the options from a server?',
    labels: ['question'],
  },
  {
    id: 486,
    title: 'End-to-end tests for the checkout',
    labels: ['help wanted', 'testing'],
  },
  { id: 482, title: 'Fix the date format in exports', labels: ['bug'] },
  { id: 478, title: 'Export the report as PDF', labels: ['feature'] },
];

export const StagedFilter: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An issue list with a label filter that applies only on demand. Select labels, then press Apply, or Enter on an option: the list shows the issues with one of them. Cancel, Escape, Tab out of the list, or a click outside or on the input puts the applied labels back. `igcClosed` gives the user action that closes the list in `detail.trigger`, so the story applies the labels on `enter` and puts them back on the other triggers. The buttons call `hide()`, which sends no events, so they apply or put back the labels themselves. The focus then moves to the input of the combo. They are in the `footer` slot, and Tab moves to them from the search input and the list. With the list closed, the clear button and Escape clear the filter at once. `show-select-all` selects the labels that the search shows: type "e", then select all.',
      },
    },
  },
  render: () => {
    let applied: string[] = [];
    const combo = createRef<IgcComboComponent>();

    const { mount, update } = renderInto(() => {
      const shown = applied.length
        ? issues.filter(({ labels }) => labels.some((l) => applied.includes(l)))
        : issues;

      return html`
        <p class="muted" role="status">
          ${
            applied.length
              ? `${shown.length} of ${issues.length} issues with ${applied.join(', ')}`
              : `All ${issues.length} issues`
          }
        </p>
        <ul class="cmb-issues">
          ${shown.map(
            ({ id, title, labels }) => html`
              <li>
                <span>#${id} ${title}</span>
                ${labels.map((label) => html`<span class="cmb-label">${label}</span>`)}
              </li>
            `
          )}
        </ul>
      `;
    });

    const apply = () => {
      applied = [...(combo.value!.value as string[])];
      update();
    };

    const restore = () => {
      combo.value!.value = [...applied];
    };

    const closed = ({ detail }: CustomEvent<IgcComboClosingEventArgs>) =>
      detail.trigger === 'enter' ? apply() : restore();

    // The clear button and Escape clear the labels also with the list closed,
    // and then the change applies at once.
    const changed = ({ detail }: CustomEvent<IgcComboChangeEventArgs>) => {
      if (!combo.value!.open) {
        applied = detail.newValue as string[];
        update();
      }
    };

    const button = (action: () => void) => () => {
      action();
      combo.value!.hide();
    };

    return html`
      ${styles}
      <style>
        .cmb-filter {
          max-width: 40rem;
        }

        .cmb-filter-footer {
          display: flex;
          justify-content: end;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .cmb-issues {
          display: grid;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .cmb-issues li {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.375rem;
          padding-block-end: 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .cmb-issues li > span:first-child {
          margin-inline-end: auto;
        }

        .cmb-label {
          padding: 0 0.5rem;
          border: 1px solid var(--ig-gray-400);
          border-radius: 1rem;
          font-size: 0.75rem;
        }
      </style>
      <section
        class="cmb-stack cmb-panel cmb-filter"
        aria-labelledby="cmb-filter-title"
      >
        <h3 id="cmb-filter-title">Issues</h3>
        <igc-combo
          ${ref(combo)}
          label="Labels"
          placeholder="Filter by label"
          placeholder-search="Search labels"
          show-select-all
          .data=${issueLabels}
          @igcChange=${changed}
          @igcClosed=${closed}
        >
          <span slot="helper-text">
            Apply the labels with Apply, or with Enter in the list.
          </span>
          <div slot="footer" class="cmb-filter-footer">
            <igc-button variant="flat" @click=${button(restore)}>
              Cancel
            </igc-button>
            <igc-button @click=${button(apply)}>Apply</igc-button>
          </div>
        </igc-combo>
        <div ${mount}></div>
      </section>
    `;
  },
};

interface Airport {
  code: string;
  label: string;
  search: string;
  airport: string;
  country: string;
}

const airports: Airport[] = (
  [
    ['SOF', 'Sofia', 'Vasil Levski', 'Bulgaria'],
    ['VAR', 'Varna', 'Varna', 'Bulgaria'],
    ['GRU', 'São Paulo', 'Guarulhos', 'Brazil'],
    ['CDG', 'Paris', 'Charles de Gaulle', 'France'],
    ['ORY', 'Paris', 'Orly', 'France'],
    ['FRA', 'Frankfurt', 'Frankfurt', 'Germany'],
    ['MUC', 'Munich', 'Franz Josef Strauss', 'Germany'],
    ['HND', 'Tokyo', 'Haneda', 'Japan'],
    ['NRT', 'Tokyo', 'Narita', 'Japan'],
    ['KIX', 'Osaka', 'Kansai', 'Japan'],
    ['ZRH', 'Zürich', 'Zürich', 'Switzerland'],
    ['LHR', 'London', 'Heathrow', 'United Kingdom'],
    ['LGW', 'London', 'Gatwick', 'United Kingdom'],
    ['JFK', 'New York', 'John F. Kennedy', 'United States'],
    ['EWR', 'Newark', 'Newark Liberty', 'United States'],
    ['SFO', 'San Francisco', 'San Francisco', 'United States'],
  ] as const
).map(([code, city, airport, country]) => ({
  code,
  label: `${city} (${code})`,
  search: `${code} ${city} ${airport}`,
  airport,
  country,
}));

const airportTemplate: ComboItemTemplate<Airport> = ({ item }) => html`
  <span>
    ${item.label}
    <span style=${muted}>${item.airport}</span>
  </span>
`;

export const LazyLoading: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A flight search that loads the airports from the server when the list opens for the first time. `igcOpening` starts the request and sets `loading`, so the empty list shows "Loading", and a spinner takes the place of the toggle icon. The `loading` slot replaces the default spinner with a circular progress. After the load, the `empty` slot tells that the search found nothing. `filteringOptions` sets `filterKey` to a key that joins the code, the city and the airport name, so "lhr", "london" and "heathrow" all find Heathrow. The status message tells a screen reader user when the airports load.',
      },
    },
  },
  render: () => {
    const status = createRef<HTMLElement>();
    let requested = false;

    const load = async (event: Event) => {
      if (requested) {
        return;
      }

      const combo = event.target as IgcComboComponent<Airport>;
      const output = status.value!;

      requested = true;
      combo.loading = true;
      output.textContent = 'Loading the airports…';

      await delay(1200);

      combo.data = airports;
      combo.loading = false;
      output.textContent = `${airports.length} airports loaded.`;
    };

    return html`
      ${styles}
      <style>
        .cmb-flight igc-circular-progress {
          --ig-circular-bar-diameter: 1.25rem;
        }
      </style>
      <section
        class="cmb-stack cmb-panel cmb-flight"
        aria-labelledby="cmb-flight-title"
      >
        <h3 id="cmb-flight-title">Find a flight</h3>
        <igc-combo
          label="From"
          placeholder="City or airport"
          single-select
          value-key="code"
          display-key="label"
          group-key="country"
          .filteringOptions=${{ filterKey: 'search' }}
          .itemTemplate=${airportTemplate}
          @igcOpening=${load}
        >
          <igc-circular-progress
            slot="loading"
            indeterminate
            aria-label="Loading the airports"
          ></igc-circular-progress>
          <span slot="empty">No airport matches your search.</span>
        </igc-combo>
        <p class="muted" role="status" ${ref(status)}></p>
      </section>
    `;
  },
};

const europeanCities: City[] = (
  [
    ['AMS', 'Amsterdam', 'Netherlands'],
    ['ATH', 'Athens', 'Greece'],
    ['BAR', 'Barcelona', 'Spain'],
    ['BEL', 'Belgrade', 'Serbia'],
    ['BER', 'Berlin', 'Germany'],
    ['BGO', 'Bergen', 'Norway'],
    ['BRN', 'Bern', 'Switzerland'],
    ['BOR', 'Bordeaux', 'France'],
    ['BRA', 'Bratislava', 'Slovakia'],
    ['BRU', 'Brussels', 'Belgium'],
    ['BUC', 'Bucharest', 'Romania'],
    ['BUD', 'Budapest', 'Hungary'],
    ['CPH', 'Copenhagen', 'Denmark'],
    ['DUB', 'Dublin', 'Ireland'],
    ['EDI', 'Edinburgh', 'United Kingdom'],
    ['FLO', 'Florence', 'Italy'],
    ['FRA', 'Frankfurt', 'Germany'],
    ['GDN', 'Gdańsk', 'Poland'],
    ['GVA', 'Geneva', 'Switzerland'],
    ['HAM', 'Hamburg', 'Germany'],
    ['HEL', 'Helsinki', 'Finland'],
    ['KRK', 'Kraków', 'Poland'],
    ['LIS', 'Lisbon', 'Portugal'],
    ['LJU', 'Ljubljana', 'Slovenia'],
    ['LON', 'London', 'United Kingdom'],
    ['LYS', 'Lyon', 'France'],
    ['MAD', 'Madrid', 'Spain'],
    ['MIL', 'Milan', 'Italy'],
    ['MUC', 'Munich', 'Germany'],
    ['NAP', 'Naples', 'Italy'],
    ['OSL', 'Oslo', 'Norway'],
    ['PAR', 'Paris', 'France'],
    ['PLV', 'Plovdiv', 'Bulgaria'],
    ['POR', 'Porto', 'Portugal'],
    ['PRG', 'Prague', 'Czechia'],
    ['RIG', 'Riga', 'Latvia'],
    ['ROM', 'Rome', 'Italy'],
    ['ROT', 'Rotterdam', 'Netherlands'],
    ['SEV', 'Seville', 'Spain'],
    ['SOF', 'Sofia', 'Bulgaria'],
    ['STO', 'Stockholm', 'Sweden'],
    ['TAL', 'Tallinn', 'Estonia'],
    ['VAR', 'Varna', 'Bulgaria'],
    ['VCE', 'Venice', 'Italy'],
    ['VIE', 'Vienna', 'Austria'],
    ['VNO', 'Vilnius', 'Lithuania'],
    ['WAW', 'Warsaw', 'Poland'],
    ['ZAG', 'Zagreb', 'Croatia'],
    ['ZRH', 'Zürich', 'Switzerland'],
  ] as const
).map(([id, name, country]) => ({ id, name, country }));

/** A fake server. It searches the names and returns new objects, as parsed JSON does. */
async function fetchCities(
  searchText: string,
  skip: number,
  top: number,
  latency: number
): Promise<{ items: City[]; total: number }> {
  await delay(latency);

  const text = searchText.toLocaleLowerCase();
  const results = europeanCities.filter(({ name }) =>
    name.toLocaleLowerCase().includes(text)
  );

  return {
    items: results.slice(skip, skip + top).map((city) => ({ ...city })),
    total: results.length,
  };
}

export const RemoteData: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A city picker that searches and pages on a server through `bindComboDataSource()` from `igniteui-webcomponents/extras`, twenty cities at a time. Open the list, scroll to its end to load more, then type to search. The list has a skeleton row for each city to load, so the scrollbar shows all the results, and a spinner takes the place of the toggle icon while a search waits or a page loads. Press End to jump to the last city: one request loads all the cities up to it. Select a few cities and search for others: the selection stays, also for the cities that the new results do not hold. The second combo has a slower server and styles its loading parts: `::part(loading)` sets the color and the width of the spinner, and `::part(placeholder)` sets the color of the skeleton rows. The server log shows each request and answer of both combos.',
      },
    },
  },
  render: () => {
    const log = createRef<HTMLOListElement>();

    const write = (line: string) => {
      const item = document.createElement('li');
      item.textContent = line;
      log.value?.prepend(item);
    };

    /** A ref callback that binds the combo, and disposes the binding when the combo goes. */
    const binder = (name: string, latency: number) => {
      let binding: ComboDataBinding | undefined;

      const source: ComboDataSource<City> = {
        load: async ({ searchText, startIndex, count }, signal) => {
          const query = searchText ? `"${searchText}"` : 'all cities';
          write(
            `${name}: request ${startIndex + 1}–${startIndex + count} of ${query}`
          );

          const { items, total } = await fetchCities(
            searchText,
            startIndex,
            count,
            latency
          );

          write(
            signal.aborted
              ? `${name}: aborted the request of ${query}`
              : `${name}: ${items.length} of ${total} cities`
          );
          return { items, totalCount: total };
        },
      };

      return (element?: Element) => {
        binding?.dispose();
        binding = element
          ? bindComboDataSource(element as IgcComboComponent<City>, source, {
              pageSize: 20,
            })
          : undefined;
      };
    };

    const onChange =
      (name: string) => (event: CustomEvent<IgcComboChangeEventArgs>) => {
        write(`${name}: value ${event.detail.newValue.join(', ') || 'none'}`);
      };

    return html`
      ${styles}
      <style>
        .cmb-remote {
          max-width: 52rem;
        }

        .cmb-remote-body {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
          align-items: start;
          gap: 1rem;
        }

        .cmb-log-panel {
          display: grid;
          gap: 0.5rem;
        }

        .cmb-styled::part(loading),
        .cmb-styled::part(placeholder) {
          color: var(--ig-success-500);
        }

        .cmb-styled::part(loading) {
          border-width: 3px;
        }

        .cmb-log-panel h4 {
          margin: 0;
          font-size: 0.875rem;
        }

        .cmb-log {
          block-size: 12rem;
          overflow: auto;
          margin: 0;
          padding-inline-start: 2.5rem;
          font-size: 0.8125rem;
          font-variant-numeric: tabular-nums;
        }
      </style>
      <section
        class="cmb-stack cmb-panel cmb-remote"
        aria-labelledby="cmb-remote-title"
      >
        <h3 id="cmb-remote-title">Cities from the server</h3>
        <div class="cmb-remote-body">
          <div class="cmb-stack">
            <igc-combo
              ${ref(binder('Cities', 400))}
              label="Cities"
              placeholder="Pick cities"
              placeholder-search="Search cities"
              value-key="id"
              display-key="name"
              @igcChange=${onChange('Cities')}
            >
              <span slot="empty">No city matches your search.</span>
            </igc-combo>
            <igc-combo
              class="cmb-styled"
              ${ref(binder('Styled', 1500))}
              label="Cities with styled loading parts"
              placeholder="Pick cities"
              placeholder-search="Search cities"
              value-key="id"
              display-key="name"
              @igcChange=${onChange('Styled')}
            >
              <span slot="empty">No city matches your search.</span>
              <span slot="helper-text">
                A slower server, so the loading state shows longer.
              </span>
            </igc-combo>
          </div>
          <div class="cmb-log-panel">
            <h4 id="cmb-log-title">Server log</h4>
            <ol
              class="cmb-log"
              reversed
              aria-labelledby="cmb-log-title"
              ${ref(log)}
            ></ol>
          </div>
        </div>
      </section>
    `;
  },
};

const labels = ['bug', 'feature', 'documentation', 'performance', 'security'];

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A form that creates a project. The project lead is `required` and `single-select`: until a person is chosen, the form does not submit, and the `value-missing` slot shows the message. The labels are plain strings, so the combo needs no keys, and the `value` attribute is the default value that Reset restores. The form data has one entry for each selected value, under the `name` of the combo. Submit shows the form data.',
      },
    },
  },
  render: () => html`
    ${styles}
    <form class="cmb-stack cmb-panel" @submit=${formSubmitHandler}>
      <h3>New project</h3>
      <igc-input name="title" label="Project name" required></igc-input>
      <igc-combo
        name="lead"
        label="Project lead"
        placeholder="Choose a person"
        single-select
        required
        value-key="id"
        display-key="name"
        group-key="team"
        .data=${people}
        .itemTemplate=${personTemplate}
      >
        <span slot="value-missing">Choose a project lead.</span>
      </igc-combo>
      <igc-combo
        name="labels"
        label="Labels"
        placeholder="Add labels"
        value='["feature"]'
        .data=${labels}
      >
        <span slot="helper-text">Labels help people find the project.</span>
      </igc-combo>
      <div class="cmb-row">
        <igc-button type="submit">Create project</igc-button>
        <igc-button type="reset" variant="outlined">Reset</igc-button>
      </div>
    </form>
  `,
};

export const InScrollingPanel: Story = {
  args: {
    label: 'Location(s)',
    placeholder: 'Cities of interest',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A combo opens its list inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the list when the panel scrolls. If the value is `hide`, the list hides while the input is out of view. `hide` is the default value. If the value is `scroll`, the list follows the input. If the value is `close`, the list closes.',
      },
    },
  },
  render: ({ label, placeholder, singleSelect, scrollStrategy }) =>
    scrollingPanel(
      'Shipping preferences',
      'list',
      'Deliveries are grouped by country and dispatched daily.',
      html`
        <igc-combo
          value-key="id"
          display-key="name"
          group-key="country"
          .data=${cities}
          .label=${label}
          .placeholder=${placeholder}
          .scrollStrategy=${scrollStrategy}
          ?single-select=${singleSelect}
        ></igc-combo>
      `
    ),
};
