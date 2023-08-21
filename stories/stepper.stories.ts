import { html } from 'lit';
import { Context } from './story.js';
import {
  defineComponents,
  IgcButtonComponent,
  IgcStepperComponent,
} from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcStepperComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcStepperComponent> = {
  title: 'Stepper',
  component: 'igc-stepper',
  parameters: {
    docs: {
      description: {
        component:
          'IgxStepper provides a wizard-like workflow by dividing content into logical steps.',
      },
    },
  },
  argTypes: {
    orientation: {
      type: '"vertical" | "horizontal"',
      description: 'Gets/Sets the orientation of the stepper.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      defaultValue: 'horizontal',
    },
    stepType: {
      type: '"indicator" | "title" | "full"',
      description: 'Get/Set the type of the steps.',
      options: ['indicator', 'title', 'full'],
      control: { type: 'inline-radio' },
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
    verticalAnimation: {
      type: '"none" | "grow" | "fade"',
      description: 'The animation type when in vertical mode.',
      options: ['none', 'grow', 'fade'],
      control: { type: 'inline-radio' },
      defaultValue: 'grow',
    },
    horizontalAnimation: {
      type: '"none" | "fade" | "slide"',
      description: 'The animation type when in horizontal mode.',
      options: ['none', 'fade', 'slide'],
      control: { type: 'inline-radio' },
      defaultValue: 'slide',
    },
    animationDuration: {
      type: 'number',
      description:
        'The animation duration in either vertical or horizontal mode.',
      control: 'number',
      defaultValue: 350,
    },
    titlePosition: {
      type: '"start" | "end" | "top" | "bottom" | undefined',
      description: 'Get/Set the position of the steps title.',
      options: ['start', 'end', 'top', 'bottom', 'undefined'],
      control: { type: 'select' },
    },
  },
  args: {
    orientation: 'horizontal',
    stepType: 'full',
    linear: false,
    contentTop: false,
    verticalAnimation: 'grow',
    horizontalAnimation: 'slide',
    animationDuration: 350,
  },
};

export default metadata;

interface IgcStepperArgs {
  /** Gets/Sets the orientation of the stepper. */
  orientation: 'vertical' | 'horizontal';
  /** Get/Set the type of the steps. */
  stepType: 'indicator' | 'title' | 'full';
  /** Get/Set whether the stepper is linear. */
  linear: boolean;
  /** Get/Set whether the content is displayed above the steps. */
  contentTop: boolean;
  /** The animation type when in vertical mode. */
  verticalAnimation: 'none' | 'grow' | 'fade';
  /** The animation type when in horizontal mode. */
  horizontalAnimation: 'none' | 'fade' | 'slide';
  /** The animation duration in either vertical or horizontal mode. */
  animationDuration: number;
  /** Get/Set the position of the steps title. */
  titlePosition: 'start' | 'end' | 'top' | 'bottom' | undefined;
}
type Story = StoryObj<IgcStepperArgs>;

// endregion
const BasicTemplate = (
  {
    orientation,
    stepType,
    titlePosition,
    linear,
    contentTop,
    animationDuration,
    verticalAnimation,
    horizontalAnimation,
  }: IgcStepperArgs,
  { globals: { direction } }: Context
) => {
  const next = () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    stepper.next();
  };

  const prev = () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    stepper.prev();
  };

  return html`
    <span>test content top</span>

    <igc-stepper
      id="stepper"
      .orientation=${orientation}
      .stepType=${stepType}
      .titlePosition=${titlePosition}
      .linear=${linear}
      .contentTop=${contentTop}
      .dir=${direction}
      .animationDuration=${animationDuration}
      .verticalAnimation=${verticalAnimation}
      .horizontalAnimation=${horizontalAnimation}
    >
      <igc-step>
        <span slot="title">Step1</span>
        <label for="first-name">First Name:</label>
        <input type="text" id="first-name" name="first-name" required />
        <br /><br />
        <igc-button @click=${next}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 2</span>
        <label for="last-name">Last Name:</label>
        <input type="text" id="last-name" name="last-name" required />
        <br /><br />
        <igc-button @click=${prev}>Prev</igc-button>
        <igc-button @click=${next}>Next</igc-button>
      </igc-step>

      <igc-step optional>
        <span slot="title">Step 3</span>
        <span slot="subtitle">(Optional)</span>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        soluta nulla asperiores, officia ullam recusandae voluptatem omnis
        perferendis vitae non magni magnam praesentium placeat nemo quas
        repudiandae. Nisi, quo ex!
        <br /><br />
        <igc-button @click=${prev}>Prev</igc-button>
        <igc-button @click=${next}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 4</span>
        <div tabindex="0">
          Tabbable content
          <br />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          soluta nulla asperiores, officia ullam recusandae voluptatem omnis
          perferendis vitae non magni magnam praesentium placeat nemo quas
          repudiandae. Nisi, quo ex!
        </div>
        <br />
        <igc-button @click=${prev}>Prev</igc-button>
      </igc-step>
    </igc-stepper>

    <span>test content bottom</span>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
