import { isDateInRanges } from '../calendar/common/calendar.model';
import messages from '../common/localization/validation-en.js';
import { formatString } from '../common/util.js';
import {
  type Validator,
  maxDateValidator,
  minDateValidator,
  requiredValidator,
} from '../common/validators.js';
import type IgcDatePickerComponent from './date-picker.js';

export const datePickerValidators: Validator<IgcDatePickerComponent>[] = [
  requiredValidator,
  minDateValidator,
  maxDateValidator,
  {
    key: 'badInput',
    message: (host) => formatString(messages.disabledDate, host.value),
    isValid: (host) =>
      host.value ? !isDateInRanges(host.value, host.disabledDates ?? []) : true,
  },
];
