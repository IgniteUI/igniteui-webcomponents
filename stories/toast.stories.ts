import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineAllComponents } from '../src/index.js';

defineAllComponents();

// region default
const metadata = {
  title: 'Toast',
  component: 'igc-toast',
  argTypes: {
    message: {
      type: 'string',
      description: 'The text of the toast.',
      control: 'text',
      defaultValue: 'Toast message',
    },
    position: {
      type: '"top" | "bottom" | "middle"',
      options: ['top', 'bottom', 'middle'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'bottom',
    },
  },
};
export default metadata;
interface ArgTypes {
  message: string;
  position: 'top' | 'bottom' | 'middle';
}
// endregion

const Template: Story<ArgTypes, Context> = ({
  message = 'Toast message',
  position = 'bottom',
}: ArgTypes) => html`
  <igc-toast position=${ifDefined(position)}> ${ifDefined(message)} </igc-toast>
`;

export const Basic = Template.bind({});

// const toggleToast = () => {};
// <igc-button @click="${toggleToast}">Toggle Toast</igc-button>
