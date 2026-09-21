import type { LitElement } from 'lit';
import type {
  ElementInternalsController,
  FormValueType,
} from '../../controllers/internals.js';
import type { Validator } from '../../validators.js';

export type FormRestoreMode = 'autocomplete' | 'restore';
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
   * The disabled state of the component.
   * @attr
   * @default false
   */
  public disabled: boolean;

  /**
   * Sets the control into invalid state (visual state only).
   * @attr
   * @default false
   */
  public invalid: boolean;

  /**
   * The name of the control, submitted with the form data.
   * @attr
   */
  public name: string;

  /** Returns the HTMLFormElement associated with this element. */
  public get form(): HTMLFormElement | null;

  /** Returns a `ValidityState` object for the element. */
  public get validity(): ValidityState;

  /** A string containing the validation message of this element. */
  public get validationMessage(): string;

  /**
   * Returns `true` when the element is a candidate for constraint validation.
   */
  public get willValidate(): boolean;

  //#endregion

  //#region Methods

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

  /** Sets the default value from a change of the `value` attribute. */
  protected _setDefaultValue(current: string | null): void;

  /** Restores the default value on a form reset. */
  protected _restoreDefaultValue(): void;

  /** Runs the validators and updates the internal validity state. */
  protected _validate(message?: string): void;

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

  /** Runs on browser auto-fill. Not implemented. */
  protected formStateRestoreCallback(
    state: FormValueType,
    mode: FormRestoreMode
  ): void;

  /** Checks validity and emits `invalid` when the control is invalid. */
  public checkValidity(): boolean;

  /** Checks validity and shows the browser message when invalid. */
  public reportValidity(): boolean;

  /** Sets a custom message. Invalid while `message` is not empty. */
  public setCustomValidity(message: string): void;

  //#endregion
}

export declare class FormAssociatedElementInterface extends BaseFormAssociatedElement {
  /** The initial value of the component. */
  public set defaultValue(value: unknown);
  public get defaultValue(): unknown;

  /**
   * Commits a user value change, then emits `eventName`. Sets **touched**
   * *before* the `value` assignment, so the setter styles invalid at once.
   */
  protected _commitValue(value: unknown, eventName: string): boolean;
}

export declare class FormAssociatedCheckboxElementInterface extends BaseFormAssociatedElement {
  /** The initial checked state of the component. */
  public set defaultChecked(value: boolean);
  public get defaultChecked(): boolean;
}

export declare class FormRequiredInterface {
  protected _required: boolean;

  /**
   * When set, makes the component a required field for validation.
   * @attr
   * @default false
   */
  public set required(value: boolean);
  public get required(): boolean;
}

export const InternalInvalidEvent = 'igc-form-internal-invalid';
export const InternalResetEvent = 'igc-form-internal-reset';
