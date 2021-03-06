import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents';
import { MaskParser } from '../mask-input/mask-parser';
import IgcDateTimeInputComponent from './date-time-input';
import { DatePart, DatePartDeltas, DateTimeUtil } from './date-util';

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
      expect(el.value).to.be.undefined;
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

      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -125, bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value.getFullYear()).to.equal(value.getFullYear() + 1);

      el.setSelectionRange(0, 0);

      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 125, bubbles: true }));

      await elementUpdated(el);

      expect(el.value.getMonth()).to.equal(value.getMonth() - 1);
    });

    it('mouse wheel no focus', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      await elementUpdated(el);

      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -125, bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value.getFullYear()).to.equal(value.getFullYear());
    });

    it('ArrowUp should stepUp correctly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.focus();
      await elementUpdated(el);

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() + 1);
    });

    it('ArrowDown should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.focus();
      await elementUpdated(el);

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );

      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 1);
    });

    it('ArrowLeft/Right should navigate to the beginning/end of date section', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;
      el.focus();
      await elementUpdated(el);

      //Move selection to the beginning of 'year' part.
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          ctrlKey: true,
          bubbles: true,
        })
      );

      await elementUpdated(el);

      expect(input.selectionStart).to.equal(6);
      expect(input.selectionEnd).to.equal(6);

      //Move selection to the end of 'year' part.
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          ctrlKey: true,
          bubbles: true,
        })
      );

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

      expect(el.value).to.be.undefined;

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: ';', bubbles: true, ctrlKey: true })
      );

      await elementUpdated(el);

      expect(el.value).to.not.be.undefined;
      expect(el.value!.setHours(0, 0, 0, 0)).to.equal(today);
    });

    it('should respect spinLoop', async () => {
      const value = new Date(2020, 2, 31);

      el.value = value;
      el.spinLoop = false;

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(value.getDate());

      el.spinLoop = true;

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );
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

    it('should respect minValue', async () => {
      el.minValue = new Date(2020, 2, 3);
      el.value = new Date(2020, 1, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2021, 2, 3);
      await elementUpdated(el);
      expect(el.checkValidity()).to.be.true;
      expect(el.invalid).to.be.false;
    });

    it('should respect maxValue', async () => {
      el.maxValue = new Date(2020, 2, 3);
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
      const eventSpy = sinon.spy(el, 'emitEvent');

      el.focus();
      await elementUpdated(el);
      expect(eventSpy).calledOnceWithExactly('igcFocus');
      eventSpy.resetHistory();

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );
      await elementUpdated(el);
      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      await elementUpdated(el);
      expect(eventSpy).calledWith('igcInput');
      eventSpy.resetHistory();

      el.dispatchEvent(
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
      options['dateStyle'] = format;
    }

    if (includeTime) {
      options['timeStyle'] = format;
    }

    const formatter = new Intl.DateTimeFormat('en', options);

    return formatter.format(date);
  };

  const createDateTimeInputComponent = (
    template = '<igc-date-time-input></igc-date-time-input>'
  ) => {
    return fixture<IgcDateTimeInputComponent>(html`${unsafeStatic(template)}`);
  };
});
