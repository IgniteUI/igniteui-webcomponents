import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { defineComponents } from '../../index.js';
import { MaskParser } from './mask-parser.js';
import IgcMaskedInputComponent from './masked-input';

describe('Masked input', () => {
  before(() => defineComponents(IgcMaskedInputComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultMask = 'CCCCCCCCCC';

  const syncParser = () => {
    parser.mask = masked.mask;
    parser.prompt = masked.prompt;
  };
  const input = () =>
    masked.shadowRoot!.querySelector('input') as HTMLInputElement;

  let masked: IgcMaskedInputComponent;

  describe('', async () => {
    beforeEach(async () => {
      masked = await fixture<IgcMaskedInputComponent>(
        html`<igc-masked-input></igc-masked-input>`
      );
    });

    it('sensible default values', async () => {
      expect(masked.prompt).to.equal(defaultPrompt);
      expect(masked.mask).to.equal(defaultMask);
      expect(masked.value).to.be.undefined;
      expect(input().placeholder).to.equal(parser.apply());
    });

    it('prompt character change (no value)', async () => {
      masked.prompt = '*';
      syncParser();

      await elementUpdated(masked);
      expect(input().placeholder).to.equal(parser.apply());
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
      expect(input().placeholder).to.equal(parser.apply());
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

      expect(input().placeholder).to.equal(parser.apply());
    });

    it('empty value without literals', async () => {
      expect(masked.value).to.be.undefined;
    });

    it('empty value with literals', async () => {
      masked.withLiterals = true;
      syncParser();
      await elementUpdated(masked);

      expect(masked.value).to.equal(parser.apply());
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
      masked.withLiterals = true;

      await elementUpdated(masked);

      expect(masked.value).to.equal('(12) (34)');

      masked.withLiterals = false;
      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
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
  });
});

type KeyboardEventType = 'keydown' | 'keypress' | 'keyup';
type InputEventType =
  | 'insertText'
  | 'insertFromDrop'
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
