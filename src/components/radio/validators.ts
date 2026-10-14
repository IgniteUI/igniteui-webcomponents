import { requiredValidator, type Validator } from '#internals/validators.js';
import { getGroupMembers } from './controller.js';
import type IgcRadioComponent from './radio.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    ...requiredValidator,
    isValid: (host) => {
      const radios = getGroupMembers(host);
      return radios.some((radio) => radio.required)
        ? radios.some((radio) => radio.checked)
        : true;
    },
  },
];
