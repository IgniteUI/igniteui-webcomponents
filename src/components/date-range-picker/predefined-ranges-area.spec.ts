import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { spy } from 'sinon';
import { CalendarDay } from '../calendar/model.js';
import IgcChipComponent from '../chip/chip.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import type { CustomDateRange } from './date-range-picker.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Predefined Area', () => {
  before(() => {
    defineComponents(IgcPredefinedRangesAreaComponent);
  });

  const today = CalendarDay.from(new Date());
  const previousThreeMonthsStart = new Date(
    today.native.getFullYear(),
    today.native.getMonth() - 3,
    1
  );
  const previousThreeMonthsEnd = new Date(
    today.native.getFullYear(),
    today.native.getMonth(),
    0
  );
  const nextThreeMonthsStart = new Date(
    today.native.getFullYear(),
    today.native.getMonth() + 1,
    1
  );
  const nextThreeMonthsEnd = new Date(
    today.native.getFullYear(),
    today.native.getMonth() + 4,
    0
  );

  const customRanges: CustomDateRange[] = [
    {
      label: 'Previous Three Months',
      dateRange: {
        start: previousThreeMonthsStart,
        end: previousThreeMonthsEnd,
      },
    },
    {
      label: 'Next Three Months',
      dateRange: {
        start: nextThreeMonthsStart,
        end: nextThreeMonthsEnd,
      },
    },
  ];

  const createDefaultComponent = () => html`
    <igc-predefined-ranges-area></igc-predefined-ranges-area>
  `;

  const createComponentWithCustomRanges = () => html`
    <igc-predefined-ranges-area
      use-predefined-ranges
      .customRanges=${customRanges}
    ></igc-predefined-ranges-area>
  `;

  let component: IgcPredefinedRangesAreaComponent;

  beforeEach(async () => {
    component = await fixture<IgcPredefinedRangesAreaComponent>(
      createDefaultComponent()
    );
  });

  describe('Predefined Area Component Tests', () => {
    it('passes the a11y audit', async () => {
      await expect(component).to.be.accessible();
      await expect(component).shadowDom.to.be.accessible();
    });

    it('is correctly initialized and rendered with its default component state', () => {
      expect(component).dom.to.equal(
        ' <igc-predefined-ranges-area></igc-predefined-ranges-area>'
      );
      expect((component as any)._allRanges.length).to.equal(0);
    });

    it('is correctly initialized and rendered with predefined ranges', async () => {
      component.usePredefinedRanges = true;
      await elementUpdated(component);

      expect(component).dom.to.equal(
        ' <igc-predefined-ranges-area use-predefined-ranges></igc-predefined-ranges-area>'
      );

      const predefinedRanges = (component as any)._predefinedRanges;
      const chips = component.renderRoot.querySelectorAll(
        IgcChipComponent.tagName
      );

      expect((component as any)._allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(predefinedRanges[i].label);
      }
    });

    it('is correctly initialized and rendered with predefined ranges and custom ranges', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const allRanges = (component as any)._allRanges;
      const chips = component.renderRoot.querySelectorAll(
        IgcChipComponent.tagName
      );

      expect(allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(allRanges[i].label);
      }
    });

    it('is correctly initialized and rendered with only custom ranges', async () => {
      component.customRanges = customRanges;
      await elementUpdated(component);

      const allRanges = (component as any)._allRanges;
      const chips = component.renderRoot.querySelectorAll(
        IgcChipComponent.tagName
      );

      expect(customRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(allRanges[i].label);
      }
    });

    it('correctly provides details about the chip that has been clicked on', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const eventSpy = spy();
      component.addEventListener('rangeSelect', eventSpy);
      const allRanges = (component as any)._allRanges;
      const chips = component.renderRoot.querySelectorAll(
        IgcChipComponent.tagName
      );

      expect(allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(allRanges[i].label);

        chips[i].click();
        await elementUpdated(component);

        expect(eventSpy.calledWithMatch({ detail: allRanges[i].dateRange })).to
          .be.true;
      }
    });
  });
});
