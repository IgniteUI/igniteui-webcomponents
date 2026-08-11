import { requiredValidator, type Validator } from '#internals/validators.js';
import type IgcSelectComponent from './select.js';

export const selectValidators: Validator<IgcSelectComponent>[] = [
  requiredValidator,
];
