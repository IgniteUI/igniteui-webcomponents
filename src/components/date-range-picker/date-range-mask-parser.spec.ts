import { expect } from '@open-wc/testing';

import { DatePart, DatePartType } from '../date-time-input/date-part.js';
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

    it('keeps the letters and mask flags of a separator literal', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        separator: ' to ',
      });

      // The separator stays literal, so the `t` is not an AM/PM position.
      expect(parser.emptyMask).to.equal('__/__/____ to __/__/____');
      expect(parser.apply('1225202512312025')).to.equal(
        '12/25/2025 to 12/31/2025'
      );

      const range = parser.parseDateRange('12/25/2025 to 12/31/2025')!;
      expect(range.start!.getDate()).to.equal(25);
      expect(range.end!.getDate()).to.equal(31);

      const flags = new DateRangeMaskParser({ separator: ' a 0 ' });
      expect(flags.emptyMask).to.equal('__/__/____ a 0 __/__/____');

      flags.mask = 'dd.MM.yyyy';
      expect(flags.emptyMask).to.equal('__.__.____ a 0 __.__.____');
    });

    it('widens the year of the date format but not a y in the separator', () => {
      const parser = new DateRangeMaskParser({
        format: 'M/d/y',
        separator: ' y ',
      });

      expect(parser.mask).to.equal('M/d/yyyy y M/d/yyyy');
      expect(parser.emptyMask).to.equal('_/_/____ y _/_/____');

      const endMonth = parser.parts.find(
        (part) =>
          part.type === DatePartType.Month &&
          part.position === DateRangePosition.End
      );
      expect(endMonth!.start).to.equal(11);

      parser.mask = 'MM/dd/yyy';
      expect(parser.mask).to.equal('MM/dd/yyyy y MM/dd/yyyy');
    });

    it('creates parser with custom prompt character', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        promptCharacter: '-',
      });

      expect(parser.emptyMask).to.equal('--/--/---- - --/--/----');
      expect(parser.mask).to.equal('MM/dd/yyyy - MM/dd/yyyy');
    });

    it('parses a complete range strictly when the separator holds the prompt', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        promptCharacter: '-',
      });

      expect(parser.parseValue('12/25/2026 - 12/31/2026', true)).to.eql({
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      });
      expect(parser.parseValue('12/25/2026 - 12/31/20--', true)).to.be.null;
    });

    it('builds range parts with position information', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const parts = parser.parts;

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

      const formatted = parser.formatValue(range);
      expect(formatted).to.equal('12/25/2026 - 12/31/2026');
    });

    it('formats range with only start date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = { start: new Date(2026, 11, 25), end: null };

      const formatted = parser.formatValue(range);
      expect(formatted).to.equal('12/25/2026 - __/__/____');
    });

    it('formats range with only end date', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = { start: null, end: new Date(2026, 11, 31) };

      const formatted = parser.formatValue(range);
      expect(formatted).to.equal('__/__/____ - 12/31/2026');
    });

    it('formats null range', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const formatted = parser.formatValue(null);

      expect(formatted).to.equal('__/__/____ - __/__/____');
    });

    it('widens the year part of each end alone', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = {
        start: new Date(10_000, 0, 1),
        end: new Date(2026, 0, 1),
      };

      const formatted = parser.formatValue(range);
      expect(formatted).to.equal('01/01/10000 - 01/01/2026');
      expect(parser.mask).to.equal('MM/dd/yyyy - MM/dd/yyyy');

      const parsed = parser.parseValue(formatted, true)!;
      expect(parsed.start!.getFullYear()).to.equal(10_000);
      expect(parsed.end!.getFullYear()).to.equal(2026);

      const endYear = parser.parts.findLast(
        (part) => part.type === DatePartType.Year
      )!;
      expect([endYear.start, endYear.end]).to.eql([20, 24]);

      const spun = parser.spinText(
        formatted,
        { part: DatePart.Year, position: DateRangePosition.Start },
        { sign: -1, spinLoop: false, seed: new Date() }
      );
      expect(spun.masked).to.equal('01/01/9999 - 01/01/2026');
      expect(parser.parseValue(spun.masked, true)!.end!.getFullYear()).to.equal(
        2026
      );
    });
  });

  describe('Part Queries', () => {
    it('gets part for cursor position', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const startMonth = parser.getPartForCursor(0);
      expect(startMonth?.type).to.equal(DatePartType.Month);
      expect(startMonth?.position).to.equal(DateRangePosition.Start);

      const endMonth = parser.getPartForCursor(13);
      expect(endMonth?.type).to.equal(DatePartType.Month);
      expect(endMonth?.position).to.equal(DateRangePosition.End);

      // Inside the separator there is nothing to target.
      expect(parser.getPartForCursor(12)).to.be.undefined;
    });

    it('names the part at the caret by its end', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.partAt(8)).to.eql({
        part: DatePart.Year,
        position: DateRangePosition.Start,
      });
      expect(parser.partAt(21)).to.eql({
        part: DatePart.Year,
        position: DateRangePosition.End,
      });
      expect(parser.partAt(11)).to.be.undefined;
    });

    it('targets the day, else the hours, of the start date by default', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      expect(parser.defaultPart()).to.eql({
        part: DatePart.Date,
        position: DateRangePosition.Start,
      });

      parser.mask = 'HH:mm';

      expect(parser.defaultPart()).to.eql({
        part: DatePart.Hours,
        position: DateRangePosition.Start,
      });
    });
  });

  describe('Spinning', () => {
    const request = (sign: 1 | -1, spinLoop = true) => ({
      sign,
      spinLoop,
      seed: new Date(2030, 5, 10),
    });

    it('spins start date month', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = {
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      };

      const newRange = parser.spin(
        range,
        { part: DatePart.Month, position: DateRangePosition.Start },
        request(1)
      );

      expect(newRange.start!.getMonth()).to.equal(0);
      expect(newRange.end).to.equal(range.end);
    });

    it('spins end date day', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const range = {
        start: new Date(2026, 11, 25),
        end: new Date(2026, 11, 31),
      };

      const newRange = parser.spin(
        range,
        { part: DatePart.Date, position: DateRangePosition.End },
        request(-1, false)
      );

      expect(newRange.end!.getDate()).to.equal(30);
      expect(newRange.start).to.equal(range.start);
    });

    it('takes the seed at both ends when spinning a null value', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });

      const newRange = parser.spin(
        null,
        { part: DatePart.Month, position: DateRangePosition.Start },
        request(1)
      );

      expect(newRange).to.deep.equal({
        start: new Date(2030, 5, 10),
        end: new Date(2030, 5, 10),
      });
    });
  });

  describe('Prompt Updates', () => {
    it('formats both dates with a changed prompt', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      parser.prompt = '*';

      expect(parser.emptyMask).to.equal('**/**/**** - **/**/****');
      expect(parser.formatValue(null)).to.equal(parser.emptyMask);
      expect(
        parser.formatValue({ start: new Date(2026, 11, 25), end: null })
      ).to.equal('12/25/2026 - **/**/****');
    });

    it('parses both dates against a changed prompt', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      parser.prompt = '*';

      // An untouched range is empty, not a pair of default dates.
      expect(parser.parseDateRange(parser.formatValue(null))).to.be.null;

      const range = parser.parseDateRange('12/25/2026 - **/**/****');
      expect(range!.start!.getDate()).to.equal(25);
      expect(range!.end!.getFullYear()).to.equal(2000);
    });

    it('ignores a prompt that collides with a mask flag', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      parser.prompt = '0';

      // The base setter rejects it, so the sub-parsers must not drift off on their own.
      expect(parser.prompt).to.equal('_');
      expect(parser.formatValue(null)).to.equal(parser.emptyMask);
    });

    it('applies the same prompt rules from the constructor', () => {
      const parser = new DateRangeMaskParser({
        format: 'MM/dd/yyyy',
        promptCharacter: '0',
      });

      expect(parser.prompt).to.equal('_');
      expect(parser.formatValue(null)).to.equal(parser.emptyMask);
    });
  });

  describe('Mask Updates', () => {
    it('updates mask and rebuilds parts', () => {
      const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
      const initialParts = parser.parts.length;

      parser.mask = 'M/d/yy';

      expect(parser.mask).to.equal('M/d/yy - M/d/yy');
      expect(parser.parts.length).to.equal(initialParts);
      expect(parser.emptyMask).to.equal('_/_/__ - _/_/__');
    });
  });
});
