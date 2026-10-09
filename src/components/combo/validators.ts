import { requiredValidator, type Validator } from '#internals/validators.js';
import type IgcComboComponent from './combo.js';

export const comboValidators: Validator<IgcComboComponent>[] = [
  {
    ...requiredValidator,
    isValid: ({ required, value }) =>
      required ? Array.isArray(value) && value.length > 0 : true,
  },
];
