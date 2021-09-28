import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import '../igniteui-webcomponents.js';
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
      description: 'Specifies whether slider is disabled',
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
    },
    min: {
      type: 'number',
      description: 'Sets the minimum value for the track.',
      control: {
        type: 'number',
      },
      defaultValue: -20,
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
    tickOrientation: {
      type: '"mirror"|"start"|"end"',
      description: 'Specifies the orientation of the ticks.',
      options: ['mirror', 'start', 'end'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'end',
    },
    zeroOrigin: {
      type: 'boolean',
      description: 'Specifies if the default value is zero',
      defaultValue: false,
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
  primaryTicks: number;
  secondaryTicks: number;
  tickOrientation: 'mirror' | 'start' | 'end';
  zeroOrigin: boolean;
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
    min = -20,
    max = 100,
    primaryTicks = 3,
    secondaryTicks = 2,
    tickOrientation = 'end',
    zeroOrigin = false,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-slider
    style="margin:40px;"
    ?disabled=${disabled}
    ?continuous=${continuous}
    step=${step}
    type=${type}
    min=${min}
    max=${max}
    primaryTicks=${primaryTicks}
    secondaryTicks=${secondaryTicks}
    tickOrientation=${tickOrientation}
    ?zeroOrigin=${zeroOrigin}
    dir=${ifDefined(direction)}
    @igcChange=${(ev: any) => {
      console.log(ev);
    }}
  ></igc-slider>
`;
export const Basic = Template.bind({});
