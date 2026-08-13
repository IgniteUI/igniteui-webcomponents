import type { DateRangeValue } from '../../components/types.js';
import { isPlainObject, isString } from '../utils/types.js';
import { CalendarDay } from './model.js';

/** Matches a string beginning with a four digit year, which is left to `Date` to parse. */
const ISO_DATE_PATTERN = /^\d{4}/;

/** Matches a time only string - `HH:MM` optionally followed by seconds and milliseconds. */
const TIME_PATTERN = /^\d{2}:\d{2}/;

/** Whether `value` is a `Date` holding a valid time. */
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

/** Converts `value` to a `Date`, or to `null` when it is empty or cannot be parsed. */
export function convertToDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  return isString(value) ? parseISODate(value) : getValidDate(value);
}

/**
 * Converts a comma-separated string of ISO 8601 dates, or an array of dates and ISO 8601
 * strings, into an array of `Date` objects, dropping the ones which cannot be parsed.
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
 * Converts `value` to a `DateRangeValue`, parsing a string as JSON and truncating the
 * time of both endpoints. Malformed input converts to `null` rather than throwing, since
 * this runs as an attribute converter.
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

/** Converts a `Date` to an ISO 8601 string. */
export function getDateFormValue(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
