import { github } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcFileInputComponent,
  IgcIconComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { formControls, formSubmitHandler } from './story.js';

defineComponents(IgcFileInputComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);
registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

// region default
const metadata: Meta<IgcFileInputComponent> = {
  title: 'FileInput',
  component: 'igc-file-input',
  parameters: {
    docs: { description: { component: '' } },
    actions: { handles: ['igcChange', 'igcCancel'] },
  },
  argTypes: {
    value: {
      type: 'string | Date',
      description:
        'The value of the control.\nSimilar to native file input, this property is read-only and cannot be set programmatically.',
      options: ['string', 'Date'],
      control: 'text',
    },
    locale: {
      type: 'string',
      description:
        'Gets/Sets the locale used for getting language, affecting resource strings.',
      control: 'text',
    },
    multiple: {
      type: 'boolean',
      description:
        'The multiple attribute of the control.\nUsed to indicate that a file input allows the user to select more than one file.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    accept: {
      type: 'string',
      description:
        'The accept attribute of the control.\nDefines the file types as a list of comma-separated values that the file input should accept.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
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
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
  },
  args: {
    multiple: false,
    accept: '',
    autofocus: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcFileInputArgs {
  /**
   * The value of the control.
   * Similar to native file input, this property is read-only and cannot be set programmatically.
   */
  value: string | Date;
  /** Gets/Sets the locale used for getting language, affecting resource strings. */
  locale: string;
  /**
   * The multiple attribute of the control.
   * Used to indicate that a file input allows the user to select more than one file.
   */
  multiple: boolean;
  /**
   * The accept attribute of the control.
   * Defines the file types as a list of comma-separated values that the file input should accept.
   */
  accept: string;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcFileInputArgs>;

// endregion

export const Basic: Story = {
  args: {
    label: 'File input',
  },
  render: (args) => html`
    <igc-file-input
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      placeholder=${ifDefined(args.placeholder)}
      value=${ifDefined(args.value)}
      accept=${ifDefined(args.accept === '' ? undefined : args.accept)}
      ?autofocus=${args.autofocus}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      ?multiple=${args.multiple}
      ?outlined=${args.outlined}
      ?required=${args.required}
    ></igc-file-input>
  `,
};

export const Slots: Story = {
  args: {
    label: 'Input with slots',
  },
  render: (args) => html`
    <igc-file-input
      name=${ifDefined(args.name)}
      label=${ifDefined(args.label)}
      placeholder=${ifDefined(args.placeholder)}
      value=${ifDefined(args.value)}
      accept=${ifDefined(args.accept === '' ? undefined : args.accept)}
      ?autofocus=${args.autofocus}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      ?multiple=${args.multiple}
      ?outlined=${args.outlined}
      ?required=${args.required}
    >
      <igc-icon name="github" slot="prefix"></igc-icon>
      <igc-icon name="github" slot="suffix"></igc-icon>
      <span slot="helper-text">Sample helper text.</span>
    </igc-file-input>
  `,
};

export const Validation: Story = {
  args: {
    label: 'Required field',
    name: 'files',
    required: true,
  },
  render: (args) => html`
    <form enctype="multipart/form-data" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-file-input
          name=${ifDefined(args.name)}
          label=${ifDefined(args.label)}
          placeholder=${ifDefined(args.placeholder)}
          value=${ifDefined(args.value)}
          accept=${ifDefined(args.accept === '' ? undefined : args.accept)}
          ?autofocus=${args.autofocus}
          ?disabled=${args.disabled}
          ?invalid=${args.invalid}
          ?multiple=${args.multiple}
          ?outlined=${args.outlined}
          ?required=${args.required}
        >
          <p slot="helper-text">Your life's work</p>
          <p slot="value-missing">You must upload a file</p>
        </igc-file-input>
      </fieldset>
      ${formControls()}
    </form>
  `,
};
