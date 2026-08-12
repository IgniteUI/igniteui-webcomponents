import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import { isEmpty } from '#internals/utils/arrays.js';
import { formatString } from '#internals/utils/strings.js';
import type { Validator } from '#internals/validators.js';
import {
  calendarRange,
  isDateExceedingMax,
  isDateInRanges,
  isDateLessThanMin,
} from '../calendar/helpers.js';
import type { DateRangeValue } from '../types.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

/** Whether both ends of the current range pass `predicate`. */
function isRangeWithinBounds(
  host: IgcDateRangePickerComponent,
  predicate: (date: Date) => boolean
): boolean {
  const { start, end } = host.value ?? {};
  return !((start && !predicate(start)) || (end && !predicate(end)));
}

export const minDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'rangeUnderflow',
  message: (host) =>
    formatString(ValidationResourceStringsEN.min_validation_error!, host.min),
  isValid: (host) =>
    host.min
      ? isRangeWithinBounds(
          host,
          (date) =>
            !isDateLessThanMin(
              date,
              host.min!,
              host.hasTimeParts(),
              host.hasDateParts()
            )
        )
      : true,
};

export const maxDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'rangeOverflow',
  message: (host) =>
    formatString(ValidationResourceStringsEN.max_validation_error!, host.max),
  isValid: (host) =>
    host.max
      ? isRangeWithinBounds(
          host,
          (date) =>
            !isDateExceedingMax(
              date,
              host.max!,
              host.hasTimeParts(),
              host.hasDateParts()
            )
        )
      : true,
};

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
