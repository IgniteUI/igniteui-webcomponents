import { sourceCode } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';

import {
  IgcIconComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIconFromText } from '../src/components/icon/icon.registry.js';
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
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    autocomplete: {
      type: 'string',
      description:
        'Specifies what if any permission the browser has to provide for automated assistance in filling out form field values,\nas well as guidance to the browser as to the type of information expected in the field.\nRefer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.',
      control: 'text',
    },
    autocapitalize: {
      type: 'string',
      description:
        'Controls whether and how text input is automatically capitalized as it is entered/edited by the user.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).',
      control: 'text',
    },
    inputMode: {
      type: 'string',
      description:
        'Hints at the type of data that might be entered by the user while editing the element or its contents.\nThis allows a browser to display an appropriate virtual keyboard.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)',
      control: 'text',
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
      table: { defaultValue: { summary: 'false' } },
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
      table: { defaultValue: { summary: 'false' } },
    },
    resize: {
      type: '"vertical" | "auto" | "none"',
      description:
        'Controls whether the control can be resized.\nWhen `auto` is set, the control will try to expand and fit its content.',
      options: ['vertical', 'auto', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    rows: {
      type: 'number',
      description:
        'The number of visible text lines for the control. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 2.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    value: {
      type: 'string',
      description: 'The value of the component',
      control: 'text',
    },
    spellcheck: {
      type: 'boolean',
      description:
        'Controls whether the element may be checked for spelling errors.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    wrap: {
      type: '"hard" | "soft" | "off"',
      description:
        'Indicates how the control should wrap the value for form submission.\nRefer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)\nfor explanation of the available values.',
      options: ['hard', 'soft', 'off'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'soft' } },
    },
    validateOnly: {
      type: 'boolean',
      description:
        'Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property\nwhen it is defined.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    outlined: false,
    readOnly: false,
    resize: 'vertical',
    rows: 3,
    spellcheck: true,
    wrap: 'soft',
    validateOnly: false,
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
  autocapitalize: string;
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents.
   * This allows a browser to display an appropriate virtual keyboard.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   */
  inputMode: string;
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
  resize: 'vertical' | 'auto' | 'none';
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
  wrap: 'hard' | 'soft' | 'off';
  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property
   * when it is defined.
   */
  validateOnly: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcTextareaArgs>;

// endregion

export const Default: Story = {
  args: { label: 'Your feedback' },
  render: (args) => html`
    <igc-textarea
      autocapitalize=${ifDefined(args.autocapitalize)}
      name=${ifDefined(args.name)}
      label=${args.label}
      rows=${args.rows}
      placeholder=${args.placeholder || nothing}
      resize=${args.resize}
      value=${ifDefined(args.value)}
      minlength=${ifDefined(args.minLength)}
      maxlength=${ifDefined(args.maxLength)}
      wrap=${args.wrap}
      ?outlined=${args.outlined}
      ?readonly=${args.readOnly}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      ?validate-only=${args.validateOnly}
      ?spellcheck=${args.spellcheck}
    >
      <igc-icon name="source-code" aria-hidden="true" slot="prefix"></igc-icon>
      <igc-icon name="source-code" aria-hidden="true" slot="suffix"></igc-icon>
    </igc-textarea>
  `,
};

export const ProjectContent: Story = {
  render: (
    { rows, resize, required, disabled, outlined, readOnly },
    { globals: { direction } }
  ) => {
    return html`
      <igc-textarea
        id="comment"
        dir=${direction}
        spellcheck="false"
        .outlined=${outlined}
        ?readonly=${readOnly}
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

function setMaxChars(value = 0) {
  render(
    html`You have used ${value}/255 characters`,
    document.getElementById('max-chars')!
  );
}

function getInput(event: CustomEvent<string>) {
  setMaxChars(event.detail.length);
}

export const Validation: Story = {
  play: async () => {
    setMaxChars();
  },
  render: () => html`
    <fieldset>
      <igc-textarea label="Required" required>
        <p slot="value-missing">This field is required!</p>
      </igc-textarea>
    </fieldset>

    <fieldset>
      <igc-textarea
        resize="auto"
        @igcInput=${getInput}
        label="Max characters"
        required
        maxlength="255"
        validate-only
      >
        <p id="max-chars" slot="helper-text"></p>
        <p slot="value-missing">This field is required!</p>
        <p slot="too-long">Please, stick to the maximum of 255 characters!</p>
      </igc-textarea>
    </fieldset>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <igc-textarea name="textarea-default" label="Default">
            <p slot="helper-text">
              Default state. No initial value and no validation.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-initial-value"
            label="Initial value (binding)"
            value="Hello world!"
          >
            <p slot="helper-text">
              Initial value bound through property and no validation. Resetting
              the form will restore the initial value.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-initial-projected"
            label="Initial value (slot)"
          >
            Hello world!
            <p slot="helper-text">
              Initial value bound through text projection and no validation.
              Resetting the form will restore the initial value.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset disabled>
          <igc-textarea
            name="textarea-disabled"
            value="I'm disabled"
            label="Disabled"
          >
            <div slot="helper-text">
              <p>
                Disabled state. <strong>Does not</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-readonly"
            value="Can't edit me..."
            readonly
            label="Readonly"
          >
            <div slot="helper-text">
              <p>
                Read-only state. <strong>Does</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea name="textarea-required" label="Required" required>
            <p slot="helper-text">With required validator.</p>
          </igc-textarea>

          <igc-textarea
            name="textarea-min-length"
            label="Minimum length (3)"
            minlength="3"
            ><p slot="helper-text">
              With minimum length validator.
            </p></igc-textarea
          >

          <igc-textarea
            name="textarea-max-length"
            label="Maximum length (8)"
            maxlength="8"
          >
            <p slot="helper-text">
              With maximum length validator. Since validate-only is not applied,
              typing in the input beyond the maximum length is not possible.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-max-length-soft"
            label="Maximum length (8) validate-only"
            maxlength="8"
            validate-only
          >
            <p slot="helper-text">
              With maximum length validator and validate-only applied. Typing in
              the input beyond the maximum length is possible and will
              invalidate the input.
            </p>
          </igc-textarea>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
