import messages from '../common/localization/validation-en.js';
import { requiredValidator, type Validator } from '../common/validators.js';
import type IgcMaskInputComponent from './mask-input.js';

export const maskValidators: Validator<IgcMaskInputComponent>[] = [
  requiredValidator,
  {
    key: 'badInput',
    message: messages.mask,
    // @ts-expect-error - protected access
    isValid: ({ parser, maskedValue }) => parser.isValidString(maskedValue),
  },
];
