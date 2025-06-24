import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { spy } from 'sinon';

import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  runValidationContainerTests,
  simulateInput,
  simulateKeyboard,
  type ValidationContainerTestsParams,
} from '../common/utils.spec.js';
import IgcMaskInputComponent from './mask-input.js';
import { MaskParser } from './mask-parser.js';

describe('Masked input', () => {
  before(() => defineComponents(IgcMaskInputComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultMask = 'CCCCCCCCCC';

  let element: IgcMaskInputComponent;
  let input: HTMLInputElement;

  const syncParser = () => {
    parser.mask = element.mask;
    parser.prompt = element.prompt;
  };

  describe('Generic properties', async () => {
    beforeEach(async () => {
      element = await fixture<IgcMaskInputComponent>(
        html`<igc-mask-input></igc-mask-input>`
      );
      input = element.renderRoot.querySelector('input')!;
    });

    it('sensible default values', async () => {
      expect(element.prompt).to.equal(defaultPrompt);
      expect(element.mask).to.equal(defaultMask);
      expect(element.value).to.equal('');
      expect(input.placeholder).to.equal(parser.escapedMask);
    });

    it('prompt character change (no value)', async () => {
      element.prompt = '*';
      syncParser();

      await elementUpdated(element);
      expect(input.placeholder).to.equal(parser.escapedMask);
    });

    it('prompt character change (value)', async () => {
      element.value = '777';
      await elementUpdated(element);

      element.prompt = '*';
      syncParser();
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('mask change (no value)', async () => {
      element.mask = 'CCCC';
      syncParser();

      await elementUpdated(element);
      expect(input.placeholder).to.equal(parser.escapedMask);
    });

    it('mask change (value)', async () => {
      element.value = '1111';
      await elementUpdated(element);

      element.mask = 'CC CC';
      syncParser();

      await elementUpdated(element);
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('placeholder is updated correctly', async () => {
      const placeholder = 'Enter payment info';
      syncParser();

      element.placeholder = placeholder;
      await elementUpdated(element);

      expect(input.placeholder).to.equal(placeholder);

      element.placeholder = '';
      await elementUpdated(element);

      expect(input.placeholder).to.equal('');

      element.placeholder = null as any;
      await elementUpdated(element);

      expect(input.placeholder).to.equal(parser.escapedMask);
    });

    it('empty value without literals', async () => {
      expect(element.value).to.equal('');
    });

    it('empty value with literals', async () => {
      element.valueMode = 'withFormatting';
      syncParser();
      await elementUpdated(element);

      expect(element.value).to.equal('');
    });

    it('empty value and readonly on focus', async () => {
      element.readOnly = true;
      syncParser();
      await elementUpdated(element);

      element.focus();
      await elementUpdated(element);

      expect(input.value).to.equal('');
    });

    it('get value without literals', async () => {
      element.mask = '(CC) (CC)';
      element.value = '1234';

      await elementUpdated(element);

      expect(element.value).to.equal('1234');
    });

    it('value with literals then value without', async () => {
      element.mask = '(CC) (CC)';
      element.value = '1234';
      element.valueMode = 'withFormatting';

      await elementUpdated(element);

      expect(element.value).to.equal('(12) (34)');

      element.valueMode = 'raw';
      await elementUpdated(element);

      expect(element.value).to.equal('1234');
    });

    it('invalid state is correctly reflected', async () => {
      element.required = true;
      await elementUpdated(element);

      expect(element.reportValidity()).to.be.false;
      expect(element.invalid).to.be.true;

      element.required = false;
      await elementUpdated(element);

      expect(element.reportValidity()).to.be.true;
      expect(element.invalid).to.be.false;

      // Disabled inputs are always valid
      element.required = true;
      element.disabled = true;
      await elementUpdated(element);

      expect(element.reportValidity()).to.be.true;
    });

    it('valid/invalid state based on mask pattern', async () => {
      element.mask = '(####)';
      await elementUpdated(element);

      element.value = '111';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.false;

      element.value = '2222';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.true;

      element.mask = 'CCC';
      element.value = '';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.true;

      element.mask = 'CC &';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.true;

      element.value = 'R';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.false;

      element.value = '  R';
      await elementUpdated(element);
      expect(element.checkValidity()).to.be.true;
    });

    it('setCustomValidity', async () => {
      element.setCustomValidity('Fill in the value');
      element.reportValidity();
      await elementUpdated(element);

      expect(element.invalid).to.be.true;

      element.setCustomValidity('');
      element.reportValidity();
      await elementUpdated(element);

      expect(element.invalid).to.be.false;
    });

    it('setRangeText() method', async () => {
      const checkSelectionRange = (start: number, end: number) =>
        expect([start, end]).to.eql([input.selectionStart, input.selectionEnd]);

      element.mask = '(CC) (CC)';
      element.value = '1111';

      await elementUpdated(element);
      syncParser();

      // No boundaries, from current user selection
      element.setSelectionRange(2, 2);
      await elementUpdated(element);
      element.setRangeText('22'); // (12) (21)
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
      expect(element.value).to.equal('1221');
      checkSelectionRange(2, 2);

      // Keep passed selection range
      element.value = '1111';
      element.setRangeText('22', 0, 2, 'select'); // (22) (11)
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
      expect(element.value).to.equal('2211');
      checkSelectionRange(0, 2);

      // Collapse range to start
      element.value = '';
      element.setRangeText('xx', 0, 4, 'start');
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
      expect(element.value).to.equal('xx');
      checkSelectionRange(0, 0);

      // Collapse range to end
      element.value = 'xx';
      element.setRangeText('yy', 2, 5, 'end');
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
      expect(element.value).to.equal('xyy');
      checkSelectionRange(5, 5);
    });

    it('igcChange event', async () => {
      syncParser();

      const eventSpy = spy(element, 'emitEvent');
      element.value = 'abc';
      await elementUpdated(element);

      input.dispatchEvent(new Event('change'));
      expect(eventSpy).calledWith('igcChange', { detail: 'abc' });
    });

    it('igcChange event with literals', async () => {
      syncParser();

      const eventSpy = spy(element, 'emitEvent');
      element.value = 'abc';
      element.valueMode = 'withFormatting';
      await elementUpdated(element);

      input.dispatchEvent(new Event('change'));
      expect(eventSpy).calledWith('igcChange', {
        detail: parser.apply(element.value),
      });
    });

    it('igcInput event', async () => {
      element.mask = 'CCC';
      await elementUpdated(element);
      syncParser();

      const eventSpy = spy(element, 'emitEvent');
      element.value = '111';
      element.setSelectionRange(2, 3);
      await elementUpdated(element);

      // fireInputEvent(input, 'insertText');
      simulateInput(input, {
        inputType: 'insertText',
        skipValueProperty: true,
      });
      expect(eventSpy).calledWith('igcInput', { detail: '111' });
    });

    it('igInput event (end of pattern)', async () => {
      element.mask = 'CCC';
      await elementUpdated(element);
      syncParser();

      const eventSpy = spy(element, 'emitEvent');
      element.value = '111';
      element.setSelectionRange(3, 3);
      await elementUpdated(element);

      simulateInput(input, {
        inputType: 'insertText',
        skipValueProperty: true,
      });
      expect(eventSpy).not.calledWith('igcInput', { detail: '111' });
    });

    it('is accessible', async () => {
      await expect(element).to.be.accessible();
    });

    it('focus updates underlying input mask', async () => {
      element.focus();
      syncParser();

      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply());
    });

    it('blur updates underlying input mask (empty)', async () => {
      syncParser();

      element.focus();
      await elementUpdated(element);
      element.blur();
      await elementUpdated(element);

      expect(input.value).to.equal('');
    });

    it('blur updates underlying input mask (non-empty)', async () => {
      element.mask = '[CC] CC CC';
      syncParser();

      element.value;
      element.focus();
      await elementUpdated(element);
      element.value = '654321';
      element.blur();
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply('654321'));
    });

    it('drag enter without focus', async () => {
      syncParser();

      input.dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply());
    });

    it('drag enter with focus', async () => {
      syncParser();

      element.focus();
      await elementUpdated(element);

      input.dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('drag leave without focus', async () => {
      syncParser();

      input.dispatchEvent(new DragEvent('dragleave'));
      await elementUpdated(element);

      expect(input.value).to.equal('');
    });

    it('drag leave with focus', async () => {
      element.focus();
      await elementUpdated(element);

      input.dispatchEvent(new DragEvent('dragleave'));
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Delete key behavior', async () => {
      element.value = '1234';
      await elementUpdated(element);
      element.setSelectionRange(3, 4);

      simulateKeyboard(input, 'Delete');
      simulateInput(input, {
        inputType: 'deleteContentForward',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('123');
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Delete key behavior - skip literals', async () => {
      element.mask = 'CC--CCC---CC';
      element.value = '1234567';
      // value: 12--345---67
      await elementUpdated(element);

      // value: 12--345---67
      element.setSelectionRange(1, 1);
      simulateKeyboard(input, 'Delete');
      simulateInput(input, {
        inputType: 'deleteContentForward',
        skipValueProperty: true,
      });
      // value: 1_--345---67
      await elementUpdated(element);

      simulateKeyboard(input, 'Delete');
      simulateInput(input, {
        inputType: 'deleteContentForward',
        skipValueProperty: true,
      });
      // value: 1_--_45---67
      await elementUpdated(element);

      expect(input.value).to.equal('1_--_45---67');
      expect(element.value).to.equal('14567');
    });

    it('Backspace key behavior', async () => {
      element.value = '1234';
      await elementUpdated(element);
      element.setSelectionRange(0, 1);

      simulateKeyboard(input, 'Backspace');
      simulateInput(input, {
        inputType: 'deleteContentBackward',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('234');
      expect(input.value).to.equal(parser.apply(input.value));
    });

    it('Backspace key behavior - skip literals', async () => {
      element.mask = 'CC--CCC---CC';
      element.value = '1234567';
      // value: 12--345---67
      await elementUpdated(element);

      element.setSelectionRange(4, 5);
      simulateKeyboard(input, 'Backspace');
      simulateInput(input, {
        inputType: 'deleteContentBackward',
        skipValueProperty: true,
      });
      // value: 12--_45---67
      await elementUpdated(element);

      // Emulate range shift on multiple backspace presses as
      // it is not correctly reflected in test environment
      element.setSelectionRange(3, 4);
      simulateKeyboard(input, 'Backspace');
      simulateInput(input, {
        inputType: 'deleteContentBackward',
        skipValueProperty: true,
      });
      // value: 1_--_45---67
      await elementUpdated(element);

      expect(input.value).to.equal('1_--_45---67');
      expect(element.value).to.equal('14567');
    });

    it('Backspace key behavior with composition', async () => {
      element.value = '1234';
      await elementUpdated(element);

      element.setSelectionRange(0, 1);

      simulateKeyboard(input, 'Backspace');
      simulateInput(input, {
        inputType: 'deleteContentBackward',
        isComposing: true,
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('1234');
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Default input behavior', async () => {
      element.value = 'xxxx';
      await elementUpdated(element);

      element.setSelectionRange(4, 4);
      input.value = `${element.value}zz`;
      simulateInput(input, {
        inputType: 'insertText',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('xxxxzz');
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Composition behavior', async () => {
      const data = 'ときょお１２や';
      element.value = ' ';
      element.mask = 'CCCC::###';

      await elementUpdated(element);
      syncParser();

      element.setSelectionRange(0, 0);
      fireCompositionEvent(input, 'compositionstart');
      input.setSelectionRange(0, data.length);
      fireCompositionEvent(input, 'compositionend', { data });
      await elementUpdated(element);

      expect(element.value).to.equal('ときょお12');
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Cut behavior', async () => {
      element.value = 'xxxyyyxxx';
      element.mask = 'CCC-CCC-CCC';

      await elementUpdated(element);
      syncParser();

      element.setSelectionRange(4, 7);
      input.dispatchEvent(new ClipboardEvent('cut'));

      simulateInput(input, {
        inputType: 'deleteByCut',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('xxxxxx');
      expect(input.value).to.equal('xxx-___-xxx');
    });

    it('Paste behavior', async () => {
      element.value = '111111';
      element.mask = 'CCC::CCC';

      await elementUpdated(element);
      syncParser();

      // Emulate paste behavior
      input.value = '112222';
      input.setSelectionRange(2, 8);

      simulateInput(input, {
        inputType: 'insertFromPaste',
        skipValueProperty: true,
      });
      await elementUpdated(element);
      expect(input.value).to.equal(parser.apply(element.value));
    });

    it('Drop behavior', async () => {
      element.mask = 'CCC::CCC';
      element.value = '123456';

      await elementUpdated(element);
      syncParser();

      // Emulate drop behavior
      input.value = '   abc';
      input.setSelectionRange(3, 8);

      simulateInput(input, {
        inputType: 'insertFromDrop',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(input.value).to.equal(parser.apply(element.value));

      // https://github.com/IgniteUI/igniteui-webcomponents/issues/383
      element.mask = 'CC-CC';
      element.value = 'xxyy';

      await elementUpdated(element);
      syncParser();

      input.value = 'xx-basic-yy';
      input.setSelectionRange(3, 3 + 'basic'.length);
      simulateInput(input, {
        inputType: 'insertFromDrop',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('xxba');
      expect(input.value).to.equal(parser.apply(element.value));
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcMaskInputComponent>(
      html`<igc-mask-input name="mask"></igc-mask-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcMaskInputComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', () => {
      spec.assertSubmitHasValue(null);
    });

    it('is associated on submit', () => {
      spec.setProperties({ value: 'abc' });
      spec.assertSubmitHasValue(spec.element.value);
    });

    it('is associated on submit with value formatting enabled', () => {
      spec.setProperties({
        valueMode: 'withFormatting',
        mask: 'C - C - C',
        value: 'A',
      });

      expect(spec.element.value).to.equal('A - _ - _');
      spec.assertSubmitHasValue(spec.element.value);
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: 'abc' });

      spec.reset();
      expect(spec.element.value).to.be.empty;
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
      await spec.setProperties({ placeholder }, true);

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(placeholder);

      spec.reset();

      expect(input.value).to.be.empty;
      expect(input.placeholder).to.equal(placeholder);
    });

    it('is correctly reset on form reset with value formatting enabled', async () => {
      const bed = createFormAssociatedTestBed<IgcMaskInputComponent>(
        html`<igc-mask-input
          name="formatted-mask"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>`
      );
      await bed.setup(IgcMaskInputComponent.tagName);

      expect(bed.element.value).to.eql('(123) (456)');

      bed.setProperties({ value: '111' });

      expect(bed.element.value).to.eql('(111) (___)');

      bed.reset();
      expect(bed.element.value).to.eql('(123) (456)');
    });

    it('should reset to the new default value after setAttribute() call', () => {
      spec.setAttributes({ value: '1111' });
      spec.setProperties({ value: '2222' });

      spec.reset();

      expect(spec.element.value).to.equal('1111');
      spec.assertSubmitHasValue(spec.element.value);
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

      spec.setProperties({ value: 'abc' });
      spec.assertSubmitPasses();
    });

    it('required constraint with value formatting', () => {
      spec.setProperties({
        valueMode: 'withFormatting',
        mask: 'C - C - C',
        required: true,
      });

      spec.assertSubmitFails();

      spec.setProperties({ value: 'abc' });
      spec.assertSubmitHasValue(spec.element.value);

      expect(spec.element.value).to.equal('a - b - c');
    });

    it('required pattern constraint with value formatting', () => {
      spec.setProperties({
        valueMode: 'withFormatting',
        required: false,
        mask: '(000)',
        value: 'abc',
      });

      spec.assertSubmitFails();

      spec.setProperties({ value: '123' });
      spec.assertSubmitHasValue(spec.element.value);
      expect(spec.element.value).to.equal('(123)');
    });

    it('fulfils mask pattern constraint', () => {
      spec.setProperties({ mask: '00 99', value: '1' });
      spec.assertSubmitFails();

      spec.setProperties({ value: 'aa' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '11' });
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
    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcMaskInputComponent>(html`
        <igc-mask-input name="mask" .defaultValue=${'abc'}></igc-mask-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcMaskInputComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.equal('abc');
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(spec.element.value);
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: '123' });
        spec.reset();

        expect(spec.element.value).to.equal('abc');
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcMaskInputComponent>(html`
        <igc-mask-input
          name="mask"
          mask="LL"
          required
          .defaultValue=${undefined}
        ></igc-mask-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcMaskInputComponent.tagName);
      });

      it('fails initial validation', () => {
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes validation when updating defaultValue', () => {
        spec.setProperties({ defaultValue: 'ab' });
        spec.assertIsPristine();

        spec.assertSubmitPasses();
      });
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcMaskInputComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['badInput'], props: { mask: '00-00' } }, // bad-input slot
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcMaskInputComponent, testParameters);
    });
  });
});

type CompositionEventType = 'compositionstart' | 'compositionend';

const fireCompositionEvent = (
  target: HTMLElement,
  type: CompositionEventType,
  options: Partial<CompositionEventInit> = {}
) => target.dispatchEvent(new CompositionEvent(type, { ...options }));
