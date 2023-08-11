import {
  elementUpdated,
  expect,
  fixture,
  fixtureCleanup,
  html,
} from '@open-wc/testing';
import { nothing } from 'lit';
import sinon from 'sinon';
import {
  defineComponents,
  IgcRatingComponent,
  IgcRatingSymbolComponent,
} from '../../index.js';
import { FormAssociatedTestBed } from '../common/utils.spec.js';

describe('Rating component', () => {
  before(() => {
    defineComponents(IgcRatingComponent);
  });

  const getRatingSymbols = (el: IgcRatingComponent) =>
    el.shadowRoot!.querySelectorAll(
      'igc-rating-symbol'
    ) as NodeListOf<IgcRatingSymbolComponent>;
  const getProjectedSymbols = (el: IgcRatingComponent) => {
    const slot = el.shadowRoot!.querySelector(
      'slot[name="symbol"]'
    ) as HTMLSlotElement;
    return slot
      .assignedElements()
      .filter((el) => el.matches('igc-rating-symbol'));
  };
  const getRatingWrapper = (el: IgcRatingComponent) =>
    el.shadowRoot!.querySelector(`[part='base']`) as HTMLElement;
  const fireKeyboardEvent = (key: string) =>
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true });
  const fireMouseEvent = (type: string, opts: MouseEventInit) =>
    new MouseEvent(type, opts);
  const getBoundingRect = (el: Element) => el.getBoundingClientRect();
  let el: IgcRatingComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await fixture<IgcRatingComponent>(html`<igc-rating></igc-rating>`);
    });

    it('is initialized with the proper default values', async () => {
      expect(el.size).to.equal('large');
      expect(el.max).to.equal(5);
      expect(el.hasAttribute('disabled')).to.be.false;
      expect(el.hasAttribute('hover')).to.be.false;
      expect(el.hasAttribute('readonly')).to.be.false;
      expect(el.name).to.be.undefined;
      expect(el.label).to.be.undefined;
    });

    it('is initialized correctly with passed attributes', async () => {
      const value = 10,
        max = 10,
        name = 'rating',
        label = 'Test rating',
        size = 'small';

      el = await fixture<IgcRatingComponent>(
        html`<igc-rating
          value=${value}
          size=${size}
          max=${max}
          name=${name}
          label=${label}
        ></igc-rating>`
      );

      expect(el.value).to.equal(value);
      expect(el.max).to.equal(max);
      expect(el.name).to.equal(name);
      expect(el.label).to.equal(label);
      expect(el.size).to.equals(size);
    });

    it('value is truncated if greater than `max` attribute', async () => {
      const value = 15,
        max = 10,
        name = 'rating',
        label = 'Test rating',
        size = 'small';

      el = await fixture<IgcRatingComponent>(
        html`<igc-rating
          value=${value}
          size=${size}
          max=${max}
          name=${name}
          label=${label}
        ></igc-rating>`
      );

      expect(el.value).not.to.equal(value);
      expect(el.value).to.equal(max);
      expect(el.max).to.equal(max);
      expect(el.name).to.equal(name);
      expect(el.label).to.equal(label);
      expect(el.size).to.equals(size);
    });

    it('out of bounds value is normalized', async () => {
      el.max = 10;
      el.value = 20;
      el.step = 10;
      await elementUpdated(el);

      expect(el.value).to.equal(10);
      expect(el.step).to.equal(1);

      el.value = -10;
      el.step = -1;
      await elementUpdated(el);

      expect(el.value).to.equal(0);
      expect(el.step).to.equal(0.001);
    });

    it('it is accessible', async () => {
      el.label = 'Rating';
      await elementUpdated(el);
      await expect(el).to.be.accessible();
    });

    it('has appropriately set ARIA attributes', async () => {
      const label = 'Test Rating';

      el.label = label;
      el.max = 10;
      await elementUpdated(el);

      expect(getRatingWrapper(el).getAttribute('aria-valuenow')).to.equal('0');
      expect(getRatingWrapper(el).getAttribute('aria-valuemax')).to.equal('10');

      expect(el.shadowRoot!.querySelector('[part="label"]')?.textContent).to.eq(
        label
      );

      el.value = 7;
      await elementUpdated(el);
      expect(getRatingWrapper(el).getAttribute('aria-valuenow')).to.equal('7');
    });

    it('correctly reflects value-format', async () => {
      el.value = 3;
      await elementUpdated(el);

      expect(getRatingWrapper(el).getAttribute('aria-valuetext')).to.equal(
        '3 of 5'
      );

      el.valueFormat = 'You have selected {0}';
      el.max = 9;
      el.value = 6;

      await elementUpdated(el);

      expect(getRatingWrapper(el).getAttribute('aria-valuetext')).to.equal(
        'You have selected 6'
      );

      el.valueFormat = 'Selected {0} of {1}';
      el.step = 0.1;
      el.value = 5.2;
      await elementUpdated(el);

      expect(getRatingWrapper(el).getAttribute('aria-valuetext')).to.equal(
        'Selected 5.2 of 9'
      );
    });

    it('correctly renders default symbols', async () => {
      const rating = await fixture<IgcRatingComponent>(
        html`<igc-rating max="10"></igc-rating>`
      );
      const symbols = getRatingSymbols(rating);

      expect(symbols.length).to.equal(10);

      symbols.forEach((symbol) => {
        // in lieu of actual rendered check or more comprehensive symbol checks:
        expect(symbol.offsetParent).to.be.ok;
        expect(symbol.getClientRects()).to.not.be.empty;
      });
    });

    it('correctly renders either default or projected symbols', async () => {
      const renderCustomSymbols = () => html`
        <igc-rating-symbol>🐝</igc-rating-symbol>
        <igc-rating-symbol>🐝</igc-rating-symbol>
        <igc-rating-symbol>🐝</igc-rating-symbol>
      `;
      const renderRating = (custom = false) => html`
        <igc-rating> ${custom ? renderCustomSymbols() : nothing} </igc-rating>
      `;
      let rating = await fixture<IgcRatingComponent>(renderRating());

      expect(getProjectedSymbols(rating)).to.be.empty;
      const symbols = getRatingSymbols(rating);

      expect(symbols).to.have.lengthOf(rating.max);
      symbols.forEach((symbol) => {
        expect(symbol.offsetParent).to.be.ok;
        expect(symbol.getClientRects()).to.not.be.empty;
      });

      fixtureCleanup();
      rating = await fixture<IgcRatingComponent>(renderRating(true));

      expect(getProjectedSymbols(rating)).to.have.lengthOf(3);
      getRatingSymbols(rating).forEach((symbol) => {
        expect(symbol.offsetParent).to.be.null;
        expect(symbol.getClientRects()).to.be.empty;
      });
    });

    it('correctly renders symbols passed through igc-rating-symbol', async () => {
      const projected = await fixture<IgcRatingComponent>(
        html`<igc-rating>
          <igc-rating-symbol>🐝</igc-rating-symbol>
          <igc-rating-symbol>🐝</igc-rating-symbol>
          <igc-rating-symbol>🐝</igc-rating-symbol>
        </igc-rating>`
      );

      expect(projected.max).to.equal(3);

      getProjectedSymbols(projected).forEach((symbol) =>
        expect(symbol.textContent).to.eq('🐝')
      );
    });

    it('sets max value correctly when igc-rating-symbols are projected', async () => {
      const projected = await fixture<IgcRatingComponent>(
        html`<igc-rating>
          <igc-rating-symbol>🐝</igc-rating-symbol>
          <igc-rating-symbol>🐝</igc-rating-symbol>
          <igc-rating-symbol>🐝</igc-rating-symbol>
        </igc-rating>`
      );

      expect(projected.max).to.equal(3);

      projected.max = 10;
      await elementUpdated(projected);

      expect(projected.max).to.equal(3);
    });

    it('correctly reflects stepUp calls', async () => {
      el.step = 0.5;
      el.stepUp();
      await elementUpdated(el);

      expect(el.value).to.equal(0.5);
      el.stepUp(3);
      await elementUpdated(el);
      expect(el.value).to.equal(2);
    });

    it('correctly reflects stepDown calls', async () => {
      el.step = 0.5;
      el.value = 5;
      await elementUpdated(el);

      el.stepDown(5);
      await elementUpdated(el);
      expect(el.value).to.equal(2.5);
    });

    it('correctly updates value on click', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      const symbol = getRatingSymbols(el).item(2);
      const { x, width } = getBoundingRect(symbol);
      symbol.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x + width / 2,
        })
      );
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 3 });
      expect(el.value).to.equal(3);
    });

    it('correctly updates value on click [precision != 1]', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.step = 0.5;
      await elementUpdated(el);

      const symbol = getRatingSymbols(el).item(2);
      const { x, width } = getBoundingRect(symbol);
      symbol.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x + width / 4,
        })
      );
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: 2.5 });
      expect(el.value).to.equal(2.5);
    });

    it('correctly reflects hover state', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.value = 2;
      el.hoverPreview = true;
      await elementUpdated(el);
      const symbol = getRatingSymbols(el).item(2);
      const { x, width } = getBoundingRect(symbol);

      symbol.dispatchEvent(
        fireMouseEvent('mousemove', {
          bubbles: true,
          composed: true,
          clientX: x + width / 2,
        })
      );
      expect(eventSpy).calledOnceWithExactly('igcHover', { detail: 3 });
      expect(el.value).to.equal(2);
    });

    it('correctly resets value if the same rating value is clicked', async () => {
      el.value = 5;
      await elementUpdated(el);
      const symbol = getRatingSymbols(el).item(4);
      const { x, width } = getBoundingRect(symbol);

      symbol.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x + width / 2,
        })
      );
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
      el.readonly = true;
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
      el.max = 10;
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

    it('sets step to 1 if in single selection mode', async () => {
      el.step = 0.1;
      el.single = true;

      await elementUpdated(el);
      expect(el.step).to.equal(1);
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcRatingComponent>(
      html`<igc-rating name="rating" value="3"></igc-rating>`
    );

    beforeEach(async () => {
      await spec.setup(IgcRatingComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.equal('3');
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 4;
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.equal(3);
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils custom constraints', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });
});
