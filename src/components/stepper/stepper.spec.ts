import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';
import IgcIconComponent from '../icon/icon.js';
import IgcStepComponent from './step.js';
import IgcStepperComponent from './stepper.js';

describe('Stepper', () => {
  before(() => {
    defineComponents(IgcStepperComponent, IgcIconComponent);
  });

  let stepper: IgcStepperComponent;

  describe('Initialization & rendering', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should be initialized correctly', async () => {
      expect(stepper).to.exist;
      expect(stepper.steps).lengthOf(5);
      expect(stepper.orientation).to.equal('horizontal');
      expect(stepper.stepType).to.equal('full');
      expect(stepper.linear).to.be.false;
      expect(stepper.contentTop).to.be.false;
      expect(stepper.titlePosition).to.equal('auto');
      expect(stepper.verticalAnimation).to.equal('grow');
      expect(stepper.horizontalAnimation).to.equal('slide');
      expect(stepper.animationDuration).to.equal(320);
    });

    it('should correctly render slotted content', async () => {
      const steps = stepper.steps.map((step) => getStepDOM(step));

      for (const [i, step] of steps.entries()) {
        expect(step.slots.indicator).to.exist;
        expect(step.slots.subTitle).to.exist;
        expect(step.slots.title).to.exist;
        expect(first(step.slots.title.assignedElements()).textContent).to.equal(
          `Step ${i + 1}`
        );
        expect(
          first(step.slots.default.assignedElements()).textContent
        ).to.equal(`STEP ${i + 1} CONTENT`);
      }
    });

    it('should have proper ARIA attributes for steps', async () => {
      const steps = stepper.steps.map((step) => getStepDOM(step));
      const length = steps.length.toString();

      for (const [i, step] of steps.entries()) {
        expect(step.parts.header.role).to.equal('tab');
        expect(step.parts.header.ariaPosInSet).to.equal(`${i + 1}`);
        expect(step.parts.header.ariaSetSize).to.equal(length);
        expect(step.parts.header.ariaControlsElements?.at(0)).to.equal(
          step.parts.body
        );
        // First step is active by default
        expect(step.parts.header.ariaSelected).to.equal(
          i === 0 ? 'true' : 'false'
        );
      }
    });

    it('should have proper tabindex values based on active state', async () => {
      for (const step of stepper.steps) {
        const header = getStepDOM(step).parts.header;
        expect(header.tabIndex).to.equal(step.active ? 0 : -1);
      }
    });

    it('should render proper layout parts for each step', () => {
      for (const step of stepper.steps) {
        const dom = getStepDOM(step);
        expect(dom.parts.headerContainer).not.to.be.null;
        expect(dom.parts.header).not.to.be.null;
        expect(dom.parts.body).not.to.be.null;
      }
    });

    it('should display the step index + 1 as the default indicator', () => {
      for (const [i, step] of stepper.steps.entries()) {
        const indicator = getStepDOM(step).parts.indicator;
        expect(indicator).not.to.be.null;
        expect(indicator.querySelector('span')!.textContent).to.equal(
          `${i + 1}`
        );
      }
    });
  });

  describe('Activation', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should activate the first non-disabled step by default', () => {
      expect(stepper.steps[0].active).to.be.true;
      for (let i = 1; i < stepper.steps.length; i++) {
        expect(stepper.steps[i].active).to.be.false;
      }
    });

    it('should not allow more than one active step at a time', async () => {
      stepper = await fixture(createDisabledStepper());

      // two steps declared as active — only the last one wins
      expect(stepper.steps[0].active).to.be.false;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('should activate a step that is both active and disabled initially', async () => {
      stepper = await fixture(createDisabledStepper());

      expect(stepper.steps[1].disabled).to.be.true;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('should activate steps through `active` property', async () => {
      const [firstStep, secondStep] = stepper.steps;

      secondStep.active = true;
      await elementUpdated(stepper);

      expect(firstStep.active).to.be.false;
      expect(secondStep.active).to.be.true;
    });

    it('should activate steps through `navigateTo`', async () => {
      const [firstStep, secondStep] = stepper.steps;

      stepper.navigateTo(1);
      await elementUpdated(stepper);

      expect(firstStep.active).to.be.false;
      expect(secondStep.active).to.be.true;
    });

    it('should do nothing when `navigateTo` is called with an out-of-bounds index', async () => {
      stepper.navigateTo(999);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
    });

    it('should activate steps through UI interaction - click', async () => {
      const [firstStep, secondStep] = stepper.steps;

      simulateClick(getStepDOM(secondStep).parts.header);
      await elementUpdated(stepper);

      expect(firstStep.active).to.be.false;
      expect(secondStep.active).to.be.true;
    });

    it('should not activate a disabled step through click', async () => {
      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      simulateClick(getStepDOM(stepper.steps[1]).parts.header);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[1].active).to.be.false;
    });
  });

  describe('Events', () => {
    let eventSpy: ReturnType<typeof spy>;

    beforeEach(async () => {
      stepper = await fixture(createStepper());
      eventSpy = spy(stepper, 'emitEvent');
    });

    it('should emit `igcActiveStepChanging` and `igcActiveStepChanged` when activated through UI', async () => {
      simulateClick(getStepDOM(stepper.steps[1]).parts.header);
      await elementUpdated(stepper);

      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcActiveStepChanging', {
        detail: { oldIndex: 0, newIndex: 1 },
        cancelable: true,
      });
      expect(eventSpy.secondCall).calledWith('igcActiveStepChanged', {
        detail: { index: 1 },
      });
    });

    it('should not emit events when activated through API (`next`, `prev`, `navigateTo`)', async () => {
      stepper.next();
      await elementUpdated(stepper);
      expect(eventSpy.callCount).to.equal(0);

      stepper.prev();
      await elementUpdated(stepper);
      expect(eventSpy.callCount).to.equal(0);

      stepper.navigateTo(2);
      await elementUpdated(stepper);
      expect(eventSpy.callCount).to.equal(0);
    });

    it('should be able to cancel `igcActiveStepChanging`', async () => {
      stepper.addEventListener('igcActiveStepChanging', (e) =>
        e.preventDefault()
      );

      simulateClick(getStepDOM(stepper.steps[1]).parts.header);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[1].active).to.be.false;
    });
  });

  describe('Navigation API', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should activate the next accessible step with `next()`', async () => {
      const [step0, , step2] = stepper.steps;
      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      stepper.next();
      await elementUpdated(stepper);

      expect(step0.active).to.be.false;
      expect(step2.active).to.be.true;
    });

    it('should activate the previous accessible step with `prev()`', async () => {
      const [step0, , step2] = stepper.steps;
      stepper.steps[1].disabled = true;
      stepper.navigateTo(2);
      await elementUpdated(stepper);

      stepper.prev();
      await elementUpdated(stepper);

      expect(step2.active).to.be.false;
      expect(step0.active).to.be.true;
    });

    it('should do nothing at the boundary with `next()` / `prev()`', async () => {
      // at last step, next() does nothing
      stepper.navigateTo(4);
      await elementUpdated(stepper);

      stepper.next();
      await elementUpdated(stepper);

      expect(stepper.steps[4].active).to.be.true;

      // at first step, prev() does nothing
      stepper.navigateTo(0);
      await elementUpdated(stepper);

      stepper.prev();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
    });

    it('should do nothing when all steps are inaccessible', async () => {
      stepper.navigateTo(1);
      for (const step of stepper.steps) step.disabled = true;
      await elementUpdated(stepper);

      stepper.next();
      await elementUpdated(stepper);
      expect(stepper.steps[1].active).to.be.true;

      stepper.prev();
      await elementUpdated(stepper);
      expect(stepper.steps[1].active).to.be.true;
    });

    it('should reset to the first accessible step and clear visited state', async () => {
      // visit several steps
      stepper.navigateTo(1);
      await elementUpdated(stepper);
      stepper.navigateTo(2);
      await elementUpdated(stepper);

      stepper.reset();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      // after reset, steps 1 and 2 are no longer visited — their invalid part should not appear
      stepper.steps[1].invalid = true;
      stepper.steps[2].invalid = true;
      await elementUpdated(stepper);

      expect(
        getStepDOM(stepper.steps[1]).parts.headerContainer.part.contains(
          'invalid'
        )
      ).to.be.false;
      expect(
        getStepDOM(stepper.steps[2]).parts.headerContainer.part.contains(
          'invalid'
        )
      ).to.be.false;
    });
  });

  describe('Dynamic steps', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should activate the next step when the active step is removed', async () => {
      const [step0, step1] = stepper.steps;
      expect(step0.active).to.be.true;

      stepper.removeChild(step0);
      await elementUpdated(stepper);

      expect(step1.active).to.be.true;
    });

    it('should not activate a newly prepended active step if current active is later in the list', async () => {
      const newStep = document.createElement(IgcStepComponent.tagName);
      newStep.active = true;

      stepper.prepend(newStep);
      await elementUpdated(stepper);

      expect(newStep.active).to.be.false;
      expect(stepper.steps[1].active).to.be.true;
    });

    it('should activate a newly inserted active step if inserted after the current active', async () => {
      const newStep = document.createElement(IgcStepComponent.tagName);
      newStep.active = true;

      stepper.insertBefore(newStep, stepper.steps[2]);
      await elementUpdated(stepper);

      expect(newStep.active).to.be.true;
      expect(stepper.steps[1].active).to.be.false;
    });

    it('should update `complete-end` part when adjacent steps are removed or their complete state changes', async () => {
      const [step0, step1, step2] = stepper.steps;
      step0.complete = true;
      step1.complete = true;
      step2.complete = true;
      await elementUpdated(stepper);

      const step3Dom = getStepDOM(stepper.steps[3]);
      expect(step3Dom.parts.headerContainer.part.contains('complete-end')).to.be
        .true;

      step2.complete = false;
      await elementUpdated(stepper);

      expect(step3Dom.parts.headerContainer.part.contains('complete-end')).to.be
        .false;

      // restore and remove step2 — step3 should now see step1 as previous
      step2.complete = true;
      await elementUpdated(stepper);
      stepper.removeChild(step2);
      await elementUpdated(stepper);

      // stepper.steps[2] is now the old step3
      expect(
        getStepDOM(stepper.steps[2]).parts.headerContainer.part.contains(
          'complete-end'
        )
      ).to.be.true;
    });

    it('should update step count CSS property when steps are added or removed', async () => {
      expect(stepper.style.getPropertyValue('--steps-count')).to.equal('5');

      const newStep = document.createElement(IgcStepComponent.tagName);
      stepper.append(newStep);
      await elementUpdated(stepper);

      expect(stepper.style.getPropertyValue('--steps-count')).to.equal('6');

      stepper.removeChild(newStep);
      await elementUpdated(stepper);

      expect(stepper.style.getPropertyValue('--steps-count')).to.equal('5');
    });
  });

  describe('Linear mode', () => {
    beforeEach(async () => {
      stepper = await fixture(createLinearStepper());
    });

    it('should lock all steps after the first invalid required step', async () => {
      // step 0 is invalid+optional initially — step 1 is accessible
      // remove optional so step 0 becomes a blocking invalid step
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[0])).to.be.true;
      expect(isStepAccessible(stepper.steps[1])).to.be.false;
      expect(isStepAccessible(stepper.steps[2])).to.be.false;
    });

    it('should unlock the next step when the currently invalid step becomes valid', async () => {
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      stepper.steps[0].invalid = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.true;
      expect(isStepAccessible(stepper.steps[2])).to.be.false;

      stepper.steps[1].invalid = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[2])).to.be.true;
    });

    it('should not allow moving to the next step with `next()` if current is invalid and required', async () => {
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      stepper.next();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(stepper.steps[1].active).to.be.false;
    });

    it('should skip a disabled step when computing the blocking invalid step', async () => {
      stepper.steps[0].invalid = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.true;
      expect(isStepAccessible(stepper.steps[2])).to.be.false;

      stepper.steps[1].disabled = true;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[2])).to.be.true;
    });

    it('should treat an optional invalid step as non-blocking', async () => {
      // step 0 is invalid but optional — step 1 should be accessible
      expect(isStepAccessible(stepper.steps[1])).to.be.true;

      // step 1 is now also optional and invalid — step 2 should be accessible
      stepper.steps[1].optional = true;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[2])).to.be.true;
    });

    it('should re-evaluate linear state when an invalid step is inserted between valid ones', async () => {
      stepper.steps[0].invalid = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.true;

      const newStep = document.createElement(IgcStepComponent.tagName);
      newStep.invalid = true;
      stepper.insertBefore(newStep, stepper.steps[1]);
      await elementUpdated(stepper);

      expect(isStepAccessible(newStep)).to.be.true;
      expect(isStepAccessible(stepper.steps[2])).to.be.false;
    });

    it('should re-evaluate linear state when the active step is removed', async () => {
      stepper.steps[0].invalid = false;
      stepper.steps[1].active = true;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[2])).to.be.false;

      stepper.removeChild(stepper.steps[1]);
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      expect(isStepAccessible(stepper.steps[1])).to.be.true;
    });

    it('should not change accessibility of earlier steps when a later locked step is mutated', async () => {
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      // step 1 is locked
      expect(isStepAccessible(stepper.steps[1])).to.be.false;

      stepper.steps[2].disabled = true;
      await elementUpdated(stepper);
      expect(isStepAccessible(stepper.steps[1])).to.be.false;

      stepper.steps[2].invalid = true;
      await elementUpdated(stepper);
      expect(isStepAccessible(stepper.steps[1])).to.be.false;
    });

    it('should clear linear disabled state when `linear` is turned off', async () => {
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.false;

      stepper.linear = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.true;
    });

    it('should reset and clear linear disabled state', async () => {
      stepper.steps[0].optional = false;
      await elementUpdated(stepper);

      expect(isStepAccessible(stepper.steps[1])).to.be.false;

      stepper.reset();
      await elementUpdated(stepper);

      expect(stepper.steps[0].active).to.be.true;
      // after reset the linear state is re-evaluated from scratch
      // step 0 is still invalid and required, so step 1 remains locked
      expect(isStepAccessible(stepper.steps[1])).to.be.false;
    });
  });

  describe('Appearance', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should reflect the `orientation` attribute', async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);
      expect(stepper.getAttribute('orientation')).to.equal('vertical');

      stepper.orientation = 'horizontal';
      await elementUpdated(stepper);
      expect(stepper.getAttribute('orientation')).to.equal('horizontal');
    });

    it('should apply the `disabled` part to inaccessible step header containers', async () => {
      stepper.steps[0].disabled = true;
      await elementUpdated(stepper);

      expect(
        getStepDOM(stepper.steps[0]).parts.headerContainer.part.contains(
          'disabled'
        )
      ).to.be.true;

      stepper.steps[0].disabled = false;
      await elementUpdated(stepper);

      expect(
        getStepDOM(stepper.steps[0]).parts.headerContainer.part.contains(
          'disabled'
        )
      ).to.be.false;
    });

    it('should apply the `disabled` part when a step is linear-disabled', async () => {
      stepper.linear = true;
      stepper.steps[0].invalid = true;
      await elementUpdated(stepper);

      expect(
        getStepDOM(stepper.steps[1]).parts.headerContainer.part.contains(
          'disabled'
        )
      ).to.be.true;
    });

    it('should apply the `complete-start` and `complete-end` parts correctly', async () => {
      const [step0, step1, step2] = stepper.steps;
      step0.complete = true;
      step1.complete = true;
      await elementUpdated(stepper);

      expect(
        getStepDOM(step0).parts.headerContainer.part.contains('complete-start')
      ).to.be.true;
      expect(
        getStepDOM(step0).parts.headerContainer.part.contains('complete-end')
      ).to.be.false;

      expect(
        getStepDOM(step1).parts.headerContainer.part.contains('complete-start')
      ).to.be.true;
      expect(
        getStepDOM(step1).parts.headerContainer.part.contains('complete-end')
      ).to.be.true;

      expect(
        getStepDOM(step2).parts.headerContainer.part.contains('complete-end')
      ).to.be.true;
      expect(
        getStepDOM(step2).parts.headerContainer.part.contains('complete-start')
      ).to.be.false;
    });

    it('should apply the `optional` part to an optional step', async () => {
      stepper.steps[0].optional = true;
      await elementUpdated(stepper);

      expect(
        getStepDOM(stepper.steps[0]).parts.headerContainer.part.contains(
          'optional'
        )
      ).to.be.true;
    });

    it('should apply the `invalid` part only when the step is visited, invalid, not active, and accessible', async () => {
      const step1 = stepper.steps[1];
      const step1Dom = getStepDOM(step1);

      step1.invalid = true;
      await elementUpdated(stepper);

      // not yet visited
      expect(step1Dom.parts.headerContainer.part.contains('invalid')).to.be
        .false;

      step1.active = true;
      await elementUpdated(stepper);

      // visited but currently active
      expect(step1Dom.parts.headerContainer.part.contains('invalid')).to.be
        .false;

      stepper.steps[2].active = true;
      await elementUpdated(stepper);

      // visited, invalid, not active, accessible
      expect(step1Dom.parts.headerContainer.part.contains('invalid')).to.be
        .true;
    });

    it('should apply the `empty` part when stepType is `indicator` or there is no title/subtitle', async () => {
      stepper = await fixture(createDisabledStepper());
      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.text.part.contains('empty')).to.be.true;
      }

      stepper.stepType = 'full';
      await elementUpdated(stepper);

      // step at index 2 of createDisabledStepper has no title/subtitle
      expect(getStepDOM(stepper.steps[2]).parts.text.part.contains('empty')).to
        .be.true;
    });

    it('should show/hide the indicator element based on `stepType`', async () => {
      stepper.stepType = 'indicator';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.indicator).not.to.be.null;
        expect(getStepDOM(step).parts.text.part.contains('empty')).to.be.true;
      }

      stepper.stepType = 'title';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.indicator).to.be.null;
        expect(getStepDOM(step).parts.text.part.contains('empty')).to.be.false;
      }

      stepper.stepType = 'full';
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.indicator).not.to.be.null;
        expect(getStepDOM(step).parts.text.part.contains('empty')).to.be.false;
      }
    });

    it('should position the title according to `titlePosition` in horizontal orientation', async () => {
      // default auto -> bottom in horizontal
      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.headerContainer.part.contains('bottom'))
          .to.be.true;
      }

      for (const pos of ['bottom', 'top', 'end', 'start'] as const) {
        stepper.titlePosition = pos;
        await elementUpdated(stepper);

        for (const step of stepper.steps) {
          expect(getStepDOM(step).parts.headerContainer.part.contains(pos)).to
            .be.true;
        }
      }
    });

    it('should position the title according to `titlePosition` in vertical orientation', async () => {
      stepper.orientation = 'vertical';
      stepper.titlePosition = 'auto';
      await elementUpdated(stepper);

      // default auto -> end in vertical
      for (const step of stepper.steps) {
        expect(getStepDOM(step).parts.headerContainer.part.contains('end')).to
          .be.true;
      }

      for (const pos of ['bottom', 'top', 'end', 'start'] as const) {
        stepper.titlePosition = pos;
        await elementUpdated(stepper);

        for (const step of stepper.steps) {
          expect(getStepDOM(step).parts.headerContainer.part.contains(pos)).to
            .be.true;
        }
      }
    });

    it('should display content above headers when `contentTop` is true in horizontal orientation', async () => {
      for (const step of stepper.steps) {
        const dom = getStepDOM(step);
        const children = Array.from(step.renderRoot.children);
        expect(children.indexOf(dom.parts.headerContainer)).to.be.lessThan(
          children.indexOf(dom.parts.body)
        );
      }

      stepper.contentTop = true;
      await elementUpdated(stepper);

      for (const step of stepper.steps) {
        const dom = getStepDOM(step);
        const children = Array.from(step.renderRoot.children);
        expect(children.indexOf(dom.parts.headerContainer)).to.be.greaterThan(
          children.indexOf(dom.parts.body)
        );
      }
    });

    it('should not reorder content when `contentTop` is true in vertical orientation', async () => {
      stepper.orientation = 'vertical';
      stepper.contentTop = true;
      await elementUpdated(stepper);

      // contentTop has no effect in vertical mode — header always before body
      for (const step of stepper.steps) {
        const dom = getStepDOM(step);
        const children = Array.from(step.renderRoot.children);
        expect(children.indexOf(dom.parts.headerContainer)).to.be.lessThan(
          children.indexOf(dom.parts.body)
        );
      }
    });
  });

  describe('Animation duration CSS property', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should set `--animation-duration` to the default `animationDuration` on initialization', () => {
      expect(stepper.style.getPropertyValue('--animation-duration')).to.equal(
        `${stepper.animationDuration}ms`
      );
    });

    it('should update `--animation-duration` when `animationDuration` changes', async () => {
      stepper.animationDuration = 500;
      await elementUpdated(stepper);

      expect(stepper.style.getPropertyValue('--animation-duration')).to.equal(
        '500ms'
      );
    });

    it('should set `--animation-duration` to `0ms` when `horizontalAnimation` is `none`', async () => {
      stepper.horizontalAnimation = 'none';
      await elementUpdated(stepper);

      expect(stepper.style.getPropertyValue('--animation-duration')).to.equal(
        '0ms'
      );
    });

    it('should restore `--animation-duration` when `horizontalAnimation` changes from `none` to an animation type', async () => {
      stepper.horizontalAnimation = 'none';
      await elementUpdated(stepper);

      stepper.horizontalAnimation = 'slide';
      await elementUpdated(stepper);

      expect(stepper.style.getPropertyValue('--animation-duration')).to.equal(
        `${stepper.animationDuration}ms`
      );
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(async () => {
      stepper = await fixture(createStepper());
    });

    it('should focus the first/last step header on Home/End key press', async () => {
      const firstStepHeader = getStepDOM(stepper.steps[0]).parts.header;
      const lastStepHeader = getStepDOM(stepper.steps[4]).parts.header;

      lastStepHeader.focus();
      simulateKeyboard(lastStepHeader, 'Home');

      expect(firstStepHeader).to.equal(
        stepper.steps[0].shadowRoot!.activeElement
      );

      firstStepHeader.focus();
      simulateKeyboard(firstStepHeader, 'End');

      expect(lastStepHeader).to.equal(
        stepper.steps[4].shadowRoot!.activeElement
      );
    });

    it('should activate the focused step on Enter/Space key press', async () => {
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step1Header.focus();
      simulateKeyboard(step1Header, 'Enter');
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.true;

      const step2Header = getStepDOM(stepper.steps[2]).parts.header;
      step2Header.focus();
      simulateKeyboard(step2Header, ' ');
      await elementUpdated(stepper);

      expect(stepper.steps[1].active).to.be.false;
      expect(stepper.steps[2].active).to.be.true;
    });

    it('should navigate with ArrowRight/Left in horizontal orientation (LTR)', () => {
      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowRight');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowLeft');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should wrap around on ArrowRight/Left at the boundary', () => {
      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step4Header = getStepDOM(stepper.steps[4]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowLeft');
      expect(step4Header).to.equal(stepper.steps[4].shadowRoot!.activeElement);

      step4Header.focus();
      simulateKeyboard(step4Header, 'ArrowRight');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should skip disabled steps when navigating with Arrow keys', () => {
      stepper.steps[1].disabled = true;

      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step2Header = getStepDOM(stepper.steps[2]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowRight');
      expect(step2Header).to.equal(stepper.steps[2].shadowRoot!.activeElement);
    });

    it('should reverse ArrowRight/Left in horizontal orientation (RTL)', () => {
      stepper.dir = 'rtl';

      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowLeft');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowRight');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should navigate with ArrowLeft/Right in vertical position as well', async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowRight');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowLeft');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should navigate with ArrowLeft/Right in vertical orientation (RTL)', async () => {
      stepper.orientation = 'vertical';
      stepper.dir = 'rtl';
      await elementUpdated(stepper);

      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowLeft');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowRight');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should navigate with ArrowDown/Up in vertical orientation', async () => {
      stepper.orientation = 'vertical';
      await elementUpdated(stepper);

      const step0Header = getStepDOM(stepper.steps[0]).parts.header;
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;

      step0Header.focus();
      simulateKeyboard(step0Header, 'ArrowDown');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowUp');
      expect(step0Header).to.equal(stepper.steps[0].shadowRoot!.activeElement);
    });

    it('should not navigate with ArrowDown/Up in horizontal orientation', () => {
      const step1Header = getStepDOM(stepper.steps[1]).parts.header;
      step1Header.focus();

      simulateKeyboard(step1Header, 'ArrowDown');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);

      simulateKeyboard(step1Header, 'ArrowUp');
      expect(step1Header).to.equal(stepper.steps[1].shadowRoot!.activeElement);
    });
  });
});

