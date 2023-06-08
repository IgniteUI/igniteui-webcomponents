import { html } from 'lit';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ComboItemTemplate } from '../src/index.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import { defineComponents, IgcComboComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

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
  parameters: { docs: { description: {} } },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'The required attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'The invalid attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    outlined: {
      type: 'boolean',
      description: 'The outlined attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    singleSelect: {
      type: 'boolean',
      description:
        'Enables single selection mode and moves item filtering to the main input.',
      control: 'boolean',
      defaultValue: false,
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
    },
    autofocusList: {
      type: 'boolean',
      description: 'Focuses the list of options when the menu opens.',
      control: 'boolean',
      defaultValue: false,
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
      defaultValue: 'Search',
    },
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      description: 'The direction attribute of the control.',
      options: ['ltr', 'rtl', 'auto'],
      control: { type: 'inline-radio' },
      defaultValue: 'auto',
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      defaultValue: false,
    },
    flip: { type: 'boolean', control: 'boolean', defaultValue: true },
    groupSorting: {
      type: '"asc" | "desc"',
      description:
        'Sorts the items in each group by ascending or descending order.',
      options: ['asc', 'desc'],
      control: { type: 'inline-radio' },
      defaultValue: 'asc',
    },
    caseSensitiveIcon: {
      type: 'boolean',
      description:
        'Enables the case sensitive search icon in the filtering input.',
      control: 'boolean',
      defaultValue: false,
    },
    disableFiltering: {
      type: 'boolean',
      description: 'Disables the filtering of the list of options.',
      control: 'boolean',
      defaultValue: false,
    },
    positionStrategy: {
      type: '"absolute" | "fixed"',
      description: "Sets the component's positioning strategy.",
      options: ['absolute', 'fixed'],
      control: { type: 'inline-radio' },
      defaultValue: 'fixed',
    },
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the dropdown's width should be the same as the target's one.\nTrue by default.",
      control: 'boolean',
      defaultValue: true,
    },
  },
  args: {
    disabled: false,
    required: false,
    invalid: false,
    outlined: false,
    singleSelect: false,
    autofocusList: false,
    placeholderSearch: 'Search',
    dir: 'auto',
    open: false,
    flip: true,
    groupSorting: 'asc',
    caseSensitiveIcon: false,
    disableFiltering: false,
    positionStrategy: 'fixed',
    sameWidth: true,
  },
};

export default metadata;

interface IgcComboArgs {
  /** The name attribute of the control. */
  name: string;
  /** The disabled attribute of the control. */
  disabled: boolean;
  /** The required attribute of the control. */
  required: boolean;
  /** The invalid attribute of the control. */
  invalid: boolean;
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
  /** The direction attribute of the control. */
  dir: 'ltr' | 'rtl' | 'auto';
  /** Sets the open state of the component. */
  open: boolean;
  flip: boolean;
  /** Sorts the items in each group by ascending or descending order. */
  groupSorting: 'asc' | 'desc';
  /** Enables the case sensitive search icon in the filtering input. */
  caseSensitiveIcon: boolean;
  /** Disables the filtering of the list of options. */
  disableFiltering: boolean;
  /** Sets the component's positioning strategy. */
  positionStrategy: 'absolute' | 'fixed';
  /**
   * Whether the dropdown's width should be the same as the target's one.
   * True by default.
   */
  sameWidth: boolean;
}
type Story = StoryObj<IgcComboArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: [
      'igcFocus',
      'igcBlur',
      'igcOpening',
      'igcOpened',
      'igcClosing',
      'igcClosed',
      'igcChange',
    ],
  },
});

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

// const mandzhasgrozde = [0, 'Sofia', 4, 'Varna', 'varna', false, { a: 1, b: 2 }, -1, true, null, undefined, NaN, 0];

registerIconFromText(
  'location',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
);

const Template = (
  {
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
  }: IgcComboComponent<City>,
  { globals: { direction } }: Context
) => html`
  <igc-combo
    .data=${cities}
    .dir=${direction}
    .itemTemplate=${itemTemplate}
    .groupHeaderTemplate=${groupHeaderTemplate}
    label=${ifDefined(label)}
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    placeholder-search=${ifDefined(placeholderSearch)}
    dir=${ifDefined(direction)}
    value-key="id"
    display-key="name"
    value='["BG01", "BG02"]'
    group-key="country"
    group-sorting="${ifDefined(groupSorting)}"
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
