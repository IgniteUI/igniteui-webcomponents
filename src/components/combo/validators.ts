import { validationResourcesKeys } from '../common/i18n/utils.js';
import type { Validator } from '../common/validators.js';
import type IgcComboComponent from './combo.js';

export const comboValidators: Validator<IgcComboComponent>[] = [
  {
    key: 'valueMissing',
    messageResourceKey: validationResourcesKeys.required,
    isValid: ({ required, value }) =>
      required ? Array.isArray(value) && value.length > 0 : true,
  },
];
