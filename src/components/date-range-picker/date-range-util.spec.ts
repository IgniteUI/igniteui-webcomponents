import { expect } from '@open-wc/testing';
import { selectDateRange } from './date-range-util.js';

describe('DateRangeUtil', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  //const date1 = new Date('2024-03-01T00:00:00');
  //const date2 = new Date('2024-03-10T00:00:00');

  it('should return the last 7 days', () => {
    const result: Date[] = selectDateRange('last7Days');
    expect(result[0]).to.deep.equal(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    );
    expect(result[1]).to.deep.equal(today);
  });

  it('should return the last 30 days', () => {
    const result: Date[] = selectDateRange('last30Days');
    expect(result[0]).to.deep.equal(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
    );
    expect(result[1]).to.deep.equal(today);
  });

  it('should return the current month', () => {
    const result: Date[] = selectDateRange('currentMonth');
    expect(result[0]).to.deep.equal(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    expect(result[1]).to.deep.equal(
      new Date(today.getFullYear(), today.getMonth() + 1, 0)
    );
  });

  it('should return the year-to-date', () => {
    const result: Date[] = selectDateRange('yearToDate');
    expect(result[0]).to.deep.equal(new Date(today.getFullYear(), 0, 1));
    expect(result[1]).to.deep.equal(today);
  });

  it('should throw an error for an invalid date range type', () => {
    expect(() => selectDateRange('invalidType' as any)).to.throw(
      'Invalid date range type'
    );
  });

  // it('should convert ISO string input to date range object', () => {
  //   const result = convertToDateRangeObject('2024-03-01, 2024-03-10');
  //   expect(result?.start?.toISOString()).to.equal(date1.toISOString());
  //   expect(result?.end?.toISOString()).to.equal(date2.toISOString());
  // });

  // it('should handle string parts in an object', () => {
  //   const result = convertToDateRangeObject({
  //     start: '2024-03-01',
  //     end: '2024-03-10',
  //   });
  //   expect(result?.start?.toISOString()).to.equal(date1.toISOString());
  //   expect(result?.end?.toISOString()).to.equal(date2.toISOString());
  // });

  // it('should return dates as-is if already Date objects', () => {
  //   const result = convertToDateRangeObject({ start: date1, end: date2 });
  //   expect(result).to.deep.equal({ start: date1, end: date2 });
  // });

  // it('should return null for invalid input (null)', () => {
  //   expect(convertToDateRangeObject(null)).to.equal(null);
  // });

  // it('should return null for invalid input (undefined)', () => {
  //   expect(convertToDateRangeObject(undefined)).to.equal(null);
  // });

  // it('should fallback to null for missing start or end', () => {
  //   const result = convertToDateRangeObject({});
  //   expect(result).to.deep.equal({ start: null, end: null });
  // });

  // it('should fallback to null for invalid date strings', () => {
  //   const result = convertToDateRangeObject({
  //     start: 'invalid',
  //     end: 'also-invalid',
  //   });
  //   expect(result).to.deep.equal({ start: null, end: null });
  // });

  // it('should handle partial values (start only)', () => {
  //   const result = convertToDateRangeObject({ start: '2024-03-01' });
  //   expect(result?.start?.toISOString()).to.equal(date1.toISOString());
  //   expect(result?.end).to.equal(null);
  // });

  // it('should handle partial values (end only)', () => {
  //   const result = convertToDateRangeObject({ end: '2024-03-10' });
  //   expect(result?.start).to.equal(null);
  //   expect(result?.end?.toISOString()).to.equal(date2.toISOString());
  // });
});
