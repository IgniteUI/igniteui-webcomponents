import type { DateRangeValue } from '../../components/types.js';
import { isPlainObject, isString } from '../utils/types.js';
import { CalendarDay } from './model.js';

/** Matches a string beginning with a four digit year, which is left to `Date` to parse. */
const ISO_DATE_PATTERN = /^\d{4}/;

/** Matches a time only string - `HH:MM` optionally followed by seconds and milliseconds. */
const TIME_PATTERN = /^\d{2}:\d{2}/;

/**
 * Type guard to check if a value is a valid Date object.
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function getValidDate(date: Date): Date | null {
  return isValidDate(date) ? date : null;
}

export function parseISODate(value: string): Date | null {
  const string = value.trim();

  // ISO date format (YYYY-MM-DD)
  if (ISO_DATE_PATTERN.test(string)) {
    const timeComponent = !string.includes('T') ? 'T00:00:00' : '';
    return getValidDate(new Date(`${string}${timeComponent}`));
  }

  // Time format (HH:MM:SS) - resolved against the current local date
  if (TIME_PATTERN.test(string)) {
    const today = CalendarDay.today;
    const month = `${today.month + 1}`.padStart(2, '0');
    const date = `${today.date}`.padStart(2, '0');

    return getValidDate(new Date(`${today.year}-${month}-${date}T${string}`));
  }

  return null;
}

/**
 * Converts the given value to a Date object.
 *
 * If the value is already a valid Date object, it is returned directly.
 * If the value is a string, it is parsed into a Date object.
 * If the value is null or undefined, null is returned.
 * If the parsing fails, null is returned.
 */
export function convertToDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  return isString(value) ? parseISODate(value) : getValidDate(value);
}

/**
 * Converts a comma-separated string of ISO 8601 dates or an array of Date objects | ISO 8601 strings into
 * an array of Date objects.
 *
 * If the `value` is null or undefined, null is returned.
 * If the `value` is an array of `Date` objects, a filtered array of valid `Date` objects is returned.
 * If the `value` is a string, it is split by commas and each part is parsed into a `Date` object.
 * If the parsing fails for any date, it is skipped.
 */
export function convertToDates(
  value?: (Date | string)[] | string | null
): Date[] | null {
  if (!value) {
    return null;
  }

  const values: Date[] = [];
  const sources = isString(value) ? value.split(',') : value;

  for (const source of sources) {
    const trimmed = isString(source) ? source.trim() : source;
    const date = convertToDate(trimmed);
    if (date) {
      values.push(date);
    }
  }

  return values;
}

/**
 * Converts the given value to a DateRangeValue object.
 *
 * If the value is already a valid DateRangeValue object, it is returned directly.
 * If the value is a string, it is parsed to object and returned if it fields are valid dates.
 * If the value is null or undefined, null is returned.
 * If the parsing fails, null is returned.
 */
export function convertToDateRange(
  value?: DateRangeValue | string | null
): DateRangeValue | null {
  if (!value) {
    return null;
  }

  if (!isString(value)) {
    return value;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!isPlainObject(parsed)) {
    return null;
  }

  const start = convertToDate(parsed.start as Date | string | null);
  const end = convertToDate(parsed.end as Date | string | null);

  return {
    start: start ? CalendarDay.from(start).native : null,
    end: end ? CalendarDay.from(end).native : null,
  };
}

/**
 * Converts a Date object to an ISO 8601 string.
 *
 * If the `value` is a `Date` object, it is converted to an ISO 8601 string.
 * If the `value` is null or undefined, null is returned.
 */
export function getDateFormValue(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
