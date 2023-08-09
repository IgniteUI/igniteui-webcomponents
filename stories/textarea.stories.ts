import type { Meta, StoryObj } from '@storybook/web-components';
import {
  defineComponents,
  IgcTextareaComponent,
  IgcIconComponent,
} from '../src/index.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import { html } from 'lit';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcTextareaComponent, IgcIconComponent);

registerIconFromText(
  'location',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
);

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
    cols: {
      type: 'number',
      description:
        'The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 20.',
      control: 'number',
      defaultValue: 20,
    },
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
      type: '"vertical" | "auto" | "none"',
      options: ['vertical', 'auto', 'none'],
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
    cols: 20,
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
   * The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 20.
   */
  cols: number;
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
  resize: 'vertical' | 'auto' | 'none';
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
  args: {
    placeholder: 'Please type in...',
    cols: 25,
    rows: 5,
    label: 'Feedback',
  },
};

export const Projected: Story = {
  args: { cols: 50, rows: 5 },
  parameters: {
    actions: {
      handles: ['igcInput', 'igcChange', 'igcFocus', 'igcBlur'],
    },
  },
  render: (
    { cols, rows, resize, required, disabled },
    { globals: { direction } }
  ) => {
    return html`
      <igc-textarea
        dir=${direction}
        spellcheck="false"
        autofocus
        id="feedback"
        label="Your opinion matters"
        .cols=${cols}
        .rows=${rows}
        .resize=${resize}
        .required=${required}
        .disabled=${disabled}
      >
        <span slot="prefix">+359</span>
        <p>Hello world</p>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed quisquam
          pariatur quaerat, quas fugiat nam doloremque doloribus ut qui? Libero
          architecto necessitatibus sequi vitae obcaecati similique? Temporibus
          quibusdam id suscipit?
        </p>
        <igc-icon slot="suffix" name="location"></igc-icon>
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
            value="No!"
            label="Disabled"
          ></igc-textarea>
        </fieldset>
        <fieldset>
          <igc-textarea
            name="textarea-readonly"
            value="Can't edit this..."
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
            minlength="8"
          ></igc-textarea>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
