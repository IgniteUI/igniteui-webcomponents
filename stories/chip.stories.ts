import { html } from 'lit';
import { Context, Story } from './story.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
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

registerIconFromText(
  'cancel',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>'
);

registerIconFromText(
  'select',
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
);

const ChipTemplate: Story<ArgTypes, Context> = ({
  disabled,
  removable,
  selectable,
  selected,
  size = 'medium',
  variant,
}: ArgTypes) => html`
  <igc-chip
    .disabled="${disabled}"
    .removable=${removable}
    .selectable=${selectable}
    .selected=${selected}
    .size=${size}
    variant=${ifDefined(variant)}
  >
    Chip
  </igc-chip>
`;

export const Basic = ChipTemplate.bind({});
