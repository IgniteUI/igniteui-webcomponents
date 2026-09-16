import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type { FormValueType } from '../mixins/forms/types.js';

/** A subset of the ARIA attributes exposed through `ElementInternals`. */
type ARIAState = { [K in keyof ARIAMixin]?: ARIAMixin[K] };

/** Configuration for the ElementInternalsController. */
type ElementInternalsConfig<T extends keyof ARIAMixin = keyof ARIAMixin> = {
  /** Initial ARIA attributes to set on the element internals. */
  initialARIA?: Partial<Record<T, ARIAMixin[T]>>;
  /**
   * ARIA attributes derived from host state, recomputed on every host update.
   * Keep the projection cheap - it runs whether or not the properties it reads
   * have changed.
   */
  aria?: () => ARIAState;
  /**
   * Whether to also mirror the internals `role` to a `role` content attribute
   * on the host element.
   *
   * Workaround for axe, which reads content attributes only and does not see
   * `ElementInternals` ARIA. An author-supplied `role` attribute always wins -
   * the controller only writes the attribute when it is absent or was written
   * by the controller itself.
   */
  reflectRole?: boolean;
  /**
   * Whether to also mirror the internals `ariaLabel` to an `aria-label`
   * content attribute on the host element.
   *
   * Same workaround and ownership rules as {@link reflectRole}.
   */
  reflectLabel?: boolean;
};

/**
 * Internals ARIA properties the controller can mirror onto host content
 * attributes, mapped to the attribute each one reflects to.
 */
const reflectable = {
  role: 'role',
  ariaLabel: 'aria-label',
} as const;

type ReflectableARIA = keyof typeof reflectable;

/**
 * Internal registry resolving a host element to its internals controller.
 *
 * `attachInternals()` throws when called twice on the same element, so a host
 * maps to at most one controller.
 */
const registry = new WeakMap<Element, ElementInternalsController>();

/**
 * A Lit ReactiveController to manage `ElementInternals` for a host element.
 * Provides methods to interact with custom element states and ARIA attributes..
 */
class ElementInternalsController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _internals: ElementInternals;
  private readonly _aria?: () => ARIAState;
  /**
   * The internals ARIA properties mirrored onto host content attributes,
   * each with the last attribute value this controller wrote for it.
   */
  private readonly _reflected = new Map<ReflectableARIA, string | null>();

  /**
   * Gets the closest ancestor `<form>` element or `null`.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
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
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
  public get validity(): ValidityState {
    return this._internals.validity;
  }

  /**
   * Returns a string containing the validation message of this element.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
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
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
  public get willValidate(): boolean {
    return this._internals.willValidate;
  }

  /**
   * Returns a read-only array of the `<label>` elements associated with the host element, or `null` if there are no associated labels.
   * The association is determined by the `for` attribute of `<label>` elements or by nesting the host element inside a `<label>`.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true` in order to return associated labels.
   */
  public get labels(): ReadonlyArray<Element> | null {
    const labels = this._internals.labels as NodeListOf<Element> | null;
    return labels && labels.length > 0 ? Array.from(labels) : null;
  }

  constructor(
    host: ReactiveControllerHost & LitElement,
    config?: ElementInternalsConfig
  ) {
    this._host = host;
    this._internals = this._host.attachInternals();
    this._aria = config?.aria;

    if (config?.reflectRole) {
      this._reflected.set('role', null);
    }
    if (config?.reflectLabel) {
      this._reflected.set('ariaLabel', null);
    }

    if (config?.initialARIA) {
      this.setARIA(config.initialARIA);
    }

    registry.set(host, this);
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    for (const name of this._reflected.keys()) {
      this._reflectAttribute(name);
    }
  }

  /** @internal */
  public hostUpdate(): void {
    if (this._aria) {
      this.setARIA(this._aria.call(this._host));
    }
  }

  /**
   * Mirrors a reflected internals ARIA property onto its content attribute on
   * the host.
   *
   * Deferred until the host is connected - custom elements must not gain
   * attributes during construction.
   */
  private _reflectAttribute(name: ReflectableARIA): void {
    const host = this._host;

    if (!host.isConnected) {
      return;
    }

    const attribute = reflectable[name];
    const value = this._internals[name];
    const current = host.getAttribute(attribute);

    // Write only when the attribute is absent or still holds the value this
    // controller wrote - an attribute changed by the author is theirs to keep.
    if (current !== null && current !== this._reflected.get(name)) {
      return;
    }

    // Only a null value takes its attribute with it - an empty string is a
    // valid ARIA value and stays mirrored as an empty attribute.
    if (current !== value) {
      value === null
        ? host.removeAttribute(attribute)
        : host.setAttribute(attribute, value);
    }

    this._reflected.set(name, value);
  }

  /** Sets ARIA attributes on the element's internals. */
  public setARIA<T extends keyof ARIAMixin = keyof ARIAMixin>(
    state: Partial<Record<T, ARIAMixin[T]>>
  ): void {
    Object.assign(this._internals, state);

    for (const name of this._reflected.keys()) {
      if (name in state) {
        this._reflectAttribute(name);
      }
    }
  }

  /**
   * Returns an ARIA attribute set on the element's internals. Internals-based
   * ARIA leaves no trace in the DOM, so this is the only way to read it back.
   */
  public getARIA<T extends keyof ARIAMixin = keyof ARIAMixin>(
    name: T
  ): ARIAMixin[T] {
    return this._internals[name];
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

  /**
   * Sets both the state and submission value of internals's target element to value.
   *
   * If value is null, the element won't participate in form submission.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
  public setFormValue(value: FormValueType, state?: FormValueType): void {
    this._internals.setFormValue(value, state);
  }

  /**
   * Sets the internal validity state of the host element as well as the validation
   * message.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
  public setValidity(flags?: ValidityStateFlags, message?: string): void {
    this._internals.setValidity(flags, message);
  }

  /**
   * Checks the internal validity of the host element and fires an `invalid` event if
   * the host element fails validation constraints.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
  public checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  /**
   * Checks the internal validity of the host element and fires an `invalid` event if
   * the host element fails validation constraints.
   *
   * @remarks
   * The host element must be form associated, that is, it should have
   * `static formAssociated = true`.
   */
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

/**
 * Resolves the {@link ElementInternalsController} of the given element, if it has one.
 *
 * Internal cross-component/spec lookup. Not part of the public API - lives under
 * `#internals` and must not be re-exported from the package entry point. Prefer this
 * over exposing `public` `@hidden @internal` members on component classes.
 */
export function internalsOf(
  element: Element
): ElementInternalsController | undefined {
  return registry.get(element);
}

export type { ElementInternalsController };
