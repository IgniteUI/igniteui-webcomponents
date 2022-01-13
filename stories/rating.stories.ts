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
    step: {
      type: 'number',
      description: 'The minimum value change allowed.',
      control: 'number',
      defaultValue: '1',
    },
    symbol: {
      type: 'string',
      description: 'The symbol which the rating will display.',
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
  step: number;
  symbol: string;
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
    step,
    max,
    disabled,
    readonly,
    label = 'Default',
    value,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const customSymbols = (index: number) => {
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

  const customIcons = (_: number) => {
    return html`<igc-icon name="diamond-circled"></igc-icon>`;
  };

  const hoverHandler = (e: CustomEvent) => {
    const labels = ['', 'Terrible', 'Bad', 'Meh', 'Great', 'Superb'];
    document.getElementById('selection')!.textContent = `${
      labels[e.detail] ?? 'Unknown'
    }!`;
  };

  return html`
    <div>
      <igc-rating
        label=${ifDefined(label)}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover=${hover}
        ?readonly=${readonly}
        .step=${Number(step)}
        .symbol=${symbol}
        .value=${value}
        .max=${max}
      >
      </igc-rating>
    </div>
    <br />
    <div style="display: inline-flex; align-items: flex-end; gap: 8px;">
      <igc-rating
        label="Custom symbols"
        @igcChange=${hoverHandler}
        @igcHover=${hoverHandler}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover=${hover}
        ?readonly=${readonly}
        .step=${Number(step)}
        .symbolFormatter=${customSymbols}
        .value=${value}
        .max=${max}
      >
      </igc-rating>
      <span style="min-height: 24px" id="selection"></span>
    </div>
    <br />
    <div>
      <igc-rating
        label="Icons"
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover=${hover}
        ?readonly=${readonly}
        .step=${Number(step)}
        .symbolFormatter=${customIcons}
        .value=${value}
        .max=${max}
      >
      </igc-rating>
    </div>
  `;
};

export const Basic = Template.bind({});
