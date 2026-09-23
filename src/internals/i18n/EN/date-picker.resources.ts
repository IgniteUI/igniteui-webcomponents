import type { IgcCalendarResourceStrings } from './calendar.resources.js';

/* blazorSuppress */
/**
 * @deprecated since 7.2.0. Use the newly provided
 * `IDatePickerResourceStrings` and `ICalendarResourceStrings` interfaces, or
 * set global resource strings with the `registerI18n` method.
 */
export interface IgcDatePickerResourceStrings extends IgcCalendarResourceStrings {
  changeDate: string;
  chooseDate: string;
}
