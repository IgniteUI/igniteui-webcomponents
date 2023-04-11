export type Direction = 'ltr' | 'rtl' | 'auto';

export interface FormAssociatedElement {
  /** Returns the HTMLFormElement associated with this element. */
  get form(): HTMLFormElement | null;
  /**
   * Returns a ValidityState object which represents the different validity states
   * the element can be in, with respect to constraint validation.
   */
  get validity(): ValidityState;
  /** A string containing the validation message of this element. */
  get validationMessage(): string;
  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  get willValidate(): boolean;
  /** Checks for validity of the control and emits the invalid event if it invalid. */
  checkValidity(): void;
  /** Checks for validity of the control and shows the browser message if it invalid. */
  reportValidity(): void;
  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  setCustomValidity(message: string): void;
}
