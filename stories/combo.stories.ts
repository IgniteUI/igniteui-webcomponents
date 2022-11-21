import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineAllComponents } from '../src/index.js';

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

const Template: Story<ArgTypes, Context> = (
  { name }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-combo name=${ifDefined(name)} dir=${ifDefined(direction)}>
    <span>test default slot</span>
  </igc-combo>
`;

export const Basic = Template.bind({});
