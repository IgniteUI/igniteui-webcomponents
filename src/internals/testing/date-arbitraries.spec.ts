import { createDate } from '../date/model.js';
import { fc } from './fast-check-setup.spec.js';

/** Dates whose year fits the four positions of a `yyyy` part: 0 to 9999. */
export const fourDigitYearDate = fc.date({
  min: createDate(0),
  max: new Date(createDate(10000).getTime() - 1),
  noInvalidDate: true,
});

/** The local date and time fields of a wall clock, with a zero-based month. */
export type WallClock = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Returns the year of two digits `year`: 0-49 in the 2000s, 50-99 in the 1900s. */
export function pivotTwoDigitYear(year: number): number {
  return year + (year < 50 ? 2000 : 1900);
}

/** Returns the local wall clock of `date`. */
export function toWallClock(date: Date): WallClock {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

function yearOf(format: string, date: Date): number {
  if (format.includes('yyyy')) {
    return date.getFullYear();
  }
  if (format.includes('yy')) {
    return pivotTwoDigitYear(date.getFullYear() % 100);
  }
  return 2000;
}

/**
 * Returns the wall clock that parsing `format` gives for `date`. A field that is not in
 * the format gets the parser default (January 1, 2000, 00:00:00).
 */
export function wallClockOf(format: string, date: Date): WallClock {
  return {
    year: yearOf(format, date),
    month: format.includes('MM') ? date.getMonth() : 0,
    day: format.includes('dd') ? date.getDate() : 1,
    hours: /HH|hh/.test(format) ? date.getHours() : 0,
    minutes: format.includes('mm') ? date.getMinutes() : 0,
    seconds: format.includes('ss') ? date.getSeconds() : 0,
  };
}

/**
 * Returns the {@link wallClockOf} `format` and `date`. Skips the run when that wall clock
 * is in a daylight saving gap of the local time zone, because it cannot round-trip.
 */
export function assumeWallClock(format: string, date: Date): WallClock {
  const clock = wallClockOf(format, date);
  const { year, month, day, hours, minutes, seconds } = clock;
  const actual = toWallClock(
    createDate(year, month, day, hours, minutes, seconds)
  );

  const keys = Object.keys(clock) as Array<keyof WallClock>;

  fc.pre(keys.every((key) => actual[key] === clock[key]));
  return clock;
}
