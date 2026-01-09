import {
  asNumber,
  findElementFromEventPath,
  first,
  isString,
  last,
  modulo,
} from '../common/util.js';
import type { DateRangeValue } from '../date-range-picker/date-range-picker.js';
import {
  CalendarDay,
  type CalendarRangeParams,
  DAYS_IN_WEEK,
  type DayParameter,
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

const CALENDAR_CELLS = 42; // 6 weeks × 7 days
const ISO_DATE_PATTERN = /^\d{4}/;
const TIME_PATTERN = /^\d{2}/;
const WEEK_DAYS_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/* Converter functions */

export function isValidDate(date: Date): Date | null {
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function parseISODate(string: string): Date | null {
  // ISO date format (YYYY-MM-DD)
  if (ISO_DATE_PATTERN.test(string)) {
    const timeComponent = !string.includes('T') ? 'T00:00:00' : '';
    return isValidDate(new Date(`${string}${timeComponent}`));
  }

  // Time format (HH:MM:SS)
  if (TIME_PATTERN.test(string)) {
    const today = first(new Date().toISOString().split('T'));
    return isValidDate(new Date(`${today}T${string}`));
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

  return isString(value) ? parseISODate(value) : isValidDate(value);
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

  if (isString(value)) {
    const obj = JSON.parse(value);
    const start = convertToDate(obj.start);
    const end = convertToDate(obj.end);
    return {
      start: start ? CalendarDay.from(start).native : null,
      end: end ? CalendarDay.from(end).native : null,
    };
  }
  return value;
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

  return values.length > 0 ? values : null;
}

/**
 * Returns the value of the selected/activated element (day/month/year) in the calendar view.
 */
export function getViewElement(event: Event): number {
  const element = findElementFromEventPath<HTMLElement>('[data-value]', event);
  return element ? asNumber(element.dataset.value, -1) : -1;
}

export function getWeekDayNumber(value: WeekDays): number {
  return WEEK_DAYS_MAP[value];
}

export function areSameMonth(
  first: DayParameter,
  second: DayParameter
): boolean {
  const a = toCalendarDay(first);
  const b = toCalendarDay(second);
  return a.year === b.year && a.month === b.month;
}

export function isNextMonth(
  target: DayParameter,
  origin: DayParameter
): boolean {
  const a = toCalendarDay(target);
  const b = toCalendarDay(origin);
  return a.year === b.year ? a.month > b.month : a.year > b.year;
}

export function isPreviousMonth(
  target: DayParameter,
  origin: DayParameter
): boolean {
  const a = toCalendarDay(target);
  const b = toCalendarDay(origin);
  return a.year === b.year ? a.month < b.month : a.year < b.year;
}

/**
 * Returns a generator yielding day values between `start` and `end` (non-inclusive by default)
 * by a given `unit` as a step.
 * To include the end date set the `inclusive` option to true.
 *
 * @remarks
 * By default, `unit` is set to 'day'.
 */
export function* calendarRange(
  options: CalendarRangeParams
): Generator<CalendarDay, void, unknown> {
  const { start, end, unit = 'day', inclusive = false } = options;

  let currentDate = toCalendarDay(start);
  const endDate =
    typeof end === 'number'
      ? toCalendarDay(start).add(unit, end)
      : toCalendarDay(end);

  const isReversed = endDate.lessThan(currentDate);
  const step = isReversed ? -1 : 1;

  const shouldContinue = () => {
    if (inclusive) {
      return isReversed
        ? currentDate.greaterThanOrEqual(endDate)
        : currentDate.lessThanOrEqual(endDate);
    }
    return isReversed
      ? currentDate.greaterThan(endDate)
      : currentDate.lessThan(endDate);
  };

  while (shouldContinue()) {
    yield currentDate;
    currentDate = currentDate.add(unit, step);
  }
}

export function* generateMonth(
  value: DayParameter,
  firstWeekDay: number
): Generator<CalendarDay, void, unknown> {
  const { year, month } = toCalendarDay(value);

  const start = new CalendarDay({ year, month });
  const offset = modulo(start.day - firstWeekDay, DAYS_IN_WEEK);
  yield* calendarRange({
    start: start.add('day', -offset),
    end: CALENDAR_CELLS,
  });
}

export function getYearRange(
  current: DayParameter,
  range: number
): { start: number; end: number } {
  const year = toCalendarDay(current).year;
  const start = Math.floor(year / range) * range;
  return { start, end: start + range - 1 };
}

export function isDateInRanges(
  date: DayParameter,
  ranges: DateRangeDescriptor[]
): boolean {
  const value = toCalendarDay(date);

  return ranges.some((range) => {
    if (!range.dateRange?.length) {
      return range.type === DateRangeType.Weekdays
        ? !value.weekend
        : range.type === DateRangeType.Weekends
          ? value.weekend
          : false;
    }

    const days = range.dateRange.map((day) => toCalendarDay(day));
    const firstDay = first(days);

    switch (range.type) {
      case DateRangeType.After:
        return value.greaterThan(firstDay);

      case DateRangeType.Before:
        return value.lessThan(firstDay);

      case DateRangeType.Between: {
        const lastDay = last(days);
        const min = Math.min(firstDay.timestamp, lastDay.timestamp);
        const max = Math.max(firstDay.timestamp, lastDay.timestamp);
        return value.timestamp >= min && value.timestamp <= max;
      }

      case DateRangeType.Specific:
        return days.some((day) => day.equalTo(value));

      default:
        return false;
    }
  });
}

export function createDateConstraints(
  min: Date | null,
  max: Date | null,
  disabledDates?: DateRangeDescriptor[]
): DateRangeDescriptor[] | undefined {
  const constraints: DateRangeDescriptor[] = [];

  if (min) {
    constraints.push({
      type: DateRangeType.Before,
      dateRange: [min],
    });
  }

  if (max) {
    constraints.push({
      type: DateRangeType.After,
      dateRange: [max],
    });
  }

  constraints.push(...(disabledDates ?? []));

  return constraints.length > 0 ? constraints : undefined;
}
