import { html } from 'lit';
import { Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcCheckboxComponent } from '../src/index.js';

IgcCheckboxComponent.register();

// region default
const metadata = {
  title: 'Checkbox',
  component: 'igc-checkbox',
  argTypes: {
    indeterminate: {
      type: 'boolean',
      description: 'Draws the checkbox in indeterminate state.',
      control: 'boolean',
      defaultValue: false,
    },
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
  indeterminate: boolean;
  name: string;
  value: string;
  disabled: boolean;
  checked: boolean;
  required: boolean;
  invalid: boolean;
  labelPosition: 'before' | 'after';
  ariaLabelledby: string;
}
// endregion

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { labelPosition, checked, indeterminate, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-checkbox
      label-position=${ifDefined(labelPosition)}
      .checked=${checked}
      .indeterminate=${indeterminate}
      .disabled=${disabled}
      dir=${ifDefined(direction)}
    >
      Label
    </igc-checkbox>
  `;
};

export const Basic = Template.bind({});
