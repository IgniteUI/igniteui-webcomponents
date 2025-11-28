import { DateRangePickerResourceStringsEN } from 'igniteui-i18n-core';
import { convertToIgcResource } from '../utils.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './calendar.resources.js';

/* blazorSuppress */
export interface IgcDateRangePickerResourceStrings extends IgcCalendarResourceStrings {
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
    ...convertToIgcResource(DateRangePickerResourceStringsEN),
    ...IgcCalendarResourceStringEN,
  };
