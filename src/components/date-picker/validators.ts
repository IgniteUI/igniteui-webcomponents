import { isDateInRanges } from '../calendar/helpers.js';
import { validationResourcesKeys } from '../common/i18n/utils.js';
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
    messageResourceKey: validationResourcesKeys.disabledDate,
    messageFormat: (message, { value }) => formatString(message, value),
    isValid: ({ value, disabledDates }) =>
      value && disabledDates ? !isDateInRanges(value, disabledDates) : true,
  },
];
