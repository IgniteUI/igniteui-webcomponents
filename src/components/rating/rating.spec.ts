import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcRatingComponent } from '../../index.js';

describe('Rating component', () => {
  before(() => {
    defineComponents(IgcRatingComponent);
  });

  const getRatingSymbols = (el: IgcRatingComponent) =>
    el.shadowRoot!.querySelectorAll('igc-icon');
  const getRatingWrapper = (el: IgcRatingComponent) =>
    el.shadowRoot!.querySelector('div') as HTMLElement;
  const fireKeyboardEvent = (key: string) =>
    new KeyboardEvent('keydown', { key });
  let el: IgcRatingComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await fixture<IgcRatingComponent>(html`<igc-rating></igc-rating>`);
    });

    it('is initialized with the proper default values', async () => {
      expect(el.size).to.equal('large');
      expect(el.length).to.equal(5);
      expect(el.hasAttribute('disabled')).to.be.false;
      expect(el.hasAttribute('hover')).to.be.false;
      expect(el.hasAttribute('readonly')).to.be.false;
      expect(el.name).to.be.undefined;
      expect(el.label).to.be.undefined;
    });

    it('is initialized correctly with passed attributes', async () => {
      const value = 10,
        length = 10,
        name = 'rating',
        label = 'Test rating',
        size = 'small';

      el = await fixture<IgcRatingComponent>(
        html`<igc-rating
          value=${value}
          size=${size}
          length=${length}
          name=${name}
          label=${label}
        ></igc-rating>`
      );

      expect(el.value).to.equal(value);
      expect(el.length).to.equal(length);
      expect(el.name).to.equal(name);
      expect(el.label).to.equal(label);
      expect(el.size).to.equals(size);
    });

    it('value is truncated if greater than `length` attribute', async () => {
      const value = 15,
        length = 10,
        name = 'rating',
        label = 'Test rating',
        size = 'small';

      el = await fixture<IgcRatingComponent>(
        html`<igc-rating
          value=${value}
          size=${size}
          length=${length}
          name=${name}
          label=${label}
        ></igc-rating>`
      );

      expect(el.value).not.to.equal(value);
      expect(el.value).to.equal(length);
      expect(el.length).to.equal(length);
      expect(el.name).to.equal(name);
      expect(el.label).to.equal(label);
      expect(el.size).to.equals(size);
    });

    it('out of bounds value is normalized', async () => {
      el.length = 10;
      el.value = 20;
      await elementUpdated(el);

      expect(el.value).to.equal(10);

      el.value = -10;
      await elementUpdated(el);

      expect(el.value).to.equal(0);
    });

    it('has appropriately sets ARIA attributes', async () => {
      const label = 'Test Rating';

      el.label = label;
      el.length = 10;
      el.value = 7;
      await elementUpdated(el);

      expect(getRatingWrapper(el).getAttribute('aria-labelledby')).to.equal(
        label
      );
      expect(getRatingWrapper(el).getAttribute('aria-valuenow')).to.equal('7');
      expect(getRatingWrapper(el).getAttribute('aria-valuemax')).to.equal('10');
    });

    it('correctly updates value on click', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      getRatingSymbols(el).item(2).click();
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 3 });
    });

    it('correctly reflects hover state', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.hover = true;
      await elementUpdated(el);

      getRatingSymbols(el)
        .item(2)
        .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      expect(eventSpy).calledOnceWithExactly('igcHover', { detail: 3 });
      expect(el.value).to.equal(0);
    });

    it('correctly resets value if the same rating value is clicked', async () => {
      el.value = 5;
      await elementUpdated(el);

      getRatingSymbols(el).item(4).click();
      expect(el.value).to.equal(0);
    });

    it('does nothing on click if disabled', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.disabled = true;
      await elementUpdated(el);

      getRatingSymbols(el).item(3).click();
      expect(eventSpy).to.not.called;
      expect(el.value).to.equal(0);
    });

    it('does nothing on click if readonly', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.disabled = true;
      await elementUpdated(el);

      getRatingSymbols(el).item(3).click();
      expect(eventSpy).to.not.called;
      expect(el.value).to.equal(0);
    });

    it('correctly increments rating value with arrow keys', async () => {
      el.value = 3;
      await elementUpdated(el);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowRight'));
      expect(el.value).to.equal(4);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowUp'));
      expect(el.value).to.equal(5);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowRight'));
      expect(el.value).to.equal(5);
    });

    it('correctly decrements rating value with arrow keys', async () => {
      el.value = 2;
      await elementUpdated(el);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      expect(el.value).to.equal(1);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowDown'));
      expect(el.value).to.equal(0);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      expect(el.value).to.equal(0);
    });

    it('sets min/max rating value on Home/End keys', async () => {
      el.length = 10;
      el.value = 5;
      await elementUpdated(el);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('Home'));
      expect(el.value).to.equal(1);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('End'));
      expect(el.value).to.equal(10);
    });

    it('should not emit a change event if the value is unchanged', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.value = 5;

      await elementUpdated(el);

      getRatingWrapper(el).dispatchEvent(fireKeyboardEvent('ArrowRight'));
      expect(eventSpy).to.not.be.calledOnce;
    });
  });
});
