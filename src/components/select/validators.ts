import { type Validator, requiredValidator } from '../common/validators.js';
import type IgcSelectComponent from './select.js';

export const selectValidators: Validator<IgcSelectComponent>[] = [
  requiredValidator,
];
