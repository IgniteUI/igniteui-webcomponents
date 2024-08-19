import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcRadioComponent, defineComponents } from '../src/index.js';

defineComponents(IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioComponent> = {
  title: 'Radio',
  component: 'igc-radio',
  parameters: {
    docs: { description: { component: '' } },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    labelPosition: {
      type: '"before" | "after"',
      description: 'The label position of the radio control.',
      options: ['before', 'after'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
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
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    checked: false,
    labelPosition: 'after',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcRadioArgs {
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the radio control. */
  labelPosition: 'before' | 'after';
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcRadioArgs>;

// endregion

const Template = ({
  labelPosition,
  checked,
  disabled,
  required,
  invalid,
}: IgcRadioArgs) => html`
  <igc-radio
    label-position="${ifDefined(labelPosition)}"
    .disabled="${disabled}"
    .checked="${checked}"
    .required=${required}
    .invalid="${invalid}"
  >
    Label
  </igc-radio>
`;

export const Basic: Story = Template.bind({});
