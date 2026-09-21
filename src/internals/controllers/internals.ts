import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';

/** The value types that `ElementInternals.setFormValue` accepts. */
export type FormValueType = string | File | FormData | null;

/** A subset of the ARIA attributes that `ElementInternals` gives. */
type ARIAState = { [K in keyof ARIAMixin]?: ARIAMixin[K] };

type ElementInternalsConfig = {
  initialARIA?: ARIAState;
  /**
   * ARIA attributes derived from the host state. It runs on every host
   * update, so keep it cheap; only changed values reach the internals.
   */
  aria?: () => ARIAState;
  /**
   * Whether the controller also mirrors the internals `role` onto a `role`
   * content attribute of the host element.
   *
   * @remarks
   * Workaround: axe reads content attributes only and does not see
   * `ElementInternals` ARIA. A `role` attribute from the author always wins.
   */
  reflectRole?: boolean;
  /**
   * Whether the controller also mirrors the internals `ariaLabel` onto an
   * `aria-label` content attribute of the host element. Same rules as
   * {@link reflectRole}.
   */
  reflectLabel?: boolean;
};

/** The mirrored internals ARIA properties and their content attributes. */
const reflectable = {
  role: 'role',
  ariaLabel: 'aria-label',
} as const;

type ReflectableARIA = keyof typeof reflectable;

/**
 * Resolves a host element to its internals controller. `attachInternals()`
 * throws on a second call, so a host has one controller at most.
 */
const registry = new WeakMap<Element, ElementInternalsController>();

/**
 * Manages the `ElementInternals` of a host element.
 *
 * @remarks
 * The form-related members need a form associated host, that is, one with
 * `static formAssociated = true`.
 */
class ElementInternalsController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _internals: ElementInternals;
  private readonly _aria?: () => ARIAState;
  /** Mirrored ARIA properties and the last value this controller wrote. */
  private readonly _reflected = new Map<ReflectableARIA, string | null>();

  /**
   * The ARIA values this controller last wrote. Each write reaches the
   * accessibility tree, so the controller writes only what changes.
   */
  private readonly _ariaState = new Map<keyof ARIAMixin, unknown>();

  /** Returns the closest ancestor `<form>` element, or `null`. */
  public get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /** Returns the `ValidityState` object of the element. */
  public get validity(): ValidityState {
    return this._internals.validity;
  }

  /** Returns the validation message of this element. */
  public get validationMessage(): string {
    return this._internals.validationMessage;
  }

  /** Whether the element is submittable and constraint validated. */
  public get willValidate(): boolean {
    return this._internals.willValidate;
  }

  /** Returns the `<label>` elements of the host, or `null` when it has none. */
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
   * Mirrors an internals ARIA property onto its host content attribute. It
   * waits for the connection: a custom element must gain no attribute during
   * its construction.
   */
  private _reflectAttribute(name: ReflectableARIA): void {
    const host = this._host;

    if (!host.isConnected) {
      return;
    }

    const attribute = reflectable[name];
    const value = this._internals[name];
    const current = host.getAttribute(attribute);

    // An attribute that the author set or changed stays as the author left it.
    if (current !== null && current !== this._reflected.get(name)) {
      return;
    }

    // Only null removes the attribute; an empty string is a valid ARIA value.
    if (current !== value) {
      value === null
        ? host.removeAttribute(attribute)
        : host.setAttribute(attribute, value);
    }

    this._reflected.set(name, value);
  }

  /** Sets ARIA attributes on the element's internals. */
  public setARIA(state: ARIAState): void {
    // A write through a key of the union needs an index signature.
    const internals = this._internals as unknown as Record<string, unknown>;

    for (const key in state) {
      const name = key as keyof ARIAMixin;
      const value = state[name];

      if (!this._ariaState.has(name) || this._ariaState.get(name) !== value) {
        this._ariaState.set(name, value);
        internals[name] = value;
      }
    }

    // Always reflect a key that the state carries: the internals value alone
    // does not reveal an attribute that the author removed.
    for (const name of this._reflected.keys()) {
      if (name in state) {
        this._reflectAttribute(name);
      }
    }
  }

  /**
   * Returns an ARIA attribute of the internals. Internals-based ARIA leaves no
   * trace in the DOM, so this is the only way to read it back.
   */
  public getARIA<T extends keyof ARIAMixin = keyof ARIAMixin>(
    name: T
  ): ARIAMixin[T] {
    return this._internals[name];
  }

  /** Adds or removes a custom state, which CSS matches with `:state()`. */
  public setState(state: string, value: boolean): void {
    value
      ? this._internals.states.add(state)
      : this._internals.states.delete(state);
  }

  /**
   * Sets the state and the submission value of the host element. A `null`
   * value keeps the element out of the form submission.
   */
  public setFormValue(value: FormValueType, state?: FormValueType): void {
    this._internals.setFormValue(value, state);
  }

  /** Sets the validity state and the validation message of the host. */
  public setValidity(flags?: ValidityStateFlags, message?: string): void {
    this._internals.setValidity(flags, message);
  }

  /** Checks host validity, and sends an `invalid` event on a failure. */
  public checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  /**
   * Checks host validity and reports the result to the user. It sends an
   * `invalid` event on a failure.
   */
  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }
}

/** Creates an {@link ElementInternalsController} and adds it to a Lit host. */
export function addInternalsController(
  host: ReactiveControllerHost & LitElement,
  config?: ElementInternalsConfig
): ElementInternalsController {
  return new ElementInternalsController(host, config);
}

/**
 * Returns the {@link ElementInternalsController} of the given element, or
 * `undefined`.
 *
 * @remarks
 * An internal lookup for components and specs: the package entry point must
 * not re-export it. Prefer it over a `@hidden` member on a component class.
 */
export function internalsOf(
  element: Element
): ElementInternalsController | undefined {
  return registry.get(element);
}

export type { ElementInternalsController };
