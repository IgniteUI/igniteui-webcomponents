import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import { calendarRange } from '#internals/date/model.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { formatString } from '#internals/utils/strings.js';
import {
  createMaxDateTimeValidator,
  createMinDateTimeValidator,
  type Validator,
} from '#internals/validators.js';
import { isDateInRanges } from '../calendar/helpers.js';
import type { DateRangeValue } from '../types.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

/** The ends of the current range, each validated against the bound on its own. */
function rangeEnds({ value }: IgcDateRangePickerComponent) {
  return [value?.start, value?.end];
}

export const minDateRangeValidator =
  createMinDateTimeValidator<IgcDateRangePickerComponent>(rangeEnds);

export const maxDateRangeValidator =
  createMaxDateTimeValidator<IgcDateRangePickerComponent>(rangeEnds);

export const requiredDateRangeValidator: Validator<IgcDateRangePickerComponent> =
  {
    key: 'valueMissing',
    message: ValidationResourceStringsEN.required_validation_error!,
    isValid: (host) => {
      return host.required ? isCompleteDateRange(host.value) : true;
    },
  };

export const badInputDateRangeValidator: Validator<IgcDateRangePickerComponent> =
  {
    key: 'badInput',
    message: (host) =>
      formatString(
        ValidationResourceStringsEN.disabled_date_validation_error!,
        host.value
      ),
    isValid: (host) => {
      const { value, disabledDates } = host;

      if (
        !isCompleteDateRange(value) ||
        !disabledDates ||
        isEmpty(disabledDates)
      ) {
        return true;
      }

      return Array.from(
        calendarRange({ start: value.start, end: value.end, inclusive: true })
      ).every((date) => !isDateInRanges(date, disabledDates));
    },
  };

export const dateRangeValidators: Validator<IgcDateRangePickerComponent>[] = [
  requiredDateRangeValidator,
  minDateRangeValidator,
  maxDateRangeValidator,
  badInputDateRangeValidator,
];

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is { start: Date; end: Date } {
  return value != null && value.start != null && value.end != null;
}
