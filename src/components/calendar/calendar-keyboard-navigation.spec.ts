import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

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
} from '#internals/controllers/key-bindings.js';
import { CalendarDay, createDate } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  getCalendarDOM,
  getDayViewDOM,
  getDOMDate,
} from '#internals/testing/calendar.spec.js';
import {
  simulateClick,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { asNumber } from '#internals/utils/math.js';
import IgcCalendarComponent from './calendar.js';
import type IgcDaysViewComponent from './days-view/days-view.js';
import { getYearRange, MONTHS_PER_ROW, YEARS_PER_ROW } from './helpers.js';
import type IgcMonthsViewComponent from './months-view/months-view.js';
import { DateRangeType } from './types.js';
import type IgcYearsViewComponent from './years-view/years-view.js';

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

      button.focus();
      simulateClick(button);

      await elementUpdated(calendar);

      expect(document.activeElement).to.equal(calendar);
      expect(dom.active).to.not.be.undefined;
    });

    it('focus is retained when switching to year view', async () => {
      const dom = getCalendarDOM(calendar);
      const button = dom.navigation.years;

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
          .activeDate=${activeDate}
        ></igc-calendar>
      `);
      daysView = getCalendarDOM(calendar).views.days;
    });

    it('is accessible', async () => {
      await expect(daysView).lightDom.to.be.accessible();
      await expect(daysView).shadowDom.to.be.accessible();
    });

    it('stops at the last date of the year range', async () => {
      const last = CalendarDay.from(new Date(9999, 11, 31));
      calendar.activeDate = last.native;
      await elementUpdated(calendar);

      for (const keys of [
        arrowRight,
        arrowDown,
        pageDownKey,
        [shiftKey, pageDownKey],
      ]) {
        simulateKeyboard(daysView, keys);
        await elementUpdated(calendar);

        expect(last.equalTo(calendar.activeDate)).to.be.true;
      }

      const { next, previous } = getCalendarDOM(calendar).navigation;
      expect(next.disabled).to.be.true;
      expect(previous.disabled).to.be.false;

      // The days of January 10000 that December 9999 shows are disabled.
      const outside = CalendarDay.from(new Date(10_000, 0, 1));
      expect(getDOMDate(outside, daysView).part.contains('disabled')).to.be
        .true;
    });

    it('stops at the first date of the year range', async () => {
      const first = CalendarDay.from(createDate(1, 0, 1));
      calendar.activeDate = first.native;
      await elementUpdated(calendar);

      for (const keys of [
        arrowLeft,
        arrowUp,
        pageUpKey,
        [shiftKey, pageUpKey],
      ]) {
        simulateKeyboard(daysView, keys);
        await elementUpdated(calendar);

        expect(first.equalTo(calendar.activeDate)).to.be.true;
      }

      const { next, previous } = getCalendarDOM(calendar).navigation;
      expect(previous.disabled).to.be.true;
      expect(next.disabled).to.be.false;
    });

    it('moves an active date from code outside the year range only toward it', async () => {
      const outside = CalendarDay.from(new Date(10_005, 2, 15));
      calendar.activeDate = outside.native;
      await elementUpdated(calendar);

      simulateKeyboard(daysView, arrowRight);
      await elementUpdated(calendar);
      expect(outside.equalTo(calendar.activeDate)).to.be.true;

      simulateKeyboard(daysView, arrowLeft);
      await elementUpdated(calendar);
      expect(outside.add('day', -1).equalTo(calendar.activeDate)).to.be.true;

      const { next, previous } = getCalendarDOM(calendar).navigation;
      expect(next.disabled).to.be.true;

      simulateClick(previous);
      await elementUpdated(calendar);
      expect(calendar.activeDate.getMonth()).to.equal(1);
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
      const day = firstOf(getDayViewDOM(daysView).dates.all);
      const value = CalendarDay.from(new Date(asNumber(day.dataset.value)));

      day.focus();
      simulateKeyboard(day, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.value!)).to.be.true;
    });

    it('selects a date by pressing `Space`', async () => {
      const day = firstOf(getDayViewDOM(daysView).dates.all);
      const value = CalendarDay.from(new Date(asNumber(day.dataset.value)));

      day.focus();
      simulateKeyboard(day, spaceBar);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.value!)).to.be.true;
    });

    it('skips disabled dates with keyboard navigation - 1', async () => {
      const lastOfJan = new CalendarDay({ year: 2024, month: 0, date: 31 });
      const firstOfMarch = new CalendarDay({ year: 2024, month: 2, date: 1 });

      const getActiveDOM = () =>
        getDOMDate(CalendarDay.from(calendar.activeDate), daysView);

      calendar.activeDate = firstOfMarch.native;
      // Disable the whole month of February
      calendar.disabledDates = [
        {
          type: DateRangeType.Between,
          dateRange: [
            lastOfJan.add('day', 1).native,
            firstOfMarch.add('day', -1).native,
          ],
        },
      ];
      await elementUpdated(calendar);

      // Previous day -> fallback to last of January
      simulateKeyboard(getActiveDOM(), arrowLeft);
      await elementUpdated(calendar);
      expect(lastOfJan.equalTo(calendar.activeDate)).to.be.true;

      // Next day -> fallback to first of March
      simulateKeyboard(getActiveDOM(), arrowRight);
      await elementUpdated(calendar);
      expect(firstOfMarch.equalTo(calendar.activeDate)).to.be.true;

      // Previous week -> fallback to last of January
      simulateKeyboard(getActiveDOM(), arrowUp);
      await elementUpdated(calendar);
      expect(lastOfJan.equalTo(calendar.activeDate)).to.be.true;

      // Next week -> fallback to first of March
      simulateKeyboard(getActiveDOM(), arrowDown);
      await elementUpdated(calendar);
      expect(firstOfMarch.equalTo(calendar.activeDate)).to.be.true;

      // Previous month -> fallback to last of January
      simulateKeyboard(getActiveDOM(), pageUpKey);
      await elementUpdated(calendar);
      expect(lastOfJan.equalTo(calendar.activeDate)).to.be.true;

      // Next month -> fallback to first of March
      simulateKeyboard(getActiveDOM(), pageDownKey);
      await elementUpdated(calendar);
      expect(firstOfMarch.equalTo(calendar.activeDate)).to.be.true;
    });

    it('skips disabled dates with keyboard navigation - 2', async () => {
      const date = new CalendarDay({ year: 2024, month: 1, date: 14 });
      const getActiveDOM = () =>
        getDOMDate(CalendarDay.from(calendar.activeDate), daysView);

      calendar.activeDate = date.native;
      calendar.disabledDates = [
        {
          type: DateRangeType.Specific,
          dateRange: [date.set({ date: 1 }).native],
        },
        {
          type: DateRangeType.Between,
          dateRange: [
            date.set({ date: 25 }).native,
            date.set({ date: 29 }).native,
          ],
        },
      ];
      await elementUpdated(calendar);

      // Beginning of February is disabled -> fallback to 2nd day
      simulateKeyboard(getActiveDOM(), homeKey);
      await elementUpdated(calendar);
      expect(date.set({ date: 2 }).equalTo(calendar.activeDate)).to.be.true;

      // End of February -> [25-29] are disabled, fallback to 24th
      simulateKeyboard(getActiveDOM(), endKey);
      await elementUpdated(calendar);
      expect(date.set({ date: 24 }).equalTo(calendar.activeDate)).to.be.true;
    });

    it('stays put when every date in the direction of travel is disabled', async () => {
      const date = new CalendarDay({ year: 2024, month: 1, date: 14 });
      const getActiveDOM = () =>
        getDOMDate(CalendarDay.from(calendar.activeDate), daysView);

      calendar.activeDate = date.native;
      // Equivalent to what a picker with `min`/`max` set to the active date passes down
      calendar.disabledDates = [
        { type: DateRangeType.After, dateRange: [date.native] },
        { type: DateRangeType.Before, dateRange: [date.native] },
      ];
      await elementUpdated(calendar);

      for (const key of [
        arrowRight,
        arrowLeft,
        arrowDown,
        arrowUp,
        pageDownKey,
        pageUpKey,
        homeKey,
        endKey,
      ]) {
        simulateKeyboard(getActiveDOM(), key);
        await elementUpdated(calendar);
        expect(date.equalTo(calendar.activeDate)).to.be.true;
      }
    });

    it('stays put when both weekdays and weekends are disabled', async () => {
      const date = new CalendarDay({ year: 2024, month: 1, date: 14 });

      calendar.activeDate = date.native;
      calendar.disabledDates = [
        { type: DateRangeType.Weekdays },
        { type: DateRangeType.Weekends },
      ];
      await elementUpdated(calendar);

      simulateKeyboard(
        getDOMDate(CalendarDay.from(calendar.activeDate), daysView),
        arrowRight
      );
      await elementUpdated(calendar);

      expect(date.equalTo(calendar.activeDate)).to.be.true;
    });
  });

  describe('Months view', () => {
    let monthsView: IgcMonthsViewComponent;

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar active-view="months"></igc-calendar>
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
      const month = firstOf(getMonthViewDOM(monthsView).months.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        month: asNumber(month.dataset.value),
      });

      month.focus();
      simulateKeyboard(month, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('days');
    });

    it('selects a month by pressing `Space`', async () => {
      const month = firstOf(getMonthViewDOM(monthsView).months.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        month: asNumber(month.dataset.value),
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

    /** The labels of the shown year cells. */
    const yearLabels = () =>
      Array.from(
        yearsView.renderRoot.querySelectorAll(
          ':not([part~="hidden"]) > [role="gridcell"]'
        ),
        (cell) => cell.textContent!.trim()
      );

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar active-view="years"></igc-calendar>
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

    it('hides the years past 9999 on the last page and stops at 9999', async () => {
      calendar.activeDate = new Date(9995, 5, 15);
      await elementUpdated(calendar);

      expect([firstOf(yearLabels()), lastOf(yearLabels())]).to.eql([
        '9990',
        '9999',
      ]);

      simulateKeyboard(yearsView, pageDownKey);
      await elementUpdated(calendar);
      expect(calendar.activeDate.getFullYear()).to.equal(9999);

      simulateKeyboard(yearsView, endKey);
      await elementUpdated(calendar);
      expect(calendar.activeDate.getFullYear()).to.equal(9999);

      expect(getCalendarDOM(calendar).navigation.next.disabled).to.be.true;
    });

    it('hides year 0 on the first page', async () => {
      calendar.activeDate = createDate(7, 5, 15);
      await elementUpdated(calendar);

      expect([firstOf(yearLabels()), lastOf(yearLabels())]).to.eql(['1', '14']);
      expect(getCalendarDOM(calendar).navigation.previous.disabled).to.be.true;
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
      const year = firstOf(getYearViewDOM(yearsView).years.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        year: asNumber(year.dataset.value),
      });

      year.focus();
      simulateKeyboard(year, enterKey);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('months');
    });

    it('selects an year by pressing `Space`', async () => {
      const year = firstOf(getYearViewDOM(yearsView).years.all);
      const value = CalendarDay.from(calendar.activeDate).set({
        year: asNumber(year.dataset.value),
      });

      year.focus();
      simulateKeyboard(year, spaceBar);
      await elementUpdated(calendar);

      expect(value.equalTo(calendar.activeDate)).to.be.true;
      expect(calendar.activeView).to.equal('months');
    });
  });

  describe('Multiple visible months', () => {
    let views: IgcDaysViewComponent[];

    beforeEach(async () => {
      calendar = await fixture<IgcCalendarComponent>(html`
        <igc-calendar
          visible-months="2"
          .activeDate=${new Date(2021, 6, 31)}
        ></igc-calendar>
      `);
      views = Array.from(
        calendar.shadowRoot!.querySelectorAll<IgcDaysViewComponent>(
          'igc-days-view'
        )
      );
    });

    it('moves the active view along when an arrow key leaves its month', async () => {
      const [first, second] = views;
      const next = new CalendarDay({ year: 2021, month: 7, date: 1 });

      simulateKeyboard(getDayViewDOM(first).dates.active, arrowRight);
      await elementUpdated(calendar);
      await elementUpdated(second);

      expect(next.equalTo(calendar.activeDate)).to.be.true;
      expect(first.active).to.be.false;
      expect(second.active).to.be.true;
      expect(getDayViewDOM(second).dates.active.dataset.value).to.equal(
        `${next.timestamp}`
      );

      simulateKeyboard(getDayViewDOM(second).dates.active, arrowLeft);
      await elementUpdated(calendar);

      expect(first.active).to.be.true;
      expect(second.active).to.be.false;
    });

    it('keeps the active view while an arrow key stays in its month', async () => {
      const [first, second] = views;
      const previous = new CalendarDay({ year: 2021, month: 6, date: 30 });

      simulateKeyboard(getDayViewDOM(first).dates.active, arrowLeft);
      await elementUpdated(calendar);

      expect(previous.equalTo(calendar.activeDate)).to.be.true;
      expect(first.active).to.be.true;
      expect(second.active).to.be.false;
    });
  });
});

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
