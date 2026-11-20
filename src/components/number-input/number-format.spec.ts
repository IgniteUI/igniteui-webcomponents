import { expect } from '@open-wc/testing';
import { getCurrentI18n } from 'igniteui-i18n-core';
import { restore, stub } from 'sinon';

import {
  formatFormValue,
  getNumberInputFormat,
  type NumberInputFormatOptions,
} from './number-format.js';

const BIDI_MARKS = /\p{Cf}/gu;
const USD: NumberInputFormatOptions = { style: 'currency', currency: 'USD' };

describe('Number input format', () => {
  const en = getNumberInputFormat('en');

  afterEach(() => {
    restore();
  });

  describe('Display and edit text', () => {
    it('shows the group separators, and edits the value without them', () => {
      expect(en.formatDisplay(1234.5)).to.equal('1,234.5');
      expect(en.formatEdit(1234.5)).to.equal('1234.5');
    });

    it('edits a currency amount without the currency symbol', () => {
      const format = getNumberInputFormat('en', USD);

      expect(format.formatDisplay(1234.5)).to.equal('$1,234.50');
      expect(format.formatEdit(1234.5)).to.equal('1234.5');
    });

    it('edits a percent as its value times 100', () => {
      const format = getNumberInputFormat('en', {
        style: 'percent',
        maximumFractionDigits: 1,
      });

      expect(format.formatDisplay(0.255)).to.equal('25.5%');
      expect(format.formatEdit(0.255)).to.equal('25.5');
    });

    it('uses the separators of the locale', () => {
      const format = getNumberInputFormat('de');

      expect(format.formatDisplay(1234.5)).to.equal('1.234,5');
      expect(format.formatEdit(1234.5)).to.equal('1234,5');
    });

    it('uses the digits of the locale numbering system', () => {
      expect(getNumberInputFormat('ar-EG').formatEdit(1234.5)).to.equal(
        '١٢٣٤٫٥'
      );
      expect(
        getNumberInputFormat('hi-IN-u-nu-deva').formatEdit(1234.5)
      ).to.equal('१२३४.५');
    });

    it('keeps the bidi marks before a negative number in the edit text', () => {
      const format = getNumberInputFormat('ar-EG');
      const marks = format.formatDisplay(-5).match(/^\p{Cf}*/u)![0];

      expect(marks).to.not.be.empty;
      expect(format.formatEdit(-5)).to.equal(`${marks}-٥`);
    });

    it('returns an empty text for null', () => {
      expect(en.formatDisplay(null)).to.equal('');
      expect(en.formatEdit(null)).to.equal('');
    });

    it('does not show a negative zero', () => {
      const format = getNumberInputFormat('en', { maximumFractionDigits: 2 });

      expect(format.formatDisplay(-0)).to.equal('0');
      expect(format.formatEdit(-0)).to.equal('0');
      expect(format.formatEdit(-0.001)).to.equal('0');
    });

    it('does not round a value without a maximum number of fraction digits', () => {
      expect(en.formatDisplay(1.23456789)).to.equal('1.23456789');
      expect(en.round(1.23456789)).to.equal(1.23456789);
    });

    it('keeps the fraction digits of the currency', () => {
      const dollars = getNumberInputFormat('en', USD);
      const yen = getNumberInputFormat('en', {
        style: 'currency',
        currency: 'JPY',
      });

      expect(dollars.formatDisplay(1.239)).to.equal('$1.24');
      expect(dollars.round(1.239)).to.equal(1.24);
      expect(yen.maximumFractionDigits).to.equal(0);
      expect(yen.round(1.5)).to.equal(2);
    });
  });

  describe('parse', () => {
    it('returns null for an empty text', () => {
      expect(en.parse('')).to.be.null;
      expect(en.parse('  ')).to.be.null;
      expect(en.parse('‎')).to.be.null;
    });

    it('returns NaN for a text that is not a number', () => {
      for (const text of [
        '-',
        '.',
        'abc',
        '1.2.3',
        '--5',
        '1e5',
        '(-5)',
        '5-1',
      ]) {
        expect(en.parse(text), text).to.be.NaN;
      }
    });

    it('reads the display text of each format', () => {
      const cases: [string, NumberInputFormatOptions, number][] = [
        ['en', {}, -1234567.25],
        ['de', { style: 'currency', currency: 'EUR' }, -1234.5],
        ['fr', { style: 'percent', maximumFractionDigits: 2 }, 0.1234],
        ['de-CH', {}, 1234567.25],
        ['sv', {}, -1234.5],
        ['he', { style: 'currency', currency: 'ILS' }, -1234.5],
        ['ar-EG', { style: 'percent' }, -0.5],
        ['fa', {}, -1234.5],
        ['ja', { style: 'currency', currency: 'JPY' }, -1234],
        ['en', { ...USD, currencyDisplay: 'name' }, 1],
        ['en', { ...USD, currencyDisplay: 'code' }, 5],
        [
          'ru',
          { style: 'unit', unit: 'kilometer-per-hour', unitDisplay: 'long' },
          21,
        ],
        [
          'fr',
          { style: 'unit', unit: 'kilometer-per-hour', unitDisplay: 'long' },
          2,
        ],
        ['en', { style: 'unit', unit: 'celsius' }, -3.5],
        ['en', { signDisplay: 'always' }, 5],
      ];

      for (const [locale, options, value] of cases) {
        const format = getNumberInputFormat(locale, options);
        const display = format.formatDisplay(value);

        expect(format.parse(display), `${locale} ${display}`).to.equal(value);
        expect(format.parse(format.formatEdit(value)), locale).to.equal(value);
      }
    });

    it('reads ASCII digits in every locale', () => {
      expect(getNumberInputFormat('ar-EG').parse('1234.5')).to.equal(1234.5);
      expect(getNumberInputFormat('hi-IN-u-nu-deva').parse('1234.5')).to.equal(
        1234.5
      );
      expect(getNumberInputFormat('fa').parse('-12')).to.equal(-12);
    });

    it('reads full-width characters', () => {
      const format = getNumberInputFormat('ja');

      expect(format.parse('１２３．５')).to.equal(123.5);
      expect(format.parse('－５')).to.equal(-5);
    });

    it('reads the U+2212 minus sign and a trailing sign', () => {
      expect(en.parse('−5')).to.equal(-5);
      expect(en.parse('5-')).to.equal(-5);
      expect(en.parse('+5')).to.equal(5);
    });

    it('reads a negative amount in parentheses', () => {
      const format = getNumberInputFormat('en', {
        ...USD,
        currencySign: 'accounting',
      });

      expect(format.formatDisplay(-1234.5)).to.equal('($1,234.50)');
      expect(format.parse('($1,234.50)')).to.equal(-1234.5);
      expect(format.parse('(5)')).to.equal(-5);
    });

    it('reads an apostrophe as the Swiss group separator', () => {
      const format = getNumberInputFormat('de-CH');

      expect(format.parse("1'234.5")).to.equal(1234.5);
      expect(format.parse('1’234.5')).to.equal(1234.5);
    });

    it('reads any space as the French group separator', () => {
      const format = getNumberInputFormat('fr');

      for (const space of [' ', ' ', ' ']) {
        expect(format.parse(`1${space}234,5`)).to.equal(1234.5);
      }
    });

    it('reads `.` or `,` as the decimal separator when it is not a group separator', () => {
      expect(getNumberInputFormat('fr').parse('1.5')).to.equal(1.5);
      expect(getNumberInputFormat('ar-EG').parse('1,5')).to.equal(1.5);
      expect(getNumberInputFormat('de').parse('1.5')).to.equal(15);
      expect(en.parse('1,5')).to.equal(15);
    });

    it('reads a number with no integer digits or no fraction digits', () => {
      expect(en.parse('.5')).to.equal(0.5);
      expect(en.parse('-.5')).to.equal(-0.5);
      expect(en.parse('5.')).to.equal(5);
    });

    it('rejects the symbols of another format', () => {
      expect(en.parse('$5')).to.be.NaN;
      expect(en.parse('5%')).to.be.NaN;
      expect(getNumberInputFormat('en', USD).parse('$5')).to.equal(5);
    });

    it('divides a percent by 100 without a floating-point error', () => {
      const format = getNumberInputFormat('en', { style: 'percent' });

      expect(format.parse('7')).to.equal(0.07);
      expect(format.parse('29')).to.equal(0.29);
      expect(format.parse('1.1')).to.equal(0.011);
      expect(format.parse('29%')).to.equal(0.29);
    });

    it('returns zero for a negative zero', () => {
      expect(Object.is(en.parse('-0'), 0)).to.be.true;
    });

    it('returns NaN for a number out of the double range', () => {
      expect(en.parse('1'.repeat(400))).to.be.NaN;
    });
  });

  describe('isValidPartial', () => {
    it('accepts the start of a number', () => {
      for (const text of [
        '',
        '-',
        '+',
        '1',
        '1,234',
        '1.',
        '.',
        '-.5',
        '1.25',
      ]) {
        expect(en.isValidPartial(text), text).to.be.true;
      }
    });

    it('rejects a character out of place', () => {
      for (const text of ['1e', '1.2.', ',5', '5-', '--', '$', 'a', '1.2,3']) {
        expect(en.isValidPartial(text), text).to.be.false;
      }
    });

    it('accepts a space only as a group separator of the locale', () => {
      const fr = getNumberInputFormat('fr');

      expect(en.isValidPartial('1 2')).to.be.false;
      expect(fr.isValidPartial('1 234')).to.be.true;
      expect(fr.isValidPartial('1\u202f234')).to.be.true;
      expect(fr.isValidPartial('1 234,5 ')).to.be.false;
      expect(fr.isValidPartial(' 1')).to.be.false;
    });

    it('rejects a minus sign when negative numbers are not allowed', () => {
      expect(en.isValidPartial('-', false)).to.be.false;
      expect(en.isValidPartial('-5', false)).to.be.false;
      expect(en.isValidPartial('+5', false)).to.be.true;
    });

    it('rejects a decimal separator when the format has no fraction digits', () => {
      const integer = getNumberInputFormat('en', { maximumFractionDigits: 0 });
      const yen = getNumberInputFormat('en', {
        style: 'currency',
        currency: 'JPY',
      });

      expect(integer.isValidPartial('1.')).to.be.false;
      expect(integer.isValidPartial('12')).to.be.true;
      expect(yen.isValidPartial('1.')).to.be.false;
    });

    it('accepts the edit text in the digits of the locale', () => {
      const format = getNumberInputFormat('ar-EG');
      const text = format.formatEdit(-1234.5).replace(BIDI_MARKS, '');

      expect(format.isValidPartial(text)).to.be.true;
    });
  });

  describe('round', () => {
    it('rounds to the maximum number of fraction digits', () => {
      const format = getNumberInputFormat('en', { maximumFractionDigits: 2 });

      expect(format.round(1.005)).to.equal(1.01);
      expect(format.round(-1.234)).to.equal(-1.23);
    });

    it('follows the rounding mode', () => {
      expect(
        getNumberInputFormat('en', {
          maximumFractionDigits: 2,
          roundingMode: 'trunc',
        }).round(-1.999)
      ).to.equal(-1.99);
      expect(
        getNumberInputFormat('en', {
          maximumFractionDigits: 2,
          roundingMode: 'ceil',
        }).round(1.001)
      ).to.equal(1.01);
    });

    it('rounds a percent at the digits it shows', () => {
      const format = getNumberInputFormat('en', {
        style: 'percent',
        maximumFractionDigits: 1,
      });

      expect(format.round(0.12345)).to.equal(0.123);
    });
  });

  describe('spin', () => {
    it('steps by `step`, else by 1, or 0.01 for a percent', () => {
      const percent = getNumberInputFormat('en', { style: 'percent' });

      expect(en.spin(5, { count: 2, step: 0.5 })).to.equal(6);
      expect(en.spin(5, { count: -1 })).to.equal(4);
      expect(en.spin(5, { count: 1, step: 0 })).to.equal(6);
      expect(en.spin(5, { count: 1, step: -2 })).to.equal(6);
      expect(percent.spin(0.25, { count: 1 })).to.equal(0.26);
    });

    it('steps by the last shown digit when `step` is finer', () => {
      const cents = getNumberInputFormat('en', { maximumFractionDigits: 2 });

      expect(cents.spin(1, { count: 1, step: 0.001 })).to.equal(1.01);
    });

    it('stops at the bounds on a shown value', () => {
      const tenths = getNumberInputFormat('en', { maximumFractionDigits: 1 });

      expect(en.spin(9, { count: 5, max: 10 })).to.equal(10);
      expect(en.spin(1, { count: -5, min: 0 })).to.equal(0);
      expect(tenths.spin(9.5, { count: 1, max: 9.95 })).to.equal(9.9);
    });

    it('gives an empty value the seed: 0, fit into the bounds, without a step', () => {
      expect(en.spin(null, { count: 1 })).to.equal(0);
      expect(en.spin(null, { count: -1, min: 5 })).to.equal(5);
      expect(en.spin(null, { count: 1, max: -5 })).to.equal(-5);
    });

    it('does not move a value against the direction of the step', () => {
      expect(en.spin(15, { count: 1, max: 10 })).to.equal(15);
      expect(en.spin(15, { count: -1, max: 10 })).to.equal(10);
      expect(en.spin(-5, { count: -1, min: 0 })).to.equal(-5);
    });

    it('keeps the value for a count of 0', () => {
      expect(en.spin(5.0001, { count: 0, max: 1 })).to.equal(5.0001);
      expect(en.spin(null, { count: 0 })).to.be.null;
    });
  });

  describe('getNumberInputFormat', () => {
    it('gives the value change of one unit in the last shown digit', () => {
      const stepOf = (options: NumberInputFormatOptions) =>
        getNumberInputFormat('en', options).smallestStep;

      expect(stepOf(USD)).to.equal(0.01);
      expect(stepOf({ maximumFractionDigits: 0 })).to.equal(1);
      expect(stepOf({ style: 'percent', maximumFractionDigits: 1 })).to.equal(
        0.001
      );
    });

    it('returns the same format for the same locale and options', () => {
      const format = getNumberInputFormat('en', { maximumFractionDigits: 2 });

      expect(getNumberInputFormat('en', { maximumFractionDigits: 2 })).to.equal(
        format
      );
      expect(
        getNumberInputFormat('en', { maximumFractionDigits: 3 })
      ).to.not.equal(format);
      expect(
        getNumberInputFormat('de', { maximumFractionDigits: 2 })
      ).to.not.equal(format);
    });

    it('ignores options that the input cannot parse back', () => {
      const format = getNumberInputFormat('en', {
        notation: 'compact',
      } as NumberInputFormatOptions);

      expect(format.formatDisplay(1234)).to.equal('1,234');
    });

    it('uses the default format for invalid options and warns', () => {
      const warn = stub(console, 'warn');
      const format = getNumberInputFormat('en', {
        style: 'currency',
        maximumFractionDigits: 1,
      });

      expect(format.formatDisplay(1234.5)).to.equal('1,234.5');
      expect(warn.calledOnce).to.be.true;
    });

    it('uses the global locale for an invalid locale', () => {
      expect(
        getNumberInputFormat('not a locale!').formatDisplay(1234.5)
      ).to.equal(getNumberInputFormat(getCurrentI18n()).formatDisplay(1234.5));
    });

    it('has the decimal separator of the locale', () => {
      expect(getNumberInputFormat('en').decimalSeparator).to.equal('.');
      expect(getNumberInputFormat('de').decimalSeparator).to.equal(',');
      expect(getNumberInputFormat('ar-EG').decimalSeparator).to.equal('٫');
    });
  });

  describe('formatFormValue', () => {
    it('returns plain ASCII digits with no group separator and no exponent', () => {
      expect(formatFormValue(1234.5)).to.equal('1234.5');
      expect(formatFormValue(-1234.5)).to.equal('-1234.5');
      expect(formatFormValue(0.0000001)).to.equal('0.0000001');
      expect(formatFormValue(1e21)).to.equal('1000000000000000000000');
    });

    it('returns the shortest text that reads back as the same number', () => {
      expect(formatFormValue(0.1 + 0.2)).to.equal('0.30000000000000004');
      expect(formatFormValue(1 / 3)).to.equal('0.3333333333333333');
    });

    it('does not return a negative zero', () => {
      expect(formatFormValue(-0)).to.equal('0');
    });
  });
});
