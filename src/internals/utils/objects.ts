import { isObject, isPlainObject, isRegExp } from './types.js';

function isUnsafeProperty(key: PropertyKey) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/**
 * Performs a deep structural equality check between two values, handling
 * arrays, Maps, Sets, RegExps, POJOs and circular references.
 */
export function equal<T>(a: unknown, b: T, visited = new WeakSet()): boolean {
  // Early return
  if (Object.is(a, b)) {
    return true;
  }

  if (isObject(a) && isObject(b)) {
    if (a.constructor !== b.constructor) {
      return false;
    }

    // Circular references
    if (visited.has(a) && visited.has(b)) {
      return true;
    }

    visited.add(a);
    visited.add(b);

    // RegExp
    if (isRegExp(a) && isRegExp(b)) {
      return a.source === b.source && a.flags === b.flags;
    }

    // Maps
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) {
        return false;
      }
      for (const [keyA, valueA] of a.entries()) {
        let found = false;
        for (const [keyB, valueB] of b.entries()) {
          if (equal(keyA, keyB, visited) && equal(valueA, valueB, visited)) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      return true;
    }

    // Sets
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) {
        return false;
      }
      for (const valueA of a) {
        let found = false;
        for (const valueB of b) {
          if (equal(valueA, valueB, visited)) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      return true;
    }

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      const length = a.length;
      if (length !== b.length) {
        return false;
      }
      for (let i = 0; i < length; i++) {
        if (!equal(a[i], b[i], visited)) {
          return false;
        }
      }
      return true;
    }

    // toPrimitive
    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }
    // Strings based
    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if (!Object.hasOwn(b, key)) {
        return false;
      }
    }

    for (const key of aKeys) {
      if (!equal(a[key as keyof typeof a], b[key as keyof typeof b], visited)) {
        return false;
      }
    }

    visited.delete(a);
    visited.delete(b);

    return true;
  }

  return false;
}

/**
 * Merges the properties of `source` into `target` performing a recursive deep merge over POJOs and arrays.
 *
 * @remarks
 * This function mutates the `target` object.
 * If that is not the desired outcome, see {@link toMerged} for another approach.
 */
export function merge<
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(target: T, source: S): T & S {
  const sourceKeys = Object.keys(source) as Array<keyof S>;
  const length = sourceKeys.length;

  for (let i = 0; i < length; i++) {
    const key = sourceKeys[i];

    if (isUnsafeProperty(key)) {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      if (Array.isArray(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge([], sourceValue);
      }
    } else if (isPlainObject(sourceValue)) {
      if (isPlainObject(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge({}, sourceValue);
      }
    } else if (targetValue === undefined || sourceValue !== undefined) {
      target[key] = sourceValue;
    }
  }

  return target;
}

/**
 * Just like {@link merge} but it does not mutate the `target` object instead
 * mutating a structured clone of it.
 *
 * @remarks
 * Since it relies on `structuredClone`, the `target` must not contain
 * non-cloneable values such as functions, DOM nodes or class instances.
 */
export function toMerged<
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(target: T, source: S): T & S {
  return merge(structuredClone(target), source);
}
