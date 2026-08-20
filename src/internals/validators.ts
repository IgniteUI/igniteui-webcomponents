import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import { isDateExceedingMax, isDateLessThanMin } from './date/compare.js';
import { CalendarDay } from './date/model.js';
import { asNumber, numberOfDecimals, roundPrecise } from './utils/math.js';
import { formatString } from './utils/strings.js';
import { isDefined } from './utils/types.js';

type ValidatorHandler<T> = (host: T) => boolean;
type ValidatorMessageFormat<T> = (host: T) => string;

/** @hidden */
export interface Validator<T = any> {
  key: keyof ValidityStateFlags;
  message: string | ValidatorMessageFormat<T>;
  isValid: ValidatorHandler<T>;
}

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const requiredValidator: Validator<{
  required: boolean;
  value?: unknown;
}> = {
  key: 'valueMissing',
  message: ValidationResourceStringsEN.required_validation_error!,
  isValid: ({ required, value }) => (required ? !!value : true),
};

export const requiredBooleanValidator: Validator<{
  required: boolean;
  checked: boolean;
}> = {
  key: 'valueMissing',
  message: ValidationResourceStringsEN.required_validation_error!,
  isValid: ({ required, checked }) => (required ? checked : true),
};

export const minLengthValidator: Validator<{
  minLength?: number;
  value: string;
}> = {
  key: 'tooShort',
  message: ({ minLength }) =>
    formatString(
      ValidationResourceStringsEN.min_length_validation_error!,
      minLength
    ),
  isValid: ({ minLength, value }) =>
    minLength && value ? value.length >= asNumber(minLength) : true,
};

export const maxLengthValidator: Validator<{
  maxLength?: number;
  value: string;
}> = {
  key: 'tooLong',
  message: ({ maxLength }) =>
    formatString(
      ValidationResourceStringsEN.max_length_validation_error!,
      maxLength
    ),
  isValid: ({ maxLength, value }) =>
    maxLength && value ? value.length <= asNumber(maxLength) : true,
};

export const patternValidator: Validator<{ pattern?: string; value: string }> =
  {
    key: 'patternMismatch',
    message: ValidationResourceStringsEN.pattern_validation_error!,
    isValid: ({ pattern, value }) =>
      pattern && value ? new RegExp(pattern, 'u').test(value) : true,
  };

export const minValidator: Validator<{
  min?: number;
  value: number | string;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) =>
    formatString(ValidationResourceStringsEN.min_validation_error!, min),
  isValid: ({ min, value }) =>
    isDefined(value) && value !== '' && isDefined(min)
      ? asNumber(value) >= asNumber(min)
      : true,
};

export const maxValidator: Validator<{
  max?: number;
  value: number | string;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) =>
    formatString(ValidationResourceStringsEN.max_validation_error!, max),
  isValid: ({ max, value }) =>
    isDefined(value) && value !== '' && isDefined(max)
      ? asNumber(value) <= asNumber(max)
      : true,
};

export const stepValidator: Validator<{
  min?: number;
  step?: number;
  value: number | string;
}> = {
  key: 'stepMismatch',
  message: 'Value does not conform to step constraint',
  isValid: ({ min, step, value }) => {
    if (isDefined(value) && value !== '' && isDefined(step)) {
      const _value = asNumber(value) - asNumber(min);
      const _step = asNumber(step);
      const magnitude = numberOfDecimals(_step) + 1;
      const rem = roundPrecise(
        Math.abs(_value - _step * Math.round(_value / _step)),
        magnitude
      );

      return !rem;
    }
    return true;
  },
};

export const emailValidator: Validator<{ value: string }> = {
  key: 'typeMismatch',
  message: ValidationResourceStringsEN.email_validation_error!,
  isValid: ({ value }) => (value ? emailRegex.test(value) : true),
};

export const urlValidator: Validator<{ value: string }> = {
  key: 'typeMismatch',
  message: ValidationResourceStringsEN.url_validation_error!,
  isValid: ({ value }) => (value ? URL.canParse(value) : true),
};

export const minDateValidator: Validator<{
  value?: Date | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) =>
    formatString(ValidationResourceStringsEN.min_validation_error!, min),
  isValid: ({ value, min }) =>
    value && min ? CalendarDay.compare(value, min) >= 0 : true,
};

export const maxDateValidator: Validator<{
  value?: Date | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) =>
    formatString(ValidationResourceStringsEN.max_validation_error!, max),
  isValid: ({ value, max }) =>
    value && max ? CalendarDay.compare(value, max) <= 0 : true,
};

/** A host whose bound comparisons follow the parts present in its format. */
interface DatePartsHost {
  hasDateParts(): boolean;
  hasTimeParts(): boolean;
}

/**
 * Creates a `rangeUnderflow` validator for hosts whose `min` comparison must
 * respect the parts of the host's format — day granularity when the format has
 * no time parts, time-of-day granularity when it has no date parts.
 *
 * `resolveValues` returns the dates checked against the bound; empty slots
 * are skipped, so a partial range validates only its present ends.
 */
export function createMinDateTimeValidator<
  T extends DatePartsHost & { min?: Date | null },
>(resolveValues: (host: T) => (Date | null | undefined)[]): Validator<T> {
  return {
    key: 'rangeUnderflow',
    message: ({ min }) =>
      formatString(ValidationResourceStringsEN.min_validation_error!, min),
    isValid: (host) => {
      const { min } = host;
      return min
        ? resolveValues(host).every(
            (date) =>
              !date ||
              !isDateLessThanMin(
                date,
                min,
                host.hasTimeParts(),
                host.hasDateParts()
              )
          )
        : true;
    },
  };
}

/**
 * Creates a `rangeOverflow` validator for hosts whose `max` comparison must
 * respect the parts of the host's format. See {@link createMinDateTimeValidator}.
 */
export function createMaxDateTimeValidator<
  T extends DatePartsHost & { max?: Date | null },
>(resolveValues: (host: T) => (Date | null | undefined)[]): Validator<T> {
  return {
    key: 'rangeOverflow',
    message: ({ max }) =>
      formatString(ValidationResourceStringsEN.max_validation_error!, max),
    isValid: (host) => {
      const { max } = host;
      return max
        ? resolveValues(host).every(
            (date) =>
              !date ||
              !isDateExceedingMax(
                date,
                max,
                host.hasTimeParts(),
                host.hasDateParts()
              )
          )
        : true;
    },
  };
}
