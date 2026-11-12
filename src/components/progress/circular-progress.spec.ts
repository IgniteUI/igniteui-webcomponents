import {
  elementUpdated,
  expect,
  fixture,
  fixtureSync,
  html,
  nextFrame,
} from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { allowMotion } from '#internals/testing/helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { configureTheme } from '#theming/config.js';
import IgcCircularGradientComponent from './circular-gradient.js';
import IgcCircularProgressComponent from './circular-progress.js';

describe('Circular progress component', () => {
  let progress: IgcCircularProgressComponent;

  const updateProgress = async <
    T extends keyof Omit<IgcCircularProgressComponent, keyof HTMLElement>,
  >(
    prop: T,
    value: IgcCircularProgressComponent[T]
  ) => {
    Object.assign(progress, { [prop]: value });
    await elementUpdated(progress);
    await nextFrame();
  };

  before(() => {
    defineComponents(IgcCircularProgressComponent);
  });

  describe('DOM', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(html`
        <igc-circular-progress></igc-circular-progress>
      `);
    });

    it('is accessible', async () => {
      await expect(progress).to.be.accessible();
      await expect(progress).shadowDom.to.be.accessible();
    });

    it('is initialized with sensible defaults', async () => {
      const defaultProps: Partial<
        Record<keyof IgcCircularProgressComponent, any>
      > = {
        max: 100,
        value: 0,
        animationDuration: 500,
        hideLabel: false,
        variant: 'primary',
        labelFormat: undefined,
      };

      for (const [prop, value] of Object.entries(defaultProps)) {
        expect(progress[prop as keyof IgcCircularProgressComponent]).to.equal(
          value
        );
      }
    });
  });

  describe('Attributes and Properties', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(html`
        <igc-circular-progress animation-duration="0"></igc-circular-progress>
      `);
    });

    it('show/hides the default label based on hideLabel', async () => {
      await updateProgress('hideLabel', true);
      expect(getDOM(progress).label).to.be.null;

      await updateProgress('hideLabel', false);
      expect(getDOM(progress).label).to.exist;
    });

    it('reflects variant attribute', async () => {
      const variants: IgcCircularProgressComponent['variant'][] = [
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

    it('value is correctly reflected', async () => {
      await updateProgress('value', 50);

      expect(getDOM(progress).integerLabel).to.equal('50');
    });

    it('fractional values are correctly reflected', async () => {
      await updateProgress('value', 3.14);

      expect(getDOM(progress).integerLabel).to.equal('3');
      expect(getDOM(progress).fractionLabel).to.equal('14');
    });

    it('carries a fraction that rounds up into the integer', async () => {
      await updateProgress('value', 12.996);

      expect(getDOM(progress).integerLabel).to.equal('13');
      expect(getDOM(progress).fraction).to.be.null;
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

    it('reflects updates to max in indeterminate mode and then switching to determinate', async () => {
      await updateProgress('indeterminate', true);
      await updateProgress('value', 100);
      await updateProgress('max', 80);
      await updateProgress('max', 100);
      await updateProgress('indeterminate', false);

      expect(progress.value).to.equal(80);
      expect(getDOM(progress).integerLabel).to.equal('80');
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
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress>Custom Label</igc-circular-progress>`
      );
    });

    it('renders default slot content', async () => {
      const slot = getDOM(progress).slot;

      expect(slot).to.exist;
      expect(firstOf(slot.assignedNodes()).textContent).to.equal(
        'Custom Label'
      );
    });

    it('`hideLabel` does not affect slotted label', async () => {
      await updateProgress('hideLabel', true);
      expect(
        firstOf(getDOM(progress).slot.assignedNodes()).textContent
      ).to.equal('Custom Label');
    });

    it('indeterminate does not affect slotted label', async () => {
      await updateProgress('indeterminate', true);
      expect(
        firstOf(getDOM(progress).slot.assignedNodes()).textContent
      ).to.equal('Custom Label');
    });
  });

  describe('Gradients', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(html`
        <igc-circular-progress>
          <igc-circular-gradient
            slot="gradient"
            offset="50%"
            color="#ff0079"
            opacity="0.8"
          ></igc-circular-gradient>
        </igc-circular-progress>
      `);
    });

    it('renders slotted gradient correctly', async () => {
      const gradients = progress.querySelectorAll(
        IgcCircularGradientComponent.tagName
      );

      expect(gradients).to.have.lengthOf(1);

      const stop = firstOf(getDOM(progress).gradients);
      expect(stop).to.have.attribute('offset', '50%');
      expect(stop).to.have.attribute('stop-color', '#ff0079');
      expect(stop).to.have.attribute('stop-opacity', '0.8');
    });
  });

  describe('Styles', () => {
    const style = (part: string) =>
      getComputedStyle(progress.renderRoot.querySelector(`[part~="${part}"]`)!);

    /** The indeterminate durations of the ring and of its fill, by theme. */
    function durations(): Record<string, string[]> {
      const result: Record<string, string[]> = {};

      try {
        for (const theme of ['bootstrap', 'material', 'fluent'] as const) {
          configureTheme(theme);
          result[theme] = [
            style('svg').animationDuration,
            style('fill').animationDuration,
          ];
        }
      } finally {
        configureTheme('bootstrap');
      }

      return result;
    }

    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(html`
        <igc-circular-progress
          style="--ig-circular-bar-diameter: 16px"
        ></igc-circular-progress>
      `);
    });

    it('takes the box of the ring, and follows text-align as a block', () => {
      const ring = getDOM(progress).svg;
      const center = ({ left, width }: DOMRect) => left + width / 2;

      expect(progress.getBoundingClientRect().height).to.equal(
        ring.getBoundingClientRect().height
      );

      const grid = fixtureSync<HTMLDivElement>(
        html`<div
          style="display: grid; width: 200px; text-align: center"
        ></div>`
      );
      grid.append(progress);

      expect(progress.getBoundingClientRect().height).to.equal(
        ring.getBoundingClientRect().height
      );
      expect(center(ring.getBoundingClientRect())).to.be.closeTo(
        center(grid.getBoundingClientRect()),
        0.5
      );
    });

    it('runs the indeterminate animation at a third of its speed with reduced motion', async () => {
      await updateProgress('indeterminate', true);

      expect(durations()).to.eql({
        bootstrap: ['2.25s', '0s'],
        material: ['9s', '4.5s'],
        fluent: ['0s', '6s'],
      });
    });

    it('shows a new value at once with reduced motion', () => {
      expect(style('fill').transitionDuration).to.equal('0s');
    });

    describe('with motion', () => {
      allowMotion();

      it('runs the indeterminate animation at full speed', async () => {
        await updateProgress('indeterminate', true);

        expect(durations()).to.eql({
          bootstrap: ['0.75s', '0s'],
          material: ['3s', '1.5s'],
          fluent: ['0s', '2s'],
        });
      });

      it('animates a new value', () => {
        expect(style('fill').transitionDuration).to.equal('0.5s');
      });
    });

    describe('in forced colors', () => {
      before(() => emulateMedia({ forcedColors: 'active' }));
      after(() => emulateMedia({ forcedColors: 'none' }));

      function expectSystemColors(stops: Iterable<SVGStopElement>): void {
        const reference = fixtureSync<HTMLDivElement>(
          html`<div style="color: GrayText"></div>`
        );

        expect(style('track').stroke).to.equal(
          getComputedStyle(reference).color
        );

        for (const stop of stops) {
          expect(getComputedStyle(stop).stopColor).to.equal(
            getComputedStyle(progress).color
          );
          expect(getComputedStyle(stop).stopOpacity).to.equal('1');
        }
      }

      it('draws the ring in the text color and the track in GrayText', () => {
        // Not the text color, so the test fails without the rule.
        progress.style.setProperty(
          '--ig-circular-bar-fill-color-default',
          'rgb(255, 0, 0)'
        );

        expectSystemColors(progress.renderRoot.querySelectorAll('stop'));
      });

      it('draws a custom gradient in the text color', async () => {
        progress = await fixture<IgcCircularProgressComponent>(html`
          <igc-circular-progress>
            <igc-circular-gradient
              slot="gradient"
              color="#ff0079"
              opacity="0.2"
            ></igc-circular-gradient>
          </igc-circular-progress>
        `);
        const custom =
          progress.renderRoot.querySelectorAll<SVGStopElement>(
            'stop:not([part])'
          );

        expect(custom).lengthOf(1);
        expectSystemColors(custom);
      });
    });
  });

  describe('Accessibility', () => {
    const getARIA = <T extends keyof ARIAMixin>(name: T) =>
      internalsOf(progress)?.getARIA(name);

    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(html`
        <igc-circular-progress animation-duration="0"></igc-circular-progress>
      `);
    });

    it('reports the shown percentage of `max` as the value text', async () => {
      const cases: [max: number, value: number, text: string][] = [
        [200, 50, '25%'],
        [3, 1, '33.33%'],
        [100, 1.05, '1.05%'],
        [100, 12.996, '13%'],
        [100, 99.996, '100%'],
        [100, 1.005, '1.01%'],
        [0.5, 0.25, '50%'],
        [0, 0, '0%'],
      ];

      for (const [max, value, text] of cases) {
        await updateProgress('max', max);
        await updateProgress('value', value);

        const message = `${value} of ${max}`;
        expect(getARIA('ariaValueNow'), message).to.equal(String(value));
        expect(getARIA('ariaValueMax'), message).to.equal(String(max));
        expect(getARIA('ariaValueText'), message).to.equal(text);
        expect(
          Number.parseFloat(getDOM(progress).wholeLabel),
          message
        ).to.equal(Number.parseFloat(text));
      }
    });

    it('reports the formatted label as the value text', async () => {
      await updateProgress('labelFormat', 'Task {0} of {1}');
      await updateProgress('max', 10);
      await updateProgress('value', 8);

      expect(getARIA('ariaValueText')).to.equal('Task 8 of 10');
    });

    it('reports no value in indeterminate mode', async () => {
      await updateProgress('value', 40);
      await updateProgress('indeterminate', true);

      expect(getARIA('ariaValueNow')).to.be.null;
      expect(getARIA('ariaValueText')).to.be.null;
    });
  });

  describe('Issues', () => {
    it('#1083 - setting value on initialization should not reset it', async () => {
      progress = document.createElement(IgcCircularProgressComponent.tagName);
      progress.value = 88;

      document.body.append(progress);
      await elementUpdated(progress);

      expect(progress.value).to.equal(88);
      progress.remove();
    });
  });
});

function getDOM(progress: IgcCircularProgressComponent) {
  return {
    get slot() {
      return progress.renderRoot.querySelector<HTMLSlotElement>(
        'slot:not([name])'
      )!;
    },
    get svg() {
      return progress.renderRoot.querySelector<SVGElement>('[part~="svg"]')!;
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
    get fraction() {
      return progress.renderRoot.querySelector<HTMLElement>(
        '[part~="fraction"]'
      );
    },
    get wholeLabel() {
      return getComputedStyle(
        progress.renderRoot.querySelector('[part~="base"]')!
      ).getPropertyValue('--_progress-whole');
    },
    get fractionLabel() {
      return getComputedStyle(
        progress.renderRoot.querySelector('[part~="fraction"]')!
      ).getPropertyValue('--_progress-fraction');
    },
    get gradients() {
      return Array.from(
        progress.renderRoot.querySelectorAll('linearGradient stop')!
      );
    },
  };
}
