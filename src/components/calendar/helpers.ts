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
 * The first day of the week of `locale`. Without `Intl.Locale.prototype.getWeekInfo()`,
 * igniteui-i18n-core returns Monday, so return `sunday`, the documented default.
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

function isDateInRange(
  value: CalendarDay,
  range: DateRangeDescriptor
): boolean {
  // `Weekdays` and `Weekends` ignore `dateRange`.
  if (range.type === DateRangeType.Weekdays) {
    return !value.weekend;
  }

  if (range.type === DateRangeType.Weekends) {
    return value.weekend;
  }

  if (!range.dateRange?.length) {
    return false;
  }

  const first = firstOf(range.dateRange);

  switch (range.type) {
    case DateRangeType.After:
      return value.greaterThan(first);

    case DateRangeType.Before:
      return value.lessThan(first);

    case DateRangeType.Between: {
      const a = toCalendarDay(first).timestamp;
      const b = toCalendarDay(lastOf(range.dateRange)).timestamp;
      return (
        value.timestamp >= Math.min(a, b) && value.timestamp <= Math.max(a, b)
      );
    }

    case DateRangeType.Specific:
      return range.dateRange.some((day) => value.equalTo(day));

    default:
      return false;
  }
}

export function isDateInRanges(
  date: DayParameter,
  ranges: DateRangeDescriptor[]
): boolean {
  const value = toCalendarDay(date);
  return ranges.some((range) => isDateInRange(value, range));
}

/** The labels of the descriptors in `ranges` that match `date`, in order and without duplicates. */
export function getDateRangeLabels(
  date: DayParameter,
  ranges: DateRangeDescriptor[]
): string[] {
  const value = toCalendarDay(date);
  const labels = new Set<string>();

  for (const range of ranges) {
    if (range.label && isDateInRange(value, range)) {
      labels.add(range.label);
    }
  }

  return Array.from(labels);
}

export function createDateConstraints(
  min: Date | null,
  max: Date | null,
  disabledDates?: DateRangeDescriptor[]
): DateRangeDescriptor[] {
  return [
    ...(min ? [{ type: DateRangeType.Before, dateRange: [min] }] : []),
    ...(max ? [{ type: DateRangeType.After, dateRange: [max] }] : []),
    ...(disabledDates ?? []),
  ];
}
