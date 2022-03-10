import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Radio',
  component: 'igc-radio',
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
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'after',
    },
    ariaLabelledby: {
      type: 'string',
      description: 'Sets the aria-labelledby attribute for the radio control.',
      control: 'text',
    },
  },
};
export default metadata;
interface ArgTypes {
  name: string;
  value: string;
  required: boolean;
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  labelPosition: 'before' | 'after';
  ariaLabelledby: string;
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { labelPosition, checked, disabled, required, invalid }: ArgTypes,
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

export const Basic = Template.bind({});
