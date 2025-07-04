import { isServer } from 'lit';

export const asPercent = (part: number, whole: number) => (part / whole) * 100;

export const clamp = (number: number, min: number, max: number) =>
  Math.max(min, Math.min(number, max));

export function numberOfDecimals(number: number): number {
  const [_, decimals] = number.toString().split('.');
  return decimals ? decimals.length : 0;
}

export function roundPrecise(number: number, magnitude = 1): number {
  const factor = 10 ** magnitude;
  return Math.round(number * factor) / factor;
}

export function numberInRangeInclusive(
  value: number,
  min: number,
  max: number
) {
  return value >= min && value <= max;
}

export function createCounter() {
  let i = 0;
  return () => {
    i++;
    return i;
  };
}

/**
 * Returns whether an element has a Left-to-Right directionality.
 */
export function isLTR(element: HTMLElement) {
  return element.matches(':dir(ltr)');
}

/**
 * Builds a string from format specifiers and replacement parameters.
 * Will coerce non-string parameters to their string representations.
 *
 * @example
 * ```typescript
 * formatString('{0} says "{1}".', 'John', 'Hello'); // 'John says "Hello".'
 * formatString('{1} is greater than {0}', 0, 1); // '1 is greater than 0'
 * ```
 */
export function formatString(template: string, ...params: unknown[]): string {
  const length = params.length;

  return template.replace(/{(\d+)}/g, (match: string, index: number) =>
    index >= length ? match : `${params[index]}`
  );
}

/**
 * Parse the passed `value` as a number or return the `fallback` if it can't be done.
 *
 * @example
 * ```typescript
 * asNumber('5'); // 5
 * asNumber('3.14'); // 3.14
 * asNumber('five'); // 0
 * asNUmber('five', 5); // 5
 * ```
 */
