import { expect } from '@open-wc/testing';

import { isValidDate } from '#internals/date/converters.js';
import {
  assumeWallClock,
  fourDigitYearDate as date,
} from '#internals/testing/date-arbitraries.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { DatePart, DatePartType } from '../date-time-input/date-part.js';
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

const anyPart = fc.constantFrom(...Object.values(DatePart));
const position = fc.constantFrom(
  DateRangePosition.Start,
  DateRangePosition.End
);
const SEED = new Date(2030, 5, 10);

const request = fc.record({
  sign: fc.constantFrom<1 | -1>(1, -1),
  delta: fc.integer({ min: 0, max: 400 }),
  spinLoop: fc.boolean(),
  seed: fc.constant(SEED),
});

type TextKind = 'full' | 'partial' | 'blank';

/** The text of one end: the formatted date, the date with a prompt in its first part, or blank. */
const textKind = fc.constantFrom<TextKind>('full', 'partial', 'blank');

function textOf(
  parser: DateTimeMaskParser,
  value: Date,
  kind: TextKind
): string {
  const masked = parser.formatValue(value);
  const { start } = parser.getFirstPart()!;

  return kind === 'full'
    ? masked
    : kind === 'partial'
      ? masked.slice(0, start) + parser.prompt + masked.slice(start + 1)
      : parser.emptyMask;
}

