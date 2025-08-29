import {
  getCurrentResourceStrings as getCurrentResourceStringsCore,
  getI18nManager,
  type ICalendarResourceStrings,
  type IDateRangePickerResourceStrings,
  type IResourceStrings,
} from 'igniteui-i18n-core';

export class i18n {
  public static calendarResourcesMap = new Map<string, string | undefined>([
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

  public static dateRangePickerResourcesMap = new Map<
    string,
    string | undefined
  >([
    ['separator', 'date_range_picker_date_separator'],
    ['done', 'date_range_picker_done_button'],
    ['cancel', 'date_range_picker_cancel_button'],
    ['last7Days', 'date_range_picker_last7Days'],
    ['last30Days', 'date_range_picker_last30Days'],
    ['currentMonth', 'date_range_picker_currentMonth'],
    ['yearToDate', 'date_range_picker_yearToDate'],
    ...i18n.calendarResourcesMap,
  ]);

  public static isCalendarResource(
    resource: IResourceStrings
  ): resource is ICalendarResourceStrings {
    return (
      (resource as ICalendarResourceStrings).calendar_first_picker_of !==
      undefined
    );
  }

  public static isDateRancePickerResource(
    resource: IResourceStrings
  ): resource is IDateRangePickerResourceStrings {
    return (
      (resource as IDateRangePickerResourceStrings)
        .date_range_picker_cancel_button !== undefined
    );
  }

  public static convertToIgcResource<T extends IResourceStrings>(inObject: T) {
    const result: any = {};
    let resourceMap = new Map<string, string | undefined>();
    if (i18n.isCalendarResource(inObject)) {
      resourceMap = i18n.calendarResourcesMap;
    } else if (i18n.isDateRancePickerResource(inObject)) {
      resourceMap = i18n.dateRangePickerResourcesMap;
    }

    for (const [key, value] of resourceMap) {
      if (value && !value.includes('i18n/')) {
        result[key] = inObject[value as keyof IResourceStrings];
      }
    }

    return result;
  }

  /** Get current resource strings based on default. Result is truncated result, containing only relevant locale strings. */
  public static getCurrentResourceStrings<T extends {}>(
    defaultEN: T,
    init = true
  ) {
    const igcResourceStringKeys = Object.keys(defaultEN);
    if (init) {
      getI18nManager().registerI18n(defaultEN, getI18nManager().defaultLocale);
    }

    // Get resource strings and map them based on the type
    const resourceStrings = getCurrentResourceStringsCore();
    const normalizedResourceStrings: T = {} as T;
    const resourceStringsKeys = Object.keys(resourceStrings);
    for (const igcKey of igcResourceStringKeys) {
      const coreKey =
        i18n.calendarResourcesMap.get(igcKey) ??
        i18n.dateRangePickerResourcesMap.get(igcKey) ??
        undefined;
      if (coreKey && !coreKey.includes('i18n/')) {
        if (resourceStringsKeys.includes(coreKey)) {
          normalizedResourceStrings[igcKey as keyof T] = resourceStrings[
            coreKey as keyof IResourceStrings
          ] as T[keyof T];
        } else {
          normalizedResourceStrings[igcKey as keyof T] =
            defaultEN[igcKey as keyof T];
        }
      } else if (coreKey?.includes('getWeekLabel')) {
        // Call core week label?
      }
    }

    return normalizedResourceStrings;
  }
}
