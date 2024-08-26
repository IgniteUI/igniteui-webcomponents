import { expect } from '@open-wc/testing';
import { formatDate, parseToDateParts } from './datetime-utils.js';

describe('Date-time utils', () => {
  describe('parse to date parts', () => {
    it('basic', () => {
      const parts = parseToDateParts('yyyy/MM/dd');
      expect(1).to.equal(1);
    });
  });

  describe('Display format', () => {
    const date = new Date(2024, 6, 17, 7, 7, 7, 700);

    it('create', () => {
      // console.log(formatDate(date, { format: 'yy/MM/dd hh:mm:ss.SSS aa' }));
    });
  });
});
