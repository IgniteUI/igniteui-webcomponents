import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcCheckboxComponent, defineComponents } from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

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
    actions: { handles: ['igcChange', 'igcFocus', 'igcBlur'] },
  },
  argTypes: {
    indeterminate: {
      type: 'boolean',
      description: 'Draws the checkbox in indeterminate state.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
      description: 'Control the validity of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
      table: { defaultValue: { summary: false } },
    },
    labelPosition: {
      type: '"before" | "after"',
      description: 'The label position of the control.',
      options: ['before', 'after'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
    },
  },
  args: {
    indeterminate: false,
    required: false,
    disabled: false,
    invalid: false,
    checked: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcCheckboxArgs {
  /** Draws the checkbox in indeterminate state. */
  indeterminate: boolean;
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'before' | 'after';
}
type Story = StoryObj<IgcCheckboxArgs>;

// endregion

const Template = ({
  labelPosition,
  checked,
  indeterminate,
  disabled,
  invalid,
  required,
}: IgcCheckboxArgs) => {
  return html`
    <igc-checkbox
      label-position=${ifDefined(labelPosition)}
      .checked=${checked}
      .indeterminate=${indeterminate}
      .disabled=${disabled}
      .required=${required}
      .invalid=${invalid}
    >
      Label
    </igc-checkbox>
  `;
};

export const Basic: Story = Template.bind({});

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>

        <fieldset>
          <legend>Initial checked state</legend>
          <igc-checkbox name="checkbox-initial" value="initial" checked
            >Checked initial state</igc-checkbox
          >
        </fieldset>

        <fieldset>
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox"
            >Required checkbox</igc-checkbox
          >
        </fieldset>

        <fieldset>
          <legend>Indeterminate with required state</legend>
          <igc-checkbox name="required-indeterminate" indeterminate required>
            Are you sure?
          </igc-checkbox>
        </fieldset>

        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-checkbox name="checkbox-disabled">Checkbox 2</igc-checkbox>
        </fieldset>

        ${formControls()}
      </form>
    `;
  },
};
