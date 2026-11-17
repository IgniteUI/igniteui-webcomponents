import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { registerI18n } from 'igniteui-i18n-core';
import { ResourceStringsBG } from 'igniteui-i18n-resources';

import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  type WeekDays,
} from '../calendar/types.js';
import IgcChipComponent from '../chip/chip.js';
import type {
  CustomDateRange,
  DateRangeValue,
  PredefinedRangeKey,
} from './date-range-picker.js';
import IgcPredefinedRangesAreaComponent, {
  type RangeSelectEvent,
} from './predefined-ranges-area.js';

describe('Predefined Area', () => {
  before(() => {
    defineComponents(IgcPredefinedRangesAreaComponent);
    registerI18n(ResourceStringsBG, 'bg');
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

  function chipLabels(): string[] {
    return getChips().map((chip) => chip.innerText);
  }

  /** Clicks the chip and returns its `igcRangeSelect` event. */
  function select(chip: IgcChipComponent): RangeSelectEvent {
    const eventSpy = spy();
    component.addEventListener('igcRangeSelect', eventSpy, { once: true });
    simulateClick(chip);

    expect(eventSpy).calledOnce;
    return eventSpy.firstCall.args[0];
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

    describe('All built-in ranges', () => {
      let clock: SinonFakeTimers;

      const keys: PredefinedRangeKey[] = [
        'today',
        'yesterday',
        'lastWeek',
        'lastMonth',
        'currentQuarter',
        'lastQuarter',
        'quarterToDate',
        'currentYear',
        'lastYear',
      ];

      const days = (start: Date, end: Date): DateRangeValue => ({ start, end });

      beforeEach(async () => {
        // Tuesday, 17 November 2026
        clock = useFakeTimers({
          now: new Date(2026, 10, 17, 12),
          toFake: ['Date'],
        });
        component.usePredefinedRanges = true;
        component.predefinedRanges = keys;
        await elementUpdated(component);
      });

      afterEach(() => {
        clock.restore();
      });

      /** The range of each chip, by key. */
      function selectAll(): Record<string, DateRangeValue> {
        return Object.fromEntries(
          getChips()
            .map(select)
            .map(({ key, detail }) => [key, detail])
        );
      }

      it('shows the ranges of `predefinedRanges` in order, without unknown keys and repeats', async () => {
        component.predefinedRanges = [
          'yesterday',
          'today',
          'tomorrow' as PredefinedRangeKey,
          'today',
        ];
        await elementUpdated(component);

        expect(chipLabels()).to.eql(['Yesterday', 'Today']);
      });

      it('shows the English labels', () => {
        expect(chipLabels()).to.eql([
          'Today',
          'Yesterday',
          'Last Week',
          'Last Month',
          'Current Quarter',
          'Last Quarter',
          'Quarter to Date',
          'Current Year',
          'Last Year',
        ]);
      });

      it('selects the dates of each range', () => {
        expect(selectAll()).to.eql({
          today: days(new Date(2026, 10, 17), new Date(2026, 10, 17)),
          yesterday: days(new Date(2026, 10, 16), new Date(2026, 10, 16)),
          lastWeek: days(new Date(2026, 10, 8), new Date(2026, 10, 14)),
          lastMonth: days(new Date(2026, 9, 1), new Date(2026, 9, 31)),
          currentQuarter: days(new Date(2026, 9, 1), new Date(2026, 11, 31)),
          lastQuarter: days(new Date(2026, 6, 1), new Date(2026, 8, 30)),
          quarterToDate: days(new Date(2026, 9, 1), new Date(2026, 10, 17)),
          currentYear: days(new Date(2026, 0, 1), new Date(2026, 11, 31)),
          lastYear: days(new Date(2025, 0, 1), new Date(2025, 11, 31)),
        });
      });

      it('selects the dates across a year boundary', () => {
        // Friday, 1 January 2027
        clock.setSystemTime(new Date(2027, 0, 1, 0, 1));

        expect(selectAll()).to.eql({
          today: days(new Date(2027, 0, 1), new Date(2027, 0, 1)),
          yesterday: days(new Date(2026, 11, 31), new Date(2026, 11, 31)),
          lastWeek: days(new Date(2026, 11, 20), new Date(2026, 11, 26)),
          lastMonth: days(new Date(2026, 11, 1), new Date(2026, 11, 31)),
          currentQuarter: days(new Date(2027, 0, 1), new Date(2027, 2, 31)),
          lastQuarter: days(new Date(2026, 9, 1), new Date(2026, 11, 31)),
          quarterToDate: days(new Date(2027, 0, 1), new Date(2027, 0, 1)),
          currentYear: days(new Date(2027, 0, 1), new Date(2027, 11, 31)),
          lastYear: days(new Date(2026, 0, 1), new Date(2026, 11, 31)),
        });
      });

      it('ends the months on their last day, also February of a leap year', () => {
        clock.setSystemTime(new Date(2028, 2, 31, 12));
        let ranges = selectAll();

        expect(ranges.lastMonth).to.eql(
          days(new Date(2028, 1, 1), new Date(2028, 1, 29))
        );
        expect(ranges.currentQuarter).to.eql(
          days(new Date(2028, 0, 1), new Date(2028, 2, 31))
        );
        expect(ranges.lastQuarter).to.eql(
          days(new Date(2027, 9, 1), new Date(2027, 11, 31))
        );

        clock.setSystemTime(new Date(2028, 4, 31, 12));
        ranges = selectAll();

        expect(ranges.lastMonth).to.eql(
          days(new Date(2028, 3, 1), new Date(2028, 3, 30))
        );
        expect(ranges.lastQuarter).to.eql(
          days(new Date(2028, 0, 1), new Date(2028, 2, 31))
        );
      });

      it('starts the last week on `weekStart`', async () => {
        const lastWeek = async (weekStart: WeekDays) => {
          component.weekStart = weekStart;
          await elementUpdated(component);
          return selectAll().lastWeek;
        };

        expect(await lastWeek('sunday')).to.eql(
          days(new Date(2026, 10, 8), new Date(2026, 10, 14))
        );
        expect(await lastWeek('monday')).to.eql(
          days(new Date(2026, 10, 9), new Date(2026, 10, 15))
        );
        // Today is the first day of the week.
        expect(await lastWeek('tuesday')).to.eql(
          days(new Date(2026, 10, 10), new Date(2026, 10, 16))
        );
        expect(await lastWeek('saturday')).to.eql(
          days(new Date(2026, 10, 7), new Date(2026, 10, 13))
        );
      });

      it('shows the new labels in English in a locale without them, unless the strings set them', async () => {
        component.predefinedRanges = ['last7Days', 'today'];
        component.locale = 'bg';
        await elementUpdated(component);

        expect(chipLabels()).to.eql([
          ResourceStringsBG.date_range_picker_last7Days,
          'Today',
        ]);

        component.resourceStrings = {
          date_range_picker_today: 'Днес',
        } as Record<string, string>;
        await elementUpdated(component);

        expect(chipLabels()).to.eql([
          ResourceStringsBG.date_range_picker_last7Days,
          'Днес',
        ]);
      });
    });

    describe('Range keys', () => {
      let clock: SinonFakeTimers;

      const ranges: CustomDateRange[] = [
        {
          key: 'sinceYesterday',
          label: 'Since yesterday',
          getDateRange: () => ({
            start: CalendarDay.today.add('day', -1).native,
            end: CalendarDay.today.native,
          }),
        },
        {
          label: 'Launch week',
          dateRange: {
            start: new Date(2026, 10, 2),
            end: new Date(2026, 10, 8),
          },
        },
      ];

      beforeEach(async () => {
        clock = useFakeTimers({
          now: new Date(2026, 10, 17, 23, 59),
          toFake: ['Date'],
        });
        component.usePredefinedRanges = true;
        component.customRanges = ranges;
        await elementUpdated(component);
      });

      afterEach(() => {
        clock.restore();
      });

      function selectChip(label: string): RangeSelectEvent {
        return select(getChips().find((chip) => chip.innerText === label)!);
      }

      it('names the chip with its key, or with its label without a key', () => {
        expect(selectChip('Last 7 Days').key).to.equal('last7Days');
        expect(selectChip('Year to Date').key).to.equal('yearToDate');
        expect(selectChip('Since yesterday').key).to.equal('sinceYesterday');
        expect(selectChip('Launch week').key).to.equal('Launch week');
      });

      it('calls `getDateRange` at the click, so a click after midnight gets the dates of the new day', () => {
        expect(selectChip('Since yesterday').detail).to.eql({
          start: new Date(2026, 10, 16),
          end: new Date(2026, 10, 17),
        });

        clock.setSystemTime(new Date(2026, 10, 18, 0, 1));

        expect(selectChip('Since yesterday').detail).to.eql({
          start: new Date(2026, 10, 17),
          end: new Date(2026, 10, 18),
        });
      });

      it('shows the chip of `selectedRange` as selected', async () => {
        component.selectedRange = 'Launch week';
        await elementUpdated(component);

        const selected = getChips().map((chip) => chip.selected);
        expect(selected).to.eql([false, false, false, false, false, true]);

        for (const chip of getChips()) {
          expect(chip.selectable).to.be.true;
          expect(chip.renderRoot.querySelector('button')!.ariaPressed).to.equal(
            String(chip.selected)
          );
        }

        await expect(component).shadowDom.to.be.accessible();
      });

      it('disables a chip whose range includes a date of `dateConstraints`', async () => {
        component.dateConstraints = [
          { type: DateRangeType.Before, dateRange: [new Date(2026, 10, 10)] },
        ];
        await elementUpdated(component);

        expect(getChips().map((chip) => chip.disabled)).to.eql([
          false,
          true,
          true,
          true,
          false,
          true,
        ]);

        component.dateConstraints = [];
        component.disabled = true;
        await elementUpdated(component);

        expect(getChips().every((chip) => chip.disabled)).to.be.true;
      });

      it('checks the end of a range with one end', async () => {
        component.usePredefinedRanges = false;
        component.customRanges = [
          {
            label: 'From the 3rd',
            dateRange: { start: new Date(2026, 10, 3), end: null },
          },
          {
            label: 'Up to the 3rd',
            dateRange: { start: null, end: new Date(2026, 10, 3) },
          },
        ];
        component.dateConstraints = [
          { type: DateRangeType.Specific, dateRange: [new Date(2026, 10, 3)] },
        ];
        await elementUpdated(component);

        expect(getChips().map((chip) => chip.disabled)).to.eql([true, true]);
      });

      it('takes the label as the key of a custom range with a `null` key', async () => {
        component.usePredefinedRanges = false;
        component.customRanges = [
          // For example from JSON.
          {
            label: 'Sprint',
            key: null as unknown as string,
            dateRange: { start: null, end: null },
          },
        ];
        await elementUpdated(component);

        const [chip] = getChips();
        expect(chip.selected).to.be.false;
        expect(select(chip).key).to.equal('Sprint');
      });

      it('checks each kind of constraint against the whole range', async () => {
        component.usePredefinedRanges = false;
        component.customRanges = [
          // Monday to Friday
          {
            label: 'Work week',
            dateRange: {
              start: new Date(2026, 10, 16),
              end: new Date(2026, 10, 20),
            },
          },
          {
            label: 'Weekend',
            dateRange: {
              start: new Date(2026, 10, 21),
              end: new Date(2026, 10, 22),
            },
          },
          {
            label: 'Fortnight',
            dateRange: {
              start: new Date(2026, 10, 9),
              end: new Date(2026, 10, 22),
            },
          },
        ];

        const disabledFor = async (constraint: DateRangeDescriptor) => {
          component.dateConstraints = [constraint];
          await elementUpdated(component);
          return getChips().map((chip) => chip.disabled);
        };
        const day = (date: number) => new Date(2026, 10, date);

        expect(
          await disabledFor({ type: DateRangeType.Weekends, dateRange: [] })
        ).to.eql([false, true, true]);
        expect(
          await disabledFor({ type: DateRangeType.Weekdays, dateRange: [] })
        ).to.eql([true, false, true]);
        expect(
          await disabledFor({
            type: DateRangeType.Between,
            dateRange: [day(25), day(21)],
          })
        ).to.eql([false, true, true]);
        expect(
          await disabledFor({
            type: DateRangeType.Specific,
            dateRange: [day(18)],
          })
        ).to.eql([true, false, true]);
        expect(
          await disabledFor({ type: DateRangeType.After, dateRange: [day(20)] })
        ).to.eql([false, true, true]);
        expect(
          await disabledFor({
            type: DateRangeType.Before,
            dateRange: [day(16)],
          })
        ).to.eql([false, false, true]);
      });

      it('ignores a click on the host of a disabled chip', async () => {
        component.disabled = true;
        await elementUpdated(component);

        const eventSpy = spy();
        component.addEventListener('igcRangeSelect', eventSpy);
        simulateClick(getChips()[0]);

        expect(eventSpy).not.called;
      });

      it('computes the custom ranges at render only to check them', async () => {
        const getDateRange = spy(() => ({
          start: new Date(2026, 10, 1),
          end: new Date(2026, 10, 2),
        }));
        component.customRanges = [{ label: 'Spied', getDateRange }];
        await elementUpdated(component);

        expect(getDateRange).not.called;

        component.dateConstraints = [
          { type: DateRangeType.Weekends, dateRange: [] },
        ];
        await elementUpdated(component);

        expect(getDateRange).calledOnce;
        expect(getChips().at(-1)!.disabled).to.be.true;
      });

      it('keeps the chip of `selectedRange` selected after a click on it', async () => {
        component.selectedRange = 'last7Days';
        await elementUpdated(component);

        // A click on the button of the chip, which toggles a selectable chip.
        const [chip] = getChips();
        simulateClick(chip.renderRoot.querySelector('button')!);
        await elementUpdated(component);
        await elementUpdated(chip);

        expect(chip.selected).to.be.true;
      });
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
