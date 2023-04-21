import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Constructor } from './constructor';
import { watch } from '../decorators/watch.js';

export declare class FormAssociatedElementInterface {
  public static readonly formAssociated: boolean;

  private _internals: ElementInternals;
  protected _disabled: boolean;
  protected _invalid: boolean;
  protected _dirty: boolean;

  /**
   * Applies the {@link FormAssociatedElementInterface.invalid | `invalid`} attribute on the control and the associated styles
   * if the element has completed the first update cycle or it has been interacted with by the user.
   *
   * Usually, it should be called after {@link FormAssociatedElementInterface.updateValidity | `updateValidity()`}
   */
  protected setInvalidState(): void;

  /**
   * Implement all validation logic for the given component here.
   *
   * @remarks
   * This method **has to be** overridden in extended classes.
   */
  protected updateValidity(message: string): void;

  /**
   * Hook called during the formResetCallback() which should reset the component
   * value to some initial state.
   *
   * @remarks
   * This method **has to be** overridden in extended classes.
   */
  protected handleFormReset(): void;

  protected requiredChange(): void;

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
   * Control the validity of the control.
   * @attr
   */
  public invalid: boolean;

  /**
   * The name attribute of the control.
   * @attr
   */
  public name: string;

  /**
   * Makes the control a required field in a form context.
   * @attr
   */
  public required: boolean;

  /** Returns the HTMLFormElement associated with this element. */
  public readonly form: HTMLFormElement | null;

  /**
   * Returns a ValidityState object which represents the different validity states
   * the element can be in, with respect to constraint validation.
   */
  public readonly validity: ValidityState;

  /** A string containing the validation message of this element. */
  public readonly validationMessage: string;

  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  public readonly willValidate: boolean;

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

export function FormAssociatedMixin<T extends Constructor<LitElement>>(
  superClass: T
) {
  class FormAssociatedElement extends superClass {
    public static readonly formAssociated = true;

    protected _internals: ElementInternals;
    protected _disabled = false;
    protected _invalid = false;
    protected _dirty = false;

    /**
     * The name attribute of the control.
     * @attr
     */
    @property()
    public name!: string;

    /**
     * Makes the control a required field in form context.
     * @attr
     */
    @property({ type: Boolean, reflect: true })
    public required = false;

    /** Returns the HTMLFormElement associated with this element. */
    public get form() {
      return this._internals.form;
    }

    /**
     * Returns a ValidityState object which represents the different validity states
     * the element can be in, with respect to constraint validation.
     */
    public get validity() {
      return this._internals.validity;
    }

    /** A string containing the validation message of this element. */
    public get validationMessage() {
      return this._internals.validationMessage;
    }

    /**
     * A boolean value which returns true if the element is a submittable element
     * that is a candidate for constraint validation.
     */
    public get willValidate() {
      return this._internals.willValidate;
    }

    /**
     * The disabled state of the component
     * @attr [disabled=false]
     */
    @property({ type: Boolean, reflect: true })
    public get disabled() {
      return this._disabled;
    }

    public set disabled(value: boolean) {
      const prev = this._disabled;
      this._disabled = value;
      this.toggleAttribute('disabled', Boolean(this._disabled));
      this.requestUpdate('disabled', prev);
    }

    /**
     * Control the validity of the control.
     * @attr [invalid=false]
     */
    @property({ type: Boolean, reflect: true })
    public get invalid() {
      return this._invalid;
    }

    public set invalid(value: boolean) {
      const prev = this._invalid;
      this._invalid = value;
      this.toggleAttribute('invalid', Boolean(this._invalid));
      this.requestUpdate('invalid', prev);
    }

    constructor(...args: any[]) {
      super(args);
      this._internals = this.attachInternals();
      this.addEventListener('invalid', this.handleInvalid);
    }

    public override connectedCallback(): void {
      super.connectedCallback();
      this._dirty = false;
    }

    protected handleInvalid = (event: Event) => {
      event.preventDefault();
      this.invalid = true;
    };

    @watch('required', { waitUntilFirstUpdate: true })
    protected requiredChange() {
      this.updateValidity();
      this.invalid = !this.checkValidity();
    }

    protected setFormValue(
      value: string | File | FormData | null,
      state?: string | File | FormData | null | undefined
    ) {
      this._internals.setFormValue(value, state || value);
    }

    protected setValidity(
      flags?: ValidityStateFlags | undefined,
      message?: string | undefined,
      anchor?: HTMLElement | undefined
    ) {
      this._internals.setValidity(flags, message, anchor);
    }

    protected formResetCallback() {
      this.handleFormReset();
      this._dirty = false;

      // Apply any changes happening during form reset synchronously
      this.performUpdate();

      this.invalid = false;
    }

    protected formDisabledCallback(state: boolean) {
      this._disabled = state;
      this.requestUpdate();
    }

    /**
     * Hook called during the formResetCallback() which should reset the component
     * value to some initial state.
     *
     * @remarks
     * This method **has to be** overridden in extended classes.
     */
    protected handleFormReset() {
      throw new Error(
        '`handleFormReset()` must be overridden in extension classes'
      );
    }

    /**
     * Implement all validation logic for the given component here.
     *
     * @remarks
     * This method **has to be** overridden in extended classes.
     */
    protected updateValidity(_message = '') {
      throw new Error(
        '`updateValidity()` must be overridden in extension classes'
      );
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
      return this._internals.reportValidity();
    }

    /** Checks for validity of the control and emits the invalid event if it invalid. */
    public checkValidity() {
      return this._internals.checkValidity();
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
    public setCustomValidity(message: string) {
      this.updateValidity(message);
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedElement as unknown as Constructor<FormAssociatedElementInterface> &
    T;
}
