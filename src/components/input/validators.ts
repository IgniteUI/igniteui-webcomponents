import {
  type Validator,
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  patternValidator,
  requiredNumberValidator,
  requiredValidator,
  stepValidator,
  urlValidator,
} from '../common/validators.js';
import type IgcInputComponent from './input.js';

export const stringValidators: Validator<IgcInputComponent>[] = [
  requiredValidator,
  minLengthValidator,
  maxLengthValidator,
  patternValidator,
  {
    key: 'typeMismatch',
    isValid: (host) => {
      switch (host.type) {
        case 'email':
          return emailValidator.isValid(host);
        case 'url':
          return urlValidator.isValid(host);
        default:
          return true;
      }
    },
    message: (host) =>
      (host.type === 'email'
        ? emailValidator.message
        : urlValidator.message) as string,
  },
];

export const numberValidators: Validator<IgcInputComponent>[] = [
  requiredNumberValidator,
  minValidator,
  maxValidator,
  stepValidator,
];
