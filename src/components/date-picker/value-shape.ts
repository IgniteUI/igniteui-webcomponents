import { firstOf } from '#internals/utils/arrays.js';
import type { CalendarSelection } from '../calendar/types.js';

/** The selection properties of the calendar for a value. */
export type CalendarBinding = { value: Date | null; values: Date[] };

/** How a picker maps its value, a date or a date range, to the calendar. Pure: it reads no element. */
export interface PickerValueShape<T> {
  readonly selection: CalendarSelection;

  /** The calendar selection for `value`, with the dates in ascending order. */
  toCalendar(value: T | null): CalendarBinding;

  /** The value for a calendar selection, which comes in ascending order. */
  fromCalendar(dates: Date[]): T | null;

  /** Whether a calendar selection is complete, so that the picker can close. */
  closesOnPick(dates: Date[]): boolean;
}

// One array, so Lit skips the binding on each render.
const noDates: Date[] = [];

export const dateShape: PickerValueShape<Date> = {
  selection: 'single',
  toCalendar: (value) => ({ value, values: noDates }),
  fromCalendar: (dates) => firstOf(dates) ?? null,
  closesOnPick: () => true,
};
