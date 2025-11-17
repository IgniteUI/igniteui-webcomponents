import { getDateFormatter } from 'igniteui-i18n-core';
import { parseISODate } from '../calendar/helpers.js';
import { clamp } from '../common/util.js';

export enum FormatDesc {
  Numeric = 'numeric',
  TwoDigits = '2-digit',
}

export enum DateParts {
  Day = 'day',
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  AmPm = 'amPm',
  Literal = 'literal',
}

export enum DatePart {
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  AmPm = 'amPm',
}

/** @ignore */
export interface DatePartInfo {
  type: DateParts;
  start: number;
  end: number;
  format: string;
}

export interface DatePartDeltas {
  date?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export abstract class DateTimeUtil {
  public static readonly DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';
  public static readonly DEFAULT_TIME_INPUT_FORMAT = 'hh:mm tt';
  private static readonly PREDEFINED_FORMATS = new Set([
    'short',
    'medium',
    'long',
    'full',
  ]);

  public static parseValueFromMask(
    inputData: string,
    dateTimeParts: DatePartInfo[],
    promptChar?: string
  ): Date | null {
    const parts: { [key in DateParts]: number } = {} as any;
    dateTimeParts.forEach((dp) => {
      let value = Number.parseInt(
        DateTimeUtil.getCleanVal(inputData, dp, promptChar),
        10
      );
      if (!value) {
        value =
          dp.type === DateParts.Date || dp.type === DateParts.Month ? 1 : 0;
      }
      parts[dp.type] = value;
    });
    parts[DateParts.Month] -= 1;

    if (parts[DateParts.Month] < 0 || 11 < parts[DateParts.Month]) {
      return null;
    }

    // TODO: Century threshold
    if (parts[DateParts.Year] < 50) {
      parts[DateParts.Year] += 2000;
    }

    if (
      parts[DateParts.Date] >
      DateTimeUtil.daysInMonth(parts[DateParts.Year], parts[DateParts.Month])
    ) {
      return null;
    }

    if (
      parts[DateParts.Hours] > 23 ||
      parts[DateParts.Minutes] > 59 ||
      parts[DateParts.Seconds] > 59
    ) {
      return null;
    }

    const amPm = dateTimeParts.find((p) => p.type === DateParts.AmPm);
    if (amPm) {
      parts[DateParts.Hours] %= 12;
    }

    if (
      amPm &&
      DateTimeUtil.getCleanVal(inputData, amPm, promptChar).toLowerCase() ===
        'pm'
    ) {
      parts[DateParts.Hours] += 12;
    }

    return new Date(
      parts[DateParts.Year] || 2000,
      parts[DateParts.Month] || 0,
      parts[DateParts.Date] || 1,
      parts[DateParts.Hours] || 0,
      parts[DateParts.Minutes] || 0,
      parts[DateParts.Seconds] || 0
    );
  }

  public static getDefaultInputMask(locale: string): string {
    return getDateFormatter().getLocaleDateTimeFormat(locale, true);
  }

  public static parseDateTimeFormat(
    mask: string,
    locale: string,
    leadingZero = false
  ): DatePartInfo[] {
    const format = mask || DateTimeUtil.getDefaultInputMask(locale);
    const dateTimeParts: DatePartInfo[] = [];
    const formatArray = Array.from(format);
    let currentPart: DatePartInfo | null = null;
    let position = 0;

    for (let i = 0; i < formatArray.length; i++, position++) {
      const type = DateTimeUtil.determineDatePart(formatArray[i]);
      if (currentPart) {
        if (currentPart.type === type) {
          currentPart.format += formatArray[i];
          if (i < formatArray.length - 1) {
            continue;
          }
        }

        DateTimeUtil.addCurrentPart(currentPart, dateTimeParts, leadingZero);
        position = currentPart.end;
      }

      currentPart = {
        start: position,
        end: position + formatArray[i].length,
        type,
        format: formatArray[i],
      };
    }

    // make sure the last member of a format like H:m:s is not omitted
    if (
      !dateTimeParts.filter((p) => p.format.includes(currentPart!.format))
        .length
    ) {
      DateTimeUtil.addCurrentPart(currentPart!, dateTimeParts, leadingZero);
    }
    // formats like "y" or "yyy" are treated like "yyyy" while editing
    const yearPart = dateTimeParts.filter((p) => p.type === DateParts.Year)[0];
    if (yearPart && yearPart.format !== 'yy') {
      yearPart.end += 4 - yearPart.format.length;
      yearPart.format = 'yyyy';
    }

    return dateTimeParts;
  }

  public static parseIsoDate(value: string): Date | null {
    return parseISODate(value);
  }

  public static isValidDate(value: any): value is Date {
    if (isDate(value)) {
      return !Number.isNaN(value.getTime());
    }

    return false;
  }

  /**
   * Format date for display.
   * @param value Date value
   * @param locale Locale of the component
   * @param displayFormat Display format specified by the user. Can be undefined.
   * @param inputFormat Input format, so it is not calculated again and used for leading zero format.
   * @returns
   */
  public static formatDisplayDate(
    value: Date,
    locale: string,
    displayFormat: string | undefined
  ): string {
    const options: Intl.DateTimeFormatOptions = {};
    switch (displayFormat) {
      case 'short':
      case 'long':
      case 'medium':
      case 'full':
        options.dateStyle = displayFormat;
        options.timeStyle = displayFormat;
        break;
      case 'shortDate':
      case 'longDate':
      case 'mediumDate':
      case 'fullDate':
        options.dateStyle = displayFormat.toLowerCase().split('date')[0] as any;
        break;
      case 'shortTime':
      case 'longTime':
      case 'mediumTime':
      case 'fullTime':
        options.timeStyle = displayFormat.toLowerCase().split('time')[0] as any;
        break;
      default:
        if (displayFormat) {
          return getDateFormatter().formatDateCustomFormat(
            value,
            displayFormat,
            { locale }
          );
        }
    }

    return getDateFormatter().formatDateTime(value, locale, options);
  }

  public static getPartValue(
    datePartInfo: DatePartInfo,
    partLength: number,
    _dateValue: Date | null
  ): string {
    let maskedValue: any;
    const datePart = datePartInfo.type;

    switch (datePart) {
      case DateParts.Date:
        maskedValue = _dateValue!.getDate();
        break;
      case DateParts.Month:
        // months are zero based
        maskedValue = _dateValue!.getMonth() + 1;
        break;
      case DateParts.Year:
        if (partLength === 2) {
          maskedValue = DateTimeUtil.prependValue(
            Number.parseInt(_dateValue!.getFullYear().toString().slice(-2), 10),
            partLength,
            '0'
          );
        } else {
          maskedValue = _dateValue!.getFullYear();
        }
        break;
      case DateParts.Hours:
        if (datePartInfo.format.indexOf('h') !== -1) {
          maskedValue = DateTimeUtil.prependValue(
            DateTimeUtil.toTwelveHourFormat(_dateValue!.getHours()),
            partLength,
            '0'
          );
        } else {
          maskedValue = _dateValue!.getHours();
        }
        break;
      case DateParts.Minutes:
        maskedValue = _dateValue!.getMinutes();
        break;
      case DateParts.Seconds:
        maskedValue = _dateValue!.getSeconds();
        break;
      case DateParts.AmPm:
        maskedValue = _dateValue!.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePartInfo.type !== DateParts.AmPm) {
      return DateTimeUtil.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private static _spinTimePart(
    newDate: Date,
    delta: number,
    max: number,
    min: number,
    setter: (value: number) => number,
    getter: () => number,
    spinLoop: boolean
  ): void {
    const range = max - min + 1;
    let newValue = getter.call(newDate) + delta;

    if (spinLoop) {
      newValue = min + ((((newValue - min) % range) + range) % range);
    } else {
      newValue = clamp(newValue, min, max);
    }

    setter.call(newDate, newValue);
  }

  public static spinYear(delta: number, newDate: Date): Date {
    const maxDate = DateTimeUtil.daysInMonth(
      newDate.getFullYear() + delta,
      newDate.getMonth()
    );
    if (newDate.getDate() > maxDate) {
      // clip to max to avoid leap year change shifting the entire value
      newDate.setDate(maxDate);
    }
    newDate.setFullYear(newDate.getFullYear() + delta);

    return newDate;
  }

  public static spinMonth(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    const maxDate = DateTimeUtil.daysInMonth(
      newDate.getFullYear(),
      newDate.getMonth() + delta
    );
    if (newDate.getDate() > maxDate) {
      newDate.setDate(maxDate);
    }

    const maxMonth = 11;
    const minMonth = 0;
    let month = newDate.getMonth() + delta;
    if (month > maxMonth) {
      month = spinLoop ? (month % maxMonth) - 1 : maxMonth;
    } else if (month < minMonth) {
      month = spinLoop ? maxMonth + (month % maxMonth) + 1 : minMonth;
    }

    newDate.setMonth(month);
  }

  public static spinDate(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    const maxDate = DateTimeUtil.daysInMonth(
      newDate.getFullYear(),
      newDate.getMonth()
    );
    let date = newDate.getDate() + delta;
    if (date > maxDate) {
      date = spinLoop ? date % maxDate : maxDate;
    } else if (date < 1) {
      date = spinLoop ? maxDate + (date % maxDate) : 1;
    }

    newDate.setDate(date);
  }

  public static spinHours(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    DateTimeUtil._spinTimePart(
      newDate,
      delta,
      23,
      0,
      newDate.setHours,
      newDate.getHours,
      spinLoop
    );
  }

  public static spinMinutes(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    DateTimeUtil._spinTimePart(
      newDate,
      delta,
      59,
      0,
      newDate.setMinutes,
      newDate.getMinutes,
      spinLoop
    );
  }

  public static spinSeconds(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    DateTimeUtil._spinTimePart(
      newDate,
      delta,
      59,
      0,
      newDate.setSeconds,
      newDate.getSeconds,
      spinLoop
    );
  }

  public static spinAmPm(
    newDate: Date,
    currentDate: Date,
    amPmFromMask: string
  ): Date {
    let date = new Date(newDate);

    switch (amPmFromMask) {
      case 'AM':
        date = new Date(newDate.setHours(newDate.getHours() + 12));
        break;
      case 'PM':
        date = new Date(newDate.setHours(newDate.getHours() - 12));
        break;
    }
    if (date.getDate() !== currentDate.getDate()) {
      return currentDate;
    }

    return date;
  }

  public static greaterThanMaxValue(
    value: Date,
    maxValue: Date,
    includeTime = true,
    includeDate = true
  ): boolean {
    if (includeTime && includeDate) {
      return value.getTime() > maxValue.getTime();
    }

    const _value = new Date(value.getTime());
    const _maxValue = new Date(maxValue.getTime());
    if (!includeTime) {
      _value.setHours(0, 0, 0, 0);
      _maxValue.setHours(0, 0, 0, 0);
    }
    if (!includeDate) {
      _value.setFullYear(0, 0, 0);
      _maxValue.setFullYear(0, 0, 0);
    }

    return _value.getTime() > _maxValue.getTime();
  }

  /**
   * Determines whether the provided value is less than the provided min value.
   *
   * @param includeTime set to false if you want to exclude time portion of the two dates
   * @param includeDate set to false if you want to exclude the date portion of the two dates
   * @returns true if provided value is less than provided minValue
   */
  public static lessThanMinValue(
    value: Date,
    minValue: Date,
    includeTime = true,
    includeDate = true
  ): boolean {
    if (includeTime && includeDate) {
      return value.getTime() < minValue.getTime();
    }

    const _value = new Date(value.getTime());
    const _minValue = new Date(minValue.getTime());
    if (!includeTime) {
      _value.setHours(0, 0, 0, 0);
      _minValue.setHours(0, 0, 0, 0);
    }
    if (!includeDate) {
      _value.setFullYear(0, 0, 0);
      _minValue.setFullYear(0, 0, 0);
    }

    return _value.getTime() < _minValue.getTime();
  }

  /**
   * Validates a value within a given min and max value range.
   *
   * @param value The value to validate
   * @param minValue The lowest possible value that `value` can take
   * @param maxValue The largest possible value that `value` can take
   */
  public static validateMinMax(
    value: Date,
    minValue: Date | string,
    maxValue: Date | string,
    includeTime = true,
    includeDate = true
  ) {
    // if (!value) {
    //     return null;
    // }
    const errors = {};
    const min = DateTimeUtil.isValidDate(minValue)
      ? minValue
      : DateTimeUtil.parseIsoDate(minValue);
    const max = DateTimeUtil.isValidDate(maxValue)
      ? maxValue
      : DateTimeUtil.parseIsoDate(maxValue);
    if (
      min &&
      value &&
      DateTimeUtil.lessThanMinValue(value, min, includeTime, includeDate)
    ) {
      Object.assign(errors, { minValue: true });
    }
    if (
      max &&
      value &&
      DateTimeUtil.greaterThanMaxValue(value, max, includeTime, includeDate)
    ) {
      Object.assign(errors, { maxValue: true });
    }

    return errors;
  }

  /**
   * Transforms the predefined format to a display format containing only date parts.
   *
   * @param format The format to check and transform
   */
  public static predefinedToDateDisplayFormat(format?: string) {
    return format && DateTimeUtil.PREDEFINED_FORMATS.has(format)
      ? `${format}Date`
      : format;
  }

  private static addCurrentPart(
    currentPart: DatePartInfo,
    dateTimeParts: DatePartInfo[],
    leadingZero = false
  ): void {
    DateTimeUtil.ensureLeadingZero(currentPart, leadingZero);
    currentPart.end = currentPart.start + currentPart.format.length;
    dateTimeParts.push(currentPart);
  }

  private static ensureLeadingZero(part: DatePartInfo, leadingZero = false) {
    switch (part.type) {
      case DateParts.Date:
      case DateParts.Month:
      case DateParts.Hours:
      case DateParts.Minutes:
      case DateParts.Seconds:
        if (part.format.length === 1 && leadingZero) {
          part.format = part.format.repeat(2);
        }
        break;
    }
  }

  private static determineDatePart(char: string): DateParts {
    switch (char) {
      case 'd':
      case 'D':
        return DateParts.Date;
      case 'M':
        return DateParts.Month;
      case 'y':
      case 'Y':
        return DateParts.Year;
      case 'h':
      case 'H':
        return DateParts.Hours;
      case 'm':
        return DateParts.Minutes;
      case 's':
      case 'S':
        return DateParts.Seconds;
      case 't':
      case 'T':
        return DateParts.AmPm;
      default:
        return DateParts.Literal;
    }
  }

  private static getCleanVal(
    inputData: string,
    datePart: DatePartInfo,
    prompt?: string
  ): string {
    return DateTimeUtil.trimEmptyPlaceholders(
      inputData.substring(datePart.start, datePart.end),
      prompt
    );
  }

  private static escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private static trimEmptyPlaceholders(value: string, prompt?: string): string {
    const result = value.replace(
      new RegExp(DateTimeUtil.escapeRegExp(prompt ?? '_'), 'g'),
      ''
    );
    return result;
  }

  private static daysInMonth(fullYear: number, month: number): number {
    return new Date(fullYear, month + 1, 0).getDate();
  }

  private static prependValue(
    value: number,
    partLength: number,
    prependChar: string
  ): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private static toTwelveHourFormat(value: number): number {
    const hour12 = value % 12;
    return hour12 === 0 ? 12 : hour12;
  }
}
