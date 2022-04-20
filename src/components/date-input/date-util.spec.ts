import { expect } from '@open-wc/testing';
import { DateParts, DateTimeUtil } from './date-util';

describe('Date Input parser', () => {
  const DEFAULT_LOCALE = 'en';
  const DEFAULT_FORMAT = 'MM/dd/yyyy';
  const DEFAULT_TIME_FORMAT = 'MM/dd/yyyy hh:mm tt';
  const DEFAULT_PROMPT = '_';

  it('locale default mask', () => {
    expect(DateTimeUtil.getDefaultMask('')).to.equal('MM/dd/yyyy');
    expect(DateTimeUtil.getDefaultMask(DEFAULT_LOCALE)).to.equal('MM/dd/yyyy');
    expect(DateTimeUtil.getDefaultMask('no')).to.equal('dd.MM.yyyy');
    expect(DateTimeUtil.getDefaultMask('bg')).to.equal('dd.MM.yyyy г.');
  });

  it('should correctly parse all date time parts (base)', () => {
    const result = DateTimeUtil.parseDateTimeFormat('dd/MM/yyyy HH:mm:ss tt');
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
    let parts = DateTimeUtil.parseDateTimeFormat(DEFAULT_FORMAT);
    let parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );

    expect(parsedDate!.getTime()).to.equal(date.getTime());

    parts = DateTimeUtil.parseDateTimeFormat(DEFAULT_TIME_FORMAT);

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
    let parts = DateTimeUtil.parseDateTimeFormat(DEFAULT_FORMAT);

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

    parts = DateTimeUtil.parseDateTimeFormat(DEFAULT_TIME_FORMAT);

    maskedValue = '03/03/2020 25:62';
    parsedDate = DateTimeUtil.parseValueFromMask(
      maskedValue,
      parts,
      DEFAULT_PROMPT
    );
    expect(parsedDate).to.be.null;
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

    expect(DateTimeUtil.parseIsoDate('')).to.be.null;
    expect(
      DateTimeUtil.parseIsoDate(new Date().getTime().toString())?.getTime()
    ).to.be.NaN;
  });

  it('isValidDate should properly determine if a date is valid or not', () => {
    expect(DateTimeUtil.isValidDate('')).to.be.false;
    expect(DateTimeUtil.isValidDate(new Date())).to.be.true;
    expect(DateTimeUtil.isValidDate('10.10.2010')).to.be.false;
    expect(DateTimeUtil.isValidDate(new Date(NaN))).to.be.false;
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
});
