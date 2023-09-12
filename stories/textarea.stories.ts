import { sourceCode } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { registerIconFromText } from '../src/components/icon/icon.registry.js';
import {
  IgcIconComponent,
  IgcTextareaComponent,
  defineComponents,
} from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcTextareaComponent, IgcIconComponent);
registerIconFromText('source-code', sourceCode.value);

// region default
const metadata: Meta<IgcTextareaComponent> = {
  title: 'Textarea',
  component: 'igc-textarea',
  parameters: {
    docs: {
      description: {
        component:
          'This element represents a multi-line plain-text editing control,\nuseful when you want to allow users to enter a sizeable amount of free-form text,\nfor example a comment on a review or feedback form.',
      },
    },
  },
  argTypes: {
    rows: {
      type: 'number',
      description:
        'The number of visible text lines for the control. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 2.',
      control: 'number',
      defaultValue: 2,
    },
    value: {
      type: 'string',
      description: 'The value of the component',
      control: 'text',
      defaultValue: '',
    },
    readOnly: {
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
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    resize: {
      type: '"vertical" | "none" | "auto"',
      options: ['vertical', 'none', 'auto'],
      control: { type: 'inline-radio' },
      defaultValue: 'vertical',
    },
    minLength: {
      type: 'number',
      description:
        'The minimum number of characters (UTF-16 code units) required that the user should enter.',
      control: 'number',
    },
    maxLength: {
      type: 'number',
      description:
        "The maximum number of characters (UTF-16 code units) that the user can enter.\nIf this value isn't specified, the user can enter an unlimited number of characters.",
      control: 'number',
    },
    wrap: {
      type: '"hard" | "soft" | "off"',
      description:
        'Indicates how the control should wrap the value for form submission.',
      options: ['hard', 'soft', 'off'],
      control: { type: 'inline-radio' },
      defaultValue: 'soft',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in a form context.',
      control: 'boolean',
      defaultValue: false,
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
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
  },
  args: {
    rows: 2,
    value: '',
    readOnly: false,
    outlined: false,
    resize: 'vertical',
    wrap: 'soft',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcTextareaArgs {
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 2.
   */
  rows: number;
  /** The value of the component */
  value: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The label for the control. */
  label: string;
  resize: 'vertical' | 'none' | 'auto';
  /** The minimum number of characters (UTF-16 code units) required that the user should enter. */
  minLength: number;
  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxLength: number;
  /** Indicates how the control should wrap the value for form submission. */
  wrap: 'hard' | 'soft' | 'off';
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
}
type Story = StoryObj<IgcTextareaArgs>;

// endregion

export const Default: Story = {
  args: { label: 'Your feedback' },
  parameters: {
    actions: {
      handles: ['igcBlur', 'igcChange', 'igcInput', 'igcFocus'],
    },
  },
};

export const ProjectContent: Story = {
  render: (
    { rows, resize, required, disabled, outlined },
    { globals: { direction } }
  ) => {
    return html`
      <igc-textarea
        id="comment"
        dir=${direction}
        spellcheck="false"
        .outlined=${outlined}
        autofocus
        label="Leave your comment"
        .rows=${rows}
        .resize=${resize}
        .required=${required}
        .disabled=${disabled}
      >
        <igc-icon
          name="source-code"
          aria-hidden="true"
          slot="prefix"
        ></igc-icon>
        <p>Hello world!</p>
        <span slot="helper-text">Helper text</span>
      </igc-textarea>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <igc-textarea name="textarea-default" label="Default"></igc-textarea>
        </fieldset>
        <fieldset>
          <igc-textarea
            name="textarea-initial-value"
            label="Initial value (binding)"
            value="Hello world!"
          ></igc-textarea>
          <igc-textarea
            name="textarea-initial-projected"
            label="Initial value (slot)"
          >
            Hello world!
          </igc-textarea>
        </fieldset>
        <fieldset disabled>
          <igc-textarea
            name="textarea-disabled"
            value="I'm disabled"
            label="Disabled"
          ></igc-textarea>
        </fieldset>
        <fieldset>
          <igc-textarea
            name="textarea-readonly"
            value="Can't edit me..."
            readonly
            label="Readonly"
          ></igc-textarea>
        </fieldset>
        <fieldset>
          <igc-textarea
            name="textarea-required"
            label="Required"
            required
          ></igc-textarea>
          <igc-textarea
            name="textarea-min-length"
            label="Minimum length (3)"
            minlength="3"
          ></igc-textarea>
          <igc-textarea
            name="textarea-max-length"
            label="Maximum length (8)"
            maxlength="8"
          ></igc-textarea>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
