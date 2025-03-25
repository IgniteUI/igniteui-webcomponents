import { expect } from '@open-wc/testing';
import { selectDateRange } from './date-range-util.js';

describe('DateRangeUtil', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
});
