import { html } from 'lit';
import { github } from '@igniteui/material-icons-extended';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context } from './story.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import { defineComponents, IgcInputComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcInputComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcInputComponent> = {
  title: 'Input',
  component: 'igc-input',
  parameters: { docs: { description: {} } },
  argTypes: {
    type: {
      type: '"number" | "email" | "password" | "search" | "tel" | "text" | "url"',
      description: 'The type attribute of the control.',
      options: ['number', 'email', 'password', 'search', 'tel', 'text', 'url'],
      control: { type: 'select' },
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
      control: { type: 'select' },
    },
    pattern: {
      type: 'string',
      description: 'The pattern attribute of the control.',
      control: 'text',
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
    tabIndex: { type: 'number', control: 'number', defaultValue: '0' },
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
      defaultValue: '',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
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
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in form context.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: {
    type: 'text',
    tabIndex: '0',
    value: '',
    outlined: false,
    readonly: false,
    required: false,
    disabled: false,
    invalid: false,
    size: 'medium',
  },
};

export default metadata;

interface IgcInputArgs {
  /** The type attribute of the control. */
  type: 'number' | 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
  /** The input mode attribute of the control. */
  inputmode:
    | 'numeric'
    | 'none'
    | 'email'
    | 'search'
    | 'tel'
    | 'url'
    | 'txt'
    | 'decimal';
  /** The pattern attribute of the control. */
  pattern: string;
  /** The minlength attribute of the control. */
  minlength: number;
  /** The maxlength attribute of the control. */
  maxlength: number;
  /** The min attribute of the control. */
  min: string | number;
  /** The max attribute of the control. */
  max: string | number;
  /** The step attribute of the control. */
  step: number;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** The autocomplete attribute of the control. */
  autocomplete: string;
  tabIndex: number;
  /** The value of the control. */
  value: string;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** Makes the control a readonly field. */
  readonly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
  /** The name attribute of the control. */
  name: string;
  /** Makes the control a required field in form context. */
  required: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcInputArgs>;

// endregion

const Template = (
  {
    type,
    size,
    label = 'Sample Label',
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
    invalid,
  }: IgcInputArgs,
  { globals: { direction } }: Context
) => html`
  <fieldset disabled>
    <igc-input
      type=${type}
      label=${label}
      size=${ifDefined(size)}
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
      ?invalid=${invalid}
      .readonly=${readonly}
      .outlined=${outlined}
      .required=${required}
      .disabled=${disabled}
    >
      <igc-icon name="github" slot="prefix" size=${size}></igc-icon>
      <igc-icon name="github" slot="suffix" size=${size}></igc-icon>
      <span slot="helper-text">This is some helper text</span>
    </igc-input>
  </fieldset>
`;

export const Basic: Story = Template.bind({});
export const Form: Story = {
  render: () => {
    const onSubmit = (e: SubmitEvent) => e.preventDefault();

    return html`<form action="" @submit=${onSubmit}>
      <fieldset>
        <legend>Default input</legend>
        <igc-input name="i-1" label="Username"></igc-input>
      </fieldset>
      <fieldset disabled>
        <legend>Disabled input</legend>
        <igc-input name="i-disabled" label="Username"></igc-input>
      </fieldset>
      <fieldset>
        <legend>Input constraints</legend>
        <igc-input name="i-required" label="Required" required></igc-input>
        <igc-input
          name="i-minlength"
          label="Minimum length (3 characters)"
          minlength="3"
        ></igc-input>
        <igc-input
          name="i-maximum"
          label="Maximum length (3 characters)"
          maxlength="3"
        ></igc-input>
        <igc-input
          type="number"
          name="i-min"
          label="Minimum number (3)"
          min="3"
        ></igc-input>
        <igc-input
          type="number"
          name="i-max"
          label="Maximum number (17)"
          max="17"
        ></igc-input>
        <igc-input
          name="i-pattern"
          pattern="[0-9]{3}"
          label="Pattern [0-9]{3}"
        ></igc-input>
      </fieldset>
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form> `;
  },
};
