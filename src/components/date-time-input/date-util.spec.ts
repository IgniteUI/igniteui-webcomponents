import { describe, expect, it } from 'vitest';
import { DateParts, DateTimeUtil } from './date-util.js';

describe('Date Util', () => {
  const DEFAULT_LOCALE = 'en';
  const DEFAULT_FORMAT = 'MM/dd/yyyy';
  const DEFAULT_TIME_FORMAT = 'MM/dd/yyyy hh:mm tt';
  const DEFAULT_PROMPT = '_';

  it('locale default mask', () => {
    expect(DateTimeUtil.getDefaultInputMask('')).to.equal('MM/dd/yyyy');
    expect(DateTimeUtil.getDefaultInputMask(DEFAULT_LOCALE)).to.equal(
      'MM/dd/yyyy'
    );
    expect(DateTimeUtil.getDefaultInputMask('no')).to.equal('dd.MM.yyyy');
    expect(DateTimeUtil.getDefaultInputMask('bg').normalize('NFKC')).to.equal(
      'dd.MM.yyyy г.'
    );
  });

  it('should correctly parse all date time parts (base)', () => {
    const result = DateTimeUtil.parseDateTimeFormat(
      'dd/MM/yyyy HH:mm:ss tt',
      DEFAULT_LOCALE
    );
    const expected = [
      { start: 0, end: 2, type: DateParts.Date, format: 'dd' },
      { start: 2, end: 3, type: DateParts.Literal, format: '/' },
      { start: 3, end: 5, type: DateParts.Month, format: 'MM' },
      { start: 5, end: 6, type: DateParts.Literal, format: '/' },
      { start: 6, end: 10, type: DateParts.Year, format: 'yyyy' },
      { start: 10, end: 11, type: DateParts.Literal, format: ' ' },
      { start: 11, end: 13, type: DateParts.Hours, format: 'HH' },
      { start: 13, end: 14, type: DateParts.Literal, format: ':' },
      { start: 14, end: 16, type: DateParts.Minutes, format: 'mm' },
      { start: 16, end: 17, type: DateParts.Literal, format: ':' },
      { start: 17, end: 19, type: DateParts.Seconds, format: 'ss' },
      { start: 19, end: 20, type: DateParts.Literal, format: ' ' },
      { start: 20, end: 22, type: DateParts.AmPm, format: 'tt' },
    ];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });

  it('parseValueFromMask with valid date', () => {
    let maskedValue = '03/03/2020';
    let date = new Date(2020, 2, 3);
    let parts = DateTimeUtil.parseDateTimeFormat(
      DEFAULT_FORMAT,
      DEFAULT_LOCALE
    );
    let parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );

    expect(parsedDate!.getTime()).to.equal(date.getTime());

    parts = DateTimeUtil.parseDateTimeFormat(
      DEFAULT_TIME_FORMAT,
      DEFAULT_LOCALE
    );

    maskedValue = '03/03/2020 10:00 PM';
    date = new Date(2020, 2, 3, 22, 0, 0, 0);
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate!.getTime()).to.equal(date.getTime());

    maskedValue = '03/03/2020 10:00 AM';
    date = new Date(2020, 2, 3, 10, 0, 0, 0);
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate!.getTime()).to.equal(date.getTime());
  });

  it('parseValueFromMask with invalid dates', () => {
    let maskedValue = '13/03/2020';
    let parts = DateTimeUtil.parseDateTimeFormat(
      DEFAULT_FORMAT,
      DEFAULT_LOCALE
    );

    let parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate).to.be.null;

    maskedValue = '03/32/2020';
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate).to.be.null;

    maskedValue = '03/32/2020';
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate).to.be.null;

    parts = DateTimeUtil.parseDateTimeFormat(
      DEFAULT_TIME_FORMAT,
      DEFAULT_LOCALE
    );

    maskedValue = '03/03/2020 25:62';
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate).to.be.null;
  });

  it('getPartValue should properly return part values', () => {
    const currentDate = new Date(2020, 6, 17, 16, 15, 59);
    const parts = DateTimeUtil.parseDateTimeFormat(
      'dd/MM/yy hh:mm:ss tt',
      DEFAULT_LOCALE
    );

    const partsMap = new Map<DateParts, number>([
      [DateParts.Date, currentDate.getDate()],
      [DateParts.Month, currentDate.getMonth() + 1],
      [DateParts.Hours, 4], // we use 12h format; getHours will return 16
      [DateParts.Minutes, currentDate.getMinutes()],
      [DateParts.Seconds, currentDate.getSeconds()],
      [
        DateParts.Year,
        Number.parseInt(currentDate.getFullYear().toString().slice(-2), 10),
      ],
    ]);

    for (const part of parts) {
      if (part.type === DateParts.Literal) {
        continue;
      }

      const targetValue = DateTimeUtil.getPartValue(
        part,
        part.format.length,
        currentDate
      );

      if (part.type === DateParts.AmPm) {
        const amPm = currentDate.getHours() >= 12 ? 'PM' : 'AM';
        expect(amPm).to.equal(targetValue);
      } else {
        expect(partsMap.get(part.type)).to.equal(
          Number.parseInt(targetValue, 10)
        );
      }
    }
  });

  it('parseIsoDate should parse dates correctly', () => {
    const updateDate = (dateValue: Date, stringValue: string): Date => {
      const [datePart] = dateValue.toISOString().split('T');
      const newDate = new Date(`${datePart}T${stringValue}`);
      newDate.setMilliseconds(0);
      return newDate;
    };

    const date = new Date(2020, 2, 3);

    let parsedDate = DateTimeUtil.parseIsoDate(date.toISOString());
    expect(parsedDate!.getTime()).to.equal(date.getTime());

    parsedDate = DateTimeUtil.parseIsoDate('2022-12-19');
    expect(parsedDate!.getTime()).to.equal(
      new Date('2022-12-19T00:00:00').getTime()
    );

    parsedDate = DateTimeUtil.parseIsoDate('2017');
    expect(parsedDate!.getTime()).to.equal(
      new Date('2017-01-01T00:00:00').getTime()
    );

    parsedDate = DateTimeUtil.parseIsoDate('2017-09');
    expect(parsedDate!.getTime()).to.equal(
      new Date('2017-09-01T00:00:00').getTime()
    );

    parsedDate = DateTimeUtil.parseIsoDate('11:11');
    expect(parsedDate!.getTime()).to.equal(
      updateDate(new Date(), '11:11').getTime()
    );

    expect(DateTimeUtil.parseIsoDate('23:60')).to.be.null;
    expect(DateTimeUtil.parseIsoDate('')).to.be.null;
  });

  it('isValidDate should properly determine if a date is valid or not', () => {
    expect(DateTimeUtil.isValidDate('')).to.be.false;
    expect(DateTimeUtil.isValidDate(new Date())).to.be.true;
    expect(DateTimeUtil.isValidDate('10.10.2010')).to.be.false;
    expect(DateTimeUtil.isValidDate(new Date(Number.NaN))).to.be.false;
    expect(DateTimeUtil.isValidDate(new Date().toISOString())).to.be.false;
  });

  it('should return ValidationErrors for minValue and maxValue', () => {
    let minValue = new Date(2020, 2, 1);
    let maxValue = new Date(2020, 2, 7);

    expect(
      DateTimeUtil.validateMinMax(new Date(2020, 2, 5), minValue, maxValue)
    ).to.deep.equal({});
    expect(
      DateTimeUtil.validateMinMax(new Date(2020, 1, 7), minValue, maxValue)
    ).to.deep.equal({ minValue: true });
    expect(
      DateTimeUtil.validateMinMax(new Date(2020, 4, 2), minValue, maxValue)
    ).to.deep.equal({ maxValue: true });

    minValue = new Date(2020, 2, 1, 10, 10, 10);
    maxValue = new Date(2020, 2, 1, 15, 15, 15);

    expect(
      DateTimeUtil.validateMinMax(
        new Date(2020, 2, 1, 12, 0, 0),
        minValue,
        maxValue
      )
    ).to.deep.equal({});
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2020, 2, 1, 9, 0, 0),
        minValue,
        maxValue
      )
    ).to.deep.equal({ minValue: true });
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2020, 2, 1, 16, 0, 0),
        minValue,
        maxValue
      )
    ).to.deep.equal({ maxValue: true });

    //ignore date
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2017, 10, 19, 12, 0, 0),
        minValue,
        maxValue,
        true,
        false
      )
    ).to.deep.equal({});
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2017, 6, 4, 9, 0, 0),
        minValue,
        maxValue,
        true,
        false
      )
    ).to.deep.equal({ minValue: true });
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2017, 3, 12, 16, 0, 0),
        minValue,
        maxValue,
        true,
        false
      )
    ).to.deep.equal({ maxValue: true });

    //ignore time
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2020, 2, 1, 20, 30, 0),
        minValue,
        maxValue,
        false,
        true
      )
    ).to.deep.equal({});
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2017, 2, 1, 20, 30, 0),
        minValue,
        maxValue,
        false,
        true
      )
    ).to.deep.equal({ minValue: true });
    expect(
      DateTimeUtil.validateMinMax(
        new Date(2021, 2, 1, 20, 30, 0),
        minValue,
        maxValue,
        false,
        true
      )
    ).to.deep.equal({ maxValue: true });
  });

  it('should compare dates correctly', () => {
    let minValue = new Date(2020, 2, 1);
    let maxValue = new Date(2020, 2, 7);

    expect(DateTimeUtil.lessThanMinValue(new Date(2020, 2, 2), minValue)).to.be
      .false;
    expect(DateTimeUtil.lessThanMinValue(new Date(2020, 1, 1), minValue)).to.be
      .true;

    expect(DateTimeUtil.greaterThanMaxValue(new Date(2020, 2, 6), maxValue)).to
      .be.false;
    expect(DateTimeUtil.greaterThanMaxValue(new Date(2020, 2, 8), maxValue)).to
      .be.true;

    minValue = new Date(2020, 2, 3, 11, 11, 11);
    maxValue = new Date(2020, 2, 3, 15, 15, 15);

    //years
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 11, 30, 0), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2019, 2, 3, 11, 30, 0), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2019, 2, 3, 11, 30, 0),
        maxValue
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2021, 2, 3, 11, 30, 0),
        maxValue
      )
    ).to.be.true;

    //months
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 12, 45, 0), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 1, 3, 12, 45, 0), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 1, 3, 11, 30, 0),
        maxValue
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 3, 3, 11, 30, 0),
        maxValue
      )
    ).to.be.true;

    //days
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 12, 45, 0), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 2, 12, 45, 0), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 1, 11, 30, 0),
        maxValue
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 4, 11, 30, 0),
        maxValue
      )
    ).to.be.true;

    //hours
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 14, 0, 0), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 10, 0, 0), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(new Date(2020, 2, 3, 11, 0, 0), maxValue)
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(new Date(2020, 2, 3, 16, 0, 0), maxValue)
    ).to.be.true;

    //minutes
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 11, 12, 0), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 11, 10, 0), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 3, 15, 14, 0),
        maxValue
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 3, 15, 16, 0),
        maxValue
      )
    ).to.be.true;

    //seconds
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 11, 11, 12), minValue)
    ).to.be.false;
    expect(
      DateTimeUtil.lessThanMinValue(new Date(2020, 2, 3, 11, 11, 10), minValue)
    ).to.be.true;

    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 3, 15, 15, 14),
        maxValue
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 3, 15, 15, 16),
        maxValue
      )
    ).to.be.true;

    //exclude date
    expect(
      DateTimeUtil.lessThanMinValue(
        new Date(2010, 2, 3, 11, 15, 0),
        minValue,
        true,
        false
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2030, 2, 3, 15, 15, 14),
        maxValue,
        true,
        false
      )
    ).to.be.false;

    //exclude time
    expect(
      DateTimeUtil.lessThanMinValue(
        new Date(2020, 2, 3, 10, 0, 0),
        minValue,
        false,
        true
      )
    ).to.be.false;
    expect(
      DateTimeUtil.greaterThanMaxValue(
        new Date(2020, 2, 3, 16, 0, 0),
        maxValue,
        false,
        true
      )
    ).to.be.false;
  });

  it('should spin date portions correctly', () => {
    let date = new Date(2015, 4, 20);
    DateTimeUtil.spinDate(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 21).getTime());
    DateTimeUtil.spinDate(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20).getTime());

    // delta !== 1
    DateTimeUtil.spinDate(5, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 25).getTime());
    DateTimeUtil.spinDate(-6, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 19).getTime());

    // spinLoop = false
    date = new Date(2015, 4, 31);
    DateTimeUtil.spinDate(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 31).getTime());
    DateTimeUtil.spinDate(-50, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 1).getTime());

    // spinLoop = true
    DateTimeUtil.spinDate(31, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 1).getTime());
    DateTimeUtil.spinDate(-5, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 27).getTime());
  });

  it('should spin month portions correctly', () => {
    let date = new Date(2015, 4, 20);
    DateTimeUtil.spinMonth(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 5, 20).getTime());
    DateTimeUtil.spinMonth(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20).getTime());

    // delta !== 1
    DateTimeUtil.spinMonth(5, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 9, 20).getTime());
    DateTimeUtil.spinMonth(-6, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 3, 20).getTime());

    // spinLoop = false
    date = new Date(2015, 11, 31);
    DateTimeUtil.spinMonth(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 11, 31).getTime());
    DateTimeUtil.spinMonth(-50, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 0, 31).getTime());

    // spinLoop = true
    date = new Date(2015, 11, 1);
    DateTimeUtil.spinMonth(2, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 1, 1).getTime());
    date = new Date(2015, 0, 1);
    DateTimeUtil.spinMonth(-1, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 11, 1).getTime());

    // coerces date portion to be no greater than max date of current month
    date = new Date(2020, 2, 31);
    DateTimeUtil.spinMonth(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2020, 1, 29).getTime());
    DateTimeUtil.spinMonth(1, date, false);
    expect(date.getTime()).to.equal(new Date(2020, 2, 29).getTime());
    date = new Date(2020, 4, 31);
    DateTimeUtil.spinMonth(1, date, false);
    expect(date.getTime()).to.equal(new Date(2020, 5, 30).getTime());
  });

  it('should spin year portions correctly', () => {
    let date = new Date(2015, 4, 20);
    DateTimeUtil.spinYear(1, date);
    expect(date.getTime()).to.equal(new Date(2016, 4, 20).getTime());
    DateTimeUtil.spinYear(-1, date);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20).getTime());

    // delta !== 1
    DateTimeUtil.spinYear(5, date);
    expect(date.getTime()).to.equal(new Date(2020, 4, 20).getTime());
    DateTimeUtil.spinYear(-6, date);
    expect(date.getTime()).to.equal(new Date(2014, 4, 20).getTime());

    // coerces February to be 29 days on a leap year and 28 on a non leap year
    date = new Date(2020, 1, 29);
    DateTimeUtil.spinYear(1, date);
    expect(date.getTime()).to.equal(new Date(2021, 1, 28).getTime());
    DateTimeUtil.spinYear(-1, date);
    expect(date.getTime()).to.equal(new Date(2020, 1, 28).getTime());
  });

  it('should spin hours portion correctly', () => {
    let date = new Date(2015, 4, 20, 6);
    DateTimeUtil.spinHours(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 7).getTime());
    DateTimeUtil.spinHours(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6).getTime());

    // delta !== 1
    DateTimeUtil.spinHours(5, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 11).getTime());
    DateTimeUtil.spinHours(-6, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 5).getTime());

    // spinLoop = false
    date = new Date(2015, 4, 20, 23);
    DateTimeUtil.spinHours(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 23).getTime());
    DateTimeUtil.spinHours(-30, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 0).getTime());

    // spinLoop = true (date is not affected)
    DateTimeUtil.spinHours(25, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 1).getTime());
    DateTimeUtil.spinHours(-2, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 23).getTime());
  });

  it('should spin minutes portion correctly', () => {
    let date = new Date(2015, 4, 20, 6, 10);
    DateTimeUtil.spinMinutes(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 11).getTime());
    DateTimeUtil.spinMinutes(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 10).getTime());

    // delta !== 1
    DateTimeUtil.spinMinutes(5, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 15).getTime());
    DateTimeUtil.spinMinutes(-6, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 9).getTime());

    // spinLoop = false
    date = new Date(2015, 4, 20, 12, 59);
    DateTimeUtil.spinMinutes(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 59).getTime());
    DateTimeUtil.spinMinutes(-70, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 0).getTime());

    // spinLoop = true (hours are not affected)
    DateTimeUtil.spinMinutes(61, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 1).getTime());
    DateTimeUtil.spinMinutes(-5, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 56).getTime());
  });

  it('should spin seconds portion correctly', () => {
    // base
    let date = new Date(2015, 4, 20, 6, 10, 5);
    DateTimeUtil.spinSeconds(1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 10, 6).getTime());
    DateTimeUtil.spinSeconds(-1, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 10, 5).getTime());

    // delta !== 1
    DateTimeUtil.spinSeconds(5, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 10, 10).getTime());
    DateTimeUtil.spinSeconds(-6, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 6, 10, 4).getTime());

    // spinLoop = false
    date = new Date(2015, 4, 20, 12, 59, 59);
    DateTimeUtil.spinSeconds(1, date, false);
    expect(date.getTime()).to.equal(
      new Date(2015, 4, 20, 12, 59, 59).getTime()
    );
    DateTimeUtil.spinSeconds(-70, date, false);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 59, 0).getTime());

    // spinLoop = true (minutes are not affected)
    DateTimeUtil.spinSeconds(62, date, true);
    expect(date.getTime()).to.equal(new Date(2015, 4, 20, 12, 59, 2).getTime());
    DateTimeUtil.spinSeconds(-5, date, true);
    expect(date.getTime()).to.equal(
      new Date(2015, 4, 20, 12, 59, 57).getTime()
    );
  });

  it('should spin AM/PM portion correctly', () => {
    const currentDate = new Date(2015, 4, 31, 4, 59, 59);
    const newDate = new Date(2015, 4, 31, 4, 59, 59);
    // spin from AM to PM
    DateTimeUtil.spinAmPm(currentDate, newDate, 'PM');
    expect(currentDate.getHours()).to.equal(16);

    // spin from PM to AM
    DateTimeUtil.spinAmPm(currentDate, newDate, 'AM');
    expect(currentDate.getHours()).to.equal(4);
  });
});
