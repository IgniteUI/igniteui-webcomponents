import { html } from 'lit';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcRadioComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioComponent> = {
  title: 'Radio',
  component: 'igc-radio',
  parameters: { docs: { description: {} } },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field.',
      control: 'boolean',
      defaultValue: false,
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the radio control.',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    labelPosition: {
      type: '"before" | "after"',
      description: 'The label position of the radio control.',
      options: ['before', 'after'],
      control: { type: 'inline-radio' },
      defaultValue: 'after',
    },
    ariaLabelledby: {
      type: 'string',
      description: 'Sets the aria-labelledby attribute for the radio control.',
      control: 'text',
    },
  },
  args: {
    required: false,
    checked: false,
    disabled: false,
    invalid: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcRadioArgs {
  /** The name attribute of the control. */
  name: string;
  /** The value attribute of the control. */
  value: string;
  /** Makes the control a required field. */
  required: boolean;
  /** The checked state of the control. */
  checked: boolean;
  /** Disables the radio control. */
  disabled: boolean;
  /** Controls the validity of the control. */
  invalid: boolean;
  /** The label position of the radio control. */
  labelPosition: 'before' | 'after';
  /** Sets the aria-labelledby attribute for the radio control. */
  ariaLabelledby: string;
}
type Story = StoryObj<IgcRadioArgs>;

// endregion

const Template = (
  { labelPosition, checked, disabled, required, invalid }: IgcRadioArgs,
  { globals: { direction } }: Context
) => html`
  <igc-radio
    label-position="${ifDefined(labelPosition)}"
    .disabled="${disabled}"
    .checked="${checked}"
    .required=${required}
    .invalid="${invalid}"
    dir=${ifDefined(direction)}
  >
    Label
  </igc-radio>
`;

export const Basic: Story = Template.bind({});
