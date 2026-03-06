import { expect } from '@open-wc/testing';

import { CalendarDay } from '../calendar/model.js';
import { DatePartType } from '../date-time-input/date-part.js';
import {
  DateRangeMaskParser,
  DateRangePosition,
} from './date-range-mask-parser.js';

describe('DateRangeMaskParser', () => {
  describe('Initialization', () => {
    it('creates parser with default format and separator', () => {
      const parser = new DateRangeMaskParser();

      expect(parser.mask).to.equal('MM/dd/yyyy - MM/dd/yyyy');
      expect(parser.separator).to.equal(' - ');
      expect(parser.emptyMask).to.equal('__/__/____ - __/__/____');
    });

    it('creates parser with custom format', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.mask).to.equal('MM/dd/yyyy - MM/dd/yyyy');
      expect(parser.emptyMask).to.equal('__/__/____ - __/__/____');
    });

    it('creates parser with custom separator', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        separator: ' to ',
      });

      expect(parser.separator).to.equal(' to ');
      expect(parser.mask).to.equal('MM/dd/yyyy to MM/dd/yyyy');
    });

    it('creates parser with custom prompt character', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        promptCharacter: '-',
      });

      expect(parser.emptyMask).to.equal('--/--/---- - --/--/----');
      expect(parser.mask).to.equal('MM/dd/yyyy - MM/dd/yyyy');
    });

    it('builds range parts with position information', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const parts = parser.rangeParts;

      const startParts = parts.filter(
        (p) => p.position === DateRangePosition.Start
      );
      const endParts = parts.filter(
        (p) => p.position === DateRangePosition.End
      );

      expect(startParts.length).to.be.greaterThan(0);
      expect(endParts.length).to.be.greaterThan(0);
      expect(endParts[0].start).to.be.greaterThan(startParts[0].end);
    });
  });

  describe('Date Range Parsing', () => {
    it('parses complete date range', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = parser.parseDateRange('12/25/2026 - 12/31/2026');

      expect(range).to.not.be.null;
      expect(range!.start).to.not.be.null;
      expect(range!.end).to.not.be.null;
      expect(range!.start!.getMonth()).to.equal(11);
      expect(range!.start!.getDate()).to.equal(25);
      expect(range!.end!.getDate()).to.equal(31);
    });

    it('parses range with only start date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = parser.parseDateRange('12/25/2026 - __/__/____');

      expect(range).to.not.be.null;
      expect(range!.start).to.not.be.null;
      expect(range!.end!.getMonth()).to.equal(0);
      expect(range!.end!.getDate()).to.equal(1);
      expect(range!.end!.getFullYear()).to.equal(2000);
    });

    it('parses range with only end date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = parser.parseDateRange('__/__/____ - 12/31/2026');

      expect(range).to.not.be.null;
      expect(range!.start!.getMonth()).to.equal(0);
      expect(range!.start!.getDate()).to.equal(1);
      expect(range!.start!.getFullYear()).to.equal(2000);
      expect(range!.end).to.not.be.null;
    });

    it('returns null for empty mask', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = parser.parseDateRange(parser.emptyMask);

      expect(range).to.be.null;
    });

    it('returns null for empty string', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.parseDateRange('')).to.be.null;
    });
  });

  describe('Date Range Formatting', () => {
    it('formats complete date range', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = {
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      };

      const formatted = parser.formatDateRange(range);
      expect(formatted).to.equal('12/25/2026 - 12/31/2026');
    });

    it('formats range with only start date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = { start: new Date(2026, 11, 25), end: null };

      const formatted = parser.formatDateRange(range);
      expect(formatted).to.equal('12/25/2026 - __/__/____');
    });

    it('formats range with only end date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = { start: null, end: new Date(2026, 11, 31) };

      const formatted = parser.formatDateRange(range);
      expect(formatted).to.equal('__/__/____ - 12/31/2026');
    });

    it('formats null range', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const formatted = parser.formatDateRange(null);

      expect(formatted).to.equal('__/__/____ - __/__/____');
    });
  });

  describe('Part Queries', () => {
    it('gets date range part at position', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const startMonthPart = parser.getDateRangePartAtPosition(0);
      expect(startMonthPart?.type).to.equal(DatePartType.Month);
      expect(startMonthPart?.position).to.equal(DateRangePosition.Start);

      const endMonthPart = parser.getDateRangePartAtPosition(13);
      expect(endMonthPart?.type).to.equal(DatePartType.Month);
      expect(endMonthPart?.position).to.equal(DateRangePosition.End);
    });

    it('gets part for cursor position', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const part = parser.getDateRangePartForCursor(2);
      expect(part?.type).to.equal(DatePartType.Month);
    });

    it('gets part by type and position', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const startYear = parser.getPartByTypeAndPosition(
        DatePartType.Year,
        DateRangePosition.Start
      );
      expect(startYear).to.not.be.undefined;
      expect(startYear!.position).to.equal(DateRangePosition.Start);

      const endYear = parser.getPartByTypeAndPosition(
        DatePartType.Year,
        DateRangePosition.End
      );
      expect(endYear).to.not.be.undefined;
      expect(endYear!.position).to.equal(DateRangePosition.End);
    });

    it('gets first date part for position', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const startFirst = parser.getFirstDatePartForPosition(
        DateRangePosition.Start
      );
      expect(startFirst?.type).to.equal(DatePartType.Month);

      const endFirst = parser.getFirstDatePartForPosition(
        DateRangePosition.End
      );
      expect(endFirst?.position).to.equal(DateRangePosition.End);
    });
  });

  describe('Spinning', () => {
    it('spins start date month', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const monthPart = parser.getPartByTypeAndPosition(
        DatePartType.Month,
        DateRangePosition.Start
      )!;
      const range = {
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      };

      const newRange = parser.spinDateRangePart(monthPart, 1, range, true);

      expect(newRange.start!.getMonth()).to.equal(0);
      expect(newRange.end).to.equal(range.end);
    });

    it('spins end date day', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const dayPart = parser.getPartByTypeAndPosition(
        DatePartType.Date,
        DateRangePosition.End
      )!;
      const range = {
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      };

      const newRange = parser.spinDateRangePart(dayPart, -1, range, false);

      expect(newRange.end!.getDate()).to.equal(30);
      expect(newRange.start).to.equal(range.start);
    });

    it('creates date when spinning null value', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const monthPart = parser.getPartByTypeAndPosition(
        DatePartType.Month,
        DateRangePosition.Start
      )!;

      const newRange = parser.spinDateRangePart(monthPart, 1, null, true);

      const today = CalendarDay.today.native;
      expect(newRange.start).to.not.be.null;
      expect(newRange.start!.getFullYear()).to.equal(today.getFullYear());
      expect(newRange.start!.getMonth()).to.equal(
        CalendarDay.today.add('month', 1).native.getMonth()
      );
      expect(newRange.start!.getDate()).to.equal(today.getDate());
      expect(newRange.end).to.be.null;
    });
  });

  describe('Mask Updates', () => {
    it('updates mask and rebuilds parts', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const initialParts = parser.rangeParts.length;

      parser.mask = 'M/d/yy';

      expect(parser.mask).to.equal('M/d/yy - M/d/yy');
      expect(parser.rangeParts.length).to.equal(initialParts);
      expect(parser.emptyMask).to.equal('_/_/__ - _/_/__');
    });
  });
});
