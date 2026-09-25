import { isObject, isRegExp } from './types.js';

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
  let pending = visited.get(a);
  if (pending?.has(b)) return true;

  if (!pending) {
    pending = new WeakSet();
    visited.set(a, pending);
  }
  pending.add(b);

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

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [keyA, valueA] of a.entries()) {
      let found = false;
      for (const [keyB, valueB] of b.entries()) {
        if (equal(keyA, keyB, visited) && equal(valueA, valueB, visited)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const valueA of a) {
      let found = false;
      for (const valueB of b) {
        if (equal(valueA, valueB, visited)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const length = a.length;
    if (length !== b.length) return false;
    for (let i = 0; i < length; i++) {
      if (!equal(a[i], b[i], visited)) return false;
    }
    return true;
  }

  if (a.valueOf !== Object.prototype.valueOf)
    return a.valueOf() === b.valueOf();
  if (a.toString !== Object.prototype.toString)
    return a.toString() === b.toString();

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) return false;
  }

  for (const key of aKeys) {
    if (!equal(a[key as keyof typeof a], b[key as keyof typeof b], visited))
      return false;
  }

  return true;
}
