import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Range Slider',
  component: 'igc-range-slider',
  argTypes: {
    lower: {
      type: 'number',
      control: 'number',
    },
    upper: {
      type: 'number',
      control: 'number',
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
  lower: number;
  upper: number;
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
    lower = 0,
    upper = 0,
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
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-range-slider
    style="margin: 40px 20px;"
    ?disabled=${disabled}
    ?discrete-track=${discreteTrack}
    ?hide-tooltip=${hideTooltip}
    step=${step}
    .lower=${lower}
    .lower=${upper}
    min=${min}
    max=${max}
    .lowerBound=${lowerBound}
    .upperBound=${upperBound}
    .primaryTicks=${primaryTicks}
    .secondaryTicks=${secondaryTicks}
    .showPrimaryLabels=${showPrimaryLabels}
    .showSecondaryLabels=${showSecondaryLabels}
    .tickOrientation=${tickOrientation}
    .tickLabelRotation=${tickLabelRotation}
    dir=${ifDefined(direction)}
  ></igc-range-slider>
`;

export const Basic = Template.bind({});
