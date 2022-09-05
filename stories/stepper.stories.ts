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
      defaultValue: 'bottom',
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
    <span style="background: #f9f9f9; display: block; margin-bottom: 20px;"
      >EBASI TOP SHITAAAAAAAAAA</span
    >
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
          pharetra suscipit. Maecenas bibendum magna nunc, auctor luctus justo
          sagittis in. Proin et arcu sed turpis tempus varius vel in neque.
          Nulla pulvinar, odio sit amet vestibulum congue, est enim scelerisque
          diam, placerat luctus nisl erat sit amet augue. Integer pulvinar
          fringilla ultrices. Maecenas scelerisque odio nibh, sit amet euismod
          leo lobortis quis. Vestibulum pharetra nisi urna.
        </span>
        <input />
        <button>Asd</button>
      </igc-step>
      <igc-step active>
        <span slot="title">Title</span>
        <span slot="sub-title">subtitle</span>
        <span>STEP 2 CONTENT</span>
        <input />
      </igc-step>
      <igc-step>
        <span slot="indicator"><input /></span>
        <span slot="title">Title</span>
        <span slot="sub-title">subtitle</span>
        <span>STEP 3 CONTENT</span>
        <input />
      </igc-step>
    </igc-stepper>
    <span style="background: #f9f9f9; display: block; margin-top: 20px;"
      >EBASI BOTTOM SHITAAAAAAAAAA</span
    >
  `;
};

export const Basic = BasicTemplate.bind({});
