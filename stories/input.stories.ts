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
      defaultValue: false,
    },
    autofocus: {
      control: 'boolean',
      defaultValue: false,
    },
    autocomplete: {
      control: 'text',
    },
    minlength: {
      control: 'text',
    },
    maxlength: {
      control: 'text',
    },
    min: {
      control: 'text',
    },
    max: {
      control: 'text',
    },
    readonly: {
      control: 'boolean',
      defaultValue: false,
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
  size: 'small' | 'medium' | 'large';
  label: string;
  placeholder: string;
  outlined: boolean;
  autofocus: boolean;
  autocomplete: 'on' | 'off';
  minlength: string;
  maxlength: string;
  min: string | number;
  max: string | number;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
}

const Template: Story<ArgTypes, Context> = (
  {
    size,
    label,
    outlined,
    autofocus,
    autocomplete,
    minlength,
    maxlength,
    min,
    max,
    placeholder,
    readonly,
    required,
    disabled,
  }: ArgTypes,
  { globals: { direction } }: Context
) =>
  html`
    <igc-input
      type="email"
      label=${label}
      size=${size}
      placeholder=${ifDefined(placeholder)}
      dir=${direction}
      minlength=${ifDefined(minlength)}
      maxlength=${ifDefined(maxlength)}
      min=${ifDefined(min)}
      max=${ifDefined(max)}
      autocomplete=${ifDefined(autocomplete)}
      ?autofocus=${autofocus}
      .readonly=${readonly}
      .outlined=${outlined}
      .required=${required}
      .disabled=${disabled}
    >
      <igc-icon name="github" slot="prefix"></igc-icon>
      <igc-icon name="github" slot="suffix"></igc-icon>
    </igc-input>
  `;
export const Outlined = Template.bind({});
