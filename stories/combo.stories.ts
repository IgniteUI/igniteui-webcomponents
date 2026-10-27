import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  type ComboItemTemplate,
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCircularProgressComponent,
  type IgcComboChangeEventArgs,
  IgcComboComponent,
  type IgcComboSearchInputEventArgs,
  IgcInputComponent,
  type VirtualScrollDataRequest,
  defineComponents,
} from 'igniteui-webcomponents';
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
          'A column chooser for a table of orders. The list is short, so `disable-filtering` removes the search input. The Order column always shows, and it is not in the list. `igcChange` gives `newValue`, and the story renders the table from it. The buttons use the methods: "Show all" calls `select()` with no argument, which selects all the options, and "Reset" sets `value` to the default columns. A method or a new `value` does not send `igcChange`, so the buttons render the table themselves.',
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

    const showAll = () => {
      combo.value!.select();
      visible = combo.value!.value as string[];
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
            value-key="key"
            display-key="label"
            .data=${columns}
            .value=${visible}
            @igcChange=${change}
          ></igc-combo>
          <igc-button variant="outlined" @click=${showAll}>Show all</igc-button>
          <igc-button variant="flat" @click=${reset}>Reset</igc-button>
        </div>
        <div class="cmb-table" ${mount}></div>
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
          'A flight search that loads the airports from the server when the list opens for the first time. `igcOpening` starts the request, and until the data comes, the `empty` slot shows a spinner and a loading message. After the load, the same slot tells that the search found nothing. `filteringOptions` sets `filterKey` to a key that joins the code, the city and the airport name, so "lhr", "london" and "heathrow" all find Heathrow. The status message tells a screen reader user when the airports load.',
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
      const empty = combo.querySelector('[slot="empty"]')!;

      requested = true;
      output.textContent = 'Loading the airports…';

      await delay(1200);

      combo.data = airports;
      empty.textContent = 'No airport matches your search.';
      output.textContent = `${airports.length} airports loaded.`;
    };

    return html`
      ${styles}
      <style>
        .cmb-loading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cmb-loading igc-circular-progress {
          --ig-circular-bar-diameter: 1.5rem;
        }
      </style>
      <section class="cmb-stack cmb-panel" aria-labelledby="cmb-flight-title">
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
          <div slot="empty">
            <span class="cmb-loading">
              <igc-circular-progress
                indeterminate
                aria-label="Loading the airports"
              ></igc-circular-progress>
              Loading the airports…
            </span>
          </div>
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

const cityPageSize = 10;

/** A fake server. It returns one page of new objects, as parsed JSON does. */
async function fetchCities(searchText: string, skip: number): Promise<City[]> {
  await delay(400);

  const text = searchText.toLocaleLowerCase();

  return europeanCities
    .filter(({ name }) => name.toLocaleLowerCase().includes(text))
    .slice(skip, skip + cityPageSize)
    .map((city) => ({ ...city }));
}

export const RemoteData: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A city picker that searches and pages on a server, ten cities at a time. With `filteringOptions.mode` set to `remote`, the combo does not filter the options. `igcOpening` loads the first page, `igcSearchInput` loads the first page of the search after a 300 ms pause in the typing, and `igcDataRequest` appends the next page when the list scrolls near its end. A newer search drops the answers to older requests. Select a few cities, then search for others: the selection stays, also for the cities that the new results do not hold. The log shows each request and answer.',
      },
    },
  },
  render: () => {
    const combo = createRef<IgcComboComponent<City>>();
    const log = createRef<HTMLOListElement>();
    let searchText = '';
    let search = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const write = (line: string) => {
      const item = document.createElement('li');
      item.textContent = line;
      log.value!.prepend(item);
    };

    // The server answers with one page, whatever `count` the combo asks for.
    const load = async (skip: number) => {
      const current = search;
      write(`Request: "${searchText}" from item ${skip + 1}`);

      const page = await fetchCities(searchText, skip);

      const target = combo.value!;

      // Drop the answer to an older search, or for a `data` that changed since.
      if (current !== search || (skip && target.data.length !== skip)) {
        return;
      }

      target.data = skip ? [...target.data, ...page] : page;
      write(`Answer: ${page.length} cities, ${target.data.length} loaded`);
    };

    const onOpening = () => {
      if (!combo.value!.data.length) {
        void load(0);
      }
    };

    const onSearch = (event: CustomEvent<IgcComboSearchInputEventArgs>) => {
      searchText = event.detail.searchText.trim();
      search++;
      clearTimeout(timer);
      timer = setTimeout(() => load(0), 300);
    };

    const onRequest = (event: CustomEvent<VirtualScrollDataRequest>) => {
      void load(event.detail.startIndex);
    };

    const onChange = (event: CustomEvent<IgcComboChangeEventArgs>) => {
      write(`Value: ${event.detail.newValue.join(', ') || 'none'}`);
    };

    return html`
      ${styles}
      <style>
        .cmb-log {
          max-block-size: 12rem;
          overflow: auto;
          margin: 0;
          font-family: monospace;
          font-size: 0.8125rem;
        }
      </style>
      <section class="cmb-stack cmb-panel" aria-labelledby="cmb-remote-title">
        <h3 id="cmb-remote-title">Cities from the server</h3>
        <igc-combo
          ${ref(combo)}
          label="Cities"
          placeholder="Pick cities"
          value-key="id"
          display-key="name"
          .filteringOptions=${{ mode: 'remote' }}
          @igcOpening=${onOpening}
          @igcSearchInput=${onSearch}
          @igcDataRequest=${onRequest}
          @igcChange=${onChange}
        >
          <span slot="empty">No city matches your search.</span>
        </igc-combo>
        <ol class="cmb-log" aria-label="Server log" ${ref(log)}></ol>
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
