import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Context, Story } from './story.js';

const metadata = {
  title: 'Slider',
  component: 'igc-slider',
  parameters: {
    actions: {
      handles: ['igcChange'],
    },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Specifies whether slider is disabled',
      defaultValue: false,
    },
    continuous: {
      type: 'boolean',
      description: 'Specifies whether slider is continuous',
      defaultValue: false,
    },
    step: {
      type: 'number',
      description: 'The step of the slider',
      control: {
        type: 'number',
      },
      defaultValue: 2,
    },
    type: {
      type: '"slider" | "range"',
      options: ['slider', 'range'],
      description:
        'Specifies whether slider is displayed with single or double thumb.',
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'slider',
    },
    value: {
      type: 'number',
      description: 'The value of the slider',
      control: {
        type: 'number',
      },
      defaultValue: 100,
    },
    lowerBound: {
      type: 'number',
      description: 'Sets the minimum value for the track.',
      control: {
        type: 'number',
      },
      defaultValue: 0,
    },
    upperBound: {
      type: 'number',
      description: 'Sets the maximum value for the track.',
      control: {
        type: 'number',
      },
      defaultValue: 100,
    },
    min: {
      type: 'number',
      description: 'Sets the minimum value for the track.',
      control: {
        type: 'number',
      },
      defaultValue: 0,
    },
    max: {
      type: 'number',
      description: 'Sets the maximum value for the track.',
      control: {
        type: 'number',
      },
      defaultValue: 100,
    },
    primaryTicks: {
      type: 'number',
      description: 'Number of primary ticks that will be displayed.',
      control: {
        type: 'number',
        min: 0,
      },
      defaultValue: 3,
    },
    secondaryTicks: {
      type: 'number',
      description: 'Number of primary ticks that will be displayed.',
      control: {
        type: 'number',
        min: 0,
      },
      defaultValue: 2,
    },
    showPrimaryLabels: {
      type: 'boolean',
      description: 'Specifies whether primary labels are visible',
      defaultValue: true,
    },
    showSecondaryLabels: {
      type: 'boolean',
      description: 'Specifies whether secondary labels are visible',
      defaultValue: true,
    },
    tickOrientation: {
      type: '"mirror"|"start"|"end"',
      description: 'Specifies the orientation of the ticks.',
      options: ['mirror', 'start', 'end'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'end',
    },
    tickLabelRotation: {
      type: '"0"|"90"|"-90"',
      description: 'Specifies the orientation of the tick labels.',
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
  disabled: boolean;
  continuous: boolean;
  step: number;
  type: 'slider' | 'range';
  value: number;
  min: number;
  max: number;
  lowerBound: number;
  upperBound: number;
  primaryTicks: number;
  secondaryTicks: number;
  showPrimaryLabels: boolean;
  showSecondaryLabels: boolean;
  tickOrientation: 'mirror' | 'start' | 'end';
  tickLabelRotation: '0' | '90' | '-90';
}

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange'],
  },
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
    lowerBound = 0,
    upperBound = 100,
    primaryTicks = 3,
    secondaryTicks = 2,
    showPrimaryLabels = true,
    showSecondaryLabels = true,
    tickOrientation = 'end',
    tickLabelRotation = '0',
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="display: block; margin:40px 20px;"
    ?disabled=${disabled}
    ?continuous=${continuous}
    step=${step}
    type=${type}
    .value=${value}
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
    @igcChange=${(ev: any) => {
      console.log(ev);
    }}
  ></igc-slider>
`;
export const Basic = Template.bind({});
