import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { IgcColorPickerComponent, defineComponents } from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcColorPickerComponent);

// region default
const metadata: Meta<IgcColorPickerComponent> = {
  title: 'ColorPicker',
  component: 'igc-color-picker',
  parameters: {
    docs: { description: { component: 'Color input component.' } },
    actions: {
      handles: [
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
        'igcColorPicked',
      ],
    },
  },
  argTypes: {
    label: {
      type: 'string',
      description: 'The label of the component.',
      control: 'text',
    },
    value: {
      type: 'string',
      description: 'The value of the component.',
      control: 'text',
    },
    format: {
      type: '"hex" | "rgb" | "hsl"',
      description: 'Sets the color format for the string value.',
      options: ['hex', 'rgb', 'hsl'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hex' } },
    },
    hideFormats: {
      type: 'boolean',
      description: 'Whether to hide the format picker buttons.',
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
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    format: 'hex',
    hideFormats: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
  },
};

export default metadata;

interface IgcColorPickerArgs {
  /** The label of the component. */
  label: string;
  /** The value of the component. */
  value: string;
  /** Sets the color format for the string value. */
  format: 'hex' | 'rgb' | 'hsl';
  /** Whether to hide the format picker buttons. */
  hideFormats: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcColorPickerArgs>;

// endregion

export const Default: Story = {
  args: {
    label: 'Pick a color',
  },
};

export const InitialValue: Story = {
  args: {
    label: 'Pick a color',
    value: 'rebeccapurple',
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-color-picker
          name="color-default"
          label="Default"
        ></igc-color-picker>

        <igc-color-picker
          name="color-initial-value"
          label="Initial value"
          value="firebrick"
        ></igc-color-picker>
      </fieldset>

      ${formControls()}
    </form>
  `,
};
