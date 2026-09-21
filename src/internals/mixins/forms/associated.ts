import { isServer, type LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '../../controllers/internals.js';
import { enterKey, isKey } from '../../controllers/keys.js';
import { addSafeEventListener } from '../../utils/events.js';
import { isFunction, isString } from '../../utils/types.js';
import type { Validator } from '../../validators.js';
import type { Constructor } from '../constructor.js';
import type { FormValue } from './form-value.js';
import {
  type FormAssociatedCheckboxElementInterface,
  type FormAssociatedElementInterface,
  type FormValueType,
  InternalInvalidEvent,
  InternalResetEvent,
} from './types.js';

const INVALID_STATE = 'ig-invalid';

/**
 * The event emitter of the host. This mixin cannot see the event-emitter
 * mixin in its type chain, so the emits go through this contract.
 */
type EventEmitterLike = {
  emitEvent(name: string, init?: CustomEventInit): boolean;
};

const eventOptions = {
  bubbles: false,
  composed: false,
};

/** Emits one of the internal form events on the host. */
function emitInternalFormEvent(host: LitElement, name: string): void {
  host.dispatchEvent(new CustomEvent(name, eventOptions));
}

function BaseFormAssociated<T extends Constructor<LitElement>>(base: T) {
  class BaseFormAssociatedElement extends base {
    public static readonly formAssociated = true;

    //#region Internal state and properties

    protected readonly _internals = addInternalsController(this);
    protected readonly _formValue!: FormValue<unknown>;

    /**
     * Suppresses the invalid styling for a programmatic validation cycle. Set
     * right before the synchronous check and cleared right after, so it never
     * leaks into a later cycle.
     */
    private _isInternalValidation = false;
    private _touched = false;
    private _isExternalInvalid = false;

    private get _shouldApplyStyles(): boolean {
      if (this._isExternalInvalid) {
        return true;
      }

      // A disabled control cannot validate, so it never styles as invalid.
      return (
        !this._disabled &&
        this._invalid &&
        this._touched &&
        !this._isInternalValidation
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
     * The name of the control, submitted with the form data.
     * @attr
     */
    @property({ reflect: true })
    public name!: string;

    /**
     * The disabled state of the component.
     * @attr
     * @default false
     */
    @property({ type: Boolean })
    public set disabled(value: boolean) {
      this._disabled = value;
      this.toggleAttribute('disabled', Boolean(this._disabled));
      if (this.hasUpdated) {
        this._setInvalidStyles();
      }
    }

    public get disabled(): boolean {
      return this._disabled;
    }

    /**
     * Sets the control into invalid state (visual state only).
     *
     * @remarks
     * Not reflected to the attribute. Reading returns the effective state, so
     * a touched control that fails validation reads `true` after `false`.
     * @attr
     * @default false
     */
    @property({ type: Boolean })
    public set invalid(value: boolean) {
      this._isExternalInvalid = value;
      this._setInvalidStyles();
    }

    public get invalid(): boolean {
      return this._shouldApplyStyles;
    }

    /** Returns the HTMLFormElement associated with this element. */
    public get form(): HTMLFormElement | null {
      return this._internals.form;
    }

    /** Returns a `ValidityState` object for the element. */
    public get validity(): ValidityState {
      return this._internals.validity;
    }

    /** A string containing the validation message of this element. */
    public get validationMessage(): string {
      return this._internals.validationMessage;
    }

    /**
     * Returns `true` when the element is a candidate for constraint
     * validation.
     */
    public get willValidate(): boolean {
      return this._internals.willValidate;
    }
    //#endregion

    //#region Life-cycle hooks

    constructor(...args: any[]) {
      super(...args);
      addSafeEventListener(this, 'invalid', this._handleInvalid);
    }

    /** @internal */
    public override connectedCallback(): void {
      super.connectedCallback();

      if (!this.hasUpdated) {
        this._pristine = true;
        this._touched = false;
      }

      this._validate();
    }

    //#endregion

    //#region Enter key submission handling

    protected _handleEnterKeydown(event: KeyboardEvent): void {
      if (!isKey(event, enterKey) || event.repeat) {
        return;
      }

      this.form?.requestSubmit();
    }

    //#endregion

    //#region Form value and validation states

    private _handleInvalid(event: Event): void {
      event.preventDefault();
      this._invalid = true;

      if (this._isInternalValidation) {
        this._isInternalValidation = false;
      } else {
        // A failed submission is a lasting interaction: touched keeps
        // `invalid` and the projected messages visible across re-renders.
        this._setTouchedState();
        emitInternalFormEvent(this, InternalInvalidEvent);
      }

      this._setInvalidStyles();
      this.requestUpdate();
    }

    private _setInvalidStyles(): void {
      this._internals.setState(INVALID_STATE, this._shouldApplyStyles);
    }

    private __runValidators(): {
      validity: ValidityStateFlags;
      message: string;
    } {
      let validity: ValidityStateFlags = {};
      let message = '';

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          message = isFunction(validator.message)
            ? validator.message(this)
            : validator.message;

          if (validator.key === 'valueMissing') {
            validity = { valueMissing: true };
            break;
          }
        }
      }

      return { validity, message };
    }

    /** Runs the validators and updates the internal validity state. */
    protected _validate(userMessage?: string): void {
      if (isServer) return;
      const { validity, message: validatorMessage } = this.__runValidators();
      const hasCustomError = this.validity.customError;
      let message = validatorMessage;

      if (hasCustomError && userMessage === undefined) {
        // Internal cycle after `setCustomValidity(message)`. Keep the
        // `customError` flag and the message.
        validity.customError = true;
        message = this.validationMessage;
      } else if (hasCustomError && userMessage === '') {
        // The caller passed an empty message to `setCustomValidity()`.
        validity.customError = false;
      } else if (userMessage && userMessage !== '') {
        // The caller passed a message to `setCustomValidity()`.
        validity.customError = true;
        message = userMessage;
      }

      this._internals.setValidity(validity, message);
      this._isInternalValidation = true;
      this._invalid = !this._internals.checkValidity();
      this._isInternalValidation = false;
      this._setInvalidStyles();
    }

    protected _handleBlur(): void {
      this._setTouchedState();
      this._validate();
    }

    protected _setTouchedState(): void {
      this._touched = true;
    }

    protected _emitTouchedEvent(
      eventName: string,
      init?: CustomEventInit
    ): boolean {
      this._setTouchedState();
      return (this as unknown as EventEmitterLike).emitEvent(eventName, init);
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
      this._internals.setFormValue(value, state);
      this._validate();
    }

    //#endregion

    //#region Form associated callback hooks

    protected formAssociatedCallback(_form: HTMLFormElement): void {}

    protected formDisabledCallback(state: boolean): void {
      this._disabled = state;
      this._setInvalidStyles();
      this.requestUpdate();
    }

    protected formResetCallback(): void {
      this._restoreDefaultValue();
      this._pristine = true;
      this._touched = false;
      this._invalid = false;
      this._isExternalInvalid = false;
      this._setInvalidStyles();
      emitInternalFormEvent(this, InternalResetEvent);
    }

    //#endregion

    //#region Public API

    /** Checks validity and shows the browser message when invalid. */
    public reportValidity(): boolean {
      const state = this._internals.reportValidity();
      this._invalid = !state;
      return state;
    }

    /** Checks validity and emits `invalid` when the control is invalid. */
    public checkValidity(): boolean {
      this._isInternalValidation = true;
      const state = this._internals.checkValidity();
      this._invalid = !state;
      this._isInternalValidation = false;
      return state;
    }

    /** Sets a custom message. Invalid while `message` is not empty. */
    public setCustomValidity(message: string): void {
      this._validate(message);
      this.requestUpdate();
    }

    //#endregion
  }
  return BaseFormAssociatedElement as Constructor<BaseFormAssociatedElement> &
    T;
}

/**
 * Turns the given class into a form-associated custom element with a
 * `defaultValue` property.
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

    /**
     * Restores the default value through the public `value` setter, so a form
     * reset gets the same clamping, normalization and reactive bookkeeping.
     */
    protected override _restoreDefaultValue(): void {
      if ('value' in this) {
        this.value = this.defaultValue;
      } else {
        super._restoreDefaultValue();
      }
    }

    /** Sets touched first, so the `value` setter validation cycle sees it. */
    protected _commitValue(value: unknown, eventName: string): boolean {
      this._setTouchedState();

      if ('value' in this) {
        this.value = value;
        return (this as unknown as EventEmitterLike).emitEvent(eventName, {
          detail: this.value,
        });
      }

      return false;
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
 * Turns the given class into a form-associated checkbox custom element with
 * a `defaultChecked` property.
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

    /**
     * Restores the default checked state through the public `checked` setter,
     * which records the correct reactive property for the update cycle.
     */
    protected override _restoreDefaultValue(): void {
      if ('checked' in this) {
        this.checked = this.defaultChecked;
      } else {
        super._restoreDefaultValue();
      }
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
