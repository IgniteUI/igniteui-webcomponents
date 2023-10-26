import { sourceCode } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import { registerIconFromText } from '../src/components/icon/icon.registry.js';
import {
  IgcIconComponent,
  IgcTextareaComponent,
  defineComponents,
} from '../src/index.js';

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
    autocomplete: {
      type: 'string',
      description:
        'Specifies what if any permission the browser has to provide for automated assistance in filling out form field values,\nas well as guidance to the browser as to the type of information expected in the field.\nRefer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.',
      control: 'text',
    },
    autocapitalize: {
      type: '"none" | "off" | "on" | "sentences" | "words" | "characters"',
      description:
        'Controls whether and how text input is automatically capitalized as it is entered/edited by the user.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).',
      options: ['none', 'off', 'on', 'sentences', 'words', 'characters'],
      control: { type: 'select' },
    },
    inputMode: {
      type: '"numeric" | "none" | "email" | "search" | "tel" | "text" | "url" | "decimal"',
      description:
        'Hints at the type of data that might be entered by the user while editing the element or its contents.\nThis allows a browser to display an appropriate virtual keyboard.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)',
      options: [
        'numeric',
        'none',
        'email',
        'search',
        'tel',
        'text',
        'url',
        'decimal',
      ],
      control: { type: 'select' },
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    maxLength: {
      type: 'number',
      description:
        "The maximum number of characters (UTF-16 code units) that the user can enter.\nIf this value isn't specified, the user can enter an unlimited number of characters.",
      control: 'number',
    },
    minLength: {
      type: 'number',
      description:
        'The minimum number of characters (UTF-16 code units) required that the user should enter.',
      control: 'number',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      defaultValue: false,
    },
    resize: {
      type: '"vertical" | "none" | "auto"',
      description:
        'Controls whether the control can be resized.\nWhen `auto` is set, the control will try to expand and fit its content.',
      options: ['vertical', 'none', 'auto'],
      control: { type: 'inline-radio' },
      defaultValue: 'vertical',
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
    spellcheck: {
      type: 'boolean',
      description:
        'Controls whether the element may be checked for spelling errors.',
      control: 'boolean',
      defaultValue: true,
    },
    wrap: {
      type: '"off" | "hard" | "soft"',
      description:
        'Indicates how the control should wrap the value for form submission.\nRefer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)\nfor explanation of the available values.',
      options: ['off', 'hard', 'soft'],
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
    validationMessage: {
      type: 'string',
      description:
        'A string containing the validation message of this element.',
      control: 'text',
    },
    willValidate: {
      type: 'boolean',
      description:
        'A boolean value which returns true if the element is a submittable element\nthat is a candidate for constraint validation.',
      control: 'boolean',
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
    outlined: false,
    readOnly: false,
    resize: 'vertical',
    rows: 2,
    value: '',
    spellcheck: true,
    wrap: 'soft',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcTextareaArgs {
  /**
   * Specifies what if any permission the browser has to provide for automated assistance in filling out form field values,
   * as well as guidance to the browser as to the type of information expected in the field.
   * Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.
   */
  autocomplete: string;
  /**
   * Controls whether and how text input is automatically capitalized as it is entered/edited by the user.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autocapitalize: 'none' | 'off' | 'on' | 'sentences' | 'words' | 'characters';
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents.
   * This allows a browser to display an appropriate virtual keyboard.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   */
  inputMode:
    | 'numeric'
    | 'none'
    | 'email'
    | 'search'
    | 'tel'
    | 'text'
    | 'url'
    | 'decimal';
  /** The label for the control. */
  label: string;
  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxLength: number;
  /** The minimum number of characters (UTF-16 code units) required that the user should enter. */
  minLength: number;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /**
   * Controls whether the control can be resized.
   * When `auto` is set, the control will try to expand and fit its content.
   */
  resize: 'vertical' | 'none' | 'auto';
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 2.
   */
  rows: number;
  /** The value of the component */
  value: string;
  /** Controls whether the element may be checked for spelling errors. */
  spellcheck: boolean;
  /**
   * Indicates how the control should wrap the value for form submission.
   * Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
   * for explanation of the available values.
   */
  wrap: 'off' | 'hard' | 'soft';
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** A string containing the validation message of this element. */
  validationMessage: string;
  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  willValidate: boolean;
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
