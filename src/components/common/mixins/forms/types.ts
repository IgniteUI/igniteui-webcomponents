import type { IValidationResourceStrings } from 'igniteui-i18n-core';
import type { LitElement } from 'lit';
import type { ElementInternalsController } from '../../controllers/internals.js';
import type { I18nController } from '../../i18n/i18n-controller.js';
import type { Validator } from '../../validators.js';

export type FormRestoreMode = 'autocomplete' | 'restore';
export type FormValueType = string | File | FormData | null;
export type IgcFormControl = LitElement &
  (FormAssociatedElementInterface | FormAssociatedCheckboxElementInterface);

declare class BaseFormAssociatedElement {
  public static readonly formAssociated: boolean;

  //#region Properties

  private readonly __internals: ElementInternalsController;
  protected readonly __i18nController: I18nController<IValidationResourceStrings>;
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
   * The name attribute of the control.
   * @attr
   */
  public name: string;

  /** Returns the HTMLFormElement associated with this element. */
  public get form(): HTMLFormElement | null;

  /**
   * Returns a ValidityState object which represents the different validity states
   * the element can be in, with respect to constraint validation.
   */
  public get validity(): ValidityState;

  /** A string containing the validation message of this element. */
  public get validationMessage(): string;

  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  public get willValidate(): boolean;

  //#endregion

  //#region Methods

  /**
   * Sets the **touched** state of the component and invokes {@link BaseFormAssociatedElement._validate | `_validate()`} method.
   *
   * As the naming of the method suggests, this should be invoked either on **blur** or **focusout**, depending
   * on the DOM structure and how focus state is managed by the component.
   */
  protected _handleBlur(): void;

  /**
   * Sets the **touched** state of the component and **DOES NOT** invoke {@link BaseFormAssociatedElement._validate | `_validate()`} method.
   *
   * This should be called whenever a user interaction triggers a response, usually an event, from the component in
   * regards to its value.
   */
  protected _setTouchedState(): void;

  /**
   * Sets the default value of the component.
   * Called in `attributeChangedCallback`(i.e. when the `value` attribute of the control is set).
   */
  protected _setDefaultValue(current: string | null): void;

  /**
   * Called when the associated parent form is reset.
   */
  protected _restoreDefaultValue(): void;

  /**
   * Executes the component validators and updates the internal validity state.
   */
  protected _validate(message?: string): void;

  /**
   * Sets the component's submission value and state.
   */
  protected _setFormValue(value: FormValueType, state?: FormValueType): void;

  /**
   * Called by the browser when it associates/disassociates the component with/from a given form element.
   * Receives the form element as a parameter.
   *
   * @remarks
   * This is not implemented currently.
   */
  protected formAssociatedCallback(form: HTMLFormElement): void;

  /**
   * Called whenever the component or a parent `fieldset` elements are disabled.
   * Receives the current disabled state.
   */
  protected formDisabledCallback(state: boolean): void;

  /**
   * Called when the form is reset.
   * Resets the component value/checked state to the default one, internal state and validation.
   *
   * @remarks
   * The default implementation calls {@link BaseFormAssociatedElement._restoreDefaultValue | `_restoreDefaultValue`}.
   * If additional customization is needed, it is better to override that method instead of this callback.
   */
  protected formResetCallback(): void;

  /**
   * Called when the browser attempts to automatically fill out the component.
   *
   * @remarks
   * This is not implemented currently.
   */
  protected formStateRestoreCallback(
    state: FormValueType,
    mode: FormRestoreMode
  ): void;

  /** Checks for validity of the control and emits the invalid event if it invalid. */
  public checkValidity(): boolean;

  /** Checks for validity of the control and shows the browser message if it invalid. */
  public reportValidity(): boolean;

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string): void;

  //#endregion
}

export declare class FormAssociatedElementInterface extends BaseFormAssociatedElement {
  /** The initial value of the component. */
  public set defaultValue(value: unknown);
  public get defaultValue(): unknown;
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
