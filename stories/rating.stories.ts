import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Rating',
  component: 'igc-rating',
  argTypes: {
    max: {
      type: 'number',
      description: 'The maximum value for the rating',
      control: 'number',
      defaultValue: '5',
    },
    precision: {
      type: 'number',
      description: 'The minimum value change allowed.',
      control: 'number',
      defaultValue: '1',
    },
    symbol: {
      type: 'string | ((index: number) => string)',
      description:
        'The symbol which the rating will display.\nIt also accepts a callback function which gets the current symbol\nindex so the symbol can be resolved per position.',
      control: 'text',
      defaultValue: '⭐',
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
      defaultValue: '0',
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
  max: number;
  precision: number;
  symbol: string | ((index: number) => string);
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
    symbol,
    precision,
    max,
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
        return '😣';
      case 1:
        return '😔';
      case 2:
        return '😐';
      case 3:
        return '🙂';
      case 4:
        return '😆';
      default:
        return '🤔';
    }
  };

  return html`
    <igc-rating
      label=${ifDefined(label)}
      dir=${ifDefined(direction)}
      ?disabled=${disabled}
      ?hover=${hover}
      ?readonly=${readonly}
      .precision=${Number(precision)}
      .symbol=${symbol || unfilled}
      .value=${value}
      .max=${max}
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
