import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import {
  calendarRange,
  isDateExceedingMax,
  isDateInRanges,
  isDateLessThanMin,
} from '../calendar/helpers.js';
import { formatString, isEmpty } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import type { DateRangeValue } from '../types.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

export const minDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'rangeUnderflow',
  message: (host) =>
    formatString(ValidationResourceStringsEN.min_validation_error!, host.min),
  isValid: (host) => {
    if (!host.min) {
      return true;
    }

    const isStartInvalid =
      host.value?.start &&
      isDateLessThanMin(
        host.value.start,
        host.min,
        host.hasTimeParts(),
        host.hasDateParts()
      );
    const isEndInvalid =
      host.value?.end &&
      isDateLessThanMin(
        host.value.end,
        host.min,
        host.hasTimeParts(),
        host.hasDateParts()
      );

    return !(isStartInvalid || isEndInvalid);
  },
};

export const maxDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'rangeOverflow',
  message: (host) =>
    formatString(ValidationResourceStringsEN.max_validation_error!, host.max),
  isValid: (host) => {
    if (!host.max) {
      return true;
    }

    const isStartInvalid =
      host.value?.start &&
      isDateExceedingMax(
        host.value.start,
        host.max,
        host.hasTimeParts(),
        host.hasDateParts()
      );
    const isEndInvalid =
      host.value?.end &&
      isDateExceedingMax(
        host.value.end,
        host.max,
        host.hasTimeParts(),
        host.hasDateParts()
      );

    return !(isStartInvalid || isEndInvalid);
  },
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
