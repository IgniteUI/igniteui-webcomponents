import { expect } from '@open-wc/testing';

import { CalendarDay } from '#internals/date/model.js';
import {
  fourDigitYearDate as date,
  isoDate,
} from '#internals/testing/date-arbitraries.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import type { DateRangeValue } from '../types.js';
import {
  isCompleteDateRange,
  normalizeRange,
  rangeShape,
  rangeTransformers,
} from './range-shape.js';

const end = fc.option(date, { nil: null });

const range: fc.Arbitrary<DateRangeValue | null> = fc.option(
  fc.record({ start: end, end }),
  { nil: null }
);

/** The times of the defined ends, in ascending order. The oracle for the ends a range holds. */
function timesOf(value: DateRangeValue | null): number[] {
  return [value?.start, value?.end]
    .filter((day) => day != null)
    .map((day) => day.getTime())
    .toSorted((a, b) => a - b);
}

/** A selection of the calendar: no dates, one date, or every day from a start to a later end. */
const selection: fc.Arbitrary<Date[]> = fc.oneof(
  fc.constant<Date[]>([]),
  date.map((day) => [CalendarDay.from(day).native]),
  fc.tuple(date, fc.integer({ min: 1, max: 60 })).map(([day, length]) => {
    const start = CalendarDay.from(day);
    return Array.from(
      { length: length + 1 },
      (_, i) => start.add('day', i).native
    );
  })
);

describe('Picker value shape properties', () => {
  describe('Range value shape properties', () => {
    it('normalize is idempotent', () => {
      fc.assert(
        fc.property(range, (value) => {
          const once = normalizeRange(value);
          expect(normalizeRange(once)).to.equal(once);
        })
      );
    });

    it('normalize gives null or a range in order of time', () => {
      fc.assert(
        fc.property(range, (value) => {
          const result = normalizeRange(value);

          if (result === null) {
            expect(timesOf(value)).to.eql([]);
            return;
          }

          expect(timesOf(result)).to.not.eql([]);
          if (isCompleteDateRange(result)) {
            expect(result.start.getTime()).to.be.at.most(result.end.getTime());
          }
        })
      );
    });

    it('normalize keeps the dates and their time', () => {
      fc.assert(
        fc.property(range, (value) => {
          expect(timesOf(normalizeRange(value))).to.eql(timesOf(value));
        })
      );
    });

    it('an attribute string is normalized like the range of its dates', () => {
      const isoEnd = fc.option(isoDate, { nil: null });

      fc.assert(
        fc.property(isoEnd, isoEnd, (start, finish) => {
          const text = JSON.stringify({
            start: start?.toISOString() ?? null,
            end: finish?.toISOString() ?? null,
          });

          expect(rangeTransformers.setValue!(text as never)).to.eql(
            normalizeRange({ start, end: finish })
          );
        })
      );
    });

    it('a complete range goes to the calendar and back unchanged', () => {
      fc.assert(
        fc.property(date, date, (a, b) => {
          const value = normalizeRange({
            start: CalendarDay.from(a).native,
            end: CalendarDay.from(b).native,
          });

          expect(
            rangeShape.fromCalendar(rangeShape.toCalendar(value).values)
          ).to.eql(value);
        })
      );
    });

    it('a calendar selection comes back as its first and last date', () => {
      fc.assert(
        fc.property(selection, (dates) => {
          const value = rangeShape.fromCalendar(dates);
          const ends = dates.length > 1 ? [dates[0], dates.at(-1)] : dates;

          expect(rangeShape.toCalendar(value).values).to.eql(ends);
          expect(rangeShape.closesOnPick(dates)).to.equal(dates.length > 1);
        })
      );
    });
  });
});
