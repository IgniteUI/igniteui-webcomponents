import {
  CalendarDay,
  CalendarRangeParams,
  DayParameter,
  daysInWeek,
  toCalendarDay,
} from './model.js';
import { DateRangeDescriptor, DateRangeType, WeekDays } from './types.js';
import {
  asNumber,
  findElementFromEventPath,
  first,
  last,
  modulo,
} from '../common/util.js';

/* Constants */

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;

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

export function dateFromISOString(value: string | null) {
  return value ? new Date(value) : null;
}

export function datesFromISOStrings(value: string | null) {
  return value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
        .map((v) => new Date(v))
    : null;
}

/**
 * Returns the value of the selected/activated element (day/month/year) in the calendar view.
 *
 */
export function getViewElement(event: Event) {
  const element = findElementFromEventPath<HTMLElement>(`[data-value]`, event);
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
