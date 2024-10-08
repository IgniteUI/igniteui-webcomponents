import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import { configureTheme } from '../../theming/config.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  type ValidationContainerTestsParams,
  isFocused,
  runValidationContainerTests,
  simulateInput,
} from '../common/utils.spec.js';
import IgcInputComponent from './input.js';

describe('Input component', () => {
  before(() => {
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

        element.name = 'tupni';
        await elementUpdated(element);

        expect(element.name).to.equal('tupni');
        expect(input.name).to.equal('tupni');
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

        expect(element.min).to.equal('3');
        expect(element.max).to.equal('6');
        expect(input.min).to.equal('3');
        expect(input.max).to.equal('6');

        expect(element.checkValidity()).to.be.false;

        Object.assign(element, { min: '1', max: '2' });
        await elementUpdated(element);

        expect(element.min).to.equal('1');
        expect(element.max).to.equal('2');
        expect(input.min).to.equal('1');
        expect(input.max).to.equal('2');

        expect(element.checkValidity()).to.be.false;
      });

      it('sets the minLength and maxLength properties', async () => {
        await createFixture(
          html`<igc-input minlength="2" maxlength="4"></igc-input>`
        );

        expect(element.minLength).to.equal(2);
        expect(element.maxLength).to.equal(4);
        expect(input.minLength).to.equal(2);
        expect(input.maxLength).to.equal(4);

        expect(element.checkValidity()).to.be.false;

        Object.assign(element, { minLength: 1, maxLength: 2 });
        await elementUpdated(element);

        expect(element.minLength).to.equal(1);
        expect(element.maxLength).to.equal(2);
        expect(input.minLength).to.equal(1);
        expect(input.maxLength).to.equal(2);

        expect(element.checkValidity()).to.be.false;
      });

      it('sets the pattern property', async () => {
        await createFixture(html`<igc-input pattern="d{3}"></igc-input>`);

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
        const eventSpy = spy(element, 'emitEvent');

        simulateInput(input, { value: '123' });
        await elementUpdated(element);

        expect(eventSpy).calledOnceWithExactly('igcInput', { detail: '123' });
      });

      it('emits igcChange', async () => {
        simulateInput(input, { value: '123' });
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');
        input.dispatchEvent(new Event('change'));

        expect(eventSpy).calledOnceWithExactly('igcChange', { detail: '123' });
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

    const spec = new FormAssociatedTestBed<IgcInputComponent>(
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

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcInputComponent>(
      html`<igc-input name="input"></igc-input>`
    );

    beforeEach(async () => {
      await spec.setup(IgcInputComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', async () => {
      spec.element.value = 'abc';

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 'abc';
      spec.reset();

      expect(spec.element.value).to.be.empty;
    });

    it('is correctly reset on form reset after setAttribute() call', () => {
      spec.element.setAttribute('value', 'Some initial value');
      spec.element.value = '12313123';

      spec.reset();

      expect(spec.element.value).to.equal('Some initial value');
      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
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

    it('fulfils min value constraint', async () => {
      spec.element.type = 'number';
      spec.element.min = 3;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = '5';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils max value constraint', async () => {
      spec.element.type = 'number';
      spec.element.max = 7;
      spec.element.value = '17';
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = '5';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils step constraint', async () => {
      spec.element.type = 'number';
      spec.element.step = 3;
      spec.element.value = '4';
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = '9';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils minimum length constraint', async () => {
      spec.element.minLength = 3;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = 'abc';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils maximum length constraint', async () => {
      spec.element.value = 'abcd';
      spec.element.maxLength = 3;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = 'abc';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils pattern constraint', async () => {
      spec.element.value = 'abc';
      spec.element.pattern = '[0-9]{3}';
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = '111';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });

    it('validates schema types - email', async () => {
      spec.element.type = 'email';
      spec.element.value = '123';
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.value = '123@';
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.value = '123@321';
      await elementUpdated(spec.element);

      spec.submitValidates();
    });

    it('validates schema types - url', async () => {
      spec.element.type = 'url';
      spec.element.value = '123';
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.value = 'https://github.com/IgniteUI/igniteui-webcomponents';
      await elementUpdated(spec.element);

      spec.submitValidates();
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcInputComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['typeMismatch'], props: { type: 'email' } }, // type-mismatch slot
          { slots: ['patternMismatch'], props: { pattern: 'd{3}' } }, // pattern-mismatch slot
          { slots: ['tooLong'], props: { maxLength: 3, value: '123123' } }, // too-long slot
          { slots: ['tooShort'], props: { minLength: 3 } }, // too-short slot
          {
            slots: ['rangeOverflow'],
            props: { type: 'number', max: 3, value: '5' }, // range-overflow slot
          },
          { slots: ['rangeUnderflow'], props: { type: 'number', min: 3 } }, // range-underflow
          {
            slots: ['stepMismatch'],
            props: { type: 'number', step: 2, value: '3' }, // step-mismatch slot
          },
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
          {
            slots: ['typeMismatch', 'tooShort'],
            props: { type: 'email', minLength: 8 }, // multiple validation slots
          },
        ];

      runValidationContainerTests(IgcInputComponent, testParameters);
    });
  });
});
