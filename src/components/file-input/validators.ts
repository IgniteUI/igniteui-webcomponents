import {
  requiredValidator,
  type Validator,
} from '../../internals/validators.js';
import type IgcFileInputComponent from './file-input.js';

export const fileValidators: Validator<IgcFileInputComponent>[] = [
  requiredValidator,
];