describe('Date range mask parser properties', () => {
  it('round-trips a range through formatValue and parseDateRange', () => {
    fc.assert(
      fc.property(options, date, date, (opts, start, end) => {
        assumeWallClock(opts.format, start);
        assumeWallClock(opts.format, end);

        const parser = new DateRangeMaskParser(opts);
        const masked = parser.formatValue({ start, end });
        const parsed = parser.parseDateRange(masked);

        expect(masked).to.have.lengthOf(parser.emptyMask.length);
        expect(parsed?.start, masked).to.be.an.instanceOf(Date);
        expect(parsed?.end, masked).to.be.an.instanceOf(Date);
        expect(parser.formatValue(parsed)).to.equal(masked);
      })
    );
  });

  it('parses each side like a single date parser', () => {
    fc.assert(
      fc.property(options, date, date, (opts, start, end) => {
        const parser = new DateRangeMaskParser(opts);
        const single = new DateTimeMaskParser({ format: opts.format });
        const parsed = parser.parseDateRange(
          parser.formatValue({ start, end })
        );

        expect(parsed!.start!.getTime()).to.equal(
          single.parseDate(single.formatValue(start))!.getTime()
        );
        expect(parsed!.end!.getTime()).to.equal(
          single.parseDate(single.formatValue(end))!.getTime()
        );
      })
    );
  });

  it('gives a strict parse only when both ends are complete, and a lenient parse of each end', () => {
    fc.assert(
      fc.property(
        options,
        date,
        date,
        textKind,
        textKind,
        (opts, start, end, startKind, endKind) => {
          assumeWallClock(opts.format, start);
          assumeWallClock(opts.format, end);

          const parser = new DateRangeMaskParser(opts);
          const single = new DateTimeMaskParser({ format: opts.format });
          const startText = textOf(single, start, startKind);
          const endText = textOf(single, end, endKind);
          const masked = startText + parser.separator + endText;
          const strict = parser.parseValue(masked, true);
          const lenient = parser.parseValue(masked, false);
          const ends = {
            start: single.parseDate(startText),
            end: single.parseDate(endText),
          };

          // A blank end parses to the defaults, but a blank range is empty.
          if (startKind === 'blank' && endKind === 'blank') {
            expect(lenient, masked).to.be.null;
          } else {
            expect(lenient, masked).to.deep.equal(
              ends.start || ends.end ? ends : null
            );
          }

          if (startKind === 'full' && endKind === 'full') {
            expect(parser.formatValue(strict), masked).to.equal(masked);
            expect(strict, masked).to.deep.equal(lenient);
          } else {
            expect(strict, masked).to.be.null;
          }
        }
      )
    );
  });

  it('parses an edit by end: a complete end, the previous end while incomplete, and no end while blank', () => {
    const optionalDate = fc.option(date, { nil: null });

    fc.assert(
      fc.property(
        options,
        date,
        date,
        textKind,
        textKind,
        optionalDate,
        optionalDate,
        (opts, start, end, startKind, endKind, previousStart, previousEnd) => {
          assumeWallClock(opts.format, start);
          assumeWallClock(opts.format, end);

          const parser = new DateRangeMaskParser(opts);
          const single = new DateTimeMaskParser({ format: opts.format });
          const startText = textOf(single, start, startKind);
          const endText = textOf(single, end, endKind);
          const masked = startText + parser.separator + endText;

          const expectedEnd = (
            text: string,
            kind: TextKind,
            previous: Date | null
          ) =>
            kind === 'full'
              ? single.parseDate(text)
              : kind === 'partial'
                ? previous
                : null;

          const ends = {
            start: expectedEnd(startText, startKind, previousStart),
            end: expectedEnd(endText, endKind, previousEnd),
          };

          expect(
            parser.parseEdit(masked, {
              start: previousStart,
              end: previousEnd,
            }),
            masked
          ).to.deep.equal(ends.start || ends.end ? ends : null);
        }
      )
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

  describe('Part editing', () => {
    it('spins each end of a range like a single date', () => {
      fc.assert(
        fc.property(
          options,
          fc.option(date, { nil: null }),
          fc.option(date, { nil: null }),
          anyPart,
          position,
          request,
          (opts, start, end, part, at, spin) => {
            fc.pre(start !== null || end !== null);

            const parser = new DateRangeMaskParser(opts);
            const single = new DateTimeMaskParser({ format: opts.format });
            const spun = parser.spin(
              { start, end },
              { part, position: at },
              spin
            );

            if (at === DateRangePosition.Start) {
              expect(spun.start).to.eql(single.spin(start, part, spin));
              expect(spun.end).to.equal(end);
            } else {
              expect(spun.end).to.eql(single.spin(end, part, spin));
              expect(spun.start).to.equal(start);
            }
          }
        )
      );
    });

    it('gives an empty range the seed at both ends', () => {
      fc.assert(
        fc.property(
          options,
          anyPart,
          position,
          request,
          (opts, part, at, spin) => {
            const parser = new DateRangeMaskParser(opts);
            const seeded = { start: SEED, end: SEED };

            for (const value of [null, { start: null, end: null }]) {
              expect(parser.spin(value, { part, position: at }, spin)).to.eql(
                seeded
              );
            }

            const text = parser.spinText(
              parser.emptyMask,
              { part, position: at },
              spin
            );

            expect(text.value).to.eql(seeded);
            expect(text.masked).to.equal(parser.formatValue(seeded));
          }
        )
      );
    });

    it('spins the text of one end like a single date and keeps the text of the other end', () => {
      fc.assert(
        fc.property(
          options,
          date,
          date,
          textKind,
          textKind,
          anyPart,
          position,
          request,
          (opts, start, end, startKind, endKind, part, at, spin) => {
            const parser = new DateRangeMaskParser(opts);
            const single = new DateTimeMaskParser({ format: opts.format });
            const startText = textOf(single, start, startKind);
            const endText = textOf(single, end, endKind);
            const masked = startText + parser.separator + endText;

            fc.pre(!parser.isBlank(masked));

            const spun = parser.spinText(masked, { part, position: at }, spin);
            const spunStart = spun.masked.slice(0, startText.length);
            const spunEnd = spun.masked.slice(
              startText.length + parser.separator.length
            );

            if (at === DateRangePosition.Start) {
              const expected = single.spinText(startText, part, spin);

              expect(spunStart).to.equal(expected.masked);
              expect(spunEnd).to.equal(endText);
              expect(spun.value).to.eql({
                start: expected.value,
                end: single.parseValue(endText, true),
              });
            } else {
              const expected = single.spinText(endText, part, spin);

              expect(spunEnd).to.equal(expected.masked);
              expect(spunStart).to.equal(startText);
              expect(spun.value).to.eql({
                start: single.parseValue(startText, true),
                end: expected.value,
              });
            }
          }
        )
      );
    });

    it('names the part at the caret and the default part by the end they belong to', () => {
      fc.assert(
        fc.property(options, fc.nat(), (opts, n) => {
          const parser = new DateRangeMaskParser(opts);
          const single = new DateTimeMaskParser({ format: opts.format });
          const length = single.emptyMask.length;
          const separatorEnd = length + parser.separator.length;
          const caret = n % (parser.emptyMask.length + 1);

          const isEnd = caret >= separatorEnd;
          const part = isEnd
            ? single.partAt(caret - separatorEnd)
            : caret <= length
              ? single.partAt(caret)
              : undefined;
          const end = isEnd ? DateRangePosition.End : DateRangePosition.Start;

          expect(parser.partAt(caret)).to.eql(part && { part, position: end });
          expect(parser.defaultPart()).to.eql({
            part: single.defaultPart(),
            position: DateRangePosition.Start,
          });
        })
      );
    });
  });
});
