import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcRadioComponent, defineComponents } from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioComponent> = {
  title: 'Radio',
  component: 'igc-radio',
  parameters: {
    docs: {
      description: {
        component:
          'The radio component lets users select a single option from a group. Radios are designed to be used inside an `igc-radio-group`, which manages mutual exclusivity, keyboard navigation, and form submission.',
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
      description: 'The label position of the radio control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
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
  },
  args: {
    required: false,
    checked: false,
    labelPosition: 'after',
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcRadioArgs {
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the radio control. */
  labelPosition: 'after' | 'before';
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcRadioArgs>;

// endregion

export const Default: Story = {
  args: {
    value: 'radio',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A single interactive radio button. Use the **Controls** panel to toggle `checked`, `disabled`, `invalid`, `required`, and `labelPosition`.',
      },
    },
  },
  render: (args) => html`
    <igc-radio
      .labelPosition=${args.labelPosition}
      .name=${args.name}
      .value=${args.value}
      ?disabled=${args.disabled}
      ?checked=${args.checked}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      Label
    </igc-radio>
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
      <igc-radio name="label-pos" value="after" label-position="after" checked>
        Label after (default)
      </igc-radio>
      <igc-radio name="label-pos" value="before" label-position="before">
        Label before
      </igc-radio>
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
      <igc-radio value="default">Default</igc-radio>
      <igc-radio value="checked" checked>Checked</igc-radio>
      <igc-radio value="disabled" disabled>Disabled</igc-radio>
      <igc-radio value="disabled-checked" disabled checked>
        Disabled &amp; checked
      </igc-radio>
      <igc-radio value="invalid" invalid>Invalid</igc-radio>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Radios inside an HTML form demonstrating `required` constraint validation. Submit without selecting a value to see the custom `value-missing` error message.',
      },
    },
  },
  render: () => html`
    <form @submit=${formSubmitHandler}>
      <fieldset>
        <legend>Favorite fruit (required)</legend>

        <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
        <igc-radio name="fruit" value="orange" required>Orange</igc-radio>
        <igc-radio name="fruit" value="mango" required>Mango</igc-radio>
      </fieldset>
      ${formControls()}
    </form>
  `,
};
