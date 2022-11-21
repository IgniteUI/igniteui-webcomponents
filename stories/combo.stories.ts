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
  },
};
export default metadata;
interface ArgTypes {
  value: string | undefined;
  name: string;
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

const Template: Story<ArgTypes, Context> = (
  { name }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-combo
    name=${ifDefined(name)}
    dir=${ifDefined(direction)}
    value-key="id"
    display-key="name"
    .data=${generateCities(1000)}
  ></igc-combo>
`;

export const Basic = Template.bind({});
