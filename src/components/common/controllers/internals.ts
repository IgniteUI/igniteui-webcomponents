import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type { FormValueType } from '../mixins/forms/types.js';

/** Configuration for the ElementInternalsController. */
type ElementInternalsConfig<T extends keyof ARIAMixin = keyof ARIAMixin> = {
  /** Initial ARIA attributes to set on the element internals. */
  initialARIA: Partial<Record<T, ARIAMixin[T]>>;
};

/**
 * A Lit ReactiveController to manage `ElementInternals` for a host element.
 * Provides methods to interact with custom element states and ARIA attributes..
 */
class ElementInternalsController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _internals: ElementInternals;

  /**
   * Gets the closest ancestor `<form>` element or `null`.
   *
   * @remarks
   * The host element must be form associated, that is should have
   * `static formAssociated = true` in order to return the parent form.
   */
  public get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /**
   * Returns a `ValidityState` object which represents the different validity states
   * the element can be in, with respect to constraint validation.
   *
   * @remarks
   * The host element must be form associated, that is should have
   * `static formAssociated = true`.
   */
  public get validity(): ValidityState {
    return this._internals.validity;
  }

  /**
   * Returns a string containing the validation message of this element.
   *
   * @remarks
   * The host element must be form associated, that is should have
   * `static formAssociated = true`.
   */
  public get validationMessage(): string {
    return this._internals.validationMessage;
  }

  /**
   * Returns a boolean value which returns true if the element is a submittable element
   * which is a candidate for constraint validation.
   *
   * @remarks
   * The host element must be form associated, that is should have
   * `static formAssociated = true`.
   */
  public get willValidate(): boolean {
    return this._internals.willValidate;
  }

  constructor(
    host: ReactiveControllerHost & LitElement,
    config?: ElementInternalsConfig
  ) {
    this._host = host;
    this._internals = this._host.attachInternals();

    if (config?.initialARIA) {
      this.setARIA(config.initialARIA);
    }

    host.addController(this as ReactiveController);
  }

  /** Sets ARIA attributes on the element's internals. */
  public setARIA<T extends keyof ARIAMixin = keyof ARIAMixin>(
    state: Partial<Record<T, ARIAMixin[T]>>
  ): void {
    Object.assign(this._internals, state);
  }

  /**
   * Adds or removes a custom state from the element's internals.
   * Custom states can be styled via `:state()` selector in CSS.
   */
  public setState(state: string, value: boolean): void {
    value
      ? this._internals.states.add(state)
      : this._internals.states.delete(state);
  }

  public setFormValue(value: FormValueType, state?: FormValueType): void {
    this._internals.setFormValue(value, state);
  }

  public setValidity(flags?: ValidityStateFlags, message?: string): void {
    this._internals.setValidity(flags, message);
  }

  public checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }
}

/** Creates and adds a {@link ElementInternalsController} to a LitElement host. */
export function addInternalsController(
  host: ReactiveControllerHost & LitElement,
  config?: ElementInternalsConfig
): ElementInternalsController {
  return new ElementInternalsController(host, config);
}

export type { ElementInternalsController };
