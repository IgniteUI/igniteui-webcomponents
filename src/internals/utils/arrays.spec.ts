import { expect } from '@open-wc/testing';
import {
  asArray,
  chunk,
  firstOf,
  isEmpty,
  lastOf,
  partition,
} from './arrays.js';

describe('Array utilities', () => {
  describe('firstOf / lastOf', () => {
    it('should return the first and last elements', () => {
      expect(firstOf([1, 2, 3])).to.equal(1);
      expect(lastOf([1, 2, 3])).to.equal(3);
      expect(firstOf([1])).to.equal(1);
      expect(lastOf([1])).to.equal(1);
    });

    it('should return `undefined` for an empty array', () => {
      expect(firstOf([])).to.be.undefined;
      expect(lastOf([])).to.be.undefined;
    });
  });

  describe('chunk', () => {
    it('should split an array into chunks of the given size', () => {
      expect([...chunk([1, 2, 3, 4, 5], 2)]).to.eql([[1, 2], [3, 4], [5]]);
      expect([...chunk([1, 2, 3, 4], 2)]).to.eql([
        [1, 2],
        [3, 4],
      ]);
      expect([...chunk([1, 2], 5)]).to.eql([[1, 2]]);
    });

    it('should yield nothing for an empty array', () => {
      expect([...chunk([], 3)]).to.eql([]);
    });

    it('should throw for an invalid chunk size', () => {
      expect(() => [...chunk([1, 2, 3], 0)]).to.throw();
      expect(() => [...chunk([1, 2, 3], -1)]).to.throw();
      expect(() => [...chunk([1, 2, 3], 1.5)]).to.throw();
    });
  });

  describe('isEmpty', () => {
    it('should work with array-likes, Sets and Maps', () => {
      expect(isEmpty([])).to.be.true;
      expect(isEmpty([1])).to.be.false;
      expect(isEmpty(new Set())).to.be.true;
      expect(isEmpty(new Set([1]))).to.be.false;
      expect(isEmpty(new Map())).to.be.true;
      expect(isEmpty(new Map([[{}, 1]]))).to.be.false;
    });
  });

  describe('asArray', () => {
    it('should wrap single values and pass arrays through', () => {
      expect(asArray(5)).to.eql([5]);
      expect(asArray([1, 2, 3])).to.eql([1, 2, 3]);
      expect(asArray(undefined)).to.eql([]);
      expect(asArray(null)).to.eql([]);
    });
  });

  describe('partition', () => {
    it('should split an array based on the predicate', () => {
      const [evens, odds] = partition([1, 2, 3, 4], (x) => x % 2 === 0);
      expect(evens).to.eql([2, 4]);
      expect(odds).to.eql([1, 3]);
    });

    it('should handle empty and single-sided inputs', () => {
      expect(partition([], () => true)).to.eql([[], []]);
      expect(partition([1, 3], (x) => x % 2 === 0)).to.eql([[], [1, 3]]);
    });
  });
});
