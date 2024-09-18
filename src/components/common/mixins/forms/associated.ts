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

export function FormAssociatedMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedElement extends base {
    public static readonly formAssociated = true;

    private __internals: ElementInternals;

    protected _defaultValue: unknown;

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
     * Control the validity of the control.
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
    }

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

    private _handleInvalid(event: Event) {
      event.preventDefault();
      this.invalid = true;
    }

    private _setInvalidState(): void {
      if (this.hasUpdated || this._dirty) {
        this.invalid = !this.checkValidity();
      }
    }

    protected _setDefaultValue(_: string | null, current: string | null): void {
      this._defaultValue = current;
    }

    protected _restoreDefaultValue(): void {
      if ('value' in this) {
        this.value = this._defaultValue;
      }
    }

    protected _validate(message?: string): void {
      this._updateValidity(message);
      this._setInvalidState();
    }

    protected _updateValidity(message?: string) {
      const validity: ValidityStateFlags = {};
      let validationMessage = '';

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          validationMessage =
            typeof validator.message === 'function'
              ? validator.message(this)
              : validator.message;
        }
      }

      if (message) {
        validity.customError = true;
        validationMessage = message;
      }

      this.__internals.setValidity(validity, validationMessage);
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

    protected formStateRestoreCallback(
      _state: FormValueType,
      _mode: FormRestoreMode
    ): void {}

    /** Checks for validity of the control and shows the browser message if it invalid. */
    public reportValidity() {
      return this.__internals.reportValidity();
    }

    /** Checks for validity of the control and emits the invalid event if it invalid. */
    public checkValidity() {
      return this.__internals.checkValidity();
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
    public setCustomValidity(message: string) {
      this._updateValidity(message);
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedElement as unknown as Constructor<FormAssociatedElementInterface> &
    T;
}

export function FormAssociatedCheckboxMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedCheckboxElement extends base {
    public static readonly formAssociated = true;

    private __internals: ElementInternals;

    protected _defaultChecked = false;

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
     * Control the validity of the control.
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
    }

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

    private _handleInvalid(event: Event) {
      event.preventDefault();
      this.invalid = true;
    }

    private _setInvalidState(): void {
      if (this.hasUpdated || this._dirty) {
        this.invalid = !this.checkValidity();
      }
    }

    protected _setDefaultValue(_: string | null, current: string | null): void {
      this._defaultChecked = current !== null;
    }

    protected _restoreDefaultValue(): void {
      if ('checked' in this) {
        this.checked = this._defaultChecked;
      }
    }

    protected _validate(message?: string): void {
      this._updateValidity(message);
      this._setInvalidState();
    }

    protected _updateValidity(message?: string) {
      const validity: ValidityStateFlags = {};
      let validationMessage = '';

      for (const validator of this.__validators) {
        const isValid = validator.isValid(this);

        validity[validator.key] = !isValid;

        if (!isValid) {
          validationMessage =
            typeof validator.message === 'function'
              ? validator.message(this)
              : validator.message;
        }
      }

      if (message) {
        validity.customError = true;
        validationMessage = message;
      }

      this.__internals.setValidity(validity, validationMessage);
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

    protected formStateRestoreCallback(
      _state: FormValueType,
      _mode: FormRestoreMode
    ): void {}

    /** Checks for validity of the control and shows the browser message if it invalid. */
    public reportValidity() {
      return this.__internals.reportValidity();
    }

    /** Checks for validity of the control and emits the invalid event if it invalid. */
    public checkValidity() {
      return this.__internals.checkValidity();
    }

    /**
     * Sets a custom validation message for the control.
     * As long as `message` is not empty, the control is considered invalid.
     */
    public setCustomValidity(message: string) {
      this._updateValidity(message);
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedCheckboxElement as unknown as Constructor<FormAssociatedCheckboxElementInterface> &
    T;
}
