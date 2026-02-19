/**
 * A Map that automatically creates default values for missing keys.
 *
 * @remarks
 * Extends the native `Map` class with a `getOrCreate` method that returns
 * an existing value or creates a new one using the provided factory function.
 *
 * @example
 * Creating a DefaultMap with a factory function:
 * ```typescript
 * const map = new DefaultMap<string, number[]>(undefined, () => []);
 * map.getOrCreate('items').push(1, 2, 3);
 * ```
 *
 * @example
 * Creating a DefaultMap with initial entries:
 * ```typescript
 * const initial: [string, Set<number>][] = [
 *   ['evens', new Set([2, 4, 6])],
 *   ['odds', new Set([1, 3, 5])],
 * ];
 * const map = new DefaultMap(initial, () => new Set<number>());
 * map.getOrCreate('primes').add(2).add(3).add(5);
 * ```
 */
class DefaultMap<K, V> extends Map<K, V> {
  private readonly _factoryFn: () => V;

  public override get [Symbol.toStringTag](): string {
    return 'DefaultMap';
  }

  /**
   * Creates a new DefaultMap instance.
   *
   * @param entries - Optional iterable of key-value pairs to initialize the map.
   * @param factoryFn - Factory function that creates default values for missing keys.
   *                    Defaults to creating a new `Map` instance.
   */
  constructor(entries?: Iterable<readonly [K, V]>, factoryFn?: () => V) {
    super(entries);
    this._factoryFn = factoryFn ?? (() => new Map() as V);
  }

  /**
   * Returns the value for the given key, creating it if it doesn't exist.
   *
   * @param key - The key to look up or create a value for.
   * @returns The existing or newly created value for the key.
   */
  public getOrCreate(key: K): V {
    if (!this.has(key)) {
      this.set(key, this._factoryFn());
    }

    return this.get(key) as V;
  }
}

/**
 * Creates a new DefaultMap with the specified entries and factory function.
 *
 * @param entries - Optional iterable of key-value pairs to initialize the map.
 * @param factoryFn - Factory function that creates default values for missing keys.
 * @returns A new DefaultMap instance.
 *
 * @example
 * Creating a DefaultMap with a factory function:
 * ```typescript
 * const counters = createDefaultMap<string, number>(undefined, () => 0);
 * counters.set('visits', counters.getOrCreate('visits') + 1);
 * ```
 *
 * @example
 * Creating a DefaultMap with initial entries:
 * ```typescript
 * const defaults: [string, string[]][] = [
 *   ['fruits', ['apple', 'banana']],
 *   ['vegetables', ['carrot', 'broccoli']],
 * ];
 * const categories = createDefaultMap(defaults, () => [] as string[]);
 * categories.getOrCreate('dairy').push('milk', 'cheese');
 * ```
 */
export function createDefaultMap<K, V>(
  entries?: Iterable<readonly [K, V]>,
  factoryFn?: () => V
): DefaultMap<K, V> {
  return new DefaultMap<K, V>(entries, factoryFn);
}

/**
 * Creates a DefaultMap for icon collections with nested Map values.
 *
 * @remarks
 * This is a convenience function for creating the nested map structure
 * used by the icon registry to organize icons by collection and name.
 *
 * @returns A DefaultMap where each value is itself a Map.
 *
 * @example
 * ```typescript
 * const icons = createIconDefaultMap<string, SvgIcon>();
 * icons.getOrCreate('material').set('home', { svg: '...' });
 * ```
 */
export function createIconDefaultMap<K, V>() {
  return new DefaultMap<K, Map<K, V>>();
}

export type { DefaultMap };
