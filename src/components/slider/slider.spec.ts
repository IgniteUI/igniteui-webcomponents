import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  escapeKey,
  homeKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerEnter,
  simulatePointerLeave,
  simulatePointerMove,
  simulateScroll,
} from '#internals/testing/simulate.spec.js';
import { isPopoverOpen } from '#internals/utils/dom.js';
import { asPercent } from '#internals/utils/math.js';
import IgcDialogComponent from '../dialog/dialog.js';
import { setPopoverPositionStrategy } from '../popover/position/types.js';
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
      expect(slider.value).to.eq(6);
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

      for (const {
        marginInlineStart,
        marginBlock,
        writingMode,
        transform,
      } of ticks.labelsInner.map((tick) => getComputedStyle(tick))) {
        expect([marginInlineStart, marginBlock, writingMode, transform]).to.eql(
          ['-50%', '0px', 'horizontal-tb', 'none']
        );
      }

      slider.tickLabelRotation = 90;
      await elementUpdated(slider);

      for (const {
        marginInlineStart,
        marginBlock,
        writingMode,
        transform,
      } of ticks.labelsInner.map((tick) => getComputedStyle(tick))) {
        expect([marginInlineStart, marginBlock, writingMode, transform]).to.eql(
          ['0px', '-9px', 'vertical-rl', 'none']
        );
      }

      slider.tickLabelRotation = -90;
      await elementUpdated(slider);

      for (const {
        marginInlineStart,
        marginBlock,
        writingMode,
        transform,
      } of ticks.labelsInner.map((tick) => getComputedStyle(tick))) {
        expect([marginInlineStart, marginBlock, writingMode, transform]).to.eql(
          ['0px', '-9px', 'vertical-rl', 'matrix(-1, 0, 0, -1, 0, 0)']
        );
      }
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

      simulateKeyboard(slider, endKey, 2);
      await elementUpdated(slider);

      expect(slider.value).to.eq(90);

      // Only one igcInput and one igcChange events should be fired
      expect(eventSpy.callCount).to.equal(2);
    });
  });

  describe('Label association', () => {
    before(() => {
      defineComponents(IgcSliderComponent);
    });

    runExternalLabelAssociationTests({
      tagName: IgcSliderComponent.tagName,
      getNativeInput: (host) =>
        (host as IgcSliderComponent).renderRoot.querySelector<HTMLElement>(
          '[part="thumb"]'
        )!,
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
      expect(slider.lower).to.eq(6);
    });

    it('upper value should be restricted by min value', async () => {
      slider.min = 10;
      await elementUpdated(slider);
      expect(slider.upper).to.eq(100);

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
      expect(slider.upper).to.eq(10);

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
      expect(slider.upper).to.eq(100);

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
      expect(slider.upper).to.eq(10);

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
      expect(slider.upper).to.eq(6);
    });

    it('closest thumb value should be changed when clicking and dragging the slider and corresponding events are fired', async () => {
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      slider.upper = 0;
      await elementUpdated(slider);

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

    before(() => defineComponents(IgcSliderComponent, IgcRangeSliderComponent));

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
      // Bound attributes set before min/max must keep their values.
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

    it('normalizes a value set before the constraint that invalidates it', async () => {
      // Attributes apply in markup order, so `value` meets the default `max` first.
      slider = await fixture<IgcSliderComponent>(
        html`<igc-slider value="100" max="50"></igc-slider>`
      );

      expect(slider.max).to.equal(50);
      expect(slider.value).to.equal(50);
    });

    it('normalizes range values set before the constraint that invalidates them', async () => {
      const rangeSlider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider
          lower="20"
          upper="100"
          max="50"
        ></igc-range-slider>`
      );

      expect(rangeSlider.max).to.equal(50);
      expect(rangeSlider.upper).to.equal(50);
    });
  });

  describe('Value resolution', () => {
    before(() => defineComponents(IgcSliderComponent, IgcRangeSliderComponent));

    function createSlider(attributes: Record<string, number>) {
      const slider = document.createElement(IgcSliderComponent.tagName);

      for (const [name, value] of Object.entries(attributes)) {
        slider.setAttribute(name, String(value));
      }

      return fixture<IgcSliderComponent>(slider);
    }

    /** A native range counts the steps from its `value` without a `min`. */
    function nativeValue(attributes: Record<string, number>): number {
      const input = document.createElement('input');
      input.type = 'range';

      for (const [name, value] of Object.entries({ min: 0, ...attributes })) {
        input.setAttribute(name, String(value));
      }

      return input.valueAsNumber;
    }

    it('snaps a value to the nearest step, as a native range input does', async () => {
      const cases: Record<string, number>[] = [
        { step: 5, value: 7 },
        { step: 5, value: 8 },
        { step: 5, value: 7.5 },
        { step: 2, value: 5 },
        { step: 1, value: 2.4999999999 },
        { min: 3, step: 5, value: 9 },
        { min: -10, max: 10, step: 3, value: 0 },
        { max: 100, step: 30, value: 100 },
        { max: 1, step: 0.1, value: 0.35 },
        { max: 1, step: 0.01, value: 0.5 },
      ];

      for (const attributes of cases) {
        const slider = await createSlider(attributes);
        expect(slider.value, JSON.stringify(attributes)).to.equal(
          nativeValue(attributes)
        );
      }
    });

    it('snaps on a large or offset scale, as a native range input does', async () => {
      const cases: Record<string, number>[] = [
        { max: 2e15, step: 1, value: 1e15 },
        { max: 2e15, step: 1, value: 999_999_999_999_999.4 },
        { min: 1000.1, max: 1002, step: 0.1, value: 1001.55 },
      ];

      for (const attributes of cases) {
        const slider = await createSlider(attributes);
        expect(slider.value, JSON.stringify(attributes)).to.equal(
          nativeValue(attributes)
        );
      }
    });

    it('keeps a value on a fractional step (#2433)', async () => {
      const slider = document.createElement(IgcSliderComponent.tagName);
      Object.assign(slider, { min: 0, max: 1, step: 0.01, value: 0.5 });
      await fixture(slider);

      expect(slider.value).to.equal(0.5);

      // Each constraint change resolves the value again.
      for (const lowerBound of [0.1, 0.2, 0.3]) {
        slider.lowerBound = lowerBound;
        await elementUpdated(slider);
      }

      expect(slider.value).to.equal(0.5);
    });

    it('moves by a fractional step up to the end of the scale', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider max="1" step="0.1"></igc-slider>`
      );
      const values: number[] = [];

      for (let i = 0; i < 10; i++) {
        simulateKeyboard(slider, arrowRight);
        await elementUpdated(slider);
        values.push(slider.value);
      }

      expect(values).to.eql([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);

      slider.value = 0.4;
      slider.stepUp();
      expect(slider.value).to.equal(0.5);
    });

    it('forgets a value as set that changes nothing', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider step="10" value="50"></igc-slider>`
      );

      slider.value = 52;
      await elementUpdated(slider);
      slider.step = 1;
      await elementUpdated(slider);
      expect(slider.value).to.equal(50);

      slider.value = 100;
      await elementUpdated(slider);
      slider.value = 150;
      await elementUpdated(slider);
      slider.max = 200;
      await elementUpdated(slider);
      expect(slider.value).to.equal(100);
    });

    it('applies the attributes in any order (#2434)', async () => {
      const fractional = await fixture<IgcSliderComponent>(
        html`<igc-slider value="0.5" min="0" max="1" step="0.01"></igc-slider>`
      );
      const aboveMax = await fixture<IgcSliderComponent>(
        html`<igc-slider value="150" max="200"></igc-slider>`
      );
      const belowMin = await fixture<IgcSliderComponent>(
        html`<igc-slider value="-5" min="-10"></igc-slider>`
      );

      expect(fractional.value).to.equal(0.5);
      expect(aboveMax.value).to.equal(150);
      expect(belowMin.value).to.equal(-5);
    });

    it('applies the properties of one task in any order', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );

      Object.assign(slider, { value: 150, min: 120, max: 200 });
      await elementUpdated(slider);

      expect([slider.min, slider.max, slider.value]).to.eql([120, 200, 150]);
    });

    it('accepts a min above the default max when max follows', async () => {
      const above = await fixture<IgcSliderComponent>(
        html`<igc-slider min="150" max="200"></igc-slider>`
      );
      const below = await fixture<IgcSliderComponent>(
        html`<igc-slider max="-10" min="-20"></igc-slider>`
      );

      expect([above.min, above.max, above.value]).to.eql([150, 200, 150]);
      expect([below.min, below.max, below.value]).to.eql([-20, -10, -10]);
    });

    it('keeps the previous scale when min ends above max', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );

      slider.min = 150;
      slider.max = 120;
      await elementUpdated(slider);

      expect([slider.min, slider.max]).to.eql([0, 100]);
    });

    it('counts the steps from min, also with a bound off the steps', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider
          step="5"
          lower-bound="3"
          upper-bound="97"
          value="9"
        ></igc-slider>`
      );

      expect(slider.value).to.equal(10);

      simulateKeyboard(slider, homeKey);
      await elementUpdated(slider);
      expect(slider.value).to.equal(5);

      simulateKeyboard(slider, endKey);
      await elementUpdated(slider);
      expect(slider.value).to.equal(95);
    });

    it('keeps the clamped value when no step lies between the bounds', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider
          step="5"
          lower-bound="11"
          upper-bound="14"
          value="12"
        ></igc-slider>`
      );
      const eventSpy = spy(slider, 'emitEvent');

      expect(slider.value).to.equal(12);

      // Each pass resolves the current value again.
      for (let i = 0; i < 3; i++) {
        const current = slider.value;
        slider.value = current;
        await elementUpdated(slider);
      }

      expect(slider.value).to.equal(12);

      simulateKeyboard(slider, arrowLeft);
      await elementUpdated(slider);
      expect(slider.value).to.equal(11);
      expect(eventSpy.callCount).to.equal(2);

      simulateKeyboard(slider, arrowLeft);
      await elementUpdated(slider);
      expect(eventSpy.callCount).to.equal(2);
    });

    it('drags by whole steps when no step lies between the bounds', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider step="5" lower-bound="1" upper-bound="4"></igc-slider>`
      );
      const { x, width } = slider.getBoundingClientRect();
      const at = (value: number) => ({ clientX: x + (width * value) / 100 });
      const values: number[] = [];

      simulatePointerDown(slider, at(2.5));
      values.push(slider.value);

      for (const value of [3.2, 3.9]) {
        simulatePointerMove(slider, at(value));
        values.push(slider.value);
      }

      simulateLostPointerCapture(slider);

      // As with the keys, the value goes to the other bound.
      expect(values).to.eql([1, 1, 4]);
    });

    it('drags to the higher step at a fractional midpoint', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider max="1" step="0.1" style="width: 200px"></igc-slider>`
      );
      const { left, width } = slider
        .shadowRoot!.querySelector('[part="base"]')!
        .getBoundingClientRect();
      // 70 of 200 px gives exactly 0.35, and 0.35 / 0.1 is 3.4999999999999996.
      const at = (value: number) => ({ clientX: left + width * value });

      simulatePointerDown(slider, at(0.35));
      expect(slider.value).to.equal(0.4);

      simulatePointerMove(slider, at(0.15));
      expect(slider.value).to.equal(0.2);

      simulateLostPointerCapture(slider);
    });

    it('moves a continuous slider exactly to a fractional bound', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider step="0" lower-bound="0.1" value="1.3"></igc-slider>`
      );
      const ranged = await fixture<IgcSliderComponent>(
        html`<igc-slider step="0" upper-bound="0.9" value="0.2"></igc-slider>`
      );

      // In binary, 1.3 + (0.1 - 1.3) is above 0.1 and 0.2 + (0.9 - 0.2) is
      // below 0.9, so the clamp keeps them.
      simulateKeyboard(slider, homeKey);
      simulateKeyboard(ranged, endKey);

      expect(slider.value).to.equal(0.1);
      expect(ranged.value).to.equal(0.9);
    });

    it('emits no events when the snapped value does not change', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider step="30" value="90"></igc-slider>`
      );
      const eventSpy = spy(slider, 'emitEvent');

      simulateKeyboard(slider, endKey);
      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);

      expect(slider.value).to.equal(90);
      expect(eventSpy.callCount).to.equal(0);
    });

    it('keeps the previous step for a negative step', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider step="5" value="50"></igc-slider>`
      );

      slider.step = -5;
      expect(slider.step).to.equal(5);

      slider.setAttribute('step', '-1');
      expect(slider.step).to.equal(5);

      simulateKeyboard(slider, arrowUp);
      await elementUpdated(slider);
      expect(slider.value).to.equal(55);
    });

    it('restores min, max and step when the labels go', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider min="10" max="50" step="5" value="20"></igc-slider>`
      );
      const labels = ['Low', 'Medium', 'High'].map((text) =>
        Object.assign(document.createElement('igc-slider-label'), {
          textContent: text,
        })
      );

      slider.append(...labels);
      await waitUntil(() => slider.max === 2);
      await elementUpdated(slider);

      expect([slider.min, slider.max, slider.step]).to.eql([0, 2, 1]);
      expect(slider.value).to.equal(2);

      for (const label of labels) {
        label.remove();
      }

      await waitUntil(() => slider.max === 50);
      await elementUpdated(slider);

      expect([slider.min, slider.max, slider.step]).to.eql([10, 50, 5]);
      expect(slider.value).to.equal(10);
    });

    it('renders a scale where min equals max', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider max="0" discrete-track></igc-slider>`
      );
      const { track, thumbs } = getDOM(slider);
      const { x, width } = slider.getBoundingClientRect();

      expect(track.fill.style.width).to.equal('0%');
      expect(thumbs.current.style.insetInlineStart).to.equal('0%');
      expect(track.steps).to.be.null;

      simulatePointerDown(slider, { clientX: x + width / 2 });
      simulateLostPointerCapture(slider);
      await elementUpdated(slider);

      expect(slider.value).to.equal(0);
    });

    describe('Range', () => {
      it('applies lower, upper and max in any order', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider
            lower="120"
            upper="180"
            max="200"
          ></igc-range-slider>`
        );

        expect([slider.lower, slider.upper]).to.eql([120, 180]);
      });

      it('swaps a crossed pair', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider upper="20" lower="80"></igc-range-slider>`
        );
        const { track } = getDOM(slider);

        expect([slider.lower, slider.upper]).to.eql([20, 80]);
        expect(track.fill.style.insetInlineStart).to.equal('20%');
        expect(track.fill.style.width).to.equal('60%');

        slider.lower = 90;
        await elementUpdated(slider);

        expect([slider.lower, slider.upper]).to.eql([80, 90]);
      });

      it('forgets a lower or upper value as set that changes nothing', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider
            step="10"
            lower="20"
            upper="60"
          ></igc-range-slider>`
        );

        slider.lower = 22;
        slider.upper = 58;
        await elementUpdated(slider);
        slider.step = 1;
        await elementUpdated(slider);

        expect([slider.lower, slider.upper]).to.eql([20, 60]);
      });

      it('follows upperBound again after the upper attribute is removed', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider upper="30"></igc-range-slider>`
        );

        slider.removeAttribute('upper');
        await elementUpdated(slider);
        expect(slider.upper).to.equal(100);

        slider.max = 50;
        await elementUpdated(slider);
        expect(slider.upper).to.equal(50);
      });

      it('keeps an unset upper when the lower thumb moves', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider lower="20"></igc-range-slider>`
        );

        getDOM(slider).thumbs.lower.focus();
        simulateKeyboard(slider, arrowRight);
        await elementUpdated(slider);

        slider.max = 200;
        await elementUpdated(slider);

        expect([slider.lower, slider.upper]).to.eql([21, 200]);
      });

      it('follows upperBound with upper until upper is set', async () => {
        const slider = await fixture<IgcRangeSliderComponent>(
          html`<igc-range-slider lower="20"></igc-range-slider>`
        );

        expect([slider.lower, slider.upper]).to.eql([20, 100]);

        slider.max = 50;
        await elementUpdated(slider);
        expect(slider.upper).to.equal(50);

        slider.upper = 30;
        slider.max = 80;
        await elementUpdated(slider);
        expect(slider.upper).to.equal(30);
      });
    });
  });

  describe('Range ARIA', () => {
    before(() => defineComponents(IgcRangeSliderComponent));

    it('gives each thumb the text of its own value', async () => {
      const slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider lower="0" upper="2">
          <igc-slider-label>Low</igc-slider-label>
          <igc-slider-label>Medium</igc-slider-label>
          <igc-slider-label>High</igc-slider-label>
        </igc-range-slider>`
      );
      await waitUntil(() => slider.max === 2);
      await elementUpdated(slider);

      const { thumbs } = getDOM(slider);

      expect(thumbs.lower.ariaValueText).to.equal('Low');
      expect(thumbs.upper.ariaValueText).to.equal('High');

      thumbs.lower.focus();
      await elementUpdated(slider);
      expect(thumbs.lower.ariaValueText).to.equal('Low');

      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);
      expect(thumbs.lower.ariaValueText).to.equal('Medium');
    });

    it('sets no value text without labels or a format', async () => {
      const slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider lower="20" upper="60"></igc-range-slider>`
      );
      const { thumbs } = getDOM(slider);

      thumbs.lower.focus();
      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);

      expect(thumbs.lower.ariaValueText).to.be.null;
      expect(thumbs.upper.ariaValueText).to.be.null;
    });

    it('names the group of the thumbs from the host', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div>
          <span id="price">Price range</span>
          <igc-range-slider aria-labelledby="price"></igc-range-slider>
        </div>`
      );
      const slider = wrapper.querySelector('igc-range-slider')!;
      const label = wrapper.querySelector('#price')!;
      await elementUpdated(slider);

      const group = getDOM(slider).thumbs.group;

      expect(group.getAttribute('role')).to.equal('group');
      expect(group.ariaLabelledByElements).to.eql([label]);

      slider.removeAttribute('aria-labelledby');
      slider.setAttribute('aria-label', 'Budget');
      await elementUpdated(slider);

      expect(group.ariaLabelledByElements).to.be.null;
      expect(group.getAttribute('aria-label')).to.equal('Budget');

      slider.removeAttribute('aria-label');
      await elementUpdated(slider);

      expect(group.hasAttribute('aria-label')).to.be.false;
      expect(group.hasAttribute('role')).to.be.false;
    });

    it('describes both thumbs with the host description', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div>
          <span id="hint">Prices include tax.</span>
          <igc-range-slider aria-describedby="hint"></igc-range-slider>
        </div>`
      );
      const slider = wrapper.querySelector('igc-range-slider')!;
      const hint = wrapper.querySelector('#hint')!;
      await elementUpdated(slider);

      const { thumbs } = getDOM(slider);

      expect(thumbs.lower.ariaDescribedByElements).to.eql([hint]);
      expect(thumbs.upper.ariaDescribedByElements).to.eql([hint]);
    });

    it('is accessible with a host label', async () => {
      const slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider
          aria-label="Price"
          thumb-label-lower="Minimum price"
          thumb-label-upper="Maximum price"
        ></igc-range-slider>`
      );
      expect(getDOM(slider).thumbs.group.getAttribute('aria-label')).to.equal(
        'Price'
      );
      await expect(slider).shadowDom.to.be.accessible();
      await expect(slider).to.be.accessible();
    });
  });

  describe('Thumb label', () => {
    before(() =>
      defineComponents(
        IgcSliderComponent,
        IgcRangeSliderComponent,
        IgcDialogComponent
      )
    );

    function popover(slider: IgcSliderBaseComponent, index = 0) {
      return slider.shadowRoot!.querySelectorAll('igc-popover')[index];
    }

    function labelShown(slider: IgcSliderBaseComponent, index = 0) {
      return isPopoverOpen(
        popover(slider, index).shadowRoot!.querySelector('[part="container"]')!
      );
    }

    /** Waits until the label shows at its final position. */
    async function labelPlaced(slider: IgcSliderBaseComponent) {
      await elementUpdated(slider);
      await popover(slider).updateComplete;
      await nextFrame();
      await nextFrame();
    }

    function tabTo(thumb: HTMLElement) {
      thumb.focus();
      simulateKeyboard(thumb, tabKey);
    }

    it('does not move a thumb on a right click', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const eventSpy = spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      simulatePointerDown(slider, { clientX: x + width / 2, button: 2 });
      await elementUpdated(slider);

      expect(slider.value).to.equal(0);
      expect(eventSpy.callCount).to.equal(0);
    });

    it('ignores a second pointer while a thumb is dragged', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider style="margin: 80px 40px"></igc-slider>`
      );
      const eventSpy = spy(slider, 'emitEvent');
      const { x, y, width, height } = slider.getBoundingClientRect();
      const at = (fraction: number) => x + width * fraction;

      try {
        // A real mouse press, so the slider gets the pointer capture.
        await sendMouse({
          type: 'move',
          position: [Math.round(at(0.5)), Math.round(y + height / 2)],
        });
        await sendMouse({ type: 'down' });
        await elementUpdated(slider);
        expect(slider.value).to.equal(50);

        simulatePointerDown(slider, { clientX: at(0.8), pointerId: 2 });
        simulatePointerMove(slider, { clientX: at(0.9), pointerId: 2 });
        simulateLostPointerCapture(slider, { pointerId: 2 });
        await elementUpdated(slider);
        expect(slider.value).to.equal(50);

        await sendMouse({ type: 'up' });
        await elementUpdated(slider);
      } finally {
        await resetMouse();
      }

      expect(
        eventSpy.args.filter(([name]) => name === 'igcChange')
      ).to.have.lengthOf(1);
    });

    it('shows the label while a thumb has keyboard focus', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;

      tabTo(thumb);
      await elementUpdated(slider);
      expect(labelShown(slider)).to.be.true;

      simulateKeyboard(slider, arrowRight);
      await elementUpdated(slider);
      await aTimeout(800);
      expect(labelShown(slider)).to.be.true;

      thumb.blur();
      await aTimeout(800);
      expect(labelShown(slider)).to.be.false;
    });

    it('hides the label after a pointer focus, also after a keyboard focus', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;
      const { x, width } = thumb.getBoundingClientRect();

      for (const keyboardFirst of [false, true]) {
        if (keyboardFirst) {
          tabTo(thumb);
        }

        simulatePointerDown(slider, { clientX: x + width / 2 });
        simulateLostPointerCapture(slider);
        await elementUpdated(slider);
        await aTimeout(800);

        expect(slider.shadowRoot!.activeElement).to.equal(thumb);
        expect(labelShown(slider), `${keyboardFirst}`).to.be.false;
      }
    });

    it('keeps the label of a hovered thumb on blur', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider style="margin: 80px 40px"></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;
      const { x, y, width, height } = thumb.getBoundingClientRect();

      try {
        await sendMouse({
          type: 'move',
          position: [Math.round(x + width / 2), Math.round(y + height / 2)],
        });
        thumb.focus();
        thumb.blur();
        await aTimeout(800);
        expect(labelShown(slider)).to.be.true;

        await sendMouse({ type: 'move', position: [0, 0] });
        await aTimeout(800);
        expect(labelShown(slider)).to.be.false;
      } finally {
        await resetMouse();
      }
    });

    it('does not count a modifier key alone as keyboard focus', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;
      const { x, width } = thumb.getBoundingClientRect();

      simulatePointerDown(slider, { clientX: x + width / 2 });
      simulateLostPointerCapture(slider);
      thumb.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: shiftKey,
          bubbles: true,
          composed: true,
        })
      );
      await aTimeout(800);

      expect(thumb.part.contains('focused')).to.be.false;
      expect(labelShown(slider)).to.be.false;
    });

    it('hides the label when a focused range slider is disabled', async () => {
      const slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider lower="20" upper="60"></igc-range-slider>`
      );
      const { thumbs } = getDOM(slider);

      tabTo(thumbs.lower);
      await elementUpdated(slider);
      expect(labelShown(slider)).to.be.true;

      slider.disabled = true;
      await elementUpdated(slider);

      expect(slider.shadowRoot!.activeElement).to.equal(thumbs.lower);
      expect(labelShown(slider)).to.be.false;
    });

    it('hides the label on Escape and lets the key through', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;

      tabTo(thumb);
      await elementUpdated(slider);
      expect(labelShown(slider)).to.be.true;

      // `simulateKeyboard` sends no cancelable event.
      const event = new KeyboardEvent('keydown', {
        key: escapeKey,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      thumb.dispatchEvent(event);
      thumb.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: escapeKey,
          bubbles: true,
          composed: true,
        })
      );
      await elementUpdated(slider);

      expect(event.defaultPrevented).to.be.false;
      expect(labelShown(slider)).to.be.false;
      expect(slider.value).to.equal(0);
    });

    it('hides a hovered label on Escape while the focus is elsewhere', async () => {
      // The parent stops the key, as a combo or a dropdown can.
      const container = await fixture<HTMLElement>(
        html`<div @keydown=${(event: Event) => event.stopPropagation()}>
          <input /><igc-slider></igc-slider>
        </div>`
      );
      const slider = container.querySelector(IgcSliderComponent.tagName)!;
      const input = container.querySelector('input')!;

      simulatePointerEnter(getDOM(slider).thumbs.current);
      input.focus();
      await elementUpdated(slider);
      expect(labelShown(slider)).to.be.true;

      simulateKeyboard(input, escapeKey);
      await elementUpdated(slider);

      expect(labelShown(slider)).to.be.false;
    });

    it('listens for Escape on the page only while the label shows', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const add = spy(globalThis, 'addEventListener');
      const remove = spy(globalThis, 'removeEventListener');
      const keydown = (method: typeof add) =>
        method.getCalls().filter(({ args }) => args[0] === 'keydown').length;

      try {
        simulatePointerEnter(getDOM(slider).thumbs.current);
        await elementUpdated(slider);
        expect(keydown(add)).to.equal(1);

        const parent = slider.parentElement!;
        slider.remove();
        expect(keydown(remove)).to.equal(1);

        parent.append(slider);
        await elementUpdated(slider);
        expect(labelShown(slider)).to.be.false;
      } finally {
        add.restore();
        remove.restore();
      }
    });

    it('shows the label in the top layer on hover', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const thumb = getDOM(slider).thumbs.current;

      expect(labelShown(slider)).to.be.false;

      simulatePointerEnter(thumb);
      await elementUpdated(slider);
      expect(labelShown(slider)).to.be.true;

      simulatePointerLeave(thumb);
      await aTimeout(800);
      expect(labelShown(slider)).to.be.false;
    });

    /**
     * Shows the label and hit-tests it above `clip`, whose top edge would cut
     * it off. Hit-testing skips an element that ignores the pointer, so the
     * label takes the pointer for the test.
     */
    async function hitsLabelAbove(slider: IgcSliderComponent, clip: Element) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(
        'igc-popover::part(container) { pointer-events: auto; }'
      );
      slider.shadowRoot!.adoptedStyleSheets.push(sheet);

      simulatePointerEnter(getDOM(slider).thumbs.current);
      await labelPlaced(slider);

      const [inner] = getDOM(slider).thumbs.labelsInner;
      const { left, top, width } = inner.getBoundingClientRect();
      const edge = clip.getBoundingClientRect().top;

      expect(top, 'the label starts above the edge').to.be.lessThan(edge);

      return inner.contains(
        slider.shadowRoot!.elementFromPoint(left + width / 2, (top + edge) / 2)
      );
    }

    it('shows the label past a parent that clips its overflow', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div style="overflow: hidden; height: 48px; margin-top: 80px">
          <igc-slider value="50"></igc-slider>
        </div>`
      );

      expect(
        await hitsLabelAbove(wrapper.querySelector('igc-slider')!, wrapper)
      ).to.be.true;
    });

    it('shows the label above a modal dialog that holds the slider', async () => {
      // Without padding, the label starts above the box of the dialog, which
      // clips its content, and over the backdrop.
      const dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog style="padding: 0">
          <igc-slider value="50"></igc-slider>
        </igc-dialog>`
      );
      await dialog.show();

      const box = dialog.shadowRoot!.querySelector('dialog')!;

      expect(box.matches(':modal')).to.be.true;
      expect(await hitsLabelAbove(dialog.querySelector('igc-slider')!, box)).to
        .be.true;
    });

    for (const mode of ['native', 'floating'] as const) {
      for (const dir of ['ltr', 'rtl'] as const) {
        it(`keeps the label above its thumb (${mode}, ${dir})`, async () => {
          setPopoverPositionStrategy(mode);

          try {
            const wrapper = await fixture<HTMLElement>(
              html`<div dir=${dir} style="padding: 80px 40px; width: 400px">
                <igc-slider value="20"></igc-slider>
              </div>`
            );
            const slider = wrapper.querySelector('igc-slider')!;
            const { thumbs } = getDOM(slider);

            simulatePointerEnter(thumbs.current);
            simulateKeyboard(slider, pageUpKey, 3);
            await labelPlaced(slider);

            const thumb = thumbs.current.getBoundingClientRect();
            const label = thumbs.labelsInner[0].getBoundingClientRect();

            expect(slider.value).to.equal(50);
            expect(
              Math.abs(
                label.left + label.width / 2 - (thumb.left + thumb.width / 2)
              )
            ).to.be.lessThan(1);
            expect(label.bottom).to.be.lessThan(thumb.top);
          } finally {
            setPopoverPositionStrategy();
          }
        });
      }
    }

    for (const mode of ['native', 'floating'] as const) {
      it(`hides the label while its thumb is scrolled out of view (${mode})`, async () => {
        setPopoverPositionStrategy(mode);

        try {
          const scroller = await fixture<HTMLElement>(
            html`<div style="overflow: auto; height: 60px; margin-top: 200px">
              <igc-slider value="50"></igc-slider>
              <div style="height: 300px"></div>
            </div>`
          );
          const slider = scroller.querySelector('igc-slider')!;
          const { thumbs } = getDOM(slider);
          // The `focused` part stops `thumbs.current` from matching.
          const thumb = thumbs.current;
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(
            'igc-popover::part(container) { pointer-events: auto; }'
          );
          slider.shadowRoot!.adoptedStyleSheets.push(sheet);

          const labelHit = () => {
            const [inner] = thumbs.labelsInner;
            const { left, top, width, height } = inner.getBoundingClientRect();
            return inner.contains(
              slider.shadowRoot!.elementFromPoint(
                left + width / 2,
                top + height / 2
              )
            );
          };

          tabTo(thumb);
          await labelPlaced(slider);
          expect(labelHit()).to.be.true;

          // The thumb is now above the visible part of the scroller, and the
          // label would still be in the viewport.
          await simulateScroll(scroller, { top: 100 });
          await labelPlaced(slider);
          expect(thumb.getBoundingClientRect().bottom).to.be.lessThan(
            scroller.getBoundingClientRect().top
          );
          expect(labelHit()).to.be.false;

          await simulateScroll(scroller, { top: 0 });
          await labelPlaced(slider);
          expect(labelHit()).to.be.true;
        } finally {
          setPopoverPositionStrategy();
        }
      });
    }

    it('renders a label for each thumb of a range slider', async () => {
      const slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider lower="20" upper="60"></igc-range-slider>`
      );
      const { thumbs } = getDOM(slider);

      simulatePointerEnter(thumbs.upper);
      await elementUpdated(slider);

      expect(
        thumbs.labelsInner.map((label) => label.textContent?.trim())
      ).to.eql(['20', '60']);
      expect(labelShown(slider, 0)).to.be.true;
      expect(labelShown(slider, 1)).to.be.true;
    });

    it('renders the popover only without hideTooltip', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );

      expect(popover(slider)).to.exist;

      slider.hideTooltip = true;
      await elementUpdated(slider);

      expect(popover(slider)).to.be.undefined;
    });

    it('formats no value for a hidden label without a format', async () => {
      // An invalid locale throws only when a value is formatted.
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider hide-tooltip locale="en_US"></igc-slider>`
      );

      expect(getDOM(slider).thumbs.current).to.exist;
    });

    it('dismisses an open label when hideTooltip turns on', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
      const remove = spy(globalThis, 'removeEventListener');

      try {
        simulatePointerEnter(getDOM(slider).thumbs.current);
        await elementUpdated(slider);
        expect(labelShown(slider)).to.be.true;

        slider.hideTooltip = true;
        await elementUpdated(slider);
        expect(
          remove.getCalls().filter(({ args }) => args[0] === 'keydown')
        ).to.have.lengthOf(1);

        // The label waits for a new interaction.
        slider.hideTooltip = false;
        await elementUpdated(slider);
        expect(labelShown(slider)).to.be.false;
      } finally {
        remove.restore();
      }
    });
  });

  describe('Tick labels', () => {
    before(() => defineComponents(IgcSliderComponent));

    function tickTexts(slider: IgcSliderComponent) {
      return getDOM(slider).ticks.labelsInner.map((label) =>
        label.textContent?.trim()
      );
    }

    it('renders the tick labels again for a new locale or format', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider max="2000" primary-ticks="2"></igc-slider>`
      );
      expect(tickTexts(slider)).to.eql(['0', '2,000']);

      slider.locale = 'de';
      await elementUpdated(slider);
      expect(tickTexts(slider)).to.eql(['0', '2.000']);

      // The options can also change in place.
      slider.valueFormatOptions = { minimumFractionDigits: 1 };
      await elementUpdated(slider);
      slider.valueFormatOptions.minimumFractionDigits = 2;
      slider.requestUpdate();
      await elementUpdated(slider);
      expect(tickTexts(slider)).to.eql(['0,00', '2.000,00']);
    });

    it('renders the ticks again for a new scale, secondary ticks or format string', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider primary-ticks="2"></igc-slider>`
      );
      const steps: [Partial<IgcSliderComponent>, string[]][] = [
        [{ min: 10 }, ['10', '100']],
        [{ max: 50 }, ['10', '50']],
        [{ secondaryTicks: 1 }, ['10', '30', '50']],
        [{ valueFormat: '{0}%' }, ['10%', '30%', '50%']],
      ];

      for (const [change, texts] of steps) {
        Object.assign(slider, change);
        await elementUpdated(slider);
        expect(tickTexts(slider), JSON.stringify(change)).to.eql(texts);
      }
    });

    it('renders the tick labels again for new labels of the same count', async () => {
      const slider = await fixture<IgcSliderComponent>(
        html`<igc-slider primary-ticks="2">
          <igc-slider-label>Low</igc-slider-label>
          <igc-slider-label>High</igc-slider-label>
        </igc-slider>`
      );
      expect(tickTexts(slider)).to.eql(['Low', 'High']);

      slider.lastElementChild!.replaceWith(
        Object.assign(document.createElement('igc-slider-label'), {
          textContent: 'Top',
        })
      );
      await nextFrame();
      await elementUpdated(slider);

      expect(tickTexts(slider)).to.eql(['Low', 'Top']);
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcSliderComponent>(
      html`<igc-slider name="slider" value="3"></igc-slider>`
    );

    beforeEach(async () => {
      await spec.setup(IgcSliderComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit', () => {
      spec.assertSubmitHasValue(spec.element.value.toString());
      spec.setProperties({ value: 66 });

      spec.assertSubmitHasValue('66');
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: 4 });
      spec.reset();

      expect(spec.element.value).to.equal(3);
    });

    it('should reset to the new default value after setAttribute() call', () => {
      spec.setAttributes({ value: 17 });
      spec.setProperties({ value: 50 });
      spec.reset();

      expect(spec.element.value).to.equal(17);
      spec.assertSubmitHasValue(spec.element.value.toString());
    });

    it('should clamp an out-of-range default value on form reset', () => {
      spec.setAttributes({ value: 200 });
      spec.setProperties({ value: 50 });
      spec.reset();

      expect(spec.element.value).to.equal(100);
      spec.assertSubmitHasValue('100');
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils custom constraints', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });

  describe('defaultValue', () => {
    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcSliderComponent>(
        html`<igc-slider name="slider" .defaultValue=${3}></igc-slider>`
      );

      beforeEach(async () => {
        await spec.setup(IgcSliderComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.equal(3);
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(spec.element.value.toString());
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: 55 });
        spec.reset();

        expect(spec.element.value).to.equal(3);
      });
    });
  });
});

