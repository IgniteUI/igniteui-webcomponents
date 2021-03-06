import { html } from 'lit';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents } from '../../index.js';
import { MaskParser } from './mask-parser.js';
import IgcMaskInputComponent from './mask-input';
import IgcFormComponent from '../form/form';

describe('Masked input', () => {
  before(() => defineComponents(IgcMaskInputComponent, IgcFormComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultMask = 'CCCCCCCCCC';

  const syncParser = () => {
    parser.mask = masked.mask;
    parser.prompt = masked.prompt;
  };
  const input = () =>
    masked.shadowRoot!.querySelector('input') as HTMLInputElement;

  let masked: IgcMaskInputComponent;

  describe('Generic properties', async () => {
    beforeEach(async () => {
      masked = await fixture<IgcMaskInputComponent>(
        html`<igc-mask-input></igc-mask-input>`
      );
    });

    it('sensible default values', async () => {
      expect(masked.prompt).to.equal(defaultPrompt);
      expect(masked.mask).to.equal(defaultMask);
      expect(masked.value).to.equal('');
      expect(input().placeholder).to.equal(parser.escapedMask);
    });

    it('prompt character change (no value)', async () => {
      masked.prompt = '*';
      syncParser();

      await elementUpdated(masked);
      expect(input().placeholder).to.equal(parser.escapedMask);
    });

    it('prompt character change (value)', async () => {
      masked.value = '777';
      await elementUpdated(masked);

      masked.prompt = '*';
      syncParser();
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('mask change (no value)', async () => {
      masked.mask = 'CCCC';
      syncParser();

      await elementUpdated(masked);
      expect(input().placeholder).to.equal(parser.escapedMask);
    });

    it('mask change (value)', async () => {
      masked.value = '1111';
      await elementUpdated(masked);

      masked.mask = 'CC CC';
      syncParser();

      await elementUpdated(masked);
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('placeholder is updated correctly', async () => {
      const placeholder = 'Enter payment info';
      syncParser();

      masked.placeholder = placeholder;
      await elementUpdated(masked);

      expect(input().placeholder).to.equal(placeholder);

      masked.placeholder = '';
      await elementUpdated(masked);

      expect(input().placeholder).to.equal('');

      masked.placeholder = null as any;
      await elementUpdated(masked);

      expect(input().placeholder).to.equal(parser.escapedMask);
    });

    it('empty value without literals', async () => {
      expect(masked.value).to.equal('');
    });

    it('empty value with literals', async () => {
      masked.valueMode = 'withFormatting';
      syncParser();
      await elementUpdated(masked);

      expect(masked.value).to.equal('');
    });

    it('empty value and readonly on focus', async () => {
      masked.readonly = true;
      syncParser();
      await elementUpdated(masked);

      masked.focus();
      await elementUpdated(masked);

      expect(input().value).to.equal('');
    });

    it('get value without literals', async () => {
      masked.mask = '(CC) (CC)';
      masked.value = '1234';

      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
    });

    it('value with literals then value without', async () => {
      masked.mask = '(CC) (CC)';
      masked.value = '1234';
      masked.valueMode = 'withFormatting';

      await elementUpdated(masked);

      expect(masked.value).to.equal('(12) (34)');

      masked.valueMode = 'raw';
      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
    });

    it('invalid state is correctly reflected', async () => {
      masked.required = true;
      await elementUpdated(masked);

      expect(masked.reportValidity()).to.be.false;
      expect(masked.invalid).to.be.true;

      masked.required = false;
      await elementUpdated(masked);

      expect(masked.reportValidity()).to.be.true;
      expect(masked.invalid).to.be.false;

      // Disabled inputs are always valid
      masked.required = true;
      masked.disabled = true;
      await elementUpdated(masked);

      expect(masked.reportValidity()).to.be.true;
      expect(masked.invalid).to.be.false;
    });

    it('valid/invalid state based on mask pattern', async () => {
      masked.mask = '(####)';
      await elementUpdated(masked);

      masked.value = '111';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.false;

      masked.value = '2222';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.true;

      masked.mask = 'CCC';
      masked.value = '';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.true;

      masked.mask = 'CC &';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.true;

      masked.value = 'R';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.false;

      masked.value = '  R';
      await elementUpdated(masked);
      expect(masked.checkValidity()).to.be.true;
    });

    it('setCustomValidity', async () => {
      masked.setCustomValidity('Fill in the value');
      await elementUpdated(masked);

      expect(masked.invalid).to.be.true;

      masked.setCustomValidity('');
      await elementUpdated(masked);

      expect(masked.invalid).to.be.false;
    });

    it('setRangeText() method', async () => {
      masked.mask = '(CC) (CC)';
      masked.value = '1111';

      await elementUpdated(masked);
      syncParser();

      masked.setRangeText('22', 0, 2); // (22) (11)
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('2211');

      masked.value = '';
      await elementUpdated(masked);

      masked.setRangeText('xx', 0, 4);
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('xx');

      masked.value = 'xx';
      await elementUpdated(masked);

      masked.setRangeText('yy', 2, 5);
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('xyy');
    });

    it('igcChange event', async () => {
      syncParser();

      const eventSpy = sinon.spy(masked, 'emitEvent');
      masked.value = 'abc';
      await elementUpdated(masked);

      input().dispatchEvent(new Event('change'));
      expect(eventSpy).calledWith('igcChange', { detail: 'abc' });
    });

    it('igcChange event with literals', async () => {
      syncParser();

      const eventSpy = sinon.spy(masked, 'emitEvent');
      masked.value = 'abc';
      masked.valueMode = 'withFormatting';
      await elementUpdated(masked);

      input().dispatchEvent(new Event('change'));
      expect(eventSpy).calledWith('igcChange', {
        detail: parser.apply(masked.value),
      });
    });

    it('igcInput event', async () => {
      masked.mask = 'CCC';
      await elementUpdated(masked);
      syncParser();

      const eventSpy = sinon.spy(masked, 'emitEvent');
      masked.value = '111';
      masked.setSelectionRange(2, 3);
      await elementUpdated(masked);

      fireInputEvent(input(), 'insertText');
      expect(eventSpy).calledWith('igcInput', { detail: '111' });
    });

    it('igInput event (end of pattern)', async () => {
      masked.mask = 'CCC';
      await elementUpdated(masked);
      syncParser();

      const eventSpy = sinon.spy(masked, 'emitEvent');
      masked.value = '111';
      masked.setSelectionRange(3, 3);
      await elementUpdated(masked);

      fireInputEvent(input(), 'insertText');
      expect(eventSpy).not.calledWith('igcInput', { detail: '111' });
    });

    it('is accessible', async () => await expect(masked).to.be.accessible());

    it('focus updates underlying input mask', async () => {
      masked.focus();
      syncParser();

      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply());
    });

    it('blur updates underlying input mask (empty)', async () => {
      syncParser();

      masked.focus();
      await elementUpdated(masked);
      masked.blur();
      await elementUpdated(masked);

      expect(input().value).to.equal('');
    });

    it('blur updates underlying input mask (non-empty)', async () => {
      masked.mask = '[CC] CC CC';
      syncParser();

      masked.value;
      masked.focus();
      await elementUpdated(masked);
      masked.value = '654321';
      masked.blur();
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply('654321'));
    });

    it('drag enter without focus', async () => {
      syncParser();

      input().dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply());
    });

    it('drag enter with focus', async () => {
      syncParser();

      masked.focus();
      await elementUpdated(masked);

      input().dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('drag leave without focus', async () => {
      syncParser();

      input().dispatchEvent(new DragEvent('dragleave'));
      await elementUpdated(masked);

      expect(input().value).to.equal('');
    });

    it('drag leave with focus', async () => {
      masked.focus();
      await elementUpdated(masked);

      input().dispatchEvent(new DragEvent('dragleave'));
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Delete key behavior', async () => {
      masked.value = '1234';
      await elementUpdated(masked);
      masked.setSelectionRange(3, 4);

      fireKeyboardEvent(input(), 'keydown', { key: 'Delete' });
      fireInputEvent(input(), 'deleteContentForward');
      await elementUpdated(masked);

      expect(masked.value).to.equal('123');
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Backspace key behavior', async () => {
      masked.value = '1234';
      await elementUpdated(masked);
      masked.setSelectionRange(0, 1);

      fireKeyboardEvent(input(), 'keydown', { key: 'Backspace' });
      fireInputEvent(input(), 'deleteContentBackward');
      await elementUpdated(masked);

      expect(masked.value).to.equal('234');
      expect(input().value).to.equal(parser.apply(input().value));
    });

    it('Backspace key behavior with composition', async () => {
      masked.value = '1234';
      await elementUpdated(masked);

      masked.setSelectionRange(0, 1);

      fireKeyboardEvent(input(), 'keydown', { key: 'Backspace' });
      fireInputEvent(input(), 'deleteContentBackward', { isComposing: true });
      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Default input behavior', async () => {
      masked.value = 'xxxx';
      await elementUpdated(masked);

      masked.setSelectionRange(4, 4);
      input().value = masked.value + 'zz';
      fireInputEvent(input(), 'insertText');
      await elementUpdated(masked);

      expect(masked.value).to.equal('xxxxzz');
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Composition behavior', async () => {
      const data = '?????????????????????';
      masked.value = ' ';
      masked.mask = 'CCCC::###';

      await elementUpdated(masked);
      syncParser();

      masked.setSelectionRange(0, 0);
      fireCompositionEvent(input(), 'compositionstart');
      input().setSelectionRange(0, data.length);
      fireCompositionEvent(input(), 'compositionend', { data });
      await elementUpdated(masked);

      expect(masked.value).to.equal('????????????12');
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Cut behavior', async () => {
      masked.value = 'xxxyyyxxx';
      masked.mask = 'CCC-CCC-CCC';

      await elementUpdated(masked);
      syncParser();

      masked.setSelectionRange(4, 7);
      input().dispatchEvent(new ClipboardEvent('cut'));
      fireInputEvent(input(), 'deleteByCut');
      await elementUpdated(masked);

      expect(masked.value).to.equal('xxxxxx');
      expect(input().value).to.equal('xxx-___-xxx');
    });

    it('Paste behavior', async () => {
      masked.value = '111111';
      masked.mask = 'CCC::CCC';

      await elementUpdated(masked);
      syncParser();

      // Emulate paste behavior
      input().value = '112222';
      input().setSelectionRange(2, 8);

      fireInputEvent(input(), 'insertFromPaste');
      await elementUpdated(masked);
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Drop behavior', async () => {
      masked.mask = 'CCC::CCC';
      masked.value = '123456';

      await elementUpdated(masked);
      syncParser();

      // Emulate drop behavior
      input().value = '   abc';
      input().setSelectionRange(3, 8);

      fireInputEvent(input(), 'insertFromDrop');
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));

      // https://github.com/IgniteUI/igniteui-webcomponents/issues/383
      masked.mask = 'CC-CC';
      masked.value = 'xxyy';

      await elementUpdated(masked);
      syncParser();

      input().value = 'xx-basic-yy';
      input().setSelectionRange(3, 3 + `basic`.length);
      fireInputEvent(input(), 'insertFromDrop');
      await elementUpdated(masked);

      expect(masked.value).to.equal('xxba');
      expect(input().value).to.equal(parser.apply(masked.value));
    });
  });

  describe('igc-form interaction', async () => {
    let form: IgcFormComponent;

    beforeEach(async () => {
      form = await fixture<IgcFormComponent>(html`
        <igc-form>
          <igc-mask-input></igc-mask-input>
        </igc-form>
      `);
      masked = form.querySelector('igc-mask-input') as IgcMaskInputComponent;
    });

    it('empty non-required mask with required pattern position', async () => {
      masked.mask = '&&&';
      await elementUpdated(masked);

      expect(form.submit()).to.equal(true);
    });

    it('empty required mask with required pattern position', async () => {
      masked.mask = '&&&';
      masked.required = true;
      await elementUpdated(masked);

      expect(form.submit()).to.equal(false);
      expect(masked.invalid).to.equal(true);
    });

    it('non-empty non-required mask with required pattern positions', async () => {
      masked.mask = '&&CC';
      masked.value = 'F';
      await elementUpdated(masked);

      expect(form.submit()).to.equal(false);
      expect(masked.invalid).to.equal(true);
    });
  });
});

type KeyboardEventType = 'keydown' | 'keypress' | 'keyup';
type InputEventType =
  | 'insertText'
  | 'insertFromDrop'
  | 'insertFromPaste'
  | 'deleteContentForward'
  | 'deleteContentBackward'
  | 'deleteByCut';

type CompositionEventType = 'compositionstart' | 'compositionend';

const fireCompositionEvent = (
  target: HTMLElement,
  type: CompositionEventType,
  options: Partial<CompositionEventInit> = {}
) => target.dispatchEvent(new CompositionEvent(type, { ...options }));

const fireKeyboardEvent = (
  target: HTMLElement,
  type: KeyboardEventType,
  options: Partial<KeyboardEventInit> = {}
) => {
  target.dispatchEvent(new KeyboardEvent(type, { ...options }));
};

const fireInputEvent = (
  target: HTMLElement,
  type: InputEventType,
  options: Partial<InputEventInit> = {}
) => {
  target.dispatchEvent(
    new InputEvent('input', { inputType: type, ...options })
  );
};
