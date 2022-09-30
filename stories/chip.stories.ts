import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Chip',
  component: 'igc-chip',
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
      control: {
        type: 'select',
      },
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
};
export default metadata;
interface ArgTypes {
  disabled: boolean;
  removable: boolean;
  selectable: boolean;
  selected: boolean;
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  size: 'small' | 'medium' | 'large';
}
// endregion

const handleRemove = (e: Event) => {
  console.log(e);
};

const ChipTemplate: Story<ArgTypes, Context> = (
  {
    disabled,
    removable,
    selectable,
    selected,
    size = 'medium',
    variant,
  }: ArgTypes,
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

export const Basic = ChipTemplate.bind({});
