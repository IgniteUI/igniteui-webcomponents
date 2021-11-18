import { html } from 'lit-html';
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
      description:
        'The unfilled symbol/icon to use.\nAdditionally it accepts a callback function which accepts the current position\nindex so the symbol can be resolved per position.',
      control: 'text',
      defaultValue: 'dollar-circled',
    },
    filledIcon: {
      type: 'string',
      description:
        'The filled symbol/icon to use.\nAdditionally it accepts a callback function which accepts the current position\nindex so the symbol can be resolved per position.',
      control: 'text',
      defaultValue: 'apple',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
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
      description: 'Sets hover preview behavior for the component',
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
  name: string;
  label: string;
  value: number;
  disabled: boolean;
  hover: boolean;
  readonly: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcHover'],
  },
};

const Template: Story<ArgTypes, Context> = (
  {
    size,
    hover,
    icon,
    filledIcon,
    length,
    disabled,
    readonly,
    label,
    value,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const unfilled = (index: number) => {
    switch (index) {
      case 0:
        return 'coronavirus';
      case 1:
        return 'atm';
      case 2:
        return 'biking';
      case 3:
        return 'award';
      case 4:
        return 'bacteria';
      default:
        return 'dollar-circled';
    }
  };

  return html`
    <igc-rating
      label=${ifDefined(label)}
      dir=${ifDefined(direction)}
      ?disabled=${disabled}
      ?hover=${hover}
      ?readonly=${readonly}
      .icon=${icon || unfilled}
      .filledIcon=${filledIcon}
      .length=${length}
      .value=${value}
      .size=${size}
    >
    </igc-rating>
    <h5>
      If you set an empty string for the <em>icon</em> attribute the callback
      for unrated symbols will take over.
    </h5>
  `;
};

export const Basic = Template.bind({});
