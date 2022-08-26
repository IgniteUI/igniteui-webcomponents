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
    titlePosition: {
      type: '"start" | "end" | "top" | "bottom"',
      description: 'Get/Set the position of the steps title.',
      options: ['start', 'end', 'top', 'bottom'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'end',
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
  titlePosition: 'start' | 'end' | 'top' | 'bottom';
  linear: boolean;
  contentTop: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion
const BasicTemplate: Story<ArgTypes, Context> = (
  { orientation, stepType, titlePosition, linear, contentTop, size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-stepper
      .orientation=${orientation}
      .stepType=${stepType}
      .titlePosition=${titlePosition}
      .linear=${linear}
      .contentTop=${contentTop}
      .size=${size}
      .dir=${direction}
    >
      <igc-step>
        <span slot="indicator">Indicator 1</span>
        <span slot="title">Step1</span>
        <span slot="sub-title">Step subtitle 1</span>
        <span>STEP 1 CONTENT</span>
      </igc-step>
      <igc-step>
        <!-- <span slot="indicator">Indicator 2</span> -->
        <span slot="title">Step2</span>
        <span slot="sub-title">Step subtitle 2</span>
        <span>STEP 2 CONTENT</span>
      </igc-step>
      <igc-step>
        <span slot="indicator">Indicator 3</span>
        <span slot="title">Step3</span>
        <span slot="sub-title">Step subtitle 3</span>
        <span>STEP 3 CONTENT</span>
      </igc-step>
    </igc-stepper>
  `;
};

export const Basic = BasicTemplate.bind({});
