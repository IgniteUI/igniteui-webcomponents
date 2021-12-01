import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcRangeSliderValue } from '../src/components/slider/slider.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Slider',
  component: 'igc-slider',
  argTypes: {
    value: {
      type: 'number | IgcRangeSliderValue',
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
    type: {
      type: '"range" | "slider"',
      options: ['range', 'slider'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'slider',
    },
    disabled: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    continuous: {
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
  value: number | IgcRangeSliderValue;
  min: number;
  max: number;
  lowerBound: number | undefined;
  upperBound: number | undefined;
  type: 'range' | 'slider';
  disabled: boolean;
  continuous: boolean;
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
    continuous = false,
    step = 2,
    type = 'slider',
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
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="display: block; margin:40px 20px;"
    ?disabled=${disabled}
    ?continuous=${continuous}
    step=${step}
    type=${type}
    .value=${type === 'slider'
      ? value
      : typeof value === 'number'
      ? { lower: 0, upper: value as number }
      : value}
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
  ></igc-slider>
  <input
    type="range"
    @input=${(ev: any) => console.log('input: ' + ev.target.value)}
    @change=${(ev: any) => console.log('change: ' + ev.target.value)}
  />
`;
export const Basic = Template.bind({});
