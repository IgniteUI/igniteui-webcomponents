/**
 * The resource strings of the number input.
 *
 * TODO: replace with the interface and the English strings of
 * `igniteui-i18n-core` when it ships them.
 */
export interface INumberInputResourceStrings {
  /** The accessible name of the button that increments the value. */
  number_input_increment?: string;
  /** The accessible name of the button that decrements the value. */
  number_input_decrement?: string;
}

/** The English strings, until `igniteui-i18n-core` has them. */
export const NumberInputResourceStringsEN: INumberInputResourceStrings = {
  number_input_increment: 'Increase value',
  number_input_decrement: 'Decrease value',
};
