import { html } from 'lit';
import { Context, Story } from './story.js';
import { defineAllComponents } from '../src/index.js';

defineAllComponents();

// region default
const metadata = {
  title: 'Stepper',
  component: 'igc-stepper',
  argTypes: {
    vertical: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  vertical: boolean;
}

const Template: Story<ArgTypes, Context> = ({
  vertical = false,
}: ArgTypes) => html`
  <igc-stepper .vertical=${vertical}>
    <igc-step panel="first"></igc-step>
    <span slot="content">step 1</span>

    <igc-step panel="second"></igc-step>
    <span slot="content">step 2</span>
  </igc-stepper>
`;

export const Basic = Template.bind({});
