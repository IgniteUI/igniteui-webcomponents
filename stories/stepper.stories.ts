import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcInputComponent,
  type IgcStepComponent,
  IgcStepperComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

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
    actions: { handles: ['igcActiveStepChanging', 'igcActiveStepChanged'] },
  },
  argTypes: {
    orientation: {
      type: '"horizontal" | "vertical"',
      description: 'Gets/Sets the orientation of the stepper.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    stepType: {
      type: '"indicator" | "title" | "full"',
      description: 'Get/Set the type of the steps.',
      options: ['indicator', 'title', 'full'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'full' } },
    },
    linear: {
      type: 'boolean',
      description: 'Get/Set whether the stepper is linear.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    contentTop: {
      type: 'boolean',
      description: 'Get/Set whether the content is displayed above the steps.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    verticalAnimation: {
      type: '"grow" | "fade" | "none"',
      description: 'The animation type when in vertical mode.',
      options: ['grow', 'fade', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'grow' } },
    },
    horizontalAnimation: {
      type: '"slide" | "fade" | "none"',
      description: 'The animation type when in horizontal mode.',
      options: ['slide', 'fade', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
    animationDuration: {
      type: 'number',
      description:
        'The animation duration in either vertical or horizontal mode.',
      control: 'number',
      table: { defaultValue: { summary: '320' } },
    },
    titlePosition: {
      type: '"bottom" | "top" | "end" | "start"',
      description: 'Get/Set the position of the steps title.',
      options: ['bottom', 'top', 'end', 'start'],
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
    animationDuration: 320,
  },
};

export default metadata;

interface IgcStepperArgs {
  /** Gets/Sets the orientation of the stepper. */
  orientation: 'horizontal' | 'vertical';
  /** Get/Set the type of the steps. */
  stepType: 'indicator' | 'title' | 'full';
  /** Get/Set whether the stepper is linear. */
  linear: boolean;
  /** Get/Set whether the content is displayed above the steps. */
  contentTop: boolean;
  /** The animation type when in vertical mode. */
  verticalAnimation: 'grow' | 'fade' | 'none';
  /** The animation type when in horizontal mode. */
  horizontalAnimation: 'slide' | 'fade' | 'none';
  /** The animation duration in either vertical or horizontal mode. */
  animationDuration: number;
  /** Get/Set the position of the steps title. */
  titlePosition: 'bottom' | 'top' | 'end' | 'start';
}
type Story = StoryObj<IgcStepperArgs>;

// endregion
const BasicTemplate = ({
  orientation,
  stepType,
  titlePosition,
  linear,
  contentTop,
  animationDuration,
  verticalAnimation,
  horizontalAnimation,
}: IgcStepperArgs) => {
  document.addEventListener('DOMContentLoaded', () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;

    stepper.addEventListener('igcInput', () => {
      checkValidity();
    });
    stepper.addEventListener('igcChange', () => {
      checkValidity();
    });
  });

  function checkValidity() {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    const activeStep = stepper.steps.find(
      (step) => step.active
    ) as IgcStepComponent;
    const form = activeStep!.querySelector('form') as HTMLFormElement;
    const isFormInvalid = !form.checkValidity();

    if (activeStep!.optional) {
      return;
    }

    if (stepper.linear) {
      activeStep!.invalid = isFormInvalid;
    }
  }

  return html`
    <igc-stepper
      id="stepper"
      .orientation=${orientation}
      .stepType=${stepType}
      .titlePosition=${titlePosition}
      .linear=${linear}
      .contentTop=${contentTop}
      .animationDuration=${animationDuration}
      .verticalAnimation=${verticalAnimation}
      .horizontalAnimation=${horizontalAnimation}
    >
      <igc-step invalid>
        <span slot="title">Step1</span>
        <span slot="subtitle">(completed)</span>
        <form id="form">
          <igc-input
            label="First Name"
            id="first-name"
            name="first-name"
            required
          ></igc-input>
        </form>
      </igc-step>

      <igc-step invalid>
        <span slot="title">Step 2</span>
        <span slot="subtitle">(default)</span>
        <form id="form">
          <igc-input
            label="Last Name"
            id="last-name"
            name="last-name"
            required
          ></igc-input>
        </form>
      </igc-step>

      <igc-step optional>
        <span slot="title">Step 3</span>
        <span slot="subtitle">(Optional)</span>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        soluta nulla asperiores, officia ullam recusandae voluptatem omnis
        perferendis vitae non magni magnam praesentium placeat nemo quas
        repudiandae. Nisi, quo ex!
      </igc-step>

      <igc-step disabled>
        <span slot="title">Step 4</span>
        <span slot="subtitle">(disabled)</span>
        <div tabindex="0">
          Tabbable content
          <br />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          soluta nulla asperiores, officia ullam recusandae voluptatem omnis
          perferendis vitae non magni magnam praesentium placeat nemo quas
          repudiandae. Nisi, quo ex!
        </div>
        <br />
      </igc-step>
    </igc-stepper>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
