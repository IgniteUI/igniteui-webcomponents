/** Returns whether the value is not `undefined`. `null` counts as defined. */
export function isDefined<T = unknown>(value: T) {
  return value !== undefined;
}

export function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

/**
 * Returns whether the value is a plain object from `{}`, `new Object()` or
 * `Object.create(null)`.
 */
export function isPlainObject(
  value: unknown
): value is Record<PropertyKey, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;

  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;

  return hasObjectPrototype
    ? Object.prototype.toString.call(value) === '[object Object]'
    : false;
}

/**
 * Resolves a value that the caller gives either directly or as a factory.
 *
 * @example
 * ```typescript
 * resolveValue(element); // element
 * resolveValue(() => element); // element
 * ```
 */
export function resolveValue<T>(source: T | (() => T)): T {
  return isFunction(source) ? (source as () => T)() : source;
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isEventListenerObject(x: unknown): x is EventListenerObject {
  return isObject(x) && 'handleEvent' in x;
}

/** Makes the given keys `K` of the type `T` required. */
export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
