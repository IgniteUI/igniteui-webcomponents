import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents';
import { MaskParser } from '../masked-input/mask-parser';
import IgcDateInputComponent from './date-input';
import { DatePart, DatePartDeltas, DateTimeUtil } from './date-util';

//TODO Add all tests.
describe('Date Input component', () => {
  before(() => defineComponents(IgcDateInputComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultMask = '00/00/0000';
  const defaultPlaceholder = 'MM/dd/yyyy';

  let el: IgcDateInputComponent;
  let input: HTMLInputElement;

  describe('', async () => {
    beforeEach(async () => {
      el = await createDateInputComponent();
      input = el.shadowRoot!.querySelector('input') as HTMLInputElement;

      parser.prompt = defaultPrompt;
      parser.mask = '__/__/____';
    });

    it('should set default values correctly', async () => {
      expect(el.prompt).to.equal(defaultPrompt);
      expect(el.mask).to.equal(defaultMask);
      expect(el.value).to.be.undefined;
      expect(input.placeholder).to.equal(defaultPlaceholder);
    });

    it('prompt character change (no value)', async () => {
      el.prompt = '';
      await elementUpdated(el);
      expect(el.prompt).to.equal(parser.prompt);

      el.prompt = '*';
      parser.prompt = el.prompt;
      parser.mask = el.mask;
      await elementUpdated(el);

      el.focus();
      await elementUpdated(el);

      expect(input.value).to.equal(parser.apply());
    });

    it('should update mask according to the input format', async () => {
      el.inputFormat = 'd/M/yy';
      await elementUpdated(el);
      expect(el.mask).to.equal('00/00/00');

      el.inputFormat = 'dd-MM-yyyy HH:mm:ss';
      await elementUpdated(el);
      expect(el.mask).to.equal('00-00-0000 00:00:00');
    });

    it('should update mask with no value according to locale', async () => {
      expect(el.placeholder).to.equal('MM/dd/yyyy');
      expect(el.mask).to.equal(defaultMask);

      el.locale = 'no';
      await elementUpdated(el);
      expect(el.placeholder).to.equal('dd.MM.yyyy');
      expect(el.mask).to.equal('00.00.0000');
    });

    it('should update mask with value according to locale', async () => {
      expect(el.placeholder).to.equal('MM/dd/yyyy');
      expect(el.mask).to.equal(defaultMask);

      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(input.value).to.equal('03/03/2020');

      el.locale = 'no';
      await elementUpdated(el);
      expect(el.placeholder).to.equal('dd.MM.yyyy');
      expect(el.mask).to.equal('00.00.0000');
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
    });

    it('should correctly swtich between different pre-defined date formats', async () => {
      const targetDate = new Date(2020, 2, 3, 0, 0, 0, 0);

      const shortDate = setDateFormat('short', targetDate);

      expect(el.displayFormat).to.be.undefined;

      el.value = new Date(2020, 2, 3);
      el.displayFormat = 'short';
      await elementUpdated(el);

      expect(input.value).to.equal(shortDate);

      const mediumDate = setDateFormat('medium', targetDate);

      el.displayFormat = 'medium';
      await elementUpdated(el);

      expect(input.value).to.equal(mediumDate);

      const longDate = setDateFormat('long', targetDate);

      el.displayFormat = 'long';
      await elementUpdated(el);

      expect(input.value).to.equal(longDate);

      const fullDate = setDateFormat('full', targetDate);

      el.displayFormat = 'full';
      await elementUpdated(el);

      expect(input.value).to.equal(fullDate);
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
      expect(el.value!.getFullYear()).to.equal(value.getFullYear() + 1);

      el.inputFormat = 'dd.MM.yy hh:mm:ss tt';
      el.stepUp(DatePart.Month);
      await elementUpdated(el);
      expect(el.value!.getMonth()).to.equal(value.getMonth() + 1);

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
      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 1);

      el.stepDown(DatePart.Month);
      await elementUpdated(el);
      expect(el.value!.getMonth()).to.equal(value.getMonth() - 1);

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

    it('ArrowDown should stepUp correctly', async () => {
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

      expect(el.value).to.be.undefined;

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

    // it('Drop behavior', async () => {
    //   input.value = '1010';
    //   input.setSelectionRange(0, 3);
    //   await elementUpdated(el);

    //   input.dispatchEvent(
    //     new InputEvent('input', { inputType: 'insertFromDrop' })
    //   );
    //   el.focus();
    //   await elementUpdated(el);

    //   expect(input.value).to.equal('10/10/____');
    // });

    it('should respect minValue', async () => {
      el.minValue = new Date(2020, 2, 3);
      el.value = new Date(2020, 1, 3);
      await elementUpdated(el);
      expect(input.checkValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2021, 2, 3);
      await elementUpdated(el);
      expect(el.invalid).to.be.false;
    });

    it('should respect maxValue', async () => {
      el.maxValue = new Date(2020, 2, 3);
      el.value = new Date(2020, 3, 3);
      await elementUpdated(el);

      expect(input.reportValidity()).to.be.false;
      expect(el.invalid).to.be.true;

      el.value = new Date(2020, 1, 3);
      expect(el.invalid).to.be.false;
    });
  });

  const setDateFormat = (
    format: 'medium' | 'full' | 'long' | 'short' | undefined,
    date: Date
  ) => {
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: format,
      timeStyle: format,
    };
    const formatter = new Intl.DateTimeFormat('en', options);

    return formatter.format(date);
  };

  const createDateInputComponent = (
    template = '<igc-date-input></igc-date-input>'
  ) => {
    return fixture<IgcDateInputComponent>(html`${unsafeStatic(template)}`);
  };
});
