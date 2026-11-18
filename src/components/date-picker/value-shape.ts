import {
  FormValueDateTimeTransformers,
  type FormValueTransformers,
} from '#internals/mixins/forms/form-transformers.js';
import { firstOf } from '#internals/utils/arrays.js';
import type { CalendarSelection } from '../calendar/types.js';

/**
 * What a picker needs to know about the type of its value: a single date or a date range.
 * A shape is pure. It does not read the picker, the editors or the calendar.
 */
export interface PickerValueShape<T> {
  /** The selection mode of the calendar for this type of value. */
  readonly selection: CalendarSelection;

  /** The form value transformers of the picker. A value write and a default write run `normalize`. */
  readonly transformers: Partial<FormValueTransformers<T | null>>;

  /** The one form of `value` that the picker stores and reports. */
  normalize(value: T | null): T | null;

  /** The first defined date of `value`, which the calendar brings into view. */
  first(value: T | null): Date | null;

  /** The dates that the calendar selects for `value`, in ascending order. */
  toCalendar(value: T | null): Date[];

  /** The value for a selection of the calendar, which gives its dates in ascending order. */
  fromCalendar(dates: Date[]): T | null;

  /** Whether a selection of the calendar is complete, so that the picker can close. */
  closesOnPick(dates: Date[]): boolean;

  /** Whether `value` has every date it can hold. */
  isComplete(value: T | null): boolean;

  /** `value` as text: each date through `formatDate`, joined by `separator`. */
  format(
    value: T,
    formatDate: (date: Date) => string,
    separator: string
  ): string;
}

/** The value shape of the date picker: one date, which a calendar pick completes. */
export const dateShape: PickerValueShape<Date> = {
  selection: 'single',
  transformers: FormValueDateTimeTransformers,
  normalize: (value) => value,
  first: (value) => value,
  toCalendar: (value) => (value ? [value] : []),
  fromCalendar: (dates) => firstOf(dates) ?? null,
  closesOnPick: () => true,
  isComplete: (value) => value !== null,
  format: (value, formatDate) => formatDate(value),
};