function getDOM<T = HTMLElement>(slider: IgcSliderBaseComponent) {
  const root = slider.shadowRoot!;

  return {
    track: {
      get element() {
        return root.querySelector(`[part='track']`) as T;
      },
      get fill() {
        return root.querySelector(`[part='fill']`) as T;
      },
      get steps() {
        return root.querySelector(`[part='steps']`) as T;
      },
    },
    thumbs: {
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
      /** The inner elements of the thumb labels */
      get labelsInner() {
        return Array.from(
          root.querySelectorAll(`[part='thumb-label-inner']`)
        ) as T[];
      },
      /** The group of the thumbs (range-slider) */
      get group() {
        return root.querySelector(`[part='thumbs']`) as T;
      },
    },
    ticks: {
      get all() {
        return Array.from(root.querySelectorAll(`[part='tick']`)) as T[];
      },
      get primary() {
        return Array.from(
          root.querySelectorAll(`[part='tick'][data-primary='true']`)
        ) as T[];
      },
      get secondary() {
        return Array.from(
          root.querySelectorAll(`[part='tick'][data-primary='false']`)
        ) as T[];
      },
      get labels() {
        return Array.from(root.querySelectorAll(`[part='tick-label']`)) as T[];
      },
      get labelsInner() {
        return Array.from(
          root.querySelectorAll(`[part='tick-label-inner']`)
        ) as T[];
      },
    },
  };
}
