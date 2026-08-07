import type { Validator } from '../common/validators.js';
import type IgcPinInputComponent from './pin-input.js';

export const pinRequiredValidator: Validator<IgcPinInputComponent> = {
  key: 'valueMissing',
  message: 'Please fill in all fields.',
  isValid: (host) => (host.required ? host.value.length === host.length : true),
};
