import { defineComponents } from '../../index.js';
import IgcStepperComponent from './stepper.js';
import IgcStepComponent from './step.js';
import sinon from 'sinon';
import {
  linearModeStepper,
  PARTS,
  simpleStepper,
  SLOTS,
  StepperTestFunctions,
  stepperWithActiveDisabledStep,
  stepperWithTwoActiveSteps,
} from './stepper-utils.spec.js';
import { elementUpdated, expect } from '@open-wc/testing';

describe('Stepper', () => {
  before(() => {
    defineComponents(IgcStepperComponent);
  });

  let stepper: IgcStepperComponent;
  let eventSpy: any;

  describe('Basic', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
    });

    it('Should render a vertical stepper containing a sequence of steps', async () => {
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
      const index = 1;
      const step = stepper.steps[index];

      stepper.navigateTo(index);
      await elementUpdated(stepper);

      expect(step.active).to.be.true;
      expect(step).to.have.attribute('active');
    });

    it('Should not change the active step when the navigateTo method is called with mismatched index', async () => {
      stepper.steps[0].active = true;
      await elementUpdated(stepper);

      stepper.navigateTo(999);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[0]).to.have.attribute('active');
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
      const disabledStep = stepper.steps[1];
      disabledStep.disabled = true;
      stepper.steps[0].active = true;
      await elementUpdated(stepper);

      expect(disabledStep).to.have.attribute('disabled');

      stepper.next();
      expect(disabledStep.active).to.be.false;
      expect(stepper.steps[2].active).to.be.true;

      stepper.prev();
      expect(disabledStep.active).to.be.false;
      expect(stepper.steps[0].active).to.be.true;
    });

    it('Should not allow activating more than one step at a time', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperWithTwoActiveSteps
      );
      expect(stepper.steps[0].active).to.be.false;
      expect(stepper.steps[1].active).to.be.true;

      for (let i = 0; i < stepper.steps.length; i++) {
        stepper.steps[i].active = true;
        await elementUpdated(stepper);
      }

      for (let i = 0; i < stepper.steps.length; i++) {
        if (i !== stepper.steps.length - 1) {
          expect(stepper.steps[0].active).to.be.false;
        } else {
          expect(stepper.steps[i].active).to.be.true;
        }
      }
    });

    it('Should activate a step when it is set to be active and disabled initially', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperWithActiveDisabledStep
      );

      expect(stepper.steps[1].disabled).to.be.true;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('Should not allow moving forward to the next step in linear mode if the previous step is invalid', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );
      stepper.steps[0].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0]).to.have.attribute('invalid');

      stepper.next();
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.false;
      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[1].linearDisabled).to.be.true;
      expect(stepper.steps[2].linearDisabled).to.be.true;
    });

    it('Should emit ing and ed events when a step is activated', async () => {
      eventSpy = sinon.spy(stepper, 'emitEvent');
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

      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcActiveStepChanging', argsIng);
      expect(eventSpy.secondCall).calledWith('igcActiveStepChanged', argsEd);
    });

    it('Should be able to cancel the igcActiveStepChanging event', async () => {
      stepper.steps[0].active = true;
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

    it('Should determine the steps that are marked as visited based on the active step', async () => {
      stepper.steps[1].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0].visited).to.be.true;
      expect(stepper.steps[2].visited).to.be.false;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0].visited).to.be.true;
      expect(stepper.steps[1].visited).to.be.true;
    });

    it('Should not mark a step as visited if it is not been activated before that', async () => {
      stepper.steps[0].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[1].visited).to.be.false;
      expect(stepper.steps[2].visited).to.be.false;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      expect(stepper.steps[0].visited).to.be.true;
      expect(stepper.steps[1].visited).to.be.false;

      const newStep = document.createElement(IgcStepComponent.tagName);
      stepper.insertBefore(newStep, stepper.steps[2]);
      await elementUpdated(stepper);

      expect(stepper.steps[3].active).to.be.true;
      expect(stepper.steps[2].visited).to.be.false;
    });

    it('Should mark all steps before the active one as visited and all after that as not visited if the linear mode is enabled at runtime', async () => {
      const step1 = stepper.steps[1];
      const step2 = stepper.steps[2];
      const step4 = stepper.steps[4];

      step4.active = true;
      await elementUpdated(stepper);

      step2.active = true;
      step2.invalid = true;
      await elementUpdated(stepper);

      expect(step4.visited).to.be.true;
      expect(step1.visited).to.be.false;

      stepper.linear = true;
      await elementUpdated(stepper);

      expect(step4.visited).to.be.false;
      expect(step1.visited).to.be.true;
    });

    it('Should determine the steps that are disabled in linear mode based on the validity of the active step', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );

      stepper.steps[0].active = true;
      stepper.steps[0].invalid = true;
      await elementUpdated(stepper);

      for (let i = 1; i < stepper.steps.length; i++) {
        expect(stepper.steps[i].isAccessible).to.be.false;
      }

      stepper.steps[0].invalid = false;
      await elementUpdated(stepper);

      expect(stepper.steps[1].isAccessible).to.be.true;

      stepper.steps[1].invalid = true;
      await elementUpdated(stepper);

      expect(stepper.steps[2].isAccessible).to.be.false;

      stepper.steps[1].invalid = false;
      await elementUpdated(stepper);

      expect(stepper.steps[2].isAccessible).to.be.true;
    });

    it('Should set a step to be accessible if the previous one is being disabled and was accessible before that', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );

      stepper.steps[0].active = true;
      stepper.steps[0].invalid = false;
      stepper.steps[1].invalid = true;
      await elementUpdated(stepper);

      expect(stepper.steps[2].isAccessible).to.be.false;

      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      expect(stepper.steps[2].isAccessible).to.be.true;
    });

    it('Should set a newly added invalid step to be accessible and the next one to be disabled', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );

      const step0 = stepper.steps[0];
      const step1 = stepper.steps[1];

      step0.active = true;
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

    it('Should set a step to be accessible if the previous one is being removed from the DOM and was accessible before that', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );

      const step0 = stepper.steps[0];

      step0.active = true;
      step0.invalid = false;
      await elementUpdated(stepper);

      const step1 = document.createElement(IgcStepComponent.tagName);

      expect(step1.isAccessible).to.be.true;

      step1.invalid = true;
      await elementUpdated(stepper);

      stepper.insertBefore(step1, stepper.steps[1]);
      await elementUpdated(stepper);

      const step2 = stepper.steps[2];

      expect(step2.isAccessible).to.be.false;

      stepper.removeChild(step1);
      await elementUpdated(stepper);

      expect(step2.isAccessible).to.be.true;
    });

    it('Should set a newly added step to be accessible if the next step is the active step', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );

      const step0 = stepper.steps[0];
      step0.active = true;

      const newStep = document.createElement(IgcStepComponent.tagName);
      await elementUpdated(stepper);

      stepper.prepend(newStep);

      expect(newStep.isAccessible).to.be.true;
    });
  });

  describe('Appearance', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
    });

    it('Should apply the appropriate attribute to a stepper when it is in horizontal or vertical mode', async () => {
      stepper.orientation = 'horizontal';
      await elementUpdated(stepper);

      expect(stepper.attributes.getNamedItem('orientation')?.value).to.equal(
        'horizontal'
      );

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      expect(stepper.attributes.getNamedItem('orientation')?.value).to.equal(
        'vertical'
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

    it("Should properly render the step's content in horizontal and vertical mode", async () => {
      stepper.orientation = 'horizontal';
      await elementUpdated(stepper);
      stepper.contentTop = false;
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

    it("Should apply the appropriate part to the step's header container when the step is disabled or linear disabled", async () => {
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

      const step2HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[0],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step2HeaderContainer.part.contains('disabled')).to.be.true;
    });

    it('Should properly indicate where a completed step starts and ends', async () => {
      stepper.steps[0].complete = true;
      stepper.steps[1].complete = true;
      await elementUpdated(stepper);

      const step0HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[0],
        PARTS.headerContainer
      ) as HTMLElement;

      const step1HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[1],
        PARTS.headerContainer
      ) as HTMLElement;

      const step2HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[2],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(stepper.steps[0]).to.have.attribute('complete');
      expect(step0HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step1HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step1HeaderContainer.part.contains('complete-end')).to.be.true;
      expect(step2HeaderContainer.part.contains('complete-end')).to.be.true;

      stepper.steps[2].complete = true;
      await elementUpdated(stepper);

      expect(step2HeaderContainer.part.contains('complete-start')).to.be.true;
      expect(step2HeaderContainer.part.contains('complete-end')).to.be.true;

      const newStep = document.createElement(IgcStepComponent.tagName);
      stepper.append(newStep);
      await elementUpdated(stepper);

      stepper.steps[2].complete = true;
      await elementUpdated(stepper);

      const step3HeaderContainer = StepperTestFunctions.getElementByPart(
        stepper.steps[3],
        PARTS.headerContainer
      ) as HTMLElement;

      expect(step3HeaderContainer.part.contains('complete-end')).to.be.true;

      stepper.steps[2].complete = false;
      await elementUpdated(stepper);

      expect(step3HeaderContainer.part.contains('complete-end')).to.be.false;

      stepper.removeChild(stepper.steps[2]);
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

    it('Should apply the appropriate part to the header container of an invalid step', async () => {
      stepper.linear = true;
      await elementUpdated(stepper);

      const step1 = stepper.steps[1];
      const step1HeaderContainer = StepperTestFunctions.getElementByPart(
        step1,
        PARTS.headerContainer
      ) as HTMLElement;

      step1.invalid = true;
      await elementUpdated(stepper);

      expect(step1HeaderContainer.part.contains('invalid')).to.be.false;

      step1.active = true;
      await elementUpdated(stepper);

      expect(step1HeaderContainer.part.contains('invalid')).to.be.false;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      expect(step1HeaderContainer.part.contains('invalid')).to.be.true;
    });

    it('Should apply the appropriate part to the header container of a step that has not title and subtitle', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        stepperWithTwoActiveSteps
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

      const step2 = stepper.steps[2];
      const step2HeaderTitleAndSubtitleWrapper =
        StepperTestFunctions.getElementByPart(step2, PARTS.text) as HTMLElement;

      expect(step2HeaderTitleAndSubtitleWrapper.part.contains('empty')).to.be
        .true;
    });

    it('Should indicate the currently active step', async () => {
      const step = stepper.steps[1];

      step.active = true;
      await elementUpdated(stepper);

      expect(step).to.have.attribute('active');

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      expect(step).to.not.have.attribute('active');
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

    it('Should place the title in the step element according to the specified titlePosition when stepType is set to "full"', async () => {
      stepper.orientation = 'horizontal';
      stepper.stepType = 'full';
      await elementUpdated(stepper);

      //test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.be.undefined;
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
      stepper.titlePosition = undefined;
      await elementUpdated(stepper);

      //test default title positions
      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.be.undefined;
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

      stepper.orientation = 'horizontal';
      stepper.titlePosition = undefined;
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.be.undefined;
        expect(stepHeaderContainer.part.contains('bottom')).to.be.true;
      }

      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;

        expect(step.titlePosition).to.undefined;
        expect(stepHeaderContainer.part.contains('end')).to.be.true;
      }
    });

    it('Should render the visual step element according to the specified stepType', async () => {
      stepper.stepType = 'full';
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

    it('Should indicate each step with a corresponding number when igxStepIndicator is not specified in the step template and stepType is either “indicator” or “full”', async () => {
      stepper.stepType = 'full';
      await elementUpdated(stepper);

      const thirdStep = stepper.steps[2];

      let thirdStepIndicatorElement = StepperTestFunctions.getElementByPart(
        thirdStep,
        PARTS.indicator
      ) as HTMLElement;

      expect(thirdStepIndicatorElement).not.be.null;
      expect(
        thirdStepIndicatorElement.children[0].children[0].textContent
      ).to.equal((thirdStep.index + 1).toString());

      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      thirdStepIndicatorElement = StepperTestFunctions.getElementByPart(
        thirdStep,
        PARTS.indicator
      ) as HTMLElement;

      expect(thirdStepIndicatorElement).not.be.null;
      expect(
        thirdStepIndicatorElement.children[0].children[0].textContent
      ).to.equal((thirdStep.index + 1).toString());
    });

    it("Should be able to display the steps' content above the steps headers when the stepper is horizontally orientated", async () => {
      stepper.orientation = 'horizontal';
      await elementUpdated(stepper);

      expect(stepper.contentTop).to.be.false;

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        expect(stepHeaderContainer).not.to.be.null;
        expect(stepBody).not.to.be.null;
      }

      stepper.contentTop = true;
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const stepHeaderContainer = StepperTestFunctions.getElementByPart(
          step,
          PARTS.headerContainer
        ) as HTMLElement;
        const stepBody = StepperTestFunctions.getElementByPart(
          step,
          PARTS.body
        ) as HTMLElement;

        expect(stepHeaderContainer).not.to.be.null;
        expect(stepBody).not.to.be.null;
      }
    });

    it('Should render dynamically added step and properly set the active state of the steps', async () => {
      const stepsLength = stepper.steps.length;
      expect(stepsLength).to.equal(5);

      const step = document.createElement(IgcStepComponent.tagName);

      stepper.prepend(step);

      expect(stepper.steps.length).to.equal(stepsLength + 1);
      expect(stepper.steps[0]).to.equal(step);

      stepper.steps[0].active = true;
      stepper.removeChild(step);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
    });

    // it('Should properly set the linear disabled steps when the active step is removed from the DOM', async () => {
    //   const step = document.createElement(IgcStepComponent.tagName);
    //   stepper.prepend(step);
    //   await elementUpdated(stepper);

    //   stepper.steps[0].active = true;
    //   stepper.steps[1].disabled = true;
    //   await elementUpdated(stepper);
    //   stepper.removeChild(stepper.steps[0]);
    //   await elementUpdated(stepper);

    //   expect(stepper.steps[0].active).to.be.false;
    //   expect(stepper.steps[1].active).to.be.true;
    // });

    it('Should properly set the linear disabled steps when the active step is removed from the DOM', async () => {
      stepper = await StepperTestFunctions.createStepperElement(
        linearModeStepper
      );
      const step = document.createElement(IgcStepComponent.tagName);
      stepper.prepend(step);
      await elementUpdated(stepper);

      stepper.steps[0].active = true;
      stepper.steps[0].invalid = true;
      await elementUpdated(stepper);

      for (let i = 1; i < stepper.steps.length; i++) {
        expect(stepper.steps[i].isAccessible).to.be.false;
      }

      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      stepper.removeChild(stepper.steps[0]);
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.true;
    });

    it('Should activate the first accessible step and clear the visited steps collection when the stepper is reset', async () => {
      // "visit" some steps
      for (const step of stepper.steps) {
        step.active = true;
        await elementUpdated(stepper);
      }

      for (const step of stepper.steps) {
        expect(step.visited).to.be.true;
      }

      stepper.reset();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[0].visited).to.be.true;

      expect(stepper.steps[1].visited).to.be.false;
      expect(stepper.steps[2].visited).to.be.false;
    });

    // ????
    // it('Should render step indicator and title when such are defined in the template', () => {
    //   const step = stepper.steps[2];
    //   const indicatorSlot = StepperTestFunctions.getSlot(step, SLOTS.indicator);
    //   expect(indicatorSlot).not.to.be.null;

    //   let elements = indicatorSlot.assignedElements();
    //   expect(elements.length).to.equal(1);
    //   expect(elements[0].tagName).to.equal('IGC-ICON');
    //   expect(elements[0]).to.have.attribute('name', 'home');

    //   const titleSlot = StepperTestFunctions.getSlot(step, SLOTS.title);
    //   expect(indicatorSlot).not.to.be.null;

    //   elements = titleSlot.assignedElements();
    //   expect(elements.length).to.equal(1);
    //   expect(elements[0].tagName).to.equal('SPAN');
    //   expect(elements[0].textContent).to.equal('Step 3');
    // });

    // it('should render dynamically added step and properly set the linear disabled steps with its addition', async () => {
    //   const stepsLength = stepper.steps.length;
    //   expect(stepsLength).toBe(5);

    //   fix.componentInstance.displayHiddenStep = true;
    //   fix.detectChanges();

    //   expect(stepper.steps.length).toBe(stepsLength + 1);

    //   const titleElement = stepper.steps[2].nativeElement.querySelector(`.${STEP_TITLE_CLASS}`);
    //   expect(titleElement.textContent).toBe('Hidden step');

    //   // should set the first accessible step as active when the active step is dynamically removed
    //   stepper.steps[2].active = true;
    //   fix.detectChanges();
    //   tick(300);
    //   fix.componentInstance.displayHiddenStep = false;
    //   fix.detectChanges();
    //   tick(300);

    //   let firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
    //   expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

    //   fix.componentInstance.displayHiddenStep = true;
    //   fix.detectChanges();
    //   tick(300);
    //   stepper.steps[2].active = true;
    //   stepper.steps[0].disabled = true;
    //   fix.detectChanges();
    //   tick(300);
    //   expect(stepper.steps[0].isAccessible).toBeFalsy();

    //   fix.componentInstance.displayHiddenStep = false;
    //   fix.detectChanges();
    //   tick(300);

    //   firstAccessibleStepIdx = stepper.steps.findIndex(step => step.isAccessible);
    //   expect(firstAccessibleStepIdx).toBe(1);
    //   expect(stepper.steps[firstAccessibleStepIdx].active).toBeTruthy();

    //   // if the dynamically added step's position is before the active step in linear mode,
    //   // it should not be linear disabled
    //   stepper.linear = true;
    //   stepper.steps[4].active = true;
    //   for (let index = 0; index <= 4; index++) {
    //     const step = stepper.steps[index];
    //     step.isValid = true;
    //   }
    //   fix.detectChanges();
    //   fix.componentInstance.displayHiddenStep = true;
    //   fix.detectChanges();

    //   for (let index = 0; index <= 5; index++) {
    //     const step = stepper.steps[index];
    //     expect(step.linearDisabled).toBeFalsy();
    //   }

    //   fix.componentInstance.displayHiddenStep = false;
    //   fix.detectChanges();

    //   // if the dynamically added step's position is after the active step in linear mode,
    //   // and the latter is not valid, the added step should be linear disabled
    //   stepper.steps[0].isValid = true;
    //   stepper.steps[1].isValid = false;
    //   stepper.steps[1].active = true;
    //   fix.detectChanges();
    //   fix.componentInstance.displayHiddenStep = true;
    //   fix.detectChanges();
    //   tick(300);

    //   expect(stepper.steps[2].linearDisabled).toBeTruthy();

    //   for (let index = 3; index <= 5; index++) {
    //     const step = stepper.steps[index];
    //     expect(step.linearDisabled).toBeTruthy();
    //   }
    // });
  });

  describe('Keyboard navigation', async () => {
    beforeEach(async () => {
      stepper = await StepperTestFunctions.createStepperElement(simpleStepper);
      eventSpy = sinon.spy(stepper, 'emitEvent');
    });

    it('Should navigate to first/last step on Home/End key press', async () => {
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
      const secondStep = stepper.steps[1];
      const lastStep = stepper.steps[2];

      expect(secondStep.active).to.be.false;
      expect(lastStep.active).to.be.false;

      secondStep.header.focus();

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.active).to.be.true;

      lastStep.header.focus();

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);

      lastStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.active).to.be.false;
      expect(lastStep.active).to.be.true;
    });

    it('Should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press', () => {
      const firstStep = stepper.steps[0];
      const secondStep = stepper.steps[1];
      const lastStep = stepper.steps[4];

      firstStep.header.focus();

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      lastStep.header.focus();
      firstStep.disabled = true;

      lastStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);

      firstStep.disabled = false;
      firstStep.header.focus();

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
      expect(lastStep).to.equal(document.activeElement);
    });

    it('Should navigate to the next/previous step in horizontal orientation on Arrow Right/Left key press (rtl)', () => {
      stepper.dir = 'rtl';

      const firstStep = stepper.steps[0];
      const secondStep = stepper.steps[1];

      firstStep.header.focus();

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);
    });

    it('Should not navigate to the next/previous step in horizontal orientation on Arrow Down/Up key press', () => {
      const secondStep = stepper.steps[1];

      secondStep.header.focus();

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);
    });

    it('Should navigate to the next/previous step in vertical orientation on Arrow Down/Up key press', async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      const firstStep = stepper.steps[0];
      const secondStep = stepper.steps[1];

      firstStep.header.focus();

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);

      firstStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(secondStep.header).to.equal(secondStep.shadowRoot!.activeElement);
      expect(secondStep).to.equal(document.activeElement);

      secondStep.header.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        })
      );

      expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
      expect(firstStep).to.equal(document.activeElement);
    });

    it('Should specify tabIndex="0" for the active step and tabIndex="-1" for the other steps', async () => {
      stepper.orientation = 'horizontal';
      stepper.steps[0].active = true;
      await elementUpdated(stepper);

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
      eventSpy = sinon.spy(stepper, 'emitEvent');
    });

    it('should render proper role and orientation attributes for the stepper', async () => {
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
