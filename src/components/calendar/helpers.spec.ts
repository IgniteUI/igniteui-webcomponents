import { expect } from '@open-wc/testing';

import { CalendarDay } from '#internals/date/model.js';
import { isDateInRanges } from './helpers.js';
import { DateRangeType } from './types.js';

describe('Calendar helpers', () => {
  const start = new CalendarDay({ year: 1987, month: 6, date: 17 });

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
