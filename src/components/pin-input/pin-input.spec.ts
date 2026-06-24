import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import {
  arrowLeft,
  arrowRight,
  backspaceKey,
  deleteKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  simulateFocusOut,
  simulateInput,
  simulateKeyboard,
  simulatePaste,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '../common/validity-helpers.spec.js';
import IgcPinInputComponent from './pin-input.js';

describe('PinInput', () => {
  before(() => {
    defineComponents(IgcPinInputComponent);
  });

  let element: IgcPinInputComponent;

  function getCells(pinInput: IgcPinInputComponent): HTMLInputElement[] {
    return Array.from(
      pinInput.renderRoot.querySelectorAll<HTMLInputElement>('[part~="input"]')
    );
  }

  async function typeIntoCell(
    cell: HTMLInputElement,
    char: string
  ): Promise<void> {
    simulateInput(cell, { value: char, bubbles: true, composed: true });
    await elementUpdated(element);
  }

  describe('Initialization', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
    });

    it('passes the a11y audit', async () => {
      await expect(element).shadowDom.to.be.accessible();
      await expect(element).to.be.accessible();
    });

    it('initializes with default values', () => {
      expect(element.length).to.equal(4);
      expect(element.mode).to.equal('numeric');
      expect(element.mask).to.be.false;
      expect(element.disabled).to.be.false;
      expect(element.required).to.be.false;
      expect(element.value).to.equal('');
    });

    it('renders the correct number of cells', () => {
      expect(getCells(element)).lengthOf(4);
    });

    it('cells have type="text" by default', () => {
      for (const cell of getCells(element)) {
        expect(cell.type).to.equal('text');
      }
    });

    it('cells have inputmode="numeric" for numeric type', () => {
      for (const cell of getCells(element)) {
        expect(cell.inputMode).to.equal('numeric');
      }
    });
  });

  describe('Length property', () => {
    it('renders the specified number of cells', async () => {
      element = await fixture(html`<igc-pin-input length="6"></igc-pin-input>`);
      expect(getCells(element)).lengthOf(6);
    });

    it('clamps length to minimum of 1', async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
      element.length = 0;
      await elementUpdated(element);
      expect(element.length).to.equal(1);
      expect(getCells(element)).lengthOf(1);
    });

    it('clamps length to maximum of 8', async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
      element.length = 99;
      await elementUpdated(element);
      expect(element.length).to.equal(8);
      expect(getCells(element)).lengthOf(8);
    });
  });

  describe('Value property', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input length="4"></igc-pin-input>`);
    });

    it('returns empty string when no cells are filled', () => {
      expect(element.value).to.equal('');
    });

    it('returns empty string when only some cells are filled', async () => {
      element.value = '12';
      await elementUpdated(element);
      expect(element.value).to.equal('');
    });

    it('returns concatenated string when all cells are filled', async () => {
      element.value = '1234';
      await elementUpdated(element);
      expect(element.value).to.equal('1234');
    });

    it('distributes value across cells on setter', async () => {
      element.value = '5678';
      await elementUpdated(element);
      const cells = getCells(element);
      expect(cells[0].value).to.equal('5');
      expect(cells[1].value).to.equal('6');
      expect(cells[2].value).to.equal('7');
      expect(cells[3].value).to.equal('8');
    });

    it('filters non-numeric characters in numeric type', async () => {
      element.value = 'ab12';
      await elementUpdated(element);
      expect(element.value).to.equal('');
    });

    it('accepts alphanumeric characters when type is alphanumeric', async () => {
      element.mode = 'alphanumeric';
      element.value = 'a1B2';
      await elementUpdated(element);
      expect(element.value).to.equal('a1B2');
    });
  });

  describe('Mask mode', () => {
    it('renders cells as type="password" when mask is true', async () => {
      element = await fixture(html`<igc-pin-input mask></igc-pin-input>`);
      for (const cell of getCells(element)) {
        expect(cell.type).to.equal('password');
      }
    });

    it('renders cells as type="text" when mask is false', async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
      for (const cell of getCells(element)) {
        expect(cell.type).to.equal('text');
      }
    });
  });

  describe('Type property', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
    });

    it('sets inputmode="numeric" for numeric type', () => {
      for (const cell of getCells(element)) {
        expect(cell.inputMode).to.equal('numeric');
      }
    });

    it('sets inputmode="text" for alphanumeric type', async () => {
      element.mode = 'alphanumeric';
      await elementUpdated(element);
      for (const cell of getCells(element)) {
        expect(cell.inputMode).to.equal('text');
      }
    });
  });

  describe('Disabled state', () => {
    it('disables all cells when disabled is set', async () => {
      element = await fixture(html`<igc-pin-input disabled></igc-pin-input>`);
      for (const cell of getCells(element)) {
        expect(cell.disabled).to.be.true;
      }
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input length="3"></igc-pin-input>`);
    });

    it('emits igcInput when a cell value changes', async () => {
      const handler = spy();
      element.addEventListener('igcInput', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      expect(handler.calledOnce).to.be.true;
    });

    it('emits igcComplete when all cells are filled', async () => {
      const handler = spy();
      element.addEventListener('igcComplete', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');
      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[0].detail).to.equal('123');
    });

    it('does not emit igcComplete when cells are only partially filled', async () => {
      const handler = spy();
      element.addEventListener('igcComplete', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      expect(handler.called).to.be.false;
    });

    it('does not emit igcChange immediately when the last cell is filled', async () => {
      const handler = spy();
      element.addEventListener('igcChange', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');
      expect(handler.called).to.be.false;
    });

    it('emits igcChange on focusout when focus leaves the component and value has changed', async () => {
      const handler = spy();
      element.addEventListener('igcChange', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');

      simulateFocusOut(cells[2]);
      await elementUpdated(element);

      expect(handler.calledOnce).to.be.true;
      expect(handler.firstCall.args[0].detail).to.equal('123');
    });

    it('does not emit igcChange on focusout when focus moves between internal cells', async () => {
      const handler = spy();
      element.addEventListener('igcChange', handler);
      const cells = getCells(element);

      // Fill all cells via typing so _lastValue stays '' while value becomes '123'
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');

      // Simulate focusout re-targeted to the host — what the browser produces
      // when focus moves between shadow-internal cells
      simulateFocusOut(cells[2], { relatedTarget: element });
      await elementUpdated(element);

      expect(handler.called).to.be.false;
    });

    it('does not emit igcChange on repeated focusout when value has not changed', async () => {
      const handler = spy();
      element.addEventListener('igcChange', handler);
      const cells = getCells(element);
      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');

      simulateFocusOut(element);
      await elementUpdated(element);
      simulateFocusOut(element);
      await elementUpdated(element);

      expect(handler.calledOnce).to.be.true;
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input length="4"></igc-pin-input>`);
    });

    describe('Backspace', () => {
      it('shifts subsequent filled cells left when pressed on a filled cell', async () => {
        element.value = '1234';
        await elementUpdated(element);
        const cells = getCells(element);

        simulateKeyboard(cells[1], backspaceKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('1');
        expect(cells[1].value).to.equal('3');
        expect(cells[2].value).to.equal('4');
        expect(cells[3].value).to.equal('');
      });

      it('clears the first cell and stays when pressed at index 0', async () => {
        element.value = '1234';
        await elementUpdated(element);
        const cells = getCells(element);

        simulateKeyboard(cells[0], backspaceKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('2');
        expect(cells[1].value).to.equal('3');
        expect(cells[2].value).to.equal('4');
        expect(cells[3].value).to.equal('');
      });

      it('deletes the previous filled cell and shifts left when pressed on an empty cell', async () => {
        // Build cells = ['1','2','3',''] by typing into first three cells
        const cells = getCells(element);
        await typeIntoCell(cells[0], '1');
        await typeIntoCell(cells[1], '2');
        await typeIntoCell(cells[2], '3');

        simulateKeyboard(cells[3], backspaceKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('1');
        expect(cells[1].value).to.equal('2');
        expect(cells[2].value).to.equal('');
        expect(cells[3].value).to.equal('');
      });

      it('is a no-op when pressed on the first empty cell', async () => {
        const cells = getCells(element);

        simulateKeyboard(cells[0], backspaceKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('');
      });
    });

    describe('Delete', () => {
      it('shifts subsequent filled cells left when pressed on a filled cell', async () => {
        element.value = '1234';
        await elementUpdated(element);
        const cells = getCells(element);

        simulateKeyboard(cells[1], deleteKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('1');
        expect(cells[1].value).to.equal('3');
        expect(cells[2].value).to.equal('4');
        expect(cells[3].value).to.equal('');
      });

      it('deletes the next filled cell and shifts left when pressed on an empty cell', async () => {
        // Build cells = ['1','','3','4']
        const cells = getCells(element);
        await typeIntoCell(cells[0], '1');
        await typeIntoCell(cells[2], '3');
        await typeIntoCell(cells[3], '4');

        simulateKeyboard(cells[1], deleteKey);
        await elementUpdated(element);

        expect(cells[0].value).to.equal('1');
        expect(cells[1].value).to.equal('');
        expect(cells[2].value).to.equal('4');
        expect(cells[3].value).to.equal('');
      });

      it('is a no-op when pressed on the last empty cell', async () => {
        const cells = getCells(element);

        simulateKeyboard(cells[3], deleteKey);
        await elementUpdated(element);

        expect(cells[3].value).to.equal('');
      });
    });

    describe('Arrow keys', () => {
      it('ArrowLeft moves focus to the previous cell', async () => {
        element.value = '1234';
        await elementUpdated(element);
        const cells = getCells(element);

        cells[2].focus();
        simulateKeyboard(cells[2], arrowLeft);
        await elementUpdated(element);

        expect(element.shadowRoot!.activeElement).to.equal(cells[1]);
      });

      it('ArrowRight moves focus to the next cell', async () => {
        element.value = '1234';
        await elementUpdated(element);
        const cells = getCells(element);

        cells[1].focus();
        simulateKeyboard(cells[1], arrowRight);
        await elementUpdated(element);

        expect(element.shadowRoot!.activeElement).to.equal(cells[2]);
      });
    });
  });

  describe('Focus behavior', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input length="4"></igc-pin-input>`);
    });

    it('selects the cell content when focusing a filled cell', async () => {
      element.value = '1234';
      await elementUpdated(element);
      const cells = getCells(element);

      cells[1].focus();
      await elementUpdated(element);

      expect(cells[1].selectionStart).to.equal(0);
      expect(cells[1].selectionEnd).to.equal(cells[1].value.length);
    });

    it('does not select content when focusing an empty cell', async () => {
      const cells = getCells(element);

      cells[0].focus();
      await elementUpdated(element);

      expect(cells[0].selectionStart).to.equal(0);
      expect(cells[0].selectionEnd).to.equal(0);
    });
  });

  describe('Groups and separators', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
    });

    it('derives total length from group sizes', async () => {
      element.groups = [3, 3];
      await elementUpdated(element);

      expect(element.length).to.equal(6);
      expect(getCells(element)).lengthOf(6);
    });

    it('clamps derived length to the maximum of 8', async () => {
      element.groups = [5, 5];
      await elementUpdated(element);

      expect(element.length).to.equal(8);
      expect(getCells(element)).lengthOf(8);
    });

    it('renders the correct number of separator spans between groups', async () => {
      element.groups = [2, 2, 2];
      element.separator = '-';
      await elementUpdated(element);

      const separators =
        element.renderRoot.querySelectorAll('[part="separator"]');
      expect(separators.length).to.equal(2);
    });

    it('renders the separator text content correctly', async () => {
      element.groups = [3, 3];
      element.separator = '-';
      await elementUpdated(element);

      const separator = element.renderRoot.querySelector('[part="separator"]');
      expect(separator).to.exist;
      expect(separator!.textContent).to.equal('-');
    });

    it('does not render separators when separator is empty', async () => {
      element.groups = [3, 3];
      await elementUpdated(element);

      const separators =
        element.renderRoot.querySelectorAll('[part="separator"]');
      expect(separators.length).to.equal(0);
    });

    it('ignores the length setter when groups is active', async () => {
      element.groups = [3, 3];
      await elementUpdated(element);

      element.length = 4;
      await elementUpdated(element);

      expect(element.length).to.equal(6);
      expect(getCells(element)).lengthOf(6);
    });

    it('preserves existing cell values when groups change total length', async () => {
      element = await fixture(html`<igc-pin-input length="4"></igc-pin-input>`);
      element.value = '1234';
      await elementUpdated(element);

      element.groups = [3, 3];
      await elementUpdated(element);

      const cells = getCells(element);
      expect(cells[0].value).to.equal('1');
      expect(cells[1].value).to.equal('2');
      expect(cells[2].value).to.equal('3');
      expect(cells[3].value).to.equal('4');
      expect(cells[4].value).to.equal('');
      expect(cells[5].value).to.equal('');
    });

    it('restores length control when groups is cleared', async () => {
      element.groups = [3, 3];
      await elementUpdated(element);
      expect(element.length).to.equal(6);

      element.groups = [];
      await elementUpdated(element);

      element.length = 4;
      await elementUpdated(element);
      expect(element.length).to.equal(4);
      expect(getCells(element)).lengthOf(4);
    });
  });

  describe('Paste', () => {
    beforeEach(async () => {
      element = await fixture(html`<igc-pin-input length="4"></igc-pin-input>`);
    });

    it('distributes pasted text across cells starting from focused cell', async () => {
      const cells = getCells(element);

      simulatePaste(cells[0], '5678');
      await elementUpdated(element);

      expect(element.value).to.equal('5678');
    });

    it('filters invalid characters during paste in numeric mode', async () => {
      const cells = getCells(element);

      simulatePaste(cells[0], 'ab12');
      await elementUpdated(element);

      expect(cells[0].value).to.equal('1');
      expect(cells[1].value).to.equal('2');
    });
  });

  describe('Clear method', () => {
    it('clears all cells', async () => {
      element = await fixture(html`<igc-pin-input></igc-pin-input>`);
      element.value = '1234';
      await elementUpdated(element);
      element.clear();
      await elementUpdated(element);
      expect(element.value).to.equal('');
      for (const cell of getCells(element)) {
        expect(cell.value).to.equal('');
      }
    });

    it('does not emit igcChange on focusout after clear()', async () => {
      element = await fixture(html`<igc-pin-input length="3"></igc-pin-input>`);
      const handler = spy();
      element.addEventListener('igcChange', handler);
      const cells = getCells(element);

      await typeIntoCell(cells[0], '1');
      await typeIntoCell(cells[1], '2');
      await typeIntoCell(cells[2], '3');

      element.clear();
      await elementUpdated(element);

      simulateFocusOut(cells[0]);
      await elementUpdated(element);

      expect(handler.called).to.be.false;
    });
  });

  describe('Form association', () => {
    const spec = createFormAssociatedTestBed<IgcPinInputComponent>(
      html`<igc-pin-input name="pin" length="4"></igc-pin-input>`
    );

    beforeEach(async () => {
      await spec.setup('igc-pin-input');
    });

    it('submits value in form data when all cells are filled', async () => {
      spec.element.value = '1234';
      await elementUpdated(spec.element);

      const data = spec.submit();
      expect(data.get('pin')).to.equal('1234');
    });

    it('does not submit when cells are only partially filled', async () => {
      spec.element.value = '12';
      await elementUpdated(spec.element);

      const data = spec.submit();
      expect(data.get('pin')).to.be.null;
    });

    it('resets to empty when form is reset', async () => {
      spec.element.value = '1234';
      await elementUpdated(spec.element);

      spec.reset();
      await elementUpdated(spec.element);

      expect(spec.element.value).to.equal('');
    });

    it('does not emit igcChange on focusout after form reset', async () => {
      const handler = spy();
      spec.element.addEventListener('igcChange', handler);
      spec.element.value = '1234';
      await elementUpdated(spec.element);

      spec.reset();
      await elementUpdated(spec.element);

      const cells = getCells(spec.element);
      simulateFocusOut(cells[0]);
      await elementUpdated(spec.element);

      expect(handler.called).to.be.false;
    });

    it('is valid when not required and empty', () => {
      expect(spec.valid).to.be.true;
    });

    it('is invalid when required and empty', async () => {
      await spec.setProperties({ required: true }, true);
      expect(spec.valid).to.be.false;
    });

    it('is valid when required and all cells are filled', async () => {
      await spec.setProperties({ required: true, value: '1234' }, true);
      expect(spec.valid).to.be.true;
    });
  });

  describe('Validation container slots', () => {
    it('', async () => {
      const params: ValidationContainerTestsParams<IgcPinInputComponent>[] = [
        {
          slots: ['valueMissing'],
          props: { required: true },
        },
        {
          slots: ['customError'],
        },
        {
          slots: ['invalid'],
          props: { required: true },
        },
      ];

      runValidationContainerTests(IgcPinInputComponent, params);
    });
  });
});
