import type { LitElement } from 'lit';
import type {
  ElementInternalsController,
  FormValueType,
} from '../../controllers/internals.js';
import type { Validator } from '../../validators.js';

export type { FormValueType };

/**
 * Where a write of the value comes from. It sets the pristine and touched
 * states, and whether `_reportChange` reports the value later:
 *
 * - `user`: the user. Sets **touched** first. Dirty, waits for a report.
 * - `edit`: a change reported later, with no user interaction of its own,
 *   such as the clear of a picker. Dirty, waits for a report.
 * - `code`: a set from code, also any write outside of `_writeFrom`. Dirty.
 * - `normalize`: the control rewrites its own value, such as a clamp or a new
 *   format. Keeps pristine. A rewrite of a reported value stays reported.
 * - `default`: the state attribute, a new default or a form reset. Keeps
 *   pristine.
 */
export type WriteOrigin = 'user' | 'edit' | 'code' | 'normalize' | 'default';
export type IgcFormControl = LitElement &
  (FormAssociatedElementInterface | FormAssociatedCheckboxElementInterface);

export declare class BaseFormAssociatedElement {
  public static readonly formAssociated: boolean;

  //#region Properties

  protected readonly _internals: ElementInternalsController;
  protected readonly _formValue: unknown;

  protected _disabled: boolean;
  protected _invalid: boolean;

  protected get __validators(): Validator[];

  /** Whether the value is unchanged since the start or the last form reset. */
  protected get _isPristine(): boolean;

  /** Whether the control counts as a text field for implicit submission. */
  protected get _blocksImplicitSubmission(): boolean;

  /** The inner editors that take the invalid state, validity and form reset of this control. */
  protected get _ownedEditors(): readonly (IgcFormControl | undefined)[];

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

  /** Submits the form on Enter. Bind to `keydown` and `keypress`. */
  protected _handleEnterKey(event: KeyboardEvent): void;

  /** Sets **touched**, then validates. Call this on blur or focusout. */
  protected _handleBlur(): void;

  /** Sets **touched** without validating. Call this on a user interaction. */
  protected _setTouchedState(): void;

  /** Sets **touched**, then emits `eventName`. Needs the emitter mixin. */
  protected _emitTouchedEvent(
    eventName: string,
    init?: CustomEventInit
  ): boolean;

  /**
   * Runs `write` as a write of `origin`. A write outside of this method comes
   * from code. A user write sets **touched** first, so that its validation
   * shows the invalid styles at once. A `code` or `default` write takes the
   * value as reported, also when it keeps the value. See {@link WriteOrigin}.
   */
  protected _writeFrom<R>(origin: WriteOrigin, write: () => R): R;

  /** Records a write that keeps the value, as a write of the current origin. */
  protected _recordSameValueWrite(): void;

  /** The value of the last `igcChange`, or of the last write that needs no report. */
  protected get _reportedValue(): unknown;

  /**
   * Emits `igcChange` with `detail` when the value differs from the reported
   * value, or always with `force`. The value becomes the reported value.
   * Needs the emitter mixin.
   */
  protected _reportChange(detail: unknown, force?: boolean): void;

  /** Sets the default value from a change of the `value` attribute. */
  protected _setDefaultValue(current: string | null): void;

  /** Restores the default value on a form reset. */
  protected _restoreDefaultValue(): void;

  /**
   * Resets the interaction and validity state, as a form reset does, after the
   * value restore. An owner also calls it on its owned editors, so an editor
   * that holds uncommitted text discards it here.
   */
  protected _resetValidationState(): void;

  /** Formats a value for a validation message. */
  protected _formatValidationValue(value: unknown, locale: string): string;

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
   * `_restoreDefaultValue` for the value and `_resetValidationState` for the
   * rest, not this callback.
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

  /** Writes `value` as a user write, then emits `eventName`. */
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
