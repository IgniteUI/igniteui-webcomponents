import { expect } from '@open-wc/testing';

import { fc, orderedPair } from '#internals/testing/fast-check-setup.spec.js';

import {
  asNumber,
  clamp,
  modulo,
  numberOfDecimals,
  roundPrecise,
  wrap,
} from './math.js';

const number = fc.double({ noNaN: true });
const finite = fc.double({ noNaN: true, noDefaultInfinity: true });
const bounds = orderedPair(finite);

describe('Math utilities properties', () => {
  it('clamp returns a value in range, and is idempotent', () => {
    fc.assert(
      fc.property(number, bounds, (value, [min, max]) => {
        const result = clamp(value, min, max);

        expect(result).to.be.within(min, max);
        expect(clamp(result, min, max)).to.equal(result);
        if (value >= min && value <= max) {
          expect(result).to.equal(value);
        }
      })
    );
  });

  it('wrap returns a value in range', () => {
    fc.assert(
      fc.property(number, bounds, (value, [min, max]) => {
        expect(wrap(min, max, value)).to.be.within(min, max);
      })
    );
  });

  it('modulo has the sign of the divisor and a smaller magnitude', () => {
    const divisor = fc
      .double({ min: -1e6, max: 1e6, noNaN: true })
      .filter((d) => Math.abs(d) > 1e-6);
    const dividend = fc.double({ min: -1e9, max: 1e9, noNaN: true });

    fc.assert(
      fc.property(dividend, divisor, (n, d) => {
        const result = modulo(n, d);

        if (d > 0) {
          expect(result).to.be.at.least(0).and.below(d);
        } else {
          expect(result).to.be.at.most(0).and.above(d);
        }
      })
    );
  });

  it('roundPrecise is idempotent and keeps at most the given decimals', () => {
    const value = fc.double({ min: -1e6, max: 1e6, noNaN: true });

    fc.assert(
      fc.property(value, fc.integer({ min: 0, max: 6 }), (x, magnitude) => {
        const rounded = roundPrecise(x, magnitude);

        expect(roundPrecise(rounded, magnitude)).to.equal(rounded);
        expect(numberOfDecimals(rounded)).to.be.at.most(magnitude);
        expect(Math.abs(rounded - x)).to.be.at.most(
          0.5 * 10 ** -magnitude + 1e-9
        );
      })
    );
  });

  it('asNumber always returns a finite number, and reads back a number string', () => {
    fc.assert(
      fc.property(fc.anything(), finite, (value, x) => {
        expect(Number.isFinite(asNumber(value))).to.be.true;
        expect(asNumber(String(x))).to.equal(x === 0 ? 0 : x);
      })
    );
  });
});
