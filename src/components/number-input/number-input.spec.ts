import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { resetMouse, sendKeys } from '@web/test-runner-commands';
import {
  registerI18n,
  setCurrentI18n,
  ValidationResourceStringsEN,
} from 'igniteui-i18n-core';
import { ValidationResourceStringsBG } from 'igniteui-i18n-resources';
import type { TemplateResult } from 'lit';
import { restore, type SinonFakeTimers, spy, stub, useFakeTimers } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  createFormAssociatedTestBed,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import { clickWithMouse, isFocused } from '#internals/testing/helpers.spec.js';
import { runHiddenAncestorTests } from '#internals/testing/hidden-ancestor.spec.js';
import {
  simulateCancelableKeydown,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '#internals/testing/validity-helpers.spec.js';
import { formatString } from '#internals/utils/strings.js';
import type { NumberInputFormatOptions } from './number-format.js';
import IgcNumberInputComponent from './number-input.js';

const USD: NumberInputFormatOptions = { style: 'currency', currency: 'USD' };

describe('Number input', () => {
  before(() => defineComponents(IgcNumberInputComponent));
  afterEach(() => restore());

  let element: IgcNumberInputComponent;
  let input: HTMLInputElement;

  async function createFixture(template: TemplateResult): Promise<void> {
    element = await fixture<IgcNumberInputComponent>(template);
    input = element.renderRoot.querySelector('input')!;
  }

  /** Focuses the control, then types `text` with the real keyboard. */
  async function type(text: string): Promise<void> {
    if (!element.matches(':focus-within')) {
      await focus();
    }
    await sendKeys({ type: text });
    await elementUpdated(element);
  }

  async function press(key: string): Promise<void> {
    await sendKeys({ press: key });
    await elementUpdated(element);
  }

  async function blur(): Promise<void> {
    element.blur();
    await elementUpdated(element);
  }

  async function focus(): Promise<void> {
    element.focus();
    await elementUpdated(element);
  }

  /** Spies on the details of `igcInput` and `igcChange`. */
  function listenEvents() {
    const spies = { input: spy(), change: spy() };
    element.addEventListener('igcInput', (event) => spies.input(event.detail));
    element.addEventListener('igcChange', (event) =>
      spies.change(event.detail)
    );
    return spies;
  }

  describe('Default state', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input label="Amount"></igc-number-input>`
      );
    });

    it('passes the a11y audit', async () => {
      await expect(element).to.be.accessible();
      await expect(element).shadowDom.to.be.accessible();
    });

    it('is empty, as a text field with the spinbutton role', () => {
      expect(element.value).to.be.null;
      expect(input.value).to.equal('');
      expect(input.type).to.equal('text');
      expect(input.getAttribute('role')).to.equal('spinbutton');
      expect(input.hasAttribute('aria-valuenow')).to.be.false;
      expect(input.hasAttribute('aria-valuetext')).to.be.false;
      expect(input.inputMode).to.equal('decimal');
    });
  });

  describe('Value', () => {
    beforeEach(async () => {
      await createFixture(html`<igc-number-input></igc-number-input>`);
    });

    it('reads numeric strings for min, max and step, as frameworks set them', () => {
      Object.assign(element, { min: '0', max: '10', step: '5' });
      expect(element.min).to.equal(0);
      expect(element.max).to.equal(10);
      expect(element.step).to.equal(5);

      element.value = 0;
      element.stepUp();
      expect(element.value).to.equal(5);
    });

    it('sets no bound for an empty or non-numeric min and max attribute', async () => {
      await createFixture(
        html`<igc-number-input min="" max="abc" value="5"></igc-number-input>`
      );

      expect(element.min).to.be.undefined;
      expect(element.max).to.be.undefined;
      expect(input.hasAttribute('aria-valuemin')).to.be.false;
      expect(input.hasAttribute('aria-valuemax')).to.be.false;

      element.min = Number.NaN;
      element.max = Number.POSITIVE_INFINITY;
      expect(element.min).to.be.undefined;
      expect(element.max).to.be.undefined;
    });

    it('normalizes the values that are not finite numbers', () => {
      const cases: [unknown, number | null][] = [
        [5, 5],
        ['5', 5],
        [' 1e3 ', 1000],
        ['', null],
        ['abc', null],
        [Number.NaN, null],
        [Number.POSITIVE_INFINITY, null],
        [undefined, null],
      ];

      for (const [value, expected] of cases) {
        element.value = value as number;
        expect(element.value, String(value)).to.equal(expected);
      }

      element.value = -0;
      expect(Object.is(element.value, 0)).to.be.true;
    });

    it('reads the value attribute with Number(), and takes it as the default', async () => {
      await createFixture(
        html`<igc-number-input value="1234.5"></igc-number-input>`
      );

      expect(element.value).to.equal(1234.5);
      expect(element.defaultValue).to.equal(1234.5);
      expect(input.value).to.equal('1,234.5');
    });

    it('does not clamp, round or emit for a value from code', async () => {
      const spies = listenEvents();
      element.max = 10;
      element.valueFormatOptions = { maximumFractionDigits: 0 };
      element.value = 20.5;
      await elementUpdated(element);

      expect(element.value).to.equal(20.5);
      expect(element.validity.rangeOverflow).to.be.true;
      expect(spies.input.called).to.be.false;
      expect(spies.change.called).to.be.false;
    });
  });

  describe('Display and edit text', () => {
    it('starts and ends the edit when readOnly changes during the focus', async () => {
      await createFixture(
        html`<igc-number-input readonly value="1234.5"></igc-number-input>`
      );
      const spies = listenEvents();
      await focus();
      expect(input.value).to.equal('1,234.5');
      expect(simulateCancelableKeydown(input, 'Escape')).to.be.false;

      element.readOnly = false;
      await elementUpdated(element);
      expect(input.value).to.equal('1234.5');

      input.select();
      await sendKeys({ type: '2500' });
      await elementUpdated(element);
      expect(input.value).to.equal('2500');
      expect(spies.change.called).to.be.false;

      element.readOnly = true;
      await elementUpdated(element);
      expect(input.value).to.equal('2,500');
      expect(spies.change.calledOnceWith(2500)).to.be.true;
    });

    it('shows the display text without focus, and the edit text with focus', async () => {
      await createFixture(
        html`<igc-number-input value="1234.5"></igc-number-input>`
      );

      expect(input.value).to.equal('1,234.5');

      await focus();
      expect(input.value).to.equal('1234.5');

      await blur();
      expect(input.value).to.equal('1,234.5');
    });

    it('edits a currency and a percent without their symbols', async () => {
      await createFixture(
        html`<igc-number-input
          value="1234.5"
          .valueFormatOptions=${USD}
        ></igc-number-input>`
      );

      expect(input.value).to.equal('$1,234.50');
      await focus();
      expect(input.value).to.equal('1234.5');

      element.valueFormatOptions = { style: 'percent' };
      element.value = 0.255;
      await elementUpdated(element);
      expect(input.value).to.equal('25.5');

      await blur();
      expect(input.value).to.equal('25.5%');
    });

    it('selects all the text after a focus with Tab', async () => {
      const parent = await fixture<HTMLElement>(html`
        <div>
          <button>Before</button>
          <igc-number-input value="1234.5"></igc-number-input>
        </div>
      `);
      element = parent.querySelector(IgcNumberInputComponent.tagName)!;
      input = element.renderRoot.querySelector('input')!;

      parent.querySelector('button')!.focus();
      await press('Tab');

      expect(input.value).to.equal('1234.5');
      expect(input.selectionStart).to.equal(0);
      expect(input.selectionEnd).to.equal(input.value.length);
    });

    it('exposes the value, the bounds and the display text', async () => {
      await createFixture(
        html`<igc-number-input
          value="5"
          min="0"
          max="10"
          .valueFormatOptions=${USD}
        ></igc-number-input>`
      );

      expect(input.getAttribute('aria-valuenow')).to.equal('5');
      expect(input.getAttribute('aria-valuemin')).to.equal('0');
      expect(input.getAttribute('aria-valuemax')).to.equal('10');
      expect(input.getAttribute('aria-valuetext')).to.equal('$5.00');
    });
  });

  describe('Format', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="1234.5"></igc-number-input>`
      );
    });

    it('updates the text, and skips an update for an equal object', async () => {
      element.valueFormatOptions = { style: 'currency', currency: 'EUR' };
      await elementUpdated(element);
      expect(input.value).to.equal('€1,234.50');

      element.valueFormatOptions = { style: 'currency', currency: 'EUR' };
      expect(element.isUpdatePending).to.be.false;
    });

    it('uses the default format for invalid options and warns', async () => {
      const warn = stub(console, 'warn');
      element.valueFormatOptions = {
        style: 'currency',
        maximumFractionDigits: 4,
      };
      await elementUpdated(element);

      expect(input.value).to.equal('1,234.5');
      expect(warn.called).to.be.true;
    });

    it('uses the locale, an inherited lang, and formats the edit text again on a change', async () => {
      element.locale = 'de';
      await elementUpdated(element);
      expect(input.value).to.equal('1.234,5');

      await focus();
      expect(input.value).to.equal('1234,5');

      element.locale = 'en';
      await elementUpdated(element);
      expect(input.value).to.equal('1234.5');

      const parent = await fixture<HTMLElement>(
        html`<div lang="de">
          <igc-number-input value="1.5"></igc-number-input>
        </div>`
      );
      const inner = parent.querySelector(IgcNumberInputComponent.tagName)!;
      await elementUpdated(inner);

      expect(inner.renderRoot.querySelector('input')!.value).to.equal('1,5');
    });

    it('derives the virtual keyboard, and takes an override', async () => {
      expect(input.inputMode).to.equal('decimal');

      element.min = 0;
      element.valueFormatOptions = { maximumFractionDigits: 0 };
      await elementUpdated(element);
      expect(input.inputMode).to.equal('numeric');

      element.inputMode = 'text';
      await elementUpdated(element);
      expect(input.inputMode).to.equal('text');
    });
  });

  describe('Typing', () => {
    beforeEach(async () => {
      await createFixture(html`<igc-number-input></igc-number-input>`);
    });

    /** Pastes or drops `data`, and returns whether the control canceled it. */
    function paste(data: string, inputType = 'insertFromPaste'): boolean {
      const event = new InputEvent('beforeinput', {
        inputType,
        data,
        cancelable: true,
      });
      input.dispatchEvent(event);
      return event.defaultPrevented;
    }

    it('takes digits after a minus sign from code when min is not negative', async () => {
      element.min = 0;
      element.value = -5;
      await focus();
      input.setSelectionRange(2, 2);
      await sendKeys({ type: '3' });
      await elementUpdated(element);

      expect(input.value).to.equal('-53');
      expect(element.value).to.equal(-53);
    });

    it('sets the value and emits igcInput for each new number', async () => {
      const spies = listenEvents();
      await type('12.5');

      expect(input.value).to.equal('12.5');
      expect(element.value).to.equal(12.5);
      expect(spies.input.args.flat()).to.deep.equal([1, 12, 12.5]);
      expect(spies.change.called).to.be.false;
    });

    it('keeps a typed trailing decimal separator', async () => {
      await type('1.');

      expect(input.value).to.equal('1.');
      expect(element.value).to.equal(1);
    });

    it('rejects characters that cannot be part of a number', async () => {
      await type('a1b.2.3e');

      expect(input.value).to.equal('1.23');
      expect(element.value).to.equal(1.23);
    });

    it('rejects a minus sign when min is not negative', async () => {
      element.min = 0;
      await type('-5');

      expect(input.value).to.equal('5');

      element.validateOnly = true;
      input.setSelectionRange(0, 0);
      await type('-');
      expect(input.value).to.equal('-5');
    });

    it('rejects a decimal separator for a format without fraction digits', async () => {
      element.valueFormatOptions = { maximumFractionDigits: 0 };
      await type('1.5');

      expect(input.value).to.equal('15');
    });

    it('keeps the last value while the text is not a number yet', async () => {
      const spies = listenEvents();
      await type('-');

      expect(element.value).to.be.null;
      expect(spies.input.called).to.be.false;

      await type('5');
      expect(element.value).to.equal(-5);
    });

    it('types the decimal separator of the locale with the keypad key', async () => {
      // Playwright sends the keypad key with Num Lock off, as `Delete`.
      const keypad = (key: string) => {
        const event = new KeyboardEvent('keydown', {
          key,
          code: 'NumpadDecimal',
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        input.dispatchEvent(event);
        return event.defaultPrevented;
      };

      element.locale = 'de';
      await type('1');

      expect(keypad('.')).to.be.true;
      await type('5');
      expect(input.value).to.equal('1,5');
      expect(element.value).to.equal(1.5);

      expect(keypad(',')).to.be.false;
      expect(keypad('Delete')).to.be.false;
    });

    it('replaces the text with a pasted number in the display format', async () => {
      element.valueFormatOptions = USD;
      const spies = listenEvents();
      await focus();

      expect(paste('$1,234.50')).to.be.true;
      await elementUpdated(element);
      expect(input.value).to.equal('1234.5');
      expect(element.value).to.equal(1234.5);
      expect(spies.input.calledOnceWith(1234.5)).to.be.true;

      input.select();
      expect(paste('abc')).to.be.true;
      expect(element.value).to.equal(1234.5);
    });

    it('rejects a pasted negative number when min is not negative', async () => {
      element.min = 0;
      await focus();

      expect(paste('(5)')).to.be.true;
      expect(element.value).to.be.null;
    });

    it('takes an autofill without focus as a committed value', async () => {
      const spies = listenEvents();

      simulateInput(input, { value: '1,234.5' });
      await elementUpdated(element);

      expect(element.value).to.equal(1234.5);
      expect(spies.input.calledOnceWith(1234.5)).to.be.true;
      expect(spies.change.calledOnceWith(1234.5)).to.be.true;
    });

    it('leaves the text of a composition to its end', async () => {
      await focus();

      for (const init of [
        { inputType: 'insertCompositionText', data: 'あ' },
        { inputType: 'insertText', data: 'あ', isComposing: true },
      ]) {
        const event = new InputEvent('beforeinput', {
          ...init,
          cancelable: true,
        });
        input.dispatchEvent(event);
        expect(event.defaultPrevented, init.inputType).to.be.false;
      }
    });

    it('keeps a composition that gives a number, and reverts one that does not', async () => {
      await focus();

      const compose = (text: string) => {
        input.dispatchEvent(new CompositionEvent('compositionstart'));
        simulateInput(input, { value: text, isComposing: true, data: text });
        input.dispatchEvent(new CompositionEvent('compositionend'));
      };

      compose('１２');
      await elementUpdated(element);
      expect(element.value).to.equal(12);

      compose('１２あ');
      await elementUpdated(element);
      expect(input.value).to.equal('１２');
      expect(element.value).to.equal(12);
    });

    it('replaces the text with a dropped number, and rejects other drops', async () => {
      await type('12');

      expect(paste('-', 'insertFromDrop')).to.be.true;
      expect(input.value).to.equal('12');

      expect(paste('42', 'insertFromDrop')).to.be.true;
      await elementUpdated(element);
      expect(input.value).to.equal('42');
      expect(element.value).to.equal(42);
    });

    it('commits a number dropped on the control without focus', async () => {
      const spies = listenEvents();

      expect(paste('42', 'insertFromDrop')).to.be.true;
      expect(element.value).to.equal(42);
      expect(spies.change.calledOnceWith(42)).to.be.true;
    });
  });

  describe('Commit', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input
          max="10"
          .valueFormatOptions=${{ maximumFractionDigits: 1 }}
        ></igc-number-input>`
      );
    });

    it('rounds and clamps on blur, and emits igcChange once', async () => {
      const spies = listenEvents();
      await type('1.26');
      await blur();

      expect(element.value).to.equal(1.3);
      expect(input.value).to.equal('1.3');

      element.focus();
      input.select();
      await type('12');
      await blur();

      expect(element.value).to.equal(10);
      expect(spies.change.args.flat()).to.deep.equal([1.3, 10]);
    });

    it('commits on Enter and keeps the focus', async () => {
      const spies = listenEvents();
      await type('5.55');
      await press('Enter');

      expect(element.value).to.equal(5.6);
      expect(input.value).to.equal('5.6');
      expect(spies.change.calledOnceWith(5.6)).to.be.true;
      expect(element.matches(':focus-within')).to.be.true;
    });

    it('emits nothing for a focus and a blur without a change', async () => {
      element.value = 5;
      const spies = listenEvents();

      await focus();
      await blur();

      expect(spies.input.called).to.be.false;
      expect(spies.change.called).to.be.false;
    });

    it('keeps a value out of range with validateOnly', async () => {
      element.validateOnly = true;
      await type('20');
      await blur();

      expect(element.value).to.equal(20);
      expect(element.validity.rangeOverflow).to.be.true;
      expect(element.invalid).to.be.true;
      expect(input.getAttribute('aria-invalid')).to.equal('true');
    });

    it('gives the last value for a text that is not a number', async () => {
      element.value = 5;
      const spies = listenEvents();
      await focus();
      input.select();
      await type('-');
      await blur();

      expect(element.value).to.equal(5);
      expect(input.value).to.equal('5');
      expect(spies.change.called).to.be.false;
    });

    it('takes a value from code during an edit as the new baseline', async () => {
      const spies = listenEvents();

      await focus();
      element.value = 4;
      await elementUpdated(element);
      expect(input.value).to.equal('4');
      await press('Escape');
      expect(element.value).to.equal(4);
      await blur();

      await focus();
      element.stepUp();
      await press('Escape');
      expect(element.value).to.equal(5);
      await blur();

      expect(spies.input.called).to.be.false;
      expect(spies.change.called).to.be.false;
    });

    it('commits an edit when the control disconnects', async () => {
      const spies = listenEvents();
      await type('15');
      const parent = element.parentElement!;

      element.remove();
      expect(element.value).to.equal(10);
      expect(spies.change.calledOnceWith(10)).to.be.true;

      parent.append(element);
      await elementUpdated(element);
      expect(input.value).to.equal('10');
    });

    it('commits a shown value inside a bound with more fraction digits', async () => {
      const spies = listenEvents();
      element.max = 9.95;
      await type('15');
      await blur();

      expect(element.value).to.equal(9.9);
      expect(input.value).to.equal('9.9');
      expect(spies.change.calledOnceWith(9.9)).to.be.true;

      element.min = 0.04;
      element.value = null;
      await type('0');
      await blur();
      expect(element.value).to.equal(0.1);

      // Bounds closer than one shown step keep the clamped value.
      element.max = 0.06;
      element.value = null;
      await type('5');
      await blur();
      expect(element.value).to.equal(0.06);
    });

    it('commits an emptied field as null', async () => {
      element.value = 5;
      const spies = listenEvents();

      await focus();
      input.select();
      await press('Backspace');
      await blur();

      expect(element.value).to.be.null;
      expect(spies.change.calledOnceWith(null)).to.be.true;
    });

    it('keeps a pending igcChange when code writes the current value', async () => {
      const spies = listenEvents();
      await type('7');

      // As a framework does on each render.
      element.value = 7;
      await blur();
      expect(spies.change.calledOnceWith(7)).to.be.true;
    });

    it('keeps a value from code after a focus, Enter and a blur without an edit', async () => {
      const spies = listenEvents();
      element.value = 15;

      await focus();
      await press('Enter');
      await blur();

      expect(element.value).to.equal(15);
      expect(spies.change.called).to.be.false;
    });
  });

  describe('Escape', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="5"></igc-number-input>`
      );
    });

    it('reverts the edit and emits igcInput', async () => {
      const spies = listenEvents();
      await focus();
      input.select();
      await type('7');

      expect(simulateCancelableKeydown(input, 'Escape')).to.be.true;
      await elementUpdated(element);

      expect(element.value).to.equal(5);
      expect(input.value).to.equal('5');
      expect(spies.input.args.flat()).to.deep.equal([7, 5]);
    });

    it('leaves the key to the page when there is nothing to revert', async () => {
      await focus();

      expect(simulateCancelableKeydown(input, 'Escape')).to.be.false;
    });

    it('reverts the text when only the text changed', async () => {
      const spies = listenEvents();
      await type('.0');
      expect(input.value).to.equal('5.0');

      expect(simulateCancelableKeydown(input, 'Escape')).to.be.true;
      await elementUpdated(element);

      expect(input.value).to.equal('5');
      expect(spies.input.called).to.be.false;
    });

    it('shows the committed text on Enter when the value does not change', async () => {
      const spies = listenEvents();
      await type('.0');

      await press('Enter');
      expect(input.value).to.equal('5');
      expect(spies.change.called).to.be.false;
    });
  });

  describe('Keys', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="1"></igc-number-input>`
      );
      await focus();
    });

    it('steps with the arrow keys, and emits igcInput only', async () => {
      const spies = listenEvents();
      element.step = 2;

      await press('ArrowUp');
      expect(element.value).to.equal(3);
      expect(input.value).to.equal('3');

      await press('ArrowDown');
      expect(element.value).to.equal(1);
      expect(spies.input.args.flat()).to.deep.equal([3, 1]);
      expect(spies.change.called).to.be.false;
    });

    it('steps 10 times with PageUp, PageDown and Shift', async () => {
      element.value = 0;

      await press('PageUp');
      expect(element.value).to.equal(10);
      await press('Shift+ArrowUp');
      expect(element.value).to.equal(20);
      await press('PageDown');
      expect(element.value).to.equal(10);
      await press('Shift+ArrowDown');
      expect(element.value).to.equal(0);
    });

    it('goes to min and max with Home and End, or moves the caret without them', async () => {
      await press('Home');
      expect(element.value).to.equal(1);
      expect(input.selectionStart).to.equal(0);

      element.min = -3;
      element.max = 9;
      await press('Home');
      expect(element.value).to.equal(-3);
      await press('End');
      expect(element.value).to.equal(9);
    });

    it('repeats a held key', async () => {
      simulateKeyboard(input, 'ArrowUp', 3);
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          repeat: true,
          bubbles: true,
          composed: true,
        })
      );
      await elementUpdated(element);

      expect(element.value).to.equal(5);
    });

    it('steps from an empty value to 0 within the bounds', async () => {
      element.value = null;
      await press('ArrowUp');
      expect(element.value).to.equal(0);

      element.value = null;
      element.min = 5;
      await press('ArrowDown');
      expect(element.value).to.equal(5);
    });

    it('stays in the bounds, also with validateOnly', async () => {
      const spies = listenEvents();
      element.max = 1;
      element.validateOnly = true;

      await press('ArrowUp');
      expect(element.value).to.equal(1);
      expect(spies.input.called).to.be.false;
    });

    it('adds decimal steps without a floating-point error', async () => {
      element.value = 0.1;
      element.step = 0.2;

      await press('ArrowUp');
      expect(element.value).to.equal(0.3);
      expect(input.value).to.equal('0.3');
    });

    it('steps a percent by 1% by default', async () => {
      element.valueFormatOptions = { style: 'percent' };
      element.value = 0.25;

      await press('ArrowUp');
      expect(element.value).to.equal(0.26);
      expect(input.value).to.equal('26');
    });

    it('does not step while read-only', async () => {
      element.readOnly = true;
      await elementUpdated(element);

      expect(simulateCancelableKeydown(input, 'ArrowUp')).to.be.false;
      expect(element.value).to.equal(1);
    });

    it('ignores the keys of the prefix and suffix content', async () => {
      const button = document.createElement('button');
      button.slot = 'suffix';
      element.append(button);
      await elementUpdated(element);

      expect(simulateCancelableKeydown(button, 'ArrowUp')).to.be.false;
      expect(element.value).to.equal(1);
    });

    it('goes to the bounds as the field shows them with Home and End', async () => {
      element.valueFormatOptions = { maximumFractionDigits: 2 };
      element.min = 0.005;
      element.max = 2.999;
      const spies = listenEvents();

      await press('Home');
      expect(element.value).to.equal(0.01);
      await press('End');
      expect(element.value).to.equal(2.99);
      expect(spies.input.args.flat()).to.deep.equal([0.01, 2.99]);
    });
  });

  describe('Wheel', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="5"></igc-number-input>`
      );
    });

    function wheel(init: WheelEventInit): boolean {
      const event = new WheelEvent('wheel', {
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init,
      });
      input.dispatchEvent(event);
      return event.defaultPrevented;
    }

    it('steps while the control is focused', async () => {
      await focus();

      expect(wheel({ deltaY: -100 })).to.be.true;
      expect(element.value).to.equal(6);
      expect(wheel({ deltaY: 100 })).to.be.true;
      expect(element.value).to.equal(5);
    });

    it('leaves the wheel to the page without focus, with Ctrl, or for a horizontal scroll', async () => {
      expect(wheel({ deltaY: -100 })).to.be.false;

      await focus();

      expect(wheel({ deltaY: -100, ctrlKey: true })).to.be.false;
      expect(wheel({ deltaY: -10, deltaX: 100 })).to.be.false;
      expect(wheel({})).to.be.false;
      expect(element.value).to.equal(5);
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="5" min="0" max="10"></igc-number-input>`
      );
    });

    it('steps with stepUp and stepDown, within the bounds and without events', async () => {
      const spies = listenEvents();

      element.stepUp();
      expect(element.value).to.equal(6);
      element.stepDown(3);
      expect(element.value).to.equal(3);
      element.stepUp(100);
      expect(element.value).to.equal(10);

      await elementUpdated(element);
      expect(input.value).to.equal('10');
      expect(spies.input.called).to.be.false;
      expect(spies.change.called).to.be.false;
    });

    it('focuses and selects all the edit text with select', async () => {
      element.valueFormatOptions = USD;
      await elementUpdated(element);
      expect(input.value).to.equal('$5.00');

      element.select();

      expect(element.matches(':focus-within')).to.be.true;
      expect(input.value).to.equal('5');
      expect(input.selectionStart).to.equal(0);
      expect(input.selectionEnd).to.equal(1);
    });

    it('keeps the selection of a select() before the focus', async () => {
      element.valueFormatOptions = USD;
      await elementUpdated(element);

      // The order of Playwright `fill()`.
      const selected = new Promise((resolve) =>
        input.addEventListener('select', resolve, { once: true })
      );
      input.select();
      input.focus();
      await selected;

      expect(input.value).to.equal('5');
      expect(input.selectionStart).to.equal(0);
      expect(input.selectionEnd).to.equal(1);

      await sendKeys({ type: '7' });
      expect(element.value).to.equal(7);
    });

    it('keeps a caret that is set after the focus', async () => {
      element.valueFormatOptions = USD;
      await elementUpdated(element);

      const selected = new Promise((resolve) =>
        input.addEventListener('select', resolve, { once: true })
      );
      input.focus();
      input.setSelectionRange(0, 0);
      await selected;

      expect(input.selectionStart).to.equal(0);
      expect(input.selectionEnd).to.equal(0);
    });

    it('does not step while read-only or disabled', () => {
      element.readOnly = true;
      element.stepUp();
      expect(element.value).to.equal(5);

      element.readOnly = false;
      element.disabled = true;
      element.stepUp();
      expect(element.value).to.equal(5);
    });

    it('steps by the last shown digit when the step is finer', () => {
      element.step = 0.5;
      element.valueFormatOptions = { maximumFractionDigits: 0 };
      element.stepDown();
      expect(element.value).to.equal(4);
      element.stepUp(2);
      expect(element.value).to.equal(6);

      element.valueFormatOptions = USD;
      element.step = 0.001;
      element.stepUp();
      expect(element.value).to.equal(6.01);
    });

    it('does not step against its direction, and reads n as an integer', () => {
      element.validateOnly = true;
      element.value = 15;
      element.stepUp();
      expect(element.value).to.equal(15);
      element.stepDown();
      expect(element.value).to.equal(10);

      element.value = 5;
      element.stepUp(Number.NaN);
      element.stepUp(0.5);
      expect(element.value).to.equal(5);
      element.stepDown(1.9);
      element.stepDown(0.5);
      expect(element.value).to.equal(4);
    });
  });

  describe('Validation', () => {
    beforeEach(async () => {
      await createFixture(html`<igc-number-input></igc-number-input>`);
    });

    it('takes 0 as a value for required', () => {
      element.required = true;
      expect(element.validity.valueMissing).to.be.true;

      element.value = 0;
      expect(element.validity.valid).to.be.true;
    });

    it('checks min and max, and ignores bounds that are not numbers', () => {
      element.min = 1;
      element.max = 3;
      element.value = 0;
      expect(element.validity.rangeUnderflow).to.be.true;

      element.value = 4;
      expect(element.validity.rangeOverflow).to.be.true;

      element.max = Number.NaN;
      expect(element.validity.valid).to.be.true;
    });

    it('shows the bounds in the display format in the messages', () => {
      element.valueFormatOptions = USD;
      element.min = 10;
      element.value = 5;

      expect(element.validationMessage).to.equal(
        formatString(
          ValidationResourceStringsEN.min_validation_error!,
          '$10.00'
        )
      );
    });

    it('shows the messages in the locale', async () => {
      registerI18n(ValidationResourceStringsBG, 'bg');
      element.locale = 'bg';
      element.max = 1000.5;
      element.value = 2000;
      await elementUpdated(element);

      expect(element.validationMessage).to.equal(
        formatString(
          ValidationResourceStringsBG.max_validation_error!,
          '1000,5'
        )
      );
      setCurrentI18n('en');
    });

    it('renders the message slots', async () => {
      const params: ValidationContainerTestsParams<IgcNumberInputComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } },
          { slots: ['rangeOverflow'], props: { max: 3, value: 5 } },
          { slots: ['rangeUnderflow'], props: { min: 3, value: -3 } },
          { slots: ['customError'] },
          { slots: ['invalid'], props: { required: true } },
        ];

      await runValidationContainerTests(IgcNumberInputComponent, params);
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcNumberInputComponent>(
      html`<igc-number-input name="amount"></igc-number-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcNumberInputComponent.tagName);
    });

    it('submits nothing without a value', () => {
      spec.assertSubmitHasValue(null);
    });

    it('submits a plain decimal string', () => {
      spec.setProperties({
        value: 1234.5,
        valueFormatOptions: { style: 'currency', currency: 'EUR' },
      });
      spec.assertSubmitHasValue('1234.5');

      spec.setProperties({ value: 0.0000001 });
      spec.assertSubmitHasValue('0.0000001');
    });

    it('restores the default value on reset', () => {
      spec.setAttributes({ value: '10' });
      spec.setProperties({ value: 20 });
      spec.reset();

      expect(spec.element.value).to.equal(10);
      spec.assertSubmitHasValue('10');
    });

    it('reflects the disabled state of an ancestor', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils the required, min and max constraints', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();

      spec.setProperties({ value: 0 });
      spec.assertSubmitPasses();

      spec.setProperties({ min: 1 });
      spec.assertSubmitFails();

      spec.setProperties({ min: undefined, max: -1 });
      spec.assertSubmitFails();
    });

    it('commits on Enter before it submits', async () => {
      spec.setProperties({
        valueFormatOptions: { maximumFractionDigits: 1 },
      });
      let submitted: FormDataEntryValue | null = null;
      spec.form.addEventListener('submit', () => {
        submitted = new FormData(spec.form).get('amount');
      });

      spec.element.focus();
      await sendKeys({ type: '2.66' });

      expect(await spec.pressEnter()).to.equal(1);
      expect(submitted).to.equal('2.7');
    });

    it('stays pristine after a focus and a blur without an edit', async () => {
      spec.element.defaultValue = 5;
      expect(spec.element.value).to.equal(5);
      spec.element.focus();
      await elementUpdated(spec.element);
      spec.element.blur();
      await elementUpdated(spec.element);

      spec.element.defaultValue = 10;
      expect(spec.element.value).to.equal(10);
    });

    it('replaces a partial edit text on a reset to the same value', async () => {
      spec.element.defaultValue = 5;
      spec.element.focus();
      await elementUpdated(spec.element);
      const inner = spec.element.renderRoot.querySelector('input')!;

      inner.select();
      await sendKeys({ type: '-' });
      await elementUpdated(spec.element);
      expect(inner.value).to.equal('-');

      spec.reset();
      await elementUpdated(spec.element);
      expect(inner.value).to.equal('5');
    });
  });

  describe('Spin buttons', () => {
    let increment: HTMLButtonElement;
    let decrement: HTMLButtonElement;

    beforeEach(async () => {
      await createFixture(
        html`<igc-number-input value="5" min="0" max="10"></igc-number-input>`
      );
      increment = element.renderRoot.querySelector('[part="increment"]')!;
      decrement = element.renderRoot.querySelector('[part="decrement"]')!;
    });

    /** Dispatches a pointer event and returns whether a listener canceled it. */
    function pointer(
      target: Element,
      type: string,
      init: PointerEventInit = {}
    ): boolean {
      const event = new PointerEvent(type, {
        bubbles: true,
        composed: true,
        cancelable: true,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'mouse',
        ...init,
      });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    }

    describe('Rendering', () => {
      it('renders two labeled buttons out of the tab order in the suffix wrapper', () => {
        const container = element.renderRoot.querySelector(
          '[part~="container"]'
        )!;

        for (const button of [increment, decrement]) {
          expect(button.closest('[part="suffix"]')).to.exist;
          expect(button.tabIndex).to.equal(-1);
          expect(button.type).to.equal('button');
          expect(button.getAttribute('aria-controls')).to.equal(input.id);
          expect(button.hasAttribute('aria-hidden')).to.be.false;
        }

        expect(increment.getAttribute('aria-label')).to.equal('Increase value');
        expect(decrement.getAttribute('aria-label')).to.equal('Decrease value');
        expect(container.part.contains('suffixed')).to.be.true;
      });

      it('takes the labels from the resource strings', async () => {
        element.resourceStrings = {
          number_input_increment: 'Plus',
          number_input_decrement: 'Minus',
        };
        await elementUpdated(element);

        expect(increment.getAttribute('aria-label')).to.equal('Plus');
        expect(decrement.getAttribute('aria-label')).to.equal('Minus');
      });

      it('renders custom icons from the icon slots', async () => {
        const icon = document.createElement('span');
        icon.slot = 'increment-icon';
        element.append(icon);
        await elementUpdated(element);

        const slot = increment.querySelector<HTMLSlotElement>(
          'slot[name="increment-icon"]'
        )!;
        expect(slot.assignedElements()).to.deep.equal([icon]);
      });

      it('hides the buttons with hide-spin-buttons', async () => {
        element.hideSpinButtons = true;
        await elementUpdated(element);

        const container = element.renderRoot.querySelector(
          '[part~="container"]'
        )!;
        expect(element.renderRoot.querySelector('[part="spin-buttons"]')).to.be
          .null;
        expect(container.part.contains('suffixed')).to.be.false;
      });

      it('disables a button at its bound, and both while read-only or disabled', async () => {
        expect(increment.disabled).to.be.false;
        expect(decrement.disabled).to.be.false;

        element.value = 10;
        await elementUpdated(element);
        expect(increment.disabled).to.be.true;
        expect(decrement.disabled).to.be.false;

        element.value = 0;
        await elementUpdated(element);
        expect(decrement.disabled).to.be.true;

        element.value = 5;
        element.readOnly = true;
        await elementUpdated(element);
        expect(increment.disabled && decrement.disabled).to.be.true;

        element.readOnly = false;
        element.disabled = true;
        await elementUpdated(element);
        expect(increment.disabled && decrement.disabled).to.be.true;
      });

      it('passes the a11y audit', async () => {
        element.label = 'Quantity';
        await elementUpdated(element);

        await expect(element).shadowDom.to.be.accessible();
      });
    });

    it('disables a button that cannot step, also for a bound between shown values', async () => {
      element.valueFormatOptions = { maximumFractionDigits: 1 };
      element.max = 9.95;
      element.value = 9.9;
      await elementUpdated(element);
      expect(increment.disabled).to.be.true;
      expect(decrement.disabled).to.be.false;

      element.validateOnly = true;
      element.value = -3;
      await elementUpdated(element);
      expect(decrement.disabled).to.be.true;
      expect(increment.disabled).to.be.false;
    });

    describe('Pointer', () => {
      let clock: SinonFakeTimers;

      beforeEach(() => {
        clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      });

      afterEach(() => clock.restore());

      it('steps at once on a mouse press and focuses the input, not the button', async () => {
        const spies = listenEvents();

        expect(pointer(increment, 'pointerdown')).to.be.true;
        expect(element.value).to.equal(6);
        expect(isFocused(input)).to.be.true;

        pointer(increment, 'pointerup');
        await elementUpdated(element);

        expect(input.value).to.equal('6');
        expect(spies.input.args.flat()).to.deep.equal([6]);
        expect(spies.change.called).to.be.false;

        element.blur();
        expect(spies.change.calledOnceWith(6)).to.be.true;
      });

      it('repeats a held press after 400 ms every 60 ms, and stops on release', async () => {
        pointer(decrement, 'pointerdown');
        expect(element.value).to.equal(4);

        await clock.tickAsync(399);
        expect(element.value).to.equal(4);
        await clock.tickAsync(1);
        expect(element.value).to.equal(3);
        await clock.tickAsync(120);
        expect(element.value).to.equal(1);

        pointer(decrement, 'pointerup');
        await clock.tickAsync(600);
        expect(element.value).to.equal(1);
      });

      it('stops a held press at the bound', async () => {
        element.value = 9;
        pointer(increment, 'pointerdown');
        expect(element.value).to.equal(10);

        await clock.tickAsync(1000);
        expect(element.value).to.equal(10);
      });

      it('stops a held press on a canceled pointer and on blur', async () => {
        pointer(increment, 'pointerdown');
        pointer(increment, 'pointercancel');
        await clock.tickAsync(1000);
        expect(element.value).to.equal(6);

        pointer(increment, 'pointerdown');
        element.blur();
        await clock.tickAsync(1000);
        expect(element.value).to.equal(7);
      });

      it('steps a touch on release, without focus, and commits it', async () => {
        const spies = listenEvents();

        pointer(increment, 'pointerdown', { pointerType: 'touch' });
        expect(element.value).to.equal(5);
        expect(element.matches(':focus-within')).to.be.false;

        pointer(increment, 'pointerup', { pointerType: 'touch' });
        expect(element.value).to.equal(6);
        expect(spies.input.calledOnceWith(6)).to.be.true;
        expect(spies.change.calledOnceWith(6)).to.be.true;
      });

      it('does not step a touch that becomes a scroll', async () => {
        pointer(increment, 'pointerdown', { pointerType: 'touch' });
        pointer(increment, 'pointercancel', { pointerType: 'touch' });

        expect(element.value).to.equal(5);
      });

      it('commits a held touch once, at its end', async () => {
        const spies = listenEvents();

        pointer(increment, 'pointerdown', { pointerType: 'touch' });
        await clock.tickAsync(400 + 60 * 2);
        expect(element.value).to.equal(8);
        expect(spies.change.called).to.be.false;

        pointer(increment, 'pointerup', { pointerType: 'touch' });
        expect(spies.change.calledOnceWith(8)).to.be.true;
      });

      it('repeats a held touch without a step on release', async () => {
        pointer(increment, 'pointerdown', { pointerType: 'touch' });
        await clock.tickAsync(400);
        expect(element.value).to.equal(6);

        pointer(increment, 'pointerup', { pointerType: 'touch' });
        expect(element.value).to.equal(6);
      });

      it('keeps the focus in the input, and does not step, on a press of another button or a disabled one', async () => {
        await focus();

        // A press that is not canceled moves the focus to the button.
        expect(pointer(increment, 'pointerdown', { button: 2 })).to.be.true;
        expect(pointer(increment, 'pointerdown', { isPrimary: false })).to.be
          .true;
        expect(element.value).to.equal(5);
        expect(isFocused(input)).to.be.true;

        element.value = 10;
        increment.disabled = true;
        expect(pointer(increment, 'pointerdown')).to.be.true;
        expect(element.value).to.equal(10);
      });

      it('steps one time for a click without a press, as from assistive technology', async () => {
        const spies = listenEvents();

        increment.click();
        expect(element.value).to.equal(6);
        expect(spies.change.calledOnceWith(6)).to.be.true;

        decrement.click();
        expect(element.value).to.equal(5);
      });

      it('stops a held press when a render removes the buttons', async () => {
        pointer(increment, 'pointerdown');
        expect(element.value).to.equal(6);

        element.hideSpinButtons = true;
        await elementUpdated(element);
        await clock.tickAsync(1000);
        expect(element.value).to.equal(6);
      });

      it('stops a held press when the control disconnects', async () => {
        pointer(increment, 'pointerdown');
        element.remove();
        await clock.tickAsync(1000);

        expect(element.value).to.equal(6);
      });
    });

    it('steps one time on a real mouse click and keeps the focus in the input', async function () {
      // Real input can be slow under load, mainly in Firefox.
      this.timeout(10_000);
      // The hold delay waits for the clock, so a slow release does not repeat.
      const clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      try {
        await clickWithMouse(increment);
        await elementUpdated(element);

        // The `click` of the press does not step again.
        expect(element.value).to.equal(6);
        expect(isFocused(input)).to.be.true;
      } finally {
        clock.restore();
        await resetMouse();
      }
    });
  });

  runExternalLabelAssociationTests({
    tagName: IgcNumberInputComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcNumberInputComponent).renderRoot.querySelector('input')!,
  });

  runHiddenAncestorTests(html`
    <igc-number-input label="Label" value="5">
      <span slot="prefix">$</span>
    </igc-number-input>
  `);

  runFocusBeforeRenderTests(
    html`<igc-number-input label="Label"></igc-number-input>`
  );
});
