import { expect } from '@open-wc/testing';
import {
  asNumber,
  asPercent,
  clamp,
  modulo,
  numberInRangeInclusive,
  numberOfDecimals,
  roundPrecise,
  wrap,
} from './math.js';

describe('Math utilities', () => {
  describe('asPercent', () => {
    it('should return the part as a percentage of the whole', () => {
      expect(asPercent(25, 50)).to.equal(50);
      expect(asPercent(0, 50)).to.equal(0);
      expect(asPercent(50, 25)).to.equal(200);
    });
  });

  describe('clamp', () => {
    it('should clamp values outside of the bounds', () => {
      expect(clamp(-1, 0, 10)).to.equal(0);
      expect(clamp(11, 0, 10)).to.equal(10);
    });

    it('should return values inside the bounds unchanged', () => {
      expect(clamp(5, 0, 10)).to.equal(5);
      expect(clamp(0, 0, 10)).to.equal(0);
      expect(clamp(10, 0, 10)).to.equal(10);
    });
  });

  describe('numberOfDecimals', () => {
    it('should return 0 for integers', () => {
      expect(numberOfDecimals(0)).to.equal(0);
      expect(numberOfDecimals(42)).to.equal(0);
      expect(numberOfDecimals(-42)).to.equal(0);
      expect(numberOfDecimals(1e21)).to.equal(0);
    });

    it('should return the number of decimal places for fixed notation', () => {
      expect(numberOfDecimals(3.14)).to.equal(2);
      expect(numberOfDecimals(-0.5)).to.equal(1);
      expect(numberOfDecimals(0.001)).to.equal(3);
    });

    it('should handle exponential notation', () => {
      expect(numberOfDecimals(1e-7)).to.equal(7);
      expect(numberOfDecimals(1.5e-7)).to.equal(8);
      expect(numberOfDecimals(-2.25e-10)).to.equal(12);
    });

    it('should return 0 for non-finite values', () => {
      expect(numberOfDecimals(Number.NaN)).to.equal(0);
      expect(numberOfDecimals(Number.POSITIVE_INFINITY)).to.equal(0);
    });
  });

  describe('roundPrecise', () => {
    it('should round to the given number of decimal places', () => {
      expect(roundPrecise(1.23456, 2)).to.equal(1.23);
      expect(roundPrecise(1.23456, 4)).to.equal(1.2346);
      expect(roundPrecise(1.23456)).to.equal(1.2);
    });
  });

  describe('numberInRangeInclusive', () => {
    it('should be inclusive of the bounds', () => {
      expect(numberInRangeInclusive(0, 0, 10)).to.be.true;
      expect(numberInRangeInclusive(10, 0, 10)).to.be.true;
      expect(numberInRangeInclusive(5, 0, 10)).to.be.true;
      expect(numberInRangeInclusive(-0.001, 0, 10)).to.be.false;
      expect(numberInRangeInclusive(10.001, 0, 10)).to.be.false;
    });
  });

  describe('asNumber', () => {
    it('should parse valid numeric input', () => {
      expect(asNumber('5')).to.equal(5);
      expect(asNumber('3.14')).to.equal(3.14);
      expect(asNumber(2.71)).to.equal(2.71);
    });

    it('should return the fallback for non-parseable input', () => {
      expect(asNumber('five')).to.equal(0);
      expect(asNumber('five', 5)).to.equal(5);
      expect(asNumber(undefined, 10)).to.equal(10);
      expect(asNumber(null, 10)).to.equal(10);
      expect(asNumber(Number.NaN, 10)).to.equal(10);
      expect(asNumber(Number.POSITIVE_INFINITY, 10)).to.equal(10);
      expect(asNumber(Number.NEGATIVE_INFINITY, 10)).to.equal(10);
    });
  });

  describe('wrap', () => {
    it('should return in-bounds values unchanged', () => {
      expect(wrap(1, 4, 2)).to.equal(2);
      expect(wrap(1, 4, 1)).to.equal(1);
      expect(wrap(1, 4, 4)).to.equal(4);
    });

    it('should wrap out-of-bounds values to the opposite bound', () => {
      expect(wrap(1, 4, 5)).to.equal(1);
      expect(wrap(1, 4, -1)).to.equal(4);
    });
  });

  describe('modulo', () => {
    it('should behave like `%` for positive operands', () => {
      expect(modulo(5, 3)).to.equal(2);
      expect(modulo(6, 3)).to.equal(0);
    });

    it('should return a result with the sign of the divisor', () => {
      expect(modulo(-1, 3)).to.equal(2);
      expect(modulo(-4, 3)).to.equal(2);
      expect(modulo(1, -3)).to.equal(-2);
    });
  });
});
