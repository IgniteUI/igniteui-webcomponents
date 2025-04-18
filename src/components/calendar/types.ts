export enum DateRangeType {
  After = 0,
  Before = 1,
  Between = 2,
  Specific = 3,
  Weekdays = 4,
  Weekends = 5,
}

/* creationType: DateRangeDescriptor */
export interface DateRangeDescriptor {
  type: DateRangeType;
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
