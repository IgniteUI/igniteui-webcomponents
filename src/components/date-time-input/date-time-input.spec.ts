import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

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
  FormAssociatedTestBed,
  simulateKeyboard,
} from '../common/utils.spec.js';
import { MaskParser } from '../mask-input/mask-parser.js';
import IgcDateTimeInputComponent from './date-time-input.js';
import { DatePart, type DatePartDeltas, DateTimeUtil } from './date-util.js';

describe('Date Time Input component', () => {
  before(() => defineComponents(IgcDateTimeInputComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultFormat = 'MM/dd/yyyy';

  let el: IgcDateTimeInputComponent;
  let input: HTMLInputElement;

  describe('', async () => {
    beforeEach(async () => {
      el = await createDateTimeInputComponent();
      input = el.shadowRoot!.querySelector('input') as HTMLInputElement;

      parser.prompt = defaultPrompt;
      parser.mask = '__/__/____';
    });

    it('should set default values correctly', async () => {
      expect(el.value).to.be.null;
      expect(el.prompt).to.equal(defaultPrompt);
      expect(el.inputFormat).to.equal(defaultFormat);
      expect(input.placeholder).to.equal(defaultFormat);
    });

    it('should update inputFormat with no value according to locale', async () => {
      el.locale = 'no';
      await elementUpdated(el);
      expect(el.placeholder).to.equal('dd.MM.yyyy');
      expect(el.inputFormat).to.equal('dd.MM.yyyy');
    });

    it('should update inputFormat with value according to locale', async () => {
      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(input.value).to.equal('03/03/2020');

      el.locale = 'no';
      await elementUpdated(el);
      expect(el.placeholder).to.equal('dd.MM.yyyy');
      expect(el.inputFormat).to.equal('dd.MM.yyyy');
      expect(input.value).to.equal('03.03.2020');
    });

    it('should use inputFormat if no displayFormat is defined - issue 1114', async () => {
      el.inputFormat = 'yyyy#MM#dd';
      await elementUpdated(el);

      expect(el.displayFormat).to.be.undefined;
      expect(input.placeholder).to.equal('yyyy#MM#dd');

      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);

      el.inputFormat = 'yyyy@MM@dd';
      await elementUpdated(el);

      expect(input.value).to.equal('2020@03@03');

      // displayFormats overwrites
      el.displayFormat = '-- yyyy -- MM -- dd --';
      await elementUpdated(el);

      expect(input.value).to.equal('-- 2020 -- 03 -- 03 --');

      // Reset
      el.displayFormat = undefined as any;
      await elementUpdated(el);

      expect(input.value).to.equal('2020@03@03');
    });

    it('should use displayFormat when defined', async () => {
      expect(el.displayFormat).to.be.undefined;

      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);

      expect(input.value).to.equal('03/03/2020');

      el.displayFormat = 'dd.MM/yyyy';
      await elementUpdated(el);
      expect(input.value).to.equal('03.03/2020');

      el.displayFormat = 'd.M';
      await elementUpdated(el);
      expect(input.value).to.equal('3.3');

      el.value = new Date(2020, 9, 12, 15, 5, 5);
      await elementUpdated(el);
      expect(input.value).to.equal('12.10');

      el.displayFormat = 'd MMM';
      await elementUpdated(el);
      expect(input.value).to.equal('12 Oct');

      el.displayFormat = 'd MMMM';
      await elementUpdated(el);
      expect(input.value).to.equal('12 October');

      el.displayFormat = 'd MMMMM';
      await elementUpdated(el);
      expect(input.value).to.equal('12 O');

      el.displayFormat = 'd.MM.y';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10.2020');

      el.displayFormat = 'd.MM.yyy';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10.2020');

      //12H format
      el.displayFormat = 'd.MM hh:mm tt';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10 03:05 PM');

      el.displayFormat = 'd.MM H:mm';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10 15:05');

      el.value = new Date(2020, 9, 12, 12);
      el.displayFormat = 'd.MM hh:mm ttt';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10 12:00 noon');

      el.displayFormat = 'd.MM hh:mm ttttt';
      await elementUpdated(el);
      expect(input.value).to.equal('12.10 12:00 n');
    });

    it('should correctly switch between different pre-defined date formats', async () => {
      const targetDate = new Date(2020, 2, 3, 0, 0, 0, 0);

      let formattedDate = setDateFormat('short', targetDate);

      expect(el.displayFormat).to.be.undefined;

      el.value = new Date(2020, 2, 3);
      el.displayFormat = 'short';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate);
      el.displayFormat = 'medium';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate);
      el.displayFormat = 'long';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate);
      el.displayFormat = 'full';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('short', targetDate, true, false);
      el.displayFormat = 'shortDate';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate, true, false);
      el.displayFormat = 'mediumDate';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate, true, false);
      el.displayFormat = 'longDate';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate, true, false);
      el.displayFormat = 'fullDate';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('short', targetDate, false, true);
      el.displayFormat = 'shortTime';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('medium', targetDate, false, true);
      el.displayFormat = 'mediumTime';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('long', targetDate, false, true);
      el.displayFormat = 'longTime';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);

      formattedDate = setDateFormat('full', targetDate, false, true);
      el.displayFormat = 'fullTime';
      await elementUpdated(el);
      expect(input.value).to.equal(formattedDate);
    });

    it('should clear input date on clear', async () => {
      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(input.value).to.equal('03/03/2020');

      el.clear();
      await elementUpdated(el);
      expect(input.value).to.equal('');
    });

    it('set value attribute', async () => {
      const value = new Date(2020, 2, 3).toISOString();
      el.setAttribute('value', value);
      await elementUpdated(input);

      expect(el.value?.toISOString()).to.equal(value);
    });

    it('set value', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      await elementUpdated(el);

      expect(el.value).to.equal(value);
    });

    it('stepUp should initialize new date if value is empty', async () => {
      const today = new Date();

      expect(input.value).to.equal('');

      el.stepUp();
      await elementUpdated(el);

      expect(el.value).to.not.be.null;
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(
        today.setHours(0, 0, 0, 0)
      );
    });

    it('stepDown should initialize new date if value is empty', async () => {
      const today = new Date();

      expect(input.value).to.equal('');

      el.stepDown();
      await elementUpdated(el);

      expect(el.value).to.not.be.null;
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(
        today.setHours(0, 0, 0, 0)
      );
    });

    it('should stepUp correctly', async () => {
      const value = new Date(2020, 2, 3, 0, 0, 0, 0);

      el.value = value;
      el.inputFormat = 'dd.MM.yyyy hh:mm';
      el.stepUp();
      await elementUpdated(el);
      expect(el.value!.getDate()).to.equal(value.getDate() + 1);

      el.inputFormat = 'MM.yy hh:mm';
      el.stepUp();
      await elementUpdated(el);
      expect(el.value!.getHours()).to.equal(value.getHours() + 1);

      el.inputFormat = 'MM.yy';
      el.stepUp();
      await elementUpdated(el);
      expect(el.value!.getMonth()).to.equal(value.getMonth() + 1);

      el.inputFormat = 'dd.MM.yy hh:mm:ss tt';
      el.stepUp(DatePart.Year);
      await elementUpdated(el);
      expect(el.value!.getFullYear()).to.equal(value.getFullYear() + 1);

      el.stepUp(DatePart.Minutes);
      await elementUpdated(el);
      expect(el.value!.getMinutes()).to.equal(value.getMinutes() + 1);

      el.stepUp(DatePart.Seconds);
      await elementUpdated(el);
      expect(el.value!.getSeconds()).to.equal(value.getSeconds() + 1);

      expect(input.value.indexOf('AM')).to.be.greaterThan(-1);
      expect(input.value.indexOf('PM')).to.equal(-1);

      el.stepUp(DatePart.AmPm);
      await elementUpdated(el);
      expect(input.value.indexOf('AM')).to.equal(-1);
      expect(input.value.indexOf('PM')).to.be.greaterThan(-1);
    });

    it('should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3, 1, 1, 1, 1);

      el.value = value;
      el.inputFormat = 'dd.MM.yyyy hh:mm';
      el.stepDown();
      await elementUpdated(el);
      expect(el.value!.getDate()).to.equal(value.getDate() - 1);

      el.inputFormat = 'MM.yy hh:mm';
      el.stepDown();
      await elementUpdated(el);
      expect(el.value!.getHours()).to.equal(value.getHours() - 1);

      el.inputFormat = 'MM.yy';
      el.stepDown();
      await elementUpdated(el);
      expect(el.value!.getMonth()).to.equal(value.getMonth() - 1);

      el.stepDown(DatePart.Year);
      await elementUpdated(el);
      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 1);

      el.stepDown(DatePart.Minutes);
      await elementUpdated(el);
      expect(el.value!.getMinutes()).to.equal(value.getMinutes() - 1);

      el.stepDown(DatePart.Seconds);
      await elementUpdated(el);
      expect(el.value!.getSeconds()).to.equal(value.getSeconds() - 1);
    });

    it('setRangeText()', async () => {
      const checkSelectionRange = (start: number, end: number) =>
        expect([start, end]).to.eql([input.selectionStart, input.selectionEnd]);
      const checkDates = (a: Date, b: Date) =>
        expect(a.toISOString()).to.equal(b.toISOString());

      const startDate = new Date(2024, 1, 15);

      el.value = startDate;
      el.inputFormat = 'MM/dd/yyyy';
      await elementUpdated(el);

      // No boundaries, from current user selection
      el.setSelectionRange(2, 2);
      el.setRangeText('03');
      await elementUpdated(el);

      checkDates(el.value, new Date(2024, 1, 3));
      checkSelectionRange(2, 2);

      // Keep passed selection range
      el.value = startDate;
      el.setRangeText('03', 0, 2, 'select');
      await elementUpdated(el);

      checkDates(el.value, new Date(2024, 2, 15));
      checkSelectionRange(0, 2);

      // Collapse range to start
      el.value = startDate;
      el.setRangeText('0303', 0, 4, 'start');
      await elementUpdated(el);

      checkDates(el.value, new Date(2024, 2, 3));
      checkSelectionRange(0, 0);

      // Collapse range to end
      el.value = startDate;
      el.setRangeText('1999', 5, 10, 'end');
      await elementUpdated(el);

      checkDates(el.value, new Date(1999, 1, 15));
      checkSelectionRange(10, 10);
    });

    it('should respect spinDelta', async () => {
      const spinDelta: DatePartDeltas = {
        date: 2,
        year: 10,
      };

      const value = new Date(2020, 2, 3);

      el.value = value;
      el.spinDelta = spinDelta;

      el.stepDown();
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(value.getDate() - 2);

      el.stepDown(DatePart.Year);
      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 10);
    });

    it('mouse wheel should correctly step up/down', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      el.focus();
      await elementUpdated(el);

      input.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -125, bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value.getFullYear()).to.equal(value.getFullYear() + 1);

      el.setSelectionRange(0, 0);

      input.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 125, bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value.getMonth()).to.equal(value.getMonth() - 1);
    });

    it('mouse wheel no focus', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      await elementUpdated(el);

      input.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -125, bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value.getFullYear()).to.equal(value.getFullYear());
    });

    it('mouse wheel readonly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      el.readOnly = true;
      el.focus();
      await elementUpdated(el);

      input.dispatchEvent(new WheelEvent('wheel', { deltaY: -125 }));
      await elementUpdated(el);

      expect(el.value.getFullYear()).to.equal(value.getFullYear());
    });

    it('ArrowUp should stepUp correctly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.focus();
      await elementUpdated(el);

      simulateKeyboard(input, arrowUp);
      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() + 1);
    });

    it('ArrowDown should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.focus();
      await elementUpdated(el);

      simulateKeyboard(input, arrowDown);
      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 1);
    });

    it('Up/Down arrow readonly is a no-op', async () => {
      const value = new Date(2020, 2, 3);
      el.readOnly = true;
      el.value = value;
      el.focus();
      await elementUpdated(el);

      const eventSpy = spy(el, 'emitEvent');

      simulateKeyboard(input, [altKey, arrowUp]);
      await elementUpdated(el);

      expect(eventSpy).not.to.have.been.called;

      simulateKeyboard(input, [altKey, arrowDown]);
      await elementUpdated(el);

      expect(eventSpy).not.to.have.been.called;
    });

    it('Alt + ArrowUp/Down is a no-op', async () => {
      const value = new Date(202, 2, 3);
      el.value = value;
      el.focus();
      await elementUpdated(el);

      const eventSpy = spy(el, 'emitEvent');

      simulateKeyboard(input, [altKey, arrowUp]);
      await elementUpdated(el);

      expect(eventSpy).not.to.have.been.called;

      simulateKeyboard(input, [altKey, arrowDown]);
      await elementUpdated(el);

      expect(eventSpy).not.to.have.been.called;
    });

    it('should not emit change event when readonly', async () => {
      const eventSpy = spy(el, 'emitEvent');

      el.value = new Date(2023, 5, 1);
      el.readOnly = true;
      el.focus();
      await elementUpdated(el);

      el.blur();
      await elementUpdated(el);

      // -> [igcFocus, igcBlur]
      expect(eventSpy.getCalls()).lengthOf(2);
    });

    it('should not move input selection (caret) from a focused part when stepUp/stepDown are invoked', async () => {
      el.inputFormat = 'yyyy/MM/dd';
      el.value = new Date(2023, 5, 1);
      el.focus();
      await elementUpdated(el);

      // Year part
      el.setSelectionRange(0, 1);

      let start = input.selectionStart;
      let end = input.selectionEnd;

      el.stepDown();
      await elementUpdated(el);

      expect(el.value.getFullYear()).to.eq(2022);
      expect(input.selectionStart).to.eq(start);
      expect(input.selectionEnd).to.eq(end);

      // Month part
      el.setSelectionRange(5, 6);
      start = input.selectionStart;
      end = input.selectionEnd;

      el.stepUp();
      expect(el.value.getMonth()).to.eq(6);
      expect(input.selectionStart).to.eq(start);
      expect(input.selectionEnd).to.eq(end);
    });

    it('ArrowLeft/Right should navigate to the beginning/end of date section', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      el.focus();
      await elementUpdated(el);

      //Move selection to the beginning of 'year' part.
      simulateKeyboard(input, [ctrlKey, arrowLeft]);
      await elementUpdated(el);

      expect(input.selectionStart).to.equal(6);
      expect(input.selectionEnd).to.equal(6);

      //Move selection to the end of 'year' part.
      simulateKeyboard(input, [ctrlKey, arrowRight]);
      await elementUpdated(el);

      expect(input.selectionStart).to.equal(10);
      expect(input.selectionEnd).to.equal(10);
    });

    it('non filled parts have default value set on blur', async () => {
      el.inputFormat = 'dd.MM.yyyy';
      const parts = DateTimeUtil.parseDateTimeFormat(el.inputFormat);

      el.focus();
      await elementUpdated(el);

      const val = '1010';
      input.value = val;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      await elementUpdated(el);

      //10.10.____
      const parse = parser.replace(input.value, val, 0, 3);
      expect(input.value).to.equal(parse.value);
      expect(el.value).to.be.null;

      el.blur();
      await elementUpdated(el);
      const parse2 = DateTimeUtil.parseValueFromMask(
        input.value,
        parts,
        el.prompt
      );

      //10.10.2000
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(
        parse2!.setHours(0, 0, 0, 0)
      );
    });

    it('invalid date sets null value on blur', async () => {
      el.inputFormat = 'dd.MM.yyyy';
      el.focus();
      await elementUpdated(el);

      const val = '1099';
      input.value = val;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      await elementUpdated(el);

      //10.99.____
      const parse = parser.replace(input.value, val, 0, 3);
      expect(input.value).to.equal(parse.value);
      expect(el.value).to.be.null;

      el.blur();
      await elementUpdated(el);

      expect(el.value).to.be.null;
      expect(input.value).to.equal('');
    });

    it('set value when input is complete', async () => {
      el.inputFormat = 'dd.MM.yyyy';
      const parts = DateTimeUtil.parseDateTimeFormat(el.inputFormat);

      el.focus();
      await elementUpdated(el);

      const val = '10102020';
      input.value = val;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      await elementUpdated(el);

      //10.10.2020
      const parse = parser.replace(input.value, val, 0, 3);
      expect(input.value).to.equal(parse.value);

      const parse2 = DateTimeUtil.parseValueFromMask(
        input.value,
        parts,
        el.prompt
      );

      expect(DateTimeUtil.isValidDate(parse2)).to.be.true;

      //10.10.2000
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(
        parse2!.setHours(0, 0, 0, 0)
      );
    });

    it('set value to null when input is complete and invalid', async () => {
      el.inputFormat = 'dd.MM.yyyy';
      const parts = DateTimeUtil.parseDateTimeFormat(el.inputFormat);

      el.focus();
      await elementUpdated(el);

      const val = '10992020';
      input.value = val;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      await elementUpdated(el);

      //10.99.2020
      const parse = parser.replace(input.value, val, 0, 3);
      expect(input.value).to.equal(parse.value);

      const parse2 = DateTimeUtil.parseValueFromMask(
        input.value,
        parts,
        el.prompt
      );

      expect(DateTimeUtil.isValidDate(parse2)).to.be.false;
      expect(el.value).to.be.null;
    });

    it('ctrl + ; should set date correctly', async () => {
      const today = new Date().setHours(0, 0, 0, 0);

      el.focus();
      await elementUpdated(el);

      expect(el.value).to.be.null;

      simulateKeyboard(input, [ctrlKey, ';']);
      await elementUpdated(el);

      expect(el.value).to.not.be.undefined;
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(today);
    });

    it('should respect spinLoop', async () => {
      const value = new Date(2020, 2, 31);

      el.value = value;
      el.spinLoop = false;

      simulateKeyboard(input, 'ArrowUp');
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(value.getDate());

      el.spinLoop = true;

      simulateKeyboard(input, 'ArrowUp');
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(1);
    });

    //check if needed
    it('dragEnter', async () => {
      input.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
      await elementUpdated(el);

      expect(input.value).to.equal(parser.apply());
    });

    //check if needed
    it('dragLeave without focus', async () => {
      input.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      await elementUpdated(el);

      expect(input.value).to.equal('');
    });

    //check if needed
    it('dragLeave with focus', async () => {
      el.focus();
      input.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      await elementUpdated(el);

      expect(input.value).to.equal(parser.apply());
    });

    it('Drop behavior', async () => {
      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(input.value).to.equal('03/03/2020');

      input.value = '1010';
      input.setSelectionRange(0, 4);

      input.dispatchEvent(
        new InputEvent('input', { inputType: 'insertFromDrop' })
      );
      await elementUpdated(el);

      expect(input.value).to.equal('10/10/2020');
    });

    it('should respect min attribute', async () => {
      el.min = new Date(2020, 2, 3);
      el.value = new Date(2020, 1, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2021, 2, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.true;
      expect(el.invalid).to.be.false;
    });

    it('should respect max attribute', async () => {
      el.max = new Date(2020, 2, 3);
      el.value = new Date(2020, 3, 3);
      await elementUpdated(el);

      expect(el.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2020, 1, 3);
      expect(el.checkValidity()).to.be.true;
      expect(el.invalid).to.be.false;
    });

    it('should correctly set min/maxValue with ISO string', async () => {
      const minValue = new Date(2020, 2, 3).toISOString();
      const maxValue = new Date(2020, 3, 3).toISOString();

      el.setAttribute('min-value', minValue);
      el.setAttribute('max-value', maxValue);

      el.value = new Date(2019, 3, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2021, 3, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2020, 2, 14);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.true;
      expect(el.invalid).to.be.false;
    });

    it('valid/invalid state with required', async () => {
      expect(el.reportValidity()).to.be.true;

      el.required = true;
      el.disabled = true;
      await elementUpdated(el);
      expect(el.reportValidity()).to.be.true;

      el.disabled = false;
      await elementUpdated(el);
      expect(el.reportValidity()).to.be.false;

      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(el.reportValidity()).to.be.true;
    });

    it('should emit events correctly', async () => {
      const eventSpy = spy(el, 'emitEvent');

      el.focus();
      await elementUpdated(el);
      expect(eventSpy).calledOnceWithExactly('igcFocus');
      eventSpy.resetHistory();

      simulateKeyboard(input, arrowUp);
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      simulateKeyboard(input, arrowDown);
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      input.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -125, bubbles: true })
      );
      await elementUpdated(el);
      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      el.blur();
      await elementUpdated(el);
      expect(eventSpy).calledWith('igcChange');
      expect(eventSpy).calledWith('igcBlur');

      el.clear();
      await elementUpdated(el);

      //10.10.____
      const val = '1010';
      input.value = val;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      await elementUpdated(el);

      el.blur();
      await elementUpdated(el);
      expect(eventSpy).calledWith('igcChange');
      expect(eventSpy).calledWith('igcBlur');
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

  const createDateTimeInputComponent = (
    template = '<igc-date-time-input></igc-date-time-input>'
  ) => {
    return fixture<IgcDateTimeInputComponent>(html`${unsafeStatic(template)}`);
  };

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcDateTimeInputComponent>(
      html`<igc-date-time-input name="dt"></igc-date-time-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDateTimeInputComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', async () => {
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value.toISOString()
      );
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.be.null;
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', async () => {
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils min value constraint', async () => {
      spec.element.min = new Date(2025, 0, 1);
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2022, 0, 1);
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2025, 0, 2);
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils max value constraint', async () => {
      spec.element.max = new Date(2020, 0, 1);
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2020, 0, 1);
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });
});
