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
    messageResourceKey: (host) =>
      (host.type === 'email'
        ? emailValidator.messageResourceKey
        : urlValidator.messageResourceKey) as string,
  },
];

export const numberValidators: Validator<IgcInputComponent>[] = [
  requiredValidator,
  minValidator,
  maxValidator,
  stepValidator,
];
