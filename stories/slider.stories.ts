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
      control: 'number',
    },
    ariaLabel: {
      type: 'string',
      control: 'text',
    },
    min: {
      type: 'number',
      control: 'number',
    },
    max: {
      type: 'number',
      control: 'number',
    },
    lowerBound: {
      type: 'number | undefined',
      control: 'number',
    },
    upperBound: {
      type: 'number | undefined',
      control: 'number',
    },
    disabled: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    discreteTrack: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    hideTooltip: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    step: {
      type: 'number',
      control: 'number',
      defaultValue: '1',
    },
    primaryTicks: {
      type: 'number',
      control: 'number',
      defaultValue: '0',
    },
    secondaryTicks: {
      type: 'number',
      control: 'number',
      defaultValue: '0',
    },
    tickOrientation: {
      type: '"start" | "end" | "mirror"',
      options: ['start', 'end', 'mirror'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'end',
    },
    showPrimaryLabels: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
    },
    showSecondaryLabels: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
    },
    tickLabelRotation: {
      type: '0 | 90 | -90',
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
  showPrimaryLabels: boolean;
  showSecondaryLabels: boolean;
  tickLabelRotation: 0 | 90 | -90;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

(metadata as any).argTypes.value = {
  type: 'number',
  description: 'The value of the slider',
  control: {
    type: 'number',
  },
  defaultValue: '0',
};

const Template: Story<ArgTypes, Context> = (
  {
    disabled = false,
    discreteTrack = false,
    hideTooltip = false,
    step = 2,
    value = 100,
    min = 0,
    max = 100,
    lowerBound,
    upperBound,
    primaryTicks = 3,
    secondaryTicks = 2,
    showPrimaryLabels = true,
    showSecondaryLabels = true,
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
    .showPrimaryLabels=${showPrimaryLabels}
    .showSecondaryLabels=${showSecondaryLabels}
    .tickOrientation=${tickOrientation}
    .tickLabelRotation=${tickLabelRotation}
    dir=${ifDefined(direction)}
  ></igc-slider>
  <input
    type="range"
    @input=${(ev: any) => console.log('input: ' + ev.target.value)}
    @change=${(ev: any) => console.log('change: ' + ev.target.value)}
  />
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
