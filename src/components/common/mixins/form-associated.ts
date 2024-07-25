import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { Validator } from '../validators.js';
import type { Constructor } from './constructor.js';

export declare class FormAssociatedElementInterface {
  public static readonly formAssociated: boolean;

  private __internals: ElementInternals;
  protected get __validators(): Validator[];
  protected _disabled: boolean;
  protected _invalid: boolean;
  protected _dirty: boolean;

  /**
   * The default value of the control at "creation" time.
   *
   * @remarks
   * This is set by default on `connectedCallback` through the `setDefaultValue` call.
   * It expects the component to have either a `checked` or a `value` property and binds it to the initial value of the
   * respective property.
   *
   * In use-cases where additional customization is required, make sure to override the `setDefaultValue` method.
   */
  protected _defaultValue: unknown;

  /**
   * Applies the {@link FormAssociatedElementInterface.invalid | `invalid`} attribute on the control and the associated styles
   * if the element has completed the first update cycle or it has been interacted with by the user.
   *
   * Usually, it should be called after {@link FormAssociatedElementInterface.updateValidity | `updateValidity()`}
   */
  protected setInvalidState(): void;

  /**
   * Executes the component validators and updates the internal validity state.
   */
  protected updateValidity(error?: string, isUserSet?: boolean): void;

  /**
   * Saves the initial value/checked state of the control.
   *
   * Called on connectedCallback.
   */
  protected setDefaultValue(): void;

  /**
   * Called when the parent form is reset.
   *
   * Restores the initially bound value/checked state of the control.
   */
  protected restoreDefaultValue(): void;

  protected setFormValue(
    value: string | File | FormData | null,
    state?: string | File | FormData | null | undefined
  ): void;
  protected setValidity(
    flags?: ValidityStateFlags | undefined,
    message?: string | undefined,
    anchor?: HTMLElement | undefined
  ): void;

  protected formResetCallback(): void;
  protected formDisabledCallback(state: boolean): void;
  protected formStateRestoreCallback(
    state: string | FormData | File,
    mode: 'autocomplete' | 'restore'
  ): void;

  /**
   * The disabled state of the component
   * @attr [disabled=false]
   */
  public disabled: boolean;

