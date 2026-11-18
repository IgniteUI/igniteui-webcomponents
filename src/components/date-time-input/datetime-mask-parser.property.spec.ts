import { expect } from '@open-wc/testing';

import { isValidDate } from '#internals/date/converters.js';
import {
  assumeWallClock,
  fourDigitYearDate as date,
  pivotTwoDigitYear,
  toWallClock,
} from '#internals/testing/date-arbitraries.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { DatePart, type DatePartDeltas, DatePartType } from './date-part.js';
import {
  DateTimeMaskParser,
  formatHasDateParts,
  formatHasTimeParts,
  type PartDirection,
  type SpinRequest,
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

function formatOf(groups: string[][], separators = SEPARATORS) {
  return fc
    .shuffledSubarray(groups, { minLength: 1 })
    .chain((picked) =>
      fc.tuple(
        fc.tuple(...picked.map((variants) => fc.constantFrom(...variants))),
        fc.array(fc.constantFrom(...separators), {
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

/** A padded format whose parts touch, such as `yyyyMMdd`. */
const compactFormat = formatOf(PADDED_PARTS, ['']);

/** A padded format with exactly one literal character between two parts. */
const oneCharacterSeparatorFormat = formatOf(
  PADDED_PARTS,
  SEPARATORS.filter((separator) => separator.length === 1)
);

const anyPart = fc.constantFrom(...Object.values(DatePart));
const sign = fc.constantFrom<1 | -1>(1, -1);
const step = fc.integer({ min: 1, max: 400 });
const SEED = new Date(2030, 5, 10, 8, 30, 15);

/** The caret after `Ctrl + Arrow` under the literal rule of Angular: stop at each literal character. */
function literalEdge(
  parser: DateTimeMaskParser,
  caret: number,
  direction: PartDirection
): number {
  const literals = parser.parts.filter(
    (part) => part.type === DatePartType.Literal
  );

  return direction === 'back'
    ? (literals.findLast((part) => part.end < caret)?.end ?? 0)
    : (literals.find((part) => part.start > caret)?.start ??
        parser.emptyMask.length);
}

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

  describe('Part editing', () => {
    it('steps by the delta, else by spinDelta, else by 1, in the direction of the request', () => {
      fc.assert(
        fc.property(
          paddedFormat,
          date,
          anyPart,
          sign,
          step,
          fc.boolean(),
          (format, value, part, sign, step, spinLoop) => {
            const parser = new DateTimeMaskParser({ format });
            const before = value.getTime();
            const spin = (request: Partial<SpinRequest>) =>
              parser.spin(value, part, {
                sign,
                spinLoop,
                seed: SEED,
                ...request,
              });
            const deltas = (amount: number) =>
              ({ [part]: amount }) as DatePartDeltas;

            const expected = spin({ delta: step });

            expect(isValidDate(expected)).to.be.true;
            expect(spin({ delta: -step })).to.eql(expected);
            expect(spin({ delta: 0, spinDelta: deltas(step) })).to.eql(
              expected
            );
            expect(spin({ spinDelta: deltas(-step) })).to.eql(expected);
            expect(spin({ spinDelta: deltas(0) })).to.eql(spin({ delta: 1 }));
            expect(value.getTime()).to.equal(before);
          }
        )
      );
    });

    it('gives an empty value a copy of the seed, without a step', () => {
      fc.assert(
        fc.property(
          anyFormat,
          anyPart,
          sign,
          step,
          (format, part, sign, step) => {
            const parser = new DateTimeMaskParser({ format });

            for (const value of [null, new Date(Number.NaN)]) {
              const spun = parser.spin(value, part, {
                sign,
                delta: step,
                spinLoop: true,
                seed: SEED,
              });

              expect(spun).to.eql(SEED);
              expect(spun).to.not.equal(SEED);
            }
          }
        )
      );
    });

    it('switches AM/PM to the other half of the same day', () => {
      fc.assert(
        fc.property(paddedFormat, date, sign, (format, value, sign) => {
          const spun = new DateTimeMaskParser({ format }).spin(
            value,
            DatePart.AmPm,
            { sign, spinLoop: true, seed: SEED }
          );

          expect(spun.getDate()).to.equal(value.getDate());
          expect(spun.getHours() < 12).to.equal(value.getHours() >= 12);
        })
      );
    });

    it('spins the date of a complete mask, and gives a partial mask the seed', () => {
      fc.assert(
        fc.property(
          paddedFormat,
          date,
          anyPart,
          sign,
          (format, value, part, sign) => {
            const parser = new DateTimeMaskParser({ format });
            const request = { sign, spinLoop: true, seed: SEED };
            const masked = parser.formatDate(value);

            const complete = parser.spinText(masked, part, request);

            expect(complete.value).to.eql(
              parser.spin(parser.parseComplete(masked), part, request)
            );
            expect(complete.masked).to.equal(parser.formatDate(complete.value));

            const { start } = parser.getFirstPart()!;
            const partial = parser.spinText(
              masked.slice(0, start) + parser.prompt + masked.slice(start + 1),
              part,
              request
            );

            expect(partial.value).to.eql(SEED);
            expect(partial.masked).to.equal(parser.formatDate(SEED));
          }
        )
      );
    });

    it('moves Ctrl + Arrow through every part edge in order', () => {
      fc.assert(
        fc.property(fc.oneof(anyFormat, compactFormat), (format) => {
          const parser = new DateTimeMaskParser({ format });
          const length = parser.emptyMask.length;
          const parts = parser.parts.filter(
            (part) => part.type !== DatePartType.Literal
          );

          const visit = (from: number, direction: PartDirection) => {
            const visited: number[] = [];
            let caret = from;
            let next = parser.partEdge(caret, direction);

            while (next !== caret) {
              visited.push(next);
              caret = next;
              next = parser.partEdge(caret, direction);
            }

            return visited;
          };

          expect(visit(0, 'forward')).to.eql(parts.map((part) => part.end));
          expect(visit(length, 'back')).to.eql(
            parts.map((part) => part.start).reverse()
          );
        })
      );
    });

    it('moves Ctrl + Arrow to the edges of the part at the caret', () => {
      fc.assert(
        fc.property(
          fc.oneof(anyFormat, compactFormat),
          fc.nat(),
          (format, n) => {
            const parser = new DateTimeMaskParser({ format });
            const parts = parser.parts.filter(
              (part) => part.type !== DatePartType.Literal
            );
            const part = parts[n % parts.length];
            fc.pre(part.end - part.start > 1);

            const caret = part.start + 1 + (n % (part.end - part.start - 1));

            expect(parser.partEdge(caret, 'forward')).to.equal(part.end);
            expect(parser.partEdge(caret, 'back')).to.equal(part.start);
          }
        )
      );
    });

    it('stops Ctrl + Arrow at the literal edges when one character separates each part', () => {
      fc.assert(
        fc.property(oneCharacterSeparatorFormat, fc.nat(), (format, n) => {
          const parser = new DateTimeMaskParser({ format });
          const caret = n % (parser.emptyMask.length + 1);

          for (const direction of ['back', 'forward'] as const) {
            expect(parser.partEdge(caret, direction)).to.equal(
              literalEdge(parser, caret, direction)
            );
          }
        })
      );
    });

    it('targets the date, else the hours, else the first part', () => {
      fc.assert(
        fc.property(anyFormat, (format) => {
          const parser = new DateTimeMaskParser({ format });
          const types = parser.parts.map((part) => part.type);
          const expected = types.includes(DatePartType.Date)
            ? DatePartType.Date
            : types.includes(DatePartType.Hours)
              ? DatePartType.Hours
              : types.find((type) => type !== DatePartType.Literal);

          expect(parser.defaultPart()).to.equal(expected);
        })
      );
    });
  });
});
