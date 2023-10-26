import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import { IgcCheckboxComponent, defineComponents } from '../src/index.js';

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
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in a form context.',
      control: 'boolean',
      defaultValue: false,
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    validationMessage: {
      type: 'string',
      description:
        'A string containing the validation message of this element.',
      control: 'text',
    },
    willValidate: {
      type: 'boolean',
      description:
        'A boolean value which returns true if the element is a submittable element\nthat is a candidate for constraint validation.',
      control: 'boolean',
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
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** A string containing the validation message of this element. */
  validationMessage: string;
  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  willValidate: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
}
type Story = StoryObj<IgcCheckboxArgs>;

// endregion

const Template = ({
  labelPosition,
  checked,
  indeterminate,
  disabled,
}: IgcCheckboxArgs) => {
  return html`
    <igc-checkbox
      label-position=${ifDefined(labelPosition)}
      .checked=${checked}
      .indeterminate=${indeterminate}
      .disabled=${disabled}
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
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox"
            >Required checkbox</igc-checkbox
          >
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
