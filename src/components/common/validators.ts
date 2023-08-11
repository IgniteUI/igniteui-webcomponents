import validatorMessages from './localization/validation-en.js';
import { asNumber, format, isDefined } from './util.js';

type ValidatorHandler<T> = (host: T) => boolean;
type ValidatorMessageFormat<T> = (host: T) => string;

export interface Validator<T = any> {
  key: keyof ValidityStateFlags;
  message: string | ValidatorMessageFormat<T>;
  isValid: ValidatorHandler<T>;
}

export const requiredValidator: Validator<{
  required: boolean;
  value?: string;
}> = {
  key: 'valueMissing',
  message: validatorMessages.required,
  isValid: ({ required, value }) => (required ? !!value : true),
};

export const requiredNumberValidator: Validator<{
  required: boolean;
  value?: number | string;
}> = {
  key: 'valueMissing',
  message: validatorMessages.required,
  isValid: ({ required, value }) => (required ? isDefined(value) : true),
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
  minlength: number;
  value: string;
}> = {
  key: 'tooShort',
  message: ({ minlength }) =>
    format(validatorMessages.minLength, `${minlength}`),
  isValid: ({ minlength, value }) =>
    minlength ? value.length >= minlength : true,
};

export const maxLengthValidator: Validator<{
  maxlength: number;
  value: string;
}> = {
  key: 'tooLong',
  message: ({ maxlength }) =>
    format(validatorMessages.maxLength, `${maxlength}`),
  isValid: ({ maxlength, value }) =>
    maxlength ? value.length <= maxlength : true,
};

export const patternValidator: Validator<{ pattern: string; value: string }> = {
  key: 'patternMismatch',
  message: validatorMessages.pattern,
  isValid: ({ pattern, value }) =>
    pattern ? new RegExp(pattern, 'u').test(value) : true,
};

export const minValidator: Validator<{
  min: number | string;
  value: number | string;
}> = {
  key: 'rangeUnderflow',
  message: ({ min }) => format(validatorMessages.min, `${min}`),
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
  message: ({ max }) => format(validatorMessages.max, `${max}`),
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
