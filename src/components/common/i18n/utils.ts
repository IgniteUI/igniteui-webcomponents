import type { IResourceStrings } from 'igniteui-i18n-core';
import { isString } from '../util.js';
import type { IgcCalendarResourceStrings } from './EN/calendar.resources.js';
import type { IgcChatResourceStrings } from './EN/chat.resources.js';
import type { IgcDatePickerResourceStrings } from './EN/date-picker.resources.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';

/** Names of components currently handling a mix of old and new resource strings. */
export type I18nResourceMapNames =
  | 'calendar'
  | 'date-picker'
  | 'date-range-picker'
  | 'chat';

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

export const chatResourcesMap = new Map<keyof IgcChatResourceStrings, string>([
  ['suggestionsHeader', 'chat_suggestions_header'],
  ['reactionCopy', 'chat_reaction_copy'],
  ['reactionLike', 'chat_reaction_like'],
  ['reactionDislike', 'chat_reaction_dislike'],
  ['reactionRegenerate', 'chat_reaction_regenerate'],
  ['attachmentLabel', 'chat_attachment_label'],
  ['attachmentsListLabel', 'chat_attachments_list_label'],
  ['messageCopied', 'chat_message_copied'],
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

export const datePickerResourcesMap = new Map<
  keyof IgcDatePickerResourceStrings,
  string | undefined
>([
  ['changeDate', 'date_picker_change_date'],
  ['chooseDate', 'date_picker_choose_date'],
  ...(
    calendarResourcesMap as Map<
      keyof IgcCalendarResourceStrings,
      string | undefined
    >
  ).entries(),
]);

function getResourceMap(
  name: I18nResourceMapNames
): Map<string, string | undefined> | undefined {
  switch (name) {
    case 'calendar':
      return calendarResourcesMap;
    case 'chat':
      return chatResourcesMap;
    case 'date-picker':
      return datePickerResourcesMap;
    case 'date-range-picker':
      return dateRangePickerResourcesMap;
    default:
      break;
  }

  return new Map<string, string | undefined>();
}

export function convertToIgcResource<T extends object>(
  resource: IResourceStrings,
  resourceMapName: I18nResourceMapNames
): T {
  const result = {} as T;
  const resourceMap = getResourceMap(resourceMapName);

  if (!resourceMap) {
    return resource as T;
  }

  for (const [igcKey, coreKey] of resourceMap) {
    if (igcKey in resource) {
      result[igcKey as keyof T] = resource[
        igcKey as keyof IResourceStrings
      ] as T[keyof T];
    } else if (coreKey && coreKey in resource) {
      const value = resource[coreKey as keyof IResourceStrings];
      if (isString(value)) {
        result[igcKey as keyof T] = value as T[keyof T];
      }
    }
  }

  return result;
}

export function convertToCoreResource<T extends object>(
  resource: T,
  resourceMapName: I18nResourceMapNames
): IResourceStrings {
  const result: IResourceStrings = {};
  const resourceMap = getResourceMap(resourceMapName);

  if (!resourceMap) {
    return resource as IResourceStrings;
  }

  for (const [igcKey, coreKey] of resourceMap) {
    if (coreKey && coreKey in resource) {
      result[coreKey as keyof IResourceStrings] = resource[
        coreKey as keyof T
      ] as string;
    } else if (coreKey) {
      const value = resource[igcKey as keyof T];
      if (isString(value)) {
        result[coreKey as keyof IResourceStrings] = value;
      }
    }
  }

  return result;
}
