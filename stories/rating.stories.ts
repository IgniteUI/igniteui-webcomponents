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
    valueFormat: {
      type: 'string',
      description:
        "A format string which sets aria-valuetext. All instances of '{0}' will be replaced\nwith the current value of the control.\nImportant for screen-readers and useful for localization.",
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
    hoverPreview: {
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
  valueFormat: string;
  value: number;
  disabled: boolean;
  hoverPreview: boolean;
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
    hoverPreview,
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
    return ['😣', '😔', '😐', '🙂', '😆'][index];
  };

  const hoverHandler = (e: CustomEvent) => {
    const labels = [
      'Select a value',
      'Terrible',
      'Bad',
      'Meh',
      'Great',
      'Superb',
    ];
    document.getElementById('selection')!.textContent = `${
      labels[Math.ceil(e.detail)] ?? 'Unknown'
    }`;
  };

  return html`
    <div>
      <igc-rating
        label=${ifDefined(label)}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        .step=${Number(step)}
        .symbol=${symbol}
        .value=${value}
        .max=${max}
      >
      </igc-rating>
    </div>
    <div
      style="display: inline-flex; align-items: flex-end; gap: 8px; margin: 24px 0;"
    >
      <igc-rating
        label="Custom symbols with a really really long label"
        @igcChange=${hoverHandler}
        @igcHover=${hoverHandler}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        .step=${Number(step)}
        .symbolFormatter=${customSymbols}
        max="5"
      >
      </igc-rating>
      <span style="min-height: 24px" id="selection">Select a value</span>
    </div>
    <div>
      <igc-rating
        label="Icons"
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        valueFormat="Custom icon {0} selected. That is {0}."
      >
        <template>
          <igc-icon name="diamond-circled"></igc-icon>
        </template>
        Am I here also
      </igc-rating>
    </div>
  `;
};

export const Basic = Template.bind({});
