import type { Validator } from '#internals/validators.js';
import { getHostFormat } from './number-format.js';
import type IgcNumberInputComponent from './number-input.js';

/** The bound as the field shows it. A string skips the plain number format of the messages. */
function formatBound(host: IgcNumberInputComponent, bound: number): string {
  return getHostFormat(host).formatDisplay(bound);
}

/** `null` is empty and `0` is a value. A bound that is not a finite number is `undefined`. */
export const numberInputValidators: Validator<IgcNumberInputComponent>[] = [
  {
    key: 'valueMissing',
    message: (_, localize) => localize('required_validation_error'),
    isValid: ({ required, value }) => !required || value !== null,
  },
  {
    key: 'rangeUnderflow',
    // A failed check means that the bound is a number.
    message: (host, localize) =>
      localize('min_validation_error', formatBound(host, host.min!)),
    isValid: ({ min, value }) =>
      value === null || min === undefined || value >= min,
  },
  {
    key: 'rangeOverflow',
    message: (host, localize) =>
      localize('max_validation_error', formatBound(host, host.max!)),
    isValid: ({ max, value }) =>
      value === null || max === undefined || value <= max,
  },
];
