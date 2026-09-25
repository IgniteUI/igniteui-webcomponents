import { requiredValidator, type Validator } from '#internals/validators.js';
import type IgcColorPickerComponent from './color-picker.js';

export const colorPickerValidators: Validator<IgcColorPickerComponent>[] = [
  requiredValidator,
];
