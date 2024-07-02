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
  checkValidationSlots,
  simulateInput,
  simulateScroll,
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
      const eventSpy = spy(element, 'emitEvent');

      element.focus();
      expect(textArea.matches(':focus')).to.be.true;
      expect(eventSpy).calledOnceWithExactly('igcFocus');
    });

    it('blur()', async () => {
      element.focus();

      const eventSpy = spy(element, 'emitEvent');

      element.blur();
      expect(textArea.matches(':focus')).to.be.false;
      expect(eventSpy).calledOnceWithExactly('igcBlur');
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

      await simulateScroll(element, { top: yDelta, left: xDelta });
      expect([textArea.scrollLeft, textArea.scrollTop]).to.eql([
        xDelta,
        yDelta,
      ]);

      await simulateScroll(element, { top: yDelta * 2, left: xDelta * 2 });
      expect([textArea.scrollLeft, textArea.scrollTop]).to.eql([
        xDelta * 2,
        yDelta * 2,
      ]);
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcTextareaComponent>(
      html`<igc-textarea name="textarea"></igc-textarea>`
    );

    beforeEach(async () => {
      await spec.setup(IgcTextareaComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', async () => {
      spec.element.value = 'abc';
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 'abc';
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.be.empty;
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

    it('fulfils min length constraint', async () => {
      spec.element.minLength = 4;
      spec.element.value = 'abc';
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.value = 'abcd';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils max length constraint', async () => {
      spec.element.maxLength = 3;
      spec.element.value = 'abcd';
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.value = 'abc';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });

  describe('Validation message slots', () => {
    async function createFixture(template: TemplateResult) {
      element = await fixture<IgcTextareaComponent>(template);
    }

    it('renders too-long slot', async () => {
      await createFixture(html`
        <igc-textarea maxlength="3">
          1234
          <div slot="too-long"></div>
        </igc-textarea>
      `);

      await checkValidationSlots(element, 'tooLong');
    });

    it('renders too-short slot', async () => {
      await createFixture(html`
        <igc-textarea minlength="3">
          <div slot="too-short"></div>
        </igc-textarea>
      `);

      await checkValidationSlots(element, 'tooShort');
    });

    it('renders value-missing slot', async () => {
      await createFixture(html`
        <igc-textarea required>
          <div slot="value-missing"></div>
        </igc-textarea>
      `);

      await checkValidationSlots(element, 'valueMissing');
    });

    it('renders invalid slot', async () => {
      await createFixture(html`
        <igc-textarea required>
          <div slot="invalid"></div>
        </igc-textarea>
      `);

      await checkValidationSlots(element, 'invalid');
    });

    it('renders custom-error slot', async () => {
      await createFixture(html`
        <igc-textarea>
          <div slot="custom-error"></div>
        </igc-textarea>
      `);

      element.setCustomValidity('invalid');
      await checkValidationSlots(element, 'customError');
    });
  });
});
