import { html } from 'lit';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcSwitchComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcSwitchComponent);

// region default
const metadata: Meta<IgcSwitchComponent> = {
  title: 'Switch',
  component: 'igc-switch',
  parameters: {
    docs: {
      description: {
        component:
          'Similar to a checkbox, a switch controls the state of a single setting on or off.',
      },
    },
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
    checked: false,
    labelPosition: 'after',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcSwitchArgs {
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
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
}
type Story = StoryObj<IgcSwitchArgs>;

// endregion

const Template = ({ labelPosition, checked, disabled }: IgcSwitchArgs) => {
  return html`
    <igc-switch
      label-position=${ifDefined(labelPosition)}
      .checked=${checked}
      .disabled=${disabled}
    >
      Label
    </igc-switch>
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
          <igc-switch name="switch">Switch 1</igc-switch>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-switch required name="required-switch"
            >Required switch</igc-switch
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-switch name="switch-disabled">Switch 2</igc-switch>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
