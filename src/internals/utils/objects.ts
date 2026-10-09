import { isFunction, isObject, isRegExp } from './types.js';

/** The object pairs under comparison at this moment. */
type Visited = WeakMap<object, WeakSet<object>>;

/**
 * Returns whether two values are deeply equal. Handles arrays, Maps, Sets,
 * RegExps, plain objects and circular references.
 */
export function equal(
  a: unknown,
  b: unknown,
  visited: Visited = new WeakMap()
): boolean {
  if (Object.is(a, b)) return true;

  if (!isObject(a) || !isObject(b)) return false;
  if (a.constructor !== b.constructor) return false;

  // A pending pair counts as equal, which stops cycles. Track pairs, not
  // objects: `a` can meet another partner while it is still pending.
  const pending = visited.get(a) ?? new WeakSet();
  if (pending.has(b)) return true;
  visited.set(a, pending.add(b));

  try {
    return compare(a, b, visited);
  } finally {
    pending.delete(b);
  }
}

function compare(a: object, b: object, visited: Visited): boolean {
  if (isRegExp(a) && isRegExp(b))
    return a.source === b.source && a.flags === b.flags;

  // Map entries iterate as [key, value] arrays.
  if (
    (a instanceof Map && b instanceof Map) ||
    (a instanceof Set && b instanceof Set)
  )
    return a.size === b.size && matchOneToOne(a, b, visited);

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equal(a[i], b[i], visited)) return false;
    }
    return true;
  }

  // A custom conversion on one side only makes the objects unequal, which
  // keeps `equal` an equivalence relation.
  for (const method of ['valueOf', 'toString'] as const) {
    const left = customConversion(a, method);
    const right = customConversion(b, method);

    // `Object.is`, so that an invalid Date (`NaN`) equals its copy.
    if (left || right)
      return (
        !!left &&
        !!right &&
        Object.is(Reflect.apply(left, a, []), Reflect.apply(right, b, []))
      );
  }

  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  const keys = Object.keys(x);

  return (
    keys.length === Object.keys(y).length &&
    keys.every((key) => Object.hasOwn(y, key) && equal(x[key], y[key], visited))
  );
}

/** Returns `value[method]` unless it is missing or the default. */
function customConversion(
  value: object,
  method: 'valueOf' | 'toString'
): CallableFunction | undefined {
  const fn = (value as Record<string, unknown>)[method];
  return isFunction(fn) && fn !== Object.prototype[method] ? fn : undefined;
}

/**
 * Pairs each item of `left` with a distinct equal item of `right`. Greedy
 * suffices, since `equal` is an equivalence relation.
 */
function matchOneToOne(
  left: Iterable<unknown>,
  right: Iterable<unknown>,
  visited: Visited
): boolean {
  const pool = [...right];

  for (const a of left) {
    const index = pool.findIndex((b) => equal(a, b, visited));
    if (index < 0) return false;
    pool.splice(index, 1);
  }

  return true;
}

/** Clears the boolean `flag` on `from` and sets it on `to`. */
export function moveFlag<K extends string>(
  from: { [P in K]: boolean } | null | undefined,
  to: { [P in K]: boolean } | null | undefined,
  flag: K
): void {
  if (from && from !== to) from[flag] = false;
  if (to) to[flag] = true;
}

/**
 * Returns the value of `key` in `map`. For a missing key, stores and returns
 * the result of `create`. Follows `Map.prototype.getOrInsertComputed`.
 */
export function getOrInsertComputed<K, V>(
  map: { get(key: K): V | undefined; set(key: K, value: V): unknown },
  key: K,
  create: (key: K) => V
): V {
  let value = map.get(key);

  if (value === undefined) {
    value = create(key);
    map.set(key, value);
  }

  return value;
}
