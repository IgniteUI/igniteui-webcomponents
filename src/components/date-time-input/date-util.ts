import { parseISODate } from '../calendar/helpers.js';
import { MaskParser } from '../mask-input/mask-parser.js';

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
  private static readonly SEPARATOR = 'literal';
  private static readonly DEFAULT_LOCALE = 'en';
  private static readonly PREDEFINED_FORMATS = new Set([
    'short',
    'medium',
    'long',
    'full',
  ]);
  private static _parser = new MaskParser();

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

  public static getDefaultMask(locale: string): string {
    const parts = DateTimeUtil.getDefaultLocaleMask(
      locale || DateTimeUtil.DEFAULT_LOCALE
    );

    if (parts !== undefined) {
      parts.forEach((p: any) => {
        if (p.type !== DateParts.Year && p.type !== DateTimeUtil.SEPARATOR) {
          p.formatType = FormatDesc.TwoDigits;
        }
      });

      return DateTimeUtil.getMask(parts);
    }

    return '';
  }

  public static parseDateTimeFormat(
    mask: string,
    locale: string = DateTimeUtil.DEFAULT_LOCALE,
    noLeadingZero = false
  ): DatePartInfo[] {
    const format = mask || DateTimeUtil.getDefaultMask(locale);
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

        DateTimeUtil.addCurrentPart(currentPart, dateTimeParts, noLeadingZero);
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
      DateTimeUtil.addCurrentPart(currentPart!, dateTimeParts, noLeadingZero);
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

  public static formatDate(
    value: Date,
    locale: string,
    format: string,
    noLeadingZero = false
  ): string {
    const options: any = {};
    let formattedDate = '';

    switch (format) {
      case 'short':
      case 'long':
      case 'medium':
      case 'full':
        options.dateStyle = format;
        options.timeStyle = format;
        break;
      case 'shortDate':
      case 'longDate':
      case 'mediumDate':
      case 'fullDate':
        options.dateStyle = format.toLowerCase().split('date')[0];
        break;
      case 'shortTime':
      case 'longTime':
      case 'mediumTime':
      case 'fullTime':
        options.timeStyle = format.toLowerCase().split('time')[0];
        break;
      default:
        return DateTimeUtil.setDisplayFormatOptions(
          value,
          format,
          locale,
          noLeadingZero
        );
    }

    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat(locale, options);
    } catch {
      formatter = new Intl.DateTimeFormat(DateTimeUtil.DEFAULT_LOCALE, options);
    }

    formattedDate = formatter.format(value);

    return formattedDate;
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
            DateTimeUtil.toTwelveHourFormat(_dateValue!.getHours().toString()),
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
    const maxHour = 23;
    const minHour = 0;
    let hours = newDate.getHours() + delta;
    if (hours > maxHour) {
      hours = spinLoop ? (hours % maxHour) - 1 : maxHour;
    } else if (hours < minHour) {
      hours = spinLoop ? maxHour + (hours % maxHour) + 1 : minHour;
    }

    newDate.setHours(hours);
  }

  public static spinMinutes(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    const maxMinutes = 59;
    const minMinutes = 0;
    let minutes = newDate.getMinutes() + delta;
    if (minutes > maxMinutes) {
      minutes = spinLoop ? (minutes % maxMinutes) - 1 : maxMinutes;
    } else if (minutes < minMinutes) {
      minutes = spinLoop ? maxMinutes + (minutes % maxMinutes) + 1 : minMinutes;
    }

    newDate.setMinutes(minutes);
  }

  public static spinSeconds(
    delta: number,
    newDate: Date,
    spinLoop: boolean
  ): void {
    const maxSeconds = 59;
    const minSeconds = 0;
    let seconds = newDate.getSeconds() + delta;
    if (seconds > maxSeconds) {
      seconds = spinLoop ? (seconds % maxSeconds) - 1 : maxSeconds;
    } else if (seconds < minSeconds) {
      seconds = spinLoop ? maxSeconds + (seconds % maxSeconds) + 1 : minSeconds;
    }

    newDate.setSeconds(seconds);
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
  public static predefinedToDateDisplayFormat(format: string) {
    return format && DateTimeUtil.PREDEFINED_FORMATS.has(format)
      ? `${format}Date`
      : format;
  }

  private static setDisplayFormatOptions(
    value: Date,
    format: string,
    locale: string,
    noLeadingZero = false
  ) {
    const options: any = {};
    const parts = DateTimeUtil.parseDateTimeFormat(
      format,
      locale,
      noLeadingZero
    );

    const datePartFormatOptionMap = new Map([
      [DateParts.Date, 'day'],
      [DateParts.Month, 'month'],
      [DateParts.Year, 'year'],
      [DateParts.Hours, 'hour'],
      [DateParts.Minutes, 'minute'],
      [DateParts.Seconds, 'second'],
      [DateParts.AmPm, 'dayPeriod'],
    ]);

    const dateFormatMap = new Map([
      ['d', 'numeric'],
      ['dd', '2-digit'],
      ['M', 'numeric'],
      ['MM', '2-digit'],
      ['MMM', 'short'],
      ['MMMM', 'long'],
      ['MMMMM', 'narrow'],
      ['y', 'numeric'],
      ['yy', '2-digit'],
      ['yyy', 'numeric'],
      ['yyyy', 'numeric'],
      ['h', 'numeric'],
      ['hh', '2-digit'],
      ['H', 'numeric'],
      ['HH', '2-digit'],
      ['m', 'numeric'],
      ['mm', '2-digit'],
      ['s', 'numeric'],
      ['ss', '2-digit'],
      ['ttt', 'short'],
      ['tttt', 'long'],
      ['ttttt', 'narrow'],
    ]);

    for (const part of parts) {
      if (part.type !== DateParts.Literal) {
        const option = datePartFormatOptionMap.get(part.type);
        const format =
          dateFormatMap.get(part.format) ||
          dateFormatMap.get(part.format.substring(0, 2));

        if (option && format) {
          options[option] = format;

          if (part.type === DateParts.Hours) {
            if (part.format.charAt(0) === 'h') {
              options.hourCycle = 'h12';
            } else {
              options.hourCycle = 'h23';
            }
          }
        }

        // Need to be set if we have 't' or 'tt'.
        if (part.type === DateParts.AmPm && part.format.length <= 2) {
          options.hour = '2-digit';
          options.hourCycle = 'h12';
        }
      }
    }

    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat(
        locale,
        options as Intl.DateTimeFormatOptions
      );
    } catch {
      formatter = new Intl.DateTimeFormat(DateTimeUtil.DEFAULT_LOCALE, options);
    }

    const formattedParts = formatter.formatToParts(value);

    let result = '';

    for (const part of parts) {
      if (part.type === DateParts.Literal) {
        result += part.format;
        continue;
      }

      const option = datePartFormatOptionMap.get(part.type)!;
      result += formattedParts.filter((p) => p.type === option)[0]?.value || '';
    }

    return result;
  }

  private static getMask(dateStruct: any[]): string {
    const mask = [];

    for (const part of dateStruct) {
      switch (part.formatType) {
        case FormatDesc.Numeric: {
          if (part.type === DateParts.Day) {
            mask.push('d');
          } else if (part.type === DateParts.Month) {
            mask.push('M');
          } else {
            mask.push('yyyy');
          }
          break;
        }
        case FormatDesc.TwoDigits: {
          if (part.type === DateParts.Day) {
            mask.push('dd');
          } else if (part.type === DateParts.Month) {
            mask.push('MM');
          } else {
            mask.push('yy');
          }
        }
      }

      if (part.type === DateTimeUtil.SEPARATOR) {
        mask.push(part.value);
      }
    }

    return mask.join('');
  }

  private static addCurrentPart(
    currentPart: DatePartInfo,
    dateTimeParts: DatePartInfo[],
    noLeadingZero = false
  ): void {
    DateTimeUtil.ensureLeadingZero(currentPart, noLeadingZero);
    currentPart.end = currentPart.start + currentPart.format.length;
    dateTimeParts.push(currentPart);
  }

  private static ensureLeadingZero(part: DatePartInfo, noLeadingZero = false) {
    switch (part.type) {
      case DateParts.Date:
      case DateParts.Month:
      case DateParts.Hours:
      case DateParts.Minutes:
      case DateParts.Seconds:
        if (part.format.length === 1 && !noLeadingZero) {
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

  private static getDefaultLocaleMask(locale: string) {
    const dateStruct: any = [];
    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat(locale);
    } catch {
      return;
    }

    const formatToParts = formatter.formatToParts(new Date());

    for (const part of formatToParts) {
      if (part.type === DateTimeUtil.SEPARATOR) {
        dateStruct.push({
          type: DateTimeUtil.SEPARATOR,
          value: part.value,
        });
      } else {
        dateStruct.push({
          type: part.type,
        });
      }
    }

    const formatterOptions = formatter.resolvedOptions();

    for (const part of dateStruct) {
      switch (part.type) {
        case DateParts.Day: {
          part.formatType = formatterOptions.day;
          break;
        }
        case DateParts.Month: {
          part.formatType = formatterOptions.month;
          break;
        }
        case DateParts.Year: {
          part.formatType = formatterOptions.year;
          break;
        }
      }
    }

    DateTimeUtil.fillDatePartsPositions(dateStruct);
    return dateStruct;
  }

  private static fillDatePartsPositions(dateArray: any[]): void {
    let currentPos = 0;

    for (const part of dateArray) {
      // Day|Month part positions
      if (part.type === DateParts.Day || part.type === DateParts.Month) {
        // Offset 2 positions for number
        part.position = [currentPos, currentPos + 2];
        currentPos += 2;
      } else if (part.type === DateParts.Year) {
        // Year part positions
        switch (part.formatType) {
          case FormatDesc.Numeric: {
            // Offset 4 positions for full year
            part.position = [currentPos, currentPos + 4];
            currentPos += 4;
            break;
          }
          case FormatDesc.TwoDigits: {
            // Offset 2 positions for short year
            part.position = [currentPos, currentPos + 2];
            currentPos += 2;
            break;
          }
        }
      } else if (part.type === DateTimeUtil.SEPARATOR) {
        // Separator positions
        part.position = [currentPos, currentPos + 1];
        currentPos++;
      }
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

  private static toTwelveHourFormat(value: string): number {
    let hour = Number.parseInt(
      value.replace(
        new RegExp(DateTimeUtil.escapeRegExp(DateTimeUtil._parser.prompt), 'g'),
        '0'
      ),
      10
    );
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }
}
