import type { LitElement } from 'lit';
import type {
  ElementInternalsController,
  FormValueType,
} from '../../controllers/internals.js';
import type { Validator } from '../../validators.js';

export type { FormValueType };
export type IgcFormControl = LitElement &
  (FormAssociatedElementInterface | FormAssociatedCheckboxElementInterface);

export declare class BaseFormAssociatedElement {
  public static readonly formAssociated: boolean;

  //#region Properties

  protected readonly _internals: ElementInternalsController;
  protected readonly _formValue: unknown;

  protected _pristine: boolean;
  protected _disabled: boolean;
  protected _invalid: boolean;

  protected get __validators(): Validator[];

  /**
   * Whether the control is disabled. A disabled control is not validated, and
   * the form does not submit its value.
   * @attr
   * @default false
   */
  public disabled: boolean;

  /**
   * Whether the control shows the invalid state. It changes only the visual
   * state, not the validity.
   * @attr
   * @default false
   */
  public invalid: boolean;

  /**
   * The name of the control, submitted with the form data.
   * @attr
   */
  public name: string;

  /** The form that the control is associated with, or `null`. */
  public get form(): HTMLFormElement | null;

  /** The validity state of the control. */
  public get validity(): ValidityState;

  /**
   * The validation message of the control. It is empty when the control is
   * valid.
   */
  public get validationMessage(): string;

  /** Whether the control is a candidate for constraint validation. */
  public get willValidate(): boolean;

  //#endregion

  //#region Methods

  /**
   * Runs when a `<label>` or a click on the host activates the component.
   * Does nothing by default.
   */
  protected _handleLabelActivation(): void;

  /** Submits the parent form, if any, on `Enter`. */
  protected _handleEnterKeydown(event: KeyboardEvent): void;

  /** Sets **touched**, then validates. Call this on blur or focusout. */
  protected _handleBlur(): void;

  /** Sets **touched** without validating. Call this on a user interaction. */
  protected _setTouchedState(): void;

  /** Sets **touched**, then emits `eventName`. Needs the emitter mixin. */
  protected _emitTouchedEvent(
    eventName: string,
    init?: CustomEventInit
  ): boolean;

  /** Runs `callback` and restores the pristine flag. */
  protected _withPristine(callback: () => void): void;

  /** Sets the default value from a change of the `value` attribute. */
  protected _setDefaultValue(current: string | null): void;

  /** Restores the default value on a form reset. */
  protected _restoreDefaultValue(): void;

  /** Resets the interaction and validity state, as a form reset does. */
  protected _resetValidationState(): void;

  /** Runs the validators and updates the internal validity state. */
  protected _validate(message?: string): void;

  /** Reports the validity without moving the focus. */
  protected _reportValidity(): boolean;

  /** Sets the submission value and the submission state. */
  protected _setFormValue(value: FormValueType, state?: FormValueType): void;

  /** Runs on form association or de-association. Not implemented. */
  protected formAssociatedCallback(form: HTMLFormElement): void;

  /**
   * Runs when the component, or a parent `fieldset`, becomes disabled or
   * enabled.
   */
  protected formDisabledCallback(state: boolean): void;

  /**
   * Resets the value, state and validation to the defaults. Override
   * `_restoreDefaultValue`, not this callback.
   */
  protected formResetCallback(): void;

  /**
   * Checks validity and emits `invalid` when the control is invalid. Returns
   * `true` when the control is valid.
   */
  public checkValidity(): boolean;

  /**
   * Checks validity. As for a native control, an invalid control emits
   * `invalid` and takes the focus. It shows its own validation messages, not
   * the message of the browser. Returns `true` when the control is valid.
   */
  public reportValidity(): boolean;

  /**
   * Sets a custom validation message. The control is invalid while the message
   * is not empty. An empty string removes the custom error.
   */
  public setCustomValidity(message: string): void;

  //#endregion
}

export declare class FormAssociatedElementInterface extends BaseFormAssociatedElement {
  /**
   * The default value of the control. A form reset restores the value to it.
   * While the value is unchanged since the start or the last form reset, a new
   * default also sets the value. The `value` attribute also sets it.
   */
  public set defaultValue(value: unknown);
  public get defaultValue(): unknown;

  /**
   * Commits a user value change, then emits `eventName`. Sets **touched**
   * *before* the `value` assignment, so the setter styles invalid at once.
   */
  protected _commitValue(value: unknown, eventName: string): boolean;
}

export declare class FormAssociatedCheckboxElementInterface extends BaseFormAssociatedElement {
  /**
   * Whether the control is checked by default. A form reset restores the
   * checked state to it. While the checked state is unchanged since the start
   * or the last form reset, a new default also sets the checked state. The
   * `checked` attribute also sets it.
   */
  public set defaultChecked(value: boolean);
  public get defaultChecked(): boolean;
}

export declare class FormRequiredInterface {
  protected _required: boolean;

  /**
   * Whether the control is required. A required control that has no value, or
   * is not checked, fails validation.
   * @attr
   * @default false
   */
  public set required(value: boolean);
  public get required(): boolean;
}

export const InternalInvalidEvent = 'igc-form-internal-invalid';
export const InternalResetEvent = 'igc-form-internal-reset';