function isStepAccessible(step: IgcStepComponent): boolean {
  return !getStepDOM(step).parts.headerContainer.part.contains('disabled');
}

function getStepDOM(step: IgcStepComponent) {
  const root = step.renderRoot;

  return {
    slots: {
      get default() {
        return root.querySelector<HTMLSlotElement>('slot:not([name])')!;
      },
      get indicator() {
        return root.querySelector<HTMLSlotElement>('slot[name="indicator"]')!;
      },
      get title() {
        return root.querySelector<HTMLSlotElement>('slot[name="title"]')!;
      },
      get subTitle() {
        return root.querySelector<HTMLSlotElement>('slot[name="subtitle"]')!;
      },
    },
    parts: {
      get header() {
        return root.querySelector<HTMLElement>('[data-step-header]')!;
      },
      get headerContainer() {
        return root.querySelector<HTMLElement>('[part~="header-container"]')!;
      },
      get body() {
        return root.querySelector<HTMLElement>('[part~="body"]')!;
      },
      get indentation() {
        return root.querySelector<HTMLElement>('[part="indentation"]')!;
      },
      get indicator() {
        return root.querySelector<HTMLElement>('[part="indicator"]')!;
      },
      get text() {
        return root.querySelector<HTMLElement>('[part~="text"]')!;
      },
      get title() {
        return root.querySelector<HTMLElement>('[part="title"]')!;
      },
      get subTitle() {
        return root.querySelector<HTMLElement>('[part="subtitle"]')!;
      },
      get select() {
        return root.querySelector<HTMLElement>('[part="select"]')!;
      },
      get label() {
        return root.querySelector<HTMLElement>('[part="label"]')!;
      },
    },
  };
}

