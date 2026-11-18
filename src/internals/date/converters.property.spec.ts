import { expect } from '@open-wc/testing';
import { isoDate } from '../testing/date-arbitraries.spec.js';
import { fc } from '../testing/fast-check-setup.spec.js';
import { convertToDateRange, isValidDate } from './converters.js';

const end = fc.option(isoDate, { nil: null });

describe('Date converter properties', () => {
  it('a range of ISO strings converts back to its dates, with their time', () => {
    fc.assert(
      fc.property(end, end, (start, finish) => {
        const range = convertToDateRange(
          JSON.stringify({
            start: start?.toISOString() ?? null,
            end: finish?.toISOString() ?? null,
          })
        );

        expect(range?.start?.getTime() ?? null).to.equal(
          start?.getTime() ?? null
        );
        expect(range?.end?.getTime() ?? null).to.equal(
          finish?.getTime() ?? null
        );
      })
    );
  });

  it('any string gives null or a range of valid dates', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string({ unit: 'grapheme' }), fc.json()),
        (text) => {
          const range = convertToDateRange(text);

          if (range) {
            for (const day of [range.start, range.end]) {
              expect(day === null || isValidDate(day)).to.be.true;
            }
          }
        }
      )
    );
  });
});
