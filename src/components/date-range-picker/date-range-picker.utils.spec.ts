import { elementUpdated, expect } from '@open-wc/testing';
import IgcCalendarComponent from '../calendar/calendar.js';
import { getCalendarDOM, getDOMDate } from '../calendar/helpers.spec.js';
import type { CalendarDay } from '../calendar/model.js';
import { equal } from '../common/util.js';
import { checkDatesEqual, simulateClick } from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import IgcInputComponent from '../input/input.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';
import type { DateRangeValue } from './date-range-picker.js';

export const selectDates = async (
  startDate: CalendarDay | null,
  endDate: CalendarDay | null,
  calendar: IgcCalendarComponent
) => {
  const daysView = getCalendarDOM(calendar).views.days;
  if (startDate) {
    const startDayDom = getDOMDate(startDate, daysView);
    simulateClick(startDayDom);
    await elementUpdated(calendar);
  }
  if (endDate) {
    const endDayDom = getDOMDate(endDate, daysView);
    simulateClick(endDayDom);
    await elementUpdated(calendar);
  }
};

export const checkSelectedRange = (
  picker: IgcDateRangePickerComponent,
  expectedValue: DateRangeValue | null,
  useTwoInputs = true
) => {
  const calendar = picker.renderRoot.querySelector(
    IgcCalendarComponent.tagName
  )!;

  equal(picker.value, expectedValue);

  if (useTwoInputs) {
    const inputs = picker.renderRoot.querySelectorAll(
      IgcDateTimeInputComponent.tagName
    );
    if (expectedValue?.start) {
      checkDatesEqual(inputs[0].value!, expectedValue.start);
    }
    if (expectedValue?.end) {
      checkDatesEqual(inputs[1].value!, expectedValue.end);
    }
  } else {
    const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
    const start = expectedValue?.start
      ? DateTimeUtil.formatDate(
          expectedValue.start,
          picker.locale,
          picker.displayFormat || picker.inputFormat
        )
      : '';
    const end = expectedValue?.end
      ? DateTimeUtil.formatDate(
          expectedValue.end,
          picker.locale,
          picker.displayFormat || picker.inputFormat
        )
      : '';
    expect(input.value).to.equal(`${start} - ${end}`);
  }

  if (expectedValue?.start) {
    checkDatesEqual(calendar.values[0], expectedValue?.start!);
  }
  if (expectedValue?.end) {
    const length = calendar.values.length;
    checkDatesEqual(calendar.values[length - 1], expectedValue?.end!);
  }
  if (!(expectedValue?.start || expectedValue?.end)) {
    expect(calendar.values).to.deep.equal([]);
  }
};

export const getIcon = (picker: IgcDateRangePickerComponent, name: string) => {
  return picker.renderRoot.querySelector(`[name='${name}']`)!;
};

export const checkInputsInvalidState = async (
  el: IgcDateRangePickerComponent,
  first: boolean,
  second?: boolean
) => {
  await elementUpdated(el);
  const inputs = el.renderRoot.querySelectorAll(
    IgcDateTimeInputComponent.tagName
  );
  expect(inputs[0].invalid).to.equal(first);
  expect(inputs[1].invalid).to.equal(second);
};
