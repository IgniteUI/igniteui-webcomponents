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

export interface IgcCalendarEventMap {
  igcChange: CustomEvent<Date | Date[]>;
}
