import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';
import { defineComponents, IgcSliderComponent } from '../src/index.js';

defineComponents(IgcSliderComponent);

// region default
const metadata: Meta<IgcSliderComponent> = {
  title: 'Slider',
  component: 'igc-slider',
  parameters: {
    docs: {
      description: {
        component:
          'A slider component used to select numeric value within a range.',
      },
    },
  },
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
      control: { type: 'inline-radio' },
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
    locale: {
      type: 'string',
      description:
        'The locale used to format the thumb and tick label values in the slider.',
      control: 'text',
      defaultValue: 'en',
    },
    valueFormat: {
      type: 'string | undefined',
      description:
        'String format used for the thumb and tick label values in the slider.',
      control: 'text',
    },
    tickLabelRotation: {
      type: '0 | 90 | -90',
      description:
        'The degrees for the rotation of the tick labels. Defaults to 0.',
      options: ['0', '90', '-90'],
      control: { type: 'inline-radio' },
      defaultValue: '0',
    },
  },
  args: {
    disabled: false,
    discreteTrack: false,
    hideTooltip: false,
    primaryTicks: '0',
    secondaryTicks: '0',
    tickOrientation: 'end',
    hidePrimaryLabels: false,
    hideSecondaryLabels: false,
    locale: 'en',
    tickLabelRotation: '0',
  },
};

export default metadata;

interface IgcSliderArgs {
  /** The current value of the slider. */
  value: number;
  /** The aria label of the slider thumb. */
  ariaLabel: string;
  /** The minimum value of the slider scale. Defaults to 0. */
  min: number;
  /** The maximum value of the slider scale. Defaults to 100. */
  max: number;
  /** The lower bound of the slider value. If not set, the `min` value is applied. */
  lowerBound: number | undefined;
  /** The upper bound of the slider value. If not set, the `max` value is applied. */
  upperBound: number | undefined;
  /** Disables the UI interactions of the slider. */
  disabled: boolean;
  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.
   */
  discreteTrack: boolean;
  /** Hides the thumb tooltip. */
  hideTooltip: boolean;
  /**
   * Specifies the granularity that the value must adhere to.
   * If set to 0 no stepping is implied and any value in the range is allowed.
   */
  step: number;
  /** The number of primary ticks. It defaults to 0 which means no primary ticks are displayed. */
  primaryTicks: number;
  /** The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed. */
  secondaryTicks: number;
  /** Changes the orientation of the ticks. */
  tickOrientation: 'start' | 'end' | 'mirror';
  /** Hides the primary tick labels. */
  hidePrimaryLabels: boolean;
  /** Hides the secondary tick labels. */
  hideSecondaryLabels: boolean;
  /** The locale used to format the thumb and tick label values in the slider. */
  locale: string;
  /** String format used for the thumb and tick label values in the slider. */
  valueFormat: string | undefined;
  /** The degrees for the rotation of the tick labels. Defaults to 0. */
  tickLabelRotation: 0 | 90 | -90;
}
type Story = StoryObj<IgcSliderArgs>;

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
    locale = 'en',
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="margin: 60px;"
    ?disabled=${disabled}
    ?discrete-track=${discreteTrack}
    ?hide-tooltip=${hideTooltip}
    step=${step}
    .value=${value}
    min=${min}
    max=${max}
    aria-label=${ifDefined(ariaLabel)}
    locale=${locale}
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

const ValueFormatTemplate: Story<ArgTypes, Context> = (
  _args: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="padding: 60px;"
    primary-ticks="3"
    secondary-ticks="4"
    .valueFormatOptions=${{
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }}
    dir=${ifDefined(direction)}
  ></igc-slider>
  <igc-slider
    style="padding: 60px; overflow: hidden"
    value-format="Distance: {0}"
    locale="fr"
    .valueFormatOptions=${{
      style: 'unit',
      unit: 'kilometer',
      minimumFractionDigits: 2,
    }}
    dir=${ifDefined(direction)}
  ></igc-slider>
`;

const LabelsTemplate: Story<ArgTypes, Context> = (
  _args: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="margin: 40px 20px; width: 200px;"
    primary-ticks="3"
    discrete-track
    aria-label="Priority"
    dir=${ifDefined(direction)}
  >
    <igc-slider-label>Low</igc-slider-label>
    <igc-slider-label>Medium</igc-slider-label>
    <igc-slider-label>High</igc-slider-label>
  </igc-slider>
`;
export const Basic = Template.bind({});
export const ValueFormat = ValueFormatTemplate.bind({});
export const Labels = LabelsTemplate.bind({});
(ValueFormat as any).parameters = {
  controls: { include: [] },
};
(Labels as any).parameters = {
  controls: { include: [] },
};
