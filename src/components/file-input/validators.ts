import { type Validator, requiredValidator } from '../common/validators.js';
import type IgcFileInputComponent from './file-input.js';

export const fileValidators: Validator<IgcFileInputComponent>[] = [
  requiredValidator,
];
