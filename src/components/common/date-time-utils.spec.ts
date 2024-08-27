import { expect } from '@open-wc/testing';
import { formatDate, parseToDateParts } from './date-time-utils.js';

describe('Date-time utils', () => {
  describe('parse to date parts', () => {
    it('basic', () => {
      const parts = parseToDateParts('yyyy/MM/dd');
      expect(parts).lengthOf(5);
    });
  });

  describe('Display format', () => {
    const date = new Date(2024, 6, 17, 7, 7, 7, 700);

    it('pre-defined date-time', () => {
      console.debug(formatDate(date, { format: 'short' }));
      console.debug(formatDate(date, { format: 'medium' }));
      console.debug(formatDate(date, { format: 'long' }));
      console.debug(formatDate(date, { format: 'full' }));
    });

    it('pre-defined date only', () => {
      console.debug(formatDate(date, { format: 'shortDate' }));
      console.debug(formatDate(date, { format: 'mediumDate' }));
      console.debug(formatDate(date, { format: 'longDate' }));
      console.debug(formatDate(date, { format: 'fullDate' }));
    });

    it('pre-defined time only', () => {
      console.debug(formatDate(date, { format: 'shortTime' }));
      console.debug(formatDate(date, { format: 'mediumTime' }));
      console.debug(formatDate(date, { format: 'longTime' }));
      console.debug(formatDate(date, { format: 'fullTime' }));
    });

    it('manual', () => {
      console.debug(
        formatDate(date, { format: 'yyyy/MMMM/dd hh:mm:ss.SSS [aa]' })
      );
    });
  });
});
