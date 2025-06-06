import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './calendar.resources.js';

/* blazorSuppress */
export interface IgcDateRangePickerResourceStrings
  extends IgcCalendarResourceStrings {
  separator: string;
  done: string;
  cancel: string;
  last7Days: string;
  last30Days: string;
  currentMonth: string;
  yearToDate: string;
}

export const IgcDateRangePickerResourceStringsEN: IgcDateRangePickerResourceStrings =
  {
    separator: 'to',
    done: 'Done',
    cancel: 'Cancel',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    currentMonth: 'Current month',
    yearToDate: 'Year to date',
    ...IgcCalendarResourceStringEN,
  };
