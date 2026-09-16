export enum DateRangeType {
  After = 0,
  Before = 1,
  Between = 2,
  Specific = 3,
  Weekdays = 4,
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

export type WeekDays =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';
export type CalendarActiveView = 'days' | 'months' | 'years';
export type CalendarHeaderOrientation = 'horizontal' | 'vertical';
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
