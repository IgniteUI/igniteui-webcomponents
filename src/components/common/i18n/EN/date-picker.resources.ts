import { DatePickerResourceStringsEN } from 'igniteui-i18n-core';
import { convertToIgcResource } from '../utils.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './calendar.resources.js';

/* blazorSuppress */
/** @deprecated Please use the newly provided IDatePickerResourceStrings and ICalendarResourceStrings interfaces from or set global resource strings using `registerI18n` method. */
export interface IgcDatePickerResourceStrings extends IgcCalendarResourceStrings {
  changeDate: string;
  chooseDate: string;
}

/** @deprecated Please use the newly provided resources from the igniteui-i18n-resources package. */
export const IgcDatePickerResourceStringsEN: IgcDatePickerResourceStrings = {
  ...convertToIgcResource(DatePickerResourceStringsEN, 'date-picker'),
  ...IgcCalendarResourceStringEN,
};
