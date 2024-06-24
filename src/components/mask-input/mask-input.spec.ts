import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { spy } from 'sinon';

import { defineComponents } from '../../index.js';
import { FormAssociatedTestBed } from '../common/utils.spec.js';
import IgcFormComponent from '../form/form.js';
import IgcMaskInputComponent from './mask-input.js';
import { MaskParser } from './mask-parser.js';

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
      const checkSelectionRange = (start: number, end: number) =>
        expect([start, end]).to.eql([
          input().selectionStart,
          input().selectionEnd,
        ]);

      masked.mask = '(CC) (CC)';
      masked.value = '1111';

      await elementUpdated(masked);
      syncParser();

      // No boundaries, from current user selection
      masked.setSelectionRange(2, 2);
      await elementUpdated(masked);
      masked.setRangeText('22'); // (12) (21)
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('1221');
      checkSelectionRange(2, 2);

      // Keep passed selection range
      masked.value = '1111';
      masked.setRangeText('22', 0, 2, 'select'); // (22) (11)
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('2211');
      checkSelectionRange(0, 2);

      // Collapse range to start
      masked.value = '';
      masked.setRangeText('xx', 0, 4, 'start');
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('xx');
      checkSelectionRange(0, 0);

      // Collapse range to end
      masked.value = 'xx';
      masked.setRangeText('yy', 2, 5, 'end');
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
      expect(masked.value).to.equal('xyy');
      checkSelectionRange(5, 5);
    });

    it('igcChange event', async () => {
      syncParser();

      const eventSpy = spy(masked, 'emitEvent');
      masked.value = 'abc';
      await elementUpdated(masked);

      input().dispatchEvent(new Event('change'));
      expect(eventSpy).calledWith('igcChange', { detail: 'abc' });
    });

    it('igcChange event with literals', async () => {
      syncParser();

      const eventSpy = spy(masked, 'emitEvent');
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

      const eventSpy = spy(masked, 'emitEvent');
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

      const eventSpy = spy(masked, 'emitEvent');
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

    it('Delete key behavior - skip literals', async () => {
      masked.mask = 'CC--CCC---CC';
      masked.value = '1234567';
      // value: 12--345---67
      await elementUpdated(masked);

      // value: 12--345---67
      masked.setSelectionRange(1, 1);
      fireKeyboardEvent(input(), 'keydown', { key: 'Delete' });
      fireInputEvent(input(), 'deleteContentForward');
      // value: 1_--345---67
      await elementUpdated(masked);

      fireKeyboardEvent(input(), 'keydown', { key: 'Delete' });
      fireInputEvent(input(), 'deleteContentForward');
      // value: 1_--_45---67
      await elementUpdated(masked);

      expect(input().value).to.equal('1_--_45---67');
      expect(masked.value).to.equal('14567');
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

    it('Backspace key behavior - skip literals', async () => {
      masked.mask = 'CC--CCC---CC';
      masked.value = '1234567';
      // value: 12--345---67
      await elementUpdated(masked);

      masked.setSelectionRange(4, 5);
      fireKeyboardEvent(input(), 'keydown', { key: 'Backspace' });
      fireInputEvent(input(), 'deleteContentBackward');
      // value: 12--_45---67
      await elementUpdated(masked);

      // Emulate range shift on multiple backspace presses as
      // it is not correctly reflected in test environment
      masked.setSelectionRange(3, 4);
      fireKeyboardEvent(input(), 'keydown', { key: 'Backspace' });
      fireInputEvent(input(), 'deleteContentBackward');
      // value: 1_--_45---67
      await elementUpdated(masked);

      expect(input().value).to.equal('1_--_45---67');
      expect(masked.value).to.equal('14567');
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
      input().value = `${masked.value}zz`;
      fireInputEvent(input(), 'insertText');
      await elementUpdated(masked);

      expect(masked.value).to.equal('xxxxzz');
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('Composition behavior', async () => {
      const data = 'ときょお１２や';
      masked.value = ' ';
      masked.mask = 'CCCC::###';

      await elementUpdated(masked);
      syncParser();

      masked.setSelectionRange(0, 0);
      fireCompositionEvent(input(), 'compositionstart');
      input().setSelectionRange(0, data.length);
      fireCompositionEvent(input(), 'compositionend', { data });
      await elementUpdated(masked);

      expect(masked.value).to.equal('ときょお12');
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
      input().setSelectionRange(3, 3 + 'basic'.length);
      fireInputEvent(input(), 'insertFromDrop');
      await elementUpdated(masked);

      expect(masked.value).to.equal('xxba');
      expect(input().value).to.equal(parser.apply(masked.value));
    });
  });

  // TODO: Remove after igc-form removal
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

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcMaskInputComponent>(
      html`<igc-mask-input name="mask"></igc-mask-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcMaskInputComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', async () => {
      spec.element.value = 'abc';
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });

    it('is associated on submit with value formatting enabled', async () => {
      spec.element.valueMode = 'withFormatting';
      spec.element.mask = 'C - C - C';
      spec.element.value = 'A';
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
      expect(spec.element.value).to.equal('A - _ - _');
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 'abc';
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.equal('');
    });

    it('is with correct input value and placeholder after a form reset', async () => {
      const input = spec.element.renderRoot.querySelector('input')!;
      const placeholder = 'Type something';

      // Empty mask pattern as placeholder

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(spec.element.mask);

      spec.reset();

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(spec.element.mask);

      // User provided placeholder

      spec.element.placeholder = placeholder;
      await elementUpdated(spec.element);

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(placeholder);

      spec.reset();

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(placeholder);
    });

    it('is correctly reset on form reset with value formatting enabled', async () => {
      const bed = new FormAssociatedTestBed<IgcMaskInputComponent>(
        html`<igc-mask-input
          name="formatted-mask"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>`
      );
      await bed.setup(IgcMaskInputComponent.tagName);

      expect(bed.element.value).to.eql('(123) (456)');

      bed.element.value = '111';
      await elementUpdated(bed.element);

      expect(bed.element.value).to.eql('(111) (___)');

      bed.reset();
      expect(bed.element.value).to.eql('(123) (456)');
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

      spec.element.value = 'abc';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils mask pattern constraint', async () => {
      spec.element.mask = '00 99';
      spec.element.value = '1';
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = 'aa';
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = '11';
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
