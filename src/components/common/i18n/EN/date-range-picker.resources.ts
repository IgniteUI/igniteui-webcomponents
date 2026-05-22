import { DateRangePickerResourceStringsEN } from 'igniteui-i18n-core';
import { convertToIgcResource } from '../utils.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './calendar.resources.js';

/* blazorSuppress */
/** @deprecated since 7.2.0. Please use the newly provided `ICalendarResourceStrings` and `IDateRangePickerResourceStrings` interfaces or set global resource strings using `registerI18n` method. */
export interface IgcDateRangePickerResourceStrings extends IgcCalendarResourceStrings {
  separator?: string;
  done?: string;
  cancel?: string;
  last7Days?: string;
  last30Days?: string;
  currentMonth?: string;
  yearToDate?: string;
}

/** @deprecated since 7.2.0. Please use the newly provided resources from the igniteui-i18n-resources package. */
export const IgcDateRangePickerResourceStringsEN: IgcDateRangePickerResourceStrings =
  {
    ...convertToIgcResource(
      DateRangePickerResourceStringsEN,
      'date-range-picker'
    ),
    ...IgcCalendarResourceStringEN,
  };
