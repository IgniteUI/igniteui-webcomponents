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
