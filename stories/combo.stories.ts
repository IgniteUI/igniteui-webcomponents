import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  type ComboItemTemplate,
  IgcComboComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcComboComponent);

interface City {
  id: string;
  name: string;
  zip: string;
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
          'The Combo component is similar to the Select component in that it provides a list of options from which the user can make a selection.\nIn contrast to the Select component, the Combo component displays all options in a virtualized list of items,\nmeaning the combo box can simultaneously show thousands of options, where one or more options can be selected.\nAdditionally, users can create custom item templates, allowing for robust data visualization.\nThe Combo component features case-sensitive filtering, grouping, complex data binding, dynamic addition of values and more.',
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
        'Enables single selection mode and moves item filtering to the main input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control should receive focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocusList: {
      type: 'boolean',
      description: 'Focuses the list of options when the menu opens.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    locale: {
      type: 'string',
      description:
        "The locale used to resolve the component's resource strings.\nFalls back to the global locale when not set.",
      control: 'text',
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'Sets the behavior of the component when the parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
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
        'The key in the data source used to display items in the list.',
      control: 'text',
    },
    groupKey: {
      type: 'string',
      description:
        'The key in the data source used to group items in the list.',
      control: 'text',
    },
    groupSorting: {
      type: { name: 'enum', value: ['asc', 'desc', 'none'] },
      description:
        'Sorts the items in each group by ascending or descending order.',
      options: ['asc', 'desc', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'asc' } },
    },
    caseSensitiveIcon: {
      type: 'boolean',
      description:
        'Enables the case sensitive search icon in the filtering input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableFiltering: {
      type: 'boolean',
      description: 'Disables the filtering of the list of options.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableClear: {
      type: 'boolean',
      description: 'Hides the clear button.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
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
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    outlined: false,
    singleSelect: false,
    autofocus: false,
    autofocusList: false,
    scrollStrategy: 'hide',
    groupSorting: 'asc',
    caseSensitiveIcon: false,
    disableFiltering: false,
    disableClear: false,
    required: false,
    disabled: false,
    invalid: false,
    open: false,
  },
};

export default metadata;

interface IgcComboArgs {
  /** Whether the control has an outlined appearance. */
  outlined: boolean;
  /** Enables single selection mode and moves item filtering to the main input. */
  singleSelect: boolean;
  /** Whether the control should receive focus automatically. */
  autofocus: boolean;
  /** Focuses the list of options when the menu opens. */
  autofocusList: boolean;
  /**
   * The locale used to resolve the component's resource strings.
   * Falls back to the global locale when not set.
   */
  locale: string;
  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
  /** The label of the control. */
  label: string;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The placeholder text of the search input. */
  placeholderSearch: string;
  /** The key in the data source used when selecting items. */
  valueKey: string;
  /** The key in the data source used to display items in the list. */
  displayKey: string;
  /** The key in the data source used to group items in the list. */
  groupKey: string;
  /** Sorts the items in each group by ascending or descending order. */
  groupSorting: 'asc' | 'desc' | 'none';
  /** Enables the case sensitive search icon in the filtering input. */
  caseSensitiveIcon: boolean;
  /** Disables the filtering of the list of options. */
  disableFiltering: boolean;
  /** Hides the clear button. */
  disableClear: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcComboArgs>;

// endregion

const itemTemplate: ComboItemTemplate<City> = ({ item }) => {
  return html` <div><b>${item?.name ?? item}</b> [${item?.zip}]</div> `;
};

const groupHeaderTemplate: ComboItemTemplate<City> = ({ item }) => {
  return html`<div>Country of ${item?.country ?? item}</div>`;
};
const primitiveData = [1, 2, 3, 4, 5, 'one', 'two', 'three', 'four', 'five'];

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

registerIconFromText(
  'location',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
);

registerIconFromText(
  'no-data',
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m17.121 21.364l2.122-2.121m2.121-2.122l-2.121 2.122m0 0L17.12 17.12m2.122 2.122l2.121 2.121M4 6v6s0 3 7 3s7-3 7-3V6"/><path d="M11 3c7 0 7 3 7 3s0 3-7 3s-7-3-7-3s0-3 7-3m0 18c-7 0-7-3-7-3v-6"/></g></svg>',
  'combo-samples'
);

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully-featured combo with grouped city data, a custom item template, a prefix icon, and helper text. Use the controls panel to explore all available properties interactively.',
      },
    },
  },
  args: {
    label: 'Location(s)',
    placeholder: 'Cities of interest',
    placeholderSearch: 'Search cities...',
    groupSorting: 'asc',
    valueKey: 'id',
    displayKey: 'name',
    groupKey: 'country',
  },
  render: (args) => html`
    <igc-combo
      value-key=${args.valueKey}
      display-key=${args.displayKey}
      group-key=${args.groupKey}
      value='["BG01", "BG02"]'
      .label=${args.label}
      .name=${args.name}
      .placeholder=${args.placeholder}
      .placeholderSearch=${args.placeholderSearch}
      .data=${cities}
      .itemTemplate=${itemTemplate}
      .groupHeaderTemplate=${groupHeaderTemplate}
      .groupSorting=${args.groupSorting}
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
      <p slot="helper-text">Sample helper text.</p>
    </igc-combo>
  `,
};

