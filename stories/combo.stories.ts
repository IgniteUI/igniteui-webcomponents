import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineAllComponents } from '../src/index.js';
import { faker } from '@faker-js/faker';

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
  scrollStrategy: 'scroll' | 'block' | 'close' | undefined;
  keepOpenOnOutsideClick: boolean | undefined;
  open: boolean;
  positionStrategy: 'absolute' | 'fixed' | undefined;
  flip: boolean | undefined;
  distance: number | undefined;
  sameWidth: boolean | undefined;
}
// endregion

interface City {
  id: string;
  name: string;
  zip: string;
  country: string;
}

function generateCity(): City {
  const id = faker.datatype.uuid();
  const name = faker.address.cityName();
  const zip = faker.address.zipCode();
  const country = faker.address.country();

  return {
    id,
    name,
    zip,
    country,
  };
}

function generateCities(amount = 200) {
  const result: Array<City> = [];

  for (let i = 0; i <= amount; i++) {
    result.push(generateCity());
  }

  return result;
}

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
const cities = generateCities(200);
const Template: Story<ArgTypes, Context> = (
  { name }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-combo
    name=${ifDefined(name)}
    dir=${ifDefined(direction)}
    value-key="id"
    display-key="name"
    group-key="country"
    .data=${cities}
  >
    <div slot="header">This is a custom header</div>
    <div slot="footer">This is a custom footer</div>
  </igc-combo>
`;

export const Basic = Template.bind({});
