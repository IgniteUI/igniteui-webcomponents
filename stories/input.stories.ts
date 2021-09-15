import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

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
      type: '"email" | "search" | "tel" | "url" | "none" | "txt" | "decimal" | "numeric"',
      description: 'The input mode attribute of the control.',
      options: [
        'email',
        'search',
        'tel',
        'url',
        'none',
        'txt',
        'decimal',
        'numeric',
      ],
      control: {
        type: 'select',
      },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
      defaultValue: '',
    },
    pattern: {
      type: 'string',
      description: 'The pattern attribute of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
      defaultValue: 'Label',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    outlined: {
      type: 'boolean',
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
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  type: 'number' | 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
  inputmode:
    | 'email'
    | 'search'
    | 'tel'
    | 'url'
    | 'none'
    | 'txt'
    | 'decimal'
    | 'numeric';
  name: string;
  value: string;
  pattern: string;
  label: string;
  placeholder: string;
  invalid: boolean;
  outlined: boolean;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  minlength: number;
  maxlength: number;
  step: number;
  autofocus: boolean;
  autocomplete: string;
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