export const NoData: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'When no data is bound the combo renders an empty-state area. The default template shows a generic message; slot `empty` accepts arbitrary content for a fully custom empty state.',
      },
    },
  },
  render: () => html`
    <style>
      igc-combo {
        margin-bottom: 5rem;
      }
      .no-data {
        display: flex;
        justify-content: space-evenly;
      }
    </style>
    <igc-combo label="No data and default empty template"></igc-combo>

    <igc-combo label="No data and custom empty template">
      <div class="no-data" slot="empty">
        <igc-icon name="no-data" collection="combo-samples"></igc-icon>
        <p>No data currently bound to the combo</p>
      </div>
    </igc-combo>
  `,
};

export const SingleSelect: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `singleSelect` restricts the combo to one selected item and moves the filtering input into the main trigger field, making it behave like a searchable select. The selection is cleared when the user types to search.',
      },
    },
  },
  render: () => html`
    <igc-combo
      label="Single-select city"
      placeholder="Pick a city"
      placeholder-search="Search cities…"
      .data=${cities}
      value-key="id"
      display-key="name"
      group-key="country"
      single-select
      style="max-width: 320px"
    >
      <igc-icon slot="prefix" name="location"></igc-icon>
    </igc-combo>
  `,
};

export const Grouping: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'When `groupKey` is set the items are partitioned into labelled groups. The `groupSorting` property controls the sort order of groups: **asc** (default), **desc**, or **none** (preserves data-source order).',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1rem; align-items: flex-start;"
    >
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <span style="font-weight: 600;">Ascending (default)</span>
        <igc-combo
          label="Cities"
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
          group-sorting="asc"
          style="width: 260px"
        ></igc-combo>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <span style="font-weight: 600;">Descending</span>
        <igc-combo
          label="Cities"
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
          group-sorting="desc"
          style="width: 260px"
        ></igc-combo>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <span style="font-weight: 600;">None (data-source order)</span>
        <igc-combo
          label="Cities"
          .data=${cities}
          value-key="id"
          display-key="name"
          group-key="country"
          group-sorting="none"
          style="width: 260px"
        ></igc-combo>
      </div>
    </div>
  `,
};

export const CustomTemplate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `itemTemplate` and `groupHeaderTemplate` properties accept render functions that receive the bound data item, enabling fully custom list-item and group-header markup. The example below renders each city with its ZIP code and replaces the default group header.',
      },
    },
  },
  render: () => html`
    <igc-combo
      label="Location(s)"
      placeholder="Cities of interest"
      placeholder-search="Search cities…"
      .data=${cities}
      .itemTemplate=${itemTemplate}
      .groupHeaderTemplate=${groupHeaderTemplate}
      value-key="id"
      display-key="name"
      group-key="country"
      style="max-width: 360px"
    >
      <igc-icon slot="prefix" name="location"></igc-icon>
    </igc-combo>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates combo behavior inside an HTML `<form>`, covering multi-select with an initial value, no-value-key binding, single-select mode, primitive data, disabled fieldset, and required validation.',
      },
    },
  },
  render: () => {
    return html`
      <style>
        fieldset {
          min-width: 0;
        }
      </style>
      <form @submit=${formSubmitHandler}>
        <fieldset>
          <igc-combo
            .data=${cities}
            label="Default"
            name="combo"
            value-key="id"
            display-key="name"
          ></igc-combo>

          <igc-combo
            .data=${cities}
            label="Initial value"
            name="combo-initial"
            value='["BG01", "BG02"]'
            value-key="id"
            display-key="name"
          ></igc-combo>

          <igc-combo
            .data=${cities}
            label="No value key"
            name="combo-not-key"
            display-key="name"
          ></igc-combo>

          <igc-combo
            .data=${cities}
            single-select
            label="Single selection"
            name="combo-single"
            display-key="name"
            value-key="id"
          ></igc-combo>
        </fieldset>

        <fieldset>
          <igc-combo
            .data=${primitiveData}
            value='[1, "one"]'
            name="combo-primitive"
            label="Primitives binding"
          ></igc-combo>
        </fieldset>

        <fieldset disabled>
          <igc-combo
            .data=${cities}
            label="Disabled"
            name="combo-disabled"
            value-key="id"
            display-key="name"
          ></igc-combo>
        </fieldset>

        <fieldset>
          <igc-combo
            .data=${cities}
            label="Required"
            name="combo-required"
            value-key="id"
            display-key="name"
            required
          >
            <div slot="helper-text">Select a value</div>
            <div slot="value-missing">This field is required!</div>
          </igc-combo>
        </fieldset>

        ${formControls()}
      </form>
    `;
  },
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
  render: ({ label, placeholder, singleSelect, scrollStrategy }) => html`
    <style>
      .panel {
        max-width: 46rem;
        height: 16rem;
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--ig-gray-200, #e0e0e0);
        border-radius: 4px;
      }
    </style>

    <div class="panel">
      <h4>Shipping preferences</h4>
      <p>
        Open the list and scroll this panel to compare the scroll strategies.
      </p>

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

      <p>
        ${Array.from(range(1, 24)).map(
          () => html`Deliveries are grouped by country and dispatched daily. `
        )}
      </p>
    </div>
  `,
};