export function asNumber(value: unknown, fallback = 0) {
  const parsed = Number.parseFloat(value as string);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Returns the value wrapped between the min and max bounds.
 *
 * If the value is greater than max, returns the min and vice-versa.
 * If the value is between the bounds, it is returned unchanged.
 *
 * @example
 * ```typescript
 * wrap(1, 4, 2); // 2
 * wrap(1, 4, 5); // 1
 * wrap(1, 4, -1); // 4
 * ```
 */
export function wrap(min: number, max: number, value: number) {
  if (value < min) {
    return max;
  }
  if (value > max) {
    return min;
  }

  return value;
}

export function isDefined<T = unknown>(value: T) {
  return value !== undefined;
}

export type IterNodesOptions<T = Node> = {
  show?: keyof typeof NodeFilter;
  filter?: (node: T) => boolean;
};

function createNodeFilter<T extends Node>(predicate: (node: T) => boolean) {
  return {
    acceptNode: (node: T): number =>
      !predicate || predicate(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  };
}

export function* iterNodes<T extends Node>(
  root: Node,
  options?: IterNodesOptions<T>
): Generator<T> {
  if (!isDefined(globalThis.document)) {
    return;
  }

  const whatToShow = options?.show
    ? NodeFilter[options.show]
    : NodeFilter.SHOW_ALL;

  const nodeFilter = options?.filter
    ? createNodeFilter(options.filter)
    : undefined;

  const treeWalker = document.createTreeWalker(root, whatToShow, nodeFilter);

  while (treeWalker.nextNode()) {
    yield treeWalker.currentNode as T;
  }
}

export function getRoot(
  element: Element,
  options?: GetRootNodeOptions
): Document | ShadowRoot {
  return element.getRootNode(options) as Document | ShadowRoot;
}

export function getElementByIdFromRoot(root: HTMLElement, id: string) {
  return getRoot(root).getElementById(id);
}

export function isElement(node: unknown): node is Element {
  return node instanceof Node && node.nodeType === Node.ELEMENT_NODE;
}

export function getElementsFromEventPath<T extends Element>(event: Event) {
  return event.composedPath().filter((item) => isElement(item)) as T[];
}

export function findElementFromEventPath<T extends Element>(
  predicate: string | ((element: Element) => boolean),
  event: Event
) {
  const func = isString(predicate)
    ? (e: Element) => e.matches(predicate)
    : (e: Element) => predicate(e);

  return getElementsFromEventPath(event).find(func) as T | undefined;
}

export function groupBy<T>(array: T[], key: keyof T | ((item: T) => any)) {
  const result: Record<string, T[]> = {};
  const _get = isFunction(key) ? key : (item: T) => item[key];

  for (const item of array) {
    const category = _get(item);
    const group = result[category];

    if (Array.isArray(group)) {
      group.push(item);
    } else {
      result[category] = [item];
    }
  }

  return result;
}

export function first<T>(arr: T[]) {
  return arr.at(0) as T;
}

export function last<T>(arr: T[]) {
  return arr.at(-1) as T;
}

export function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}

/**
 * Creates an array of `n` elements from a given iterator.
 *
 */
export function take<T>(iterable: IterableIterator<T>, n: number) {
  const result: T[] = [];
  let i = 0;
  let current = iterable.next();

  while (i < n && !current.done) {
    result.push(current.value);
    current = iterable.next();
    i++;
  }

  return result;
}

/**
 * Splits an array into chunks of length `size` and returns a generator
 * yielding each chunk.
 * The last chunk may contain less than `size` elements.
 *
 * @example
 * ```typescript
 * const arr = [0,1,2,3,4,5,6,7,8,9];
 *
 * Array.from(chunk(arr, 2)) // [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
 * Array.from(chunk(arr, 3)) // [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]
 * Array.from(chunk([], 3)) // []
 * Array.from(chunk(arr, -3)) // Error
 * ```
 */
export function* chunk<T>(arr: T[], size: number) {
  if (size < 1) {
    throw new Error('size must be an integer >= 1');
  }
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

export function splitToWords(text: string) {
  const input = text.replaceAll(/[^a-zA-Z0-9\s-_]/g, '');
  if (/[\s-_]+/.test(input)) return input.split(/[\s-_]+/);
  return input.split(/(?=[A-Z])+/);
}

export function toKebabCase(text: string): string {
  const input = text.trim();
  return splitToWords(input).join('-').toLocaleLowerCase();
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

export function isEventListenerObject(x: unknown): x is EventListenerObject {
  return isObject(x) && 'handleEvent' in x;
}

export function addWeakEventListener(
  element: Element,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
): void {
  const weakRef = new WeakRef(listener);
  const wrapped = (evt: Event) => {
    const handler = weakRef.deref();

    return isEventListenerObject(handler)
      ? handler.handleEvent(evt)
      : handler?.(evt);
  };

  element.addEventListener(event, wrapped, options);
}

type EventTypeOf<T extends keyof HTMLElementEventMap | keyof WindowEventMap> =
  (HTMLElementEventMap & WindowEventMap)[T];

/**
 * Safely adds an event listener to an HTMLElement, automatically handling
 * server-side rendering environments by doing nothing if `isServer` is true.
 * This function also correctly binds the `handler`'s `this` context to the `target` element
 * and ensures proper event type inference.
 */
export function addSafeEventListener<
  E extends keyof HTMLElementEventMap | keyof WindowEventMap,
>(
  target: HTMLElement,
  eventName: E,
  handler: (event: EventTypeOf<E>) => unknown,
  options?: boolean | AddEventListenerOptions
): void {
  if (isServer) {
    return;
  }

  const boundHandler = (event: Event) =>
    handler.call(target, event as EventTypeOf<E>);

  target.addEventListener(eventName, boundHandler, options);
}

/**
 * Returns whether a given collection is empty.
 */
export function isEmpty<T, U extends object>(
  x: ArrayLike<T> | Set<T> | Map<U, T>
): boolean {
  return 'length' in x ? x.length < 1 : x.size < 1;
}

export function asArray<T>(value?: T | T[]): T[] {
  if (!isDefined(value)) return [];
  return Array.isArray(value) ? value : [value];
}

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

/** Returns the center x/y coordinate of a given element. */
export function getCenterPoint(element: Element) {
  const { left, top, width, height } = element.getBoundingClientRect();

  return {
    x: left + width * 0.5,
    y: top + height * 0.5,
  };
}

export function roundByDPR(value: number): number {
  const dpr = globalThis.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

export function scrollIntoView(
  element?: HTMLElement,
  config?: ScrollIntoViewOptions
): void {
  if (!element) {
    return;
  }

  element.scrollIntoView(
    Object.assign(
      {
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      },
      config
    )
  );
}

export function isRegExp(value: unknown): value is RegExp {
  return value != null && value.constructor === RegExp;
}

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

/** Required utility type for specific props */
export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
