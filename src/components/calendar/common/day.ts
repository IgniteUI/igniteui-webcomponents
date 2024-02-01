import { DateRangeDescriptor, DateRangeType } from './calendar.model.js';

type CalendarDayParams = {
  year: number;
  month: number;
  date?: number;
};

type DayInterval = 'year' | 'quarter' | 'month' | 'week' | 'day';

export const daysInWeek = 7;
export const daysInYear = 365.2425;
export const maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1000;
export const minTime = -maxTime;
export const millisecondsInWeek = 604800000;
export const millisecondsInDay = 86400000;
export const millisecondsInMinute = 60000;
export const millisecondsInHour = 3600000;
export const millisecondsInSecond = 1000;
export const minutesInYear = 525600;
export const minutesInMonth = 43200;
export const minutesInDay = 1440;
export const minutesInHour = 60;
export const monthsInQuarter = 3;
export const monthsInYear = 12;
export const quartersInYear = 4;
export const secondsInHour = 3600;
export const secondsInMinute = 60;
export const secondsInDay = secondsInHour * 24;
export const secondsInWeek = secondsInDay * 7;
export const secondsInYear = secondsInDay * daysInYear;
export const secondsInMonth = secondsInYear / 12;
export const secondsInQuarter = secondsInMonth * 3;

export function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}

function toCalendarDay(date: CalendarDay | Date) {
  return date instanceof Date ? CalendarDay.from(date) : date;
}

export class CalendarDay {
  private _date!: Date;

  /** Constructs and returns the current day. */
  public static today() {
    return CalendarDay.from(new Date());
  }

  /** Constructs a new CalendarDay instance from a Date object. */
  public static from(date: Date) {
    return new CalendarDay({
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate(),
    });
  }

  constructor(args: CalendarDayParams) {
    this._date = new Date(args.year, args.month, args.date ?? 1);
  }

  /** Returns a copy of this instance. */
  public clone() {
    return CalendarDay.from(this._date);
  }

  public add(unit: DayInterval, value: number) {
    const result = this.clone();
    switch (unit) {
      case 'year':
        result._date.setFullYear(result.year + value);
        return result;
      case 'quarter':
        result._date.setMonth(result.month + 3 * value);
        return result;
      case 'month':
        result._date.setMonth(result.month + value);
        return result;
      case 'week':
        result._date.setDate(result.date + 7 * value);
        return result;
      case 'day':
        result._date.setDate(result.date + value);
        return result;
      default:
        throw new Error('Invalid interval');
    }
  }

  /** Returns the day of the week (Sunday = 0). */
  public get day() {
    return this._date.getDay();
  }

  /** Returns the full year. */
  public get year() {
    return this._date.getFullYear();
  }

  /** Returns the month. */
  public get month() {
    return this._date.getMonth();
  }

  /** Returns the date */
  public get date() {
    return this._date.getDate();
  }

  /** Returns the timestamp since epoch in milliseconds. */
  public get timestamp() {
    return this._date.getTime();
  }

  /** Returns the current week number. */
  public get week() {
    const startOfYear = new CalendarDay({ year: this.year, month: 0 })
      .timestamp;
    const dayOfYear = (this.timestamp - startOfYear) / millisecondsInDay;
    return Math.ceil(dayOfYear / daysInWeek);
  }

  /** Returns the underlying native date instance. */
  public get native() {
    return new Date(this._date);
  }

  public get isWeekend() {
    return this.day < 1 || this.day > 5;
  }

  public equalTo(value: CalendarDay | Date) {
    return this.timestamp === toCalendarDay(value).timestamp;
  }

  public greaterThan(value: CalendarDay | Date) {
    return this.timestamp > toCalendarDay(value).timestamp;
  }

  public lessThan(value: CalendarDay | Date) {
    return this.timestamp < toCalendarDay(value).timestamp;
  }

  public toString() {
    return this._date.toString();
  }
}

/**
 * Returns whether the passed `date` is today.
 */
export function isToday(date: CalendarDay | Date) {
  return toCalendarDay(date).equalTo(CalendarDay.today());
}

/**
 * Given a `date` returns the number of days for the current month.
 */
export function daysInMonth(date: CalendarDay | Date) {
  const { year, month } = toCalendarDay(date);
  return new CalendarDay({ year, month: month + 1, date: 0 }).date;
}

/**
 * Given a `date` returns the day of the week for the first day of the
 * current month.
 */
export function firstDayOfWeek(date: CalendarDay | Date) {
  const { year, month } = toCalendarDay(date);
  return new CalendarDay({ year, month, date: 1 }).day;
}

/**
 * Given a `date` returns the day of the week for the first day of the
 * current month and the total numbers of days for the current month.
 */
export function getDatesFor(date: CalendarDay | Date) {
  const value = toCalendarDay(date);
  return {
    firstDay: firstDayOfWeek(value),
    days: daysInMonth(value),
  };
}

/**
 * Returns a generator yielding days between `start` and `end` (non-inclusive).
 */
export function* dayRange(
  start: CalendarDay | Date,
  end: CalendarDay | Date | number
) {
  let low = toCalendarDay(start);
  const high =
    typeof end === 'number' ? low.add('day', end) : toCalendarDay(end);

  const reverse = high.lessThan(low);

  while (!reverse ? low.lessThan(high) : low.greaterThan(high)) {
    yield low;
    low = low.add('day', reverse ? -1 : 1);
  }
}

export function* generateFullMonth(
  value: CalendarDay | Date,
  firstWeekDay: number
) {
  const { year, month } = toCalendarDay(value);

  let start = new CalendarDay({ year, month });
  const offset = modulo(start.day - firstWeekDay, daysInWeek);

  start = start.add('day', -offset);

  for (let i = 0; i < 42; i++) {
    yield start;
    start = start.add('day', 1);
  }
}

export function* getCalendarFor(
  value: CalendarDay | Date,
  firstWeekDay: number
) {
  const dates = Array.from(generateFullMonth(value, firstWeekDay));

  for (let i = 0; i < dates.length; i += daysInWeek) {
    yield dates.slice(i, i + daysInWeek);
  }
}

export function* chunk<T>(arr: T[], size: number) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

export function isDateInRanges(
  date: CalendarDay | Date,
  ranges: DateRangeDescriptor[]
) {
  const value = toCalendarDay(date);

  for (const range of ranges) {
    const days = (range.dateRange ?? []).map((day) => toCalendarDay(day));

    switch (range.type) {
      case DateRangeType.After:
        return value.greaterThan(days[0]);

      case DateRangeType.Before:
        return value.lessThan(days[0]);

      case DateRangeType.Between: {
        const min = Math.min(days[0].timestamp, days[1].timestamp);
        const max = Math.max(days[0].timestamp, days[1].timestamp);
        return value.timestamp >= min && value.timestamp <= max;
      }

      case DateRangeType.Specific:
        return days.some((day) => day.equalTo(value));

      case DateRangeType.Weekdays:
        return !value.isWeekend;

      case DateRangeType.Weekends:
        return value.isWeekend;

      default:
        return false;
    }
  }

  return false;
}
