import { elementUpdated, expect } from '@open-wc/testing';
import type { CalendarDay } from '#internals/date/model.js';
import { formatDisplayDate } from '#internals/i18n/i18n-controller.js';
import {
  getCalendarDOM,
  getDOMDate,
} from '#internals/testing/calendar.spec.js';
import { checkDatesEqual } from '#internals/testing/helpers.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { equal } from '#internals/utils/objects.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DateRangeValue } from '../types.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

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
  useTwoInputs = true,
  /**
   * Set while an edit is still in progress. The inputs only commit their `value` on
   * blur (see issue #1346), so mid-typing the draft has to be read instead.
   */
  uncommitted = false
) => {
  const calendar = picker.renderRoot.querySelector(
    IgcCalendarComponent.tagName
  )!;

  equal(picker.value, expectedValue);

  if (useTwoInputs) {
    const inputs = picker.renderRoot.querySelectorAll(
      IgcDateTimeInputComponent.tagName
    );
    const readValue = (input: IgcDateTimeInputComponent) =>
      uncommitted ? input._uncommittedValue : input.value;

    if (expectedValue?.start) {
      checkDatesEqual(readValue(inputs[0])!, expectedValue.start);
    }
    if (expectedValue?.end) {
      checkDatesEqual(readValue(inputs[1])!, expectedValue.end);
    }
  } else {
    const input = getInput(picker);
    const start = expectedValue?.start
      ? formatDisplayDate(
          expectedValue.start,
          picker.locale,
          picker.displayFormat
        )
      : '';
    const end = expectedValue?.end
      ? formatDisplayDate(
          expectedValue.end,
          picker.locale,
          picker.displayFormat
        )
      : '';
    expect(input.value).to.equal(`${start} - ${end}`);
  }

  if (expectedValue?.start) {
    checkDatesEqual(calendar.values[0], expectedValue.start!);
  }
  if (expectedValue?.end) {
    const length = calendar.values.length;
    checkDatesEqual(calendar.values[length - 1], expectedValue.end!);
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

export const getInput = (
  picker: IgcDateRangePickerComponent
): HTMLInputElement => {
  const rangeInput = picker.renderRoot.querySelector(
    IgcDateRangeInputComponent.tagName
  )! as IgcDateRangeInputComponent;
  const input = rangeInput.renderRoot.querySelector('input')!;
  return input;
};
