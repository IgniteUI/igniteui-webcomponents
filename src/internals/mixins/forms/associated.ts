import { isServer, type LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { NAMING_ATTRIBUTES } from '../../controllers/aria-projection.js';
import { addInternalsController } from '../../controllers/internals.js';
import { enterKey, isKey } from '../../controllers/keys.js';
import { sameItems } from '../../utils/arrays.js';
import { addSafeEventListener, preventDefault } from '../../utils/events.js';
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

let isFormCheckWrapped = false;
/** The forms whose `checkValidity()` runs. These checks do not move the focus. */
const checkingForms = new WeakSet<HTMLFormElement>();

/**
 * A failed submit and `form.checkValidity()` send the same `invalid` events,
 * but only the submit moves the focus. The wrapper tells them apart.
 */
function wrapFormCheckValidity(): void {
  if (isServer || isFormCheckWrapped) {
    return;
  }

  const { checkValidity } = HTMLFormElement.prototype;
  isFormCheckWrapped = true;

  HTMLFormElement.prototype.checkValidity = function (this: HTMLFormElement) {
    if (checkingForms.has(this)) {
      return checkValidity.call(this);
    }

    checkingForms.add(this);

    try {
      return checkValidity.call(this);
    } finally {
      checkingForms.delete(this);
    }
  };
}

/**
 * The browser focuses the first invalid control whose `invalid` event is not
 * canceled. Cancels the events of `controls` in the current validation pass,
 * so that an earlier control keeps the focus.
 */
function cancelInvalidEvents(controls: Element[]): void {
  const controller = new AbortController();
  const options = { once: true, signal: controller.signal };

  for (const control of controls) {
    control.addEventListener('invalid', preventDefault, options);
  }

  // The pass is synchronous. The listeners must not reach a later pass.
  setTimeout(() => controller.abort());
}

type ListedElement = Element &
  Partial<Pick<HTMLInputElement, 'willValidate' | 'validity'>>;

/** Whether the element takes part in constraint validation and fails it. */
function isInvalidControl(element: ListedElement): boolean {
  return !!element.willValidate && !element.validity?.valid;
}

function BaseFormAssociated<T extends Constructor<LitElement>>(base: T) {
  class BaseFormAssociatedElement extends base {
    public static readonly formAssociated = true;

    /**
     * Adds the naming attributes. The mixin base type has no static
     * `observedAttributes`, so `Reflect.get` calls the base getter with this
     * class as `this`.
     * @internal
     */
    public static get observedAttributes(): string[] {
      const inherited = Reflect.get(base, 'observedAttributes', this);
      return [...(inherited as string[]), ...NAMING_ATTRIBUTES];
    }

    //#region Internal state and properties

    protected readonly _internals = addInternalsController(this);
    protected readonly _formValue!: FormValue<unknown>;

    /** Set while `checkValidity()` of the control runs. */
    private _isInternalValidation = false;
    /** Set while `reportValidity()` of the control runs. */
    private _isReportingValidity = false;
    private _touched = false;
    private _isExternalInvalid = false;
    /** The `<label>` elements at the last update. */
    private _renderedLabels: ReadonlyArray<Element> | null = null;

    private get _shouldApplyStyles(): boolean {
      if (this._isExternalInvalid) {
        return true;
      }

      // A disabled control cannot validate, so it never styles as invalid.
      return !this._disabled && this._invalid && this._touched;
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
      wrapFormCheckValidity();
      addSafeEventListener(this, 'invalid', this._handleInvalid);
      addSafeEventListener(this, 'click', this._handleHostClick);
      addSafeEventListener(this, 'focusin', this._handleFocusEnter);
    }

    /** @internal */
    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);

      if (NAMING_ATTRIBUTES.includes(name)) {
        this.requestUpdate();
      }
    }

    /** @internal */
    protected override update(properties: PropertyValues): void {
      this._renderedLabels = this._internals.labels;
      super.update(properties);
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

    //#region Labels

    /**
     * A bubbling click that starts on the host activates the component. A
     * `<label>` sends this click. A click from code that does not bubble does
     * not activate the component.
     */
    private _handleHostClick(event: MouseEvent): void {
      if (
        !this.disabled &&
        event.bubbles &&
        !event.defaultPrevented &&
        event.composedPath()[0] === this
      ) {
        this._handleLabelActivation();
      }
    }

    /**
     * `ElementInternals.labels` sends no change event. When focus enters the
     * host from outside, render again if the labels changed after the last
     * update.
     */
    private _handleFocusEnter(event: FocusEvent): void {
      if (
        !this.contains(event.relatedTarget as Node | null) &&
        !sameItems(this._internals.labels, this._renderedLabels)
      ) {
        this.requestUpdate();
      }
    }

    /**
     * Runs when a `<label>` or a click on the host activates the component. A
     * component that delegates focus needs no override: the browser focuses it.
     */
    protected _handleLabelActivation(): void {}

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

      if (!this._isInternalValidation) {
        // A failed submission is a lasting interaction: touched keeps
        // `invalid` and the projected messages visible across re-renders.
        this._setTouchedState();
        emitInternalFormEvent(this, InternalInvalidEvent);
      }

      this._setInvalidStyles();
      this.requestUpdate();

      const form = this.form;

      // The canceled event also keeps the browser from focusing the first
      // invalid control after a failed submit.
      if (
        form &&
        !this._isInternalValidation &&
        !this._isReportingValidity &&
        !checkingForms.has(form)
      ) {
        const [first, ...later] = Array.from(form.elements).filter(
          isInvalidControl
        );

        if (first === this) {
          this.focus();
          cancelInvalidEvents(later);
        }
      }
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

      // `checkValidity()` would send `invalid`, which a native control does
      // not do while the user edits it.
      this._invalid = isInvalidControl(this);

      if (this._invalid) {
        // The validation container and some inner editors render `invalid`.
        this.requestUpdate();
      }

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
      this._resetValidationState();
    }

    protected _resetValidationState(): void {
      this._pristine = true;
      this._touched = false;
      this._invalid = false;
      this._isExternalInvalid = false;
      this._setInvalidStyles();
      emitInternalFormEvent(this, InternalResetEvent);
    }

    //#endregion

    //#region Public API

    /**
     * Checks validity and shows the browser message when invalid. As for a
     * native control, an invalid control takes the focus.
     */
    public reportValidity(): boolean {
      const state = this._reportValidity();

      if (!state) {
        this.focus();
      }

      return state;
    }

    /** Reports the validity without moving the focus. */
    protected _reportValidity(): boolean {
      this._isReportingValidity = true;
      const state = this._internals.reportValidity();
      this._isReportingValidity = false;
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
     * Restores the default value through the public `value` setter, so that a
     * form reset gets the same clamping, normalization and reactive state.
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
