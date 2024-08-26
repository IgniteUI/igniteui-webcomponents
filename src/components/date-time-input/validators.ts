import {
  type Validator,
  maxDateValidator,
  minDateValidator,
  requiredValidator,
} from '../common/validators.js';
import type IgcDateTimeInputComponent from './date-time-input.js';
import { DateTimeUtil } from './date-util.js';

export const dateTimeInputValidators: Validator<IgcDateTimeInputComponent>[] = [
  requiredValidator,
  {
    ...minDateValidator,
    isValid: (host) =>
      host.min
        ? !DateTimeUtil.lessThanMinValue(
            host.value || new Date(),
            host.min,
            // @ts-expect-error - private access
            host.hasTimeParts,
            // @ts-expect-error - private access
            host.hasDateParts
          )
        : true,
  },
  {
    ...maxDateValidator,
    isValid: (host) =>
      host.max
        ? !DateTimeUtil.greaterThanMaxValue(
            host.value || new Date(),
            host.max,
            // @ts-expect-error - private access
            host.hasTimeParts,
            // @ts-expect-error - private access
            host.hasDateParts
          )
        : true,
  },
];
