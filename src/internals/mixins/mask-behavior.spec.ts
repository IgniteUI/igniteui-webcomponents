import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import IgcMaskInputComponent from '../../components/mask-input/mask-input.js';
import { defineComponents } from '../definitions/defineComponents.js';
import { simulateInput, simulateKeyboard } from '../testing/simulate.spec.js';

/**
 * The `MaskBehaviorMixin` paths that the key bindings do not reach: the
 * browser history commands and the input types that the mask does not model.
 */
describe('Mask behavior', () => {
  before(() => defineComponents(IgcMaskInputComponent));

  let element: IgcMaskInputComponent;
  let input: HTMLInputElement;

  /** Types characters at the current caret, the way a browser would. */
  async function type(text: string): Promise<void> {
    for (const char of text) {
      const caret = input.selectionStart ?? 0;

      simulateKeyboard(input, char);
      input.value = `${input.value.substring(0, caret)}${char}${input.value.substring(caret)}`;
      input.setSelectionRange(caret + 1, caret + 1);
      simulateInput(input, {
        inputType: 'insertText',
        skipValueProperty: true,
      });
      await elementUpdated(element);
    }
  }

  /** Dispatches a `beforeinput` event and returns whether it was canceled. */
  function beforeInput(inputType: string): boolean {
    const event = new InputEvent('beforeinput', {
      inputType,
      cancelable: true,
      bubbles: true,
    });
    input.dispatchEvent(event);
    return event.defaultPrevented;
  }

  beforeEach(async () => {
    element = await fixture<IgcMaskInputComponent>(
      html`<igc-mask-input mask="000"></igc-mask-input>`
    );
    input = element.renderRoot.querySelector('input')!;

    element.focus();
    await elementUpdated(element);
    element.setSelectionRange(0, 0);
    await type('12');
  });

  describe('`beforeinput` history commands', () => {
    it('cancels `historyUndo` and `historyRedo` and steps the mask history', async () => {
      expect(beforeInput('historyUndo')).to.be.true;
      await elementUpdated(element);
      expect(element.value).to.equal('');

      expect(beforeInput('historyRedo')).to.be.true;
      await elementUpdated(element);
      expect(element.value).to.equal('12');
    });

    it('cancels the history commands without a step while read-only', async () => {
      element.readOnly = true;
      await elementUpdated(element);

      expect(beforeInput('historyUndo')).to.be.true;
      await elementUpdated(element);

      expect(element.value).to.equal('12');
    });

    it('leaves other input types alone', () => {
      expect(beforeInput('insertText')).to.be.false;
      expect(element.value).to.equal('12');
    });
  });

  describe('`input` history commands', () => {
    it('steps the mask history when `beforeinput` did not intercept them', async () => {
      simulateInput(input, {
        inputType: 'historyUndo',
        skipValueProperty: true,
      });
      await elementUpdated(element);
      expect(element.value).to.equal('');

      simulateInput(input, {
        inputType: 'historyRedo',
        skipValueProperty: true,
      });
      await elementUpdated(element);
      expect(element.value).to.equal('12');
    });

    it('makes no step while read-only', async () => {
      element.readOnly = true;
      await elementUpdated(element);

      simulateInput(input, {
        inputType: 'historyUndo',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(element.value).to.equal('12');
    });
  });

  describe('unmodeled input types', () => {
    it('restores the masked text after an unmodeled change', async () => {
      input.value = 'abc';
      simulateInput(input, {
        inputType: 'insertReplacementText',
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(input.value).to.equal('12_');
      expect(element.value).to.equal('12');
    });

    it('does not restore the text during a composition', async () => {
      input.value = 'abc';
      simulateInput(input, {
        inputType: 'insertReplacementText',
        isComposing: true,
        skipValueProperty: true,
      });
      await elementUpdated(element);

      expect(input.value).to.equal('abc');
      expect(element.value).to.equal('12');
    });
  });
});
