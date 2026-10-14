import { expect } from '@open-wc/testing';

import { CalendarDay } from '#internals/date/model.js';
import {
  createDateConstraints,
  getViewElement,
  isDateInRanges,
} from './helpers.js';
import type { DateRangeDescriptor } from './types.js';
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

    it('Weekdays and Weekends ignore a date range', () => {
      const dateRange = [start.add('day', 30).native];

      expect(
        isDateInRanges(start, [{ type: DateRangeType.Weekdays, dateRange }])
      ).to.equal(!start.weekend);
      expect(
        isDateInRanges(start, [{ type: DateRangeType.Weekends, dateRange }])
      ).to.equal(start.weekend);
    });

    it('an unknown descriptor type disables nothing', () => {
      expect(
        isDateInRanges(start, [
          {
            type: 'unknown',
            dateRange: [start.native],
          } as unknown as DateRangeDescriptor,
        ])
      ).to.be.false;
    });
  });

  describe('createDateConstraints', () => {
    it('returns no constraints without min, max and disabled dates', () => {
      expect(createDateConstraints(null, null)).to.be.empty;
    });

    it('turns min and max into Before and After descriptors', () => {
      const min = start.add('day', -3).native;
      const max = start.add('day', 3).native;
      const extra: DateRangeDescriptor = { type: DateRangeType.Weekends };

      expect(createDateConstraints(min, max, [extra])).to.deep.equal([
        { type: DateRangeType.Before, dateRange: [min] },
        { type: DateRangeType.After, dateRange: [max] },
        extra,
      ]);
    });
  });

  describe('getViewElement', () => {
    function valueOnDispatch(target: HTMLElement): number {
      let value = Number.NaN;
      const listener = (event: Event) => {
        value = getViewElement(event);
      };

      document.body.addEventListener('click', listener);
      target.dispatchEvent(new Event('click', { bubbles: true }));
      document.body.removeEventListener('click', listener);

      return value;
    }

    it('returns the value of the activated view element', () => {
      const element = document.createElement('span');
      element.dataset.value = '42';
      document.body.append(element);

      expect(valueOnDispatch(element)).to.equal(42);
      element.remove();
    });

    it('returns -1 when the event path holds no view element', () => {
      const element = document.createElement('span');
      document.body.append(element);

      expect(valueOnDispatch(element)).to.equal(-1);
      element.remove();
    });
  });
});
