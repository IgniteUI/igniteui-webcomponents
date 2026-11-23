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

/**
 * The English labels of the built-in ranges that `igniteui-i18n-core` lacks.
 * TODO: remove when `IDateRangePickerResourceStrings` has these keys.
 */
const PredefinedRangeResourceStringsEN = {
  date_range_picker_today: 'Today',
  date_range_picker_yesterday: 'Yesterday',
  date_range_picker_lastWeek: 'Last Week',
  date_range_picker_lastMonth: 'Last Month',
  date_range_picker_currentQuarter: 'Current Quarter',
  date_range_picker_lastQuarter: 'Last Quarter',
  date_range_picker_quarterToDate: 'Quarter to Date',
  date_range_picker_currentYear: 'Current Year',
  date_range_picker_lastYear: 'Last Year',
};

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
    ...PredefinedRangeResourceStringsEN,
    ...CalendarResourceStringsEN,
  },
  resourceMap: dateRangePickerResourcesMap,
};
