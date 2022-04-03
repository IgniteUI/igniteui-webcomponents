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

      el.displayFormat = 'yyyy';
      await elementUpdated(el);

      expect(input.value).to.equal('2020');
    });

    it('should clear input date on clear', async () => {
      el.value = new Date(2020, 2, 3);
      await elementUpdated(el);
      expect(input.value).to.equal('03/03/2020');

      el.clear();
      await elementUpdated(el);
      expect(input.value).to.equal('');
    });
  });

  const createDateInputComponent = (
    template = '<igc-date-input></igc-date-input>'
  ) => {
    return fixture<IgcDateInputComponent>(html`${unsafeStatic(template)}`);
  };
});
