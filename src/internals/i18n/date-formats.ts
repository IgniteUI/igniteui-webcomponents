import { getDateFormatter } from 'igniteui-i18n-core';
import { getOrCreateForLocale } from './locale.js';

type DateTimeStyle = 'short' | 'long' | 'medium' | 'full';

const DATE_TIME_STYLES = new Set<string>(['short', 'long', 'medium', 'full']);

/** The style of a suffixed format, e.g. `shortDate` -> `short`. */
function toStyle(format: string): DateTimeStyle {
  return format.slice(0, -4).toLowerCase() as DateTimeStyle;
}

/** Adds the `Date` suffix to a predefined style, e.g. `short` -> `shortDate`. */
export function getDateTimeFormat(format?: string): string | undefined {
  return format && DATE_TIME_STYLES.has(format) ? `${format}Date` : format;
}

type LocaleDateTimeFormats = {
  display: string;
  /** The display format with the leading zeros a mask needs. */
  input: string;
};

const localeDateTimeFormats = new Map<string, LocaleDateTimeFormats>();

/**
 * Returns the locale-default date-time formats, cached because the date
 * editors read them on each render.
 */
export function getLocaleDateTimeFormats(
  locale: string
): LocaleDateTimeFormats {
  return getOrCreateForLocale(localeDateTimeFormats, locale, (resolved) => {
    const formatter = getDateFormatter();
    return {
      display: formatter.getLocaleDateTimeFormat(resolved),
      input: formatter.getLocaleDateTimeFormat(resolved, true),
    };
  });
}

export function formatDisplayDate(
  value: Date,
  locale: string,
  displayFormat?: string
): string {
  const formatter = getDateFormatter();
  let options: Intl.DateTimeFormatOptions;

  if (!displayFormat) {
    options = {};
  } else if (DATE_TIME_STYLES.has(displayFormat)) {
    const style = displayFormat as DateTimeStyle;
    options = { dateStyle: style, timeStyle: style };
  } else if (displayFormat.endsWith('Date')) {
    options = { dateStyle: toStyle(displayFormat) };
  } else if (displayFormat.endsWith('Time')) {
    options = { timeStyle: toStyle(displayFormat) };
  } else {
    return formatter.formatDateCustomFormat(value, displayFormat, { locale });
  }

  return formatter.formatDateTime(value, locale, options);
}
