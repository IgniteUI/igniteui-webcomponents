import type { DateRangeValue } from '../../components/types.js';
import { isPlainObject, isString } from '../utils/types.js';
import { CalendarDay, truncateTime } from './model.js';

/** Matches a string that starts with a four digit year. `Date` parses it. */
const ISO_DATE_PATTERN = /^\d{4}/;

/** Matches a time only string: `HH:MM`, with optional seconds and ms. */
const TIME_PATTERN = /^\d{2}:\d{2}/;

/** Returns whether `value` is a `Date` with a valid time. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function getValidDate(date: Date): Date | null {
  return isValidDate(date) ? date : null;
}

/** Parses an ISO 8601 date, or a time only string against the current date. */
function parseISODate(value: string): Date | null {
  const string = value.trim();

  if (ISO_DATE_PATTERN.test(string)) {
    const timeComponent = !string.includes('T') ? 'T00:00:00' : '';
    return getValidDate(new Date(`${string}${timeComponent}`));
  }

  if (TIME_PATTERN.test(string)) {
    const today = CalendarDay.today;
    const month = `${today.month + 1}`.padStart(2, '0');
    const date = `${today.date}`.padStart(2, '0');

    return getValidDate(new Date(`${today.year}-${month}-${date}T${string}`));
  }

  return null;
}

/** Converts `value` to a `Date`, or `null` when empty or unparsable. */
export function convertToDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  return isString(value) ? parseISODate(value) : getValidDate(value);
}

/**
 * Converts a comma-separated string of ISO 8601 dates, or an array of dates
 * and ISO 8601 strings, into an array of `Date` objects. Unparsable items
 * are dropped.
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
 * Converts `value` to a `DateRangeValue`, parsing a string as JSON and
 * truncating the time of both endpoints.
 *
 * @remarks
 * Malformed input gives `null`, because this runs as an attribute converter.
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

  return { start: truncateTime(start), end: truncateTime(end) };
}

/** Converts a `Date` to an ISO 8601 string. */
export function getDateFormValue(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
