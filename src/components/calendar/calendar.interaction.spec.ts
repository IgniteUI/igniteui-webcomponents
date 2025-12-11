import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, fixture, html } from '../common/helpers.spec.js';
import { first, last } from '../common/util.js';
import { simulateClick } from '../common/utils.spec.js';
import IgcCalendarComponent from './calendar.js';
import type IgcDaysViewComponent from './days-view/days-view.js';
import {
  calendarRange,
  generateMonth,
  getWeekDayNumber,
  isDateInRanges,
} from './helpers.js';
import { getCalendarDOM, getDayViewDOM, getDOMDate } from './helpers.spec.js';
import { CalendarDay } from './model.js';
import { type DateRangeDescriptor, DateRangeType } from './types.js';

describe('Calendar interactions', () => {
  let calendar: IgcCalendarComponent;
  let daysView: IgcDaysViewComponent;

  beforeAll(() => defineComponents(IgcCalendarComponent));

  beforeEach(async () => {
    const value = new CalendarDay({ year: 2021, month: 8, date: 29 });

    calendar = await fixture<IgcCalendarComponent>(html`
      <igc-calendar
        .value=${value.native}
        .activeDate=${value.native}
      ></igc-calendar>
    `);

    daysView = getCalendarDOM(calendar).views.days;
  });

  it('is accessible', async () => {
    await expect(calendar).lightDom.to.be.accessible();
    await expect(calendar).shadowDom.to.be.accessible();
  });

  it('setting `value` attribute', async () => {
    const date = new CalendarDay({ year: 2022, month: 0, date: 19 });

    calendar.setAttribute('value', date.native.toISOString());
    expect(date.equalTo(calendar.value!)).to.be.true;
  });

  it('setting `value` - string property binding', async () => {
    const date = new CalendarDay({ year: 2022, month: 0, date: 19 });
    calendar.value = date.native.toISOString();

    expect(date.equalTo(calendar.value!)).to.be.true;

    // Invalid date
    for (const each of [new Date('s'), '', null, undefined]) {
      calendar.value = each;
      expect(calendar.value).to.be.null;
    }
  });

  it('setting `values` attribute', async () => {
    const date_1 = new CalendarDay({ year: 2022, month: 0, date: 19 });
    const date_2 = date_1.set({ date: 22 });

    calendar.selection = 'multiple';
    calendar.setAttribute(
      'values',
      `${date_1.native.toISOString()}, ${date_2.native.toISOString()}`
    );

    expect(calendar.values).lengthOf(2);
    expect(date_1.equalTo(first(calendar.values))).to.be.true;
    expect(date_2.equalTo(last(calendar.values))).to.be.true;
  });

  it('setting `values` - string property binding', async () => {
    const date_1 = new CalendarDay({ year: 2022, month: 0, date: 19 });
    const date_2 = date_1.set({ date: 22 });

    const date_1_str = date_1.native.toISOString();
    const date_2_str = date_2.native.toISOString();

    calendar.selection = 'multiple';
    calendar.values = `${date_1_str}, ${date_2_str}`;

    expect(calendar.values).lengthOf(2);
    expect(date_1.equalTo(first(calendar.values))).to.be.true;
    expect(date_2.equalTo(last(calendar.values))).to.be.true;

    // Valid date combinations
    const validDates = [
      [date_1_str, date_2_str],
      [date_1.native, date_2.native],
      [date_1_str, date_2.native],
    ];

    for (const each of validDates) {
      calendar.values = each;
      expect(calendar.values).lengthOf(2);
      expect(date_1.equalTo(first(calendar.values))).to.be.true;
      expect(date_2.equalTo(last(calendar.values))).to.be.true;
    }

    // Mixed date combinations
    calendar.values = [date_1.native, new Date(), new Date('s'), date_1_str];
    expect(calendar.values).lengthOf(3);

    calendar.values = ['invalid', date_1_str, date_2_str, date_2.native];
    expect(calendar.values).lengthOf(3);

    // Invalid date combinations
    const invalidDates = [
      '',
      null,
      undefined,
      [new Date('s'), 'abc'],
      'abcde, abcde',
      ['a', 'b', 'c', new Date('invalid')],
    ];

    for (const each of invalidDates) {
      calendar.values = each;
      expect(calendar.values).is.empty;
    }
  });

  it('clicking previous/next buttons in days view', async () => {
    const { previous, next } = getCalendarDOM(calendar).navigation;

    const previousDate = CalendarDay.from(calendar.activeDate).add('month', -1);
    const nextDate = CalendarDay.from(calendar.activeDate).add('month', 1);

    simulateClick(previous);
    await elementUpdated(calendar);
    expect(previousDate.equalTo(calendar.activeDate)).to.be.true;

    simulateClick(next, {}, 2);
    await elementUpdated(calendar);
    expect(nextDate.equalTo(calendar.activeDate)).to.be.true;
  });

  it('clicking previous/next buttons in months view', async () => {
    const { previous, next, months } = getCalendarDOM(calendar).navigation;

    const previousDate = CalendarDay.from(calendar.activeDate).add('year', -1);
    const nextDate = CalendarDay.from(calendar.activeDate).add('year', 1);

    simulateClick(months);
    await elementUpdated(calendar);

    simulateClick(previous);
    await elementUpdated(calendar);
    expect(previousDate.equalTo(calendar.activeDate)).to.be.true;

    simulateClick(next, {}, 2);
    await elementUpdated(calendar);
    expect(nextDate.equalTo(calendar.activeDate)).to.be.true;
  });

  it('clicking previous/next buttons in years view', async () => {
    const { previous, next, years } = getCalendarDOM(calendar).navigation;

    const previousDate = CalendarDay.from(calendar.activeDate).add('year', -15);
    const nextDate = CalendarDay.from(calendar.activeDate).add('year', 15);

    simulateClick(years);
    await elementUpdated(calendar);

    simulateClick(previous);
    await elementUpdated(calendar);
    expect(previousDate.equalTo(calendar.activeDate)).to.be.true;

    simulateClick(next, {}, 2);
    await elementUpdated(calendar);
    expect(nextDate.equalTo(calendar.activeDate)).to.be.true;
  });

  it('single selection', async () => {
    const spy = vi.spyOn(calendar, 'emitEvent');

    const current = CalendarDay.from(calendar.value!);
    const previous = current.add('day', -1);

    const previousDOM = getDOMDate(previous, daysView);

    simulateClick(previousDOM);
    await elementUpdated(calendar);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcChange', {
      detail: previous.native,
    });

    expect(current.equalTo(calendar.value!)).to.be.false;
    expect(previous.equalTo(calendar.value!)).to.be.true;
  });

  it('issue-1443', async () => {
    const spy = vi.spyOn(calendar, 'emitEvent');
    const anchor = new CalendarDay({
      year: 681,
      month: 0,
      date: 1,
    });

    calendar.activeDate = anchor.native;
    await elementUpdated(calendar);

    const current = CalendarDay.from(calendar.activeDate!);
    const previous = current.add('day', -1);

    const previousDOM = getDOMDate(previous, daysView);

    simulateClick(previousDOM);
    await elementUpdated(calendar);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcChange', {
      detail: previous.native,
    });

    expect(CalendarDay.from(calendar.value!).equalTo(anchor.add('day', -1))).to
      .be.true;
    expect(current.equalTo(calendar.value!)).to.be.false;
    expect(previous.equalTo(calendar.value!)).to.be.true;
  });

  it('single selection outside of the current month', async () => {
    const target = new CalendarDay({ year: 2021, month: 9, date: 2 });
    const DOMDate = getDOMDate(target, daysView);

    simulateClick(DOMDate);
    await elementUpdated(calendar);

    expect(target.equalTo(calendar.value!)).to.be.true;
  });

  it('multiple selection', async () => {
    const spy = vi.spyOn(calendar, 'emitEvent');
    const start = CalendarDay.from(calendar.value!).set({ date: 15 });
    const dates = Array.from(calendarRange({ start, end: 7 }));
    const elements = dates.map((date) => getDOMDate(date, daysView));

    calendar.selection = 'multiple';
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(0);

    for (const element of elements) {
      simulateClick(element);
      expect(spy).toHaveBeenCalledWith('igcChange', {
        detail: calendar.values,
      });
    }
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(7);
    expect(spy).toHaveBeenCalledTimes(7);
    expect(first(dates).equalTo(first(calendar.values))).to.be.true;
    expect(last(dates).equalTo(last(calendar.values))).to.be.true;

    // Deselect one
    simulateClick(last(elements));
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(6);
    expect(last(dates).equalTo(last(calendar.values))).to.be.false;
  });

  it('start and cancel a range selection', async () => {
    const start = CalendarDay.from(calendar.value!).set({ date: 15 });
    const element = getDOMDate(start, daysView);

    calendar.selection = 'range';
    await elementUpdated(calendar);

    // Start range selection
    simulateClick(element);
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(1);
    expect(start.equalTo(first(calendar.values))).to.be.true;

    // Cancel it
    simulateClick(element);
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(0);
  });

  it('start and complete a range selection', async () => {
    const start = CalendarDay.from(calendar.value!).set({ date: 26 });
    const dates = Array.from(calendarRange({ start, end: 7 }));
    const elements = dates.map((date) => getDOMDate(date, daysView));

    calendar.selection = 'range';
    await elementUpdated(calendar);

    // Start and complete the selection
    simulateClick(first(elements));
    simulateClick(last(elements));
    await elementUpdated(calendar);

    expect(calendar.values).lengthOf(7);

    for (const [i, date] of dates.entries()) {
      expect(date.equalTo(calendar.values[i])).to.be.true;
    }
  });

  it('should emit `igcActiveDateChange` event when the active date is selected', async () => {
    const spy = vi.spyOn(daysView, 'emitEvent');
    const date = CalendarDay.from(calendar.value!).set({ date: 28 });
    const element = getDOMDate(date, daysView);

    simulateClick(element);
    await elementUpdated(calendar);

    const argDate = CalendarDay.from(spy.mock.lastCall?.[1]?.detail as Date);

    expect(spy).toBeCalledWith('igcActiveDateChange', {
      detail: argDate.native,
    });
    expect(argDate.equalTo(date)).to.be.true;
    expect(argDate.equalTo(calendar.activeDate)).to.be.true;
  });

  it('should emit `igcRangePreviewDateChange` event', async () => {
    const spy = vi.spyOn(daysView, 'emitEvent');
    const start = CalendarDay.from(calendar.value!).set({ date: 26 });
    const dates = Array.from(calendarRange({ start, end: 7 }));
    const elements = dates.map((date) => getDOMDate(date, daysView));

    calendar.selection = 'range';
    await elementUpdated(calendar);

    simulateClick(first(elements));
    last(elements).focus();
    await elementUpdated(calendar);

    expect(spy).toHaveBeenCalledWith('igcRangePreviewDateChange', {
      detail: last(dates).native,
    });
  });

  it('date is disabled for DateRangeType - Before', async () => {
    const before = new CalendarDay({ year: 2021, month: 8, date: 29 });
    const month = Array.from(
      generateMonth(before, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Before,
        dateRange: [before.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    for (const day of month) {
      day.lessThan(before)
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled for DateRangeType - After', async () => {
    const after = new CalendarDay({ year: 2021, month: 8, date: 27 });
    const month = Array.from(
      generateMonth(after, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.After,
        dateRange: [after.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    for (const day of month) {
      day.greaterThan(after)
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled for DateRangeType - Between', async () => {
    let min = new CalendarDay({ year: 2021, month: 8, date: 20 });
    let max = min.set({ date: 30 });
    const month = Array.from(
      generateMonth(min, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Between,
        dateRange: [min.native, max.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    // Expand boundaries for the range check
    min = min.add('day', -1);
    max = max.add('day', 1);

    for (const day of month) {
      day.greaterThan(min) && day.lessThan(max)
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled for DateRangeType - Specific', async () => {
    const start = new CalendarDay({ year: 2021, month: 8, date: 7 });
    const range = [start, start.set({ date: 14 }), start.set({ date: 21 })];
    const month = Array.from(
      generateMonth(start, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Specific,
        dateRange: range.map((d) => d.native),
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    for (const day of month) {
      range.some((date) => date.equalTo(day))
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled for DateRangeType - Weekdays', async () => {
    const month = Array.from(
      generateMonth(calendar.value!, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Weekdays,
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    for (const day of month) {
      !day.weekend
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled for DateRangeType - Weekends', async () => {
    const month = Array.from(
      generateMonth(calendar.value!, getWeekDayNumber(calendar.weekStart))
    );
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Weekends,
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    for (const day of month) {
      day.weekend
        ? expect(isDateInRanges(day, descriptor)).to.be.true
        : expect(isDateInRanges(day, descriptor)).to.be.false;
    }
  });

  it('date is disabled DateRangeType - Between when start/end boundaries are the same date', async () => {
    const date = new CalendarDay({ year: 2021, month: 8, date: 15 });
    const month = Array.from(
      generateMonth(date, getWeekDayNumber(calendar.weekStart))
    );

    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Between,
        dateRange: [date.native, date.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    expect(month.filter((date) => isDateInRanges(date, descriptor))).lengthOf(
      1
    );
  });

  it('should not select disabled dates when having `range` selection', async () => {
    const start = new CalendarDay({ year: 2021, month: 8, date: 29 });
    const end = start.set({ month: 9, date: 1 });
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Between,
        dateRange: [start.native, end.native],
      },
    ];

    const startElement = getDOMDate(start.set({ date: 26 }), daysView);
    const endElement = getDOMDate(start.set({ month: 9, date: 2 }), daysView);

    calendar.selection = 'range';
    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    simulateClick(startElement);
    simulateClick(endElement);
    await elementUpdated(calendar);

    expect(calendar.values.every((value) => !isDateInRanges(value, descriptor)))
      .to.be.true;
  });

  it('date is disabled for DateRangeType - Between with start boundary > end', async () => {
    const min = new CalendarDay({ year: 2021, month: 8, date: 30 });
    const max = min.set({ date: 20 });
    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Between,
        dateRange: [min.native, max.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    const disabled = getDayViewDOM(daysView).dates.disabled;

    expect(disabled).lengthOf(min.date - max.date + 1);

    for (const day of calendarRange({ start: max, end: disabled.length })) {
      expect(isDateInRanges(day, descriptor)).to.be.true;
    }
  });

  it('dates are disabled using overlapping Between ranges', async () => {
    const firstMin = new CalendarDay({ year: 2021, month: 8, date: 10 });
    const firstMax = firstMin.set({ date: 15 });
    const secondMin = firstMin.set({ date: 12 });
    const secondMax = firstMin.set({ date: 22 });

    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Between,
        dateRange: [firstMin.native, firstMax.native],
      },
      {
        type: DateRangeType.Between,
        dateRange: [secondMin.native, secondMax.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    const disabled = getDayViewDOM(daysView).dates.disabled;

    expect(disabled).lengthOf(secondMax.date - firstMin.date + 1);
    for (const day of calendarRange({
      start: firstMin,
      end: disabled.length,
    })) {
      expect(isDateInRanges(day, descriptor)).to.be.true;
    }
  });

  it('disabled dates with multiple ranges', async () => {
    const before = new CalendarDay({ year: 2021, month: 8 });
    const after = before.set({ date: 29 });
    const firstMax = before.set({ date: 16 });
    const [secondMin, secondMax] = [
      before.set({ date: 5 }),
      before.set({ date: 28 }),
    ];

    const descriptor: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Before,
        dateRange: [before.native],
      },
      {
        type: DateRangeType.After,
        dateRange: [after.native],
      },
      {
        type: DateRangeType.Weekends,
      },
      {
        type: DateRangeType.Between,
        dateRange: [before.native, firstMax.native],
      },
      {
        type: DateRangeType.Between,
        dateRange: [secondMin.native, secondMax.native],
      },
    ];

    calendar.disabledDates = descriptor;
    await elementUpdated(calendar);

    const DOMDates = getDayViewDOM(daysView).dates;

    // All but one date in the current month are disabled.
    expect(DOMDates.all.length - DOMDates.disabled.length).to.equal(1);
  });

  it('no range is created when selection is set to `multiple`', async () => {
    const start = new CalendarDay({ year: 2021, month: 8, date: 26 });
    const end = start.set({ month: 9, date: 2 });

    calendar.selection = 'range';
    await elementUpdated(calendar);

    const startElement = getDOMDate(start, daysView);
    const endElement = getDOMDate(end, daysView);

    simulateClick(startElement);
    endElement.focus();
    await elementUpdated(calendar);

    expect(end.equalTo(daysView.rangePreviewDate!)).to.be.true;

    calendar.selection = 'multiple';
    await elementUpdated(calendar);

    simulateClick(startElement);
    endElement.focus();
    await elementUpdated(calendar);

    expect(daysView.rangePreviewDate).to.be.undefined;
  });
});
