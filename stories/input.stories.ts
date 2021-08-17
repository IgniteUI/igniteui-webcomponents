import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Input',
  component: 'igc-input',
  argTypes: {
    placeholder: {
      control: {
        type: 'text',
      },
      description: 'The placeholder of the input',
    },
    label: {
      control: {
        type: 'text',
      },
      defaultValue: 'Label',
      description: 'The label of the input',
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'large',
    },
  },
};

interface ArgTypes {
  label: string;
  size: 'small' | 'medium' | 'large';
  placeholder: string;
}

const Template: Story<ArgTypes, Context> = (
  { label, size, placeholder }: ArgTypes,
  { globals: { direction } }: Context
) =>
  html`
    <igc-input
      label=${label}
      size=${size}
      dir=${direction}
      placeholder=${ifDefined(placeholder)}
    >
      <igc-icon name="github" slot="start"></igc-icon>
      <igc-icon name="github" slot="end"></igc-icon>
    </igc-input>
  `;
export const Outlined = Template.bind({});
