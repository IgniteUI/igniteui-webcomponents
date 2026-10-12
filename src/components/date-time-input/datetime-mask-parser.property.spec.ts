import { expect } from '@open-wc/testing';

import { isValidDate } from '#internals/date/converters.js';
import {
  assumeWallClock,
  fourDigitYearDate as date,
  pivotTwoDigitYear,
  toWallClock,
} from '#internals/testing/date-arbitraries.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { DatePartType } from './date-part.js';
import {
  DateTimeMaskParser,
  formatHasDateParts,
  formatHasTimeParts,
} from './datetime-mask-parser.js';

/** Separators, a few with mask flags (`A`, `#`, `0`) that must stay literal. */
const SEPARATORS = ['/', '-', '.', ':', ' ', ', ', ' 📅 ', ' A ', '#', ' 0 '];

/** Part variants with a fixed width. */
const PADDED_PARTS = [
  ['yyyy', 'yy'],
  ['MM'],
  ['dd'],
  ['HH', 'hh'],
  ['mm'],
  ['ss'],
];

/** All documented part variants. */
const ALL_PARTS = [
  ['yyyy', 'yyy', 'yy', 'y'],
  ['MM', 'M'],
  ['dd', 'd'],
  ['HH', 'H', 'hh', 'h'],
  ['mm', 'm'],
  ['ss', 's'],
  ['tt', 't'],
];

function formatOf(groups: string[][]) {
  return fc
    .shuffledSubarray(groups, { minLength: 1 })
    .chain((picked) =>
      fc.tuple(
        fc.tuple(...picked.map((variants) => fc.constantFrom(...variants))),
        fc.array(fc.constantFrom(...SEPARATORS), {
          minLength: picked.length,
          maxLength: picked.length,
        })
      )
    )
    .map(([parts, separators]) =>
      parts.map((part, i) => (i ? separators[i] : '') + part).join('')
    );
}

/** A padded format. An `hh` format gets a `tt` part, because a 12-hour value needs it. */
const paddedFormat = formatOf(PADDED_PARTS).map((format) =>
  format.includes('hh') ? `${format} tt` : format
);

const anyFormat = formatOf(ALL_PARTS);

const anyString = fc.string({ unit: 'grapheme', maxLength: 30 });

describe('Date-time mask parser properties', () => {
  it('round-trips a date through formatDate and parseDate', () => {
    fc.assert(
      fc.property(paddedFormat, date, (format, value) => {
        const clock = assumeWallClock(format, value);
        const parser = new DateTimeMaskParser({ format });
        const masked = parser.formatDate(value);
        const parsed = parser.parseDate(masked);

        expect(masked).to.have.lengthOf(parser.emptyMask.length);
        expect(parsed, masked).to.be.an.instanceOf(Date);
        expect(parser.formatDate(parsed)).to.equal(masked);
        expect(toWallClock(parsed!), masked).to.deep.equal(clock);
      })
    );
  });

  it('resolves a two-digit year to the 1950 to 2049 range', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 99 }), (year) => {
        const parser = new DateTimeMaskParser({ format: 'MM/dd/yy' });
        const typed = String(year).padStart(2, '0');

        expect(parser.parseDate(`01/01/${typed}`)!.getFullYear()).to.equal(
          pivotTwoDigitYear(year)
        );
      })
    );
  });

  it('never throws, and parses any string to null or a valid date', () => {
    fc.assert(
      fc.property(anyFormat, anyString, (format, value) => {
        const parser = new DateTimeMaskParser({ format });
        const masked = parser.apply(value);

        expect(masked).to.have.lengthOf(parser.emptyMask.length);
        parser.isBlank(masked);

        for (const parsed of [
          parser.parseDate(value),
          parser.parseDate(masked),
        ]) {
          expect(parsed === null || isValidDate(parsed)).to.be.true;
        }
      })
    );
  });

  it('keeps each part inside the mask', () => {
    fc.assert(
      fc.property(anyFormat, (format) => {
        const parser = new DateTimeMaskParser({ format });
        let previousEnd = 0;

        for (const part of parser.parts) {
          expect(part.start).to.equal(previousEnd);
          expect(part.end).to.be.above(part.start);
          previousEnd = part.end;
        }

        expect(previousEnd).to.equal(parser.emptyMask.length);
        expect(parser.hasDateParts() || parser.hasTimeParts()).to.equal(
          parser.parts.some(
            (part) =>
              part.type !== DatePartType.Literal &&
              part.type !== DatePartType.AmPm
          )
        );
        expect(formatHasDateParts(format)).to.equal(parser.hasDateParts());
        expect(formatHasTimeParts(format)).to.equal(parser.hasTimeParts());
      })
    );
  });
});
