import {
  type Validator,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '../common/validators.js';
import type IgcTextareaComponent from './textarea.js';

export const textAreaValidators: Validator<IgcTextareaComponent>[] = [
  requiredValidator,
  minLengthValidator,
  maxLengthValidator,
];
