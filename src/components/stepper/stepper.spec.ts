import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated } from '../common/helpers.spec.js';
import IgcStepComponent from './step.js';
import IgcStepperComponent from './stepper.js';
import {
  linearModeStepper,
  PARTS,
  SLOTS,
  StepperTestFunctions,
  simpleStepper,
  stepperActiveDisabledSteps,
} from './stepper-utils.spec.js';

describe('Stepper', () => {
  beforeAll(() => {
    defineComponents(IgcStepperComponent);
  });

  let stepper: IgcStepperComponent;
  let spy: MockInstance;

  describe('Basic', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
    });

    it('Should render a horizontal stepper containing a sequence of steps', async () => {
      // stepper.steps should return all steps
      expect(stepper.steps.length).to.equal(5);
      expect(stepper).to.contain('igc-step');

      expect(stepper.getAttribute('orientation')).to.not.be.null;
      expect(stepper.getAttribute('orientation')).to.equal('horizontal');

      // Verify step slots are rendered successfully and elements are correctly displayed.
      stepper.steps.forEach((step, index) => {
        const indicatorSlot = StepperTestFunctions.getSlot(
          step,
          SLOTS.indicator
        );
        expect(indicatorSlot).not.to.be.null;
        const titleSlot = StepperTestFunctions.getSlot(step, SLOTS.title);
        expect(titleSlot).not.to.be.null;
        // the last slot is unnamed and is where the step content is rendered
        const slots = step.shadowRoot!.querySelectorAll('slot');
        const childrenSlot = Array.from(slots).filter(
          (s) => s.name === ''
        )[0] as HTMLSlotElement;
        expect(childrenSlot).not.to.be.null;
        expect(childrenSlot.assignedElements()[0].textContent).to.equal(
          `STEP ${index + 1} CONTENT`
        );
      });
    });

    it('Should expand a step through API by activating it', async () => {
      const step = stepper.steps[1];

      stepper.navigateTo(1);
      await elementUpdated(stepper);

      expect(step.active).to.be.true;
      expect(step).to.have.attribute('active');
    });

    it('Should expand a step through UI by activating it', async () => {
      const step = stepper.steps[1];
      const stepHeader = step.shadowRoot!.querySelector(
        PARTS.header
      ) as HTMLElement;

      stepHeader?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(stepper);

      expect(step.active).to.be.true;
      expect(step).to.have.attribute('active');
    });

    it('Should not allow activating a step with the next/prev methods when disabled is set to true', async () => {
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      step1.disabled = true;
      await elementUpdated(stepper);

      expect(step1).to.have.attribute('disabled');

      stepper.next();
      expect(step1.active).to.be.false;
      expect(step2.active).to.be.true;

      stepper.prev();
      expect(step1.active).to.be.false;
      expect(step0.active).to.be.true;
    });

    it('Should do nothing when all steps are not accessible and next/prev methods are called', async () => {
      stepper.steps[1].active = true;
      stepper.steps.forEach((step) => {
        step.disabled = true;
      });
      await elementUpdated(stepper);

      stepper.next();
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.true;

      stepper.prev();
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.true;
    });

    it('Should not allow activating more than one step at a time', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperActiveDisabledSteps
      );
      // the first two steps are set to be active initially
      // should be activated only the last one
      expect(stepper.steps[0].active).to.be.false;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('Should not change the active step when the navigateTo method is called with a mismatched index', async () => {
      stepper.navigateTo(999);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[0]).to.have.attribute('active');
    });

    it('Should properly set the active state of the steps when the active step is removed dynamically', async () => {
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];

      expect(step0.active).to.be.true;

      stepper.removeChild(step0);
      await elementUpdated(stepper);

      expect(step1.active).to.be.true;
    });

    it('Should activate a step when it is set to be active and disabled initially', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperActiveDisabledSteps
      );

      // the step at index 1 is set to be disabled and active initially
      expect(stepper.steps[1].disabled).to.be.true;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('Should properly set the active step of the stepper when an active step is added dynamically', async () => {
      // initially the step at index 0 is the active step
      expect(stepper.steps[0].active).to.be.true;

      const newStepAtIndex0 = document.createElement(IgcStepComponent.tagName);
      newStepAtIndex0.active = true;

      // add an active step before the currently active step in the stepper
      stepper.prepend(newStepAtIndex0);
      await elementUpdated(stepper);

      // the newly added step shouldn't be the active step of the stepper
      expect(newStepAtIndex0.active).to.be.false;
      expect(newStepAtIndex0.visited).to.be.false;
      expect(stepper.steps[1].active).to.be.true;

      const newStepAtIndex2 = document.createElement(IgcStepComponent.tagName);
      newStepAtIndex2.active = true;

      // add an active step after the currently active step in the stepper
      stepper.insertBefore(newStepAtIndex2, stepper.steps[2]);
      await elementUpdated(stepper);

      // the newly added step should be the active step of the stepper
      expect(newStepAtIndex2.active).to.be.true;
      expect(newStepAtIndex2.visited).to.be.true;
      expect(stepper.steps[1].active).to.be.false;
    });

    it('Should emit ing and ed events when a step is activated through UI', async () => {
      spy = vi.spyOn(stepper, 'emitEvent');
      await elementUpdated(stepper);

      const argsIng = {
        detail: {
          owner: stepper,
          oldIndex: 0,
          newIndex: 1,
        },
        cancelable: true,
      };

      const argsEd = {
        detail: {
          owner: stepper,
          index: 1,
        },
      };

      const stepHeader = stepper.steps[1].shadowRoot!.querySelector(
        PARTS.header
      ) as HTMLElement;
      stepHeader?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(stepper);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'igcActiveStepChanging', argsIng);
      expect(spy).toHaveBeenNthCalledWith(2, 'igcActiveStepChanged', argsEd);
    });

    it('Should not emit events when a step is activated through API', async () => {
      spy = vi.spyOn(stepper, 'emitEvent');
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;

      stepper.next();
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.true;
      expect(spy).toHaveBeenCalledTimes(0);

      stepper.prev();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(spy).toHaveBeenCalledTimes(0);

      stepper.navigateTo(2);
      await elementUpdated(stepper);

      expect(stepper.steps[2].active).to.be.true;
      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('Should be able to cancel the igcActiveStepChanging event', async () => {
      stepper.addEventListener('igcActiveStepChanging', (event) => {
        event.preventDefault();
      });

      const stepHeader = stepper.steps[1].shadowRoot!.querySelector(
        PARTS.header
      ) as HTMLElement;
      stepHeader?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.false;
      expect(stepper.steps[0].active).to.be.true;
    });

    it('Should not mark a step as visited if it has not been activated before', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperActiveDisabledSteps
      );
      // two steps are set to be active initially
      expect(stepper.steps[0].visited).to.be.false;
      expect(stepper.steps[1].visited).to.be.true;

      stepper.steps[3].active = true;
      await elementUpdated(stepper);

      // the step at index 2 has not been activated before
      expect(stepper.steps[2].visited).to.be.false;

      const newStep = document.createElement(IgcStepComponent.tagName);
      stepper.insertBefore(newStep, stepper.steps[3]);
      await elementUpdated(stepper);

      // the newly added step is inserted before the active step and has not been activated yet
      expect(newStep.visited).to.be.false;
    });

    it('Should determine the steps that are marked as visited based on the active step in linear mode', async () => {
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];
      const step4 = stepper.steps[4];

      step4.active = true;
      await elementUpdated(stepper);

      expect(step4.visited).to.be.true;

      step2.active = true;
      await elementUpdated(stepper);

      // when linear mode is enabled all steps before the active one should be marked as visited
      // and all steps after that as not visited
      stepper.linear = true;
      await elementUpdated(stepper);

      expect(step4.visited).to.be.false;
      expect(step1.visited).to.be.true;
    });

    it('Should activate the first accessible step and clear the visited steps collection when the stepper is reset', async () => {
      // "visit" some steps
      for (const step of stepper.steps) {
        step.active = true;
        await elementUpdated(stepper);
        expect(step.visited).to.be.true;
      }

      stepper.reset();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[0].visited).to.be.true;

      expect(stepper.steps[1].visited).to.be.false;
      expect(stepper.steps[2].visited).to.be.false;
    });

    it('Should determine the steps that are disabled in linear mode based on the validity of the active step', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      // the optional state is set to true initially
      step0.optional = false;
      await elementUpdated(stepper);

      for (let i = 1; i < stepper.steps.length; i++) {
        expect(stepper.steps[i].isAccessible).to.be.false;
      }

      step0.invalid = false;
      await elementUpdated(stepper);

      expect(step1.isAccessible).to.be.true;
      expect(step2.isAccessible).to.be.false;

      step1.invalid = false;
      await elementUpdated(stepper);

      expect(step2.isAccessible).to.be.true;
    });

    it('Should not allow moving forward to the next step in linear mode if the previous step is invalid', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      // the optional state is set to true initially
      step0.optional = false;
      await elementUpdated(stepper);

      expect(step0.invalid).to.be.true;
      expect(step0).to.have.attribute('invalid');

      stepper.next();
      await elementUpdated(stepper);

      expect(step1.active).to.be.false;
      expect(step0.active).to.be.true;
      expect(step1.linearDisabled).to.be.true;
      expect(step2.linearDisabled).to.be.true;
    });

    it('Should set a step to be accessible in linear mode if the previous accessible step is being disabled', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      stepper.steps[0].invalid = false;
      await elementUpdated(stepper);

      expect(stepper.steps[1].isAccessible).to.be.true;
      expect(stepper.steps[2].isAccessible).to.be.false;

      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      expect(stepper.steps[2].isAccessible).to.be.true;
    });

    it('Should set a step to be not accessible in linear mode if before it is inserted a new invalid step', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];

      step0.invalid = false;
      await elementUpdated(stepper);

      expect(step1.isAccessible).to.be.true;

      const newStep = document.createElement(IgcStepComponent.tagName);
      newStep.invalid = true;
      await elementUpdated(stepper);

      stepper.insertBefore(newStep, step1);
      await elementUpdated(stepper);

      expect(newStep.isAccessible).to.be.true;
      expect(step1.isAccessible).to.be.false;
    });

    it('Should properly set the linear disabled steps when the active step is removed from the DOM', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      step0.invalid = false;
      step1.active = true;
      await elementUpdated(stepper);

      expect(step2.isAccessible).to.be.false;

      stepper.removeChild(step1);
      await elementUpdated(stepper);

      expect(step0.active).to.be.true;
      expect(step2.isAccessible).to.be.true;
    });

    it('Should set a step to be accessible if the previous one is being removed from the DOM and was accessible before that', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      step0.invalid = false;
      await elementUpdated(stepper);

      expect(step1.isAccessible).to.be.true;
      expect(step2.isAccessible).to.be.false;

      stepper.removeChild(step1);
      await elementUpdated(stepper);

      expect(step2.isAccessible).to.be.true;
    });

    it('Should set a newly added step to be accessible if is inserted before the active step', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      const newStep = document.createElement(IgcStepComponent.tagName);
      await elementUpdated(stepper);

      stepper.prepend(newStep);

      expect(newStep.isAccessible).to.be.true;
    });

    it("Should not set previous steps to be accessible if a linear disabled step's invalid or disabled states are changed through API", async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);

      // the optional state is set to true initially
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      stepper.navigateTo(2);
      await elementUpdated(stepper);

      // the step at index 1 should not be accessible because the previous one is required and invalid
      expect(stepper.steps[1].isAccessible).to.be.false;

      stepper.steps[2].disabled = true;
      await elementUpdated(stepper);

      expect(stepper.steps[1].isAccessible).to.be.false;

      stepper.steps[2].invalid = true;
      await elementUpdated(stepper);

      expect(stepper.steps[1].isAccessible).to.be.false;
    });

    it('Should set a step to be accessible in linear mode if the previous one is accessible and optional', async () => {
      stepper =
        await StepperTestFunctions.createStepperElement(linearModeStepper);
      // the step at index 0 is set to be invalid and optional initially
      expect(stepper.steps[1].isAccessible).to.be.true;

      // test whether a step will become accessible when the previous step is invalid but is accessible and optional
      stepper.steps[1].optional = true;
      await elementUpdated(stepper);
      expect(stepper.steps[2].isAccessible).to.be.true;
    });
  });

  describe('Appearance', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
    });

    it('Should apply the appropriate attribute to a stepper in a horizontal and vertical orientation', async () => {
      expect(stepper.orientation).to.equal('horizontal');

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      expect(stepper.attributes.getNamedItem('orientation')?.value).to.equal(
        'vertical'
      );

      stepper.orientation = 'horizontal';
      await elementUpdated(stepper);

      expect(stepper.attributes.getNamedItem('orientation')?.value).to.equal(
        'horizontal'
      );
    });

    it("Should properly render the step's layout", () => {
      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepHeader = StepperTestFunctions.getElementByPart(
          step,
          PARTS.header
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        expect(stepHeaderContainer).not.to.be.null;
        expect(stepHeader).not.to.be.null;
        expect(stepBody).not.to.be.null;
      }
    });

    it('Should apply the appropriate part to the header container of a step that is disabled or linear disabled', async () => {
      stepper.steps[0].disabled = true;
      await elementUpdated(stepper);

      const step0HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[0],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step0HeaderContainer.part.contains('disabled')).to.be.true;

      stepper.linear = true;
      await elementUpdated(stepper);

      stepper.steps[1].invalid = true;
      await elementUpdated(stepper);

      const step2HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[2],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step2HeaderContainer.part.contains('disabled')).to.be.true;
    });

    it('Should indicate that a step is completed', async () => {
      expect(stepper.steps[0].complete).to.be.false;
      expect(stepper.steps[0]).to.not.have.attribute('complete');

      stepper.steps[0].complete = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0]).to.have.attribute('complete');

      stepper.steps[1].complete = true;
      await elementUpdated(stepper);

      expect(stepper.steps[1]).to.have.attribute('complete');
    });

    it('Should properly indicate where a completed step starts and ends', async () => {
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      const step0HeaderContainer = StepperTestFunctions.getElementByPart(
        step0,
        PARTS.headerContainer
      ) as HTMLElement;

      const step1HeaderContainer = StepperTestFunctions.getElementByPart(
        step1,
        PARTS.headerContainer
      ) as HTMLElement;

      const step2HeaderContainer = StepperTestFunctions.getElementByPart(
        step2,
        PARTS.headerContainer
      ) as HTMLElement;

      step0.complete = true;
      step1.complete = true;
      await elementUpdated(stepper);

      expect(step0).to.have.attribute('complete');
      expect(step1).to.have.attribute('complete');

      expect(step0HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step0HeaderContainer.part.contains('complete-end')).to.be.false;

      expect(step1HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step1HeaderContainer.part.contains('complete-end')).to.be.true;

      expect(step2HeaderContainer.part.contains('complete-end')).to.be.true;
      expect(step2HeaderContainer.part.contains('complete-start')).to.be.false;

      step2.complete = true;
      await elementUpdated(stepper);

      expect(step2HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step2HeaderContainer.part.contains('complete-end')).to.be.true;

      // should properly indicate whether the previous step of a newly added step is completed
      const newStep = document.createElement(IgcStepComponent.tagName);
      stepper.append(newStep);
      await elementUpdated(stepper);

      const step3HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[3],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step3HeaderContainer.part.contains('complete-end')).to.be.true;

      step2.complete = false;
      await elementUpdated(stepper);

      expect(step3HeaderContainer.part.contains('complete-end')).to.be.false;

      // should indicate the complete state of the previous step when the step between them is removed from the DOM
      stepper.removeChild(step2);
      await elementUpdated(stepper);

      expect(step3HeaderContainer.part.contains('complete-end')).to.be.true;
    });

    it('Should apply the appropriate part to the header container of an optional step', async () => {
      stepper.steps[0].optional = true;
      await elementUpdated(stepper);

      const step0HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[0],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step0HeaderContainer.part.contains('optional')).to.be.true;
    });

    it('Should indicate that a step is invalid', async () => {
      expect(stepper.steps[0].invalid).to.be.false;
      expect(stepper.steps[0]).to.not.have.attribute('invalid');

      stepper.steps[0].invalid = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0]).to.have.attribute('invalid');

      stepper.steps[1].invalid = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0]).to.have.attribute('invalid');
    });

    it('Should apply the appropriate part to the header container of an invalid step', async () => {
      const step1 = stepper.steps[1];
      const step1HeaderContainer = StepperTestFunctions.getElementByPart(
        step1,
        PARTS.headerContainer
      ) as HTMLElement;

      step1.invalid = true;
      await elementUpdated(stepper);

      // the step at index 1 is accessible but its invalid state is set to false
      expect(step1.isAccessible).to.be.true;
      expect(step1HeaderContainer.part.contains('invalid')).to.be.false;

      // the invalid state is set to true but the step is not visited yet
      expect(step1HeaderContainer.part.contains('invalid')).to.be.false;

      step1.active = true;
      await elementUpdated(stepper);

      // the step is visited but is the currently active step
      expect(step1HeaderContainer.part.contains('invalid')).to.be.false;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      // the step is accessible, invalid, visited and is not the currently active step
      expect(step1HeaderContainer.part.contains('invalid')).to.be.true;
    });

    it('Should apply the appropriate part to the header container of a step that has no title and subtitle', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperActiveDisabledSteps
      );
      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const stepHeaderTitleAndSubtitleWrapper =
          StepperTestFunctions.getElementByPart(
            step,
            PARTS.text
          ) as HTMLElement;

        expect(stepHeaderTitleAndSubtitleWrapper.part.contains('empty')).to.be
          .true;
      }

      stepper.stepType = 'full';
      await elementUpdated(stepper);

      // the step at index 2 has not title and subtitle
      const step2 = stepper.steps[2];
      const step2HeaderTitleAndSubtitleWrapper =
        StepperTestFunctions.getElementByPart(step2, PARTS.text) as HTMLElement;

      expect(step2HeaderTitleAndSubtitleWrapper.part.contains('empty')).to.be
        .true;
    });

    it('Should indicate which is the currently active step', async () => {
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      step1.active = true;
      await elementUpdated(stepper);

      expect(step1).to.have.attribute('active');

      step2.active = true;
      await elementUpdated(stepper);

      expect(step1).to.have.not.attribute('active');
      expect(step2).to.have.attribute('active');
    });

    it('Should place the title in the step element according to the specified titlePosition when stepType is set to "full"', async () => {
      // test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('auto');
        expect(stepHeaderContainer.part.contains('bottom')).to.be.true;
      }

      const positions = ['bottom', 'top', 'end', 'start'];
      for (const pos of positions) {
        stepper.titlePosition = pos as any;
        await elementUpdated(stepper);

        for (const step of stepper.steps) {
          const stepHeaderContainer = StepperTestFunctions.getElementByPart(
            step,
            PARTS.headerContainer
          ) as HTMLElement;

          expect(step.titlePosition).to.equal(pos);
          expect(stepHeaderContainer.part.contains(pos)).to.be.true;
        }
      }

      stepper.orientation = 'vertical';
      stepper.titlePosition = 'auto';
      await elementUpdated(stepper);

      // test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('auto');
        expect(stepHeaderContainer.part.contains('end')).to.be.true;
      }

      for (const pos of positions) {
        stepper.titlePosition = pos as any;
        await elementUpdated(stepper);

        for (const step of stepper.steps) {
          const stepHeaderContainer = StepperTestFunctions.getElementByPart(
            step,
            PARTS.headerContainer
          ) as HTMLElement;

          expect(step.titlePosition).to.equal(pos);
          expect(stepHeaderContainer.part.contains(pos)).to.be.true;
        }
      }

      stepper.orientation = 'horizontal';
      stepper.titlePosition = 'top';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('top');
        expect(stepHeaderContainer.part.contains('top')).to.be.true;
      }

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('top');
        expect(stepHeaderContainer.part.contains('top')).to.be.true;
      }

      // set to the default title position
      stepper.orientation = 'horizontal';
      stepper.titlePosition = 'auto';
      await elementUpdated(stepper);

      // test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('auto');
        expect(stepHeaderContainer.part.contains('bottom')).to.be.true;
      }

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      // test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.equal('auto');
        expect(stepHeaderContainer.part.contains('end')).to.be.true;
      }
    });

    it('Should render the visual step element according to the specified stepType', async () => {
      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const textWrapper = StepperTestFunctions.getElementByPart(
          step,
          PARTS.text
        ) as HTMLElement;

        expect(indicator).not.to.be.null;
        expect(textWrapper.part.contains('empty')).to.be.false;
      }

      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const textWrapper = StepperTestFunctions.getElementByPart(
          step,
          PARTS.text
        ) as HTMLElement;

        expect(indicator).not.to.be.null;
        expect(textWrapper.part.contains('empty')).to.be.true;
      }

      stepper.stepType = 'title';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const textWrapper = StepperTestFunctions.getElementByPart(
          step,
          PARTS.text
        ) as HTMLElement;

        expect(indicator).to.be.null;
        expect(textWrapper.part.contains('empty')).to.be.false;
      }
    });

    it("Should indicate each step with a corresponding number when the steps' indicators are not specified and stepType is either “indicator” or “full”", async () => {
      const step3 = stepper.steps[2];

      let step3IndicatorElement = StepperTestFunctions.getElementByPart(
        step3,
        PARTS.indicator
      ) as HTMLElement;

      expect(step3IndicatorElement).not.be.null;
      expect(
        step3IndicatorElement.children[0].children[0].textContent
      ).to.equal((step3.index + 1).toString());

      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      step3IndicatorElement = StepperTestFunctions.getElementByPart(
        step3,
        PARTS.indicator
      ) as HTMLElement;

      expect(step3IndicatorElement).not.be.null;
      expect(
        step3IndicatorElement.children[0].children[0].textContent
      ).to.equal((step3.index + 1).toString());
    });

    it("Should be able to display the steps' content above the steps headers when the stepper is horizontally orientated", async () => {
      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        const stepHeaderContainerIndex = Array.from(
          step.shadowRoot!.children
        ).indexOf(stepHeaderContainer);
        const stepBodyIndex = Array.from(step.shadowRoot!.children).indexOf(
          stepBody
        );

        expect(stepHeaderContainerIndex).to.be.lessThan(stepBodyIndex);
      }

      stepper.contentTop = true;
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        const stepHeaderContainerIndex = Array.from(
          step.shadowRoot!.children
        ).indexOf(stepHeaderContainer);
        const stepBodyIndex = Array.from(step.shadowRoot!.children).indexOf(
          stepBody
        );

        expect(stepHeaderContainerIndex).to.be.greaterThan(stepBodyIndex);
      }
    });

    it("Should properly render the step's content in a vertical orientation when contentTop is set to true", async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      stepper.contentTop = true;
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        const stepHeaderContainerIndex = Array.from(
          step.shadowRoot!.children
        ).indexOf(stepHeaderContainer);
        const stepBodyIndex = Array.from(step.shadowRoot!.children).indexOf(
          stepBody
        );

        expect(stepHeaderContainerIndex).to.be.lessThan(stepBodyIndex);
      }
    });
  });

  describe('Keyboard navigation', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
      spy = vi.spyOn(stepper, 'emitEvent');
    });

    it('Should navigate to the first/last step on Home/End key press', async () => {
      const firstStep = stepper.steps[0];
      const lastStep = stepper.steps[4];

      lastStep.active = true;
      lastStep.header.focus();
      await elementUpdated(stepper);

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);

      lastStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Home',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.active).to.be.false;
      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'End',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);
    });

    it('Should navigate to the first/last step on Home/End key press (RTL)', async () => {
      stepper.dir = 'rtl';

      const firstStep = stepper.steps[0];
      const lastStep = stepper.steps[4];

      lastStep.active = true;
      lastStep.header.focus();
      await elementUpdated(stepper);

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);

      lastStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Home',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.active).to.be.false;
      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'End',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);
    });

    it('Should activate the currently focused step on Enter/Space key press', () => {
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];

      expect(step1.active).to.be.false;
      expect(step2.active).to.be.false;

      step1.header.focus();

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.active).to.be.true;

      step2.header.focus();

      expect(step2.header).to.equal(step2.shadowRoot!.activeElement);
      expect(step2).to.equal(document.activeElement);

      step2.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.active).to.be.false;
      expect(step2.active).to.be.true;
    });

    it('Should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press', () => {
      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step4 = stepper.steps[4];

      step0.header.focus();

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      // should navigate to the next accessible step
      step4.header.focus();
      step0.disabled = true;

      step4.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step4.header).to.equal(step4.shadowRoot!.activeElement);
      expect(step4).to.equal(document.activeElement);

      step0.disabled = false;
      step0.header.focus();

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step4.header).to.equal(step4.shadowRoot!.activeElement);
      expect(step4).to.equal(document.activeElement);
    });

    it('Should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press (RTL)', () => {
      stepper.dir = 'rtl';

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];
      const step4 = stepper.steps[4];

      step0.header.focus();

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      // should navigate to the next accessible step
      step4.header.focus();
      step0.disabled = true;

      step4.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step4.header).to.equal(step4.shadowRoot!.activeElement);
      expect(step4).to.equal(document.activeElement);

      step0.disabled = false;
      step0.header.focus();

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step4.header).to.equal(step4.shadowRoot!.activeElement);
      expect(step4).to.equal(document.activeElement);
    });

    it('Should navigate to the next/previous step in a vertical orientation on Arrow Down/Up key press', async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];

      step0.header.focus();

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);

      step0.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step1.header).to.equal(step1.shadowRoot!.activeElement);
      expect(step1).to.equal(document.activeElement);

      step1.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step0.header).to.equal(step0.shadowRoot!.activeElement);
      expect(step0).to.equal(document.activeElement);
    });

    it('Should not navigate to the next/previous step in horizontal orientation on Arrow Down/Up key press', () => {
      const step2 = stepper.steps[1];

      step2.header.focus();

      expect(step2.header).to.equal(step2.shadowRoot!.activeElement);
      expect(step2).to.equal(document.activeElement);

      step2.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step2.header).to.equal(step2.shadowRoot!.activeElement);
      expect(step2).to.equal(document.activeElement);

      step2.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(step2.header).to.equal(step2.shadowRoot!.activeElement);
      expect(step2).to.equal(document.activeElement);
    });

    it('Should specify tabIndex="0" for the active step header and tabIndex="-1" for the other steps', async () => {
      stepper.steps[0].header.focus();

      expect(stepper.steps[0].header.tabIndex).to.equal(0);

      for (let i = 1; i < stepper.steps.length; i++) {
        expect(stepper.steps[i].header.tabIndex).to.equal(-1);
      }

      stepper.steps[stepper.steps.length - 1].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0].header.tabIndex).to.equal(-1);
      expect(stepper.steps[stepper.steps.length - 1].header.tabIndex).to.equal(
        0
      );

      for (let i = 0; i < stepper.steps.length - 1; i++) {
        expect(stepper.steps[i].header.tabIndex).to.equal(-1);
      }
    });
  });

  describe('Aria', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
      spy = vi.spyOn(stepper, 'emitEvent');
    });

    it('Should render proper role and orientation attributes for the stepper', async () => {
      expect(stepper.attributes.getNamedItem('role')?.value).to.equal(
        'tablist'
      );
      expect(
        stepper.attributes.getNamedItem('aria-orientation')?.value
      ).to.equal('horizontal');

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      expect(
        stepper.attributes.getNamedItem('aria-orientation')?.value
      ).to.equal('vertical');
    });

    it('Should render proper aria attributes for each step', async () => {
      for (let i = 0; i < stepper.steps.length; i++) {
        expect(
          stepper.steps[i].header.attributes.getNamedItem('role')?.value
        ).to.equal('tab');
        expect(
          stepper.steps[i].header.attributes.getNamedItem('aria-posinset')
            ?.value
        ).to.equal((i + 1).toString());
        expect(
          stepper.steps[i].header.attributes.getNamedItem('aria-setsize')?.value
        ).to.equal(stepper.steps.length.toString());
        expect(
          stepper.steps[i].header.attributes.getNamedItem('aria-controls')
            ?.value
        ).to.equal(
          `${stepper.steps[i].header.id.replace('header', 'content')}`
        );

        if (i !== 0) {
          expect(
            stepper.steps[i].header.attributes.getNamedItem('aria-selected')
              ?.value
          ).to.equal('false');
        }

        stepper.steps[i].active = true;
        await elementUpdated(stepper);

        expect(
          stepper.steps[i].header.attributes.getNamedItem('aria-selected')
            ?.value
        ).to.equal('true');
      }
    });
  });
});
