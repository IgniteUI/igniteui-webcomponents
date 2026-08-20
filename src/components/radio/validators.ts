import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import type { Validator } from '#internals/validators.js';
import { getGroupMembers } from './controller.js';
import type IgcRadioComponent from './radio.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    key: 'valueMissing',
    message: ValidationResourceStringsEN.required_validation_error!,
    isValid: (host) => {
      const radios = getGroupMembers(host);
      return radios.some((radio) => radio.required)
        ? radios.some((radio) => radio.checked)
        : true;
    },
  },
];
