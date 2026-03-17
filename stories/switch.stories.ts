import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcSwitchComponent, defineComponents } from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcSwitchComponent);

// region default
const metadata: Meta<IgcSwitchComponent> = {
  title: 'Switch',
  component: 'igc-switch',
  parameters: {
    docs: {
      description: {
        component:
          'A switch toggles a single setting on or off, providing immediate feedback. It is semantically equivalent to a checkbox but communicates a binary state change that takes effect right away — without requiring a form submission.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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
      table: { defaultValue: { summary: 'false' } },
    },
    labelPosition: {
      type: '"after" | "before"',
      description: 'The label position of the control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
    },
  },
  args: {
    required: false,
    disabled: false,
    invalid: false,
    checked: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcSwitchArgs {
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'after' | 'before';
}
type Story = StoryObj<IgcSwitchArgs>;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A single interactive switch. Use the **Controls** panel to toggle `checked`, `disabled`, `invalid`, `required`, and `labelPosition`.',
      },
    },
  },
  render: ({
    labelPosition,
    checked,
    disabled,
    required,
    invalid,
    value,
    name,
  }) => html`
    <igc-switch
      .labelPosition=${labelPosition}
      .name=${name}
      .value=${value}
      ?checked=${checked}
      ?disabled=${disabled}
      ?required=${required}
      ?invalid=${invalid}
    >
      Label
    </igc-switch>
  `,
};

export const LabelPosition: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the two `label-position` values — `after` (default) and `before`.',
      },
    },
  },
  render: () => html`
    <style>
      .label-position-demo {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    </style>
    <div class="label-position-demo">
      <igc-switch label-position="after" checked
        >Label after (default)</igc-switch
      >
      <igc-switch label-position="before">Label before</igc-switch>
    </div>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Overview of all visual states: default, checked, disabled, disabled-checked, and invalid.',
      },
    },
  },
  render: () => html`
    <style>
      .states-demo {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    </style>
    <div class="states-demo">
      <igc-switch>Default</igc-switch>
      <igc-switch checked>Checked</igc-switch>
      <igc-switch disabled>Disabled</igc-switch>
      <igc-switch disabled checked>Disabled &amp; checked</igc-switch>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Form integration demo covering default, pre-checked, required validation, and disabled states. Submit the form to inspect the switch values in the submission data.',
      },
    },
  },
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-switch name="switch">Switch 1</igc-switch>
        </fieldset>
        <fieldset>
          <legend>Initial checked state</legend>
          <igc-switch name="switch-initial" value="initial" checked
            >Initial checked state</igc-switch
          >
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
