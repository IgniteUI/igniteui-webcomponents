import { html } from 'lit';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Stepper',
  component: 'igc-stepper',
  argTypes: {
    orientation: {
      type: '"vertical" | "horizontal"',
      description: 'Gets/Sets the orientation of the stepper.',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'horizontal',
    },
    stepType: {
      type: '"indicator" | "title" | "full"',
      description: 'Get/Set the type of the steps.',
      options: ['indicator', 'title', 'full'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'full',
    },
    linear: {
      type: 'boolean',
      description: 'Get/Set whether the stepper is linear.',
      control: 'boolean',
      defaultValue: false,
    },
    contentTop: {
      type: 'boolean',
      description: 'Get/Set whether the content is displayed above the steps.',
      control: 'boolean',
      defaultValue: false,
    },
    titlePosition: {
      type: '"start" | "end" | "top" | "bottom" | undefined',
      description: 'Get/Set the position of the steps title.',
      options: ['start', 'end', 'top', 'bottom', 'undefined'],
      control: {
        type: 'select',
      },
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
  orientation: 'vertical' | 'horizontal';
  stepType: 'indicator' | 'title' | 'full';
  linear: boolean;
  contentTop: boolean;
  titlePosition: 'start' | 'end' | 'top' | 'bottom' | undefined;
  size: 'small' | 'medium' | 'large';
}
// endregion
const BasicTemplate: Story<ArgTypes, Context> = (
  { orientation, stepType, titlePosition, linear, contentTop, size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <p>Test Top Content</p>
    <igc-stepper
      .orientation=${orientation}
      .stepType=${stepType}
      .titlePosition=${titlePosition}
      .linear=${linear}
      .contentTop=${contentTop}
      .size=${size}
      .dir=${direction}
    >
      <igc-step id="asd">
        <span slot="title">Title</span>
        <span slot="sub-title">subtitle</span>
        <span tabindex="0">
          Ut fermentum convallis odio nec suscipit. Quisque tempor, odio euismod
          aliquam dapibus, mi risus facilisis arcu, vitae dapibus massa orci non
          nisl. Quisque neque dolor, egestas vitae lectus non, eleifend gravida
          erat. Curabitur gravida malesuada arcu, non fermentum tortor porta
          luctus. Nulla sagittis massa sit amet ipsum sagittis efficitur. In
          volutpat cursus sapien et scelerisque. Praesent egestas velit vel
        </span>
        <input />
        <button>Asd</button>
      </igc-step>
      <igc-step active>
        <span slot="title">Long title Ut fermentum convallis</span>
        <span slot="sub-title">Long subtitle Ut fermentum</span>
        <span
          >Quisque neque dolor, egestas vitae lectus non, eleifend gravida erat.
          Curabitur gravida malesuada arcu, non fermentum tortor porta luctus.
          Nulla sagittis massa sit amet ipsum sagittis efficitur. In volutpat
          cursus sapien et scelerisque. Praesent egestas velit vel</span
        >
        <input />
      </igc-step>
      <igc-step>
        <span slot="indicator"><igc-icon name="home"></igc-icon></span>
        <span slot="title"> Title 3 </span>
        <span slot="sub-title">subtitle</span>
        <span
          >Quisque neque dolor, egestas vitae lectus non, eleifend gravida erat.
          Curabitur gravida malesuada arcu,
        </span>
        <input />
      </igc-step>
    </igc-stepper>
    <p>Test Bottom Content</p>
  `;
};

export const Basic = BasicTemplate.bind({});
