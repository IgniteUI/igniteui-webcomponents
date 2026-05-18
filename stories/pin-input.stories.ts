import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcPinInputComponent, defineComponents } from 'igniteui-webcomponents';
import { formControls, formSubmitHandler } from './story.js';

defineComponents(IgcPinInputComponent);

// region default
const metadata: Meta<IgcPinInputComponent> = {
  title: 'PinInput',
  component: 'igc-pin-input',
  parameters: {
    docs: {
      description: {
        component:
          'A PIN/OTP input component that renders individual character cells.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange', 'igcComplete'] },
  },
  argTypes: {
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder character shown in each empty cell.',
      control: 'text',
    },
    length: {
      type: 'number',
      description: 'The number of input cells. Clamped between 1 and 8.',
      control: 'number',
      table: { defaultValue: { summary: '4' } },
    },
    inputMode: {
      type: '"numeric" | "alphanumeric"',
      description:
        'The type of allowed input.\n- `numeric` — only digits (0-9)\n- `alphanumeric` — letters and digits',
      options: ['numeric', 'alphanumeric'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'numeric' } },
    },
    mask: {
      type: 'boolean',
      description:
        'When set, the entered characters are visually hidden (displayed as password dots).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    separator: {
      type: 'string',
      description:
        'The character(s) rendered between cell groups when `groups` is configured.\nHas no effect unless `groups` is also set.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    value: {
      type: 'string',
      description:
        'The concatenated value of all cells. Empty string when not all cells are filled.',
      control: 'text',
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
    length: 4,
    inputMode: 'numeric',
    mask: false,
    separator: '',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcPinInputArgs {
  /** The label for the control. */
  label: string;
  /** The placeholder character shown in each empty cell. */
  placeholder: string;
  /** The number of input cells. Clamped between 1 and 8. */
  length: number;
  /**
   * The type of allowed input.
   * - `numeric` — only digits (0-9)
   * - `alphanumeric` — letters and digits
   */
  inputMode: 'numeric' | 'alphanumeric';
  /** When set, the entered characters are visually hidden (displayed as password dots). */
  mask: boolean;
  /**
   * The character(s) rendered between cell groups when `groups` is configured.
   * Has no effect unless `groups` is also set.
   */
  separator: string;
  /** The concatenated value of all cells. Empty string when not all cells are filled. */
  value: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcPinInputArgs>;

// endregion

export const Basic: Story = {
  render: ({
    length,
    inputMode,
    mask,
    label,
    placeholder,
    required,
    disabled,
    invalid,
    name,
  }) => html`
    <igc-pin-input
      .length=${length}
      .inputMode=${inputMode}
      ?mask=${mask}
      label=${ifDefined(label)}
      placeholder=${ifDefined(placeholder)}
      ?required=${required}
      ?disabled=${disabled}
      ?invalid=${invalid}
      name=${ifDefined(name)}
    ></igc-pin-input>
  `,
};

export const Masked: Story = {
  args: {
    mask: true,
    label: 'Enter PIN',
    length: 4,
  },
  render: ({
    length,
    inputMode,
    mask,
    label,
    placeholder,
    required,
    disabled,
    invalid,
  }) => html`
    <igc-pin-input
      .length=${length}
      .inputMode=${inputMode}
      ?mask=${mask}
      label=${ifDefined(label)}
      placeholder=${ifDefined(placeholder)}
      ?required=${required}
      ?disabled=${disabled}
      ?invalid=${invalid}
    ></igc-pin-input>
  `,
};

export const Alphanumeric: Story = {
  args: {
    inputMode: 'alphanumeric',
    label: 'Enter Code',
    length: 6,
  },
  render: ({
    length,
    inputMode,
    mask,
    label,
    placeholder,
    required,
    disabled,
    invalid,
  }) => html`
    <igc-pin-input
      .length=${length}
      .inputMode=${inputMode}
      ?mask=${mask}
      label=${ifDefined(label)}
      placeholder=${ifDefined(placeholder)}
      ?required=${required}
      ?disabled=${disabled}
      ?invalid=${invalid}
    ></igc-pin-input>
  `,
};

export const InForm: Story = {
  render: ({
    length,
    inputMode,
    mask,
    label,
    required,
    disabled,
    invalid,
  }) => html`
    <form @submit=${formSubmitHandler}>
      <fieldset>
        <igc-pin-input
          name="otp"
          .length=${length}
          .inputMode=${inputMode}
          ?mask=${mask}
          label=${ifDefined(label)}
          ?required=${required}
          ?disabled=${disabled}
          ?invalid=${invalid}
        >
          <span slot="value-missing">Please fill in all fields.</span>
        </igc-pin-input>
      </fieldset>
      ${formControls()}
    </form>
  `,
};

export const WithGroups: Story = {
  args: {
    label: 'License key',
    separator: '-',
    inputMode: 'alphanumeric',
    length: 4,
  },
  render: ({
    inputMode,
    mask,
    label,
    placeholder,
    disabled,
    invalid,
    separator,
  }) => html`
    <p>Two groups of 4 (8 total), separated by a dash:</p>
    <igc-pin-input
      .groups=${[4, 4]}
      .inputMode=${inputMode}
      ?mask=${mask}
      label=${ifDefined(label)}
      placeholder=${ifDefined(placeholder)}
      separator=${ifDefined(separator || undefined)}
      ?disabled=${disabled}
      ?invalid=${invalid}
    ></igc-pin-input>

    <p style="margin-top: 1.5rem">
      Three groups of 3 (capped at 8 total), separated by a space:
    </p>
    <igc-pin-input
      .groups=${[3, 3, 3]}
      .inputMode=${inputMode}
      separator=" "
      label="One-time code"
      ?disabled=${disabled}
    ></igc-pin-input>

    <p style="margin-top: 1.5rem">No separator set — groups are visual only:</p>
    <igc-pin-input
      .groups=${[2, 2, 2]}
      .inputMode=${inputMode}
      label="PIN"
      ?disabled=${disabled}
    ></igc-pin-input>
  `,
};
