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
import { DateParts, DatePartDeltas } from './date-util';

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
      input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    });

    it('should set default values correctly', async () => {
      expect(el.prompt).to.equal(defaultPrompt);
      expect(el.mask).to.equal(defaultMask);
      expect(el.value).to.be.undefined;
      expect(input.placeholder).to.equal(defaultPlaceholder);
    });

    it('prompt character change (no value)', async () => {
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

    it('should update mask according to locale', async () => {
      expect(el.placeholder).to.equal('MM/dd/yyyy');
      expect(el.mask).to.equal(defaultMask);

      el.locale = 'no';
      await elementUpdated(el);
      expect(el.placeholder).to.equal('dd.MM.yyyy');
      expect(el.mask).to.equal('00.00.0000');
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
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.stepUp();
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(value.getDate() + 1);

      el.stepUp(DateParts.Month);
      await elementUpdated(el);

      expect(el.value!.getMonth()).to.equal(value.getMonth() + 1);
    });

    it('should stepDown correctly', async () => {
      const value = new Date(2020, 2, 3);
      el.value = value;

      el.stepDown();
      await elementUpdated(el);

      expect(el.value!.getDate()).to.equal(value.getDate() - 1);

      el.stepDown(DateParts.Month);
      await elementUpdated(el);

      expect(el.value!.getMonth()).to.equal(value.getMonth() - 1);
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

      el.stepDown(DateParts.Year);
      await elementUpdated(el);

      expect(el.value!.getFullYear()).to.equal(value.getFullYear() - 10);
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
  });

  const createDateInputComponent = (
    template = '<igc-date-input></igc-date-input>'
  ) => {
    return fixture<IgcDateInputComponent>(html`${unsafeStatic(template)}`);
  };
});
