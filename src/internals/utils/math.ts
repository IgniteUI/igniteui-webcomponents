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

  // Exponential notation, for example `1.5e-7`: 1 mantissa decimal plus 7
  // exponent places.
  const [mantissa, exponent] = number.toString().split('e-');
  const decimals = mantissa.split('.')[1]?.length ?? 0;

  return exponent ? decimals + Number(exponent) : decimals;
}

/**
 * Rounds a number to the given order of magnitude (number of decimal places).
 *
 * @remarks
 * Shifts the exponent instead of multiplying, so a binary floating-point error
 * does not round a half down.
 * Negative magnitudes are treated as a no-op.
 *
 * @example
 * ```typescript
 * roundPrecise(3.14159, 2); // 3.14
 * roundPrecise(1.005, 2); // 1.01
 * ```
 */
export function roundPrecise(number: number, magnitude = 1): number {
  if (
    !Number.isFinite(number) ||
    (Number.isInteger(number) && magnitude >= 0)
  ) {
    return number;
  }

  return shiftDecimals(
    Math.round(shiftDecimals(number, magnitude)),
    -magnitude
  );
}

/** Moves the decimal point of `number` by `places`, through its exponent. */
function shiftDecimals(number: number, places: number): number {
  const [mantissa, exponent] = number.toString().split('e');
  return asNumber(`${mantissa}e${asNumber(exponent) + places}`);
}

/** Returns whether the value lies between the min and max bounds. */
export function numberInRangeInclusive(
  value: number,
  min: number,
  max: number
) {
  return value >= min && value <= max;
}

/**
 * Returns `value` as a number, or the `fallback` when the parse fails.
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
  let parsed: number;

  try {
    parsed = Number.parseFloat(value as string);
  } catch {
    // A symbol, or an object with no string conversion.
    return fallback;
  }

  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Returns the value wrapped between the min and max bounds.
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

/**
 * Returns the Euclidean modulo of `n` and `d`.
 *
 * @remarks
 * Unlike `%`, the result always has the sign of the divisor.
 */
export function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}
