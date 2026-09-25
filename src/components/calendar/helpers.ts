import { getDateFormatter } from 'igniteui-i18n-core';
import {
  CalendarDay,
  calendarRange,
  DAYS_IN_WEEK,
  type DayParameter,
  toCalendarDay,
} from '#internals/date/model.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { asNumber, modulo } from '#internals/utils/math.js';
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
const WEEK_DAYS_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
} as const;
const WEEK_DAY_NAMES = Object.keys(WEEK_DAYS_MAP) as WeekDays[];

/** The value of the activated day/month/year element of a calendar view, or -1. */
export function getViewElement(event: Event): number {
  const element = getElementFromPath<HTMLElement>('[data-value]', event);
  return element ? asNumber(element.dataset.value, -1) : -1;
}

export function getWeekDayNumber(value: WeekDays): number {
  return WEEK_DAYS_MAP[value];
}

/**
 * The first day of the week of `locale`, as reported by `Intl.Locale.prototype.getWeekInfo()`.
 *
 * @remarks
 * igniteui-i18n-core falls back to Monday in engines without the API. This overrides
 * that with `sunday`, the documented default of the components.
 */
export function getLocaleWeekStart(locale: string): WeekDays {
  if (!('getWeekInfo' in Intl.Locale.prototype)) {
    return 'sunday';
  }

  // igniteui-i18n-core numbers the days 1 (Monday) - 7 (Sunday)
  return WEEK_DAY_NAMES[getDateFormatter().getFirstDayOfWeek(locale) % 7];
}

/**
 * Whether the `first` field precedes the `second` one in the formatted `parts`.
 * A missing field counts as last.
 */
export function isDatePartBefore(
  parts: Intl.DateTimeFormatPart[],
  first: Intl.DateTimeFormatPartTypes,
  second: Intl.DateTimeFormatPartTypes
): boolean {
  const indexOf = (type: Intl.DateTimeFormatPartTypes) => {
    const index = parts.findIndex((part) => part.type === type);
    return index < 0 ? Number.POSITIVE_INFINITY : index;
  };

  return indexOf(first) < indexOf(second);
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

/** Yields the days rendered by a single days view - six weeks starting on `firstWeekDay`. */
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
    const firstDay = firstOf(days);

    switch (range.type) {
      case DateRangeType.After:
        return value.greaterThan(firstDay);

      case DateRangeType.Before:
        return value.lessThan(firstDay);

      case DateRangeType.Between: {
        const lastDay = lastOf(days);
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
