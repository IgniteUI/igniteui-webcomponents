import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import type { Validator } from '../common/validators.js';
import type IgcRadioComponent from './radio.js';
import { getGroup } from './utils.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    key: 'valueMissing',
    message: ValidationResourceStringsEN.required_validation_error!,
    isValid: (host) => {
      const { radios, checked } = getGroup(host);
      return radios.some((radio) => radio.required) ? checked.length > 0 : true;
    },
  },
];
