import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import { isDateInRanges } from '../calendar/helpers.js';
import { formatString } from '../common/util.js';
import {
  maxDateValidator,
  minDateValidator,
  requiredValidator,
  type Validator,
} from '../common/validators.js';
import type IgcDatePickerComponent from './date-picker.js';

export const datePickerValidators: Validator<IgcDatePickerComponent>[] = [
  requiredValidator,
  minDateValidator,
  maxDateValidator,
  {
    key: 'badInput',
    message: ({ value }) =>
      formatString(
        ValidationResourceStringsEN.disabled_date_validation_error!,
        value
      ),
    isValid: ({ value, disabledDates }) =>
      value && disabledDates ? !isDateInRanges(value, disabledDates) : true,
  },
];
