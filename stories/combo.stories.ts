import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  type ComboItemTemplate,
  IgcComboComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';
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
      table: { defaultValue: { summary: false } },
    },
    singleSelect: {
      type: 'boolean',
      description:
        'Enables single selection mode and moves item filtering to the main input.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    autofocusList: {
      type: 'boolean',
      description: 'Focuses the list of options when the menu opens.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
      table: { defaultValue: { summary: false } },
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
      table: { defaultValue: { summary: false } },
    },
    disableFiltering: {
      type: 'boolean',
      description: 'Disables the filtering of the list of options.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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

// const mandzhasgrozde = [0, 'Sofia', 4, 'Varna', 'varna', false, { a: 1, b: 2 }, -1, true, NaN, 0];

registerIconFromText(
  'location',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
);

const Template = ({
  name,
  disableFiltering,
  caseSensitiveIcon,
  label = 'Location(s)',
  placeholder = 'Cities of interest',
  placeholderSearch = 'Search',
  open = false,
  disabled = false,
  outlined = false,
  invalid = false,
  required = false,
  autofocus = false,
  singleSelect = false,
  autofocusList,
  groupSorting = 'asc',
  sameWidth = false,
}: IgcComboComponent<City>) => html`
  <igc-combo
    .data=${cities}
    .itemTemplate=${itemTemplate}
    .groupHeaderTemplate=${groupHeaderTemplate}
    label=${ifDefined(label)}
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    placeholder-search=${ifDefined(placeholderSearch)}
    value-key="id"
    display-key="name"
    value='["BG01", "BG02"]'
    group-key="country"
    group-sorting=${ifDefined(groupSorting)}
    ?same-width=${sameWidth}
    ?case-sensitive-icon=${caseSensitiveIcon}
    ?disable-filtering=${disableFiltering}
    ?open=${open}
    ?autofocus=${autofocus}
    ?autofocus-list=${autofocusList}
    ?outlined=${outlined}
    ?required=${required}
    ?disabled=${disabled}
    ?invalid=${invalid}
    ?single-select=${singleSelect}
  >
    <igc-icon slot="prefix" name="location"></igc-icon>
    <span slot="helper-text">Sample helper text.</span>
  </igc-combo>
`;

export const Basic: Story = Template.bind({});

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const primitive = [1, 2, 3, 4, 5, 'one', 'two', 'three', 'four', 'five'];
    return html`
      <form @submit=${formSubmitHandler}>
        <fieldset>
          <igc-combo
            label="Default"
            name="combo"
            .data=${cities}
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="Initial value"
            .data=${cities}
            name="combo-initial"
            value='["BG01", "BG02"]'
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="No value key"
            .data=${cities}
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
            name="combo-primitive"
            .value=${[1, 'one']}
            .data=${primitive}
            label="Primitives binding"
          ></igc-combo>
        </fieldset>
        <fieldset disabled="disabled">
          <igc-combo
            label="Disabled"
            name="combo-disabled"
            .data=${cities}
            value-key="id"
            display-key="name"
          ></igc-combo>
        </fieldset>
        <fieldset>
          <igc-combo
            label="Required"
            name="combo-required"
            .data=${cities}
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
