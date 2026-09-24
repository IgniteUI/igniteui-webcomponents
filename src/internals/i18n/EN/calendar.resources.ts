import { CalendarResourceStringsEN } from 'igniteui-i18n-core';
import { calendarResourcesMap, convertToIgcResource } from '../utils.js';

/* blazorSuppress */
/**
 * @deprecated since 7.2.0. Use the newly provided `ICalendarResourceStrings`
 * interface, or set global resource strings with the `registerI18n` method.
 */
export interface IgcCalendarResourceStrings {
  selectMonth?: string;
  selectYear?: string;
  selectDate?: string;
  selectRange?: string;
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
  previousMonth?: string;
  nextMonth?: string;
  previousYear?: string;
  nextYear?: string;
  previousYears?: string;
  nextYears?: string;
  weekLabel?: string;
}

// The i18n formatter gives `weekLabel`, but an earlier version kept it in
// the resources, so it stays in the default EN strings. A future change must
// read the week start from the formatter, not from the locale.
/**
 * @deprecated since 7.2.0. Use the newly provided resources from the
 * igniteui-i18n-resources package.
 */
export const IgcCalendarResourceStringEN: IgcCalendarResourceStrings = {
  ...convertToIgcResource(CalendarResourceStringsEN, calendarResourcesMap),
  weekLabel: 'Wk',
};
