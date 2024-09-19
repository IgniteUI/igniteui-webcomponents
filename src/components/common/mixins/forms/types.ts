import type { Validator } from '../../validators.js';

export type FormRestoreMode = 'autocomplete' | 'restore';
export type FormValueType = string | File | FormData | null;

declare class BaseFormAssociatedElement {
  public static readonly formAssociated: boolean;

  private __internals: ElementInternals;

  // Properties

  protected _dirty: boolean;
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
   * Control the validity of the control.
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

  // Methods

  /**
   * Invoked on the first `connectedCallback` run before the component has been through the
   * firstUpdate lifecycle hook. Sets the default value to the **property** state of the value/checked member.
   */
  protected _setInitialDefaultValue(): void;

  /**
   * Sets the default value of the component.
   * Called in `attributeChangedCallback`(i.e. when the `value` attribute of the control is set).
   */
  protected _setDefaultValue(prev: string | null, current: string | null): void;

  /**
   * Called when the associated parent form is reset.
   */
  protected _restoreDefaultValue(): void;

  /**
   * Executes the {@link BaseFormAssociatedElement._updateValidity | `_updateValidity()`} hook and then applies
   * the {@link BaseFormAssociatedElement.invalid | `invalid`} attribute on the control and the associated styles
   * if the element has completed the first update cycle or it has been interacted with by the user.
   */
  protected _validate(message?: string): void;

  /**
   * Executes the component's validators and updates the internal validity state.
   */
  protected _updateValidity(message?: string): void;

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
}

export declare class FormAssociatedElementInterface extends BaseFormAssociatedElement {
  protected _defaultValue: unknown;
}

export declare class FormAssociatedCheckboxElementInterface extends BaseFormAssociatedElement {
  protected _defaultChecked: boolean;
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
