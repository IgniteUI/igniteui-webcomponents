import { expect } from '@open-wc/testing';

import { isValidDate } from '#internals/date/converters.js';
import {
  assumeWallClock,
  fourDigitYearDate as date,
} from '#internals/testing/date-arbitraries.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { DatePartType } from '../date-time-input/date-part.js';
import { DateTimeMaskParser } from '../date-time-input/datetime-mask-parser.js';
import {
  DateRangeMaskParser,
  DateRangePosition,
} from './date-range-mask-parser.js';

const FORMATS = [
  'MM/dd/yyyy',
  'dd.MM.yyyy',
  'yyyy-MM-dd',
  'MM/dd/yy',
  'MM/dd/yyyy HH:mm',
  'dd/MM/yyyy hh:mm tt',
];

/** Formats with single-position and widened year parts. */
const LOOSE_FORMATS = [...FORMATS, 'M/d/yy', 'd.M.y', 'yyy-M-d', 'H:m:s'];

/** Separators, a few with date format letters and mask flags. */
const SEPARATORS = [
  ' - ',
  ' – ',
  ' ~ ',
  '/',
  ' 📅 ',
  ' to ',
  ' y ',
  ' and ',
  ' 0 ',
];

const optionsOf = (formats: string[]) =>
  fc.record({
    format: fc.constantFrom(...formats),
    separator: fc.constantFrom(...SEPARATORS),
  });

const options = optionsOf(FORMATS);
const looseOptions = optionsOf(LOOSE_FORMATS);

describe('Date range mask parser properties', () => {
  it('round-trips a range through formatDateRange and parseDateRange', () => {
    fc.assert(
      fc.property(options, date, date, (opts, start, end) => {
        assumeWallClock(opts.format, start);
        assumeWallClock(opts.format, end);

        const parser = new DateRangeMaskParser(opts);
        const masked = parser.formatDateRange({ start, end });
        const parsed = parser.parseDateRange(masked);

        expect(masked).to.have.lengthOf(parser.emptyMask.length);
        expect(parsed?.start, masked).to.be.an.instanceOf(Date);
        expect(parsed?.end, masked).to.be.an.instanceOf(Date);
        expect(parser.formatDateRange(parsed)).to.equal(masked);
      })
    );
  });

  it('parses each side like a single date parser', () => {
    fc.assert(
      fc.property(options, date, date, (opts, start, end) => {
        const parser = new DateRangeMaskParser(opts);
        const single = new DateTimeMaskParser({ format: opts.format });
        const parsed = parser.parseDateRange(
          parser.formatDateRange({ start, end })
        );

        expect(parsed!.start!.getTime()).to.equal(
          single.parseDate(single.formatDate(start))!.getTime()
        );
        expect(parsed!.end!.getTime()).to.equal(
          single.parseDate(single.formatDate(end))!.getTime()
        );
      })
    );
  });

  it('lays out the two dates around the separator', () => {
    fc.assert(
      fc.property(looseOptions, looseOptions, (initial, next) => {
        const parser = new DateRangeMaskParser(initial);
        parser.mask = next.format;

        const single = new DateTimeMaskParser({ format: next.format });
        const separatorStart = single.emptyMask.length;
        const separatorEnd = separatorStart + parser.separator.length;

        expect(parser.emptyMask).to.equal(
          single.emptyMask + parser.separator + single.emptyMask
        );

        for (const part of parser.parts) {
          if (part.position === DateRangePosition.Start) {
            expect(part.end).to.be.at.most(separatorStart);
          } else {
            expect(part.start).to.be.at.least(separatorEnd);
            expect(part.end).to.be.at.most(parser.emptyMask.length);
          }
        }

        const dateParts = parser.parts.filter(
          (part) => part.type !== DatePartType.Literal
        );
        expect(dateParts).to.have.lengthOf(
          2 *
            single.parts.filter((part) => part.type !== DatePartType.Literal)
              .length
        );
      })
    );
  });

  it('never throws and returns valid dates for any string', () => {
    const masked = fc.string({ unit: 'grapheme', maxLength: 50 });

    fc.assert(
      fc.property(looseOptions, masked, (opts, value) => {
        const parser = new DateRangeMaskParser(opts);
        const parsed = parser.parseDateRange(parser.apply(value));

        for (const side of [parsed?.start, parsed?.end]) {
          expect(!side || isValidDate(side)).to.be.true;
        }
      })
    );
  });
});
