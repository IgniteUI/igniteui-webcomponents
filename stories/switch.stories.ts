import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Switch',
  component: 'igc-switch',
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
    disabled: {
      type: 'boolean',
      description: 'Disables the control.',
      control: 'boolean',
      defaultValue: false,
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field.',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    focused: {
      type: 'boolean',
      description: 'Controls the keyboard focus of the element.',
      control: 'boolean',
      defaultValue: false,
    },
    labelPosition: {
      type: '"before" | "after"',
      description: 'The label position of the control.',
      options: ['before', 'after'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'after',
    },
    ariaLabelledby: {
      type: 'string',
      description: 'Sets the aria-labelledby attribute for the control.',
      control: 'text',
    },
  },
};
export default metadata;
interface ArgTypes {
  name: string;
  value: string;
  disabled: boolean;
  checked: boolean;
  required: boolean;
  invalid: boolean;
  focused: boolean;
  labelPosition: 'before' | 'after';
  ariaLabelledby: string;
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { labelPosition, checked, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-switch
      label-position=${ifDefined(labelPosition)}
      .checked=${checked}
      .disabled=${disabled}
      dir=${ifDefined(direction)}
    >
      Label
    </igc-switch>
  `;
};

export const Basic = Template.bind({});
