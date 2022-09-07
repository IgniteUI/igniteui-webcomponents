import { defineComponents } from '../../index.js';
import IgcStepperComponent from './stepper.js';
import sinon from 'sinon';
import {
  PARTS,
  simpleStepper,
  SLOTS,
  StepperTestFunctions,
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
      await StepperTestFunctions.createStepperElement(simpleStepper);
      stepper = document.getElementsByTagName('igc-stepper')[0];
    });

    // it('should render a stepper containing a sequence of steps', () => {
    //   const stepperElement: HTMLElement = fix.debugElement.queryAll(
    //     By.css(`${STEPPER_CLASS}`)
    //   )[0].nativeElement;
    //   const stepperHeader = stepperElement.querySelector(`.${STEPPER_HEADER}`);
    //   const steps = Array.from(stepperHeader.children);
    //   expect(steps.length).toBe(5);
    //   for (const step of steps) {
    //     expect(step.tagName === STEP_TAG).toBeTruthy();
    //   }
    // });

    it('Should render a vertical stepper containing a sequence of steps', async () => {
      // stepper.steps should return all steps
      expect(stepper.steps.length).to.equal(3);
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
      const stepHeaderContainer = StepperTestFunctions.getElementByPart(
        step,
        PARTS.headerContainer
      ) as HTMLElement;
      const stepBody = StepperTestFunctions.getElementByPart(
        step,
        PARTS.body
      ) as HTMLElement;

      stepper.navigateTo(index);
      await elementUpdated(stepper);

      expect(step.active).to.be.true;
      expect(step).to.have.attribute('active');
      expect(stepHeaderContainer.part.contains('active-header')).to.be.true;
      expect(stepBody.part.contains('active-body')).to.be.true;
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

    it('Should not allow moving forward to the next step in linear mode if the previous step is invalid', async () => {
      stepper.linear = true;
      stepper.steps[0].active = true;
      stepper.steps[0].invalid = true;
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

    it('Should emit ing and ed events when a step is activated', async () => {
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

    // it('Should determine the steps that are disabled in linear mode based on the validity of the active step', async () => {
    //   stepper.linear = true;

    //   stepper.steps[0].invalid = true;
    //   await elementUpdated(stepper);

    //   for (let i = 1; i < stepper.steps.length; i++) {
    //     expect(stepper.steps[i].isAccessible).to.be.false;
    //   }

    //   stepper.steps[0].invalid = false;
    //   await elementUpdated(stepper);

    //   for (let i = 1; i < stepper.steps.length; i++) {
    //     if (i === 1) {
    //       expect(stepper.steps[i].isAccessible).to.be.true;
    //     } else {
    //       expect(stepper.steps[i].isAccessible).to.be.false;
    //     }
    //   }
    // });
  });

  describe('Appearance', async () => {
    beforeEach(async () => {
      await StepperTestFunctions.createStepperElement(simpleStepper);
      stepper = document.getElementsByTagName('igc-stepper')[0];
    });

    it('Should not allow moving forward to the next step in linear mode if the previous step is invalid', async () => {
      stepper.linear = true;

      // the step with index 0 is activated by default
      const step = stepper.steps[0];
      step.invalid = true;
      expect(step.active).to.be.true;
      await elementUpdated(stepper);

      stepper.next();
      const nextStep = stepper.steps[1];
      expect(nextStep.active).to.be.false;
      expect(step.active).to.be.true;
    });

    it('should indicate the currently active step', async () => {
      const step = stepper.steps[1];

      const stepHeaderContainer = step.shadowRoot!.querySelector(
        PARTS.headerContainer
      ) as HTMLElement;
      const stepBody = step.shadowRoot!.querySelector(
        PARTS.body
      ) as HTMLElement;

      step.active = true;
      await elementUpdated(stepper);

      expect(step).to.have.attribute('active');
      expect(stepHeaderContainer.part.contains('active-header')).to.be.true;
      expect(stepBody.part.contains('active-body')).to.be.true;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      expect(step).to.not.have.attribute('active');
      expect(stepHeaderContainer.part.contains('active-header')).to.be.false;
      expect(stepBody.part.contains('active-body')).to.be.false;
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

    it('Should render the visual step element according to the specified stepType', async () => {
      stepper.stepType = 'full';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const title = StepperTestFunctions.getElementByPart(
          step,
          PARTS.title
        ) as HTMLElement;
        const subtitle = StepperTestFunctions.getElementByPart(
          step,
          PARTS.subtitle
        ) as HTMLElement;

        expect(indicator).not.to.be.null;
        expect(title).not.to.be.null;
        expect(subtitle).not.to.be.null;
      }

      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const title = StepperTestFunctions.getElementByPart(
          step,
          PARTS.title
        ) as HTMLElement;
        const subtitle = StepperTestFunctions.getElementByPart(
          step,
          PARTS.subtitle
        ) as HTMLElement;

        expect(indicator).not.to.be.null;
        expect(title).to.be.null;
        expect(subtitle).to.be.null;
      }

      stepper.stepType = 'title';
      await elementUpdated(stepper);

      for (let i = 0; i < stepper.steps.length; i++) {
        const step = stepper.steps[i];
        const indicator = StepperTestFunctions.getElementByPart(
          step,
          PARTS.indicator
        ) as HTMLElement;
        const title = StepperTestFunctions.getElementByPart(
          step,
          PARTS.title
        ) as HTMLElement;
        const subtitle = StepperTestFunctions.getElementByPart(
          step,
          PARTS.subtitle
        ) as HTMLElement;

        expect(indicator).to.be.null;
        expect(title).not.to.be.null;
        expect(subtitle).not.to.be.null;
        // const elementsMap = getHeaderElements(stepper, i);

        // expect(elementsMap.get('indicator')).toBeNull();
        // expect(stepper.steps[i].isIndicatorVisible).toBeFalsy();
        // if (i === 3) {
        //   expect(elementsMap.get('title')).toBeNull();
        //   expect(elementsMap.get('subtitle')).toBeNull();
        //   continue;
        // }
        // expect(elementsMap.get('title')).not.toBeNull();
        // expect(elementsMap.get('subtitle')).not.toBeNull();
        // expect(stepper.steps[i].isTitleVisible).toBeTruthy();
      }
    });

    describe('Keyboard navigation', async () => {
      beforeEach(async () => {
        await StepperTestFunctions.createStepperElement(simpleStepper);
        stepper = document.getElementsByTagName('igc-stepper')[0];
        eventSpy = sinon.spy(stepper, 'emitEvent');
      });

      it('Should navigate to first/last step on Home/End key press', async () => {
        const firstStep = stepper.steps[0];
        const lastStep = stepper.steps[2];

        lastStep.active = true;
        lastStep.header.focus();
        await elementUpdated(stepper);

        expect(lastStep.header).to.equal(lastStep.shadowRoot!.activeElement);
        expect(lastStep).to.equal(document.activeElement);

        firstStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Home',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(firstStep.active).to.be.false;
        expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
        expect(firstStep).to.equal(document.activeElement);

        firstStep.dispatchEvent(
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

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
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

        lastStep.dispatchEvent(
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

        firstStep.header.focus();

        expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
        expect(firstStep).to.equal(document.activeElement);

        firstStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
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

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowUp',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
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

        firstStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
        expect(firstStep).to.equal(document.activeElement);

        firstStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);

        secondStep.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowUp',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(firstStep.header).to.equal(firstStep.shadowRoot!.activeElement);
        expect(firstStep).to.equal(document.activeElement);
      });

      it('Should navigate to the next/previous step in vertical orientation on Tab/Tab + Shift key press', async () => {
        const secondStep = stepper.steps[1];
        secondStep.active = true;
        await elementUpdated(stepper);

        expect(secondStep.active).to.be.true;

        const firstInput = document.getElementById('firstInput');
        firstInput!.focus();
        expect(firstInput).to.equal(document.activeElement);

        firstInput!.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
          })
        );

        expect(secondStep.header).to.equal(
          secondStep.shadowRoot!.activeElement
        );
        expect(secondStep).to.equal(document.activeElement);
      });
    });
  });
});
