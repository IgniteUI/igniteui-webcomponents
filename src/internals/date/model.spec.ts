import { expect } from '@open-wc/testing';
import { fourDigitYearDate } from '../testing/date-arbitraries.spec.js';
import { fc } from '../testing/fast-check-setup.spec.js';

import { firstOf, lastOf } from '../utils/arrays.js';
import { CalendarDay, calendarRange, createDate } from './model.js';

describe('Calendar day model', () => {
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

  describe('equalTo', () => {
    it('compares a `Date` by its calendar day, ignoring the time', () => {
      const day = new CalendarDay({ year: 2024, month: 2, date: 31 });

      expect(day.equalTo(new Date(2024, 2, 31, 23, 59, 59, 999))).to.be.true;
      expect(day.equalTo(new Date(2024, 2, 31))).to.be.true;
      expect(day.equalTo(new Date(2024, 3, 1))).to.be.false;
      expect(day.equalTo(new Date(2023, 2, 31))).to.be.false;
    });

    it('compares a `Date` of a year below 100', () => {
      const early = createDate(42, 5, 15);

      expect(new CalendarDay({ year: 42, month: 5, date: 15 }).equalTo(early))
        .to.be.true;
      expect(new CalendarDay({ year: 1942, month: 5, date: 15 }).equalTo(early))
        .to.be.false;
    });

    it('agrees with the timestamp comparison for any two dates', () => {
      fc.assert(
        fc.property(fourDigitYearDate, fourDigitYearDate, (a, b) => {
          const day = CalendarDay.from(a);

          expect(day.equalTo(b)).to.equal(
            day.timestamp === CalendarDay.from(b).timestamp
          );
          expect(day.equalTo(a)).to.be.true;
        })
      );
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

      expect(firstOf(weekFuture).date).to.equal(start.date);
      expect(lastOf(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (negative number)', () => {
      const weekPast = Array.from(calendarRange({ start, end: -end }));

      expect(weekPast.length).to.equal(end);

      expect(firstOf(weekPast).date).to.equal(start.date);
      expect(lastOf(weekPast).date).to.equal(endPast.date + 1);
    });

    it('generating date ranges (end > start)', () => {
      const weekFuture = Array.from(calendarRange({ start, end: endFuture }));

      expect(weekFuture.length).to.equal(end);

      expect(firstOf(weekFuture).date).to.equal(start.date);
      expect(lastOf(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (end < start)', () => {
      const weekPast = Array.from(calendarRange({ start, end: endPast }));

      expect(weekPast.length).to.equal(end);

      expect(firstOf(weekPast).date).to.equal(start.date);
      expect(lastOf(weekPast).date).to.equal(endPast.date + 1);
    });

    it('generating inclusive date ranges (end < start)', () => {
      const weekPast = Array.from(
        calendarRange({ start, end: endPast, inclusive: true })
      );

      expect(weekPast.length).to.equal(end + 1);
      expect(firstOf(weekPast).equalTo(start)).to.be.true;
      expect(lastOf(weekPast).equalTo(endPast)).to.be.true;
    });
  });

  describe('Edge cases', () => {
    const day = new CalendarDay({ year: 2024, month: 0, date: 11 });

    it('greaterThanOrEqual', () => {
      expect(day.greaterThanOrEqual(day.add('day', -1))).to.be.true;
      expect(day.greaterThanOrEqual(day.native)).to.be.true;
      expect(day.greaterThanOrEqual(day.add('day', 1))).to.be.false;
    });

    it('throws for an unknown unit', () => {
      expect(() => day.add('decade' as 'day', 1)).to.throw(
        'Invalid interval: decade'
      );
    });

    it('converts to the string of the native date', () => {
      expect(`${day}`).to.equal(String(new Date(2024, 0, 11)));
    });
  });
});
