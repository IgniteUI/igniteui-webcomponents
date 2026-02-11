import { expect } from '@open-wc/testing';
import { DateParts, DateTimeMaskParser } from './datetime-mask-parser.js';

describe('DateTimeMaskParser', () => {
  describe('Format Parsing', () => {
    it('parses MM/dd/yyyy format correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.dateParts).to.have.lengthOf(5); // MM, /, dd, /, yyyy

      const parts = parser.dateParts.filter(
        (p) => p.type !== DateParts.Literal
      );
      expect(parts).to.have.lengthOf(3);
      expect(parts[0].type).to.equal(DateParts.Month);
      expect(parts[1].type).to.equal(DateParts.Date);
      expect(parts[2].type).to.equal(DateParts.Year);
    });

    it('parses HH:mm:ss format correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'HH:mm:ss' });

      const parts = parser.dateParts.filter(
        (p) => p.type !== DateParts.Literal
      );
      expect(parts).to.have.lengthOf(3);
      expect(parts[0].type).to.equal(DateParts.Hours);
      expect(parts[1].type).to.equal(DateParts.Minutes);
      expect(parts[2].type).to.equal(DateParts.Seconds);
    });

    it('parses format with AM/PM correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'hh:mm tt' });

      const parts = parser.dateParts.filter(
        (p) => p.type !== DateParts.Literal
      );
      expect(parts).to.have.lengthOf(3);
      expect(parts[0].type).to.equal(DateParts.Hours);
      expect(parts[1].type).to.equal(DateParts.Minutes);
      expect(parts[2].type).to.equal(DateParts.AmPm);
    });

    it('identifies date part positions correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });

      const monthPart = parser.dateParts.find(
        (p) => p.type === DateParts.Month
      );
      expect(monthPart!.start).to.equal(0);
      expect(monthPart!.end).to.equal(2);
      expect(monthPart!.format).to.equal('MM');

      const datePart = parser.dateParts.find((p) => p.type === DateParts.Date);
      expect(datePart!.start).to.equal(3);
      expect(datePart!.end).to.equal(5);

      const yearPart = parser.dateParts.find((p) => p.type === DateParts.Year);
      expect(yearPart!.start).to.equal(6);
      expect(yearPart!.end).to.equal(10);
    });
  });

  describe('Mask Application', () => {
    it('generates empty mask correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.emptyMask).to.equal('__/__/____');
    });

    it('applies input to mask', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.apply('12252023')).to.equal('12/25/2023');
    });

    it('handles partial input', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.apply('12')).to.equal('12/__/____');
    });

    it('applies time format', () => {
      const parser = new DateTimeMaskParser({ format: 'HH:mm:ss' });
      expect(parser.apply('143025')).to.equal('14:30:25');
    });
  });

  describe('Date Formatting', () => {
    it('formats date to masked string', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      const date = new Date(2023, 11, 25); // Dec 25, 2023

      expect(parser.formatDate(date)).to.equal('12/25/2023');
    });

    it('formats date with leading zeros', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      const date = new Date(2023, 0, 5); // Jan 5, 2023

      expect(parser.formatDate(date)).to.equal('01/05/2023');
    });

    it('formats time correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'HH:mm:ss' });
      const date = new Date(2023, 0, 1, 14, 30, 45);

      expect(parser.formatDate(date)).to.equal('14:30:45');
    });

    it('formats 12-hour time with AM/PM', () => {
      const parser = new DateTimeMaskParser({ format: 'hh:mm tt' });
      const pmDate = new Date(2023, 0, 1, 14, 30, 0);
      const amDate = new Date(2023, 0, 1, 9, 30, 0);

      expect(parser.formatDate(pmDate)).to.equal('02:30 PM');
      expect(parser.formatDate(amDate)).to.equal('09:30 AM');
    });

    it('returns empty mask for null date', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.formatDate(null)).to.equal('__/__/____');
    });
  });

  describe('Date Parsing', () => {
    it('parses masked string to date', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      const date = parser.parseDate('12/25/2023');

      expect(date).to.not.be.null;
      expect(date!.getFullYear()).to.equal(2023);
      expect(date!.getMonth()).to.equal(11); // December (0-indexed)
      expect(date!.getDate()).to.equal(25);
    });

    it('parses time correctly', () => {
      const parser = new DateTimeMaskParser({ format: 'HH:mm:ss' });
      const date = parser.parseDate('14:30:45');

      expect(date).to.not.be.null;
      expect(date!.getHours()).to.equal(14);
      expect(date!.getMinutes()).to.equal(30);
      expect(date!.getSeconds()).to.equal(45);
    });

    it('handles AM/PM parsing', () => {
      const parser = new DateTimeMaskParser({ format: 'hh:mm tt' });

      const pmDate = parser.parseDate('02:30 PM');
      expect(pmDate!.getHours()).to.equal(14);

      const amDate = parser.parseDate('09:30 AM');
      expect(amDate!.getHours()).to.equal(9);
    });

    it('returns null for invalid month', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.parseDate('13/25/2023')).to.be.null;
    });

    it('returns null for invalid date', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.parseDate('02/30/2023')).to.be.null; // Feb 30 doesn't exist
    });

    it('handles two-digit year with century threshold', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yy' });

      const date1 = parser.parseDate('12/25/23');
      expect(date1!.getFullYear()).to.equal(2023);

      const date2 = parser.parseDate('12/25/99');
      expect(date2!.getFullYear()).to.equal(1999);
    });
  });

  describe('Part Queries', () => {
    it('gets date part at cursor position', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.getDatePartAtPosition(0)?.type).to.equal(DateParts.Month);
      expect(parser.getDatePartAtPosition(1)?.type).to.equal(DateParts.Month);
      expect(parser.getDatePartAtPosition(2)).to.be.undefined; // Literal /
      expect(parser.getDatePartAtPosition(3)?.type).to.equal(DateParts.Date);
      expect(parser.getDatePartAtPosition(6)?.type).to.equal(DateParts.Year);
    });

    it('identifies date vs time parts', () => {
      const dateParser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(dateParser.hasDateParts()).to.be.true;
      expect(dateParser.hasTimeParts()).to.be.false;

      const timeParser = new DateTimeMaskParser({ format: 'HH:mm:ss' });
      expect(timeParser.hasDateParts()).to.be.false;
      expect(timeParser.hasTimeParts()).to.be.true;

      const bothParser = new DateTimeMaskParser({ format: 'MM/dd/yyyy HH:mm' });
      expect(bothParser.hasDateParts()).to.be.true;
      expect(bothParser.hasTimeParts()).to.be.true;
    });

    it('gets first date part', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      const first = parser.getFirstDatePart();

      expect(first).to.not.be.undefined;
      expect(first!.type).to.equal(DateParts.Month);
    });

    it('gets part by type', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.getPartByType(DateParts.Year)?.format).to.equal('yyyy');
      expect(parser.getPartByType(DateParts.AmPm)).to.be.undefined;
    });
  });

  describe('Mask Change', () => {
    it('re-parses date parts when mask changes', () => {
      const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
      expect(parser.hasTimeParts()).to.be.false;

      parser.mask = 'HH:mm:ss';
      expect(parser.hasTimeParts()).to.be.true;
      expect(parser.hasDateParts()).to.be.false;
    });
  });
});
