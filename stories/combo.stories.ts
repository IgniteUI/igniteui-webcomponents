import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineAllComponents } from '../src/index.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
// import { faker } from '@faker-js/faker';

defineAllComponents();

// region default
const metadata = {
  title: 'Combo',
  component: 'igc-combo',
  argTypes: {
    value: {
      type: 'string | undefined',
      description: 'The value attribute of the control.',
      control: 'text',
    },
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
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
    },
    autofocusOptions: {
      type: 'boolean',
      description:
        'Focuses the first item in the list of options when the menu opens.',
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
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    caseSensitiveIcon: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    disableFiltering: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    scrollStrategy: {
      type: '"scroll" | "block" | "close" | undefined',
      options: ['scroll', 'block', 'close', 'undefined'],
      control: {
        type: 'inline-radio',
      },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean | undefined',
      control: 'boolean | undefined',
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      defaultValue: false,
    },
    positionStrategy: {
      type: '"absolute" | "fixed" | undefined',
      description:
        'The positioning strategy to use.\nUse the `fixed` strategy when the target element is in a fixed container, otherwise - use `absolute`.',
      options: ['absolute', 'fixed', 'undefined'],
      control: {
        type: 'inline-radio',
      },
    },
    flip: {
      type: 'boolean | undefined',
      description:
        "Whether the element should be flipped to the opposite side once it's about to overflow the visible area.\nOnce enough space is detected on its preferred side, it will flip back.",
      control: 'boolean | undefined',
    },
    distance: {
      type: 'number | undefined',
      description:
        'Whether to prevent the element from being cut off by moving it so it stays visible within its boundary area.',
      control: 'number',
    },
    sameWidth: {
      type: 'boolean | undefined',
      description: 'Whether to make the toggle the same width as the target.',
      control: 'boolean | undefined',
    },
  },
};
export default metadata;
interface ArgTypes {
  value: string | undefined;
  name: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  outlined: boolean;
  autofocus: boolean;
  autofocusOptions: boolean;
  label: string;
  placeholder: string;
  placeholderSearch: string;
  dir: 'ltr' | 'rtl' | 'auto';
  caseSensitiveIcon: boolean;
  disableFiltering: boolean;
  scrollStrategy: 'scroll' | 'block' | 'close' | undefined;
  keepOpenOnOutsideClick: boolean | undefined;
  open: boolean;
  positionStrategy: 'absolute' | 'fixed' | undefined;
  flip: boolean | undefined;
  distance: number | undefined;
  sameWidth: boolean | undefined;
}
// endregion

// interface City {
//   id: string;
//   name: string;
//   zip: string;
//   country: string;
// }

// function generateCity(): City {
//   const id = faker.datatype.uuid();
//   const name = faker.address.cityName();
//   const zip = faker.address.zipCode();
//   const country = faker.address.country();

//   return {
//     id,
//     name,
//     zip,
//     country,
//   };
// }

// function generateCities(amount = 200) {
//   const result: Array<City> = [];

//   for (let i = 0; i <= amount; i++) {
//     result.push(generateCity());
//   }

//   return result;
// }

// const itemTemplate = (item: City) => {
//   return html`
//     <div>
//       <b>${item.name}</b>, <span>${item.country}</span>
//     </div>
//   `;
// };

// const headerItemTemplate = (item: City) => {
//   return html`Group header for ${item.country}`;
// };

// .itemTemplate=${itemTemplate}
// .headerItemTemplate=${headerItemTemplate}
// const cities = generateCities(200);
const cities = [
  {
    id: 'BG01',
    name: 'Sofia',
    country: 'Bulgaria',
    zip: 1000,
  },
  {
    id: 'BG02',
    name: 'Plovdiv',
    country: 'Bulgaria',
    zip: 4000,
  },
  {
    id: 'BG03',
    name: 'Varna',
    country: 'Bulgaria',
    zip: 9000,
  },
  {
    id: 'US01',
    name: 'New York',
    country: 'United States',
    zip: 1000,
  },
  {
    id: 'US02',
    name: 'Boston',
    country: 'United States',
    zip: 4000,
  },
  {
    id: 'US03',
    name: 'San Francisco',
    country: 'United States',
    zip: 9000,
  },
  {
    id: 'JP01',
    name: 'Tokyo',
    country: 'Japan',
    zip: 1000,
  },
  {
    id: 'JP02',
    name: 'Yokohama',
    country: 'Japan',
    zip: 4000,
  },
  {
    id: 'JP03',
    name: 'Osaka',
    country: 'Japan',
    zip: 9000,
  },
];

// const simpleCities = ['Sofia', 4, 'Varna', 'varna', false, { a: 1, b: 2 }, -1, true];

registerIconFromText(
  'location',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
);

const Template: Story<ArgTypes, Context> = (
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
    autofocusOptions,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-combo
    .data=${cities}
    .dir=${direction}
    label=${ifDefined(label)}
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    placeholder-search=${ifDefined(placeholderSearch)}
    dir=${ifDefined(direction)}
    value-key="id"
    display-key="name"
    group-key="country"
    group-sorting="asc"
    ?case-sensitive-icon=${ifDefined(caseSensitiveIcon)}
    ?disable-filtering=${ifDefined(disableFiltering)}
    ?open=${open}
    ?autofocus=${autofocus}
    ?autofocus-options=${ifDefined(autofocusOptions)}
    ?outlined=${outlined}
    ?required=${required}
    ?disabled=${disabled}
    ?invalid=${invalid}
  >
    <igc-icon slot="prefix" name="location"></igc-icon>
    <span slot="helper-text">Sample helper text.</span>
  </igc-combo>
`;

export const Basic = Template.bind({});