function createStepper() {
  const steps = [1, 2, 3, 4, 5];

  return html`
    <igc-stepper>
      ${steps.map(
        (value) => html`
          <igc-step>
            <span slot="title">Step ${value}</span>
            <span>STEP ${value} CONTENT</span>
          </igc-step>
        `
      )}
    </igc-stepper>
  `;
}

function createLinearStepper() {
  return html`
    <igc-stepper linear>
      <igc-step invalid optional>
        <span slot="title">Step 1</span>
        <span>STEP 1 CONTENT</span>
      </igc-step>
      <igc-step invalid>
        <span slot="title">Step 2</span>
        <span>STEP 2 CONTENT</span>
      </igc-step>
      <igc-step invalid>
        <igc-icon slot="indicator" name="home"></igc-icon>
        <span slot="title">Step 3</span>
        <span>STEP 3 CONTENT</span>
      </igc-step>
    </igc-stepper>
  `;
}

function createDisabledStepper() {
  return html`
    <igc-stepper>
      <igc-step active>
        <span slot="title">Step 1</span>
        <span>STEP 1 CONTENT</span>
      </igc-step>
      <igc-step active disabled>
        <span slot="title">Step 2</span>
        <span>STEP 2 CONTENT</span>
      </igc-step>
      <igc-step>
        <igc-icon slot="indicator" name="home"></igc-icon>
      </igc-step>
      <igc-step>
        <span slot="title">Step 4</span>
        <span>STEP 4 CONTENT</span>
      </igc-step>
    </igc-stepper>
  `;
}
