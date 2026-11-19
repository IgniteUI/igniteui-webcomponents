import { requiredValidator, type Validator } from '#internals/validators.js';
import type { RadioGroupState } from './controller.js';
import type IgcRadioComponent from './radio.js';

/** Whether a required group has no checked radio. */
export function isGroupValueMissing(state?: RadioGroupState): boolean {
  return Boolean(state?.hasRequiredRadio && !state.hasCheckedRadio);
}

export const radioValidators: Validator<IgcRadioComponent>[] = [
  {
    ...requiredValidator,
    // The group sync keeps the state, so the check reads no other radio.
    isValid: (host) => !isGroupValueMissing(host['_groupState']),
  },
];
