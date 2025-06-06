import { calendarRange, isDateInRanges } from '../calendar/helpers.js';
import { CalendarDay } from '../calendar/model.js';
import type { DateRangeDescriptor } from '../calendar/types.js';
import messages from '../common/localization/validation-en.js';
import { formatString, isEmpty } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';
import type { DateRangeValue } from './date-range-picker.js';

export const minDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => formatString(messages.min, min),
  isValid: ({ value, min }) => {
    if (!min) {
      return true;
    }

    const isStartInvalid =
      value?.start && CalendarDay.compare(value.start, min) < 0;
    const isEndInvalid = value?.end && CalendarDay.compare(value.end, min) < 0;

    return !(isStartInvalid || isEndInvalid);
  },
};

export const maxDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(messages.max, max),
  isValid: ({ value, max }) => {
    if (!max) {
      return true;
    }

    const isStartInvalid =
      value?.start && CalendarDay.compare(value.start, max) > 0;
    const isEndInvalid = value?.end && CalendarDay.compare(value.end, max) > 0;

    return !(isStartInvalid || isEndInvalid);
  },
};

export const requiredDateRangeValidator: Validator<{
  required: boolean;
  value: DateRangeValue | null;
}> = {
  key: 'valueMissing',
  message: messages.required,
  isValid: ({ required, value }) => {
    return required ? isCompleteDateRange(value) : true;
  },
};

export const badInputDateRangeValidator: Validator<{
  required: boolean;
  value: DateRangeValue | null;
  disabledDates?: DateRangeDescriptor[];
}> = {
  key: 'badInput',
  message: ({ value }) => formatString(messages.disabledDate, value),
  isValid: ({ value, disabledDates }) => {
    if (
      !isCompleteDateRange(value) ||
      !disabledDates ||
      isEmpty(disabledDates)
    ) {
      return true;
    }

    return Array.from(
      calendarRange({ start: value.start, end: value.end, inclusive: true })
    ).every((date) => !isDateInRanges(date, disabledDates));
  },
};

export const dateRangeValidators: Validator<IgcDateRangePickerComponent>[] = [
  requiredDateRangeValidator,
  minDateRangeValidator,
  maxDateRangeValidator,
  badInputDateRangeValidator,
];

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is { start: Date; end: Date } {
  return value != null && value.start != null && value.end != null;
}
