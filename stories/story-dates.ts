import { guard } from 'lit/directives/guard.js';

/** The value of a Storybook date control: a timestamp, or nothing when it is empty. */
export type DateControlValue = Date | number | string | null | undefined;

export const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const today = startOfDay(new Date());

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

/** The number of days from `start` to `end`. Rounded, because of the daylight saving time. */
export function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / DAY);
}

/** The days from `start` to `end`, both included. */
export function daysOf(start: Date, end: Date): Date[] {
  return Array.from({ length: daysBetween(start, end) + 1 }, (_, i) =>
    addDays(start, i)
  );
}

export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function addWorkingDays(date: Date, days: number): Date {
  let result = date;
  let remaining = days;

  while (remaining > 0) {
    result = addDays(result, 1);
    if (!isWeekend(result)) {
      remaining -= 1;
    }
  }

  return result;
}

/** The first date from `date` on that falls on `weekday` (0 is Sunday). */
export function nextWeekday(date: Date, weekday: number): Date {
  return addDays(date, (weekday - date.getDay() + 7) % 7);
}

/** "Mon, Oct 5". */
export const shortDate: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};

/** "Monday, October 5". */
export const longDate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
};

export function formatDate(date: Date, options = shortDate): string {
  return date.toLocaleDateString('en-US', options);
}

export function toDate(value: DateControlValue): Date | null {
  return value ? new Date(value) : null;
}

/**
 * Binds a date control to a `Date` property. Guarded, because Lit commits a
 * new `Date` on each render, which resets the date that the user picked.
 */
export function dateArg(value: DateControlValue, fallback: Date | null = null) {
  return guard([value], () => toDate(value) ?? fallback);
}
