/**
 * Argument bag passed to the {@link coercedProperty} callbacks.
 */
export interface CoercedPropertyContext<T, H> {
  /**
   * For `transform` — the incoming raw value; for `onChange` — the value
   * that was stored after coercion.
   */
  value: T;

  /** The component instance the property belongs to. */
  host: H;

  /**
   * The previously stored value, or `undefined` on the initial assignment.
   */
  previous: T | undefined;
}

/**
 * Configuration for {@link coercedProperty}.
 */
export interface CoercedPropertyConfig<T, H> {
  /**
   * Coerces every incoming value — the field initializer included — before it
   * is stored.
   */
  transform?: (context: CoercedPropertyContext<T, H>) => T;

  /**
   * Runs after a value is stored. Skipped for the field initializer, matching
   * the backing-field defaults of a hand-written accessor pair which never run
   * through the setter.
   */
  onChange?: (context: CoercedPropertyContext<T, H>) => void;
}

/**
 * Replaces the hand-written backing-field accessor pair around a reactive
 * property with a declarative coerce/side-effect configuration.
 *
 * Composes with `@property` — Lit must keep wrapping the accessor for change
 * detection, and the manifest analyzer must keep seeing the `@property`
 * declaration:
 *
 * ```ts
 * @property({ type: Number })
 * @coercedProperty<number, IgcSomeComponent>({
 *   transform: ({ value }) => clamp(value, 0, 100),
 *   onChange: ({ host }) => host._validate(),
 * })
 * public value = 0;
 * ```
 *
 * The declaration must keep its initializer — it provides the default the
 * old backing field carried, and its assignment marks construction so
 * `onChange` only fires for later sets. Properties whose getter computes a
 * derived value or whose storage lives outside the instance (form value
 * state, controllers) keep their hand-written accessors.
 */
export function coercedProperty<T, H extends object = object>(
  config: CoercedPropertyConfig<T, H>
) {
  const { transform, onChange } = config;

  return (prototype: object, name: PropertyKey): void => {
    // When `@property` is written below this decorator it has already
    // installed Lit's accessor; wrap it instead of shadowing it so change
    // detection keeps working. In the canonical order (this decorator below
    // `@property`) there is no descriptor yet and Lit wraps ours.
    const wrapped = Object.getOwnPropertyDescriptor(prototype, name);
    const store = new WeakMap<object, T>();
    const initialized = new WeakSet<object>();

    const read =
      wrapped?.get ??
      function (this: object) {
        return store.get(this);
      };

    const write =
      wrapped?.set ??
      function (this: object, value: T) {
        store.set(this, value);
      };

    Object.defineProperty(prototype, name, {
      get(this: H) {
        return read.call(this);
      },
      set(this: H, value: T) {
        const initial = !initialized.has(this);
        initialized.add(this);

        const previous = initial ? undefined : (read.call(this) as T);
        const next = transform
          ? transform({ value, host: this, previous })
          : value;

        write.call(this, next);

        if (!initial) {
          onChange?.({ value: next, host: this, previous });
        }
      },
      configurable: true,
      enumerable: true,
    });
  };
}
