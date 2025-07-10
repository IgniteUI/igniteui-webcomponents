import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addSafeEventListener, isFunction, isString } from '../../util.js';
import type { Validator } from '../../validators.js';
import type { Constructor } from '../constructor.js';
import type { FormValue } from './form-value.js';
import type {
  FormAssociatedCheckboxElementInterface,
  FormAssociatedElementInterface,
  FormRestoreMode,
  FormValueType,
} from './types.js';

function BaseFormAssociated<T extends Constructor<LitElement>>(base: T) {
  class BaseFormAssociatedElement extends base {
    public static readonly formAssociated = true;

    private __internals: ElementInternals;
    protected _formValue!: FormValue<unknown>;

    protected _disabled = false;
    protected _invalid = false;
    protected _dirty = false;
    protected _pristine = true;

    protected get __validators(): Validator[] {
      return [];
    }

    /**
     * The name attribute of the control.
     * @attr
     */
    @property({ reflect: true })
    public name!: string;

    /**
     * The disabled state of the component.
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

    constructor(...args: any[]) {
      super(args);
      this.__internals = this.attachInternals();

      addSafeEventListener(this, 'invalid', this._handleInvalid);
    }

    public override connectedCallback(): void {
      super.connectedCallback();
      this._dirty = false;
      this._updateValidity();
    }

    private _handleInvalid(event: Event) {
      event.preventDefault();
      this.invalid = true;
    }

    private _setInvalidState(): void {
      if (this._dirty || !this._pristine) {
        this.invalid = !this.checkValidity();
      }
    }

    private __runValidators() {
      const validity: ValidityStateFlags = {};
      let message = '';

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          message = isFunction(validator.message)
            ? validator.message(this)
            : validator.message;
        }
      }

      return { validity, message };
    }

    protected _setDefaultValue(current: string | null): void {
      this._formValue.defaultValue = current;
    }

    protected _restoreDefaultValue(): void {
      this._formValue.setValueAndFormState(this._formValue.defaultValue);
      this._updateValidity();
      this.requestUpdate();
    }

    protected _validate(message?: string): void {
      this._updateValidity(message);
      this._setInvalidState();
    }

    /**
     * Executes the component validators and updates the internal validity state.
     */
    protected _updateValidity(error?: string) {
      let { validity, message } = this.__runValidators();
      const hasCustomError = this.validity.customError;

      // valueMissing has precedence over the other validators aside from customError
      if (validity.valueMissing) {
        validity = {
          valueMissing: true,
          customError: hasCustomError,
        };
      }

      if (hasCustomError && error === undefined) {
        // Internal validation cycle after the user has called setCustomValidity()
        // with some message. Keep the customError flag and the passed in message.
        validity.customError = true;
        message = this.validationMessage;
      } else if (hasCustomError && error === '') {
        // setCustomValidity with an empty message.
        validity.customError = false;
      } else if (error && error !== '') {
        // setCustomValidity with a message.
        validity.customError = true;
        message = error;
      }

      this.__internals.setValidity(validity, message);
    }

    protected _setFormValue(value: FormValueType, state?: FormValueType): void {
      this._pristine = false;
      this.__internals.setFormValue(value, state);
    }

    protected formAssociatedCallback(_form: HTMLFormElement): void {}

    protected formDisabledCallback(state: boolean): void {
      this._disabled = state;
      this.requestUpdate();
    }

    protected formResetCallback(): void {
      this._restoreDefaultValue();
      this._pristine = true;
      this._dirty = false;
      this.invalid = false;
    }

    /* c8 ignore next 4 */
    protected formStateRestoreCallback(
      _state: FormValueType,
      _mode: FormRestoreMode
    ): void {}

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
      this._updateValidity(message);
    }
  }
  return BaseFormAssociatedElement as Constructor<BaseFormAssociatedElement> &
    T;
}

/**
 * Mixes the passed in class and turns it into a form associated custom element.
 */
export function FormAssociatedMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedElement extends BaseFormAssociated(base) {
    /* blazorCSSuppress */
    @property({ attribute: false })
    public set defaultValue(value: unknown) {
      this._formValue.defaultValue = value;

      if (this._pristine && 'value' in this) {
        this.value = this.defaultValue;
        this._pristine = true;
        this._validate();
      }
    }

    public get defaultValue() {
      return this._formValue.defaultValue;
    }

    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);
      if (name === 'value') {
        this._setDefaultValue(current);
      }
    }
  }

  return FormAssociatedElement as unknown as Constructor<FormAssociatedElementInterface> &
    T;
}

/**
 * Mixes the passed in class and turns it into a form associated custom element.
 */
export function FormAssociatedCheckboxMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedCheckboxElement extends BaseFormAssociated(base) {
    /* blazorCSSuppress */
    @property({ attribute: false })
    public set defaultChecked(value: boolean) {
      this._formValue.defaultValue = value;

      if (this._pristine && 'checked' in this) {
        this.checked = this.defaultChecked;
        this._pristine = true;
        this._validate();
      }
    }

    public get defaultChecked(): boolean {
      return this._formValue.defaultValue as boolean;
    }

    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);
      if (name === 'checked') {
        this._setDefaultValue(isString(current) ? 'true' : null);
      }
    }
  }

  return FormAssociatedCheckboxElement as unknown as Constructor<FormAssociatedCheckboxElementInterface> &
    T;
}
