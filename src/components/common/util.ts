export interface PartNameInfo {
  readonly [name: string]: string | boolean | number;
}

export const partNameMap = (partNameInfo: PartNameInfo) => {
  return Object.keys(partNameInfo)
    .filter((key) => partNameInfo[key])
    .join(' ');
};

export function noop() {}

export const asPercent = (part: number, whole: number) => (part / whole) * 100;

export const clamp = (number: number, min: number, max: number) =>
  Math.max(min, Math.min(number, max));

export function numberOfDecimals(number: number): number {
  const decimals = last(number.toString().split('.'));
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

export function sameObject(a: object, b: object) {
  return JSON.stringify(a) === JSON.stringify(b);
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

export function* iterNodes<T = Node>(
  root: Node,
  whatToShow?: keyof typeof NodeFilter,
  filter?: (node: T) => boolean
): Generator<T> {
  if (!isDefined(globalThis.document)) {
    return;
  }

  const iter = globalThis.document.createTreeWalker(
    root,
    NodeFilter[whatToShow ?? 'SHOW_ALL']
  );

  let node = iter.nextNode() as T;

  while (node) {
    if (filter) {
      if (filter(node)) {
        yield node;
      }
    } else {
      yield node;
    }

    node = iter.nextNode() as T;
  }
}

export function getElementByIdFromRoot(root: HTMLElement, id: string) {
  return (root.getRootNode() as Document | ShadowRoot).getElementById(id);
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

/**
 * Returns whether a given collection has at least one member.
 */
export function isEmpty<T, U extends string>(
  x: ArrayLike<T> | Set<T> | Map<U, T>
): boolean {
  return 'length' in x ? x.length < 1 : x.size < 1;
}

export function asArray<T>(value?: T | T[]): T[] {
  if (!isDefined(value)) return [];
  return Array.isArray(value) ? value : [value];
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
