import { expect } from '@open-wc/testing';

import { DateRangeType } from './calendar.model.js';
import { CalendarDay, dayRange, isDateInRanges } from './day.js';

function first<T>(arr: T[]) {
  return arr.at(0) as T;
}

function last<T>(arr: T[]) {
  return arr.at(-1) as T;
}

describe('Calendar day model', () => {
  const start = new CalendarDay({ year: 1987, month: 6, date: 17 });

  describe('Date ranges', () => {
    const start = new CalendarDay({ year: 2024, month: 0, date: 11 });
    const endFuture = start.add('day', 7);
    const endPast = start.add('day', -7);
    const range = 7;

    it('generating date ranges (positive number)', () => {
      const weekFuture = Array.from(dayRange(start, range));

      expect(weekFuture.length).to.equal(range);

      expect(first(weekFuture).date).to.equal(start.date);
      expect(last(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (negative number)', () => {
      const weekPast = Array.from(dayRange(start, -range));

      expect(weekPast.length).to.equal(range);

      expect(first(weekPast).date).to.equal(start.date);
      expect(last(weekPast).date).to.equal(endPast.date + 1);
    });

    it('generating date ranges (end > start)', () => {
      const weekFuture = Array.from(dayRange(start, endFuture));

      expect(weekFuture.length).to.equal(range);

      expect(first(weekFuture).date).to.equal(start.date);
      expect(last(weekFuture).date).to.equal(endFuture.date - 1);
    });

    it('generating date ranges (end < start)', () => {
      const weekPast = Array.from(dayRange(start, endPast));

      expect(weekPast.length).to.equal(range);

      expect(first(weekPast).date).to.equal(start.date);
      expect(last(weekPast).date).to.equal(endPast.date + 1);
    });
  });

  describe('Month generation', () => {
    it('works', () => {
      // const old = new Calendar(0);
      // const oldMonth = old.monthdates(1987, 6, true);
      // const newMonth = Array.from(generateFullMonth(start, 0));
    });
  });

  it('works', () => {
    expect(start.year).to.equal(1987);
    expect(start.month).to.equal(6);
    expect(start.date).to.equal(17);
  });

  it('equals', () => {
    expect(start.equalTo(new Date(1987, 6, 17))).to.be.true;
    expect(start.equalTo(new Date(1987, 6, 16))).to.be.false;
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
