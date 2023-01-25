import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';
import sinon from 'sinon';
import { IgcRangeSliderComponent, IgcSliderComponent } from '../../index.js';
import { IgcSliderBaseComponent } from './slider-base.js';

describe('Slider component', () => {
  const getTrack = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelector(`[part='track']`) as HTMLElement;
  const getTrackFill = (el: IgcSliderBaseComponent) =>
    el.shadowRoot!.querySelector(`[part='fill']`) as HTMLElement;
  const getTrackSteps = (el: IgcSliderBaseComponent) =>
    el.shadowRoot!.querySelector(`[part='steps']`) as HTMLElement;
  const getThumb = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelector(`[part='thumb']`) as HTMLElement;
  const getLowerThumb = (el: IgcRangeSliderComponent) =>
    el.shadowRoot!.querySelector('#thumbFrom') as HTMLElement;
  const getUpperThumb = (el: IgcRangeSliderComponent) =>
    el.shadowRoot!.querySelector('#thumbTo') as HTMLElement;
  const getThumbLabel = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelector(`[part='thumb-label']`) as HTMLElement;
  const getPrimaryTicks = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelectorAll(
      `[part='tick'][data-primary='true']`
    ) as NodeListOf<HTMLElement>;
  const getSecondaryTicks = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelectorAll(
      `[part='tick'][data-primary='false']`
    ) as NodeListOf<HTMLElement>;
  const getAllTicks = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelectorAll(`[part='tick']`) as NodeListOf<HTMLElement>;
  const getTickLabels = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelectorAll(
      `[part='tick-label']`
    ) as NodeListOf<HTMLElement>;
  const getTickLabelsInner = (el: IgcSliderComponent) =>
    el.shadowRoot!.querySelectorAll(
      `[part='tick-label-inner']`
    ) as NodeListOf<HTMLElement>;
  const absDiff = (a: number, b: number) => {
    return Math.abs(a - b);
  };

  describe('Regular', () => {
    let slider: IgcSliderComponent;

    before(() => {
      IgcSliderComponent.register();
    });

    beforeEach(async () => {
      slider = await fixture<IgcSliderComponent>(
        html`<igc-slider></igc-slider>`
      );
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
      const eventSpy = sinon.spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x + width / 2,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.value).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: 50 });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: x + width * 0.7,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.value).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: 70 });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('lostpointercapture', { pointerId: 1 })
      );
      await elementUpdated(slider);

      expect(slider.value).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 70 });
    });

    it('track fill and thumb should be positioned correctly according to the current value', async () => {
      const trackFill = getTrackFill(slider);
      const thumb = getThumb(slider);

      slider.value = 23;
      await elementUpdated(slider);

      expect(trackFill.style.width).to.eq('23%');
      expect(thumb.style.insetInlineStart).to.eq('23%');
    });

    it('thumb should have correct aria attributes set.', async () => {
      const thumb = getThumb(slider);

      slider.value = 23;
      slider.setAttribute('aria-label', 'Price');
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);

      expect(slider.hasAttribute('aria-label')).to.be.false;
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

      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x + width * 0.54321,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.value).to.eq(54.321);
    });

    it('primary tick marks should be displayed when primaryTickMarks is greater than 0', async () => {
      let ticks = getPrimaryTicks(slider);
      expect(ticks.length).to.eq(0);

      slider.primaryTicks = 3;
      await elementUpdated(slider);
      ticks = getPrimaryTicks(slider);
      expect(ticks.length).to.eq(3);

      const sliderRect = slider.getBoundingClientRect();
      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];
        const { x } = tick.getBoundingClientRect();
        const expectedX =
          sliderRect.x + (i * sliderRect.width) / (ticks.length - 1);
        expect(absDiff(x, expectedX) <= 2).to.eq(
          true,
          `tick ${i}; actual: ${x}; expected: ${expectedX}`
        );
      }
    });

    it('secondary tick marks should be displayed when secondaryTickMarks is greater than 0', async () => {
      let secondaryTicks = getSecondaryTicks(slider);
      expect(secondaryTicks.length).to.eq(0);

      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);
      secondaryTicks = getSecondaryTicks(slider);
      const allTicks = getAllTicks(slider);
      expect(secondaryTicks.length).to.eq(8);
      expect(allTicks.length).to.eq(11);

      const sliderRect = slider.getBoundingClientRect();
      for (let i = 0; i < allTicks.length; i++) {
        const tick = allTicks[i];
        const { x } = tick.getBoundingClientRect();
        const expectedX =
          sliderRect.x + (i * sliderRect.width) / (allTicks.length - 1);
        expect(absDiff(x, expectedX) <= 3).to.eq(
          true,
          `tick ${i}; actual: ${x}; expected: ${expectedX}`
        );
        expect(tick.getAttribute('data-primary')).to.eq(
          i % 5 === 0 ? 'true' : 'false'
        );
      }
    });

    it('primary tick mark labels should be displayed based on hidePrimaryLabels', async () => {
      slider.primaryTicks = 3;
      await elementUpdated(slider);
      let ticks = getAllTicks(slider);
      let tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(3);
      expect(tickLabels.length).to.eq(3);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        expect(label.innerText).to.eq(`${(i / (tickLabels.length - 1)) * 100}`);
      }

      slider.hidePrimaryLabels = true;
      await elementUpdated(slider);
      ticks = getAllTicks(slider);
      tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(3);
      expect(tickLabels.length).to.eq(0);
    });

    it('secondary tick mark labels should be displayed based on hideSecondaryLabels', async () => {
      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);
      let ticks = getAllTicks(slider);
      let tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(11);
      expect(tickLabels.length).to.eq(11);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        expect(label.innerText).to.eq(`${(i / (tickLabels.length - 1)) * 100}`);
      }

      slider.hideSecondaryLabels = true;
      await elementUpdated(slider);
      ticks = getAllTicks(slider);
      tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(11);
      expect(tickLabels.length).to.eq(3);
    });

    it('tick marks and their labels should be displayed correctly when tickOrientation is start, end or mirror', async () => {
      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);
      let ticks = getAllTicks(slider);
      let tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(11);
      expect(tickLabels.length).to.eq(11);
      expect(slider.tickOrientation).to.eq('end');

      const trackRect = getTrack(slider).getBoundingClientRect();
      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];
        expect(tick.getBoundingClientRect().y > trackRect.y).to.be.true;
      }

      slider.tickOrientation = 'start';
      await elementUpdated(slider);
      ticks = getAllTicks(slider);
      tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(11);
      expect(tickLabels.length).to.eq(11);

      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];
        expect(tick.getBoundingClientRect().y < trackRect.y).to.be.true;
      }

      slider.tickOrientation = 'mirror';
      await elementUpdated(slider);
      ticks = getAllTicks(slider);
      tickLabels = getTickLabels(slider);
      expect(ticks.length).to.eq(22);
      expect(tickLabels.length).to.eq(22);

      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i];
        if (i < 11) {
          expect(tick.getBoundingClientRect().y < trackRect.y).to.be.true;
        } else {
          expect(tick.getBoundingClientRect().y > trackRect.y).to.be.true;
        }
      }
    });

    it('tick mark labels should be displayed correctly when tickLabelRotation is 0, 90 or -90', async () => {
      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      await elementUpdated(slider);
      const tickLabels = getTickLabelsInner(slider);
      expect(tickLabels.length).to.eq(11);
      expect(slider.tickLabelRotation).to.eq(0);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        const style = getComputedStyle(label);
        expect(style.marginInlineStart).to.eq('-50%');
        expect(style.marginBlock).to.eq('0px');
        expect(style.writingMode).to.eq('horizontal-tb');
        expect(style.transform).to.eq('none');
      }

      slider.tickLabelRotation = 90;
      await elementUpdated(slider);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        const style = getComputedStyle(label);
        expect(style.marginInlineStart).to.eq('0px');
        expect(style.marginBlock).to.eq('-9px');
        expect(style.writingMode).to.eq('vertical-rl');
        expect(style.transform).to.eq('none');
      }

      slider.tickLabelRotation = -90;
      await elementUpdated(slider);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        const style = getComputedStyle(label);
        expect(style.marginInlineStart).to.eq('0px');
        expect(style.marginBlock).to.eq('-9px');
        expect(style.writingMode).to.eq('vertical-rl');
        expect(style.transform).to.eq('matrix(-1, 0, 0, -1, 0, 0)');
      }
    });

    it('track should be continuos or discrete based on discreteTrack', async () => {
      slider.step = 10;
      await elementUpdated(slider);

      let steps = getTrackSteps(slider);
      expect(steps).to.be.null;

      slider.discreteTrack = true;
      await elementUpdated(slider);
      steps = getTrackSteps(slider);
      expect(steps).not.to.be.null;

      const line = steps.querySelector('line');
      expect(line!.getAttribute('stroke-dasharray')).to.eq(
        '0, calc(14.142135623730951%)'
      );
    });

    it('UI interactions should not be possible when the slider is disabled', async () => {
      const thumb = getThumb(slider);
      expect(thumb.tabIndex).to.eq(0);
      expect(getComputedStyle(slider).pointerEvents).to.eq('auto');

      slider.disabled = true;
      await elementUpdated(slider);
      expect(thumb.tabIndex).to.eq(-1);
      expect(thumb.ariaDisabled).to.eq('true');
      expect(getComputedStyle(slider).pointerEvents).to.eq('none');
    });

    it('tick mark labels and thumb tooltip should be formatted by the value format properties', async () => {
      slider.primaryTicks = 3;
      slider.secondaryTicks = 4;
      slider.value = 23;
      slider.valueFormat = 'P: {0}';
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);
      const tickLabels = getTickLabels(slider);
      const thumbLabel = getThumbLabel(slider);

      expect(tickLabels.length).to.eq(11);
      expect(thumbLabel.innerText).to.eq('P: $23.00');

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        expect(label.innerText).to.eq(
          `P: $${(i / (tickLabels.length - 1)) * 100}.00`
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

      const tickLabels = getTickLabels(slider);
      const thumbLabel = getThumbLabel(slider);
      const thumb = getThumb(slider);

      expect(tickLabels.length).to.eq(3);
      expect(thumbLabel.innerText).to.eq(labels[0]);
      expect(thumb.ariaValueText).to.eq(labels[0]);

      for (let i = 0; i < tickLabels.length; i++) {
        const label = tickLabels[i];
        expect(label.innerText).to.eq(labels[i]);
      }

      slider.value = 1;
      await elementUpdated(slider);
      expect(thumbLabel.innerText).to.eq(labels[1]);
      expect(thumb.ariaValueText).to.eq(labels[1]);
    });

    it('thumb tooltip should be displayed on hovering the thumb', async () => {
      const thumb = getThumb(slider);
      const thumbLabel = getThumbLabel(slider);
      expect(thumbLabel.style.opacity).to.eq('0');

      thumb.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(slider);
      expect(thumbLabel.style.opacity).to.eq('1');

      thumb.dispatchEvent(new PointerEvent('pointerleave'));
      await elementUpdated(slider);
      await aTimeout(800);
      expect(thumbLabel.style.opacity).to.eq('0');
    });

    it('thumb tooltip should not be displayed when hideTooltip is set to true', async () => {
      slider.hideTooltip = true;
      await elementUpdated(slider);

      const thumb = getThumb(slider);
      const thumbLabel = getThumbLabel(slider);
      expect(thumbLabel).to.be.null;

      thumb.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(slider);
      expect(thumbLabel).to.be.null;
    });

    it('value should be increased or decreased with 1 step when pressing right/top or down/left arrow keys', async () => {
      const eventSpy = sinon.spy(slider, 'emitEvent');
      slider.step = 2;
      slider.value = 50;
      await elementUpdated(slider);

      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(52);
      expect(eventSpy).to.be.calledTwice;
      expect(eventSpy).calledWith('igcInput', { detail: 52 });
      expect(eventSpy).calledWith('igcChange', { detail: 52 });

      eventSpy.resetHistory();
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
      expect(eventSpy).calledWith('igcInput', { detail: 50 });
      expect(eventSpy).calledWith('igcChange', { detail: 50 });

      eventSpy.resetHistory();
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(48);
      expect(eventSpy).calledWith('igcInput', { detail: 48 });
      expect(eventSpy).calledWith('igcChange', { detail: 48 });

      eventSpy.resetHistory();
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
      expect(eventSpy).calledWith('igcInput', { detail: 50 });
      expect(eventSpy).calledWith('igcChange', { detail: 50 });
    });

    it('value should be increased/decreased with 1/10th of the slider range when pressing page up/down keys', async () => {
      slider.step = 2;
      slider.value = 50;
      await elementUpdated(slider);

      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(60);

      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(50);
    });

    it('value should be set to minimum when pressing home key', async () => {
      slider.min = 10;
      slider.value = 50;
      await elementUpdated(slider);

      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(10);
    });

    it('value should be set to maximum when pressing end key', async () => {
      slider.max = 90;
      slider.value = 50;
      await elementUpdated(slider);

      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
      await elementUpdated(slider);
      expect(slider.value).to.eq(90);
    });
  });

  describe('Range', () => {
    let slider: IgcRangeSliderComponent;

    before(() => {
      IgcRangeSliderComponent.register();
    });

    beforeEach(async () => {
      slider = await fixture<IgcRangeSliderComponent>(
        html`<igc-range-slider></igc-range-slider>`
      );
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
      const eventSpy = sinon.spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();

      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x + width * 0.5,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.upper).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 0, upper: 50 },
      });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: x + width * 0.7,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 0, upper: 70 },
      });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('lostpointercapture', { pointerId: 1 })
      );
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 0, upper: 70 },
      });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x + width * 0.2,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.lower).to.eq(20);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 20, upper: 70 },
      });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: x + width * 0.4,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(slider.lower).to.eq(40);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 40, upper: 70 },
      });

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('lostpointercapture', { pointerId: 1 })
      );
      await elementUpdated(slider);

      expect(slider.upper).to.eq(70);
      expect(slider.lower).to.eq(40);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 40, upper: 70 },
      });
    });

    it('when the lower thumb is dragged beyond the upper thumb, the upper thumb should be focused and its dragging should continue.', async () => {
      const eventSpy = sinon.spy(slider, 'emitEvent');
      const { x, width } = slider.getBoundingClientRect();
      const lowerThumb = getLowerThumb(slider);
      const upperThumb = getUpperThumb(slider);

      slider.lower = 20;
      slider.upper = 50;
      await elementUpdated(slider);

      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x + width * 0.25,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.lower).to.eq(25);
      expect(slider.upper).to.eq(50);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 25, upper: 50 },
      });
      expect(slider).to.eq(document.activeElement);
      expect(lowerThumb).to.eq(slider.shadowRoot?.activeElement);

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: x + width * 0.7,
          pointerId: 1,
        })
      );
      await elementUpdated(slider);

      expect(slider.lower).to.eq(50);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcInput', {
        detail: { lower: 50, upper: 70 },
      });
      expect(slider).to.eq(document.activeElement);
      expect(upperThumb).to.eq(slider.shadowRoot?.activeElement);

      eventSpy.resetHistory();
      slider.dispatchEvent(
        new PointerEvent('lostpointercapture', { pointerId: 1 })
      );
      await elementUpdated(slider);

      expect(slider.lower).to.eq(50);
      expect(slider.upper).to.eq(70);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: { lower: 50, upper: 70 },
      });
    });

    it('track fill and thumbs should be positioned correctly according to the current values', async () => {
      const trackFill = getTrackFill(slider);
      const lowerThumb = getLowerThumb(slider);
      const upperThumb = getUpperThumb(slider);

      slider.lower = 20;
      slider.upper = 70;
      await elementUpdated(slider);

      expect(trackFill.style.width).to.eq('50%');
      expect(trackFill.style.insetInlineStart).to.eq('20%');
      expect(lowerThumb.style.insetInlineStart).to.eq('20%');
      expect(upperThumb.style.insetInlineStart).to.eq('70%');
    });

    it('thumbs should have correct aria attributes set.', async () => {
      const lowerThumb = getLowerThumb(slider);
      const upperThumb = getUpperThumb(slider);
      slider.lower = 20;
      slider.upper = 70;
      slider.ariaLabelLower = 'Price From';
      slider.ariaLabelUpper = 'Price To';
      slider.valueFormatOptions = { style: 'currency', currency: 'USD' };
      await elementUpdated(slider);

      expect(lowerThumb.getAttribute('role')).to.eq('slider');
      expect(lowerThumb.ariaValueMin).to.eq('0');
      expect(lowerThumb.ariaValueMax).to.eq('100');
      expect(lowerThumb.ariaValueNow).to.eq('20');
      expect(lowerThumb.ariaValueText).to.eq('$20.00');
      expect(lowerThumb.ariaDisabled).to.eq('false');
      expect(lowerThumb.ariaLabel).to.eq('Price From');

      expect(upperThumb.getAttribute('role')).to.eq('slider');
      expect(upperThumb.ariaValueMin).to.eq('0');
      expect(upperThumb.ariaValueMax).to.eq('100');
      expect(upperThumb.ariaValueNow).to.eq('70');
      expect(upperThumb.ariaValueText).to.eq('$70.00');
      expect(upperThumb.ariaDisabled).to.eq('false');
      expect(upperThumb.ariaLabel).to.eq('Price To');

      await expect(slider).to.be.accessible();
    });
  });
});
