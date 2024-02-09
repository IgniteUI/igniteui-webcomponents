import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import IgcCalendarComponent from './calendar.js';
import IgcDaysViewComponent from './days-view/days-view.js';
import { MONTHS_PER_ROW, YEARS_PER_ROW, getYearRange } from './helpers.js';
import { CalendarDay } from './model.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import IgcYearsViewComponent from './years-view/years-view.js';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  homeKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
  spaceBar,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { asNumber, first } from '../common/util.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';

describe('Calendar keyboard interaction', () => {
  before(() => defineComponents(IgcCalendarComponent));

  let calendar: IgcCalendarComponent;
  const activeDate = new Date(2021, 6, 17);

  describe('Focus state', () => {
    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(
        html`<igc-calendar .activeDate=${activeDate}></igc-calendar>`
      );
    });

    it('focus is retained when switching to month view', async () => {
      const dom = getCalendarDOM(calendar);
      const button = dom.navigation.months;

      // Simulate focus and activation
      button.focus();
      simulateClick(button);

      await elementUpdated(calendar);

      expect(document.activeElement).to.equal(calendar);
      expect(dom.active).to.not.be.undefined;
    });

    it('focus is retained when switching to year view', async () => {
      const dom = getCalendarDOM(calendar);
      const button = dom.navigation.years;

      // Simulate focus and activation
      button.focus();
      simulateClick(button);

      await elementUpdated(calendar);

      expect(document.activeElement).to.equal(calendar);
      expect(dom.active).to.not.be.undefined;
    });
  });

  describe('Days view', () => {
    let daysView: IgcDaysViewComponent;

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar
          active-view="days"
          size="large"
          .activeDate=${activeDate}
        ></igc-calendar>
      `);
      daysView = getCalendarDOM(calendar).views.days;
    });

    it('is accessible', async () => {
      await expect(daysView).lightDom.to.be.accessible();
      await expect(daysView).shadowDom.to.be.accessible();
    });

    it('navigates to next month by pressing `PageDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', 1);

      simulateKeyboard(daysView, pageDownKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to next year by pressing `Shift + PageDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', 1);

      simulateKeyboard(daysView, [shiftKey, pageDownKey]);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to previous month by pressing `PageUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', -1);

      simulateKeyboard(daysView, pageUpKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to previous year by pressing `Shift + PageUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', -1);

      simulateKeyboard(daysView, [shiftKey, pageUpKey]);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the next day by pressing `ArrowRight`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('day', 1);

      simulateKeyboard(daysView, arrowRight);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the previous day by pressing `ArrowLeft`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('day', -1);

      simulateKeyboard(daysView, arrowLeft);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the next week by pressing `ArrowDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('week', 1);

      simulateKeyboard(daysView, arrowDown);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the previous week by pressing `ArrowUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('week', -1);

      simulateKeyboard(daysView, arrowUp);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the start of the current month by pressing `Home`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ date: 1 });

      simulateKeyboard(daysView, homeKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the end of the current month by pressing `End`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ month: current.month + 1, date: 0 });

      simulateKeyboard(daysView, endKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('selects a date by pressing `Enter`', async () => {
      const day = first(getDayViewDOM(daysView).dates.all);
      const value = CalendarDay.from(new Date(asNumber(day.dataset.value)));

      day.focus();
      simulateKeyboard(day, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.value!)).to.be.true;
    });

    it('selects a date by pressing `Space`', async () => {
      const day = first(getDayViewDOM(daysView).dates.all);
      const value = CalendarDay.from(new Date(asNumber(day.dataset.value)));

      day.focus();
      simulateKeyboard(day, spaceBar);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.value!)).to.be.true;
    });
  });

  describe('Months view', () => {
    let monthsView: IgcMonthsViewComponent;

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar active-view="months" size="large"></igc-calendar>
      `);
      monthsView = getCalendarDOM(calendar).views.months;
    });

    it('is accessible', async () => {
      await expect(monthsView).lightDom.to.be.accessible();
      await expect(monthsView).shadowDom.to.be.accessible();
    });

    it('navigates to the first month by pressing `Home`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ month: 0 });

      simulateKeyboard(monthsView, homeKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the last month by pressing `End`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ month: 11 });

      simulateKeyboard(monthsView, endKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the previous year by pressing `PageUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', -1);

      simulateKeyboard(monthsView, pageUpKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the next year by pressing `PageDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', 1);

      simulateKeyboard(monthsView, pageDownKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the next month by pressing `ArrowRight`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', 1);

      simulateKeyboard(monthsView, arrowRight);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the previous month by pressing `ArrowLeft`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', -1);

      simulateKeyboard(monthsView, arrowLeft);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by MONTHS_PER_ROW by pressing `ArrowDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', MONTHS_PER_ROW);

      simulateKeyboard(monthsView, arrowDown);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by -MONTHS_PER_ROW by pressing `ArrowUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('month', -MONTHS_PER_ROW);

      simulateKeyboard(monthsView, arrowUp);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('selects a month by pressing `Enter`', async () => {
      const month = first(getMonthViewDOM(monthsView).months.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        month: asNumber(month.dataset.month),
      });

      month.focus();
      simulateKeyboard(month, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('days');
    });

    it('selects a month by pressing `Space`', async () => {
      const month = first(getMonthViewDOM(monthsView).months.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        month: asNumber(month.dataset.month),
      });

      month.focus();
      simulateKeyboard(month, spaceBar);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('days');
    });
  });

  describe('Years view', () => {
    let yearsView: IgcYearsViewComponent;

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar size="large" active-view="years"></igc-calendar>
      `);
      yearsView = getCalendarDOM(calendar).views.years;
    });

    it('is accessible', async () => {
      await expect(yearsView).lightDom.to.be.accessible();
      await expect(yearsView).shadowDom.to.be.accessible();
    });

    it('navigates to the first year by pressing `Home`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ year: getYearRange(current, 15).start });

      simulateKeyboard(yearsView, homeKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the last year by pressing `End`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.set({ year: getYearRange(current, 15).end });

      simulateKeyboard(yearsView, endKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the next year by pressing `ArrowRight`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', 1);

      simulateKeyboard(yearsView, arrowRight);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates to the previous year by pressing `ArrowLeft`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', -1);

      simulateKeyboard(yearsView, arrowLeft);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by YEARS_PER_ROW by pressing `ArrowDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', YEARS_PER_ROW);

      simulateKeyboard(yearsView, arrowDown);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by YEARS_PER_ROW by pressing `ArrowUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', -YEARS_PER_ROW);

      simulateKeyboard(yearsView, arrowUp);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by -`yearsPerPage` by pressing `PageUp`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', -15);

      simulateKeyboard(yearsView, pageUpKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('navigates by `yearsPerPage` by pressing `PageDown`', async () => {
      const current = CalendarDay.from(calendar.activeDate);
      const next = current.add('year', 15);

      simulateKeyboard(yearsView, pageDownKey);
      await elementUpdated(calendar);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
    });

    it('selects an year by pressing `Enter`', async () => {
      const year = first(getYearViewDOM(yearsView).years.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        year: asNumber(year.dataset.year),
      });

      year.focus();
      simulateKeyboard(year, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('months');
    });

    it('selects an year by pressing `Space`', async () => {
      const year = first(getYearViewDOM(yearsView).years.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        year: asNumber(year.dataset.year),
      });

      year.focus();
      simulateKeyboard(year, spaceBar);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('months');
    });
  });
});

/* Helper Functions */

export function getDayViewDOM(element: IgcDaysViewComponent) {
  const root = element.shadowRoot!;
  return {
    dates: {
      get all() {
        return Array.from(
          root.querySelectorAll(`span[part~='date-inner']`)
        ) as HTMLElement[];
      },
      get disabled() {
        return Array.from(
          root.querySelectorAll(`span[part*='date-inner disabled']`)
        ) as HTMLElement[];
      },
    },
  };
}

function getMonthViewDOM(element: IgcMonthsViewComponent) {
  const root = element.shadowRoot!;
  return {
    months: {
      get all() {
        return Array.from(
          root.querySelectorAll(`span[part='month-inner']`)
        ) as HTMLElement[];
      },
    },
  };
}

function getYearViewDOM(element: IgcYearsViewComponent) {
  const root = element.shadowRoot!;
  return {
    years: {
      get all() {
        return Array.from(
          root.querySelectorAll(`[part~='year-inner']`)
        ) as HTMLElement[];
      },
    },
  };
}

export function getCalendarDOM(element: IgcCalendarComponent) {
  const root = element.shadowRoot!;
  return {
    get active() {
      return root.activeElement;
    },
    views: {
      get days() {
        return root.querySelector(IgcDaysViewComponent.tagName)!;
      },
      get months() {
        return root.querySelector(IgcMonthsViewComponent.tagName)!;
      },
      get years() {
        return root.querySelector(IgcYearsViewComponent.tagName)!;
      },
    },
    navigation: {
      get months() {
        return root.querySelector(
          `[part="months-navigation"]`
        ) as HTMLButtonElement;
      },
      get years() {
        return root.querySelector(
          `[part="years-navigation"]`
        ) as HTMLButtonElement;
      },
    },
  };
}
