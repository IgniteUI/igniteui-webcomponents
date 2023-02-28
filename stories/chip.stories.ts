import { html } from 'lit';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcChipComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcChipComponent);

// region default
const metadata: Meta<IgcChipComponent> = {
  title: 'Chip',
  component: 'igc-chip',
  parameters: {
    docs: {
      description: {
        component:
          'Chips help people enter information, make selections, filter content, or trigger actions.',
      },
    },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Sets the disabled state for the chip.',
      control: 'boolean',
      defaultValue: false,
    },
    removable: {
      type: 'boolean',
      description: 'Defines if the chip is removable or not.',
      control: 'boolean',
      defaultValue: false,
    },
    selectable: {
      type: 'boolean',
      description: 'Defines if the chip is selectable or not.',
      control: 'boolean',
      defaultValue: false,
    },
    selected: {
      type: 'boolean',
      description: 'Defines if the chip is selected or not.',
      control: 'boolean',
      defaultValue: false,
    },
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description:
        'A property that sets the color variant of the chip component.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: {
    disabled: false,
    removable: false,
    selectable: false,
    selected: false,
    size: 'medium',
  },
};

export default metadata;

interface IgcChipArgs {
  /** Sets the disabled state for the chip. */
  disabled: boolean;
  /** Defines if the chip is removable or not. */
  removable: boolean;
  /** Defines if the chip is selectable or not. */
  selectable: boolean;
  /** Defines if the chip is selected or not. */
  selected: boolean;
  /** A property that sets the color variant of the chip component. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcChipArgs>;

// endregion

const handleRemove = (e: Event) => {
  console.log(e);
};

const ChipTemplate = (
  {
    disabled,
    removable,
    selectable,
    selected,
    size = 'medium',
    variant,
  }: IgcChipArgs,
  { globals: { direction } }: Context
) => html`
  <igc-chip
    .disabled="${disabled}"
    .removable=${removable}
    .selectable=${selectable}
    .selected=${selected}
    .size=${size}
    dir=${direction}
    variant=${ifDefined(variant)}
    @igcRemove=${handleRemove}
  >
    <span slot="prefix">😱</span>
    Chip
    <span slot="suffix">👀</span>
  </igc-chip>
`;

export const Basic: Story = ChipTemplate.bind({});
