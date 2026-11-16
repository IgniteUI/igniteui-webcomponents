import {
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  patternValidator,
  requiredValidator,
  stepValidator,
  urlValidator,
  type Validator,
} from '#internals/validators.js';
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
    message: (host, localize) =>
      localize(
        host.type === 'email'
          ? 'email_validation_error'
          : 'url_validation_error'
      ),
  },
];

export const numberValidators: Validator<IgcInputComponent>[] = [
  requiredValidator,
  minValidator,
  maxValidator,
  stepValidator,
];
