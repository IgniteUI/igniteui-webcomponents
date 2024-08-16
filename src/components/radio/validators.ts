import messages from '../common/localization/validation-en.js';
import type { Validator } from '../common/validators.js';
import type IgcRadioComponent from './radio.js';
import { getGroup } from './utils.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    key: 'valueMissing',
    message: messages.required,
    isValid: (host) => {
      const { radios, checked } = getGroup(host);
      return radios.some((radio) => radio.required) ? checked.length > 0 : true;
    },
  },
];
