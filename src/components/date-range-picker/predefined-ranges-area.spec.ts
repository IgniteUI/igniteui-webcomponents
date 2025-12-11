import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarDay } from '../calendar/model.js';
import IgcChipComponent from '../chip/chip.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, fixture, html } from '../common/helpers.spec.js';
import { simulateClick } from '../common/utils.spec.js';
import type { CustomDateRange } from './date-range-picker.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Predefined Area', () => {
  beforeAll(() => {
    defineComponents(IgcPredefinedRangesAreaComponent);
  });

  beforeEach(async () => {
    component = await fixture<IgcPredefinedRangesAreaComponent>(
      createDefaultComponent()
    );
  });

  let component: IgcPredefinedRangesAreaComponent;

  const customRanges: CustomDateRange[] = [
    {
      label: 'Previous Three Months',
      dateRange: {
        start: CalendarDay.today.add('month', -3).set({ date: 1 }).native,
        end: CalendarDay.today.set({ date: 1 }).add('day', -1).native,
      },
    },
    {
      label: 'Next Three Months',
      dateRange: {
        start: CalendarDay.today.add('month', 1).set({ date: 1 }).native,
        end: CalendarDay.today.add('month', 4).add('day', -1).native,
      },
    },
  ];

  function getPredefinedRanges() {
    // biome-ignore lint/complexity/useLiteralKeys: Because reasons
    return component['_predefinedRanges'];
  }

  function getChips() {
    return Array.from(
      component.renderRoot.querySelectorAll(IgcChipComponent.tagName)
    );
  }

  function createDefaultComponent() {
    return html`<igc-predefined-ranges-area></igc-predefined-ranges-area>`;
  }

  function createComponentWithCustomRanges() {
    return html`
      <igc-predefined-ranges-area
        use-predefined-ranges
        .customRanges=${customRanges}
      ></igc-predefined-ranges-area>
    `;
  }

  describe('Predefined Area Component Tests', () => {
    it('passes the a11y audit', async () => {
      await expect(component).to.be.accessible();
      await expect(component).shadowDom.to.be.accessible();
    });

    it('is correctly initialized and rendered with its default component state', () => {
      expect(component).dom.to.equal(
        ' <igc-predefined-ranges-area></igc-predefined-ranges-area>'
      );
      expect(getChips()).is.empty;
    });

    it('is correctly initialized and rendered with predefined ranges', async () => {
      component.usePredefinedRanges = true;
      await elementUpdated(component);

      expect(component).dom.to.equal(
        '<igc-predefined-ranges-area use-predefined-ranges></igc-predefined-ranges-area>'
      );

      const chips = getChips();
      const ranges = getPredefinedRanges();

      expect(ranges).lengthOf(chips.length);
      expect(chips.every((chip, idx) => chip.innerText === ranges[idx].label))
        .to.be.true;
    });

    it('is correctly initialized and rendered with predefined ranges and custom ranges', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const chips = getChips();
      const ranges = [...getPredefinedRanges(), ...customRanges];

      expect(ranges).lengthOf(chips.length);
      expect(chips.every((chip, idx) => chip.innerText === ranges[idx].label))
        .to.be.true;
    });

    it('is correctly initialized and rendered with only custom ranges', async () => {
      component.customRanges = customRanges;
      await elementUpdated(component);

      const chips = getChips();
      const ranges = customRanges;

      expect(ranges).lengthOf(chips.length);
      expect(chips.every((chip, idx) => chip.innerText === ranges[idx].label))
        .to.be.true;
    });

    it('correctly provides details about the chip that has been clicked on', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const eventSpy = vi.fn();
      component.addEventListener('igcRangeSelect', eventSpy);

      const chips = getChips();
      const ranges = [...getPredefinedRanges(), ...customRanges];

      expect(ranges).lengthOf(chips.length);

      for (const [idx, chip] of chips.entries()) {
        expect(chip.innerText).to.equal(ranges[idx].label);
        simulateClick(chip);
        await elementUpdated(component);

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({ detail: ranges[idx].dateRange })
        );
      }
    });
  });
});
