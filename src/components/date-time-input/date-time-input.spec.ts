import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { setCurrentI18n } from 'igniteui-i18n-core';
import { spy } from 'sinon';
import { isValidDate } from '../calendar/helpers.js';
import { CalendarDay, toCalendarDay } from '../calendar/model.js';
import {
  altKey,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  isFocused,
  simulateInput,
  simulateKeyboard,
  simulateWheel,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '../common/validity-helpers.spec.js';
import { DatePart } from './date-part.js';
import IgcDateTimeInputComponent from './date-time-input.js';
import { DateTimeMaskParser } from './datetime-mask-parser.js';

describe('Date Time Input component', () => {
  before(() => {
    defineComponents(IgcDateTimeInputComponent);
  });

  const parser = new DateTimeMaskParser();
  const DEFAULT_PROMPT = '_';
  const DEFAULT_FORMAT = 'MM/dd/yyyy';

  let element: IgcDateTimeInputComponent;
  let input: HTMLInputElement;

  describe('', async () => {
    beforeEach(async () => {
      element = await fixture<IgcDateTimeInputComponent>(
        html`<igc-date-time-input></igc-date-time-input>`
      );

      input = element.renderRoot.querySelector('input')!;
      parser.prompt = DEFAULT_PROMPT;
      parser.mask = DEFAULT_FORMAT;
    });

    it('should set default values correctly', async () => {
      expect(element.value).to.be.null;
      expect(element.prompt).to.equal(DEFAULT_PROMPT);
      expect(element.inputFormat).to.equal(DEFAULT_FORMAT);
      expect(input.placeholder).to.equal(DEFAULT_FORMAT);
    });

    it('should update inputFormat with no value according to locale', async () => {
      element.locale = 'no';
      await elementUpdated(element);
      expect(element.placeholder).to.equal('dd.MM.yyyy');
      expect(element.inputFormat).to.equal('dd.MM.yyyy');
      expect(element.displayFormat).to.equal('d.M.yyyy');
    });

    it('should update inputFormat with value according to locale', async () => {
      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);
      expect(input.value).to.equal('3/3/2020');

      element.locale = 'no';
      await elementUpdated(element);
      expect(element.placeholder).to.equal('dd.MM.yyyy');
      expect(element.inputFormat).to.equal('dd.MM.yyyy');
      expect(element.displayFormat).to.equal('d.M.yyyy');
      expect(input.value).to.equal('3.3.2020');
    });

    it('should update inputFormat with no value when using the localization API', async () => {
      setCurrentI18n('no');
      await elementUpdated(element);

      expect(element.placeholder).to.equal('dd.MM.yyyy');
      expect(element.inputFormat).to.equal('dd.MM.yyyy');
      expect(element.displayFormat).to.equal('d.M.yyyy');

      // Restore default locale
      setCurrentI18n('en');
    });

    it('should update inputFormat with value when using the localization API', async () => {
      element.value = new Date(2020, 2, 3);
      setCurrentI18n('no');
      await elementUpdated(element);

      expect(element.placeholder).to.equal('dd.MM.yyyy');
      expect(element.inputFormat).to.equal('dd.MM.yyyy');
      expect(element.displayFormat).to.equal('d.M.yyyy');
      expect(input.value).to.equal('3.3.2020');

      // Restore default locale
      setCurrentI18n('en');
    });

    it('should use inputFormat if no displayFormat is defined - issue 1114', async () => {
      element.inputFormat = 'yyyy#MM#dd';
      await elementUpdated(element);

      expect((element as any)._displayFormat).to.be.undefined;
      expect(input.placeholder).to.equal('yyyy#MM#dd');

      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);

      element.inputFormat = 'yyyy@MM@dd';
      await elementUpdated(element);

      expect(input.value).to.equal('2020@03@03');

      // displayFormats overwrites
      element.displayFormat = '-- yyyy -- MM -- dd --';
      await elementUpdated(element);

      expect(input.value).to.equal('-- 2020 -- 03 -- 03 --');

      // Reset
      element.displayFormat = undefined as any;
      await elementUpdated(element);

      expect(input.value).to.equal('2020@03@03');
    });

    it('should use displayFormat when defined', async () => {
      expect((element as any)._displayFormat).to.be.undefined;

      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);

      expect(input.value).to.equal('3/3/2020');

      element.displayFormat = 'dd.MM/yyyy';
      await elementUpdated(element);
      expect(input.value).to.equal('03.03/2020');

      element.displayFormat = 'd.M';
      await elementUpdated(element);
      expect(input.value).to.equal('3.3');

      element.value = new Date(2020, 9, 12, 15, 5, 5);
      await elementUpdated(element);
      expect(input.value).to.equal('12.10');

      element.displayFormat = 'd MMM';
      await elementUpdated(element);
      expect(input.value).to.equal('12 Oct');

      element.displayFormat = 'd MMMM';
      await elementUpdated(element);
      expect(input.value).to.equal('12 October');

      element.displayFormat = 'd MMMMM';
      await elementUpdated(element);
      expect(input.value).to.equal('12 O');

      element.displayFormat = 'd.MM.y';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10.2020');

      element.displayFormat = 'd.MM.yyy';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10.2020');

      //12H format
      element.displayFormat = 'd.MM hh:mm tt';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 03:05 PM');

      element.displayFormat = 'd.MM H:mm';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 15:05');

      element.value = new Date(2020, 9, 12, 12);
      element.displayFormat = 'd.MM hh:mm ttt';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 12:00 pm');

      element.displayFormat = 'd.MM hh:mm ttttt';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 12:00 p');

      element.displayFormat = 'd.MM hh:mm bbbb';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 12:00 noon');

      element.displayFormat = 'd.MM hh:mm bbbbb';
      await elementUpdated(element);
      expect(input.value).to.equal('12.10 12:00 n');
    });

    it('should update the mask according to the inputFormat on focus when value is set - issue #1320', async () => {
      element.inputFormat = 'dd-MM-yyyy';
      element.displayFormat = 'yyyy-MM-dd';
      element.value = new Date(2024, 6, 22);
      await elementUpdated(element);

      expect(input.value).to.equal('2024-07-22');

      input.click();
      await elementUpdated(element);

      expect(isFocused(element)).to.be.true;
      expect(input.value).to.equal('22-07-2024');
    });

    it('should emit igcChange on blur after an incomplete mask has been parsed - issue #1695', async () => {
      const eventSpy = spy(element, 'emitEvent');
      element.focus();
      await elementUpdated(element);

      simulateInput(input, {
        value: '0',
        inputType: 'insertText',
      });
      await elementUpdated(element);

      element.blur();
      await elementUpdated(element);

      expect(eventSpy).calledWith('igcChange');
      expect(input.value).to.deep.equal('1/1/2000');
    });

    it('should correctly switch between different pre-defined date formats', async () => {
      const targetDate = new Date(2020, 2, 3, 0, 0, 0, 0);

      let formattedDate = setDateFormat('short', targetDate);

      expect((element as any)._displayFormat).to.be.undefined;

      element.value = new Date(2020, 2, 3);
      element.displayFormat = 'short';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate);
      element.displayFormat = 'medium';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate);
      element.displayFormat = 'long';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate);
      element.displayFormat = 'full';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('short', targetDate, true, false);
      element.displayFormat = 'shortDate';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate, true, false);
      element.displayFormat = 'mediumDate';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate, true, false);
      element.displayFormat = 'longDate';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate, true, false);
      element.displayFormat = 'fullDate';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('short', targetDate, false, true);
      element.displayFormat = 'shortTime';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate, false, true);
      element.displayFormat = 'mediumTime';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate, false, true);
      element.displayFormat = 'longTime';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate, false, true);
      element.displayFormat = 'fullTime';
      await elementUpdated(element);
      expect(input.value).to.equal(formattedDate);
    });

    it('should clear input date on clear', async () => {
      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);
      expect(input.value).to.equal('3/3/2020');

      element.clear();
      await elementUpdated(element);
      expect(input.value).to.equal('');
    });

    it('set value attribute', async () => {
      const value = new Date(2020, 2, 3).toISOString();
      element.setAttribute('value', value);
      await elementUpdated(input);

      expect(element.value?.toISOString()).to.equal(value);
    });

    it('set value', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;
      await elementUpdated(element);

      expect(element.value).to.equal(value);
    });

    it('set value - time portion only', async () => {
      const target = new Date();
      target.setHours(14, 0, 0, 0);

      element.inputFormat = 'HH:mm';
      element.value = '14:00';
      await elementUpdated(element);

      expect(element.value?.valueOf()).to.equal(target.valueOf());

      // Invalid time portion
      element.value = '23:60';
      await elementUpdated(element);

      expect(element.value).to.be.null;
    });

    it('set value - string property binding', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value.toISOString();
      await elementUpdated(element);

      expect(element.value?.valueOf()).to.equal(value.valueOf());
    });

    it('stepUp should initialize new date if value is empty', async () => {
      const today = new Date();

      expect(input.value).to.equal('');

      element.stepUp();
      await elementUpdated(element);

      expect(element.value).to.not.be.null;
      expect(element.value?.setHours(0, 0, 0, 0)).to.equal(
        today.setHours(0, 0, 0, 0)
      );
    });

    it('stepDown should initialize new date if value is empty', async () => {
      const today = new Date();

      expect(input.value).to.equal('');

      element.stepDown();
      await elementUpdated(element);

      expect(element.value).to.not.be.null;
      expect(element.value!.setHours(0, 0, 0, 0)).to.equal(
        today.setHours(0, 0, 0, 0)
      );
    });

    it('should stepUp correctly', async () => {
      const value = new Date(2020, 2, 3, 0, 0, 0, 0);

      element.value = value;
      element.inputFormat = 'dd.MM.yyyy hh:mm';
      element.stepUp();
      await elementUpdated(element);
      expect(element.value!.getDate()).to.equal(value.getDate() + 1);

      element.inputFormat = 'MM.yy hh:mm';
      element.stepUp();
      await elementUpdated(element);
      expect(element.value!.getHours()).to.equal(value.getHours() + 1);

      element.inputFormat = 'MM.yy';
      element.stepUp();
      await elementUpdated(element);
      expect(element.value!.getMonth()).to.equal(value.getMonth() + 1);

      element.inputFormat = 'dd.MM.yy hh:mm:ss tt';
      element.stepUp(DatePart.Year);
      await elementUpdated(element);
      expect(element.value!.getFullYear()).to.equal(value.getFullYear() + 1);

      element.stepUp(DatePart.Minutes);
      await elementUpdated(element);
      expect(element.value!.getMinutes()).to.equal(value.getMinutes() + 1);

      element.stepUp(DatePart.Seconds);
      await elementUpdated(element);
      expect(element.value!.getSeconds()).to.equal(value.getSeconds() + 1);

      expect(input.value.indexOf('AM')).to.be.greaterThan(-1);
      expect(input.value.indexOf('PM')).to.equal(-1);

      element.stepUp(DatePart.AmPm);
      await elementUpdated(element);
      expect(input.value.indexOf('AM')).to.equal(-1);
      expect(input.value.indexOf('PM')).to.be.greaterThan(-1);
    });

    it('should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3, 1, 1, 1, 1);

      element.value = value;
      element.inputFormat = 'dd.MM.yyyy hh:mm';
      element.stepDown();
      await elementUpdated(element);
      expect(element.value!.getDate()).to.equal(value.getDate() - 1);

      element.inputFormat = 'MM.yy hh:mm';
      element.stepDown();
      await elementUpdated(element);
      expect(element.value!.getHours()).to.equal(value.getHours() - 1);

      element.inputFormat = 'MM.yy';
      element.stepDown();
      await elementUpdated(element);
      expect(element.value!.getMonth()).to.equal(value.getMonth() - 1);

      element.stepDown(DatePart.Year);
      await elementUpdated(element);
      expect(element.value!.getFullYear()).to.equal(value.getFullYear() - 1);

      element.stepDown(DatePart.Minutes);
      await elementUpdated(element);
      expect(element.value!.getMinutes()).to.equal(value.getMinutes() - 1);

      element.stepDown(DatePart.Seconds);
      await elementUpdated(element);
      expect(element.value!.getSeconds()).to.equal(value.getSeconds() - 1);
    });

    it('setRangeText()', async () => {
      const checkSelectionRange = (start: number, end: number) =>
        expect([start, end]).to.eql([input.selectionStart, input.selectionEnd]);

      const startDate = new Date(2024, 1, 15);

      element.value = startDate;
      element.inputFormat = 'MM/dd/yyyy';
      await elementUpdated(element);

      // No boundaries, from current user selection
      element.setSelectionRange(2, 2);
      element.setRangeText('03');
      await elementUpdated(element);

      checkDates(element.value, new Date(2024, 1, 3));
      checkSelectionRange(2, 2);

      // Keep passed selection range
      element.value = startDate;
      element.setRangeText('03', 0, 2, 'select');
      await elementUpdated(element);

      checkDates(element.value, new Date(2024, 2, 15));
      checkSelectionRange(0, 2);

      // Collapse range to start
      element.value = startDate;
      element.setRangeText('0303', 0, 4, 'start');
      await elementUpdated(element);

      checkDates(element.value, new Date(2024, 2, 3));
      checkSelectionRange(0, 0);

      // Collapse range to end
      element.value = startDate;
      element.setRangeText('1999', 5, 10, 'end');
      await elementUpdated(element);

      checkDates(element.value, new Date(1999, 1, 15));
      checkSelectionRange(10, 10);
    });

    it('should respect spinDelta', async () => {
      const value = new Date(2020, 2, 3);

      element.value = value;
      element.spinDelta = { date: 2, year: 10 };

      element.stepDown();
      await elementUpdated(element);

      expect(element.value?.getDate()).to.equal(value.getDate() - 2);

      element.stepDown(DatePart.Year);
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear() - 10);
    });

    it('mouse wheel should correctly step up/down', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;
      element.focus();
      await elementUpdated(element);

      simulateWheel(input, { deltaY: -125 });
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear() + 1);

      element.setSelectionRange(0, 0);

      simulateWheel(input, { deltaY: 125 });
      await elementUpdated(element);

      expect(element.value.getMonth()).to.equal(value.getMonth() - 1);
    });

    it('mouse wheel no focus', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;
      await elementUpdated(element);

      simulateWheel(input, { deltaY: -125 });
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear());
    });

    it('mouse wheel readonly', async () => {
      const value = new Date(2020, 2, 3);

      element.value = value;
      element.readOnly = true;

      element.focus();
      await elementUpdated(element);

      simulateWheel(input, { deltaY: -125 });
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear());
    });

    it('ArrowUp should stepUp correctly', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;

      element.focus();
      await elementUpdated(element);

      simulateKeyboard(input, arrowUp);
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear() + 1);
    });

    it('ArrowDown should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;

      element.focus();
      await elementUpdated(element);

      simulateKeyboard(input, arrowDown);
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.equal(value.getFullYear() - 1);
    });

    it('Up/Down arrow readonly is a no-op', async () => {
      const value = new Date(2020, 2, 3);
      element.readOnly = true;
      element.value = value;
      element.focus();
      await elementUpdated(element);

      const eventSpy = spy(element, 'emitEvent');

      simulateKeyboard(input, [altKey, arrowUp]);
      await elementUpdated(element);

      expect(eventSpy).not.to.have.been.called;

      simulateKeyboard(input, [altKey, arrowDown]);
      await elementUpdated(element);

      expect(eventSpy).not.to.have.been.called;
    });

    it('Alt + ArrowUp/Down is a no-op', async () => {
      const value = new Date(202, 2, 3);
      element.value = value;
      element.focus();
      await elementUpdated(element);

      const eventSpy = spy(element, 'emitEvent');

      simulateKeyboard(input, [altKey, arrowUp]);
      await elementUpdated(element);

      expect(eventSpy).not.to.have.been.called;

      simulateKeyboard(input, [altKey, arrowDown]);
      await elementUpdated(element);

      expect(eventSpy).not.to.have.been.called;
    });

    it('should not emit change event when readonly', async () => {
      const eventSpy = spy(element, 'emitEvent');

      element.value = new Date(2023, 5, 1);
      element.readOnly = true;
      element.focus();
      await elementUpdated(element);

      element.blur();
      await elementUpdated(element);

      expect(eventSpy.getCalls()).empty;
    });

    it('should not move input selection (caret) from a focused part when stepUp/stepDown are invoked', async () => {
      element.inputFormat = 'yyyy/MM/dd';
      element.value = new Date(2023, 5, 1);
      element.focus();
      await elementUpdated(element);

      // Year part
      element.setSelectionRange(0, 1);

      let start = input.selectionStart;
      let end = input.selectionEnd;

      element.stepDown();
      await elementUpdated(element);

      expect(element.value.getFullYear()).to.eq(2022);
      expect(input.selectionStart).to.eq(start);
      expect(input.selectionEnd).to.eq(end);

      // Month part
      element.setSelectionRange(5, 6);
      start = input.selectionStart;
      end = input.selectionEnd;

      element.stepUp();
      expect(element.value.getMonth()).to.eq(6);
      expect(input.selectionStart).to.eq(start);
      expect(input.selectionEnd).to.eq(end);
    });

    it('ArrowLeft/Right should navigate to the beginning/end of date section', async () => {
      const value = new Date(2020, 2, 3);
      element.value = value;
      element.focus();
      await elementUpdated(element);

      //Move selection to the beginning of 'year' part.
      simulateKeyboard(input, [ctrlKey, arrowLeft]);
      await elementUpdated(element);

      expect(input.selectionStart).to.equal(6);
      expect(input.selectionEnd).to.equal(6);

      //Move selection to the end of 'year' part.
      simulateKeyboard(input, [ctrlKey, arrowRight]);
      await elementUpdated(element);

      expect(input.selectionStart).to.equal(10);
      expect(input.selectionEnd).to.equal(10);
    });

    it('non filled parts have default value set on blur', async () => {
      element.inputFormat = 'dd.MM.yyyy';
      parser.mask = 'dd.MM.yyyy';

      element.focus();
      await elementUpdated(element);

      const value = '1010';
      simulateInput(input, { value, inputType: 'insertText' });
      await elementUpdated(element);

      //10.10.____
      const parse = parser.replace(input.value, value, 0, 3);
      expect(input.value).to.equal(parse.value);
      expect(element.value).to.be.null;

      element.blur();
      await elementUpdated(element);
      const parse2 = parser.parseDate(input.value);

      //10.10.2000
      expect(element.value?.setHours(0, 0, 0, 0)).to.equal(
        parse2?.setHours(0, 0, 0, 0)
      );
    });

    it('invalid date sets null value on blur', async () => {
      element.inputFormat = 'dd.MM.yyyy';
      element.focus();
      await elementUpdated(element);

      const value = '1099';
      simulateInput(input, { value, inputType: 'insertText' });
      await elementUpdated(element);

      //10.99.____
      const parse = parser.replace(input.value, value, 0, 3);
      expect(input.value).to.equal(parse.value);
      expect(element.value).to.be.null;

      element.blur();
      await elementUpdated(element);

      expect(element.value).to.be.null;
      expect(input.value).to.be.empty;
    });

    it('set value when input is complete', async () => {
      element.inputFormat = 'dd.MM.yyyy';
      parser.mask = 'dd.MM.yyyy';

      element.focus();
      await elementUpdated(element);

      const value = '10102020';
      simulateInput(input, { value, inputType: 'insertText' });
      await elementUpdated(element);

      //10.10.2020
      const parse = parser.replace(input.value, value, 0, 3);
      expect(input.value).to.equal(parse.value);

      const parse2 = parser.parseDate(input.value);

      expect(isValidDate(parse2)).to.be.true;

      //10.10.2000
      expect(element.value?.setHours(0, 0, 0, 0)).to.equal(
        parse2?.setHours(0, 0, 0, 0)
      );
    });

    it('set value to null when input is complete and invalid', async () => {
      element.inputFormat = 'dd.MM.yyyy';
      parser.mask = 'dd.MM.yyyy';

      element.focus();
      await elementUpdated(element);

      const value = '10992020';
      simulateInput(input, { value, inputType: 'insertText' });
      await elementUpdated(element);

      //10.99.2020
      const parse = parser.replace(input.value, value, 0, 3);
      expect(input.value).to.equal(parse.value);

      const parse2 = parser.parseDate(input.value);

      expect(isValidDate(parse2)).to.be.false;
      expect(element.value).to.be.null;
    });

    it('ctrl + ; should set date correctly', async () => {
      const today = new Date().setHours(0, 0, 0, 0);

      element.focus();
      await elementUpdated(element);

      expect(element.value).to.be.null;

      simulateKeyboard(input, [ctrlKey, ';']);
      await elementUpdated(element);

      expect(element.value).to.not.be.undefined;
      expect(element.value!.setHours(0, 0, 0, 0)).to.equal(today);
    });

    it('should respect spinLoop', async () => {
      const value = new Date(2020, 2, 31);

      element.value = value;
      element.spinLoop = false;

      simulateKeyboard(input, arrowUp);
      await elementUpdated(element);

      expect(element.value.getDate()).to.equal(value.getDate());

      element.spinLoop = true;

      simulateKeyboard(input, arrowUp);
      await elementUpdated(element);

      expect(element.value.getDate()).to.equal(1);
    });

    //check if needed
    it('dragEnter', async () => {
      input.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply());
    });

    //check if needed
    it('dragLeave without focus', async () => {
      input.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      await elementUpdated(element);

      expect(input.value).to.be.empty;
    });

    //check if needed
    it('dragLeave with focus', async () => {
      element.focus();
      input.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply());
    });

    it('Drop behavior', async () => {
      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);
      expect(input.value).to.equal('3/3/2020');

      input.value = '1010';
      input.setSelectionRange(0, 4);

      simulateInput(input, {
        skipValueProperty: true,
        inputType: 'insertFromDrop',
      });
      await elementUpdated(element);

      expect(input.value).to.equal('10/10/2020');
    });

    it('should respect min attribute', async () => {
      element.min = new Date(2020, 2, 3);
      element.value = new Date(2020, 1, 3);
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.false;
      ValidityHelpers.isValid(element).to.be.false;

      element.value = new Date(2021, 2, 3);
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.true;
      ValidityHelpers.isValid(element).to.be.true;
    });

    it('should respect max attribute', async () => {
      element.max = new Date(2020, 2, 3);
      element.value = new Date(2020, 3, 3);
      await elementUpdated(element);

      expect(element.checkValidity()).to.be.false;
      ValidityHelpers.isValid(element).to.be.false;

      element.value = new Date(2020, 1, 3);
      expect(element.checkValidity()).to.be.true;
      ValidityHelpers.isValid(element).to.be.true;
    });

    it('valid/invalid state with required', async () => {
      expect(element.reportValidity()).to.be.true;

      element.required = true;
      element.disabled = true;
      await elementUpdated(element);
      expect(element.reportValidity()).to.be.true;

      element.disabled = false;
      await elementUpdated(element);
      expect(element.reportValidity()).to.be.false;

      element.value = new Date(2020, 2, 3);
      await elementUpdated(element);
      expect(element.reportValidity()).to.be.true;
    });

    it('should emit events correctly', async () => {
      const eventSpy = spy(element, 'emitEvent');

      element.focus();
      await elementUpdated(element);
      expect(isFocused(element)).to.be.true;

      simulateKeyboard(input, arrowUp);
      await elementUpdated(element);

      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      simulateKeyboard(input, arrowDown);
      await elementUpdated(element);

      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      simulateWheel(input, { deltaY: -125 });
      await elementUpdated(element);
      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      element.blur();
      await elementUpdated(element);
      expect(isFocused(element)).to.be.false;
      expect(eventSpy).calledWith('igcChange');

      element.clear();
      await elementUpdated(element);

      //10.10.____
      const value = '1010';
      input.value = value;
      simulateInput(input, { value, inputType: 'insertText' });
      await elementUpdated(element);

      element.blur();
      await elementUpdated(element);
      expect(isFocused(element)).to.be.false;
      expect(eventSpy).calledWith('igcChange');
    });
  });

  const setDateFormat = (
    format: 'medium' | 'full' | 'long' | 'short' | undefined,
    date: Date,
    includeDate = true,
    includeTime = true
  ) => {
    const options: Intl.DateTimeFormatOptions = {};

    if (includeDate) {
      options.dateStyle = format;
    }

    if (includeTime) {
      options.timeStyle = format;
    }

    const formatter = new Intl.DateTimeFormat('en', options);

    return formatter.format(date);
  };

  describe('Form integration', () => {
    const today = CalendarDay.today;
    const spec = createFormAssociatedTestBed<IgcDateTimeInputComponent>(
      html`<igc-date-time-input name="date-time"></igc-date-time-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDateTimeInputComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', () => {
      spec.assertSubmitHasValue(null);
    });

    it('is associated on submit', () => {
      spec.setProperties({ value: today.native });
      spec.assertSubmitHasValue(today.native.toISOString());
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: today.native });

      spec.reset();
      expect(spec.element.value).to.be.null;
    });

    it('is correctly reset to the new default value after setAttribute() call', () => {
      spec.setAttributes({ value: today.native.toISOString() });
      spec.setProperties({ value: today.add('day', 180).native });

      spec.reset();

      expect(toCalendarDay(spec.element.value!).equalTo(today)).to.be.true;
      spec.assertSubmitHasValue(today.native.toISOString());
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();

      spec.setProperties({ value: new Date() });
      spec.assertSubmitPasses();
    });

    it('fulfils min value constraint', () => {
      spec.setProperties({ min: new Date(2026, 0, 1) });
      spec.assertSubmitPasses();

      spec.setProperties({ value: new Date(2022, 0, 1) });
      spec.assertSubmitFails();

      spec.setProperties({ value: new Date(2026, 0, 2) });
      spec.assertSubmitPasses();
    });

    it('fulfils min value constraint - string property binding', () => {
      spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      spec.setProperties({ value: new Date(2022, 0, 1).toISOString() });
      spec.assertSubmitFails();

      spec.setProperties({ value: new Date(2026, 0, 2).toISOString() });
      spec.assertSubmitPasses();
    });

    it('fulfils max value constraint', () => {
      spec.setProperties({ max: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();

      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      spec.setProperties({ value: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();
    });

    it('fulfils max value constraint - string property binding', () => {
      spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      spec.setProperties({ value: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });

  describe('defaultValue', () => {
    const today = CalendarDay.today;

    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcDateTimeInputComponent>(html`
        <igc-date-time-input
          name="date-time"
          .defaultValue=${today.native}
        ></igc-date-time-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDateTimeInputComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value?.toISOString()).to.equal(
          today.native.toISOString()
        );
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(today.native.toISOString());
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: today.add('day', 1).native });
        spec.reset();

        expect(spec.element.value?.toISOString()).to.equal(
          today.native.toISOString()
        );
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcDateTimeInputComponent>(html`
        <igc-date-time-input name="date-time"></igc-date-time-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDateTimeInputComponent.tagName);
      });

      it('fails required validation', () => {
        spec.setProperties({ required: true });
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation when updating defaultValue', () => {
        spec.setProperties({ required: true, defaultValue: today.native });
        spec.assertIsPristine();

        spec.assertSubmitPasses();
      });

      it('fails min validation', () => {
        spec.setProperties({
          min: today.native,
          defaultValue: today.add('day', -1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes min validation', () => {
        spec.setProperties({ min: today.native, defaultValue: today.native });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.add('day', 1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.native,
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const now = CalendarDay.today;
      const tomorrow = now.add('day', 1);
      const yesterday = now.add('day', -1);

      const testParameters: ValidationContainerTestsParams<IgcDateTimeInputComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          {
            slots: ['rangeOverflow'],
            props: { value: now.native, max: yesterday.native }, // range-overflow slot
          },
          {
            slots: ['rangeUnderflow'],
            props: { value: now.native, min: tomorrow.native }, // range-underflow slot
          },
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcDateTimeInputComponent, testParameters);
    });
  });
});

function checkDates(a: Date, b: Date) {
  expect(a.toISOString()).to.equal(b.toISOString());
}
