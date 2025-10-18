import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

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
      description: 'The outlined attribute of the control.',
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
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocusList: {
      type: 'boolean',
      description: 'Focuses the list of options when the menu opens.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      type: 'string',
      description: 'The label attribute of the control.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    placeholderSearch: {
      type: 'string',
      description: 'The placeholder attribute of the search input.',
      control: 'text',
      table: { defaultValue: { summary: 'Search' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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
      type: '"asc" | "desc" | "none"',
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
      description: 'The name attribute of the control.',
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
  },
  args: {
    outlined: false,
    singleSelect: false,
    autofocus: false,
    autofocusList: false,
    placeholderSearch: 'Search',
    open: false,
    groupSorting: 'asc',
    caseSensitiveIcon: false,
    disableFiltering: false,
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcComboArgs {
  /** The outlined attribute of the control. */
  outlined: boolean;
  /** Enables single selection mode and moves item filtering to the main input. */
  singleSelect: boolean;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** Focuses the list of options when the menu opens. */
  autofocusList: boolean;
  /** The label attribute of the control. */
  label: string;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The placeholder attribute of the search input. */
  placeholderSearch: string;
  /** Sets the open state of the component. */
  open: boolean;
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
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcComboArgs>;

// endregion

const itemTemplate: ComboItemTemplate<City> = ({ item }) => {
  return html`
    <div>
      <span><b>${item?.name ?? item}</b> [${item?.zip}]</span>
    </div>
  `;
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

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
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
