import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
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
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
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
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in form context.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
  },
  args: {
    indeterminate: false,
    checked: false,
    labelPosition: 'after',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcCheckboxArgs {
  /** Draws the checkbox in indeterminate state. */
  indeterminate: boolean;
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'before' | 'after';
  /** Sets the aria-labelledby attribute for the control. */
  ariaLabelledby: string;
  /** The name attribute of the control. */
  name: string;
  /** Makes the control a required field in form context. */
  required: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
}
type Story = StoryObj<IgcCheckboxArgs>;

// endregion

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template = (
  { labelPosition, checked, indeterminate, disabled }: IgcCheckboxArgs,
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
    <fieldset disabled>
      <igc-checkbox
        label-position=${ifDefined(labelPosition)}
        .checked=${checked}
        .indeterminate=${indeterminate}
        .disabled=${disabled}
        dir=${ifDefined(direction)}
      >
        Label
      </igc-checkbox>
    </fieldset>
  `;
};

export const Basic: Story = Template.bind({});

export const Form: Story = {
  render: () => {
    const onSubmit = (e: SubmitEvent) => {
      e.preventDefault();
    };

    return html`
      <form action="" @submit=${onSubmit}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox-1">Checkbox 1</igc-checkbox>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox"
            >Required checkbox</igc-checkbox
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-checkbox name="checkbox-2">Checkbox 2</igc-checkbox>
        </fieldset>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
    `;
  },
};
