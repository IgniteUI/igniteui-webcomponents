import type { TemplateResult } from 'lit';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureTheme } from '../../theming/config.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  elementUpdated,
  fixture,
  html,
  nextFrame,
} from '../common/helpers.spec.js';
import {
  createFormAssociatedTestBed,
  isFocused,
  simulateInput,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '../common/validity-helpers.spec.js';
import IgcInputComponent from './input.js';

describe('Input component', () => {
  beforeAll(() => {
    defineComponents(IgcInputComponent);
  });

  let element: IgcInputComponent;
  let input: HTMLInputElement;

  async function createFixture(template: TemplateResult) {
    element = await fixture<IgcInputComponent>(template);
    input = element.renderRoot.querySelector('input')!;
  }

  describe('', () => {
    describe('Default state', () => {
      it('is initialized with the proper default values', async () => {
        await createFixture(html`<igc-input></igc-input>`);

        expect(element.type).to.equal('text');
        expect(element.value).to.be.empty;
        expect(element.invalid).to.be.false;
        expect(element.required).to.be.false;
        expect(element.readOnly).to.be.false;
        expect(element.disabled).to.be.false;
        expect(element.name).to.be.undefined;
        expect(element.pattern).to.be.undefined;
        expect(element.label).to.be.undefined;
        expect(element.autocomplete).to.be.undefined;
      });

      it('is accessible', async () => {
        await createFixture(html`<igc-input label="Label"></igc-input>`);

        await expect(element).to.be.accessible();
        await expect(element).shadowDom.to.be.accessible();
      });

      it('material variant layout', async () => {
        configureTheme('material');
        await createFixture(html`<igc-input label="Label"></igc-input>`);

        expect(element.renderRoot.querySelector('[part="notch"]')).to.exist;

        // Reset theme
        configureTheme('bootstrap');
        await nextFrame();
      });
    });

    describe('Properties', () => {
      it('sets the type property', async () => {
        await createFixture(html`<igc-input type="email"></igc-input>`);

        expect(element.type).to.equal('email');
        expect(input.type).to.equal('email');

        element.type = 'search';
        await elementUpdated(element);

        expect(element.type).to.equal('search');
        expect(input.type).to.equal('search');
      });

      it('sets the disabled property', async () => {
        await createFixture(html`<igc-input disabled></igc-input>`);

        expect(element.disabled).to.be.true;
        expect(input.disabled).to.be.true;

        element.disabled = false;
        await elementUpdated(element);

        expect(element.disabled).to.be.false;
        expect(input.disabled).to.be.false;
      });

      it('sets the label property', async () => {
        await createFixture(html`<igc-input label="Label"></igc-input>`);

        expect(element.label).to.equal('Label');
        expect(input.labels?.item(0).textContent?.trim()).to.equal('Label');

        element.label = 'Changed';
        await elementUpdated(element);

        expect(element.label).to.equal('Changed');
        expect(input.labels?.item(0).textContent?.trim()).to.equal('Changed');
      });

      it('sets the name property', async () => {
        await createFixture(html`<igc-input name="input"></igc-input>`);

        expect(element.name).to.equal('input');
        expect(input.name).to.equal('input');

        element.name = 'abcde';
        await elementUpdated(element);

        expect(element.name).to.equal('abcde');
        expect(input.name).to.equal('abcde');
      });

      it('sets the placeholder property', async () => {
        await createFixture(
          html`<igc-input placeholder="placeholder"></igc-input>`
        );

        expect(element.placeholder).to.equal('placeholder');
        expect(input.placeholder).to.equal('placeholder');

        element.placeholder = 'another';
        await elementUpdated(element);

        expect(element.placeholder).to.equal('another');
        expect(input.placeholder).to.equal('another');
      });

      it('sets the min and max properties', async () => {
        await createFixture(
          html`<igc-input type="number" min="3" max="6"></igc-input>`
        );
        expect([element.min, element.max]).to.eql([3, 6]);
        expect([input.min, input.max]).to.eql(['3', '6']);

        expect(element.checkValidity()).to.be.true;

        Object.assign(element, { min: 1, max: 2, value: 8 });
        await elementUpdated(element);

        expect([element.min, element.max]).to.eql([1, 2]);
        expect([input.min, input.max]).to.eql(['1', '2']);

        expect(element.checkValidity()).to.be.false;
      });

      it('sets the minLength and maxLength properties', async () => {
        await createFixture(
          html`<igc-input minlength="2" maxlength="4"></igc-input>`
        );

        expect([element.minLength, element.maxLength]).to.eql([2, 4]);
        expect([input.minLength, input.maxLength]).to.eql([2, 4]);
        expect(element.checkValidity()).to.be.true;

        Object.assign(element, { minLength: 2, maxLength: 2, value: 'a' });
        await elementUpdated(element);

        expect([element.minLength, element.maxLength]).to.eql([2, 2]);
        expect([input.minLength, input.maxLength]).to.eql([2, 2]);
        expect(element.checkValidity()).to.be.false;
      });

      it('sets the pattern property', async () => {
        await createFixture(
          html`<igc-input pattern="d{3}" value="a"></igc-input>`
        );

        expect(element.pattern).to.equal('d{3}');
        expect(input.pattern).to.equal('d{3}');

        expect(element.checkValidity()).to.be.false;

        element.pattern = '';
        await elementUpdated(element);

        expect(element.pattern).to.be.empty;
        expect(input.pattern).to.be.empty;

        expect(element.checkValidity()).to.be.true;
      });

      it('sets the required property', async () => {
        await createFixture(html`<igc-input required></igc-input>`);

        expect(element.required).to.be.true;
        expect(input.required).to.be.true;
        expect(element.checkValidity()).to.be.false;

        element.required = false;
        await elementUpdated(element);

        expect(element.required).to.be.false;
        expect(input.required).to.be.false;
        expect(element.checkValidity()).to.be.true;
      });

      it('sets the value property', async () => {
        await createFixture(html`<igc-input value="123"></igc-input>`);

        expect(element.value).to.equal('123');
        expect(input.value).to.equal('123');

        element.value = '';
        await elementUpdated(element);

        expect(element.value).to.be.empty;
        expect(input.value).to.be.empty;
      });

      it('issue #1026 - passing undefined sets the underlying input value to undefined', async () => {
        await createFixture(html`<igc-input value="a"></igc-input>`);

        expect(element.value).to.equal('a');
        expect(input.value).to.equal('a');

        element.value = undefined as any;
        await elementUpdated(element);

        expect(element.value).to.be.empty;
        expect(input.value).to.be.empty;
      });
    });

    describe('Methods', () => {
      it('should increment/decrement value by calling stepUp/stepDown', async () => {
        await createFixture(
          html`<igc-input type="number" value="10" step="5"></igc-input>`
        );

        element.stepUp();
        expect(element.value).to.equal('15');

        element.stepDown();
        expect(element.value).to.equal('10');

        element.stepUp(2);
        expect(element.value).to.equal('20');

        element.stepDown(2);
        expect(element.value).to.equal('10');
      });

      it('setRangeText()', async () => {
        await createFixture(
          html`<igc-input value="the quick brown fox"></igc-input>`
        );

        element.setRangeText('slow', 4, 9, 'select');
        expect(element.value).to.equal('the slow brown fox');
      });

      it('focus() and blur()', async () => {
        await createFixture(html`<igc-input></igc-input>`);

        element.focus();
        expect(isFocused(element)).to.be.true;
        expect(isFocused(input)).to.be.true;

        element.blur();
        expect(isFocused(element)).to.be.false;
        expect(isFocused(input)).to.be.false;
      });
    });

    describe('Events', () => {
      beforeEach(async () => {
        await createFixture(html`<igc-input></igc-input>`);
      });

      it('emits igcInput', async () => {
        const spy = vi.spyOn(element, 'emitEvent');

        simulateInput(input, { value: '123' });
        await elementUpdated(element);

        expect(spy).toHaveBeenCalledExactlyOnceWith('igcInput', {
          detail: '123',
        });
      });

      it('emits igcChange', async () => {
        simulateInput(input, { value: '123' });
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');
        input.dispatchEvent(new Event('change'));

        expect(spy).toHaveBeenCalledExactlyOnceWith('igcChange', {
          detail: '123',
        });
      });
    });
  });

  describe('issue-1066', () => {
    const _expectedValidation = Symbol();
    type TestBedInput = IgcInputComponent & { [_expectedValidation]: boolean };

    function validateInput(event: CustomEvent<string>) {
      const element = event.target as TestBedInput;
      expect(element.checkValidity()).to.equal(element[_expectedValidation]);
    }

    function getInternalInput(element: IgcInputComponent) {
      return element.shadowRoot!.querySelector('input')!;
    }

    function setExpectedValidationState(
      state: boolean,
      element: IgcInputComponent
    ) {
      (element as TestBedInput)[_expectedValidation] = state;
    }

    const spec = createFormAssociatedTestBed<IgcInputComponent>(
      html`<igc-input
        name="input"
        type="email"
        required
        @igcInput=${validateInput}
      ></igc-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcInputComponent.tagName);
    });

    it('synchronously validates component', async () => {
      const input = getInternalInput(spec.element);

      // Invalid email
      setExpectedValidationState(false, spec.element);
      simulateInput(input, { value: '1' });
      await elementUpdated(spec.element);

      // Invalid email
      simulateInput(input, { value: '1@' });
      await elementUpdated(spec.element);

      // Valid email
      setExpectedValidationState(true, spec.element);
      simulateInput(input, { value: '1@1' });
      await elementUpdated(spec.element);

      // Valid email, required invalidates
      setExpectedValidationState(false, spec.element);
      simulateInput(input);
      await elementUpdated(spec.element);
    });
  });

  describe('issue-1521', () => {
    let input: IgcInputComponent;

    beforeEach(async () => {
      input = await fixture<IgcInputComponent>(html`
        <igc-input type="number" step="0.1"></igc-input>
      `);
    });

    it('', () => {
      input.value = '1';
      expect(input.checkValidity()).to.be.true;

      input.value = '1.1';
      expect(input.checkValidity()).to.be.true;

      input.value = '1.11';
      expect(input.checkValidity()).to.be.false;

      input.step = 0.01;
      expect(input.checkValidity()).to.be.true;
    });
  });

  describe('issue-1632', () => {
    let input: IgcInputComponent;

    beforeEach(async () => {
      input = await fixture(html`<igc-input></igc-input>`);
    });

    it('should not enter `invalid` state when not dirty and pristine with dynamic validator props', () => {
      expect(input.invalid).to.be.false;

      // Set required property on a pristine, non-touched input
      // Invalid styles should not be applied
      input.required = true;
      expect(input.invalid).to.be.false;

      // Transition to "touched" state
      // Invalid styles should be applied
      input.focus();
      input.blur();
      expect(input.invalid).to.be.true;
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcInputComponent>(
      html`<igc-input name="input"></igc-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcInputComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', () => {
      spec.assertSubmitHasValue(null);
    });

    it('is associated on submit', () => {
      spec.setProperties({ value: 'abc' });
      spec.assertSubmitHasValue('abc');
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: 'abc' });
      spec.reset();

      expect(spec.element.value).to.be.empty;
    });

    it('is correctly reset on form reset after setAttribute() call', () => {
      spec.setAttributes({ value: 'Some initial value' });
      spec.setProperties({ value: '123123' });
      spec.reset();

      expect(spec.element.value).to.equal('Some initial value');
      spec.assertSubmitHasValue('Some initial value');
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

    it('fulfils min value constraint', () => {
      spec.setProperties({ type: 'number', min: 3, value: '2' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '5' });
      spec.assertSubmitPasses();
    });

    it('fulfils max value constraint', () => {
      spec.setProperties({ type: 'number', max: 7, value: '17' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '5' });
      spec.assertSubmitPasses();
    });

    it('fulfils step constraint', () => {
      spec.setProperties({ type: 'number', step: 3, value: '4' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '9' });
      spec.assertSubmitPasses();
    });

    it('fulfils minimum length constraint', () => {
      spec.setProperties({ minLength: 3, value: 'a' });
      spec.assertSubmitFails();

      spec.setProperties({ value: 'abc' });
      spec.assertSubmitPasses();
    });

    it('fulfils maximum length constraint', () => {
      spec.setProperties({ maxLength: 3, value: 'abcd' });
      spec.assertSubmitFails();

      spec.setProperties({ value: 'abc' });
      spec.assertSubmitPasses();
    });

    it('fulfils pattern constraint', () => {
      spec.setProperties({ pattern: '[0-9]{3}', value: 'abc' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '111' });
      spec.assertSubmitPasses();
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });

    it('validates schema types - email', () => {
      spec.setProperties({ type: 'email', value: '123' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '123@' });
      spec.assertSubmitFails();

      spec.setProperties({ value: '123@321' });
      spec.assertSubmitPasses();
    });

    it('validates schema types - url', () => {
      spec.setProperties({ type: 'url', value: '123' });
      spec.assertSubmitFails();

      spec.setProperties({
        value: 'https://github.com/IgniteUI/igniteui-webcomponents',
      });
      spec.assertSubmitPasses();
    });
  });

  describe('defaultValue', () => {
    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcInputComponent>(html`
        <igc-input name="input" .defaultValue=${'abc'}></igc-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcInputComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.equal('abc');
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(spec.element.value);
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: 'cba' });
        spec.reset();

        expect(spec.element.value).to.equal('abc');
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcInputComponent>(html`
        <igc-input name="input" required></igc-input>
      `);

      beforeEach(async () => {
        await spec.setup(IgcInputComponent.tagName);
      });

      it('fails required validation', () => {
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation', () => {
        spec.setProperties({ defaultValue: 'abc' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails minlength validation', () => {
        spec.setProperties({ minLength: 3, defaultValue: 'ab' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes minlength validation', () => {
        spec.setProperties({ minLength: 3, defaultValue: 'abc' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails maxlength validation', () => {
        spec.setProperties({ maxLength: 3, defaultValue: 'abcd' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes maxlength validation', () => {
        spec.setProperties({ maxLength: 3, defaultValue: 'abc' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails pattern validation', () => {
        spec.setProperties({ pattern: '[0-9]{3}', defaultValue: 'abc' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes pattern validation', () => {
        spec.setProperties({ pattern: '[0-9]{3}', defaultValue: '111' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails email schema validation', () => {
        spec.setProperties({ type: 'email', defaultValue: '123' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes email schema validation', () => {
        spec.setProperties({ type: 'email', defaultValue: '123@321' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails url schema validation', () => {
        spec.setProperties({ type: 'url', defaultValue: '123' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes url schema validation', () => {
        spec.setProperties({
          type: 'url',
          defaultValue: 'https://github.com/IgniteUI/igniteui-webcomponents',
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails min validation', () => {
        spec.setProperties({ type: 'number', min: 3, defaultValue: '1' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes min validation', () => {
        spec.setProperties({ type: 'number', min: 3, defaultValue: '4' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails max validation', () => {
        spec.setProperties({ type: 'number', max: 3, defaultValue: '4' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes max validation', () => {
        spec.setProperties({ type: 'number', max: 3, defaultValue: '3' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails step validation', () => {
        spec.setProperties({ type: 'number', step: 3, defaultValue: '4' });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes step validation', () => {
        spec.setProperties({ type: 'number', step: 3, defaultValue: '9' });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcInputComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['typeMismatch'], props: { type: 'email', value: 'a' } }, // type-mismatch slot
          {
            slots: ['patternMismatch'],
            props: { pattern: 'd{3}', value: 'a' },
          }, // pattern-mismatch slot
          { slots: ['tooLong'], props: { maxLength: 3, value: '123123' } }, // too-long slot
          { slots: ['tooShort'], props: { minLength: 3, value: 'a' } }, // too-short slot
          {
            slots: ['rangeOverflow'],
            props: { type: 'number', max: 3, value: '5' }, // range-overflow slot
          },
          {
            slots: ['rangeUnderflow'],
            props: { type: 'number', min: 3, value: '-3' },
          }, // range-underflow
          {
            slots: ['stepMismatch'],
            props: { type: 'number', step: 2, value: '3' }, // step-mismatch slot
          },
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
          {
            slots: ['typeMismatch', 'tooShort'],
            props: { type: 'email', minLength: 8, value: 'a' }, // multiple validation slots
          },
        ];

      runValidationContainerTests(IgcInputComponent, testParameters);
    });
  });
});
