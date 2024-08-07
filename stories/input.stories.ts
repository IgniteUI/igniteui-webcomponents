import { github } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
} from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcInputComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);
registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

// region default
const metadata: Meta<IgcInputComponent> = {
  title: 'Input',
  component: 'igc-input',
  parameters: {
    docs: { description: { component: '' } },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string | Date',
      description: 'The value of the control.',
      options: ['string', 'Date'],
      control: 'text',
    },
    type: {
      type: '"email" | "number" | "password" | "search" | "tel" | "text" | "url"',
      description: 'The type attribute of the control.',
      options: ['email', 'number', 'password', 'search', 'tel', 'text', 'url'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'text' } },
    },
    inputMode: {
      type: 'string',
      description:
        'The input mode attribute of the control.\nSee [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)',
      control: 'text',
    },
    pattern: {
      type: 'string',
      description: 'The pattern attribute of the control.',
      control: 'text',
    },
    minLength: {
      type: 'number',
      description: 'The minimum string length required by the control.',
      control: 'number',
    },
    maxLength: {
      type: 'number',
      description: 'The maximum string length of the control.',
      control: 'number',
    },
    min: {
      type: 'number | string',
      description: 'The min attribute of the control.',
      options: ['number', 'string'],
      control: 'number',
    },
    max: {
      type: 'number | string',
      description: 'The max attribute of the control.',
      options: ['number', 'string'],
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
      table: { defaultValue: { summary: false } },
    },
    autocomplete: {
      type: 'string',
      description: 'The autocomplete attribute of the control.',
      control: 'text',
    },
    validateOnly: {
      type: 'boolean',
      description:
        'Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property for\nstring-type inputs or allows spin buttons to exceed the predefined `min/max` limits for number-type inputs.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in a form context.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
  },
  args: {
    type: 'text',
    autofocus: false,
    validateOnly: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
    readOnly: false,
  },
};

export default metadata;

interface IgcInputArgs {
  /** The value of the control. */
  value: string | Date;
  /** The type attribute of the control. */
  type: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
  /**
   * The input mode attribute of the control.
   * See [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   */
  inputMode: string;
  /** The pattern attribute of the control. */
  pattern: string;
  /** The minimum string length required by the control. */
  minLength: number;
  /** The maximum string length of the control. */
  maxLength: number;
  /** The min attribute of the control. */
  min: number | string;
  /** The max attribute of the control. */
  max: number | string;
  /** The step attribute of the control. */
  step: number;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** The autocomplete attribute of the control. */
  autocomplete: string;
  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property for
   * string-type inputs or allows spin buttons to exceed the predefined `min/max` limits for number-type inputs.
   */
  validateOnly: boolean;
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcInputArgs>;

// endregion

const Template = ({
  type,
  label = 'Sample Label',
  outlined,
  autofocus,
  autocomplete,
  minLength,
  maxLength,
  step,
  value,
  placeholder,
  readOnly,
  required,
  disabled,
  min,
  max,
  invalid,
}: IgcInputArgs) => html`
  <igc-input
    type=${type}
    label=${label}
    placeholder=${ifDefined(placeholder)}
    minlength=${ifDefined(minLength)}
    maxlength=${ifDefined(maxLength)}
    step=${ifDefined(step)}
    autocomplete=${ifDefined(autocomplete)}
    min=${ifDefined(min)}
    max=${ifDefined(max)}
    .value=${value ?? ''}
    ?autofocus=${autofocus}
    ?invalid=${invalid}
    .readOnly=${readOnly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-input>
`;

export const Basic: Story = Template.bind({});
export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`<form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-input name="input" label="Default" label="Username">
          <p slot="helper-text">
            Default state with no initial value and no validation.
          </p>
        </igc-input>

        <igc-input name="input-default" label="Initial value" value="Jane Doe">
          <p slot="helper-text">
            With initial value and no validation. Resetting the form will
            restore the initial value.
          </p>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input
          name="input-readonly"
          label="Username"
          value="John Doe"
          readonly
        >
          <p slot="helper-text">
            Read-only state. <strong>Does</strong> participate in form
            submission.
          </p>
        </igc-input>
      </fieldset>

      <fieldset disabled>
        <igc-input name="input-disabled" label="Username" value="John Doe">
          <p slot="helper-text">
            Disabled state. <strong>Does not</strong> participate in form
            submission.
          </p>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input name="input-search" label="Search" type="search">
          <igc-icon name="search" slot="prefix"></igc-icon>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input name="input-required" label="Required" required>
          <p slot="helper-text">With required validator.</p>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input
          name="input-minlength"
          label="Minimum length (3 characters)"
          minlength="3"
        >
          <p slot="helper-text">With minimum length validator.</p>
        </igc-input>

        <igc-input
          name="input-maximum"
          label="Maximum length (3 characters)"
          maxlength="3"
        >
          <p slot="helper-text">
            With maximum length validator. Since validate-only is not applied,
            typing in the input beyond the maximum length is not possible.
          </p>
        </igc-input>

        <igc-input
          name="input-maximum-soft"
          label="Maximum length (3 characters) validate-only"
          maxlength="3"
          validate-only
        >
          <p slot="helper-text">
            With maximum length validator and validate-only applied. Typing in
            the input beyond the maximum length is possible and will invalidate
            the input.
          </p>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input
          type="number"
          name="input-min"
          label="Minimum number (3)"
          min="3"
        >
          <p slot="helper-text">
            With minimum value validator. Since validate-only is not applied,
            using the spin buttons to go below the minimum value is not
            possible.
          </p>
        </igc-input>

        <igc-input
          type="number"
          name="input-min-soft"
          label="Minimum number (3) validate-only"
          min="3"
          validate-only
        >
          <p slot="helper-text">
            With minimum value validator and validate-only applied. Using the
            spin buttons to go below the minimum value is possible and will
            invalidate the input.
          </p>
        </igc-input>

        <igc-input
          type="number"
          name="input-max"
          label="Maximum number (17)"
          max="17"
        >
          <p slot="helper-text">
            With maximum value validator. Since validate-only is not applied,
            using the spin buttons to go above the maximum value is not
            possible.
          </p>
        </igc-input>

        <igc-input
          type="number"
          name="input-max-soft"
          label="Maximum number (17) validate-only"
          max="17"
          validate-only
        >
          <p slot="helper-text">
            With maximum value validator and validate-only applied. Using the
            spin buttons to go above the maximum value is possible and will
            invalidate the input.
          </p>
        </igc-input>
      </fieldset>

      <fieldset>
        <igc-input
          name="input-pattern"
          pattern="[0-9]{3}"
          label="Pattern [0-9]{3}"
        >
          <p slot="helper-text">With pattern validator.</p>
        </igc-input>

        <igc-input
          name="input-email"
          type="email"
          label="Email type"
          value="john.doe@example.com"
        >
          <p slot="helper-text">With email validator.</p></igc-input
        >

        <igc-input
          name="input-url"
          type="url"
          label="URL type"
          value="https://igniteui.github.io/igniteui-webcomponents/"
        >
          <p slot="helper-text">With URL validator.</p>
        </igc-input>
      </fieldset>
      ${formControls()}
    </form> `;
  },
};
