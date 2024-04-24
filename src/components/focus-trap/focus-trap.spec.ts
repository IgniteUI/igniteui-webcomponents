import { expect, fixture, html } from '@open-wc/testing';

import IgcCalendarComponent from '../calendar/calendar.js';
import type IgcDaysViewComponent from '../calendar/days-view/days-view.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcFocusTrapComponent from './focus-trap.js';

describe('Focus trap', () => {
  before(() => defineComponents(IgcFocusTrapComponent, IgcCalendarComponent));

  let trap: IgcFocusTrapComponent;

  describe('Light DOM', () => {
    beforeEach(async () => {
      trap = await fixture(
        html` <igc-focus-trap>
          <button>1</button>
          <button disabled>2</button>
          <button aria-hidden="true">3</button>
          <button>4</button>
          <button>5</button>
          <input type="text" />
          <button tabindex="-1">6</button>
          <div .inert=${true}>
            <input type="text" />
          </div>
          <div hidden>
            <input type="text" />
          </div>
        </igc-focus-trap>`
      );
    });

    it('has correct number of focusable elements', () => {
      // 3 "active" buttons and an input that is not inside a "disabled" parent
      expect(trap.focusableElements).lengthOf(4);
    });

    it('`focused` property reflects focus within', () => {
      expect(trap.focused).to.be.false;

      trap.focusableElements.at(0)?.focus();

      expect(trap.focused).to.be.true;
    });

    it('correctly focuses first/last focusable element', () => {
      expect(document.activeElement).to.equal(document.body);

      trap.focusFirstElement();
      expect(document.activeElement).instanceOf(HTMLButtonElement);

      trap.focusLastElement();
      expect(document.activeElement).instanceOf(HTMLInputElement);
    });
  });

  describe('Shadow DOM', () => {
    beforeEach(async () => {
      trap = await fixture(
        html`<igc-focus-trap>
          <igc-calendar>
            <section slot="title">
              <input type="text" />
            </section>
          </igc-calendar>
        </igc-focus-trap>`
      );
    });

    it('has correct number of focusable elements', () => {
      let elements = trap.focusableElements;

      // One projected input + 4 navigation buttons in the calendar default view + 1 active date element = 6
      expect(elements).lengthOf(6);
      expect(elements.at(0)).instanceOf(HTMLInputElement);
      expect(elements.at(-1)).instanceOf(HTMLSpanElement);

      trap.querySelector('section')!.hidden = true;

      elements = trap.focusableElements;

      // The input is dropped since its parent is hidden in this case
      expect(elements).lengthOf(5);
      expect(elements.at(0)).instanceOf(HTMLButtonElement);
      expect(elements.at(-1)).instanceOf(HTMLSpanElement);
    });

    it('`focused` property reflects focus within', () => {
      expect(trap.focused).to.be.false;

      trap.focusableElements.at(0)?.focus();

      expect(trap.focused).to.be.true;
    });

    it('correctly focuses first/last focusable element', () => {
      const calendar = trap.querySelector(IgcCalendarComponent.tagName)!;
      // @ts-expect-error private access
      const daysView = calendar.daysViews[0] as IgcDaysViewComponent;

      expect(document.activeElement).to.equal(document.body);

      trap.focusFirstElement();
      expect(document.activeElement).instanceOf(HTMLInputElement);

      trap.focusLastElement();
      expect(document.activeElement).instanceOf(IgcCalendarComponent);
      expect(daysView.shadowRoot?.activeElement).instanceOf(HTMLSpanElement);
    });
  });
});
