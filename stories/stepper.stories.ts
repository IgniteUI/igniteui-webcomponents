import { html } from 'lit';
import {
  IgcButtonComponent,
  IgcStepComponent,
  IgcStepperComponent,
} from '../src/index.js';
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
  const userDetailsInput = () => {
    const form = document.getElementById('userDetailsForm') as HTMLFormElement;
    const step = document.getElementById('step-1') as IgcStepComponent;
    const formValid = form.checkValidity();
    const nextButton = Array.from(step.querySelectorAll('igc-button')).find(
      (button: IgcButtonComponent) => button.textContent === 'Next'
    );
    nextButton!.disabled = linear && !formValid;
    step.invalid = !formValid;
    step.complete = formValid;
  };

  const deliveryAddressInput = () => {
    const form = document.getElementById('addressForm') as HTMLFormElement;
    const step = document.getElementById('step-2') as IgcStepComponent;
    const formValid = form.checkValidity();
    const nextButton = Array.from(step.querySelectorAll('igc-button')).find(
      (button: IgcButtonComponent) => button.textContent === 'Next'
    );
    nextButton!.disabled = linear && !formValid;
    step.invalid = !formValid;
    step.complete = formValid;
  };

  const cardDetailsInput = () => {
    const form = document.getElementById('cardDetailsForm') as HTMLFormElement;
    const step = document.getElementById('step-3') as IgcStepComponent;
    const disabledStep = document.getElementById('step-4') as IgcStepComponent;
    const optionalStep = document.getElementById('step-5') as IgcStepComponent;
    const formValid = form.checkValidity();
    const nextButton = Array.from(step.querySelectorAll('igc-button')).find(
      (button: IgcButtonComponent) => button.textContent === 'Next'
    );
    nextButton!.disabled = linear && !formValid;
    step.invalid = !formValid;
    step.complete = formValid;
    disabledStep.complete = formValid;
    optionalStep.complete = formValid;
  };

  const activeStepChanged = (ev: CustomEvent) => {
    if (ev.detail.index === 5) {
      populateLastForm();
    }
  };

  const populateLastForm = () => {
    const userForm = document.getElementById(
      'userDetailsForm'
    ) as HTMLFormElement;
    const addressForm = document.getElementById(
      'addressForm'
    ) as HTMLFormElement;
    const cardForm = document.getElementById(
      'cardDetailsForm'
    ) as HTMLFormElement;
    const additionalNotesForm = document.getElementById(
      'additionalNotesForm'
    ) as HTMLFormElement;
    const submitForm = document.getElementById('submitForm') as HTMLFormElement;
    (submitForm.elements[0] as HTMLInputElement).value = (
      userForm.elements[0] as HTMLInputElement
    ).value;
    (submitForm.elements[1] as HTMLInputElement).value = (
      userForm.elements[1] as HTMLInputElement
    ).value;
    (submitForm.elements[2] as HTMLInputElement).value = (
      userForm.elements[2] as HTMLInputElement
    ).value;
    (submitForm.elements[3] as HTMLInputElement).value = (
      addressForm.elements[0] as HTMLInputElement
    ).value;
    (submitForm.elements[4] as HTMLInputElement).value = (
      cardForm.elements[0] as HTMLInputElement
    ).value;
    (submitForm.elements[5] as HTMLInputElement).value = (
      cardForm.elements[1] as HTMLInputElement
    ).value;
    (submitForm.elements[6] as HTMLTextAreaElement).value = (
      additionalNotesForm.elements[0] as HTMLTextAreaElement
    ).value;
  };

  const navigateTo = (index: number) => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    if (index === 5) {
      populateLastForm();
    }
    stepper.navigateTo(index);
  };

  const next = () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    stepper.next();
  };

  const prev = () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    stepper.prev();
  };

  const submitAndReset = () => {
    const stepper = document.getElementById('stepper') as IgcStepperComponent;
    const form1 = document.getElementById('userDetailsForm') as HTMLFormElement;
    const form2 = document.getElementById('addressForm') as HTMLFormElement;
    const form3 = document.getElementById('cardDetailsForm') as HTMLFormElement;
    const form4 = document.getElementById(
      'additionalNotesForm'
    ) as HTMLFormElement;
    const form5 = document.getElementById('submitForm') as HTMLFormElement;
    form1.reset();
    form2.reset();
    form3.reset();
    form4.reset();
    form5.reset();
    stepper.steps.forEach((step: IgcStepComponent) => {
      step.invalid = true;
      step.complete = false;
    });
    stepper.reset();
    if (linear) {
      document.getElementsByTagName('igc-button')[0].disabled = true;
    }
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
      .size=${size}
      .dir=${direction}
      @igcActiveStepChanged=${activeStepChanged}
    >
      <igc-step id="step-1" invalid>
        <span slot="title">User Details</span>
        <span slot="subtitle">(Required)</span>
        <form id="userDetailsForm" @input=${userDetailsInput} novalidate>
          <label for="first-name">First Name:</label>
          <input type="text" id="first-name" name="first-name" required />
          <br /><br />
          <label for="last-name">Last Name:</label>
          <input type="text" id="last-name" name="last-name" required />
          <br /><br />
          <label for="phone">Phone:</label>
          <input type="number" id="phone" name="phone" required />
        </form>
        <br />
        <igc-button @click=${next} .disabled=${linear}>Next</igc-button>
      </igc-step>

      <igc-step id="step-2" invalid>
        <span slot="title">Delivery Address</span>
        <span slot="subtitle">(Required)</span>
        <form id="addressForm" @input=${deliveryAddressInput}>
          <label for="address">Address:</label>
          <input type="text" id="address" name="address" required />
        </form>
        <br />
        <igc-button @click=${prev}>Prev</igc-button>
        <igc-button @click=${next} .disabled=${linear}>Next</igc-button>
      </igc-step>

      <igc-step id="step-3" invalid>
        <span slot="title">Card Details</span>
        <span slot="subtitle">(Required)</span>
        <form id="cardDetailsForm" @input=${cardDetailsInput}>
          <label for="card-number">Card Number:</label>
          <input type="number" id="card-number" name="card-number" required />
          <br /><br />
          <label for="ccv">CCV:</label>
          <input type="number" id="ccv" name="ccv" required />
        </form>
        <br />
        <igc-button @click=${prev}>Prev</igc-button>
        <igc-button @click=${next} .disabled=${linear}>Next</igc-button>
      </igc-step>

      <igc-step id="step-4" disabled>
        <span slot="title">Payment method</span>
        <span slot="subtitle">Currently you can pay only cash</span>
      </igc-step>

      <igc-step id="step-5">
        <span slot="title">Additional Notes</span>
        <span slot="subtitle">(Optional)</span>
        <form id="additionalNotesForm">
          <textarea name="additional-notes" rows="5" cols="30">
Add your note here...
          </textarea
          >
        </form>
        <br />
        <igc-button @click=${prev}>Prev</igc-button>
        <igc-button @click=${() => navigateTo(5)}>Next</igc-button>
      </igc-step>

      <igc-step id="step-6" invalid>
        <span slot="title">Finish Order</span>
        <span slot="subtitle">(#12542653)</span>
        <h2>Please check your info and submit!</h2>
        <form id="submitForm">
          <label for="first-name-submit">First Name:</label>
          <input
            disabled
            type="text"
            id="first-name-submit"
            name="first-name-submit"
          />
          <br /><br />
          <label for="last-name-submit">Last Name:</label>
          <input
            disabled
            type="text"
            id="last-name-submit"
            name="last-name-submit"
          />
          <br /><br />
          <label for="phone-submit">Phone:</label>
          <input disabled type="number" id="phone-submit" name="phone-submit" />
          <br /><br />
          <label for="address-submit">Address:</label>
          <input
            disabled
            type="text"
            id="address-submit"
            name="address-submit"
          />
          <br /><br />
          <label for="card-number-submit">Card Number:</label>
          <input
            disabled
            type="number"
            id="card-number-submit"
            name="card-number-submit"
          />
          <br /><br />
          <label for="ccv-submit">CCV:</label>
          <input disabled type="number" id="ccv-submit" name="ccv-submit" />
          <br /><br />
          <label for="additional-notes-submit">Additional Notes:</label>
          <textarea
            disabled
            name="additional-notes-submit"
            id="additional-notes-submit"
            rows="2"
            cols="30"
          >
Add your note here...
          </textarea
          >
        </form>
        <br />
        <igc-button @click=${() => navigateTo(4)}>Prev</igc-button>
        <igc-button @click=${submitAndReset}>Submit & Reset</igc-button>
      </igc-step>
    </igc-stepper>

    <span>test content bottom</span>
  `;
};

export const Basic = BasicTemplate.bind({});
