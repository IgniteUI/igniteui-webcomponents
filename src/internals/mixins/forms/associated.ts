import { isServer, type LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import IgcValidationContainerComponent, {
  type ValidationContainerConfig,
} from '../../../components/validation-container/validation-container.js';
import { addInternalsController } from '../../controllers/internals.js';
import { enterKey } from '../../controllers/key-bindings.js';
import { addSafeEventListener } from '../../utils/events.js';
import { isFunction, isString } from '../../utils/types.js';
import type { Validator } from '../../validators.js';
import type { Constructor } from '../constructor.js';
import type { FormValue } from './form-value.js';
import {
  type FormAssociatedCheckboxElementInterface,
  type FormAssociatedElementInterface,
  type FormRestoreMode,
  type FormValueType,
  type IgcFormControl,
  InternalInvalidEvent,
  InternalResetEvent,
} from './types.js';

const INVALID_STATE = 'ig-invalid';

/**
 * Every form-associated component composes the event-emitter mixin somewhere
 * in its heritage; the mixin cannot see it in its type chain, so emits go
 * through the same structural contract the toggle controller places on its
 * host.
 */
type EventEmitterLike = {
  emitEvent(name: string, init?: CustomEventInit): boolean;
};

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

    protected readonly _internals = addInternalsController(this);
    protected readonly _formValue!: FormValue<unknown>;

    /**
     * Suppresses invalid styling for a programmatic validation cycle
     * (`checkValidity`/`_validate`). Scoped to the synchronous validity check:
     * set immediately before it and cleared immediately after, so it never
     * leaks into a later submission or user-interaction cycle.
     */
    private _isInternalValidation = false;
    private _touched = false;
    private _isExternalInvalid = false;

    private get _shouldApplyStyles(): boolean {
      if (this._isExternalInvalid) {
        return true;
      }

      // A disabled control is barred from constraint validation, so it never
      // carries invalid styling regardless of what its validators say.
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
     * The property is not reflected back to the attribute. Reading it returns
     * the effective visual state, so a touched control failing validation
     * reads `true` even after assigning `false`.
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

    /**
     * Returns a ValidityState object which represents the different validity states
     * the element can be in, with respect to constraint validation.
     */
    public get validity(): ValidityState {
      return this._internals.validity;
    }

    /** A string containing the validation message of this element. */
    public get validationMessage(): string {
      return this._internals.validationMessage;
    }

    /**
     * A boolean value which returns true if the element is a submittable element
     * that is a candidate for constraint validation.
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
      if (event.key !== enterKey || event.repeat) {
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
        // A failed submission counts as user interaction, and a lasting one: the
        // control was asked for a value it could not provide. Keeping it touched
        // is what makes `invalid` - and with it the validation messages the host
        // projects - survive any later re-render, rather than holding only for
        // the update the submission itself scheduled.
        this._setTouchedState();
        emitFormInvalidEvent(this);
      }

      this._setInvalidStyles();
      this.requestUpdate();
    }

    private _setInvalidStyles(): void {
      this._internals.setState(INVALID_STATE, this._shouldApplyStyles);
    }

    /**
     * Closes a programmatic validation cycle. If the control was invalid, the
     * synchronous `invalid` event already cleared the flag; if it was valid no
     * event fired, so clear it here to stop it leaking into a later submission
     * or user-interaction cycle.
     */
    private _resolveInternalValidation(): void {
      this._isInternalValidation = false;
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

    /**
     * Executes the component validators and updates the internal validity state.
     */
    protected _validate(userMessage?: string): void {
      if (isServer) return;
      const { validity, message: validatorMessage } = this.__runValidators();
      const hasCustomError = this.validity.customError;
      let message = validatorMessage;

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

      this._internals.setValidity(validity, message);
      this._isInternalValidation = true;
      this._invalid = !this._internals.checkValidity();
      this._resolveInternalValidation();
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

    protected _renderValidationContainer(
      config?: ValidationContainerConfig
    ): TemplateResult {
      return IgcValidationContainerComponent.create(
        this as unknown as IgcFormControl,
        config
      );
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
      emitFormResetEvent(this);
    }

    /* c8 ignore next 4 */
    protected formStateRestoreCallback(
      _state: FormValueType,
      _mode: FormRestoreMode
    ): void {}

    //#endregion

    //#region Public API

    /** Checks for validity of the control and shows the browser message if it's invalid. */
    public reportValidity(): boolean {
      const state = this._internals.reportValidity();
      this._invalid = !state;
      return state;
    }

    /** Checks for validity of the control and emits the invalid event if it's invalid. */
    public checkValidity(): boolean {
      this._isInternalValidation = true;
      const state = this._internals.checkValidity();
      this._invalid = !state;
      this._resolveInternalValidation();
      return state;
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
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

    /**
     * Restores the default value through the public `value` setter so any
     * clamping/normalization the component applies (slider bounds, rating max)
     * also applies on form reset, and the correct reactive property is
     * recorded for the update cycle.
     */
    protected override _restoreDefaultValue(): void {
      if ('value' in this) {
        this.value = this.defaultValue;
      } else {
        super._restoreDefaultValue();
      }
    }

    /**
     * Touched flips before the assignment so the validation cycle the value
     * setter runs applies invalid styling in the same pass, and the detail is
     * read back through the getter so listeners see the coerced value.
     */
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

    /**
     * Restores the default checked state through the public `checked` setter
     * so the correct reactive property is recorded for the update cycle.
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
