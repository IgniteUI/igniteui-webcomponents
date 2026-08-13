import {
  isDateExceedingMax,
  isDateLessThanMin,
} from '#internals/date/compare.js';
import {
  maxDateValidator,
  minDateValidator,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import type IgcDateTimeInputComponent from './date-time-input.js';

export const dateTimeInputValidators: Validator<IgcDateTimeInputComponent>[] = [
  requiredValidator,
  {
    ...minDateValidator,
    isValid: (host) =>
      host.value && host.min
        ? !isDateLessThanMin(
            host.value,
            host.min,
            host.hasTimeParts(),
            host.hasDateParts()
          )
        : true,
  },
  {
    ...maxDateValidator,
    isValid: (host) =>
      host.value && host.max
        ? !isDateExceedingMax(
            host.value,
            host.max,
            host.hasTimeParts(),
            host.hasDateParts()
          )
        : true,
  },
];
