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

/**
 * Parse the passed `value` as a number or return the `fallback` if it can't be done.
 *
 * @example
 * ```typescript
 * asNumber('5'); // 5
 * asNumber('3.14'); // 3.14
 * asNumber('five'); // 0
 * asNumber('five', 5); // 5
 * asNumber(undefined, 10); // 10
 * asNumber(null, 10); // 10
 * asNumber(NaN, 10); // 10
 * asNumber(Infinity, 10); // 10
 * asNumber(-Infinity, 10); // 10
 * ```
 */
export function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number.parseFloat(value as string);
  return Number.isNaN(parsed) || !Number.isFinite(parsed) ? fallback : parsed;
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

export function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}
