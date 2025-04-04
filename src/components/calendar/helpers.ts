import type {
  FormValueType,
  IgcFormControl,
} from '../common/mixins/forms/types.js';
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

export function isValidDate(date: Date) {
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function parseISODate(string: string) {
  if (/^\d{4}/.test(string)) {
    const time = !string.includes('T') ? 'T00:00:00' : '';
    return isValidDate(new Date(`${string}${time}`));
  }

  if (/^\d{2}/.test(string)) {
    const date = first(new Date().toISOString().split('T'));
    return isValidDate(new Date(`${date}T${string}`));
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
    if (obj.start && obj.end) {
      return {
        start: isValidDate(new Date(obj.start)),
        end: isValidDate(new Date(obj.end)),
      };
    }
  } else {
    return value;
  }
  return null;
}

/**
 * Converts a Date object to an ISO 8601 string.
 *
 * If the `value` is a `Date` object, it is converted to an ISO 8601 string.
 * If the `value` is null or undefined, null is returned.
 */
export function getDateFormValue(value: Date | null) {
  return value ? value.toISOString() : null;
}

/**
 * Converts a DateDateRangeValue object to FormData with
 * start and end Date values as ISO 8601 strings.
 * The keys are prefixed with the host name if it exists
 * and suffixed with 'start' or 'end' accordingly.
 *
 * If the date values are null or undefined, the form data values
 * are empty strings ''.
 */
export function getDateRangeFormValue(
  value: DateRangeValue | null,
  host: IgcFormControl
): FormValueType {
  if (!value?.start && !value?.end) return null;

  const start = value?.start?.toISOString();
  const end = value?.end?.toISOString();

  const fd = new FormData();
  const prefix = host.name ? `${host.name}-` : '';

  if (start) fd.append(`${prefix}start`, start);
  if (end) fd.append(`${prefix}end`, end);

  return fd;
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
export function convertToDates(value?: (Date | string)[] | string | null) {
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
