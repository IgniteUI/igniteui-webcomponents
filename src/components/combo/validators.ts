import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import type { Validator } from '../common/validators.js';
import type IgcComboComponent from './combo.js';

export const comboValidators: Validator<IgcComboComponent>[] = [
  {
    key: 'valueMissing',
    message: ValidationResourceStringsEN.required_validation_error!,
    isValid: ({ required, value }) =>
      required ? Array.isArray(value) && value.length > 0 : true,
  },
];
