import type { IgcCalendarResourceStrings } from './EN/calendar.resources.js';
import type { IgcChatResourceStrings } from './EN/chat.resources.js';
import type { IgcDateRangePickerResourceStrings } from './EN/date-range-picker.resources.js';

export const calendarResourcesMap = new Map<
  keyof IgcCalendarResourceStrings,
  string
>([
  ['selectMonth', 'calendar_select_month'],
  ['selectYear', 'calendar_select_year'],
  ['selectDate', 'calendar_select_date'],
  ['selectRange', 'calendar_range_placeholder'],
  ['startDate', 'calendar_range_label_start'],
  ['endDate', 'calendar_range_label_end'],
  ['previousMonth', 'calendar_previous_month'],
  ['nextMonth', 'calendar_next_month'],
  ['previousYear', 'calendar_previous_year'],
  ['nextYear', 'calendar_next_year'],
  ['previousYears', 'calendar_previous_years'],
  ['nextYears', 'calendar_next_years'],
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
  string
>([
  ['separator', 'date_range_picker_date_separator'],
  ['done', 'date_range_picker_done_button'],
  ['cancel', 'date_range_picker_cancel_button'],
  ['last7Days', 'date_range_picker_last7Days'],
  ['last30Days', 'date_range_picker_last30Days'],
  ['currentMonth', 'date_range_picker_currentMonth'],
  ['yearToDate', 'date_range_picker_yearToDate'],
  ...calendarResourcesMap,
]);

export const datePickerResourcesMap = new Map<
  keyof IgcCalendarResourceStrings | 'changeDate' | 'chooseDate',
  string
>([
  ['changeDate', 'date_picker_change_date'],
  ['chooseDate', 'date_picker_choose_date'],
  ...calendarResourcesMap,
]);
