import { DateRangePickerResourceStringsEN } from 'igniteui-i18n-core/i18n/EN';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './calendar.resources.js';
import { i18n } from './i18n.js';

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
    ...i18n.convertToIgcResource(DateRangePickerResourceStringsEN),
    ...IgcCalendarResourceStringEN,
  };
