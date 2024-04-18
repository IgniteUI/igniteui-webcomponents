import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { getAnimationsFor } from '../common/utils.spec.js';
import IgcLinearProgressComponent from './linear-progress.js';

function createBasicProgress() {
  return html`<igc-linear-progress></igc-linear-progress>`;
}

function createNonAnimatingProgress() {
  return html`<igc-linear-progress
    animation-duration="0"
  ></igc-linear-progress>`;
}

function createSlottedNonAnimatingProgress() {
  return html`
    <igc-linear-progress animation-duration="0">
      Custom Label
    </igc-linear-progress>
  `;
}

describe('Linear progress component', () => {
  let progress: IgcLinearProgressComponent;

  const queryShadowRoot = (qs: string) =>
    progress.shadowRoot!.querySelector(qs);

  const getLabelPart = () => queryShadowRoot(`[part~='value']`);
  const getIndeterminatePart = () => queryShadowRoot(`[part~='indeterminate']`);
  const getFillPart = () => queryShadowRoot(`[part~='fill']`);
  const getLabelSlotNodes = () =>
    (queryShadowRoot(`slot[part='label']`) as HTMLSlotElement).assignedNodes({
      flatten: true,
    });

  const updateProgress = async <T extends keyof IgcLinearProgressComponent>(
    prop: T,
    value: IgcLinearProgressComponent[T]
  ) => {
    Object.assign(progress, { [prop]: value });
    await elementUpdated(progress);
    await nextFrame();
    await nextFrame();
  };

  before(() => defineComponents(IgcLinearProgressComponent));

  describe('DOM', () => {
    beforeEach(
      async () =>
        (progress = await fixture<IgcLinearProgressComponent>(
          createBasicProgress()
        ))
    );

    it('is accessible', async () => {
      await expect(progress).to.be.accessible();
      await expect(progress).shadowDom.to.be.accessible();
    });

    it('is initialized with sensible defaults', async () => {
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
    beforeEach(
      async () =>
        (progress = await fixture<IgcLinearProgressComponent>(
          createNonAnimatingProgress()
        ))
    );

    it('show/hides the default label based on hideLabel', async () => {
      await updateProgress('hideLabel', true);
      expect(getLabelPart()).to.be.null;

      await updateProgress('hideLabel', false);
      expect(getLabelPart()).not.to.be.null;
    });

    it('reflects striped attribute', async () => {
      await updateProgress('striped', true);
      expect(queryShadowRoot(`[part~='striped']`)).not.to.be.null;
    });

    it('reflects variant attribute', async () => {
      const variants: IgcLinearProgressComponent['variant'][] = [
        'primary',
        'success',
        'info',
        'danger',
        'warning',
      ];

      for (const variant of variants) {
        await updateProgress('variant', variant);
        expect(queryShadowRoot(`[part~='${variant}']`)).not.to.be.null;
      }
    });

    it('value is correctly reflected', async () => {
      await updateProgress('value', 50);

      expect(getLabelPart()?.textContent).to.equal('50%');
    });

    it('clamps negative values', async () => {
      await updateProgress('value', -100);

      expect(progress.value).to.equal(0);
      expect(getLabelPart()?.textContent).to.equal('0%');
    });

    it('clamps value larger than max', async () => {
      await updateProgress('value', 200);

      expect(progress.value).to.equal(100);
      expect(getLabelPart()?.textContent).to.equal('100%');
    });

    it('clamps value to new max when new max is less than current value', async () => {
      await updateProgress('value', 50);
      await updateProgress('max', 25);

      expect(progress.value).to.equal(25);
      expect(getLabelPart()?.textContent).to.equal('100%');
    });

    it('does not change value when max is changed and new max is greater than value', async () => {
      await updateProgress('value', 100);
      await updateProgress('max', 200);

      expect(progress.value).to.equal(100);
      expect(getLabelPart()?.textContent).to.equal('50%');
    });

    it('correctly reflects indeterminate attribute', async () => {
      await updateProgress('indeterminate', true);
      expect(getIndeterminatePart()).not.to.be.null;

      await updateProgress('indeterminate', false);
      expect(getIndeterminatePart()).to.be.null;
    });

    it('hides the default label when in indeterminate mode', async () => {
      await updateProgress('indeterminate', true);
      expect(getLabelPart()).to.be.null;

      await updateProgress('indeterminate', false);
      expect(getLabelPart()).not.to.be.null;
    });

    it('reflects updates to value in indeterminate mode and then switching to determinate', async () => {
      await updateProgress('indeterminate', true);
      await updateProgress('value', 50);
      await updateProgress('indeterminate', false);

      expect(progress.value).to.equal(50);
      expect(getLabelPart()?.textContent).to.equal('50%');
    });

    it('reflects updates to max in indeterminate mode and then switching to determinate', async () => {
      await updateProgress('indeterminate', true);
      await updateProgress('value', 100);
      await updateProgress('max', 80);
      await updateProgress('max', 100);

      await updateProgress('indeterminate', false);

      expect(progress.value).to.equal(80);
      expect(getLabelPart()?.textContent).to.equal('80%');
    });

    it('switches animations when indeterminate <-> determinate', async () => {
      await updateProgress('indeterminate', true);

      let animations = getAnimationsFor(getFillPart()!);

      expect(animations).not.to.be.empty;
      expect((animations[0] as CSSAnimation).animationName).to.equal(
        'indeterminate-primary'
      );

      await updateProgress('indeterminate', false);

      animations = getAnimationsFor(getFillPart()!);
      expect(animations).to.be.empty;
    });

    it('applies custom label format', async () => {
      expect(getLabelPart()?.textContent?.trim()).to.equal('0%');

      await updateProgress('labelFormat', 'Task {0} of {1} completed');
      await updateProgress('value', 8);
      await updateProgress('max', 10);

      expect(getLabelPart()?.textContent?.trim()).to.equal(
        'Task 8 of 10 completed'
      );
    });
  });

  describe('Slots', () => {
    beforeEach(
      async () =>
        (progress = await fixture<IgcLinearProgressComponent>(
          createSlottedNonAnimatingProgress()
        ))
    );

    it('default slot projection', async () => {
      expect(getLabelSlotNodes()).not.to.be.empty;
    });

    it('hideLabel attribute does not affect slotted label', async () => {
      await updateProgress('hideLabel', true);
      expect(getLabelSlotNodes()).not.to.be.empty;
    });

    it('indeterminate attribute does not affect slotted label', async () => {
      await updateProgress('indeterminate', true);
      expect(getLabelSlotNodes()).not.to.be.empty;
    });
  });

  describe('issue 1083', () => {
    it('setting value on initializing should not reset it', async () => {
      progress = document.createElement(IgcLinearProgressComponent.tagName);
      progress.value = 88;

      document.body.appendChild(progress);
      await elementUpdated(progress);

      expect(progress.value).to.equal(88);

      progress.remove();
    });
  });
});
