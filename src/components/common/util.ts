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
