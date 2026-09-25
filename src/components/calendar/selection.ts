import { type CalendarDay, calendarRange } from '#internals/date/model.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { isDateInRanges } from './helpers.js';
import type { CalendarSelection, DateRangeDescriptor } from './types.js';

/** `value` holds a `single` selection, `values` a `multiple` or a `range` one. */
export interface CalendarSelectionState {
  value: CalendarDay | null;
  values: CalendarDay[];
}

export interface CalendarSelectionOptions {
  selection: CalendarSelection;
  disabledDates: DateRangeDescriptor[];
}

/**
 * Applies the activation of `day` to `state` and returns the resulting selection, or
 * `null` when the activation changes nothing - a disabled date, or the already selected
 * date of a `single` selection.
 *
 * @remarks
 * Both the calendar and a stand-alone days view select through this, so the two cannot
 * disagree on what activating a date means.
 */
export function selectDate(
  state: CalendarSelectionState,
  day: CalendarDay,
  { selection, disabledDates }: CalendarSelectionOptions
): CalendarSelectionState | null {
  if (isDateInRanges(day, disabledDates)) {
    return null;
  }

  switch (selection) {
    case 'single':
      return state.value?.equalTo(day)
        ? null
        : { value: day, values: state.values };

    case 'multiple':
      return { value: state.value, values: toggleDate(state.values, day) };

    case 'range':
      return {
        value: state.value,
        values: selectRange(state.values, day, disabledDates),
      };
  }
}

/** Adds `day` to `values`, or removes it when it is already selected. */
function toggleDate(values: CalendarDay[], day: CalendarDay): CalendarDay[] {
  const index = values.findIndex((value) => value.equalTo(day));
  const next = index < 0 ? [...values, day] : values.toSpliced(index, 1);

  return next.toSorted((a, b) => a.timestamp - b.timestamp);
}

/** Expands the range between the started selection and `day` into every day it covers. */
function selectRange(
  values: CalendarDay[],
  day: CalendarDay,
  disabledDates: DateRangeDescriptor[]
): CalendarDay[] {
  // Start a new range selection
  if (values.length !== 1) {
    return [day];
  }

  const rangeStart = firstOf(values);

  // Activating the start of the range again clears it
  if (rangeStart.equalTo(day)) {
    return [];
  }

  const [start, end] = rangeStart.greaterThan(day)
    ? [day, rangeStart]
    : [rangeStart, day];

  // `calendarRange` stops short of its end date
  const range = Array.from(calendarRange({ start, end }));
  range.push(lastOf(range).add('day', 1));

  return range.filter((date) => !isDateInRanges(date, disabledDates));
}
