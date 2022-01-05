import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Slider',
  component: 'igc-slider',
  argTypes: {
    value: {
      type: 'number',
      description: 'The current value of the slider.',
      control: 'number',
    },
    ariaLabel: {
      type: 'string',
      description: 'The aria label of the slider thumb.',
      control: 'text',
    },
    min: {
      type: 'number',
      description: 'The minimum value of the slider scale. Defaults to 0.',
      control: 'number',
    },
    max: {
      type: 'number',
      description: 'The maximum value of the slider scale. Defaults to 100.',
      control: 'number',
    },
    lowerBound: {
      type: 'number | undefined',
      description:
        'The lower bound of the slider value. If not set, the `min` value is applied.',
      control: 'number',
    },
    upperBound: {
      type: 'number | undefined',
      description:
        'The upper bound of the slider value. If not set, the `max` value is applied.',
      control: 'number',
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the UI interactions of the slider.',
      control: 'boolean',
      defaultValue: false,
    },
    discreteTrack: {
      type: 'boolean',
      description:
        'Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.',
      control: 'boolean',
      defaultValue: false,
    },
    hideTooltip: {
      type: 'boolean',
      description: 'Hides the thumb tooltip.',
      control: 'boolean',
      defaultValue: false,
    },
    step: {
      type: 'number',
      description:
        'Specifies the granularity that the value must adhere to.\nIf set to 0 no stepping is implied and any value in the range is allowed.',
      control: 'number',
      defaultValue: '1',
    },
    primaryTicks: {
      type: 'number',
      description:
        'The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.',
      control: 'number',
      defaultValue: '0',
    },
    secondaryTicks: {
      type: 'number',
      description:
        'The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.',
      control: 'number',
      defaultValue: '0',
    },
    tickOrientation: {
      type: '"start" | "end" | "mirror"',
      description: 'Changes the orientation of the ticks.',
      options: ['start', 'end', 'mirror'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'end',
    },
    hidePrimaryLabels: {
      type: 'boolean',
      description: 'Hides the primary tick labels.',
      control: 'boolean',
      defaultValue: false,
    },
    hideSecondaryLabels: {
      type: 'boolean',
      description: 'Hides the secondary tick labels.',
      control: 'boolean',
      defaultValue: false,
    },
    tickLabelRotation: {
      type: '0 | 90 | -90',
      description:
        'The degrees for the rotation of the tick labels. Defaults to 0.',
      options: ['0', '90', '-90'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: '0',
    },
  },
};
export default metadata;
interface ArgTypes {
  value: number;
  ariaLabel: string;
  min: number;
  max: number;
  lowerBound: number | undefined;
  upperBound: number | undefined;
  disabled: boolean;
  discreteTrack: boolean;
  hideTooltip: boolean;
  step: number;
  primaryTicks: number;
  secondaryTicks: number;
  tickOrientation: 'start' | 'end' | 'mirror';
  hidePrimaryLabels: boolean;
  hideSecondaryLabels: boolean;
  tickLabelRotation: 0 | 90 | -90;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

const Template: Story<ArgTypes, Context> = (
  {
    disabled = false,
    discreteTrack = false,
    hideTooltip = false,
    step = 2,
    value = 0,
    min = 0,
    max = 100,
    lowerBound,
    upperBound,
    primaryTicks = 3,
    secondaryTicks = 2,
    hidePrimaryLabels = false,
    hideSecondaryLabels = false,
    tickOrientation = 'end',
    tickLabelRotation = 0,
    ariaLabel,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="margin: 40px 20px;"
    ?disabled=${disabled}
    ?discrete-track=${discreteTrack}
    ?hide-tooltip=${hideTooltip}
    step=${step}
    .value=${value}
    min=${min}
    max=${max}
    aria-label=${ifDefined(ariaLabel)}
    .lowerBound=${lowerBound}
    .upperBound=${upperBound}
    .primaryTicks=${primaryTicks}
    .secondaryTicks=${secondaryTicks}
    .hidePrimaryLabels=${hidePrimaryLabels}
    .hideSecondaryLabels=${hideSecondaryLabels}
    .tickOrientation=${tickOrientation}
    .tickLabelRotation=${tickLabelRotation}
    dir=${ifDefined(direction)}
  ></igc-slider>
  <!-- <input
    type="range"
    @input=${(ev: any) => console.log('input: ' + ev.target.value)}
    @change=${(ev: any) => console.log('change: ' + ev.target.value)}
  /> -->
`;

const LabelFormatterTemplate: Story<ArgTypes, Context> = (
  _args: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="margin: 40px 20px; width: 200px;"
    min="0"
    max="2"
    primary-ticks="3"
    discrete-track
    aria-label="Priority"
    .labelFormatter=${(value: number): string => {
      switch (value) {
        case 0:
          return 'Low';
        case 1:
          return 'Medium';
        case 2:
          return 'High';
        default:
          return value.toString();
      }
    }}
    dir=${ifDefined(direction)}
  ></igc-slider>
`;
export const Basic = Template.bind({});
export const LabelFormatter = LabelFormatterTemplate.bind({});
(LabelFormatter as any).parameters = {
  controls: { include: [] },
};
