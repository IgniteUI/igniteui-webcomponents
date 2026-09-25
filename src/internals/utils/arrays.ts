/** Returns the first element, typed as `T` even for an empty array. */
export function firstOf<T>(arr: T[]) {
  return arr.at(0) as T;
}

/** Returns the last element, typed as `T` even for an empty array. */
export function lastOf<T>(arr: T[]) {
  return arr.at(-1) as T;
}

/**
 * Splits an array into chunks of the given size.
 *
 * @example
 * ```typescript
 * [...chunk([1, 2, 3, 4, 5], 2)]; // [[1, 2], [3, 4], [5]]
 * ```
 *
 * @throws If the `size` parameter is not a safe integer greater than or
 * equal to 1.
 */
export function* chunk<T>(arr: T[], size: number): Generator<T[]> {
  if (!Number.isSafeInteger(size) || size < 1) {
    throw new Error('size must be an integer >= 1');
  }

  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

/** Returns whether a given collection is empty. */
export function isEmpty<T, U extends object>(
  x: ArrayLike<T> | Set<T> | Map<U, T>
): boolean {
  return 'length' in x ? x.length < 1 : x.size < 1;
}

/**
 * Returns the given value as an array. An empty value gives an empty array.
 *
 * @example
 * ```typescript
 * asArray(5); // [5]
 * asArray([1, 2, 3]); // [1, 2, 3]
 * asArray(undefined); // []
 * ```
 */
export function asArray<T>(value?: T | T[]): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Returns whether two collections hold the same items, in the same order and
 * by identity. Two empty values match; an empty value differs from a
 * collection.
 *
 * @example
 * ```typescript
 * sameItems([a, b], [a, b]); // true
 * sameItems([a, b], [b, a]); // false
 * sameItems(null, undefined); // true
 * ```
 */
export function sameItems<T>(
  a: ArrayLike<T> | null | undefined,
  b: ArrayLike<T> | null | undefined
): boolean {
  if (a == null || b == null) {
    return a == null && b == null;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Splits an array in two with a predicate: matching items first.
 *
 * @example
 * ```typescript
 * const [evens, odds] = partition([1, 2, 3, 4], x => x % 2 === 0);
 * console.log(evens); // [2, 4]
 * console.log(odds); // [1, 3]
 * ```
 */
export function partition<T>(
  array: T[],
  isTruthy: (value: T) => boolean
): [truthy: T[], falsy: T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  for (const item of array) {
    (isTruthy(item) ? truthy : falsy).push(item);
  }

  return [truthy, falsy];
}
