import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Input',
  component: 'igc-input',
  argTypes: {
    type: {
      type: '"number" | "email" | "password" | "search" | "tel" | "text" | "url"',
      description: 'The type attribute of the control.',
      options: ['number', 'email', 'password', 'search', 'tel', 'text', 'url'],
      control: {
        type: 'select',
      },
      defaultValue: 'text',
    },
    inputmode: {
      type: '"numeric" | "none" | "email" | "search" | "tel" | "url" | "txt" | "decimal"',
      description: 'The input mode attribute of the control.',
      options: [
        'numeric',
        'none',
        'email',
        'search',
        'tel',
        'url',
        'txt',
        'decimal',
      ],
      control: {
        type: 'select',
      },
    },
    pattern: {
      type: 'string',
      description: 'The pattern attribute of the control.',
      control: 'text',
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    minlength: {
      type: 'number',
      description: 'The minlength attribute of the control.',
      control: 'number',
    },
    maxlength: {
      type: 'number',
      description: 'The maxlength attribute of the control.',
      control: 'number',
    },
    min: {
      type: 'string | number',
      description: 'The min attribute of the control.',
      control: 'text',
    },
    max: {
      type: 'string | number',
      description: 'The max attribute of the control.',
      control: 'text',
    },
    step: {
      type: 'number',
      description: 'The step attribute of the control.',
      control: 'number',
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
    },
    autocomplete: {
      type: 'string',
      description: 'The autocomplete attribute of the control.',
      control: 'text',
    },
    tabIndex: {
      type: 'number',
      control: 'number',
      defaultValue: '0',
    },
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
      defaultValue: '',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Makes the control a disabled field.',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      defaultValue: false,
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
};
export default metadata;
interface ArgTypes {
  type: 'number' | 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
  inputmode:
    | 'numeric'
    | 'none'
    | 'email'
    | 'search'
    | 'tel'
    | 'url'
    | 'txt'
    | 'decimal';
  pattern: string;
  invalid: boolean;
  minlength: number;
  maxlength: number;
  min: string | number;
  max: string | number;
  step: number;
  autofocus: boolean;
  autocomplete: string;
  tabIndex: number;
  value: string;
  name: string;
  outlined: boolean;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  placeholder: string;
  label: string;
  size: 'small' | 'medium' | 'large';
}
// endregion

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
    step,
    value,
    placeholder,
    readonly,
    required,
    disabled,
    min,
    max,
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
    step=${ifDefined(step)}
    autocomplete=${ifDefined(autocomplete)}
    min=${ifDefined(min)}
    max=${ifDefined(max)}
    .value=${value}
    ?autofocus=${autofocus}
    .readonly=${readonly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-input>
`;

export const Basic = Template.bind({});
