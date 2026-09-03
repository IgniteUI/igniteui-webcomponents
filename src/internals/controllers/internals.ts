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
};

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
  private readonly _reflectRole: boolean;

  /** The last `role` content attribute value written by this controller. */
  private _reflectedRole: string | null = null;

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
    this._reflectRole = config?.reflectRole ?? false;

    if (config?.initialARIA) {
      this.setARIA(config.initialARIA);
    }

    registry.set(host, this);
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this._reflectRoleAttribute();
  }

  /** @internal */
  public hostUpdate(): void {
    if (this._aria) {
      this.setARIA(this._aria.call(this._host));
    }
  }

  /**
   * Mirrors the internals `role` onto a content attribute on the host, when
   * {@link ElementInternalsConfig.reflectRole} is enabled.
   *
   * Deferred until the host is connected - custom elements must not gain
   * attributes during construction.
   */
  private _reflectRoleAttribute(): void {
    const host = this._host;

    if (!(this._reflectRole && host.isConnected)) {
      return;
    }

    const role = this._internals.role;
    const current = host.getAttribute('role');

    // Write only when the attribute is absent or still holds the value this
    // controller wrote - an attribute changed by the author is theirs to keep.
    if (current !== null && current !== this._reflectedRole) {
      return;
    }

    // A cleared role takes its attribute with it, or the host would keep
    // semantics that its internals no longer report.
    role ? host.setAttribute('role', role) : host.removeAttribute('role');
    this._reflectedRole = role;
  }

  /** Sets ARIA attributes on the element's internals. */
  public setARIA<T extends keyof ARIAMixin = keyof ARIAMixin>(
    state: Partial<Record<T, ARIAMixin[T]>>
  ): void {
    Object.assign(this._internals, state);

    if ('role' in state) {
      this._reflectRoleAttribute();
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
