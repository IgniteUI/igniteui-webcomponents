import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import '../../../index.js';
import type IgcInputComponent from './input';

describe('Input component', () => {
  let el: IgcInputComponent;
  let input: HTMLInputElement;

  describe('', () => {
    beforeEach(async () => {
      el = await createInputComponent();
      input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    });

    it('is initialized with the proper default values', async () => {
      expect(el.size).to.equal('large');
      expect(el.type).to.equal('text');
      expect(el.value).to.equal('');
      expect(el.invalid).to.be.false;
      expect(el.required).to.be.false;
      expect(el.readonly).to.be.false;
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
      el.minlength = 5;
      el.maxlength = 20;

      await elementUpdated(el);
      expect(input.minLength).to.equal(el.minlength);
      expect(input.maxLength).to.equal(el.maxlength);
    });

    it('sets the pattern property successfully', async () => {
      expect(input.pattern).to.equal('');
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
      el.readonly = true;
      expect(el.readonly).to.be.true;
      await elementUpdated(el);
      expect(input.readOnly).to.be.true;

      el.readonly = false;
      expect(el.readonly).to.be.false;
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

    it('changes size property values successfully', async () => {
      el.size = 'medium';
      expect(el.size).to.equal('medium');
      await elementUpdated(el);

      el.size = 'small';
      expect(el.size).to.equal('small');
      await elementUpdated(el);

      el.size = 'large';
      expect(el.size).to.equal('large');
      await elementUpdated(el);
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

    it('should focus/blur the wrapped base element when the methods are called', () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.focus();

      expect(el.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit focus/blur events when methods are called', () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.focus();

      expect(el.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });
  });

  const createInputComponent = (template = '<igc-input></igc-input>') => {
    return fixture<IgcInputComponent>(html`${unsafeStatic(template)}`);
  };
});
