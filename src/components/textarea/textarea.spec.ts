import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcTextareaComponent from './textarea.js';

describe('Textarea component', () => {
  before(() => defineComponents(IgcTextareaComponent));

  let element: IgcTextareaComponent;
  let textArea: HTMLTextAreaElement;

  describe('Setting value through attribute and projection', () => {
    const value = 'Hello world!';

    it('through attribute', async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea value=${value}></igc-textarea>`
      );
      expect(element.value).to.equal(value);
    });

    it('through slot projection', async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea>${value}</igc-textarea>`
      );
      expect(element.value).to.equal(value);
    });

    it('priority of slot over attribute value binding', async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea value="ignored">${value}</igc-textarea>`
      );

      expect(element.value).to.equal(value);
    });

    it('reflects on slotchange state', async () => {
      const additional = ['...', 'Goodbye world!'];

      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea>${value}</igc-textarea>`
      );

      element.append(...additional);
      await elementUpdated(element);

      expect(element.value).to.equal([value, ...additional].join('\r\n'));
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea></igc-textarea>`
      );
      textArea = element.shadowRoot!.querySelector('textarea')!;
    });

    it('igcInput', async () => {
      const spy = sinon.spy(element, 'emitEvent');

      textArea.value = '123';
      textArea.dispatchEvent(new Event('input'));

      await elementUpdated(element);

      expect(spy).calledOnceWithExactly('igcInput', { detail: '123' });
      expect(element.value).to.equal(textArea.value);
    });

    it('igcChange', async () => {
      const spy = sinon.spy(element, 'emitEvent');

      textArea.value = '20230317';
      textArea.dispatchEvent(new Event('change'));

      expect(spy).calledOnceWithExactly('igcChange', { detail: '20230317' });
      expect(element.value).to.equal(textArea.value);
    });
  });

  describe('Methods API', () => {
    const projected = 'Hello world!';

    beforeEach(async () => {
      element = await fixture<IgcTextareaComponent>(
        html`<igc-textarea>${projected}</igc-textarea>`
      );
      textArea = element.shadowRoot!.querySelector('textarea')!;
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
      const spy = sinon.spy(element, 'emitEvent');

      element.focus();
      expect(textArea.matches(':focus')).to.be.true;
      expect(spy).calledOnceWithExactly('igcFocus');
    });

    it('blur()', async () => {
      element.focus();

      const spy = sinon.spy(element, 'emitEvent');

      element.blur();
      expect(textArea.matches(':focus')).to.be.false;
      expect(spy).calledOnceWithExactly('igcBlur');
    });

    it('scroll()', async () => {
      const text = new Text(
        Array.from({ length: 100 }, (_, idx) => ` ${idx}`.repeat(250)).join(
          '\n'
        )
      );
      const textarea = element.shadowRoot?.querySelector('textarea');
      const [xDelta, yDelta] = [250, 250];

      element.wrap = 'off';
      element.appendChild(text);
      await elementUpdated(element);

      element.scrollTo({ top: yDelta, left: xDelta });
      await elementUpdated(element);
      expect([textarea?.scrollLeft, textarea?.scrollTop]).to.eql([
        xDelta,
        yDelta,
      ]);

      element.scrollTo(xDelta * 2, yDelta * 2);
      await elementUpdated(element);
      expect([textarea?.scrollLeft, textarea?.scrollTop]).to.eql([
        xDelta * 2,
        yDelta * 2,
      ]);
    });
  });

  describe('Form integration', () => {
    // Once #726 is merged
  });
});
