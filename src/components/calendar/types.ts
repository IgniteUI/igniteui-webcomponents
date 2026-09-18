/**
 * How a {@link DateRangeDescriptor} matches dates against its `dateRange`.
 */
export enum DateRangeType {
  /** Dates after the first date in the range. */
  After = 0,
  /** Dates before the first date in the range. */
  Before = 1,
  /** Dates between the first and last date in the range, inclusive. */
  Between = 2,
  /** Only the dates listed in the range. */
  Specific = 3,
  /** Monday through Friday. The range is ignored. */
  Weekdays = 4,
  /** Saturday and Sunday. The range is ignored. */
  Weekends = 5,
}

/* creationType: DateRangeDescriptor */
/** Describes a set of dates by combining a range type with the dates it applies to. */
export interface DateRangeDescriptor {
  /** The kind of range being described, which determines how {@link DateRangeDescriptor.dateRange} is matched. */
  type: DateRangeType;
  /**
   * The date or dates the descriptor applies to, interpreted according to {@link DateRangeDescriptor.type}.
   * {@link DateRangeType.After} and {@link DateRangeType.Before} use the first date,
   * {@link DateRangeType.Between} uses the first and the last, and
   * {@link DateRangeType.Specific} matches every date listed. Not used by
   * {@link DateRangeType.Weekdays} and {@link DateRangeType.Weekends}.
   */
  dateRange?: Date[];
}

/**
 * Day of the week. Used to set the first day of the week in calendars and date
 * pickers.
 *
 * - `sunday` — Sunday.
 * - `monday` — Monday.
 * - `tuesday` — Tuesday.
 * - `wednesday` — Wednesday.
 * - `thursday` — Thursday.
 * - `friday` — Friday.
 * - `saturday` — Saturday.
 */
export type WeekDays =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/**
 * The view a calendar is currently showing.
 *
 * - `days` — days of a month.
 * - `months` — months of a year.
 * - `years` — a range of years.
 */
export type CalendarActiveView = 'days' | 'months' | 'years';

/**
 * Placement of the calendar header, which shows the selected date.
 *
 * - `horizontal` — header above the calendar body.
 * - `vertical` — header beside the calendar body.
 */
export type CalendarHeaderOrientation = 'horizontal' | 'vertical';

/**
 * Selection mode of a calendar.
 *
 * - `single` — a single date.
 * - `multiple` — any number of individual dates.
 * - `range` — a contiguous range between two dates.
 */
export type CalendarSelection = 'single' | 'multiple' | 'range';

export interface IgcCalendarComponentEventMap {
  igcChange: CustomEvent<Date | Date[]>;
}

/**
 * The events emitted by the individual views of the calendar.
 *
 * @remarks
 * Unlike the calendar itself, a view always changes by a single date.
 */
export interface IgcCalendarViewComponentEventMap {
  igcChange: CustomEvent<Date>;
}
