import { requiredValidator, type Validator } from '#internals/validators.js';
import type IgcMaskInputComponent from './mask-input.js';

export const maskValidators: Validator<IgcMaskInputComponent>[] = [
  requiredValidator,
  {
    key: 'badInput',
    message: (_, localize) => localize('mask_validation_error'),
    isValid: (host) => host.isValidMaskPattern(),
  },
];
