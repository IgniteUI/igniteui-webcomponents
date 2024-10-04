import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  isFocused,
  simulateInput,
} from '../common/utils.spec.js';
import IgcInputComponent from './input.js';

describe('Input component', () => {
  before(() => {
    defineComponents(IgcInputComponent);
  });

  let el: IgcInputComponent;
  let input: HTMLInputElement;

  describe('', () => {
    beforeEach(async () => {
      el = await fixture<IgcInputComponent>(html`<igc-input></igc-input>`);
      input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    });

    it('is initialized with the proper default values', async () => {
      expect(el.type).to.equal('text');
      expect(el.value).to.be.empty;
      expect(el.invalid).to.be.false;
      expect(el.required).to.be.false;
      expect(el.readOnly).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.be.undefined;
      expect(el.pattern).to.be.undefined;
      expect(el.label).to.be.undefined;
      expect(el.autocomplete).to.be.undefined;
    });

    it('sets the type property successfully', async () => {
      const type = 'email';

      el.type = type;
      expect(el.type).to.equal(type);
      await elementUpdated(el);
      expect(input.type).to.equal(type);
    });

    it('sets the value property successfully', async () => {
      const value1 = 'value1';
      const value2 = 'value2';

      const el = await fixture<IgcInputComponent>(
        html`<igc-input value=${value1}></igc-input>`
      );
      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

      expect(el.value).to.equal(value1);
      await elementUpdated(el);
      expect(input.value).to.equal(value1);

      el.value = value2;
      expect(el.value).to.equal(value2);
      await elementUpdated(el);
      expect(input.value).to.equal(value2);
    });

    it('sets the name property successfully', async () => {
      const name = 'fruit';

      const el = await fixture<IgcInputComponent>(
        html`<igc-input name=${name}></igc-input>`
      );
      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

      expect(el.name).to.equal(name);
      await elementUpdated(el);
      expect(input.name).to.equal(name);
    });

    it('sets the placeholder property successfully', async () => {
      const placeholder = 'fruit';

      const el = await fixture<IgcInputComponent>(
        html`<igc-input placeholder=${placeholder}></igc-input>`
      );
      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

      expect(el.placeholder).to.equal(placeholder);
      await elementUpdated(el);
      expect(input.placeholder).to.equal(placeholder);
    });

    it('sets the label property successfully', async () => {
      const text = 'Label';
      const el = await fixture<IgcInputComponent>(
        html`<igc-input label=${text}></igc-input>`
      );
      const label = el.shadowRoot?.querySelector('label') as HTMLLabelElement;
      expect(el.label).to.equal(text);
      expect(label.innerText).to.equal(text);
    });

    it('sets the min and max properties successfully', async () => {
      el.type = 'number';
      el.min = '5';
      el.max = '10';

      await elementUpdated(el);
      expect(input.min).to.equal(el.min);
      expect(input.max).to.equal(el.max);
    });

    it('sets the minlength and maxlength properties successfully', async () => {
      el.type = 'number';
      el.minLength = 5;
      el.maxLength = 20;

      await elementUpdated(el);
      expect(input.minLength).to.equal(el.minLength);
      expect(input.maxLength).to.equal(el.maxLength);
    });

    it('sets the pattern property successfully', async () => {
      expect(input.pattern).to.be.empty;
      el.pattern = '123';

      await elementUpdated(el);
      expect(input.pattern).to.equal(el.pattern);
    });

    it('sets the required property successfully', async () => {
      el.required = true;
      expect(el.required).to.be.true;
      await elementUpdated(el);
      expect(input.required).to.be.true;

      el.required = false;
      expect(el.required).to.be.false;
      await elementUpdated(el);
      expect(input.required).to.be.false;
    });

    it('sets the readonly property successfully', async () => {
      el.readOnly = true;
      expect(el.readOnly).to.be.true;
      await elementUpdated(el);
      expect(input.readOnly).to.be.true;

      el.readOnly = false;
      expect(el.readOnly).to.be.false;
      await elementUpdated(el);
      expect(input.readOnly).to.be.false;
    });

    it('sets the autofocus property successfully', async () => {
      el.autofocus = true;
      expect(el.autofocus).to.be.true;
      await elementUpdated(el);
      expect((input as any).autofocus).to.be.true;

      el.autofocus = false;
      expect(el.autofocus).to.be.false;
      await elementUpdated(el);
      expect((input as any).autofocus).to.be.false;
    });

    it('sets the autocomplete property successfully', async () => {
      el.autocomplete = 'email';
      await elementUpdated(el);
      expect(input.autocomplete).to.equal(el.autocomplete);
    });

    it('sets the disabled property successfully', async () => {
      el.disabled = true;
      expect(el.disabled).to.be.true;
      await elementUpdated(el);
      expect(input.disabled).to.be.true;

      el.disabled = false;
      expect(el.disabled).to.be.false;
      await elementUpdated(el);
      expect(input.disabled).to.be.false;
    });

    it('should increment/decrement the value by calling the stepUp and stepDown methods', async () => {
      el.type = 'number';
      el.value = '10';
      el.step = 5;
      await elementUpdated(el);

      el.stepUp();
      expect(el.value).to.equal('15');
      el.stepDown();
      expect(el.value).to.equal('10');

      el.stepUp(2);
      expect(el.value).to.equal('20');
      el.stepDown(2);
      expect(el.value).to.equal('10');
    });

    it('should set text within selection range', async () => {
      el.type = 'text';
      el.value = 'the quick brown fox';
      await elementUpdated(el);

      el.setRangeText('slow', 4, 9, 'select');
      expect(el.value).to.equal('the slow brown fox');
    });

    it('should have correct focus states between Light/Shadow DOM', async () => {
      el.focus();
      expect(isFocused(el)).to.be.true;
      expect(isFocused(input)).to.be.true;

      el.blur();
      expect(isFocused(el)).to.be.false;
      expect(isFocused(input)).to.be.false;
    });

    it('issue #1026 - passing undefined sets the underlying input value to undefined', async () => {
      el.value = 'a';
      await elementUpdated(el);

      expect(el.value).to.equal('a');
      expect(input.value).to.equal('a');

      el.value = undefined as any;
      await elementUpdated(el);

      expect(el.value).to.be.empty;
      expect(input.value).to.be.empty;
    });
  });

  it('should reflect validation state when updating through attribute', async () => {
    el = await fixture<IgcInputComponent>(
      html`<igc-input required></igc-input>`
    );

    expect(el.reportValidity()).to.equal(false);

    el.value = '1';
    await elementUpdated(el);

    expect(el.reportValidity()).to.equal(true);
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
      simulateInput(input, '1');
      await elementUpdated(spec.element);

      // Invalid email
      simulateInput(input, '1@');
      await elementUpdated(spec.element);

      // Valid email
      setExpectedValidationState(true, spec.element);
      simulateInput(input, '1@1');
      await elementUpdated(spec.element);

      // Valid email, required invalidates
      setExpectedValidationState(false, spec.element);
      simulateInput(input, '');
      await elementUpdated(spec.element);
    });
  });
});
