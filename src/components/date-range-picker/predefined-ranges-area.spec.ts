import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import IgcChipComponent from '../chip/chip.js';
import type { CustomDateRange, DateRangeValue } from './date-range-picker.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Predefined Area', () => {
  before(() => {
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

    it('renders the default predefined ranges without an explicit `resourceStrings`', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        html`<igc-predefined-ranges-area
          use-predefined-ranges
        ></igc-predefined-ranges-area>`
      );

      expect(getChips().map((chip) => chip.innerText)).eql([
        'Last 7 Days',
        'Current Month',
        'Last 30 Days',
        'Year to Date',
      ]);
    });

    describe('Built-in range dates', () => {
      let clock: SinonFakeTimers;

      beforeEach(async () => {
        clock = useFakeTimers({
          now: new Date(2026, 9, 26, 23, 59),
          toFake: ['Date'],
        });
        component.usePredefinedRanges = true;
        await elementUpdated(component);
      });

      afterEach(() => {
        clock.restore();
      });

      function selectChip(index: number): DateRangeValue {
        const eventSpy = spy();
        component.addEventListener('igcRangeSelect', eventSpy, { once: true });
        simulateClick(getChips()[index]);

        expect(eventSpy).calledOnce;
        return eventSpy.firstCall.args[0].detail;
      }

      it('counts today as one of the days of Last 7 Days and Last 30 Days', () => {
        expect(selectChip(0)).to.eql({
          start: new Date(2026, 9, 20),
          end: new Date(2026, 9, 26),
        });
        expect(selectChip(2)).to.eql({
          start: new Date(2026, 8, 27),
          end: new Date(2026, 9, 26),
        });
      });

      it('selects the dates of the day of the click after midnight', () => {
        clock.setSystemTime(new Date(2026, 9, 27, 0, 1));

        expect(selectChip(0)).to.eql({
          start: new Date(2026, 9, 21),
          end: new Date(2026, 9, 27),
        });

        clock.setSystemTime(new Date(2027, 0, 1, 0, 1));

        expect(selectChip(1)).to.eql({
          start: new Date(2027, 0, 1),
          end: new Date(2027, 0, 31),
        });
        expect(selectChip(3)).to.eql({
          start: new Date(2027, 0, 1),
          end: new Date(2027, 0, 1),
        });
      });
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
      // A fixed day, so that a run over midnight does not change the dates.
      const clock = useFakeTimers({
        now: new Date(2026, 9, 26, 12),
        toFake: ['Date'],
      });

      try {
        component = await fixture<IgcPredefinedRangesAreaComponent>(
          createComponentWithCustomRanges()
        );

        const eventSpy = spy();
        component.addEventListener('igcRangeSelect', eventSpy);

        const chips = getChips();
        const ranges = [
          ...getPredefinedRanges().map(({ label, getDateRange }) => ({
            label,
            dateRange: getDateRange(CalendarDay.today),
          })),
          ...customRanges,
        ];

        expect(ranges).lengthOf(chips.length);

        for (const [idx, chip] of chips.entries()) {
          expect(chip.innerText).to.equal(ranges[idx].label);
          simulateClick(chip);
          await elementUpdated(component);

          expect(eventSpy.calledWithMatch({ detail: ranges[idx].dateRange })).to
            .be.true;
        }
      } finally {
        clock.restore();
      }
    });
  });
});
