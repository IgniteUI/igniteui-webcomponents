import { requiredValidator, type Validator } from '../common/validators.js';
import type IgcColorPickerComponent from './color-picker.js';

export const colorPickerValidators: Validator<IgcColorPickerComponent>[] = [
  requiredValidator,
];
