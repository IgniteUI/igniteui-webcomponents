import { github } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconComponent,
  IgcMaskInputComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcMaskInputComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcMaskInputComponent> = {
  title: 'MaskInput',
  component: 'igc-mask-input',
  parameters: {
    docs: {
      description: {
        component:
          'A masked input is an input field where a developer can control user input and format the visible value,\nbased on configurable rules',
      },
    },
    actions: { handles: ['igcInput', 'igcChange', 'igcFocus', 'igcBlur'] },
  },
  argTypes: {
    valueMode: {
      type: '"raw" | "withFormatting"',
      description:
        'Dictates the behavior when retrieving the value of the control:\n\n- `raw` will return the clean user input.\n- `withFormatting` will return the value with all literals and prompts.',
      options: ['raw', 'withFormatting'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'raw' } },
    },
    value: {
      type: 'string | Date',
      description:
        'The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value will return an empty string.',
      options: ['string', 'Date'],
      control: 'text',
    },
    mask: {
      type: 'string',
      description: 'The mask pattern to apply on the input.',
      control: 'text',
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
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
    valueMode: 'raw',
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
    readOnly: false,
  },
};

export default metadata;

interface IgcMaskInputArgs {
  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw` will return the clean user input.
   * - `withFormatting` will return the value with all literals and prompts.
   */
  valueMode: 'raw' | 'withFormatting';
  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value will return an empty string.
   */
  value: string | Date;
  /** The mask pattern to apply on the input. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
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
type Story = StoryObj<IgcMaskInputArgs>;

// endregion

const Template = ({
  name,
  readOnly,
  disabled,
  required,
  outlined,
  valueMode,
  label,
  value,
  placeholder,
  mask,
  prompt,
}: IgcMaskInputArgs) => {
  return html`<igc-mask-input
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    value=${ifDefined(value)}
    mask=${ifDefined(mask)}
    prompt=${ifDefined(prompt)}
    label=${ifDefined(label)}
    value-mode=${ifDefined(valueMode)}
    ?readonly=${ifDefined(readOnly)}
    ?outlined=${ifDefined(outlined)}
    ?required=${ifDefined(required)}
    ?disabled=${ifDefined(disabled)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-mask-input>`;
};

export const Basic: Story = Template.bind({});

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`<form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <legend>Default masked input</legend>
        <igc-mask-input
          name="mask"
          value="XYZ"
          label="Default"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Formatted value mode</legend>
        <igc-mask-input
          required
          label="Formatted value mode"
          name="mask-formatted-value"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>
      </fieldset>
      <fieldset disabled>
        <legend>Disabled masked input</legend>
        <igc-mask-input
          name="mask-disabled"
          label="Disabled mask"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Masked constraints</legend>
        <igc-mask-input
          name="mask-required"
          label="Required"
          required
        ></igc-mask-input>
        <igc-mask-input
          name="required-mask-pattern"
          label="Mask pattern validation"
          mask="(+35\\9) 000-000-000"
        ></igc-mask-input>
      </fieldset>
      ${formControls()}
    </form>`;
  },
};
