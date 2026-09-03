import { expect } from '@open-wc/testing';

import { firstOf } from '../utils/arrays.js';
import {
  convertToDate,
  convertToDateRange,
  convertToDates,
} from './converters.js';
import { CalendarDay } from './model.js';

describe('Date converters', () => {
  it('converts date instances and nullish values', () => {
    const date = new Date(2024, 0, 11);

    expect(convertToDate(date)).to.eql(date);
    expect(convertToDate(new Date(Number.NaN))).to.be.null;
    expect(convertToDate(null)).to.be.null;
    expect(convertToDate(undefined)).to.be.null;
    expect(convertToDate('')).to.be.null;
  });

  it('converts ISO date strings', () => {
    expect(convertToDate('2024-01-11')).to.eql(new Date(2024, 0, 11));
    expect(convertToDate('  2024-01-11  ')).to.eql(new Date(2024, 0, 11));
    expect(convertToDate('not-a-date')).to.be.null;
    expect(convertToDate('2024-99-99')).to.be.null;
  });

  it('resolves time only strings against the current local date', () => {
    const today = CalendarDay.today;
    const parsed = convertToDate('13:45:30')!;

    expect(parsed).to.not.be.null;
    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()]).to.eql([
      today.year,
      today.month,
      today.date,
    ]);
    expect([
      parsed.getHours(),
      parsed.getMinutes(),
      parsed.getSeconds(),
    ]).to.eql([13, 45, 30]);
  });

  it('converts collections of dates', () => {
    const dates = convertToDates('2024-01-11, 2024-01-12, invalid')!;

    expect(dates).lengthOf(2);
    expect(firstOf(dates)).to.eql(new Date(2024, 0, 11));
    expect(convertToDates(null)).to.be.null;
    expect(convertToDates([])).to.eql([]);
  });

  it('converts date range objects', () => {
    const range = convertToDateRange(
      '{"start":"2024-01-11","end":"2024-01-18"}'
    )!;

    expect(range.start).to.eql(new Date(2024, 0, 11));
    expect(range.end).to.eql(new Date(2024, 0, 18));

    const partial = convertToDateRange('{"start":"2024-01-11"}')!;

    expect(partial.start).to.eql(new Date(2024, 0, 11));
    expect(partial.end).to.be.null;
  });

  it('returns null instead of throwing on malformed date ranges', () => {
    expect(convertToDateRange('not json')).to.be.null;
    expect(convertToDateRange('{"start":')).to.be.null;
    expect(convertToDateRange('[]')).to.be.null;
    expect(convertToDateRange('"2024-01-11"')).to.be.null;
    expect(convertToDateRange('42')).to.be.null;
    expect(convertToDateRange(null)).to.be.null;
  });
});
