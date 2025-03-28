import { isDateInRanges } from '../calendar/helpers.js';
import messages from '../common/localization/validation-en.js';
import { formatString } from '../common/util.js';
import {
  type Validator,
  maxDateRangeValidator,
  maxDateValidator,
  minDateRangeValidator,
  minDateValidator,
  requiredValidator,
} from '../common/validators.js';
import type IgcDateRangePickerComponent from '../date-range-picker/date-range-picker.js';
import type IgcDatePickerComponent from './date-picker.js';

export const datePickerValidators: Validator<IgcDatePickerComponent>[] = [
  requiredValidator,
  minDateValidator,
  maxDateValidator,
  {
    key: 'badInput',
    message: ({ value }) => formatString(messages.disabledDate, value),
    isValid: ({ value, disabledDates }) =>
      value && disabledDates ? !isDateInRanges(value, disabledDates) : true,
  },
];

export const dateRangePickerValidators: Validator<IgcDateRangePickerComponent>[] =
  [
    requiredValidator,
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