  /**
   * Sets the control into invalid state (visual state only).
   * @attr
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

/**
 * Turns the passed class element into a Form Associated Custom Element.
 */
export function FormAssociatedMixin<T extends Constructor<LitElement>>(
  superClass: T
) {
  class FormAssociatedElement extends superClass {
    public static readonly formAssociated = true;

    private __internals: ElementInternals;
    protected _disabled = false;
    protected _invalid = false;
    protected _dirty = false;

    protected get __validators(): Validator[] {
      return [];
    }

    /**
     * The default value of the control at "creation" time.
     *
     * @remarks
     * This is set by default on `connectedCallback` through the `setDefaultValue` call.
     * It expects the component to have either a `checked` or a `value` property and binds it to the initial value of the
     * respective property.
     *
     * In use-cases where additional customization is required, make sure to override the `setDefaultValue` method.
     */
    protected _defaultValue: unknown;

    /**
     * The name attribute of the control.
     * @attr
     */
    @property({ reflect: true })
    public name!: string;

    /** Returns the HTMLFormElement associated with this element. */
    public get form(): HTMLFormElement | null {
      return this.__internals.form;
    }

    /**
     * Returns a ValidityState object which represents the different validity states
     * the element can be in, with respect to constraint validation.
     */
    public get validity(): ValidityState {
      return this.__internals.validity;
    }

    /** A string containing the validation message of this element. */
    public get validationMessage(): string {
      return this.__internals.validationMessage;
    }

    /**
     * A boolean value which returns true if the element is a submittable element
     * that is a candidate for constraint validation.
     */
    public get willValidate(): boolean {
      return this.__internals.willValidate;
    }

    /**
     * The disabled state of the component
     *
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public set disabled(value: boolean) {
      this._disabled = value;
      this.toggleAttribute('disabled', Boolean(this._disabled));
    }

    public get disabled(): boolean {
      return this._disabled;
    }

    /**
     * Sets the control into invalid state (visual state only).
     *
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public set invalid(value: boolean) {
      this._invalid = value;
      this.toggleAttribute('invalid', Boolean(this._invalid));
    }

    public get invalid(): boolean {
      return this._invalid;
    }

    constructor(...args: any[]) {
      super(args);
      this.__internals = this.attachInternals();
      this.addEventListener('invalid', this.handleInvalid);
    }

    public override connectedCallback(): void {
      super.connectedCallback();
      this._dirty = false;
      this.setDefaultValue();
    }

    /**
     * Saves the initial value/checked state of the control.
     *
     * Called on connectedCallback.
     */
    protected setDefaultValue() {
      if ('checked' in this) {
        this._defaultValue = this.checked;
      } else if ('value' in this) {
        this._defaultValue = this.value;
      }
    }

    /**
     * Called when the parent form is reset.
     *
     * Restores the initially bound value/checked state of the control.
     */
    protected restoreDefaultValue() {
      if ('checked' in this) {
        this.checked = this._defaultValue;
      } else if ('value' in this) {
        this.value = this._defaultValue;
      }
    }

    protected handleInvalid = (event: Event) => {
      event.preventDefault();
      this.invalid = true;
    };

    protected setFormValue(
      value: string | File | FormData | null,
      state?: string | File | FormData | null | undefined
    ) {
      this.__internals.setFormValue(value, state || value);
    }

    protected setValidity(
      flags?: ValidityStateFlags | undefined,
      message?: string | undefined,
      anchor?: HTMLElement | undefined
    ) {
      this.__internals.setValidity(flags, message, anchor);
    }

    protected formResetCallback() {
      this.restoreDefaultValue();
      this._dirty = false;

      // Apply any changes happening during form reset synchronously
      this.performUpdate();

      this.invalid = false;
    }

    protected formDisabledCallback(state: boolean) {
      this._disabled = state;
      this.requestUpdate();
    }

    private __runValidators() {
      const validity: ValidityStateFlags = {};
      let message = '';

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          message =
            typeof validator.message === 'function'
              ? validator.message(this)
              : validator.message;
        }
      }

      return { validity, message };
    }

    /**
     * Executes the component validators and updates the internal validity state.
     */
    protected updateValidity(error?: string, isUserSet?: boolean) {
      let { validity, message } = this.__runValidators();

      // If `valueMissing` is true, rebuild the validation state
      // with only it and possibly `customError`.
      if (validity.valueMissing) {
        validity = { valueMissing: true, customError: false };
      }

      if (isUserSet) {
        // validation cycle triggered by calling `setCustomValidity()`.
        // Update validity with the passed in state of `customError`...

        validity.customError = Boolean(error);
        message = error || message;
      } else {
        //...otherwise check if there is already a custom error set by a previous call to setCustomValidity.
        // If there is keep setting it and overwriting the validation message until the user clears it,
        // in which case it will be handled in the branch above.

        const keepCustomError = this.validity.customError && !error;

        validity.customError = keepCustomError;
        message = keepCustomError ? this.validationMessage : message;
      }

      this.setValidity(validity, message);
    }

    /**
     * Applies the {@link FormAssociatedElementInterface.invalid | `invalid`} attribute on the control and the associated styles
     * if the element has completed the first update cycle or it has been interacted with by the user.
     *
     * Usually, it should be called after {@link FormAssociatedElementInterface.updateValidity | `updateValidity()`}
     */
    protected setInvalidState() {
      if (this.hasUpdated || this._dirty) {
        this.invalid = !this.checkValidity();
      }
    }

    /** Checks for validity of the control and shows the browser message if it invalid. */
    public reportValidity() {
      const state = this.__internals.reportValidity();
      this.invalid = !state;
      return state;
    }

    /** Checks for validity of the control and emits the invalid event if it invalid. */
    public checkValidity() {
      const state = this.__internals.checkValidity();
      this.invalid = !state;
      return state;
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
    public setCustomValidity(message: string) {
      this.updateValidity(message, true);
    }
  }

  return FormAssociatedElement as unknown as Constructor<FormAssociatedElementInterface> &
    T;
}
