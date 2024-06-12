import messages from '../common/localization/validation-en.js';
import type { Validator } from '../common/validators.js';
import type IgcRadioComponent from './radio.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    key: 'valueMissing',
    message: messages.required,
    isValid: (host) => {
      // @ts-expect-error - protected access
      const { radios, checked } = host.group;
      return radios.some((radio) => radio.required) ? checked.length > 0 : true;
    },
  },
];
