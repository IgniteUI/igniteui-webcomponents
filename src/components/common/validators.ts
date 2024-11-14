import { DateTimeUtil } from '../date-time-input/date-util.js';
import validatorMessages from './localization/validation-en.js';
import { asNumber, formatString, isDefined } from './util.js';

type ValidatorHandler<T> = (host: T) => boolean;
type ValidatorMessageFormat<T> = (host: T) => string;

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
  message: validatorMessages.required,
  isValid: ({ required, value }) => (required ? !!value : true),
};

export const requiredBooleanValidator: Validator<{
  required: boolean;
  checked: boolean;
}> = {
  key: 'valueMissing',
  message: validatorMessages.required,
  isValid: ({ required, checked }) => (required ? checked : true),
};

export const minLengthValidator: Validator<{
  minLength: number;
  value: string;
}> = {
  key: 'tooShort',
  message: ({ minLength }) =>
    formatString(validatorMessages.minLength, minLength),
  isValid: ({ minLength, value }) =>
    minLength ? value.length >= minLength : true,
};

export const maxLengthValidator: Validator<{
  maxLength: number;
  value: string;
}> = {
  key: 'tooLong',
  message: ({ maxLength }) =>
    formatString(validatorMessages.maxLength, maxLength),
  isValid: ({ maxLength, value }) =>
    maxLength ? value.length <= maxLength : true,
};

export const patternValidator: Validator<{ pattern: string; value: string }> = {
  key: 'patternMismatch',
  message: validatorMessages.pattern,
  isValid: ({ pattern, value }) =>
    pattern ? new RegExp(pattern, 'v').test(value) : true,
};

export const minValidator: Validator<{
  min: number | string;
  value: number | string;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => formatString(validatorMessages.min, min),
  isValid: ({ min, value }) =>
    isDefined(min)
      ? isDefined(value) && asNumber(value) >= asNumber(min)
      : true,
};

export const maxValidator: Validator<{
  max: number | string;
  value: number | string;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(validatorMessages.max, max),
  isValid: ({ max, value }) =>
    isDefined(max)
      ? isDefined(value) && asNumber(value) <= asNumber(max)
      : true,
};

export const stepValidator: Validator<{
  min: number | string;
  step: number | string;
  value: number | string;
}> = {
  key: 'stepMismatch',
  message: 'Value does not conform to step constraint',
  isValid: ({ min, step, value }) =>
    isDefined(step)
      ? (asNumber(value) - asNumber(min)) % asNumber(step, 1) === 0
      : true,
};

export const emailValidator: Validator<{ value: string }> = {
  key: 'typeMismatch',
  message: validatorMessages.email,
  isValid: ({ value }) => emailRegex.test(value),
};

export const urlValidator: Validator<{ value: string }> = {
  key: 'typeMismatch',
  message: validatorMessages.url,
  isValid: ({ value }) => URL.canParse(value),
};

export const minDateValidator: Validator<{
  value?: Date | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => formatString(validatorMessages.min, min),
  isValid: ({ value, min }) =>
    min
      ? !DateTimeUtil.lessThanMinValue(value ?? new Date(), min, false, true)
      : true,
};

export const maxDateValidator: Validator<{
  value?: Date | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  message: ({ max }) => formatString(validatorMessages.max, max),
  isValid: ({ value, max }) =>
    max
      ? !DateTimeUtil.greaterThanMaxValue(value ?? new Date(), max, false, true)
      : true,
};
