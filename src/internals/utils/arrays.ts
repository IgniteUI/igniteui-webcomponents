/**
 * Returns the first element of the given array.
 *
 * @remarks
 * Assumes a non-empty array - for an empty one it returns `undefined`
 * typed as `T`.
 */
export function firstOf<T>(arr: T[]) {
  return arr.at(0) as T;
}

/**
 * Returns the last element of the given array.
 *
 * @remarks
 * Assumes a non-empty array - for an empty one it returns `undefined`
 * typed as `T`.
 */
export function lastOf<T>(arr: T[]) {
  return arr.at(-1) as T;
}

/**
 * Splits an array into chunks of a specified size and returns a generator that yields each chunk.
 *
 * @example
 * ```typescript
 * [...chunk([1, 2, 3, 4, 5], 2)]; // [[1, 2], [3, 4], [5]]
 * ```
 *
 * @throws If the `size` parameter is not a safe integer greater than or equal to 1.
 */
export function* chunk<T>(arr: T[], size: number): Generator<T[]> {
  if (!Number.isSafeInteger(size) || size < 1) {
    throw new Error('size must be an integer >= 1');
  }

  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

/**
 * Returns whether a given collection is empty.
 */
export function isEmpty<T, U extends object>(
  x: ArrayLike<T> | Set<T> | Map<U, T>
): boolean {
  return 'length' in x ? x.length < 1 : x.size < 1;
}

/**
 * Ensures the given value is wrapped in an array. If the value is already an array, it is returned as-is. If the value is undefined, an empty array is returned.
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
 * Splits an array into two based on a predicate function, returning a tuple of [truthy, falsy] arrays.
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
