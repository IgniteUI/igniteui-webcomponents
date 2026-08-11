import {
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import type IgcTextareaComponent from './textarea.js';

export const textAreaValidators: Validator<IgcTextareaComponent>[] = [
  requiredValidator,
  minLengthValidator,
  maxLengthValidator,
];
