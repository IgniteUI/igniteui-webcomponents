import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';

import type IgcCircularGradientComponent from './circular-gradient.js';
import { IgcCircularProgressComponent, defineComponents } from '../../index.js';

describe('Circular progress component', () => {
  before(() => defineComponents(IgcCircularProgressComponent));

  let progress: IgcCircularProgressComponent;

  describe('', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress></igc-circular-progress>`
      );
    });

    it('is initialized with sensible defaults', async () => {
      expect(progress.max).to.equal(100);
      expect(progress.value).to.equal(0);
      expect(progress.animationDuration).to.equal(500);
      expect(progress.indeterminate).to.equal(false);
      expect(progress.hideLabel).to.equal(false);
      expect(progress.variant).to.equal('primary');
      expect(progress.labelFormat).to.equal(undefined);
    });

    it('is accessible', async () => {
      await expect(progress).to.be.accessible();
    });

    it('updates its value correctly', async () => {
      progress.value = 50;

      await elementUpdated(progress);
      expect(progress.value).to.equal(50);
    });

    it('correctly handles negative values', async () => {
      progress.value = -10;

      await elementUpdated(progress);
      expect(progress.value).to.equal(0);
    });

    it('correctly handles values > max', async () => {
      progress.value = 200;

      await elementUpdated(progress);
      expect(progress.value).to.equal(100);
    });

    it('correctly clamps its value when max is changed and new max < value', async () => {
      progress.value = 50;
      progress.max = 25;

      await elementUpdated(progress);
      expect(progress.value).to.equal(25);
    });

    it('does not change its value when max is changed and new max > value', async () => {
      progress.value = 95;
      progress.max = 150;

      await elementUpdated(progress);
      expect(progress.value).to.equal(95);
    });

    it('updates the value when it is increased/decreased', async () => {
      progress.value++;

      await elementUpdated(progress);
      expect(progress.value).to.equal(1);

      progress.value--;

      await elementUpdated(progress);
      expect(progress.value).to.equal(0);
    });

    it('correctly reflects indeterminate modifier', async () => {
      progress.indeterminate = true;

      await elementUpdated(progress);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;
    });

    it('correctly sets properties through attribute values', async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress
          value="50"
          max="150"
          label-format="{0} val"
          animation-duration="2100"
          variant="warning"
        ></igc-circular-progress>`
      );

      await aTimeout(0);

      expect(progress.value).to.equal(50);
      expect(progress.max).to.equal(150);
      expect(progress.labelFormat).to.equal('{0} val');
      expect(progress.animationDuration).to.equal(2100);
      expect(progress.variant).to.equal('warning');

      progress.setAttribute('indeterminate', '');
      await elementUpdated(progress);

      expect(progress.indeterminate).to.equal(true);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;

      progress.removeAttribute('indeterminate');
      await elementUpdated(progress);

      expect(progress.indeterminate).to.equal(false);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;
      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.max = 20;
      await elementUpdated(progress);

      expect(progress.value).to.equal(20);
    });

    it('correctly reflects updated value in indeterminate mode when switched to determinate', async () => {
      progress.indeterminate = true;
      await elementUpdated(progress);

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;

      progress.value = 50;
      progress.indeterminate = false;
      await elementUpdated(progress);

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;
      expect(progress.value).to.equal(50);
    });

    it('correctly reflects updated max in indeterminate mode when switched to determinate', async () => {
      progress.indeterminate = true;
      progress.value = 100;
      await elementUpdated(progress);

      progress.max = 80;
      await elementUpdated(progress);

      progress.indeterminate = false;
      await elementUpdated(progress);

      expect(progress.value).to.equal(80);
      expect((progress as any).percentage).to.equal(100);

      progress.indeterminate = true;
      await elementUpdated(progress);

      progress.max = 100;
      await elementUpdated(progress);

      progress.indeterminate = false;
      await elementUpdated(progress);

      expect(progress.value).to.equal(80);
      expect((progress as any).percentage).to.equal(80);
    });

    it('handles animations correctly when toggling indeterminate and rtl mode', async () => {
      progress.indeterminate = true;
      await elementUpdated(progress);

      let animations = progress
        .shadowRoot!.querySelector('[part~="svg"]')
        ?.getAnimations() as Animation[];

      expect(animations.length).to.equal(1);
      expect(animations[0]).to.be.instanceOf(CSSAnimation);
      expect((animations[0] as CSSAnimation).animationName).to.equal(
        'rotate-center'
      );

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;

      progress.indeterminate = false;
      await elementUpdated(progress);

      animations = progress
        .shadowRoot!.querySelector('[part~="svg"]')
        ?.getAnimations() as CSSTransition[];

      animations.forEach((anim) => {
        expect(anim).to.be.instanceOf(CSSTransition);
        expect(anim).not.to.be.instanceOf(CSSAnimation);
      });

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;

      progress.indeterminate = true;
      await elementUpdated(progress);

      animations = progress
        .shadowRoot!.querySelector('[part~="svg"]')
        ?.getAnimations() as Animation[];

      expect(animations.length).to.equal(1);
      expect(animations[0]).to.be.instanceOf(CSSAnimation);
      expect((animations[0] as CSSAnimation).animationName).to.equal(
        'rotate-center'
      );

      progress.dir = 'rtl';
      progress.indeterminate = true;
      await elementUpdated(progress);

      const svgElement = progress.shadowRoot!.querySelector(
        'svg'
      ) as SVGElement;
      expect(getComputedStyle(svgElement).animationDirection).to.equal(
        'reverse'
      );
    });

    it('hides the default label when in indeterminate mode', async () => {
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.indeterminate = true;

      await elementUpdated(progress);
      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;
    });

    it('shows/hides the default label depending on the hideLabel property', async () => {
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.hideLabel = true;

      await elementUpdated(progress);
      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;
    });

    it('indeterminate and hideLabel properties should not affect the slotted label', async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress>
          <div>Label</div>
        </igc-circular-progress>`
      );
      let defaultLabel =
        progress.shadowRoot!.querySelector(`slot[part="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.hideLabel = true;

      await elementUpdated(progress);
      defaultLabel = progress.shadowRoot!.querySelector(`slot[part="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.indeterminate = true;

      await elementUpdated(progress);
      defaultLabel = progress.shadowRoot!.querySelector(`slot[part="label"]`);
      expect(defaultLabel).not.to.be.null;
    });

    it('correctly reflects its variant', async () => {
      const variants = ['primary', 'success', 'info', 'danger', 'warning'];

      for (const variant of variants) {
        progress.variant = variant as any;
        await elementUpdated(progress);
        expect(progress).to.have.attribute('variant', variant);
      }
    });

    it('correctly applies a custom label format', async () => {
      let label = progress
        .shadowRoot!.querySelector('span[part~="label"]')
        ?.textContent?.trim();
      expect(label).to.equal('0%');

      progress.labelFormat = 'Task {0} of {1} completed';
      progress.value = 8;
      progress.max = 10;

      await elementUpdated(progress);

      label = progress
        .shadowRoot!.querySelector('span[part~="label"]')
        ?.textContent?.trim();
      expect(label).to.equal('Task 8 of 10 completed');
    });

    it('is able to define a gradient color using the igc-circular-gradient elements instead of solid via the exposed gradient slot', async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress>
          <igc-circular-gradient slot="gradient" opacity="0.5">
          </igc-circular-gradient>
          <igc-circular-gradient
            slot="gradient"
            offset="50%"
            color="#ff0079"
            opacity="0.8"
          >
          </igc-circular-gradient>
          <igc-circular-gradient slot="gradient" offset="100%" color="#1eccd4">
          </igc-circular-gradient>
        </igc-circular-progress>`
      );

      await elementUpdated(progress);

      const gradientElements = (progress as any).gradientElements;
      const linearGradient = progress.shadowRoot!.querySelector(
        'linearGradient'
      ) as SVGLinearGradientElement;
      const stopElements = Array.from(
        linearGradient.children
      ) as SVGStopElement[];

      expect(gradientElements.length).to.equal(stopElements?.length);

      gradientElements.forEach(
        (el: IgcCircularGradientComponent, idx: number) => {
          expect(stopElements[idx]).to.have.attribute('stop-color', el.color);
          expect(stopElements[idx]).to.have.attribute('offset', el.offset);
          expect(stopElements[idx]).to.have.attribute(
            'stop-opacity',
            el.opacity.toString()
          );
        }
      );
    });

    it('renders proper aria attributes', async () => {
      let svgElement = progress.shadowRoot!.querySelector('svg');
      expect(svgElement).to.have.attribute('role', 'progressbar');
      expect(svgElement).to.have.attribute('aria-valuemin', '0');
      expect(svgElement).to.have.attribute(
        'aria-valuemax',
        progress.max.toString()
      );
      expect(svgElement).to.have.attribute(
        'aria-valuenow',
        progress.value.toString()
      );

      progress.max = 150;
      progress.value = 50;
      await elementUpdated(progress);

      svgElement = progress.shadowRoot!.querySelector('svg');
      expect(svgElement).to.have.attribute('aria-valuemax', '150');
      expect(svgElement).to.have.attribute('aria-valuenow', '50');

      progress.indeterminate = true;
      await elementUpdated(progress);

      svgElement = progress.shadowRoot!.querySelector('svg');
      expect(svgElement).not.to.have.attribute('aria-valuenow');
    });
  });
});
