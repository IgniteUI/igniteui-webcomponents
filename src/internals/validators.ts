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

/** Formats the `rangeUnderflow` message with the `min` bound. */
function minBoundMessage(min: unknown): string {
  return formatString(ValidationResourceStringsEN.min_validation_error!, min);
}

/** Formats the `rangeOverflow` message with the `max` bound. */
function maxBoundMessage(max: unknown): string {
  return formatString(ValidationResourceStringsEN.max_validation_error!, max);
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
  message: ({ min }) => minBoundMessage(min),
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
  message: ({ max }) => maxBoundMessage(max),
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
  message: ({ min }) => minBoundMessage(min),
  isValid: ({ value, min }) =>
    value && min ? CalendarDay.compare(value, min) >= 0 : true,
};

export const maxDateValidator: Validator<{
  value?: Date | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => maxBoundMessage(max),
  isValid: ({ value, max }) =>
    value && max ? CalendarDay.compare(value, max) <= 0 : true,
};

/** A host that compares bounds at the granularity of its own format. */
interface DatePartsHost {
  hasDateParts(): boolean;
  hasTimeParts(): boolean;
}

/** Compares a date with a bound at the granularity of the host format. */
type DateBoundComparer = (
  date: Date,
  bound: Date,
  hasTimeParts: boolean,
  hasDateParts: boolean
) => boolean;

/**
 * Returns `true` when no value of the host exceeds `bound`. An unset bound
 * and an empty value both pass.
 */
function isWithinBound<T extends DatePartsHost>(
  host: T,
  bound: Date | null | undefined,
  values: (Date | null | undefined)[],
  exceeds: DateBoundComparer
): boolean {
  return bound
    ? values.every(
        (date) =>
          !date ||
          !exceeds(date, bound, host.hasTimeParts(), host.hasDateParts())
      )
    : true;
}

/**
 * Creates a `rangeUnderflow` validator for the `min` bound of a host.
 *
 * @remarks
 * The comparison follows the host format: day granularity without time
 * parts, time-of-day granularity without date parts. `resolveValues` gives
 * the dates to compare, and empty slots are skipped, so a partial range
 * validates only the ends it has.
 */
export function createMinDateTimeValidator<
  T extends DatePartsHost & { min?: Date | null },
>(resolveValues: (host: T) => (Date | null | undefined)[]): Validator<T> {
  return {
    key: 'rangeUnderflow',
    message: (host) => minBoundMessage(host.min),
    isValid: (host) =>
      isWithinBound(host, host.min, resolveValues(host), isDateLessThanMin),
  };
}

/**
 * Creates a `rangeOverflow` validator for the `max` bound of a host.
 * See {@link createMinDateTimeValidator}.
 */
export function createMaxDateTimeValidator<
  T extends DatePartsHost & { max?: Date | null },
>(resolveValues: (host: T) => (Date | null | undefined)[]): Validator<T> {
  return {
    key: 'rangeOverflow',
    message: (host) => maxBoundMessage(host.max),
    isValid: (host) =>
      isWithinBound(host, host.max, resolveValues(host), isDateExceedingMax),
  };
}
