import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcChipComponent, defineComponents } from '../src/index.js';

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
    actions: { handles: ['igcRemove', 'igcSelect'] },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Sets the disabled state for the chip.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    removable: {
      type: 'boolean',
      description: 'Defines if the chip is removable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    selectable: {
      type: 'boolean',
      description: 'Defines if the chip is selectable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    selected: {
      type: 'boolean',
      description: 'Defines if the chip is selected or not.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    variant: {
      type: '"primary" | "success" | "danger" | "warning" | "info"',
      description:
        'A property that sets the color variant of the chip component.',
      options: ['primary', 'success', 'danger', 'warning', 'info'],
      control: { type: 'select' },
    },
  },
  args: {
    disabled: false,
    removable: false,
    selectable: false,
    selected: false,
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
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}
type Story = StoryObj<IgcChipArgs>;

// endregion

const ChipTemplate = ({
  disabled,
  removable,
  selectable,
  selected,
  variant,
}: IgcChipArgs) => html`
  <igc-chip
    .disabled="${disabled}"
    .removable=${removable}
    .selectable=${selectable}
    .selected=${selected}
    variant=${ifDefined(variant)}
  >
    <span slot="prefix">😱</span>
    Chip
    <span slot="suffix">👀</span>
  </igc-chip>
`;

export const Basic: Story = ChipTemplate.bind({});
