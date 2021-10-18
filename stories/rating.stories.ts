import { html } from 'lit-html';
import '../index.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Rating',
  component: 'igc-rating',
  argTypes: {
    length: {
      type: 'number',
      description: 'The number of icons to render',
      control: 'number',
      defaultValue: '5',
    },
    icon: {
      type: 'string',
      description: 'The unfilled symbol/icon to use',
      control: 'text',
      defaultValue: 'coronavirus',
    },
    filledIcon: {
      type: 'string',
      description: 'The filled symbol/icon to use',
      control: 'text',
      defaultValue: 'diamond',
    },
    value: {
      type: 'number',
      description: 'The current value of the component',
      control: 'number',
      defaultValue: '-1',
    },
    disabled: {
      type: 'boolean',
      description: 'Sets the disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    hover: {
      type: 'boolean',
      description: 'Sets hover preview behaviour for the component',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Sets the readonly state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  length: number;
  icon: string;
  filledIcon: string;
  value: number;
  disabled: boolean;
  hover: boolean;
  readonly: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  {
    size,
    hover,
    icon,
    filledIcon,
    length,
    disabled,
    readonly,
    value,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html` <igc-rating
    dir=${ifDefined(direction)}
    ?disabled=${disabled}
    ?hover=${hover}
    ?readonly=${readonly}
    .icon=${icon}
    .filledIcon=${filledIcon}
    .length=${length}
    .value=${value}
    .size=${size}
  >
  </igc-rating>`;
};

export const Basic = Template.bind({});
