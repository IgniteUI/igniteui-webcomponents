import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import IgcLinearProgressComponent from './linear-progress.js';

describe('Linear progress component', () => {
  let progress: IgcLinearProgressComponent;

  const updateProgress = async <
    T extends keyof Omit<IgcLinearProgressComponent, keyof HTMLElement>,
  >(
    prop: T,
    value: IgcLinearProgressComponent[T]
  ) => {
    Object.assign(progress, { [prop]: value });
    await elementUpdated(progress);
    await nextFrame();
  };

  before(() => {
    defineComponents(IgcLinearProgressComponent);
  });

  describe('DOM', () => {
    beforeEach(async () => {
      progress = await fixture<IgcLinearProgressComponent>(html`
        <igc-linear-progress></igc-linear-progress>
      `);
    });

    it('is accessible', async () => {
      await expect(progress).to.be.accessible();
      await expect(progress).shadowDom.to.be.accessible();
    });

    it('has correct initial property values', () => {
      const defaultProps: Partial<
        Record<keyof IgcLinearProgressComponent, any>
      > = {
        max: 100,
        value: 0,
        animationDuration: 500,
        striped: false,
        indeterminate: false,
        hideLabel: false,
        variant: 'primary',
        labelFormat: undefined,
        labelAlign: 'top-start',
      };

      for (const [prop, value] of Object.entries(defaultProps)) {
        expect(progress[prop as keyof IgcLinearProgressComponent]).to.equal(
          value
        );
      }
    });
  });

  describe('Attributes and Properties', () => {
    beforeEach(async () => {
      progress = await fixture<IgcLinearProgressComponent>(html`
        <igc-linear-progress animation-duration="0"></igc-linear-progress>
      `);
    });

    it('toggles the default label based on `hideLabel`', async () => {
      await updateProgress('hideLabel', true);
      expect(getDOM(progress).label).to.be.null;

      await updateProgress('hideLabel', false);
      expect(getDOM(progress).label).to.exist;
    });

    it('reflects the striped attribute', async () => {
      await updateProgress('striped', true);
      expect(getDOM(progress).striped).to.exist;

      await updateProgress('striped', false);
      expect(getDOM(progress).striped).to.be.null;
    });

    it('reflects the variant attribute', async () => {
      const variants: IgcLinearProgressComponent['variant'][] = [
        'primary',
        'success',
        'info',
        'danger',
        'warning',
      ];

      for (const variant of variants) {
        await updateProgress('variant', variant);
        expect(progress).to.have.attribute('variant', variant);
      }
    });

    it('updates label alignment', async () => {
      const alignments: IgcLinearProgressComponent['labelAlign'][] = [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
      ];

      for (const alignment of alignments) {
        await updateProgress('labelAlign', alignment);
        expect(progress).to.have.attribute('label-align', alignment);
      }
    });

    it('reflects the progress fill based on value', async () => {
      await updateProgress('value', 50);
      expect(getDOM(progress).fill).to.exist;
    });

    it('value is correctly reflected', async () => {
      await updateProgress('value', 50);
      expect(getDOM(progress).integerLabel).to.equal('50');
    });

    it('fractional values are correctly reflected', async () => {
      await updateProgress('value', 3.14);

      expect(getDOM(progress).integerLabel).to.equal('3');
      expect(getDOM(progress).fractionLabel).to.equal('14');
    });

    it('clamps negative values', async () => {
      await updateProgress('value', -100);

      expect(progress.value).to.equal(0);
      expect(getDOM(progress).integerLabel).to.equal('0');
    });

    it('clamps value larger than max', async () => {
      await updateProgress('value', 200);

      expect(progress.value).to.equal(100);
      expect(getDOM(progress).integerLabel).to.equal('100');
    });

    it('clamps value to new max when new max is less than current value', async () => {
      await updateProgress('value', 50);
      await updateProgress('max', 25);

      expect(progress.value).to.equal(25);
      expect(getDOM(progress).integerLabel).to.equal('100');
    });

    it('does not change value when max is changed and new max is greater than value', async () => {
      await updateProgress('value', 100);
      await updateProgress('max', 200);

      expect(progress.value).to.equal(100);
      expect(getDOM(progress).integerLabel).to.equal('50');
    });

    it('correctly reflects indeterminate attribute', async () => {
      await updateProgress('indeterminate', true);
      expect(getDOM(progress).indeterminate).to.exist;

      await updateProgress('indeterminate', false);
      expect(getDOM(progress).indeterminate).to.be.null;
    });

    it('hides the default label when in indeterminate mode', async () => {
      await updateProgress('indeterminate', true);
      expect(getDOM(progress).label).to.be.null;

      await updateProgress('indeterminate', false);
      expect(getDOM(progress).label).to.exist;
    });

    it('reflects updates to value in indeterminate mode and then switching to determinate', async () => {
      await updateProgress('indeterminate', true);
      await updateProgress('value', 50);
      await updateProgress('indeterminate', false);

      expect(progress.value).to.equal(50);
      expect(getDOM(progress).integerLabel).to.equal('50');
    });

    it('applies custom label format', async () => {
      expect(getDOM(progress).label.textContent).to.be.empty;

      await updateProgress('labelFormat', 'Task {0} of {1} completed');
      await updateProgress('value', 8);
      await updateProgress('max', 10);

      expect(getDOM(progress).customLabel.textContent).to.equal(
        'Task 8 of 10 completed'
      );
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        html`<igc-linear-progress>Custom Label</igc-linear-progress>`
      );
    });

    it('renders default slot content', async () => {
      const slot = getDOM(progress).slot;

      expect(slot).to.exist;
      expect(first(slot.assignedNodes()).textContent).to.equal('Custom Label');
    });

    it('`hideLabel` does not affect slotted label', async () => {
      await updateProgress('hideLabel', true);
      expect(first(getDOM(progress).slot.assignedNodes()).textContent).to.equal(
        'Custom Label'
      );
    });

    it('indeterminate does not affect slotted label', async () => {
      await updateProgress('indeterminate', true);
      expect(first(getDOM(progress).slot.assignedNodes()).textContent).to.equal(
        'Custom Label'
      );
    });
  });

  describe('Issues', () => {
    it('#1083 - setting value on initialization should not reset it', async () => {
      progress = document.createElement(IgcLinearProgressComponent.tagName);
      progress.value = 88;

      document.body.append(progress);
      await elementUpdated(progress);

      expect(progress.value).to.equal(88);
      progress.remove();
    });
  });
});

function getDOM(progress: IgcLinearProgressComponent) {
  return {
    get slot() {
      return progress.renderRoot.querySelector('slot')!;
    },
    get indeterminate() {
      return progress.renderRoot.querySelector<HTMLElement>(
        '[part~="indeterminate"]'
      )!;
    },
    get fill() {
      return progress.renderRoot.querySelector<HTMLElement>('[part~="fill"]')!;
    },
    get striped() {
      return progress.renderRoot.querySelector<HTMLElement>(
        '[part~="striped"]'
      )!;
    },
    get customLabel() {
      return progress.renderRoot.querySelector<HTMLElement>(
        '[part="label value"]'
      )!;
    },
    get label() {
      return progress.renderRoot.querySelector<HTMLElement>(
        '[part="label value counter"]'
      )!;
    },
    get integerLabel() {
      return getComputedStyle(
        progress.renderRoot.querySelector('[part~="counter"]')!
      ).getPropertyValue('--_progress-integer');
    },
    get fractionLabel() {
      return getComputedStyle(
        progress.renderRoot.querySelector('[part~="fraction"]')!
      ).getPropertyValue('--_progress-fraction');
    },
  };
}
