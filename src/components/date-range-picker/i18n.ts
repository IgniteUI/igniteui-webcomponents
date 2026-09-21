import {
  CalendarResourceStringsEN,
  DateRangePickerResourceStringsEN,
  type ICalendarResourceStrings,
  type IDateRangePickerResourceStrings,
} from 'igniteui-i18n-core';
import type { IgcDateRangePickerResourceStrings } from '#internals/i18n/EN/date-range-picker.resources.js';

export type { IgcDateRangePickerResourceStrings };
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import { dateRangePickerResourcesMap } from '#internals/i18n/utils.js';

/** The core resource strings of the date range picker and of its calendar. */
export type DateRangePickerResourceStringsType =
  IDateRangePickerResourceStrings & ICalendarResourceStrings;

/** The resource strings that the date range components accept. */
export type DateRangeResourceStrings =
  | IgcDateRangePickerResourceStrings
  | DateRangePickerResourceStringsType;

/**
 * The i18n configuration that `igc-date-range-picker` and
 * `igc-predefined-ranges-area` share.
 *
 * @remarks
 * The core validation strings stay internal, so that they do not mix with the
 * old resources of a user.
 *
 * TODO: update `DateRangeResourceStrings` when
 * `IgcDateRangePickerResourceStrings` becomes
 * `IDateRangePickerResourceStrings`.
 */
export const dateRangeI18nConfig: I18nControllerConfig<DateRangeResourceStrings> =
  {
    defaultEN: {
      ...DateRangePickerResourceStringsEN,
      ...CalendarResourceStringsEN,
    },
    resourceMap: dateRangePickerResourcesMap,
  };
