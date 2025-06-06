import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcRadioComponent, defineComponents } from 'igniteui-webcomponents';

defineComponents(IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioComponent> = {
  title: 'Radio',
  component: 'igc-radio',
  parameters: {
    docs: { description: { component: '' } },
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
