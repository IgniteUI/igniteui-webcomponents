import { describe, expect, it } from 'vitest';
import { first, last } from '../common/util.js';
import { calendarRange, isDateInRanges } from './helpers.js';
import { CalendarDay } from './model.js';
import { DateRangeType } from './types.js';

describe('Calendar day model', () => {
  const start = new CalendarDay({ year: 1987, month: 6, date: 17 });

  describe('Basic API', () => {
    const firstOfJan = new CalendarDay({ year: 2024, month: 0, date: 1 });

    it('has correct properties', () => {
      const { year, month, date } = firstOfJan;
      expect([year, month, date]).to.eql([2024, 0, 1]);

      // First week of 2024
      expect(firstOfJan.week).to.equal(1);

      // 2024/01/01 is a Monday
      expect(firstOfJan.day).to.equal(1);
      expect(firstOfJan.weekend).to.be.false;
    });

    it('comparators', () => {
      const today = CalendarDay.today;

      expect(today.greaterThan(firstOfJan)).to.be.true;
      expect(firstOfJan.lessThan(today)).to.be.true;
      expect(today.equalTo(new Date(Date.now())));
    });

    describe('Deltas', () => {
      it('year', () => {
        expect(
          firstOfJan
            .add('year', 1)
            .equalTo(new CalendarDay({ year: 2025, month: 0, date: 1 }))
        ).to.be.true;

        expect(
          firstOfJan
            .add('year', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 0, date: 1 }))
        ).to.be.true;
      });

      it('year (leap to non-leap)', () => {
        const leapFebruary = new CalendarDay({
          year: 2024,
          month: 1,
          date: 29,
        });

        expect(
          leapFebruary
            .add('year', 1)
            .equalTo(new CalendarDay({ year: 2025, month: 1, date: 28 }))
        );

        expect(
          leapFebruary
            .add('year', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 1, date: 28 }))
        );
      });

      it('quarters', () => {
        expect(
          firstOfJan
            .add('quarter', 1)
            .equalTo(new CalendarDay({ year: 2024, month: 3, date: 1 }))
        ).to.be.true;
        expect(
          firstOfJan
            .add('quarter', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 9, date: 1 }))
        ).to.be.true;
      });

      it('month', () => {
        expect(
          firstOfJan
            .add('month', 1)
            .equalTo(new CalendarDay({ year: 2024, month: 1, date: 1 }))
        ).to.be.true;
        expect(
          firstOfJan
            .add('month', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 11, date: 1 }))
        ).to.be.true;
      });

      it('week', () => {
        expect(
          firstOfJan
            .add('week', 1)
            .equalTo(new CalendarDay({ year: 2024, month: 0, date: 8 }))
        ).to.be.true;
        expect(firstOfJan.add('week', 1).week).to.equal(2);

        expect(
          firstOfJan
            .add('week', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 11, date: 25 }))
        ).to.be.true;
        expect(firstOfJan.add('week', -1).week).to.equal(52);
      });

      it('day', () => {
        expect(
          firstOfJan
            .add('day', 1)
            .equalTo(new CalendarDay({ year: 2024, month: 0, date: 2 }))
        ).to.be.true;
        expect(
          firstOfJan
            .add('day', -1)
            .equalTo(new CalendarDay({ year: 2023, month: 11, date: 31 }))
        );
      });
    });

    it('`replace` correctly takes into account invalid time shifts', () => {
      const leapFebruary = new CalendarDay({ year: 2024, month: 1, date: 29 });
      const nonLeapFebruary = leapFebruary.set({ year: 2023 });
      let { year, month, date } = nonLeapFebruary;

      // Shift to last day of the current month -> 2023-02-28
      expect([year, month, date]).to.eql([2023, 1, 28]);

      const lastDayOfJuly = new CalendarDay({ year: 2024, month: 6, date: 31 });
      const lastDayOfApril = lastDayOfJuly.set({ month: 3 });
      ({ year, month, date } = lastDayOfApril);

      // April does not have 31 days so clamp to the last day of April
      expect([year, month, date]).to.eql([2024, 3, 30]);
    });
  });

  describe('Date ranges', () => {
    const start = new CalendarDay({ year: 2024, month: 0, date: 11 });
    const endFuture = start.add('day', 7);
    const endPast = start.add('day', -7);
    const end = 7;

    it('generating date ranges (positive number)', () => {
      const weekFuture = Array.from(calendarRange({ start, end }));

      expect(weekFuture.length).to.equal(end);

      expect(first(weekFuture).date).to.equal(start.date);
      expect(last(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (negative number)', () => {
      const weekPast = Array.from(calendarRange({ start, end: -end }));

      expect(weekPast.length).to.equal(end);

      expect(first(weekPast).date).to.equal(start.date);
      expect(last(weekPast).date).to.equal(endPast.date + 1);
    });

    it('generating date ranges (end > start)', () => {
      const weekFuture = Array.from(calendarRange({ start, end: endFuture }));

      expect(weekFuture.length).to.equal(end);

      expect(first(weekFuture).date).to.equal(start.date);
      expect(last(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (end < start)', () => {
      const weekPast = Array.from(calendarRange({ start, end: endPast }));

      expect(weekPast.length).to.equal(end);

      expect(first(weekPast).date).to.equal(start.date);
      expect(last(weekPast).date).to.equal(endPast.date + 1);
    });
  });

  describe('DateRange descriptors', () => {
    const dayBefore = start.add('day', -1).native;
    const dayAfter = start.add('day', 1).native;
    const [begin, end] = [
      start.add('week', -1).native,
      start.add('week', 1).native,
    ];

    it('After', () => {
      expect(
        isDateInRanges(start, [
          { type: DateRangeType.After, dateRange: [dayBefore] },
        ])
      ).to.be.true;
    });

    it('Before', () => {
      expect(
        isDateInRanges(start, [
          { type: DateRangeType.Before, dateRange: [dayAfter] },
        ])
      ).to.be.true;
    });

    it('Between', () => {
      expect(
        isDateInRanges(start, [
          {
            type: DateRangeType.Between,
            dateRange: [begin, end],
          },
        ])
      ).to.be.true;
    });

    it('Specific', () => {
      expect(
        isDateInRanges(start, [
          {
            type: DateRangeType.Specific,
            dateRange: [],
          },
        ])
      ).to.be.false;
    });

    it('Weekday', () => {
      expect(isDateInRanges(start, [{ type: DateRangeType.Weekdays }])).to.be
        .true;
    });

    it('Weekends', () => {
      expect(
        isDateInRanges(start, [
          {
            type: DateRangeType.Weekends,
          },
        ])
      ).to.be.false;
    });
  });
});
