import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  pageDownKey,
  pageUpKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { asPercent } from '../common/util.js';
import {
  FormAssociatedTestBed,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcRangeSliderComponent from './range-slider.js';
import type { IgcSliderBaseComponent } from './slider-base.js';
import IgcSliderComponent from './slider.js';

describe('Slider component', () => {
  describe('Regular', () => {
    let slider: IgcSliderComponent;

    before(() => {
      defineComponents(IgcSliderComponent);
    });

    beforeEach(async () => {
      slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
    });

    it('is accessible', async () => {
      await expect(slider).shadowDom.not.to.be.accessible();
      await expect(slider).lightDom.not.to.be.accessible();

      slider.ariaLabel = 'Slider thumb value';
      slider.requestUpdate();
      await elementUpdated(slider);

      await expect(slider).shadowDom.to.be.accessible();
      await expect(slider).lightDom.to.be.accessible();
    });

    it('value should be restricted by min value', async () => {
      slider.min = 10;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);

      slider.value = 15;
      await elementUpdated(slider);
      expect(slider.value).to.eq(15);

      slider.value = 5;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);
    });

    it('value should be restricted by max value', async () => {
      slider.max = 10;
      await elementUpdated(slider);
      expect(slider.value).to.eq(0);

      slider.value = 9;
      await elementUpdated(slider);
      expect(slider.value).to.eq(9);

      slider.value = 11;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);
    });

    it('value should be restricted by lowerBound value', async () => {
      slider.lowerBound = 10;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);

      slider.value = 15;
      await elementUpdated(slider);
      expect(slider.value).to.eq(15);

      slider.value = 5;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);
    });

    it('value should be restricted by upperBound value', async () => {
      slider.upperBound = 10;
      await elementUpdated(slider);
      expect(slider.value).to.eq(0);

      slider.value = 9;
      await elementUpdated(slider);
      expect(slider.value).to.eq(9);

      slider.value = 11;
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);
    });

    it('value should be restricted by step value', async () => {
      slider.step = 2;
      await elementUpdated(slider);

      slider.value = 5;
      await elementUpdated(slider);
      expect(slider.value).to.eq(4);
    });

    it('value should be changed when clicking and dragging the slider and corresponding events are fired', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      simulatePointerDown(slider, { clientX: x + width / 2 });
      await elementUpdated(slider);

      expect(slider.value).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: 50 });

      eventSpy.resetHistory();
      simulatePointerMove(slider, { clientX: x + width * 0.7 });
      await elementUpdated(slider);

      expect(slider.value).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: 70 });

      eventSpy.resetHistory();

      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.value).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 70 });
    });

    it('events should not be emitted once thumbs reaches end boundary even if pointer events are still fired', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      const sliderCenterX = {
        clientX: x + width / 2,
      } satisfies PointerEventInit;

      const deltaX = { x: width * 0.25 };

      simulatePointerDown(slider, sliderCenterX);
      await elementUpdated(slider);

      expect(slider.value).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: 50 });

      // Simulate 10 pointer moves with stacking delta = 1/4 of the slider's width
      simulatePointerMove(slider, sliderCenterX, deltaX, 10);
      await elementUpdated(slider);

      expect(slider.value).to.equal(100);

      // 1 igcInput for pointerDown + 2 more for each pointermove till the end
      expect(eventSpy.callCount).to.equal(3);
      expect(eventSpy.lastCall).calledWithExactly('igcInput', {
        detail: 100,
      });

      eventSpy.resetHistory();

      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.value).to.eq(100);
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 100 });
    });

    it('track fill and thumb should be positioned correctly according to the current value', async () => {
      slider.value = 23;
      await elementUpdated(slider);

      const { track, thumbs } = getDOM(slider);

      expect(track.fill.style.width).to.eq('23%');
      expect(thumbs.current.style.insetInlineStart).to.eq('23%');
    });

    it('thumb should have correct aria attributes set.', async () => {
      slider.value = 23;
      slider.setAttribute('aria-label', 'Price');
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);

      const {
        thumbs: { current: thumb },
      } = getDOM(slider);

      expect(slider.hasAttribute('aria-label')).to.be.true;
      expect(thumb.getAttribute('role')).to.eq('slider');
      expect(thumb.ariaValueMin).to.eq('0');
      expect(thumb.ariaValueMax).to.eq('100');
      expect(thumb.ariaValueNow).to.eq('23');
      expect(thumb.ariaValueText).to.eq('$23.00');
      expect(thumb.ariaDisabled).to.eq('false');
      expect(thumb.ariaLabel).to.eq('Price');
      await expect(slider).to.be.accessible();
    });

    it('stepUp/stepDown method should increase/decrease the value', async () => {
      slider.step = 2;
      slider.value = 50;
      await elementUpdated(slider);

      slider.stepUp();
      await elementUpdated(slider);
      expect(slider.value).to.eq(52);

      slider.stepDown();
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);

      slider.stepUp(2);
      await elementUpdated(slider);
      expect(slider.value).to.eq(54);

      slider.stepDown(3);
      await elementUpdated(slider);
      expect(slider.value).to.eq(48);
    });

    it('min value should be restricted by max value', async () => {
      slider.min = 90;
      await elementUpdated(slider);
      expect(slider.min).to.eq(90);

      slider.min = 110;
      await elementUpdated(slider);
      expect(slider.min).to.eq(90);
    });

    it('max value should be restricted by min value', async () => {
      slider.min = 50;
      slider.max = 60;
      await elementUpdated(slider);
      expect(slider.min).to.eq(50);
      expect(slider.max).to.eq(60);

      slider.max = 40;
      await elementUpdated(slider);
      expect(slider.max).to.eq(60);
    });

    it('lower bound should be restricted by the min, max and upper bound values', async () => {
      slider.min = 10;
      slider.max = 90;
      slider.lowerBound = 0;
      await elementUpdated(slider);
      expect(slider.lowerBound).to.eq(10);

      slider.lowerBound = 100;
      await elementUpdated(slider);
      expect(slider.lowerBound).to.eq(90);

      slider.lowerBound = 20;
      await elementUpdated(slider);
      expect(slider.lowerBound).to.eq(20);

      slider.upperBound = 50;
      slider.lowerBound = 60;
      await elementUpdated(slider);
      expect(slider.lowerBound).to.eq(50);

      slider.min = 55;
      await elementUpdated(slider);
      expect(slider.lowerBound).to.eq(55);
    });

    it('upper bound should be restricted by the min, max and lower bound values', async () => {
      slider.min = 10;
      slider.max = 90;
      slider.upperBound = 100;
      await elementUpdated(slider);
      expect(slider.upperBound).to.eq(90);

      slider.upperBound = 0;
      await elementUpdated(slider);
      expect(slider.upperBound).to.eq(10);

      slider.upperBound = 80;
      await elementUpdated(slider);
      expect(slider.upperBound).to.eq(80);

      slider.lowerBound = 50;
      slider.upperBound = 40;
      await elementUpdated(slider);
      expect(slider.upperBound).to.eq(50);

      slider.lowerBound = 30;
      slider.max = 45;
      await elementUpdated(slider);
      expect(slider.upperBound).to.eq(45);
    });

    it('any value on the track should be accepted when step is set to 0', async () => {
      const { x, width } = slider.getBoundingClientRect();

      slider.step = 0;
      await elementUpdated(slider);

      simulatePointerDown(slider, { clientX: x + width * 0.54321 });
      await elementUpdated(slider);

      expect(slider.value).to.eq(54.321);
    });

    it('primary tick marks should be displayed when primaryTickMarks is greater than 0', async () => {
      const { ticks } = getDOM(slider);

      expect(ticks.primary).lengthOf(0);

      slider.primaryTicks = 3;
      await elementUpdated(slider);

      expect(ticks.primary).lengthOf(3);

      const { x: sliderX, width: sliderWidth } = slider.getBoundingClientRect();
      const primary = ticks.primary;

      for (const [i, tick] of primary.entries()) {
        const { x } = tick.getBoundingClientRect();
        const expected = sliderX + (i * sliderWidth) / (primary.length - 1);
        expect(x).approximately(
          expected,
          2,
          `tick ${i}: ${x}px not close to ${expected}px`
        );
      }
    });

    it('secondary tick marks should be displayed when secondaryTickMarks is greater than 0', async () => {
      const { ticks } = getDOM(slider);

      expect(ticks.secondary).lengthOf(0);

      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);

      expect(ticks.secondary).lengthOf(8);
      expect(ticks.all).lengthOf(11);

      const allTicks = ticks.all;
      const { x: sliderX, width: sliderWidth } = slider.getBoundingClientRect();

      for (const [i, tick] of allTicks.entries()) {
        const { x } = tick.getBoundingClientRect();
        const expected = sliderX + (i * sliderWidth) / (allTicks.length - 1);

        expect(x).approximately(
          expected,
          3,
          `tick ${i}: ${x}px not close to ${expected}px`
        );
        expect(tick.dataset.primary).to.equal(i % 5 === 0 ? 'true' : 'false');
      }
    });

    it('primary tick mark labels should be displayed based on hidePrimaryLabels', async () => {
      const { ticks } = getDOM(slider);

      slider.primaryTicks = 3;
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(3);
      expect(ticks.labels).lengthOf(3);

      const tickLabels = ticks.labels;

      for (const [i, label] of tickLabels.entries()) {
        expect(label.textContent?.trim()).to.equal(
          `${asPercent(i, tickLabels.length - 1)}`
        );
      }

      slider.hidePrimaryLabels = true;
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(3);
      expect(ticks.labels).lengthOf(0);
    });

    it('secondary tick mark labels should be displayed based on hideSecondaryLabels', async () => {
      const { ticks } = getDOM(slider);

      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(11);
      expect(ticks.labels).lengthOf(11);

      const tickLabels = ticks.labels;

      for (const [i, label] of tickLabels.entries()) {
        expect(label.textContent?.trim()).to.equal(
          `${asPercent(i, tickLabels.length - 1)}`
        );
      }

      slider.hideSecondaryLabels = true;
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(11);
      expect(ticks.labels).lengthOf(3);
    });

    it('tick marks and their labels should be displayed correctly when tickOrientation is start, end or mirror', async () => {
      const { ticks, track } = getDOM(slider);

      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(11);
      expect(ticks.labels).lengthOf(11);
      expect(slider.tickOrientation).to.eq('end');

      const { y: trackTop } = track.element.getBoundingClientRect();

      for (const tick of ticks.all) {
        expect(tick.getBoundingClientRect().y).greaterThan(trackTop);
      }

      slider.tickOrientation = 'start';
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(11);
      expect(ticks.labels).lengthOf(11);

      for (const tick of ticks.all) {
        expect(tick.getBoundingClientRect().y).lessThan(trackTop);
      }

      slider.tickOrientation = 'mirror';
      await elementUpdated(slider);

      expect(ticks.all).lengthOf(22);
      expect(ticks.labels).lengthOf(22);

      for (const [i, tick] of ticks.all.entries()) {
        i < 11
          ? expect(tick.getBoundingClientRect().y).lessThan(trackTop)
          : expect(tick.getBoundingClientRect().y).greaterThan(trackTop);
      }
    });

    it('tick mark labels should be displayed correctly when tickLabelRotation is 0, 90 or -90', async () => {
      const { ticks } = getDOM(slider);

      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);

      expect(ticks.labelsInner).lengthOf(11);
      expect(slider.tickLabelRotation).to.eq(0);

      ticks.labelsInner
        .map((tick) => getComputedStyle(tick))
        .forEach(({ marginInlineStart, marginBlock, writingMode, transform }) =>
          expect([
            marginInlineStart,
            marginBlock,
            writingMode,
            transform,
          ]).to.eql(['-50%', '0px', 'horizontal-tb', 'none'])
        );

      slider.tickLabelRotation = 90;
      await elementUpdated(slider);

      ticks.labelsInner
        .map((tick) => getComputedStyle(tick))
        .forEach(({ marginInlineStart, marginBlock, writingMode, transform }) =>
          expect([
            marginInlineStart,
            marginBlock,
            writingMode,
            transform,
          ]).to.eql(['0px', '-9px', 'vertical-rl', 'none'])
        );

      slider.tickLabelRotation = -90;
      await elementUpdated(slider);

      ticks.labelsInner
        .map((tick) => getComputedStyle(tick))
        .forEach(({ marginInlineStart, marginBlock, writingMode, transform }) =>
          expect([
            marginInlineStart,
            marginBlock,
            writingMode,
            transform,
          ]).to.eql([
            '0px',
            '-9px',
            'vertical-rl',
            'matrix(-1, 0, 0, -1, 0, 0)',
          ])
        );
    });

    it('track should be continuos or discrete based on discreteTrack', async () => {
      const { track } = getDOM(slider);

      slider.step = 10;
      await elementUpdated(slider);

      expect(track.steps).to.be.null;

      slider.discreteTrack = true;
      await elementUpdated(slider);

      expect(track.steps).not.to.be.null;
      expect(
        track.steps.querySelector('line')!.getAttribute('stroke-dasharray')
      ).not.to.be.null;
    });

    it('UI interactions should not be possible when the slider is disabled', async () => {
      const { thumbs } = getDOM(slider);

      expect(thumbs.current.tabIndex).to.eq(0);
      expect(getComputedStyle(slider).pointerEvents).to.eq('auto');

      slider.disabled = true;
      await elementUpdated(slider);

      expect(thumbs.current.tabIndex).to.eq(-1);
      expect(thumbs.current.ariaDisabled).to.eq('true');
      expect(getComputedStyle(slider).pointerEvents).to.eq('none');
    });

    it('tick mark labels and thumb tooltip should be formatted by the value format properties', async () => {
      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      slider.value = 23;
      slider.valueFormat = 'P: {0}';
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);

      const {
        ticks: { labels },
        thumbs,
      } = getDOM(slider);

      expect(labels).lengthOf(11);
      expect(thumbs.label.textContent?.trim()).to.equal('P: $23.00');

      for (const [i, label] of labels.entries()) {
        expect(label.textContent?.trim()).to.equal(
          `P: $${asPercent(i, labels.length - 1)}.00`
        );
      }
    });

    it('tick mark labels and thumb tooltip should use provided labels', async () => {
      const labels = ['Low', 'Medium', 'High'];
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider primary-ticks="3">
          ${labels.map((l) => html`<igc-slider-label>${l}</igc-slider-label>`)}
        </igc-slider>`
      );
      await elementUpdated(slider);

      const { ticks, thumbs } = getDOM(slider);

      expect(ticks.labels).lengthOf(3);
      expect(thumbs.label.textContent?.trim()).to.equal(labels[0]);
      expect(thumbs.current.ariaValueText).to.equal(labels[0]);

      for (const [i, label] of ticks.labels.entries()) {
        expect(label.textContent?.trim()).to.equal(labels[i]);
      }

      slider.value = 1;
      await elementUpdated(slider);

      expect(thumbs.label.textContent?.trim()).to.equal(labels[1]);
      expect(thumbs.current.ariaValueText).to.equal(labels[1]);
    });

    it('thumb tooltip should be displayed on hovering the thumb', async () => {
      const { thumbs } = getDOM(slider);

      expect(thumbs.label.style.opacity).to.eq('0');

      thumbs.current.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(slider);
      expect(thumbs.label.style.opacity).to.eq('1');

      thumbs.current.dispatchEvent(new PointerEvent('pointerleave'));
      await elementUpdated(slider);
      await aTimeout(800);
      expect(thumbs.label.style.opacity).to.eq('0');
    });

    it('thumb tooltip should not be displayed when hideTooltip is set to true', async () => {
      slider.hideTooltip = true;
      await elementUpdated(slider);

      const { thumbs } = getDOM(slider);

      expect(thumbs.label).to.be.null;

      thumbs.current.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(slider);
      expect(thumbs.label).to.be.null;
    });

    it('value should be increased or decreased with 1 step when pressing right/top or down/left arrow keys', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      slider.step = 2;
      slider.value = 50;
      await elementUpdated(slider);

      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);
      expect(slider.value).to.eq(52);
      expect(eventSpy).to.be.calledTwice;
      expect(eventSpy).calledWith('igcInput', { detail: 52 });
      expect(eventSpy).calledWith('igcChange', { detail: 52 });

      eventSpy.resetHistory();
      simulateKeyboard(slider, arrowLeft);
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
      expect(eventSpy).calledWith('igcInput', { detail: 50 });
      expect(eventSpy).calledWith('igcChange', { detail: 50 });

      eventSpy.resetHistory();
      simulateKeyboard(slider, arrowDown);
      await elementUpdated(slider);
      expect(slider.value).to.eq(48);
      expect(eventSpy).calledWith('igcInput', { detail: 48 });
      expect(eventSpy).calledWith('igcChange', { detail: 48 });

      eventSpy.resetHistory();
      simulateKeyboard(slider, arrowUp);
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
      expect(eventSpy).calledWith('igcInput', { detail: 50 });
      expect(eventSpy).calledWith('igcChange', { detail: 50 });
    });

    it('fractional step', async () => {
      const eventSpy = spy(slider, 'emitEvent');

      const step = 0.25;
      const lower = 50 - step;
      const higher = 50 + step;

      slider.step = step;
      slider.value = 50;
      await elementUpdated(slider);

      simulateKeyboard(slider, arrowLeft);
      await elementUpdated(slider);

      expect(slider.value).to.equal(lower);
      expect(eventSpy).calledWith('igcInput', { detail: lower });
      expect(eventSpy).calledWith('igcChange', { detail: lower });

      eventSpy.resetHistory();
      slider.value = 50;

      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);

      expect(slider.value).to.equal(higher);
      expect(eventSpy).calledWith('igcInput', { detail: higher });
      expect(eventSpy).calledWith('igcChange', { detail: higher });
    });

    it('if step is set to 0 it should default to 1 for keyboard selection', async () => {
      const eventSpy = spy(slider, 'emitEvent');

      const value = Math.PI;
      slider.step = 0;
      slider.value = value;

      simulateKeyboard(slider, arrowLeft);
      await elementUpdated(slider);

      expect(slider.value).to.equal(value - 1);
      expect(eventSpy).calledWith('igcInput', { detail: value - 1 });
      expect(eventSpy).calledWith('igcChange', { detail: value - 1 });

      eventSpy.resetHistory();
      slider.value = value;

      simulateKeyboard(slider, arrowRight);
      expect(slider.value).to.equal(value + 1);
      expect(eventSpy).calledWith('igcInput', { detail: value + 1 });
      expect(eventSpy).calledWith('igcChange', { detail: value + 1 });
    });

    it('value should be increased/decreased with 1/10th of the slider range when pressing page up/down keys', async () => {
      slider.step = 2;
      slider.value = 50;
      await elementUpdated(slider);

      simulateKeyboard(slider, pageUpKey);
      await elementUpdated(slider);
      expect(slider.value).to.eq(60);

      simulateKeyboard(slider, pageDownKey);
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
    });

    it('value should be set to minimum when pressing home key', async () => {
      const eventSpy = spy(slider, 'emitEvent');

      slider.min = 10;
      slider.value = 50;
      await elementUpdated(slider);

      // Simulate 2 presses
      simulateKeyboard(slider, homeKey, 2);
      await elementUpdated(slider);

      expect(slider.value).to.eq(10);

      // Only one igcInput and one igcChange events should be fired
      expect(eventSpy.callCount).to.equal(2);
    });

    it('value should be set to maximum when pressing end key', async () => {
      const eventSpy = spy(slider, 'emitEvent');

      slider.max = 90;
      slider.value = 50;
      await elementUpdated(slider);

      // Simulate 2 presses
      simulateKeyboard(slider, endKey, 2);
      await elementUpdated(slider);

      expect(slider.value).to.eq(90);

      // Only one igcInput and one igcChange events should be fired
      expect(eventSpy.callCount).to.equal(2);
    });
  });

  describe('Range', () => {
    let slider: IgcRangeSliderComponent;

    before(() => {
      defineComponents(IgcRangeSliderComponent);
    });

    beforeEach(async () => {
      slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider></igc-range-slider>`
      );
    });

    it('is accessible', async () => {
      await expect(slider).shadowDom.not.to.be.accessible();
      await expect(slider).lightDom.not.to.be.accessible();

      slider.thumbLabelUpper = 'Thumb upper';
      slider.thumbLabelLower = 'Thumb lower';
      await elementUpdated(slider);

      await expect(slider).shadowDom.to.be.accessible();
      await expect(slider).lightDom.to.be.accessible();
    });

    it('lower value should be restricted by min value', async () => {
      slider.min = 10;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);

      slider.lower = 15;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(15);

      slider.lower = 5;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);
    });

    it('lower value should be restricted by max value', async () => {
      slider.max = 10;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(0);

      slider.lower = 9;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(9);

      slider.lower = 11;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);
    });

    it('lower value should be restricted by lowerBound value', async () => {
      slider.lowerBound = 10;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);

      slider.lower = 15;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(15);

      slider.lower = 5;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);
    });

    it('lower value should be restricted by upperBound value', async () => {
      slider.upperBound = 10;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(0);

      slider.lower = 9;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(9);

      slider.lower = 11;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(10);
    });

    it('lower value should be restricted by step value', async () => {
      slider.step = 2;
      await elementUpdated(slider);

      slider.lower = 5;
      await elementUpdated(slider);
      expect(slider.lower).to.eq(4);
    });

    it('upper value should be restricted by min value', async () => {
      slider.min = 10;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);

      slider.upper = 15;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(15);

      slider.upper = 5;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);
    });

    it('upper value should be restricted by max value', async () => {
      slider.max = 10;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(0);

      slider.upper = 9;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(9);

      slider.upper = 11;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);
    });

    it('upper value should be restricted by lowerBound value', async () => {
      slider.lowerBound = 10;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);

      slider.upper = 15;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(15);

      slider.upper = 5;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);
    });

    it('upper value should be restricted by upperBound value', async () => {
      slider.upperBound = 10;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(0);

      slider.upper = 9;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(9);

      slider.upper = 11;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(10);
    });

    it('upper value should be restricted by step value', async () => {
      slider.step = 2;
      await elementUpdated(slider);

      slider.upper = 5;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(4);
    });

    it('closest thumb value should be changed when clicking and dragging the slider and corresponding events are fired', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      simulatePointerDown(slider, { clientX: x + width * 0.5 });
      await elementUpdated(slider);

      expect(slider.upper).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 0, upper: 50 },
      });

      eventSpy.resetHistory();
      simulatePointerMove(slider, { clientX: x + width * 0.7 });
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 0, upper: 70 },
      });

      eventSpy.resetHistory();
      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 0, upper: 70 },
      });

      eventSpy.resetHistory();
      simulatePointerDown(slider, { clientX: x + width * 0.2 });
      await elementUpdated(slider);

      expect(slider.lower).to.eq(20);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 20, upper: 70 },
      });

      eventSpy.resetHistory();
      simulatePointerMove(slider, { clientX: x + width * 0.4 });
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(slider.lower).to.eq(40);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 40, upper: 70 },
      });

      eventSpy.resetHistory();
      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(slider.lower).to.eq(40);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 40, upper: 70 },
      });
    });

    it('when the lower thumb is dragged beyond the upper thumb, the upper thumb should be focused and its dragging should continue.', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();
      const { thumbs } = getDOM(slider);

      slider.lower = 20;
      slider.upper = 50;
      await elementUpdated(slider);

      simulatePointerDown(slider, { clientX: x + width * 0.25 });
      await elementUpdated(slider);

      expect(slider.lower).to.eq(25);
      expect(slider.upper).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 25, upper: 50 },
      });
      expect(slider).to.eq(document.activeElement);
      expect(thumbs.lower).to.eq(slider.shadowRoot?.activeElement);

      eventSpy.resetHistory();
      simulatePointerMove(slider, { clientX: x + width * 0.7 });
      await elementUpdated(slider);

      expect(slider.lower).to.eq(50);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 50, upper: 70 },
      });
      expect(slider).to.eq(document.activeElement);
      expect(thumbs.upper).to.eq(slider.shadowRoot?.activeElement);

      eventSpy.resetHistory();
      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.lower).to.eq(50);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 50, upper: 70 },
      });
    });

    it('track fill and thumbs should be positioned correctly according to the current values', async () => {
      const { track, thumbs } = getDOM(slider);

      slider.lower = 20;
      slider.upper = 70;
      await elementUpdated(slider);

      expect(track.fill.style.width).to.eq('50%');
      expect(track.fill.style.insetInlineStart).to.eq('20%');
      expect(thumbs.lower.style.insetInlineStart).to.eq('20%');
      expect(thumbs.upper.style.insetInlineStart).to.eq('70%');
    });

    it('thumbs should have correct aria attributes set.', async () => {
      const { thumbs } = getDOM(slider);

      slider.lower = 20;
      slider.upper = 70;
      slider.thumbLabelLower = 'Price From';
      slider.thumbLabelUpper = 'Price To';
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);

      expect(thumbs.lower.getAttribute('role')).to.eq('slider');
      expect(thumbs.lower.ariaValueMin).to.eq('0');
      expect(thumbs.lower.ariaValueMax).to.eq('100');
      expect(thumbs.lower.ariaValueNow).to.eq('20');
      expect(thumbs.lower.ariaValueText).to.eq('$20.00');
      expect(thumbs.lower.ariaDisabled).to.eq('false');
      expect(thumbs.lower.ariaLabel).to.eq('Price From');

      expect(thumbs.upper.getAttribute('role')).to.eq('slider');
      expect(thumbs.upper.ariaValueMin).to.eq('0');
      expect(thumbs.upper.ariaValueMax).to.eq('100');
      expect(thumbs.upper.ariaValueNow).to.eq('70');
      expect(thumbs.upper.ariaValueText).to.eq('$70.00');
      expect(thumbs.upper.ariaDisabled).to.eq('false');
      expect(thumbs.upper.ariaLabel).to.eq('Price To');

      await expect(slider).to.be.accessible();
    });
  });

  describe('Initial rendering race condition', () => {
    let slider: IgcSliderComponent;

    before(() => defineComponents(IgcSliderComponent));

    beforeEach(async () => {
      slider = await fixture<IgcSliderComponent>(
        html`<igc-slider
          lower-bound="-100"
          upper-bound="100"
          value="33"
          min="-200"
          max="200"
        ></igc-slider>`
      );
    });

    it('is correctly initialized', async () => {
      /**
       * This tests for an issue where setting the lower/upper-bound attributes
       * before the min/max ones, would incorrectly reset the *-bound attributes based
       * on the min/max values.
       */

      expect(slider.value).to.equal(33);
      expect(slider.max).to.equal(200);
      expect(slider.min).to.equal(-200);
      expect(slider.lowerBound).to.equal(-100);
      expect(slider.upperBound).to.equal(100);

      simulateKeyboard(slider, homeKey);
      await elementUpdated(slider);

      expect(slider.value).to.equal(-100);

      simulateKeyboard(slider, endKey);
      await elementUpdated(slider);

      expect(slider.value).to.equal(100);
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcSliderComponent>(
      html`<igc-slider name="slider" value="3"></igc-slider>`
    );

    beforeEach(async () => {
      await spec.setup(IgcSliderComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.equal('3');

      spec.element.value = 66;
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('66');
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 4;
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.equal(3);
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils custom constraints', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });
});

/** Returns Shadow DOM parts of the slider component */
function getDOM<T = HTMLElement>(slider: IgcSliderBaseComponent) {
  const root = slider.shadowRoot!;

  return {
    /** Track element parts */
    track: {
      /** The track element itself */
      get element() {
        return root.querySelector(`[part='track']`) as T;
      },
      /** Track element fill part */
      get fill() {
        return root.querySelector(`[part='fill']`) as T;
      },
      /** Track element steps part */
      get steps() {
        return root.querySelector(`[part='steps']`) as T;
      },
    },
    /** Slider's thumb(s) */
    thumbs: {
      /** The thumb element. */
      get current() {
        return root.querySelector(`[part='thumb']`) as T;
      },
      /** The lower thumb (range-slider) */
      get lower() {
        return root.getElementById('thumbFrom') as T;
      },
      /** The upper thumb (range-slider) */
      get upper() {
        return root.getElementById('thumbTo') as T;
      },
      /** The label of the current thumb */
      get label() {
        return root.querySelector(`[part='thumb-label']`) as T;
      },
    },
    /** Slider ticks */
    ticks: {
      /** All tick parts */
      get all() {
        return Array.from(root.querySelectorAll(`[part='tick']`)) as T[];
      },
      /** Primary tick parts */
      get primary() {
        return Array.from(
          root.querySelectorAll(`[part='tick'][data-primary='true']`)
        ) as T[];
      },
      /** Secondary tick parts */
      get secondary() {
        return Array.from(
          root.querySelectorAll(`[part='tick'][data-primary='false']`)
        ) as T[];
      },
      /** Tick labels */
      get labels() {
        return Array.from(root.querySelectorAll(`[part='tick-label']`)) as T[];
      },
      /** Tick labels inner part */
      get labelsInner() {
        return Array.from(
          root.querySelectorAll(`[part='tick-label-inner']`)
        ) as T[];
      },
    },
  };
}
