import {
  CalendarResourceStringsEN,
  DateRangePickerResourceStringsEN,
  type ICalendarResourceStrings,
  type IDateRangePickerResourceStrings,
} from 'igniteui-i18n-core';
import type { IgcDateRangePickerResourceStrings } from '#internals/i18n/EN/date-range-picker.resources.js';
import { dateRangePickerResourcesMap } from '#internals/i18n/utils.js';
import type { I18nMixinConfig } from '#internals/mixins/i18n.js';

/** The core resource strings of the date range picker and of its calendar. */
export type DateRangePickerResourceStringsType =
  IDateRangePickerResourceStrings & ICalendarResourceStrings;

/** The resource strings that the date range components accept. */
type DateRangeResourceStrings =
  | IgcDateRangePickerResourceStrings
  | DateRangePickerResourceStringsType;

/**
 * The i18n configuration that `igc-date-range-picker` and
 * `igc-predefined-ranges-area` share.
 *
 * TODO: update `DateRangeResourceStrings` when
 * `IgcDateRangePickerResourceStrings` becomes
 * `IDateRangePickerResourceStrings`.
 */
export const dateRangeI18nConfig: I18nMixinConfig<
  DateRangeResourceStrings,
  IgcDateRangePickerResourceStrings &
    Required<IDateRangePickerResourceStrings> &
    Required<ICalendarResourceStrings>
> = {
  defaultEN: {
    ...DateRangePickerResourceStringsEN,
    ...CalendarResourceStringsEN,
  },
  resourceMap: dateRangePickerResourcesMap,
};
