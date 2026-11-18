import type { Validator } from '#internals/validators.js';
import { getNumberInputFormat } from './number-format.js';
import type IgcNumberInputComponent from './number-input.js';

/** Shows a bound in the format of the field. A string skips the plain number format of the messages. */
function formatBound(host: IgcNumberInputComponent, bound: number): string {
  return getNumberInputFormat(
    host.locale,
    host.valueFormatOptions
  ).formatDisplay(bound);
}

/** A `null` value is empty, and `0` is a value. The component sets a bound that is not a finite number to `undefined`. */
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
