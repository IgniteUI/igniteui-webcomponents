import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcInputComponent,
  type IgcStepComponent,
  IgcStepperComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

// region default
const metadata: Meta<IgcStepperComponent> = {
  title: 'Stepper',
  component: 'igc-stepper',
  parameters: {
    docs: {
      description: {
        component:
          'A stepper component that provides a wizard-like workflow by dividing content into logical steps.',
      },
    },
    actions: { handles: ['igcActiveStepChanging', 'igcActiveStepChanged'] },
  },
  argTypes: {
    orientation: {
      type: '"horizontal" | "vertical"',
      description: 'The orientation of the stepper.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    stepType: {
      type: '"full" | "indicator" | "title"',
      description: 'The visual type of the steps.',
      options: ['full', 'indicator', 'title'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'full' } },
    },
    linear: {
      type: 'boolean',
      description: 'Whether the stepper is linear.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    contentTop: {
      type: 'boolean',
      description: 'Whether the content is displayed above the steps.',
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
        'The animation duration in either vertical or horizontal mode in milliseconds.',
      control: 'number',
      table: { defaultValue: { summary: '320' } },
    },
    titlePosition: {
      type: '"auto" | "bottom" | "top" | "end" | "start"',
      description: 'The position of the steps title.',
      options: ['auto', 'bottom', 'top', 'end', 'start'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'auto' } },
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
    titlePosition: 'auto',
  },
};

export default metadata;

interface IgcStepperArgs {
  /** The orientation of the stepper. */
  orientation: 'horizontal' | 'vertical';
  /** The visual type of the steps. */
  stepType: 'full' | 'indicator' | 'title';
  /** Whether the stepper is linear. */
  linear: boolean;
  /** Whether the content is displayed above the steps. */
  contentTop: boolean;
  /** The animation type when in vertical mode. */
  verticalAnimation: 'grow' | 'fade' | 'none';
  /** The animation type when in horizontal mode. */
  horizontalAnimation: 'slide' | 'fade' | 'none';
  /** The animation duration in either vertical or horizontal mode in milliseconds. */
  animationDuration: number;
  /** The position of the steps title. */
  titlePosition: 'auto' | 'bottom' | 'top' | 'end' | 'start';
}
type Story = StoryObj<IgcStepperArgs>;

// endregion

export const Basic: Story = {
  render: (args) => html`
    <igc-stepper
      .orientation=${args.orientation}
      .stepType=${args.stepType}
      .titlePosition=${args.titlePosition}
      .linear=${args.linear}
      .contentTop=${args.contentTop}
      .animationDuration=${args.animationDuration}
      .verticalAnimation=${args.verticalAnimation}
      .horizontalAnimation=${args.horizontalAnimation}
    >
      <igc-step>
        <span slot="title">Personal Info</span>
        <span slot="subtitle">Enter your name</span>
        <p>Please provide your personal information to get started.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Address</span>
        <span slot="subtitle">Where do you live?</span>
        <p>Enter your shipping address for delivery.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Payment</span>
        <span slot="subtitle">Billing details</span>
        <p>Add your preferred payment method.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Confirmation</span>
        <span slot="subtitle">Review your order</span>
        <p>Please review all information before submitting.</p>
      </igc-step>
    </igc-stepper>
  `,
};

export const VerticalOrientation: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <igc-stepper orientation="vertical">
      <igc-step>
        <span slot="title">Account Setup</span>
        <span slot="subtitle">Create your login credentials</span>
        <p>Choose a username and a strong password for your account.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Profile Details</span>
        <span slot="subtitle">Tell us about yourself</span>
        <p>Fill in your profile details so others can learn more about you.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Preferences</span>
        <span slot="subtitle">Customize your experience</span>
        <p>Select your notification preferences and display settings.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Finish</span>
        <span slot="subtitle">You're all set!</span>
        <p>Your account is ready. Click finish to start using the app.</p>
      </igc-step>
    </igc-stepper>
  `,
};

export const StepStates: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <igc-stepper>
      <igc-step complete>
        <span slot="title">Completed</span>
        <span slot="subtitle">This step is done</span>
        <p>This step has been completed successfully.</p>
      </igc-step>

      <igc-step active invalid>
        <span slot="title">Invalid</span>
        <span slot="subtitle">Has validation errors</span>
        <p>This step has validation errors that need to be resolved.</p>
      </igc-step>

      <igc-step optional>
        <span slot="title">Optional</span>
        <span slot="subtitle">Can be skipped</span>
        <p>This step is optional and can be skipped.</p>
      </igc-step>

      <igc-step disabled>
        <span slot="title">Disabled</span>
        <span slot="subtitle">Not accessible</span>
        <p>This step is disabled and cannot be interacted with.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Default</span>
        <span slot="subtitle">Normal step</span>
        <p>A regular step with no special state.</p>
      </igc-step>
    </igc-stepper>
  `,
};

