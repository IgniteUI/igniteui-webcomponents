import { expect } from '@open-wc/testing';
import { create } from './datetime-utils.js';

describe('Date utilities', () => {
  describe('create date', () => {
    it('now', () => {
      expect(create.now()).to.eql(new Date());
    });

    it('creates new date from params', () => {
      expect(create.fromParams({ year: 2023, month: 3, day: 17 })).to.eql(
        new Date(2023, 2, 17)
      );
    });
  });
});
