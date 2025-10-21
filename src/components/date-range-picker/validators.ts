import { calendarRange, isDateInRanges } from '../calendar/helpers.js';
import { CalendarDay } from '../calendar/model.js';
import type { DateRangeDescriptor } from '../calendar/types.js';
import { validationResourcesKeys } from '../common/i18n/utils.js';
import { formatString, isEmpty } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';
import type { DateRangeValue } from './date-range-picker.js';

export const minDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  messageResourceKey: validationResourcesKeys.min,
  messageFormat: (message, { min }) => formatString(message, min),
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
  messageResourceKey: validationResourcesKeys.max,
  messageFormat: (message, { max }) => formatString(message, max),
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
  messageResourceKey: validationResourcesKeys.required,
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
  messageResourceKey: validationResourcesKeys.disabledDate,
  messageFormat: (message, { value }) => formatString(message, value),
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
