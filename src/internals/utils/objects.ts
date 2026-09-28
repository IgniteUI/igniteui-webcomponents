import { isFunction, isObject, isRegExp } from './types.js';

/** The object pairs the comparison visits at this moment, to stop cycles. */
type Visited = WeakMap<object, WeakSet<object>>;

/**
 * Returns whether two values are deeply equal. Handles arrays, Maps, Sets,
 * RegExps, plain objects and circular references.
 */
export function equal<T>(
  a: unknown,
  b: T,
  visited: Visited = new WeakMap()
): boolean {
  if (Object.is(a, b)) return true;

  if (!isObject(a) || !isObject(b)) return false;
  if (a.constructor !== b.constructor) return false;

  // Record the pair, not each object on its own: the Map and Set branches
  // below test candidates they expect to fail, and single-object records
  // would make a later comparison of the same pair return `true`.
  const pending = visited.get(a) ?? new WeakSet();
  if (pending.has(b)) return true;
  visited.set(a, pending.add(b));

  try {
    return compare(a, b, visited);
  } finally {
    // Release the pair, including on an early return in `compare`.
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

  // Null-prototype objects may lack either method, on either side.
  if (isFunction(a.valueOf) && a.valueOf !== Object.prototype.valueOf)
    return isFunction(b.valueOf) && a.valueOf() === b.valueOf();
  if (isFunction(a.toString) && a.toString !== Object.prototype.toString)
    return isFunction(b.toString) && a.toString() === b.toString();

  const keys = Object.keys(a) as (keyof typeof a)[];

  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key], visited))
  );
}

/**
 * Pairs each item of `left` with a distinct equal item of `right`.
 * A greedy match suffices, since `equal` is transitive.
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
