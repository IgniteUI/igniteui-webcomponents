import { isDateInRanges } from '../calendar/helpers.js';
import messages from '../common/localization/validation-en.js';
import { formatString } from '../common/util.js';
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
  isValid: ({ value, min }) =>
    value?.start && min
      ? !DateTimeUtil.lessThanMinValue(value.start, min, false, true)
      : true,
};

export const maxDateRangeValidator: Validator<{
  value?: DateRangeValue | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(messages.max, max),
  isValid: ({ value, max }) =>
    value?.end && max
      ? !DateTimeUtil.greaterThanMaxValue(value.end, max, false, true)
      : true,
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

export const dateRangePickerValidators: Validator<IgcDateRangePickerComponent>[] =
  [
    requiredDateRangeValidator,
    minDateRangeValidator,
    maxDateRangeValidator,
    {
      key: 'badInput',
      message: ({ value }) => formatString(messages.disabledDate, value),
      isValid: ({ value, disabledDates }) => {
        if (value?.start && value?.end && disabledDates) {
          return (
            !isDateInRanges(value.start, disabledDates) &&
            !isDateInRanges(value.end, disabledDates)
          );
        }
        return true;
      },
    },
  ];
