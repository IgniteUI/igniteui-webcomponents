import { html } from 'lit';
import { Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcCheckboxComponent } from '../src/index.js';

defineComponents(IgcCheckboxComponent);

// region default
const metadata: Meta<IgcCheckboxComponent> = {
  title: 'Checkbox',
  component: 'igc-checkbox',
  parameters: {
    docs: {
      description: {
        component:
          'A check box allowing single values to be selected/deselected.',
      },
    },
  },
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
      control: { type: 'inline-radio' },
      defaultValue: 'after',
    },
    ariaLabelledby: {
      type: 'string',
      description: 'Sets the aria-labelledby attribute for the control.',
      control: 'text',
    },
  },
  args: {
    indeterminate: false,
    disabled: false,
    checked: false,
    required: false,
    invalid: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcCheckboxArgs {
  /** Draws the checkbox in indeterminate state. */
  indeterminate: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The value attribute of the control. */
  value: string;
  /** Disables the control. */
  disabled: boolean;
  /** The checked state of the control. */
  checked: boolean;
  /** Makes the control a required field. */
  required: boolean;
  /** Controls the validity of the control. */
  invalid: boolean;
  /** The label position of the control. */
  labelPosition: 'before' | 'after';
  /** Sets the aria-labelledby attribute for the control. */
  ariaLabelledby: string;
}
type Story = StoryObj<IgcCheckboxArgs>;

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
