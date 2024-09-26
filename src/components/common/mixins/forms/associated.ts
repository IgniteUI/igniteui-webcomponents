import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Validator } from '../../validators.js';
import type { Constructor } from '../constructor.js';
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

    protected _disabled = false;
    protected _invalid = false;
    protected _dirty = false;

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
      this.addEventListener('invalid', this._handleInvalid);
    }

    public override connectedCallback(): void {
      super.connectedCallback();
      this._dirty = false;
      this._updateValidity();

      if (!this.hasUpdated) {
        this._setInitialDefaultValue();
      }
    }

    private _handleInvalid(event: Event) {
      event.preventDefault();
      this.invalid = true;
    }

    private _setInvalidState(): void {
      if (this.hasUpdated || this._dirty) {
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
          message =
            typeof validator.message === 'function'
              ? validator.message(this)
              : validator.message;
        }
      }

      return { validity, message };
    }

    /* c8 ignore next 1 */
    protected _setInitialDefaultValue(): void {}

    /* c8 ignore next 4 */
    protected _setDefaultValue(
      _prev: string | null,
      _current: string | null
    ): void {}

    /* c8 ignore next 1 */
    protected _restoreDefaultValue(): void {}

    protected _validate(message?: string, isUserSet?: boolean): void {
      this._updateValidity(message, isUserSet);
      this._setInvalidState();
    }

    /**
     * Executes the component validators and updates the internal validity state.
     */
    protected _updateValidity(error?: string, isUserSet?: boolean) {
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

      this.__internals.setValidity(validity, message);
    }

    protected _setFormValue(value: FormValueType, state?: FormValueType): void {
      this.__internals.setFormValue(value, state);
    }

    protected formAssociatedCallback(_form: HTMLFormElement): void {}

    protected formDisabledCallback(state: boolean): void {
      this._disabled = state;
      this.requestUpdate();
    }

    protected formResetCallback(): void {
      this._restoreDefaultValue();
      this._dirty = false;
      this.performUpdate();
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
      this._updateValidity(message, true);
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
    protected _defaultValue: unknown;

    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);
      if (name === 'value') {
        this._setDefaultValue(prev, current);
      }
    }

    protected override _setDefaultValue(
      _: string | null,
      current: string | null
    ): void {
      this._defaultValue = current;
    }

    protected override _restoreDefaultValue(): void {
      if ('value' in this) {
        this.value = this._defaultValue;
      }
    }

    protected override _setInitialDefaultValue() {
      if ('_value' in this) {
        this._defaultValue = this._value;
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
    protected _defaultChecked = false;

    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);
      if (name === 'checked') {
        this._setDefaultValue(prev, current);
      }
    }

    protected override _setDefaultValue(
      _: string | null,
      current: string | null
    ): void {
      this._defaultChecked = current !== null;
    }

    protected override _restoreDefaultValue(): void {
      if ('checked' in this) {
        this.checked = this._defaultChecked;
      }
    }

    protected override _setInitialDefaultValue() {
      if ('checked' in this) {
        this._defaultChecked = this.checked as boolean;
      }
    }
  }

  return FormAssociatedCheckboxElement as unknown as Constructor<FormAssociatedCheckboxElementInterface> &
    T;
}
