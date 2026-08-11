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

export function isRegExp(value: unknown): value is RegExp {
  return value != null && value.constructor === RegExp;
}

export function isEventListenerObject(x: unknown): x is EventListenerObject {
  return isObject(x) && 'handleEvent' in x;
}

/** Required utility type for specific props */
export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
