export interface PartNameInfo {
  readonly [name: string]: string | boolean | number;
}

export const partNameMap = (partNameInfo: PartNameInfo) => {
  return Object.keys(partNameInfo)
    .filter((key) => partNameInfo[key])
    .join(' ');
};

export const asPercent = (part: number, whole: number) => (part / whole) * 100;

export const clamp = (number: number, min: number, max: number) =>
  Math.max(min, Math.min(number, max));

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
  return function () {
    i++;
    return i;
  };
}

export function isLTR(element: HTMLElement) {
  return getComputedStyle(element).getPropertyValue('direction') === 'ltr';
}

export function extractText<T extends Node>(arr: T[]) {
  return arr.reduce((agg: string[], item: T) => {
    const text = item.textContent?.trim();
    if (text) {
      agg.push(text);
    }
    return agg;
  }, []);
}

/**
 * Builds a string from format specifiers and replacement parameters.
 *
 * @example
 * ```typescript
 * format('{0} says "{1}".', 'John', 'Hello'); // 'John says "Hello".'
 * ```
 */
export function format(template: string, ...params: string[]): string {
  return template.replace(/{(\d+)}/g, function (match: string, index: number) {
    if (index >= params.length) {
      return match;
    }

    const value: string = params[index];
    if (typeof value !== 'number' && !value) {
      return '';
    }
    return value;
  });
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
  const parsed = parseFloat(value as string);
  return isNaN(parsed) ? fallback : parsed;
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
  } else if (value > max) {
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
  const iter = document.createTreeWalker(
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
