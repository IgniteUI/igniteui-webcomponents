import {
  createMaxDateTimeValidator,
  createMinDateTimeValidator,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import type IgcDateTimeInputComponent from './date-time-input.js';

export const dateTimeInputValidators: Validator<IgcDateTimeInputComponent>[] = [
  requiredValidator,
  createMinDateTimeValidator<IgcDateTimeInputComponent>(({ value }) => [value]),
  createMaxDateTimeValidator<IgcDateTimeInputComponent>(({ value }) => [value]),
];
