import { isDateInRanges } from '../calendar/helpers.js';
import messages from '../common/localization/validation-en.js';
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
    message: ({ value }) => formatString(messages.disabledDate, value),
    isValid: ({ value, disabledDates }) =>
      value && disabledDates ? !isDateInRanges(value, disabledDates) : true,
  },
];
