import { validationResourcesKeys } from '../common/i18n/utils.js';
import type { Validator } from '../common/validators.js';
import type IgcRadioComponent from './radio.js';
import { getGroup } from './utils.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    key: 'valueMissing',
    messageResourceKey: validationResourcesKeys.required,
    isValid: (host) => {
      const { radios, checked } = getGroup(host);
      return radios.some((radio) => radio.required) ? checked.length > 0 : true;
    },
  },
];
