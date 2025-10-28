import { github } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconComponent,
  IgcMaskInputComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import type { DateRangeValue } from '../src/components/date-range-picker/date-range-picker.js';
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
    actions: { handles: ['igcInput', 'igcChange'] },
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
      type: 'string | Date | DateRangeValue',
      description:
        'The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value will return an empty string.',
      options: ['string', 'Date', 'DateRangeValue'],
      control: 'text',
    },
    mask: {
      type: 'string',
      description: 'The masked pattern of the component.',
      control: 'text',
      table: { defaultValue: { summary: 'CCCCCCCCCC' } },
    },
    prompt: {
      type: 'string',
      description:
        'The prompt symbol to use for unfilled parts of the mask pattern.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
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
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
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
    valueMode: 'raw',
    mask: 'CCCCCCCCCC',
    prompt: '_',
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
  value: string | Date | DateRangeValue;
  /** The masked pattern of the component. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask pattern. */
  prompt: string;
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
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcMaskInputArgs>;

// endregion

export const Basic: Story = {
  args: {
    label: 'Default mask input',
  },
  render: (args) => html`
    <igc-mask-input
      name=${ifDefined(args.name)}
      placeholder=${ifDefined(args.placeholder)}
      value=${ifDefined(args.value)}
      mask=${ifDefined(args.mask)}
      prompt=${ifDefined(args.prompt)}
      label=${ifDefined(args.label)}
      value-mode=${ifDefined(args.valueMode)}
      ?readonly=${args.readOnly}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    ></igc-mask-input>
  `,
};

export const Slots: Story = {
  args: {
    label: 'Mask input with slots',
  },
  render: (args) => html`
    <igc-mask-input
      name=${ifDefined(args.name)}
      placeholder=${ifDefined(args.placeholder)}
      value=${ifDefined(args.value)}
      mask=${ifDefined(args.mask)}
      prompt=${ifDefined(args.prompt)}
      label=${ifDefined(args.label)}
      value-mode=${ifDefined(args.valueMode)}
      ?readonly=${args.readOnly}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      <igc-icon name="github" slot="prefix"></igc-icon>
      <igc-icon name="github" slot="suffix"></igc-icon>
      <span slot="helper-text">This is some helper text</span>
    </igc-mask-input>
  `,
};

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
        <igc-mask-input name="mask-required" label="Required" required>
          <p slot="value-missing">This field is required</p>
        </igc-mask-input>

        <igc-mask-input
          name="required-mask-pattern"
          label="Mask pattern validation"
          mask="(+35\\9) 000-000-000"
        >
          <p slot="bad-input">
            The provided value <strong>does not</strong> match the pattern
          </p>
        </igc-mask-input>
      </fieldset>
      ${formControls()}
    </form>`;
  },
};
