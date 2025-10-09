import { CalendarDay } from '../calendar/model.js';
import { validationResourcesKeys } from './i18n/utils.js';
import {
  asNumber,
  formatString,
  isDefined,
  numberOfDecimals,
  roundPrecise,
} from './util.js';

type ValidatorHandler<T> = (host: T) => boolean;
type ValidatorMessageKeyFormat<T> = (host: T) => string;
type ValidatorMessageFormat<T> = (message: string, host: T) => string;

/** @ignore */
export interface Validator<T = any> {
  key: keyof ValidityStateFlags;
  messageResourceKey: string | ValidatorMessageKeyFormat<T>;
  messageFormat?: ValidatorMessageFormat<T>;
  isValid: ValidatorHandler<T>;
}

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const requiredValidator: Validator<{
  required: boolean;
  value?: unknown;
}> = {
  key: 'valueMissing',
  messageResourceKey: validationResourcesKeys.required,
  isValid: ({ required, value }) => (required ? !!value : true),
};

export const requiredBooleanValidator: Validator<{
  required: boolean;
  checked: boolean;
}> = {
  key: 'valueMissing',
  messageResourceKey: validationResourcesKeys.required,
  isValid: ({ required, checked }) => (required ? checked : true),
};

export const minLengthValidator: Validator<{
  minLength?: number;
  value: string;
}> = {
  key: 'tooShort',
  messageResourceKey: validationResourcesKeys.minLength,
  messageFormat: (message, { minLength }) => formatString(message, minLength),
  isValid: ({ minLength, value }) =>
    minLength && value ? value.length >= asNumber(minLength) : true,
};

export const maxLengthValidator: Validator<{
  maxLength?: number;
  value: string;
}> = {
  key: 'tooLong',
  messageResourceKey: validationResourcesKeys.maxLength,
  messageFormat: (message, { maxLength }) => formatString(message, maxLength),
  isValid: ({ maxLength, value }) =>
    maxLength && value ? value.length <= asNumber(maxLength) : true,
};

export const patternValidator: Validator<{ pattern?: string; value: string }> =
  {
    key: 'patternMismatch',
    messageResourceKey: validationResourcesKeys.pattern,
    isValid: ({ pattern, value }) =>
      pattern && value ? new RegExp(pattern, 'u').test(value) : true,
  };

export const minValidator: Validator<{
  min?: number;
  value: number | string;
}> = {
  key: 'rangeUnderflow',
  messageResourceKey: validationResourcesKeys.min,
  messageFormat: (message, { min }) => formatString(message, min),
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
  messageResourceKey: validationResourcesKeys.max,
  messageFormat: (message, { max }) => formatString(message, max),
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
  messageResourceKey: 'Value does not conform to step constraint',
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
  messageResourceKey: validationResourcesKeys.email,
  isValid: ({ value }) => (value ? emailRegex.test(value) : true),
};

export const urlValidator: Validator<{ value: string }> = {
  key: 'typeMismatch',
  messageResourceKey: validationResourcesKeys.url,
  isValid: ({ value }) => (value ? URL.canParse(value) : true),
};

export const minDateValidator: Validator<{
  value?: Date | null;
  min?: Date | null;
}> = {
  key: 'rangeUnderflow',
  messageResourceKey: validationResourcesKeys.min,
  messageFormat: (message, { min }) => formatString(message, min),
  isValid: ({ value, min }) =>
    value && min ? CalendarDay.compare(value, min) >= 0 : true,
};

export const maxDateValidator: Validator<{
  value?: Date | null;
  max?: Date | null;
}> = {
  key: 'rangeOverflow',
  messageResourceKey: validationResourcesKeys.max,
  messageFormat: (message, { max }) => formatString(message, max),
  isValid: ({ value, max }) =>
    value && max ? CalendarDay.compare(value, max) <= 0 : true,
};
