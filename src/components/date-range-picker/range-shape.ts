import { convertToDateRange } from '#internals/date/converters.js';
import { CalendarDay } from '#internals/date/model.js';
import {
  FormValueDateRangeTransformers,
  type FormValueTransformers,
} from '#internals/mixins/forms/form-transformers.js';
import { firstOf, isEmpty, lastOf } from '#internals/utils/arrays.js';
import type { PickerValueShape } from '../date-picker/value-shape.js';
import type { DateRangeValue } from '../types.js';

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is { start: Date; end: Date } {
  return value != null && value.start != null && value.end != null;
}

/**
 * The one form of a range: `null` without dates, else the ends in order of time.
 * A range already in this form is returned as it is.
 */
export function normalizeRange(
  value: DateRangeValue | null
): DateRangeValue | null {
  const start = value?.start ?? null;
  const end = value?.end ?? null;

  if (!(start || end)) {
    return null;
  }

  if (start && end && start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }

  return value?.start === start && value.end === end ? value : { start, end };
}

function toNormalizedRange(
  value: DateRangeValue | string | null
): DateRangeValue | null {
  return normalizeRange(convertToDateRange(value));
}

/** The form value transformers of the range picker, which normalize each write. */
export const rangeTransformers: Partial<
  FormValueTransformers<DateRangeValue | null>
> = {
  ...FormValueDateRangeTransformers,
  setValue: toNormalizedRange,
  setDefaultValue: toNormalizedRange,
};

/** The calendar dates of a range: both ends, one date for a range in one day, the defined end, or none. */
function rangeDates(value: DateRangeValue | null): Date[] {
  if (isCompleteDateRange(value)) {
    return CalendarDay.compare(value.start, value.end) === 0
      ? [value.start]
      : [value.start, value.end];
  }

  const first = value?.start ?? value?.end;
  return first ? [first] : [];
}

export const rangeShape: PickerValueShape<DateRangeValue> = {
  selection: 'range',
  toCalendar: (value) => ({
    value: null,
    values: rangeDates(normalizeRange(value)),
  }),
  fromCalendar: (dates) =>
    isEmpty(dates) ? null : { start: firstOf(dates), end: lastOf(dates) },
  // The first pick gives one date, the second every date of the range, and a pick of the start again none.
  closesOnPick: (dates) => dates.length > 1,
};
