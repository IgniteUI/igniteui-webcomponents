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
  type ValidationContainerTestsParams,
  createFormAssociatedTestBed,
  isFocused,
  runValidationContainerTests,
  simulateInput,
} from '../common/utils.spec.js';
import IgcTextareaComponent from './textarea.js';

describe('Textarea component', () => {
  before(() => {
    defineComponents(IgcTextareaComponent);
  });

  let element: IgcTextareaComponent;
  let textArea: HTMLTextAreaElement;

  async function createFixture(template: TemplateResult) {
    element = await fixture<IgcTextareaComponent>(template);
    textArea = element.renderRoot.querySelector('textarea')!;
  }

  describe('Defaults', () => {
    it('is accessible', async () => {
      await createFixture(html`<igc-textarea label="Label"></igc-textarea>`);

      await expect(element).to.be.accessible();
      await expect(element).shadowDom.to.be.accessible();
    });

    it('material variant layout', async () => {
      configureTheme('material');
      await createFixture(html`<igc-textarea></igc-textarea>`);

      expect(element.renderRoot.querySelector('[part="notch"]')).to.exist;

      // Reset theme
      configureTheme('bootstrap');
      await nextFrame();
    });

    it('auto sizing is applied', async () => {
      await createFixture(
        html`<igc-textarea resize="auto" rows="1"></igc-textarea>`
      );
      const initialHeight = textArea.scrollHeight;

      simulateInput(textArea, { value: [1, 2, 3, 4, 5, 6].join('\n') });
      await elementUpdated(element);

      const intermediateHeight = textArea.scrollHeight;
      expect(intermediateHeight).greaterThan(initialHeight);

      simulateInput(textArea, { value: '' });
      await elementUpdated(element);

      const finalHeight = textArea.scrollHeight;
      expect(finalHeight).lessThan(intermediateHeight);
      expect(finalHeight).to.equal(initialHeight);
    });
  });

  describe('Setting value through attribute and projection', () => {
    const value = 'Hello world!';

    it('through attribute', async () => {
      await createFixture(html`<igc-textarea value=${value}></igc-textarea>`);
      expect(element.value).to.equal(value);
    });

    it('through slot projection', async () => {
      await createFixture(html`<igc-textarea>${value}</igc-textarea>`);
      expect(element.value).to.equal(value);
    });

    it('priority of slot over attribute value binding', async () => {
      await createFixture(
        html`<igc-textarea value="ignored">${value}</igc-textarea>`
      );

      expect(element.value).to.equal(value);
    });

    it('reflects on slot change state', async () => {
      await createFixture(html`<igc-textarea>${value}</igc-textarea>`);
      const additional = ['...', 'Goodbye world!'];

      element.append(...additional);
      await elementUpdated(element);

      expect(element.value).to.equal([value, ...additional].join('\r\n'));
    });

    it('issue #1206 - passing undefined sets the underlying textarea value to undefined', async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea></igc-textarea>`
      );
      textArea = element.renderRoot.querySelector('textarea')!;

      element.value = 'a';
      await elementUpdated(element);

      expect(element.value).to.equal('a');
      expect(textArea.value).to.equal('a');

      element.value = undefined as any;
      await elementUpdated(element);

      expect(element.value).to.be.empty;
      expect(textArea.value).to.be.empty;
    });

    it('issue #1686 - dynamic prefix/suffix slot manipulation', async () => {
      element = await fixture(html`
        <igc-textarea>
          <span slot="prefix">Prefix</span>
          <span slot="suffix">Suffix</span>
        </igc-textarea>
      `);

      const prefix = element.querySelector<HTMLElement>('[slot="prefix"]')!;
      const suffix = element.querySelector<HTMLElement>('[slot="suffix"]')!;

      const prefixPart =
        element.renderRoot.querySelector<HTMLElement>('[part="prefix"]')!;
      const suffixPart =
        element.renderRoot.querySelector<HTMLElement>('[part="suffix"]')!;

      expect(prefixPart.hidden).to.be.false;
      expect(suffixPart.hidden).to.be.false;

      prefix.remove();
      suffix.remove();
      await elementUpdated(element);

      expect(prefixPart.hidden).to.be.true;
      expect(suffixPart.hidden).to.be.true;
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      await createFixture(html`<igc-textarea></igc-textarea>`);
    });

    it('igcInput', async () => {
      const eventSpy = spy(element, 'emitEvent');

      simulateInput(textArea, { value: '123' });
      await elementUpdated(element);

      expect(eventSpy).calledOnceWithExactly('igcInput', { detail: '123' });
      expect(element.value).to.equal(textArea.value);
    });

    it('igcChange', async () => {
      const eventSpy = spy(element, 'emitEvent');

      textArea.value = '20230317';
      textArea.dispatchEvent(new Event('change'));

      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: '20230317',
      });
      expect(element.value).to.equal(textArea.value);
    });
  });

  describe('Methods API', () => {
    const projected = 'Hello world!';

    beforeEach(async () => {
      await createFixture(html`<igc-textarea>${projected}</igc-textarea>`);
    });

    it('select()', async () => {
      element.select();
      const [start, end] = [textArea.selectionStart, textArea.selectionEnd];

      expect([start, end]).to.eql([0, projected.length]);
    });

    it('setSelectionRange()', async () => {
      element.setSelectionRange(0, 'Hello'.length);
      const [start, end] = [textArea.selectionStart, textArea.selectionEnd];

      expect([start, end]).to.eql([0, 'Hello'.length]);
    });

    it('setRangeText()', async () => {
      element.setRangeText('Goodbye', 0, 'Hello'.length, 'select');
      const [start, end] = [textArea.selectionStart, textArea.selectionEnd];

      expect([start, end]).to.eql([0, 'Goodbye'.length]);
      expect(element.value).to.equal('Goodbye world!');
    });

    it('focus()', async () => {
      element.focus();
      expect(isFocused(element)).to.be.true;
      expect(isFocused(textArea)).to.be.true;
    });

    it('blur()', async () => {
      element.focus();
      expect(isFocused(element)).to.be.true;
      expect(isFocused(textArea)).to.be.true;

      element.blur();
      expect(isFocused(element)).to.be.false;
      expect(isFocused(textArea)).to.be.false;
    });

    it('scroll()', async () => {
      const text = new Text(
        Array.from({ length: 100 }, (_, idx) => ` ${idx}`.repeat(250)).join(
          '\n'
        )
      );
      const [xDelta, yDelta] = [250, 250];

      element.wrap = 'off';
      element.appendChild(text);
      await elementUpdated(element);

      element.scrollTo({ top: yDelta, left: xDelta });
      expect([textArea.scrollLeft, textArea.scrollTop]).to.eql([
        xDelta,
        yDelta,
      ]);

      element.scrollTo({ top: yDelta * 2, left: xDelta * 2 });
      expect([textArea.scrollLeft, textArea.scrollTop]).to.eql([
        xDelta * 2,
        yDelta * 2,
      ]);

      element.scrollTo(0, 0);
      expect([textArea.scrollLeft, textArea.scrollTop]).to.eql([0, 0]);
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcTextareaComponent>(
      html`<igc-textarea name="textarea"></igc-textarea>`
    );

    beforeEach(async () => {
      await spec.setup(IgcTextareaComponent.tagName);
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

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: 'abc' });

      spec.reset();
      expect(spec.element.value).to.be.empty;
    });

    it('is correctly reset on form reset after setAttribute() call', () => {
      spec.setAttributes({ value: 'Some initial value' });
      spec.setProperties({ value: '123' });

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

    it('fulfils min length constraint', () => {
      spec.setProperties({
        minLength: 4,
        value: 'abc',
      });

      spec.assertSubmitFails();

      spec.setProperties({ value: 'abcd' });
      spec.assertSubmitPasses();
    });

    it('fulfils max length constraint', () => {
      spec.setProperties({
        maxLength: 3,
        value: 'abcd',
      });

      spec.assertSubmitFails();

      spec.setProperties({ value: 'abc' });
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
      const spec = createFormAssociatedTestBed<IgcTextareaComponent>(html`
        <igc-textarea name="textarea" .defaultValue=${'Hello'}></igc-textarea>
      `);

      beforeEach(async () => {
        await spec.setup(IgcTextareaComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.equal('Hello');
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(spec.element.value);
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: 'World' });
        spec.reset();

        expect(spec.element.value).to.equal('Hello');
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcTextareaComponent>(html`
        <igc-textarea
          name="textarea"
          required
          .defaultValue=${undefined}
        ></igc-textarea>
      `);

      beforeEach(async () => {
        await spec.setup(IgcTextareaComponent.tagName);
      });

      it('fails required validation', () => {
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation when updating defaultValue', () => {
        spec.setProperties({ defaultValue: 'Hello' });

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
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcTextareaComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['tooLong'], props: { maxLength: 3, value: '1234' } }, // too-long slot
          { slots: ['tooShort'], props: { minLength: 3, value: '12' } }, // too-short slot
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcTextareaComponent, testParameters);
    });
  });
});
