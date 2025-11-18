import { ValidationResourceStringsEN } from 'igniteui-i18n-core';
import { requiredValidator, type Validator } from '../common/validators.js';
import type IgcMaskInputComponent from './mask-input.js';

export const maskValidators: Validator<IgcMaskInputComponent>[] = [
  requiredValidator,
  {
    key: 'badInput',
    message: ValidationResourceStringsEN.mask_validation_error!,
    // @ts-expect-error - protected access
    isValid: ({ _parser, _maskedValue }) => _parser.isValidString(_maskedValue),
  },
];
