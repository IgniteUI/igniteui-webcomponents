import {
  type Validator,
  requiredBooleanValidator,
} from '../common/validators.js';
import type { IgcCheckboxBaseComponent } from './checkbox-base.js';

export const checkBoxValidators: Validator<IgcCheckboxBaseComponent>[] = [
  requiredBooleanValidator,
];
