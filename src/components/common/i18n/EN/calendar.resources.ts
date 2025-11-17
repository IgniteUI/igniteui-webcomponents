import { CalendarResourceStringsEN } from 'igniteui-i18n-core';
import { convertToIgcResource } from '../utils.js';

/* blazorSuppress */
export interface IgcCalendarResourceStrings {
  selectMonth: string;
  selectYear: string;
  selectDate: string;
  selectRange: string;
  selectedDate: string;
  startDate: string;
  endDate: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  previousYears: string;
  nextYears: string;
  weekLabel: string;
}

// Because weekLabel should be retrieved from the i18n formatter, but previously was present in resources.
// Manually add it for now, as part of the default EN. When updating make sure to switch in source
// the week start to be retrieved using a formatter instead of locale.
export const IgcCalendarResourceStringEN: IgcCalendarResourceStrings = {
  ...convertToIgcResource(CalendarResourceStringsEN),
  ...{ weekLabel: 'Wk' },
};
