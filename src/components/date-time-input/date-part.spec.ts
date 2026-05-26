import { expect } from '@open-wc/testing';
import { createDatePart, DatePartType, type SpinOptions } from './date-part.js';

describe('DatePart Classes', () => {
  describe('Factory Function', () => {
    it('creates Year part', () => {
      const part = createDatePart(DatePartType.Year, {
        start: 6,
        end: 10,
        format: 'yyyy',
      });
      expect(part.type).to.equal(DatePartType.Year);
      expect(part.start).to.equal(6);
      expect(part.end).to.equal(10);
      expect(part.format).to.equal('yyyy');
    });

    it('creates Month part', () => {
      const part = createDatePart(DatePartType.Month, {
        start: 0,
        end: 2,
        format: 'MM',
      });
      expect(part.type).to.equal(DatePartType.Month);
    });

    it('creates Date part', () => {
      const part = createDatePart(DatePartType.Date, {
        start: 3,
        end: 5,
        format: 'dd',
      });
      expect(part.type).to.equal(DatePartType.Date);
    });

    it('creates Hours part', () => {
      const part = createDatePart(DatePartType.Hours, {
        start: 0,
        end: 2,
        format: 'HH',
      });
      expect(part.type).to.equal(DatePartType.Hours);
    });

    it('creates Minutes part', () => {
      const part = createDatePart(DatePartType.Minutes, {
        start: 3,
        end: 5,
        format: 'mm',
      });
      expect(part.type).to.equal(DatePartType.Minutes);
    });

    it('creates Seconds part', () => {
      const part = createDatePart(DatePartType.Seconds, {
        start: 6,
        end: 8,
        format: 'ss',
      });
      expect(part.type).to.equal(DatePartType.Seconds);
    });

    it('creates AmPm part', () => {
      const part = createDatePart(DatePartType.AmPm, {
        start: 9,
        end: 11,
        format: 'tt',
      });
      expect(part.type).to.equal(DatePartType.AmPm);
    });

    it('creates Literal part', () => {
      const part = createDatePart(DatePartType.Literal, {
        start: 2,
        end: 3,
        format: '/',
      });
      expect(part.type).to.equal(DatePartType.Literal);
    });
  });

  describe('getValue', () => {
    const date = new Date(2024, 5, 15, 14, 30, 45); // June 15, 2024 14:30:45

    it('Year returns full year with yyyy format', () => {
      const part = createDatePart(DatePartType.Year, {
        start: 0,
        end: 4,
        format: 'yyyy',
      });
      expect(part.getValue(date)).to.equal('2024');
    });

    it('Year returns two-digit year with yy format', () => {
      const part = createDatePart(DatePartType.Year, {
        start: 0,
        end: 2,
        format: 'yy',
      });
      expect(part.getValue(date)).to.equal('24');
    });

    it('Month returns padded month', () => {
      const part = createDatePart(DatePartType.Month, {
        start: 0,
        end: 2,
        format: 'MM',
      });
      expect(part.getValue(date)).to.equal('06');
    });

    it('Date returns padded date', () => {
      const part = createDatePart(DatePartType.Date, {
        start: 0,
        end: 2,
        format: 'dd',
      });
      expect(part.getValue(date)).to.equal('15');
    });

    it('Hours returns 24-hour format with HH', () => {
      const part = createDatePart(DatePartType.Hours, {
        start: 0,
        end: 2,
        format: 'HH',
      });
      expect(part.getValue(date)).to.equal('14');
    });

    it('Hours returns 12-hour format with hh', () => {
      const part = createDatePart(DatePartType.Hours, {
        start: 0,
        end: 2,
        format: 'hh',
      });
      expect(part.getValue(date)).to.equal('02');
    });

    it('Minutes returns padded minutes', () => {
      const part = createDatePart(DatePartType.Minutes, {
        start: 0,
        end: 2,
        format: 'mm',
      });
      expect(part.getValue(date)).to.equal('30');
    });

    it('Seconds returns padded seconds', () => {
      const part = createDatePart(DatePartType.Seconds, {
        start: 0,
        end: 2,
        format: 'ss',
      });
      expect(part.getValue(date)).to.equal('45');
    });

    it('AmPm returns PM for afternoon hours', () => {
      const part = createDatePart(DatePartType.AmPm, {
        start: 0,
        end: 2,
        format: 'tt',
      });
      expect(part.getValue(date)).to.equal('PM');
    });

    it('AmPm returns AM for morning hours', () => {
      const morningDate = new Date(2024, 5, 15, 9, 30, 45);
      const part = createDatePart(DatePartType.AmPm, {
        start: 0,
        end: 2,
        format: 'tt',
      });
      expect(part.getValue(morningDate)).to.equal('AM');
    });

    it('Literal returns the format string', () => {
      const part = createDatePart(DatePartType.Literal, {
        start: 0,
        end: 1,
        format: '/',
      });
      expect(part.getValue(date)).to.equal('/');
    });
  });

  describe('validate', () => {
    it('Year validates any non-negative number', () => {
      const part = createDatePart(DatePartType.Year, {
        start: 0,
        end: 4,
        format: 'yyyy',
      });
      expect(part.validate(2024)).to.be.true;
      expect(part.validate(0)).to.be.true;
      expect(part.validate(-1)).to.be.false;
    });

    it('Month validates 0-11 range', () => {
      const part = createDatePart(DatePartType.Month, {
        start: 0,
        end: 2,
        format: 'MM',
      });
      expect(part.validate(0)).to.be.true;
      expect(part.validate(11)).to.be.true;
      expect(part.validate(12)).to.be.false;
      expect(part.validate(-1)).to.be.false;
    });

    it('Date validates 1-31 without context', () => {
      const part = createDatePart(DatePartType.Date, {
        start: 0,
        end: 2,
        format: 'dd',
      });
      expect(part.validate(1)).to.be.true;
      expect(part.validate(31)).to.be.true;
      expect(part.validate(0)).to.be.false;
      expect(part.validate(32)).to.be.false;
    });

    it('Date validates against month/year context', () => {
      const part = createDatePart(DatePartType.Date, {
        start: 0,
        end: 2,
        format: 'dd',
      });
      // February 2024 (leap year) has 29 days
      expect(part.validate(29, { year: 2024, month: 1 })).to.be.true;
      expect(part.validate(30, { year: 2024, month: 1 })).to.be.false;
      // February 2023 (non-leap year) has 28 days
      expect(part.validate(28, { year: 2023, month: 1 })).to.be.true;
      expect(part.validate(29, { year: 2023, month: 1 })).to.be.false;
    });

    it('Hours validates 0-23 range', () => {
      const part = createDatePart(DatePartType.Hours, {
        start: 0,
        end: 2,
        format: 'HH',
      });
      expect(part.validate(0)).to.be.true;
      expect(part.validate(23)).to.be.true;
      expect(part.validate(24)).to.be.false;
      expect(part.validate(-1)).to.be.false;
    });

    it('Minutes validates 0-59 range', () => {
      const part = createDatePart(DatePartType.Minutes, {
        start: 0,
        end: 2,
        format: 'mm',
      });
      expect(part.validate(0)).to.be.true;
      expect(part.validate(59)).to.be.true;
      expect(part.validate(60)).to.be.false;
    });

    it('Seconds validates 0-59 range', () => {
      const part = createDatePart(DatePartType.Seconds, {
        start: 0,
        end: 2,
        format: 'ss',
      });
      expect(part.validate(0)).to.be.true;
      expect(part.validate(59)).to.be.true;
      expect(part.validate(60)).to.be.false;
    });

    it('AmPm always validates', () => {
      const part = createDatePart(DatePartType.AmPm, {
        start: 0,
        end: 2,
        format: 'tt',
      });
      expect(part.validate(0)).to.be.true;
      expect(part.validate(999)).to.be.true;
    });

    it('Literal always validates', () => {
      const part = createDatePart(DatePartType.Literal, {
        start: 0,
        end: 1,
        format: '/',
      });
      expect(part.validate(0)).to.be.true;
    });
  });

  describe('spin', () => {
    function createSpinOptions(
      date: Date,
      spinLoop = true,
      amPmValue?: string,
      originalDate?: Date
    ): SpinOptions {
      return { date, spinLoop, amPmValue, originalDate };
    }

    describe('Year', () => {
      it('spins year up', () => {
        const part = createDatePart(DatePartType.Year, {
          start: 0,
          end: 4,
          format: 'yyyy',
        });
        const date = new Date(2024, 5, 15);
        part.spin(1, createSpinOptions(date));
        expect(date.getFullYear()).to.equal(2025);
      });

      it('spins year down', () => {
        const part = createDatePart(DatePartType.Year, {
          start: 0,
          end: 4,
          format: 'yyyy',
        });
        const date = new Date(2024, 5, 15);
        part.spin(-1, createSpinOptions(date));
        expect(date.getFullYear()).to.equal(2023);
      });

      it('adjusts date for leap year transition', () => {
        const part = createDatePart(DatePartType.Year, {
          start: 0,
          end: 4,
          format: 'yyyy',
        });
        // Feb 29, 2024 (leap year) -> 2025 (non-leap year)
        const date = new Date(2024, 1, 29);
        part.spin(1, createSpinOptions(date));
        expect(date.getDate()).to.equal(28);
        expect(date.getFullYear()).to.equal(2025);
      });
    });

    describe('Month', () => {
      it('spins month up', () => {
        const part = createDatePart(DatePartType.Month, {
          start: 0,
          end: 2,
          format: 'MM',
        });
        const date = new Date(2024, 5, 15);
        part.spin(1, createSpinOptions(date));
        expect(date.getMonth()).to.equal(6);
      });

      it('spins month down', () => {
        const part = createDatePart(DatePartType.Month, {
          start: 0,
          end: 2,
          format: 'MM',
        });
        const date = new Date(2024, 5, 15);
        part.spin(-1, createSpinOptions(date));
        expect(date.getMonth()).to.equal(4);
      });

      it('loops from December to January with spinLoop', () => {
        const part = createDatePart(DatePartType.Month, {
          start: 0,
          end: 2,
          format: 'MM',
        });
        const date = new Date(2024, 11, 15); // December
        part.spin(1, createSpinOptions(date, true));
        expect(date.getMonth()).to.equal(0); // January
      });

      it('stops at December without spinLoop', () => {
        const part = createDatePart(DatePartType.Month, {
          start: 0,
          end: 2,
          format: 'MM',
        });
        const date = new Date(2024, 11, 15); // December
        part.spin(1, createSpinOptions(date, false));
        expect(date.getMonth()).to.equal(11); // Still December
      });
    });

    describe('Date', () => {
      it('spins date up', () => {
        const part = createDatePart(DatePartType.Date, {
          start: 0,
          end: 2,
          format: 'dd',
        });
        const date = new Date(2024, 5, 15);
        part.spin(1, createSpinOptions(date));
        expect(date.getDate()).to.equal(16);
      });

      it('spins date down', () => {
        const part = createDatePart(DatePartType.Date, {
          start: 0,
          end: 2,
          format: 'dd',
        });
        const date = new Date(2024, 5, 15);
        part.spin(-1, createSpinOptions(date));
        expect(date.getDate()).to.equal(14);
      });

      it('loops to 1 after max day with spinLoop', () => {
        const part = createDatePart(DatePartType.Date, {
          start: 0,
          end: 2,
          format: 'dd',
        });
        const date = new Date(2024, 5, 30); // June 30
        part.spin(1, createSpinOptions(date, true));
        expect(date.getDate()).to.equal(1);
      });
    });

    describe('Hours', () => {
      it('spins hours up', () => {
        const part = createDatePart(DatePartType.Hours, {
          start: 0,
          end: 2,
          format: 'HH',
        });
        const date = new Date(2024, 5, 15, 14);
        part.spin(1, createSpinOptions(date));
        expect(date.getHours()).to.equal(15);
      });

      it('loops from 23 to 0 with spinLoop', () => {
        const part = createDatePart(DatePartType.Hours, {
          start: 0,
          end: 2,
          format: 'HH',
        });
        const date = new Date(2024, 5, 15, 23);
        part.spin(1, createSpinOptions(date, true));
        expect(date.getHours()).to.equal(0);
      });
    });

    describe('Minutes', () => {
      it('spins minutes up', () => {
        const part = createDatePart(DatePartType.Minutes, {
          start: 0,
          end: 2,
          format: 'mm',
        });
        const date = new Date(2024, 5, 15, 14, 30);
        part.spin(1, createSpinOptions(date));
        expect(date.getMinutes()).to.equal(31);
      });
    });

    describe('Seconds', () => {
      it('spins seconds up', () => {
        const part = createDatePart(DatePartType.Seconds, {
          start: 0,
          end: 2,
          format: 'ss',
        });
        const date = new Date(2024, 5, 15, 14, 30, 45);
        part.spin(1, createSpinOptions(date));
        expect(date.getSeconds()).to.equal(46);
      });
    });

    describe('AmPm', () => {
      it('toggles from AM to PM', () => {
        const part = createDatePart(DatePartType.AmPm, {
          start: 0,
          end: 2,
          format: 'tt',
        });
        const date = new Date(2024, 5, 15, 9); // 9 AM
        const original = new Date(date.getTime());
        part.spin(1, createSpinOptions(date, true, 'AM', original));
        expect(date.getHours()).to.equal(21); // 9 PM
      });

      it('toggles from PM to AM', () => {
        const part = createDatePart(DatePartType.AmPm, {
          start: 0,
          end: 2,
          format: 'tt',
        });
        const date = new Date(2024, 5, 15, 14); // 2 PM
        const original = new Date(date.getTime());
        part.spin(1, createSpinOptions(date, true, 'PM', original));
        expect(date.getHours()).to.equal(2); // 2 AM
      });
    });

    describe('Literal', () => {
      it('does nothing when spun', () => {
        const part = createDatePart(DatePartType.Literal, {
          start: 0,
          end: 1,
          format: '/',
        });
        const date = new Date(2024, 5, 15);
        const originalTime = date.getTime();
        part.spin(1, createSpinOptions(date));
        expect(date.getTime()).to.equal(originalTime);
      });
    });
  });
});