export const LinearMode: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    function checkValidity(event: Event) {
      const stepper = event.currentTarget as IgcStepperComponent;
      const activeStep = stepper.steps.find(
        (step) => step.active
      ) as IgcStepComponent;
      const form = activeStep?.querySelector('form');

      if (!form || activeStep?.optional) {
        return;
      }

      activeStep.invalid = !form.checkValidity();
    }

    return html`
      <igc-stepper
        linear
        @igcInput=${checkValidity}
        @igcChange=${checkValidity}
      >
        <igc-step invalid>
          <span slot="title">First Name</span>
          <span slot="subtitle">Required</span>
          <form>
            <igc-input label="First Name" name="first-name" required>
              <p slot="helper-text">Enter your first name to proceed</p>
            </igc-input>
          </form>
        </igc-step>

        <igc-step invalid>
          <span slot="title">Last Name</span>
          <span slot="subtitle">Required</span>
          <form>
            <igc-input label="Last Name" name="last-name" required>
              <p slot="helper-text">Enter your last name to proceed</p>
            </igc-input>
          </form>
        </igc-step>

        <igc-step optional>
          <span slot="title">Nickname</span>
          <span slot="subtitle">Optional</span>
          <form>
            <igc-input label="Nickname" name="nickname"></igc-input>
          </form>
        </igc-step>

        <igc-step>
          <span slot="title">Done</span>
          <span slot="subtitle">Review</span>
          <p>All steps completed. Review your information.</p>
        </igc-step>
      </igc-stepper>
    `;
  },
};

export const ContentTop: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <igc-stepper content-top>
      <igc-step>
        <span slot="title">Step 1</span>
        <p>Content displayed above the step headers.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Step 2</span>
        <p>The content area appears at the top of the stepper.</p>
      </igc-step>

      <igc-step>
        <span slot="title">Step 3</span>
        <p>
          This layout is useful when the headers should anchor to the bottom.
        </p>
      </igc-step>
    </igc-stepper>
  `,
};

export const StepTypes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <h3>Full (indicator + title)</h3>
    <igc-stepper step-type="full">
      <igc-step complete>
        <span slot="title">Step 1</span>
        <span slot="subtitle">Subtitle</span>
        <p>Full step type shows both indicator and title.</p>
      </igc-step>
      <igc-step active>
        <span slot="title">Step 2</span>
        <span slot="subtitle">Subtitle</span>
        <p>This is the active step.</p>
      </igc-step>
      <igc-step>
        <span slot="title">Step 3</span>
        <span slot="subtitle">Subtitle</span>
        <p>Upcoming step.</p>
      </igc-step>
    </igc-stepper>

    <h3>Indicator only</h3>
    <igc-stepper step-type="indicator">
      <igc-step complete>
        <span slot="title">Step 1</span>
        <p>Only the step indicator is visible in the header.</p>
      </igc-step>
      <igc-step active>
        <span slot="title">Step 2</span>
        <p>This is the active step.</p>
      </igc-step>
      <igc-step>
        <span slot="title">Step 3</span>
        <p>Upcoming step.</p>
      </igc-step>
    </igc-stepper>

    <h3>Title only</h3>
    <igc-stepper step-type="title">
      <igc-step complete>
        <span slot="title">Step 1</span>
        <p>Only the step title is visible in the header.</p>
      </igc-step>
      <igc-step active>
        <span slot="title">Step 2</span>
        <p>This is the active step.</p>
      </igc-step>
      <igc-step>
        <span slot="title">Step 3</span>
        <p>Upcoming step.</p>
      </igc-step>
    </igc-stepper>
  `,
};

export const ProgrammaticNavigation: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    function navigate(action: 'prev' | 'next' | 'reset') {
      const stepper = document.querySelector(
        '#programmatic-stepper'
      ) as IgcStepperComponent;

      switch (action) {
        case 'prev':
          stepper.prev();
          break;
        case 'next':
          stepper.next();
          break;
        case 'reset':
          stepper.reset();
          break;
      }
    }

    return html`
      <div style="margin-bottom: 16px; display: flex; gap: 8px;">
        <igc-button @click=${() => navigate('prev')}>Previous</igc-button>
        <igc-button @click=${() => navigate('next')}>Next</igc-button>
        <igc-button @click=${() => navigate('reset')}>Reset</igc-button>
      </div>

      <igc-stepper id="programmatic-stepper">
        <igc-step>
          <span slot="title">Step 1</span>
          <p>
            Use the buttons above to navigate between steps programmatically.
          </p>
        </igc-step>

        <igc-step>
          <span slot="title">Step 2</span>
          <p>
            The <code>next()</code> and <code>prev()</code> methods activate
            adjacent steps.
          </p>
        </igc-step>

        <igc-step>
          <span slot="title">Step 3</span>
          <p>The <code>reset()</code> method returns to the first step.</p>
        </igc-step>

        <igc-step>
          <span slot="title">Step 4</span>
          <p>
            This is the last step. Press "Next" to cycle back or "Reset" to
            start over.
          </p>
        </igc-step>
      </igc-stepper>
    `;
  },
};
