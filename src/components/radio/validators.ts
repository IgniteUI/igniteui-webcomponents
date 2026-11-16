import { requiredValidator, type Validator } from '#internals/validators.js';
import { getGroupMembers } from './controller.js';
import type IgcRadioComponent from './radio.js';

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    ...requiredValidator,
    isValid: (host) => {
      // `some` needs no order, so skip the sort.
      const radios = getGroupMembers(host, false);
      return radios.some((radio) => radio.required)
        ? radios.some((radio) => radio.checked)
        : true;
    },
  },
];
