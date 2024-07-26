import messages from '../common/localization/validation-en.js';
import type { Validator } from '../common/validators.js';
import type IgcComboComponent from './combo.js';

export const comboValidators: Validator<IgcComboComponent>[] = [
  {
    key: 'valueMissing',
    message: messages.required,
    isValid: ({ required, value }) =>
      required ? Array.isArray(value) && value.length > 0 : true,
  },
];
