/** The argument object that the {@link coercedProperty} callbacks get. */
export interface CoercedPropertyContext<T, H> {
  /** The raw value in `transform`, the coerced value in `onChange`. */
  value: T;

  host: H;

  /** The value stored before, or `undefined` on the initial assignment. */
  previous: T | undefined;
}

/** Configuration for {@link coercedProperty}. */
export interface CoercedPropertyConfig<T, H> {
  /** Coerces every incoming value, the field initializer included. */
  transform?: (context: CoercedPropertyContext<T, H>) => T;

  /**
   * Runs after the property stores a value, but not for the field
   * initializer, which matches a hand-written accessor pair.
   */
  onChange?: (context: CoercedPropertyContext<T, H>) => void;
}

/**
 * Replaces the hand-written backing-field accessor pair of a reactive
 * property with a declarative coercion and side-effect configuration.
 *
 * @remarks
 * Apply it below `@property`, so Lit keeps its wrapper for change detection
 * and the manifest analyzer still sees the declaration:
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
 * Keep the initializer: it gives the default value and marks the
 * construction, so `onChange` runs for a later set only. Keep hand-written
 * accessors for a computed getter, or for storage that lives outside the
 * instance.
 */
export function coercedProperty<T, H extends object = object>(
  config: CoercedPropertyConfig<T, H>
) {
  const { transform, onChange } = config;

  return (prototype: object, name: PropertyKey): void => {
    // In the canonical order there is no descriptor yet, and Lit wraps the
    // accessor below. A `@property` applied first instead leaves its own
    // accessor here, which this one wraps to keep change detection.
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
