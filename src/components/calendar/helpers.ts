import {
  asNumber,
  findElementFromEventPath,
  first,
  isString,
  last,
  modulo,
} from '../common/util.js';
import {
  CalendarDay,
  type CalendarRangeParams,
  type DayParameter,
  daysInWeek,
  toCalendarDay,
} from './model.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  type WeekDays,
} from './types.js';

/* Constants */

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;
export const YEARS_PER_PAGE = 15;

const DaysMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/* Converter functions */

/**
 * Converts the given value to a Date object.
 *
 * If the value is already a valid Date object, it is returned directly.
 * If the value is a string, it is parsed into a Date object.
 * If the value is null or undefined, null is returned.
 * If the parsing fails, null is returned.
 *
 * @param value The value to convert.
 * @returns The converted Date object, or null if the conversion fails.
 *
 * @example
 * ```typescript
 * const dateString = '2023-11-11T12:34:56Z';
 * const dateObject = new Date('2023-11-11T12:34:56Z');
 * const nullValue = null;

 * const result1 = convertToDate(dateString); // Date object
 * const result2 = convertToDate(dateObject); // Date object
 * const result3 = convertToDate(nullValue); // null
 * const result4 = convertToDate('invalid-date-string'); // null
 * ```
 */
export function convertToDate(value: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  const converted = isString(value) ? new Date(value) : value;
  return Number.isNaN(converted.valueOf()) ? null : converted;
}

/**
 * Converts a Date object to an ISO 8601 string.
 *
 * If the `value` is a `Date` object, it is converted to an ISO 8601 string.
 * If the `value` is null or undefined, null is returned.
 *
 * @param value The Date object to convert.
 * @returns The ISO 8601 string representation of the Date object, or null if the value is null or undefined.
 *
 * @example
 * ```typescript
 * const dateObject = new Date('2023-11-11T12:34:56Z');
 * const nullValue = null;

 * const result1 = getDateFormValue(dateObject); // "2023-11-11T12:34:56.000Z"
 * const result2 = getDateFormValue(nullValue); // null
 * ```
 */
export function getDateFormValue(value: Date | null) {
  return value ? value.toISOString() : null;
}

/**
 * Converts an array of Date objects or a comma-separated string of ISO 8601 dates into an array of Date objects.

 * If the `value` is an array of `Date` objects, it is returned directly.
 * If the `value` is a string, it is split by commas and each part is parsed into a `Date` object.
 * If the `value` is null or undefined, null is returned.
 * If the parsing fails for any date, it is skipped.

 * @param value The value to convert.
 * @returns An array of Date objects, or null if the conversion fails for all values.

 * @example
 * ```typescript
 * const dateStrings = '2023-11-11T12:34:56Z,2023-12-12T13:45:00Z';
 * const dateObjects = [new Date('2023-11-11T12:34:56Z'), new Date('2023-12-12T13:45:00Z')];
 * const nullValue = null;

 * const result1 = convertToDates(dateStrings); // [Date, Date]
 * const result2 = convertToDates(dateObjects); // [Date, Date]
 * const result3 = convertToDates(nullValue); // null
 * const result4 = convertToDates('invalid-date-string,2023-11-11T12:34:56Z'); // [Date]
 * ```
 */
export function convertToDates(value: Date[] | string | null) {
  if (!value) {
    return null;
  }

  const values: Date[] = [];
  const iterator = isString(value) ? value.split(',') : value;

  for (const each of iterator) {
    const date = convertToDate(isString(each) ? each.trim() : each);
    if (date) {
      values.push(date);
    }
  }

  return values;
}

/**
 * Returns the value of the selected/activated element (day/month/year) in the calendar view.
 *
 */
export function getViewElement(event: Event) {
  const element = findElementFromEventPath<HTMLElement>('[data-value]', event);
  return element ? asNumber(element.dataset.value, -1) : -1;
}

export function getWeekDayNumber(value: WeekDays) {
  return DaysMap[value];
}

export function areSameMonth(first: DayParameter, second: DayParameter) {
  const [a, b] = [toCalendarDay(first), toCalendarDay(second)];
  return a.year === b.year && a.month === b.month;
}

export function isNextMonth(target: DayParameter, origin: DayParameter) {
  const [a, b] = [toCalendarDay(target), toCalendarDay(origin)];
  return a.year === b.year ? a.month > b.month : a.year > b.year;
}

export function isPreviousMonth(target: DayParameter, origin: DayParameter) {
  const [a, b] = [toCalendarDay(target), toCalendarDay(origin)];
  return a.year === b.year ? a.month < b.month : a.year < b.year;
}

/**
 * Returns a generator yielding day values between `start` and `end` (non-inclusive)
 * by a given `unit` as a step.
 *
 * @remarks
 * By default, `unit` is set to 'day'.
 */
export function* calendarRange(options: CalendarRangeParams) {
  let low = toCalendarDay(options.start);
  const unit = options.unit ?? 'day';
  const high =
    typeof options.end === 'number'
      ? low.add(unit, options.end)
      : toCalendarDay(options.end);

  const reverse = high.lessThan(low);
  const step = reverse ? -1 : 1;

  while (!reverse ? low.lessThan(high) : low.greaterThan(high)) {
    yield low;
    low = low.add(unit, step);
  }
}

export function* generateMonth(value: DayParameter, firstWeekDay: number) {
  const { year, month } = toCalendarDay(value);

  const start = new CalendarDay({ year, month });
  const offset = modulo(start.day - firstWeekDay, daysInWeek);
  yield* calendarRange({
    start: start.add('day', -offset),
    end: 42,
  });
}

export function getYearRange(current: DayParameter, range: number) {
  const year = toCalendarDay(current).year;
  const start = Math.floor(year / range) * range;
  return { start, end: start + range - 1 };
}

export function isDateInRanges(
  date: DayParameter,
  ranges: DateRangeDescriptor[]
) {
  const value = toCalendarDay(date);

  return ranges.some((range) => {
    const days = (range.dateRange ?? []).map((day) => toCalendarDay(day));

    switch (range.type) {
      case DateRangeType.After:
        return value.greaterThan(first(days));

      case DateRangeType.Before:
        return value.lessThan(first(days));

      case DateRangeType.Between: {
        const min = Math.min(first(days).timestamp, last(days).timestamp);
        const max = Math.max(first(days).timestamp, last(days).timestamp);
        return value.timestamp >= min && value.timestamp <= max;
      }

      case DateRangeType.Specific:
        return days.some((day) => day.equalTo(value));

      case DateRangeType.Weekdays:
        return !value.weekend;

      case DateRangeType.Weekends:
        return value.weekend;

      default:
        return false;
    }
  });
}
