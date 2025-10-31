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

export const IgcCalendarResourceStringEN: IgcCalendarResourceStrings = {
  ...convertToIgcResource(CalendarResourceStringsEN),
  ...{ weekLabel: 'Wk' },
};
