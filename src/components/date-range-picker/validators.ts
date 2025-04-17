import { calendarRange, isDateInRanges } from '../calendar/helpers.js';
import type { DateRangeDescriptor } from '../calendar/types.js';
import messages from '../common/localization/validation-en.js';
import { formatString, last } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';
import type { DateRangeValue } from './date-range-picker.js';

export const minDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => formatString(messages.min, min),
  isValid: ({ value, min }) => {
    if (
      min &&
      ((value?.start &&
        DateTimeUtil.lessThanMinValue(value?.start, min, false, true)) ||
        (value?.end &&
          DateTimeUtil.lessThanMinValue(value?.end, min, false, true)))
    ) {
      return false;
    }
    return true;
  },
};
export const maxDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(messages.max, max),
  isValid: ({ value, max }) => {
    if (
      max &&
      ((value?.start &&
        DateTimeUtil.greaterThanMaxValue(value?.start, max, false, true)) ||
        (value?.end &&
          DateTimeUtil.greaterThanMaxValue(value?.end, max, false, true)))
    ) {
      return false;
    }
    return true;
  },
};

export const requiredDateRangeValidator: Validator<{
  required: boolean;
  value?: DateRangeValue | null;
}> = {
  key: 'valueMissing',
  message: messages.required,
  isValid: ({ required, value }) => {
    if (required) {
      return !!(value?.start && value?.end);
    }
    return true;
  },
};

export const badInputDateRangeValidator: Validator<{
  required: boolean;
  value?: DateRangeValue | null;
  disabledDates?: DateRangeDescriptor[];
}> = {
  key: 'badInput',
  message: ({ value }) => formatString(messages.disabledDate, value),
  isValid: ({ value, disabledDates }) => {
    if (value?.start && value?.end && disabledDates) {
      const range = Array.from(
        calendarRange({ start: value.start, end: value.end })
      );
      range.push(last(range).add('day', 1));
      const rangeIncludingDisabled = range.some((day) =>
        isDateInRanges(day, disabledDates)
      );
      return !rangeIncludingDisabled;
    }
    return true;
  },
};

export const dateRangePickerValidators: Validator<IgcDateRangePickerComponent>[] =
  [
    requiredDateRangeValidator,
    minDateRangeValidator,
    maxDateRangeValidator,
    badInputDateRangeValidator,
  ];
