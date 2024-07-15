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

export function numberInRangeInclusive(
  value: number,
  min: number,
  max: number
) {
  return value >= min && value <= max;
}

/**
 *
 * Returns an element's offset relative to its parent. Similar to element.offsetTop and element.offsetLeft, except the
 * parent doesn't have to be positioned relative or absolute.
 *
 * Work around for the following issues in Chromium based browsers:
 *
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1330819
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1334556
 *
 */
export function getOffset(element: HTMLElement, parent: HTMLElement) {
  const { top, left, bottom, right } = element.getBoundingClientRect();
  const {
    top: pTop,
    left: pLeft,
    bottom: pBottom,
    right: pRight,
  } = parent.getBoundingClientRect();

  return {
    top: Math.round(top - pTop),
    left: Math.round(left - pLeft),
    right: Math.round(right - pRight),
    bottom: Math.round(bottom - pBottom),
  };
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
  const func =
    typeof predicate === 'string'
      ? (e: Element) => e.matches(predicate)
      : (e: Element) => predicate(e);

  return getElementsFromEventPath(event).find(func) as T | undefined;
}

export function groupBy<T>(array: T[], key: keyof T | ((item: T) => any)) {
  const result: Record<string, T[]> = {};
  const _get = typeof key === 'function' ? key : (item: T) => item[key];

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

export function splitToWords(text: string) {
  const input = text.replaceAll(/[^a-zA-Z0-9\s-_]/g, '');
  if (/[\s-_]+/.test(input)) return input.split(/[\s-_]+/);
  return input.split(/(?=[A-Z])+/);
}

export function toKebabCase(text: string): string {
  const input = text.trim();
  return splitToWords(input).join('-').toLocaleLowerCase();
}
