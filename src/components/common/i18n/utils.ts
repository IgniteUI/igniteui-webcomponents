import type {
  ICalendarResourceStrings,
  IDateRangePickerResourceStrings,
  IResourceStrings,
} from 'igniteui-i18n-core';
import type { IgcCalendarResourceStrings } from './EN/calendar.resources.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';

export const calendarResourcesMap = new Map<string, string | undefined>([
  ['selectMonth', 'calendar_select_month'],
  ['selectYear', 'calendar_select_year'],
  ['selectDate', 'calendar_select_date'],
  ['selectRange', 'calendar_range_placeholder'],
  ['selectedDate', undefined], // This one seems not to be in use anyway
  ['startDate', 'calendar_range_label_start'],
  ['endDate', 'calendar_range_label_end'],
  ['previousMonth', 'calendar_previous_month'],
  ['nextMonth', 'calendar_next_month'],
  ['previousYear', 'calendar_previous_year'],
  ['nextYear', 'calendar_next_year'],
  ['previousYears', 'calendar_previous_years'],
  ['nextYears', 'calendar_next_years'],
  ['weekLabel', 'i18n/getWeekLabel'],
]);

export const dateRangePickerResourcesMap = new Map<string, string | undefined>([
  ['separator', 'date_range_picker_date_separator'],
  ['done', 'date_range_picker_done_button'],
  ['cancel', 'date_range_picker_cancel_button'],
  ['last7Days', 'date_range_picker_last7Days'],
  ['last30Days', 'date_range_picker_last30Days'],
  ['currentMonth', 'date_range_picker_currentMonth'],
  ['yearToDate', 'date_range_picker_yearToDate'],
  ...calendarResourcesMap,
]);

function isCalendarResource(
  resource: ICalendarResourceStrings | IgcCalendarResourceStrings
) {
  return (
    ((resource as ICalendarResourceStrings).calendar_select_month !==
      undefined ||
      (resource as IgcCalendarResourceStrings).selectMonth !== undefined) &&
    !isDateRangePickerResource(resource as IgcDateRangePickerResourceStrings)
  );
}

function isDateRangePickerResource(
  resource: IDateRangePickerResourceStrings | IgcDateRangePickerResourceStrings
) {
  return (
    (resource as IDateRangePickerResourceStrings)
      .date_range_picker_last7Days !== undefined ||
    (resource as IgcDateRangePickerResourceStrings).last7Days !== undefined
  );
}

export function convertToIgcResource<T extends IResourceStrings>(inObject: T) {
  const result: any = {};
  let resourceMap = new Map<string, string | undefined>();
  if (isCalendarResource(inObject)) {
    resourceMap = calendarResourcesMap;
  } else if (isDateRangePickerResource(inObject)) {
    resourceMap = dateRangePickerResourcesMap;
  }

  for (const [key, value] of resourceMap) {
    if (value && !value.includes('i18n/')) {
      result[key] = inObject[value as keyof IResourceStrings];
    }
  }

  return result;
}

export function convertToCoreResource<T>(inObject: T): IResourceStrings {
  const result = {} as IResourceStrings;
  let resourceMap = new Map<string, string | undefined>();
  if (isCalendarResource(inObject as IgcCalendarResourceStrings)) {
    resourceMap = calendarResourcesMap;
  } else if (
    isDateRangePickerResource(inObject as IgcDateRangePickerResourceStrings)
  ) {
    resourceMap = dateRangePickerResourcesMap;
  }

  for (const [key, value] of resourceMap) {
    if (value && !value.includes('i18n/')) {
      result[value as keyof IResourceStrings] = inObject[
        key as keyof T
      ] as string;
    }
  }

  return result;
}
