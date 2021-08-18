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
    outlined: {
      control: 'boolean',
      defaultValue: true,
    },
    required: {
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
  },
};

interface ArgTypes {
  label: string;
  outlined: boolean;
  size: 'small' | 'medium' | 'large';
  placeholder: string;
  required: boolean;
  disabled: boolean;
}

const Template: Story<ArgTypes, Context> = (
  { label, size, outlined, placeholder, required, disabled }: ArgTypes,
  { globals: { direction } }: Context
) =>
  html`
    <igc-input
      label=${label}
      size=${size}
      placeholder=${ifDefined(placeholder)}
      type="text"
      dir="${direction}"
      .outlined=${outlined}
      .required=${required}
      .disabled=${disabled}
    >
      <igc-icon name="github" slot="prefix"></igc-icon>
      <igc-icon name="github" slot="suffix"></igc-icon>
    </igc-input>
  `;
export const Outlined = Template.bind({});
