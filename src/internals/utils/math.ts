/** Returns `part` as a percentage of `whole`. */
export function asPercent(part: number, whole: number): number {
  return (part / whole) * 100;
}

/** Clamps the given number between the min and max bounds (inclusive). */
export function clamp(number: number, min: number, max: number): number {
  return Math.max(min, Math.min(number, max));
}

/** Returns the number of decimal places of the given number. */
export function numberOfDecimals(number: number): number {
  if (!Number.isFinite(number) || Number.isInteger(number)) {
    return 0;
  }

  // Exponential notation, e.g. `1.5e-7` -> 1 mantissa decimal + 7 exponent places
  const [mantissa, exponent] = number.toString().split('e-');
  const decimals = mantissa.split('.')[1]?.length ?? 0;

  return exponent ? decimals + Number(exponent) : decimals;
}

/**
 * Rounds a number to the given order of magnitude (number of decimal places).
 *
 * @example
 * ```typescript
 * roundPrecise(3.14159, 2); // 3.14
 * ```
 */
export function roundPrecise(number: number, magnitude = 1): number {
  const factor = 10 ** magnitude;
  return Math.round(number * factor) / factor;
}

/** Returns whether the given value lies between the min and max bounds (inclusive). */
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
  return Number.isFinite(parsed) ? parsed : fallback;
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

/** Euclidean modulo — like `%` but the result always has the sign of the divisor. */
export function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}
