import { convertToDateRange } from '#internals/date/converters.js';
import { CalendarDay } from '#internals/date/model.js';
import { FormValueDateRangeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { firstOf, isEmpty, lastOf } from '#internals/utils/arrays.js';
import type { PickerValueShape } from '../date-picker/value-shape.js';
import type { DateRangeValue } from '../types.js';

/** A range with both ends. */
export type CompleteDateRange = { start: Date; end: Date };

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is CompleteDateRange {
  return value != null && value.start != null && value.end != null;
}

/**
 * The one form of a range: `null` when both ends are empty, and the ends in order of time
 * otherwise. A range that is already in this form is returned as it is.
 */
function normalizeRange(value: DateRangeValue | null): DateRangeValue | null {
  const start = value?.start ?? null;
  const end = value?.end ?? null;

  if (!start && !end) {
    return null;
  }

  if (start && end && start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }

  return value!.start === start && value!.end === end ? value : { start, end };
}

function toNormalizedRange(
  value: DateRangeValue | string | null
): DateRangeValue | null {
  return normalizeRange(convertToDateRange(value));
}

/** The value shape of the date range picker: a range, which the second calendar pick completes. */
export const rangeShape: PickerValueShape<DateRangeValue> = {
  selection: 'range',
  transformers: {
    ...FormValueDateRangeTransformers,
    setValue: toNormalizedRange,
    setDefaultValue: toNormalizedRange,
  },
  normalize: normalizeRange,
  first: (value) => value?.start ?? value?.end ?? null,
  toCalendar: (value) => {
    if (isCompleteDateRange(value)) {
      return CalendarDay.compare(value.start, value.end) === 0
        ? [value.start]
        : [value.start, value.end];
    }

    const first = value?.start ?? value?.end;
    return first ? [first] : [];
  },
  // A range cleared in the calendar comes through as no dates at all.
  fromCalendar: (dates) =>
    isEmpty(dates) ? null : { start: firstOf(dates), end: lastOf(dates) },
  // The first pick gives one date and the second gives every date of the range.
  // A pick of the start again clears the range, which gives no dates.
  closesOnPick: (dates) => dates.length > 1,
  isComplete: isCompleteDateRange,
  format: (value, formatDate, separator) =>
    [value.start, value.end]
      .filter((date) => date !== null)
      .map(formatDate)
      .join(` ${separator} `),
};
