import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Input',
  component: 'igc-input',
  argTypes: {
    type: {
      control: {
        type: 'select',
        options: [
          'email',
          'number',
          'password',
          'search',
          'tel',
          'text',
          'url',
        ],
      },
      defaultValue: 'text',
    },
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
      defaultValue: 'medium',
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
    step: {
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
  type: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
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
  step: string | number;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
}

const Template: Story<ArgTypes, Context> = (
  {
    type,
    size,
    label,
    outlined,
    autofocus,
    autocomplete,
    minlength,
    maxlength,
    min,
    max,
    step,
    placeholder,
    readonly,
    required,
    disabled,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-input
    type=${type}
    label=${label}
    size=${size}
    placeholder=${ifDefined(placeholder)}
    dir=${direction}
    minlength=${ifDefined(minlength)}
    maxlength=${ifDefined(maxlength)}
    min=${ifDefined(min)}
    max=${ifDefined(max)}
    step=${ifDefined(step)}
    autocomplete=${ifDefined(autocomplete)}
    ?autofocus=${autofocus}
    .readonly=${readonly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text"
      >Visit
      <a href="https://infragistics.com" target="_blank">Infragistics</a> for
      more information.</span
    >
  </igc-input>
`;

export const Basic = Template.bind({});
