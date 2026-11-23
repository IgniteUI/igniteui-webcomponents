import { elementUpdated, expect } from '@open-wc/testing';
import { arrowRight } from '#internals/controllers/key-bindings.js';
import type { CalendarDay } from '#internals/date/model.js';
import { formatDisplayDate } from '#internals/i18n/date-formats.js';
import {
  getCalendarDOM,
  getDOMDate,
} from '#internals/testing/calendar.spec.js';
import { checkDatesEqual } from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { equal } from '#internals/utils/objects.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import type { PickerEditor } from '../date-picker/date-picker.base.js';
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
   * Set while an edit is in progress. The inputs commit `value` on blur (see issue
   * #1346), so the draft is read mid-typing.
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

/** The rendered editors of `picker`, the start editor first. */
export const getEditors = (picker: IgcDateRangePickerComponent) =>
  Array.from(
    picker.renderRoot.querySelectorAll<PickerEditor>(
      `${IgcDateRangeInputComponent.tagName}, ${IgcDateTimeInputComponent.tagName}`
    )
  );

/** The range that the rendered editors hold, `null` when they are empty. */
export const getEditorRange = (
  picker: IgcDateRangePickerComponent
): DateRangeValue | null => {
  const [first, second] = getEditors(picker);
  const range =
    first instanceof IgcDateRangeInputComponent
      ? first.value
      : {
          start: first?.value ?? null,
          end:
            second instanceof IgcDateTimeInputComponent ? second.value : null,
        };

  return range?.start || range?.end ? range : null;
};

/** The native input of the start editor. */
export const getInput = (picker: IgcDateRangePickerComponent) =>
  getEditors(picker)[0].renderRoot.querySelector('input')!;

/** Types `text` at `position`. The keydown records the caret, as a real key press does. */
export const typeAt = (
  input: HTMLInputElement,
  text: string,
  position: number
): void => {
  input.setSelectionRange(position, position + 1);
  simulateKeyboard(input, arrowRight);

  simulateInput(input, {
    value: input.value.substring(0, position) + text,
    inputType: 'insertText',
  });
};
