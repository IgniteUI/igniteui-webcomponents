import {
  type IValidationResourceStrings,
  ValidationResourceStringsEN,
} from 'igniteui-i18n-core';
import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '../../controllers/internals.js';
import { addI18nController } from '../../i18n/i18n-controller.js';
import { addSafeEventListener, isFunction, isString } from '../../util.js';
import type { Validator } from '../../validators.js';
import type { Constructor } from '../constructor.js';
import type { FormValue } from './form-value.js';
import {
  type FormAssociatedCheckboxElementInterface,
  type FormAssociatedElementInterface,
  type FormRestoreMode,
  type FormValueType,
  InternalInvalidEvent,
  InternalResetEvent,
} from './types.js';

const INVALID_STATE = 'ig-invalid';

const eventOptions = {
  bubbles: false,
  composed: false,
};

function emitFormInvalidEvent(host: LitElement): void {
  host.dispatchEvent(new CustomEvent(InternalInvalidEvent, eventOptions));
}

function emitFormResetEvent(host: LitElement): void {
  host.dispatchEvent(new CustomEvent(InternalResetEvent, eventOptions));
}

function BaseFormAssociated<T extends Constructor<LitElement>>(base: T) {
  class BaseFormAssociatedElement extends base {
    public static readonly formAssociated = true;

    //#region Internal state and properties

    private readonly __internals = addInternalsController(this);
    private readonly __i18nController =
      addI18nController<IValidationResourceStrings>(this, {
        defaultEN: ValidationResourceStringsEN,
      });
    protected readonly _formValue!: FormValue<unknown>;

    private _isFormSubmit = false;
    private _isInternalValidation = false;
    private _touched = false;
    private _isExternalInvalid = false;

    private get _hasUserInteraction(): boolean {
      return this._touched || this._isFormSubmit;
    }

    private get _shouldApplyStyles(): boolean {
      if (this._isExternalInvalid) {
        return true;
      }

      return (
        this._invalid && this._hasUserInteraction && !this._isInternalValidation
      );
    }

    protected _disabled = false;
    protected _invalid = false;
    protected _pristine = true;

    protected get __validators(): Validator[] {
      return [];
    }

    //#endregion

    //#region Public properties and attributes

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
    @property({ type: Boolean })
    public set invalid(value: boolean) {
      this._isExternalInvalid = value;
      this._setInvalidStyles();
    }

    public get invalid(): boolean {
      return this._isExternalInvalid || this._shouldApplyStyles;
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

    /**
     * The resource strings for localization.
     */
    @property({ attribute: false })
    public set resourceStrings(value: IValidationResourceStrings) {
      this.__i18nController.resourceStrings = value;
    }

    public get resourceStrings(): IValidationResourceStrings {
      return this.__i18nController.resourceStrings;
    }
    //#endregion

    //#region Life-cycle hooks

    constructor(...args: any[]) {
      super(args);
      addSafeEventListener(this, 'invalid', this._handleInvalid);
    }

    /** @internal */
    public override connectedCallback(): void {
      super.connectedCallback();
      this._pristine = true;
      this._touched = false;
      this._validate();
    }

    //#endregion

    //#region Form value and validation states

    private async _handleInvalid(event: Event): Promise<void> {
      event.preventDefault();
      this._invalid = true;

      if (this._isInternalValidation) {
        this._isInternalValidation = false;
      } else {
        this._isFormSubmit = true;
        emitFormInvalidEvent(this);
      }

      this._setInvalidStyles();
      this.requestUpdate();

      if (this._isFormSubmit) {
        await this.updateComplete;
        this._isFormSubmit = false;
      }
    }

    private _setInvalidStyles(): void {
      this.__internals.setState(INVALID_STATE, this._shouldApplyStyles);
    }

    private __runValidators() {
      const validity: ValidityStateFlags = {};
      let message = '';
      let validationFailed = false;

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          validationFailed = true;
          const resourceKey = (
            isFunction(validator.messageResourceKey)
              ? validator.messageResourceKey(this)
              : validator.messageResourceKey
          ) as keyof IValidationResourceStrings;

          message =
            this.resourceStrings[resourceKey] ??
            "Couldn't retrieve validation resource string!";
          if (isFunction(validator.messageFormat)) {
            message = validator.messageFormat(message, this);
          }
        }
      }

      this._invalid = validationFailed;

      return { validity, message };
    }

    /**
     * Executes the component validators and updates the internal validity state.
     */
    protected _validate(userMessage?: string): void {
      let { validity, message } = this.__runValidators();
      const hasCustomError = this.validity.customError;

      // valueMissing has precedence over the other validators aside from customError
      if (validity.valueMissing) {
        validity = {
          valueMissing: true,
          customError: hasCustomError,
        };
      }

      if (hasCustomError && userMessage === undefined) {
        // Internal validation cycle after the user has called setCustomValidity()
        // with some message. Keep the customError flag and the passed in message.
        validity.customError = true;
        message = this.validationMessage;
      } else if (hasCustomError && userMessage === '') {
        // setCustomValidity with an empty message.
        validity.customError = false;
      } else if (userMessage && userMessage !== '') {
        // setCustomValidity with a message.
        validity.customError = true;
        message = userMessage;
      }

      this.__internals.setValidity(validity, message);
      this._isInternalValidation = true;
      this._invalid = !this.__internals.checkValidity();
    }

    protected _handleBlur(): void {
      this._setTouchedState();
      this._validate();
    }

    protected _setTouchedState(): void {
      if (!this._touched) {
        this._touched = true;
      }
    }

    protected _setDefaultValue(current: string | null): void {
      this._formValue.defaultValue = current;
    }

    protected _restoreDefaultValue(): void {
      const value = this._formValue.value;
      this._formValue.setValueAndFormState(this._formValue.defaultValue);
      this.requestUpdate('value', value);
    }

    protected _setFormValue(value: FormValueType, state?: FormValueType): void {
      this._pristine = false;
      this.__internals.setFormValue(value, state);
      this._validate();
      this._setInvalidStyles();
    }

    //#region Form associated callback hooks

    protected formAssociatedCallback(_form: HTMLFormElement): void {}

    protected formDisabledCallback(state: boolean): void {
      this._disabled = state;
      this.requestUpdate();
    }

    protected formResetCallback(): void {
      this._restoreDefaultValue();
      this._pristine = true;
      this._touched = false;
      this._invalid = false;
      this._setInvalidStyles();
      emitFormResetEvent(this);
    }

    /* c8 ignore next 4 */
    protected formStateRestoreCallback(
      _state: FormValueType,
      _mode: FormRestoreMode
    ): void {}

    //#endregion

    //#region Public API

    /** Checks for validity of the control and shows the browser message if it invalid. */
    public reportValidity(): boolean {
      const state = this.__internals.reportValidity();
      this._invalid = !state;
      return state;
    }

    /** Checks for validity of the control and emits the invalid event if it invalid. */
    public checkValidity(): boolean {
      this._isInternalValidation = true;
      const state = this.__internals.checkValidity();
      this._invalid = !state;
      return state;
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
    public setCustomValidity(message: string): void {
      this._validate(message);
      this._isInternalValidation = message === '';
      this._setInvalidStyles();
      this.requestUpdate();
    }

    //#endregion
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

    public get defaultValue(): unknown {
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
