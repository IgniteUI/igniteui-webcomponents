import type { IResourceStrings } from 'igniteui-i18n-core';
import { isObject, isString } from '../util.js';
import type { IgcCalendarResourceStrings } from './EN/calendar.resources.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';

export const calendarResourcesMap = new Map<
  keyof IgcCalendarResourceStrings,
  string | undefined
>([
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

export const dateRangePickerResourcesMap = new Map<
  keyof IgcDateRangePickerResourceStrings,
  string | undefined
>([
  ['separator', 'date_range_picker_date_separator'],
  ['done', 'date_range_picker_done_button'],
  ['cancel', 'date_range_picker_cancel_button'],
  ['last7Days', 'date_range_picker_last7Days'],
  ['last30Days', 'date_range_picker_last30Days'],
  ['currentMonth', 'date_range_picker_currentMonth'],
  ['yearToDate', 'date_range_picker_yearToDate'],
  ...(
    calendarResourcesMap as Map<
      keyof IgcDateRangePickerResourceStrings,
      string | undefined
    >
  ).entries(),
]);

function isCalendarResource(
  resource: unknown
): resource is IgcCalendarResourceStrings {
  return (
    isObject(resource) &&
    'selectMonth' in resource &&
    !isDateRangePickerResource(resource)
  );
}

function isDateRangePickerResource(
  resource: unknown
): resource is IgcDateRangePickerResourceStrings {
  return isObject(resource) && 'last7Days' in resource;
}

function getResourceMap<T>(
  resource: T
): Map<string, string | undefined> | undefined {
  if (isCalendarResource(resource)) {
    return calendarResourcesMap;
  }

  if (isDateRangePickerResource(resource)) {
    return dateRangePickerResourcesMap;
  }

  return undefined;
}

function getResourceMapForCore<T extends IResourceStrings>(
  resource: T
): Map<string, string | undefined> | undefined {
  if ('date_range_picker_last7Days' in resource) {
    return dateRangePickerResourcesMap;
  }

  if ('calendar_select_month' in resource) {
    return calendarResourcesMap;
  }

  return undefined;
}

export function convertToIgcResource<T extends object>(
  resource: IResourceStrings
): T {
  const result = {} as T;
  const resourceMap = getResourceMapForCore(resource);

  if (!resourceMap) {
    return resource as T;
  }

  for (const [componentKey, coreKey] of resourceMap) {
    if (coreKey && coreKey in resource) {
      const coreValue = resource[coreKey as keyof IResourceStrings];

      if (isString(coreValue)) {
        result[componentKey as keyof T] = coreValue as T[keyof T];
      }
    }
  }

  return result;
}

export function convertToCoreResource<T>(resource: T): IResourceStrings {
  const result: IResourceStrings = {};
  const resourceMap = getResourceMap(resource);

  if (resourceMap) {
    for (const [key, coreKey] of resourceMap) {
      if (coreKey) {
        const value = resource[key as keyof T];
        if (isString(value)) {
          result[coreKey as keyof IResourceStrings] = value;
        }
      }
    }
  } else {
    return resource as IResourceStrings;
  }

  return result;
}
