import { isDateInRanges } from '../calendar/helpers.js';
import messages from '../common/localization/validation-en.js';
import { formatString } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

export const minDateRangeValidator: Validator<{
  value?: (Date | null)[] | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => formatString(messages.min, min),
  isValid: ({ value, min }) =>
    value?.[0] && min
      ? !DateTimeUtil.lessThanMinValue(value[0], min, false, true)
      : true,
};

export const maxDateRangeValidator: Validator<{
  value?: (Date | null)[] | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(messages.max, max),
  isValid: ({ value, max }) =>
    value?.[1] && max
      ? !DateTimeUtil.greaterThanMaxValue(value[1], max, false, true)
      : true,
};

export const requiredDateRangeValidator: Validator<{
  required: boolean;
  value?: (Date | null)[] | null;
}> = {
  key: 'valueMissing',
  message: messages.required,
  isValid: ({ required, value }) => {
    if (required) {
      return !!(value?.[0] && value?.[1]);
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
        if (value?.[0] && value?.[1] && disabledDates) {
          return (
            !isDateInRanges(value[0], disabledDates) &&
            !isDateInRanges(value[1], disabledDates)
          );
        }
        return true;
      },
    },
  ];
