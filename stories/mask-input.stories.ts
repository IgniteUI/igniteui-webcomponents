import {
  IgcIconComponent,
  IgcMaskInputComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

import { github } from '@igniteui/material-icons-extended';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

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
        'Dictates the behavior when retrieving the value of the control:\n\n- `raw`: Returns clean input (e.g. "5551234567")\n- `withFormatting`: Returns with mask formatting (e.g. "(555) 123-4567")\n\nEmpty values always return an empty string, regardless of the value mode.',
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
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
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
    valueMode: 'raw',
    mask: 'CCCCCCCCCC',
    prompt: '_',
    readOnly: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcMaskInputArgs {
  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw`: Returns clean input (e.g. "5551234567")
   * - `withFormatting`: Returns with mask formatting (e.g. "(555) 123-4567")
   *
   * Empty values always return an empty string, regardless of the value mode.
   */
  valueMode: 'raw' | 'withFormatting';
  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value will return an empty string.
   */
  value: string | Date;
  /** The masked pattern of the component. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask pattern. */
  prompt: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
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
type Story = StoryObj<IgcMaskInputArgs>;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic mask input. Use the controls panel to explore all available properties interactively. The default mask `CCCCCCCCCC` accepts any 10 characters.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Mask input supports **prefix**, **suffix**, and **helper-text** slots for decorating the field with icons and guidance text.',
      },
    },
  },
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

export const Patterns: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story: `Demonstrates common real-world mask patterns using the available mask characters:

| Character | Matches |
|---|---|
| \`C\` | Any single character |
| \`0\` | Numeric digit |
| \`9\` | Numeric digit or space |
| \`#\` | Numeric digit or sign (\`+\`, \`-\`) |
| \`L\` | Alphabetic letter |
| \`A\` | Alphanumeric |
| \`a\` | Alphanumeric or space |
| \`&\` | Any non-separator character |`,
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 24rem;"
    >
      <igc-mask-input
        label="Phone number"
        mask="(000) 000-0000"
        placeholder="(555) 123-4567"
      ></igc-mask-input>
      <igc-mask-input
        label="Date (MM/DD/YYYY)"
        mask="00/00/0000"
        placeholder="MM/DD/YYYY"
      ></igc-mask-input>
      <igc-mask-input
        label="Credit card number"
        mask="0000 0000 0000 0000"
        placeholder="1234 5678 9012 3456"
      ></igc-mask-input>
      <igc-mask-input
        label="IP address"
        mask="099.099.099.099"
        placeholder="192.168.000.001"
      ></igc-mask-input>
      <igc-mask-input
        label="Social Security Number"
        mask="000-00-0000"
        placeholder="123-45-6789"
      ></igc-mask-input>
      <igc-mask-input
        label="ZIP+4 code"
        mask="00000-0000"
        placeholder="12345-6789"
      ></igc-mask-input>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates mask input inside an HTML form with various validation constraints — required fields, `withFormatting` value mode, and custom validation messages via named slots.',
      },
    },
  },
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
