import { isDate } from '../calendar/common/utils';

const enum FormatDesc {
  Numeric = 'numeric',
  TwoDigits = '2-digit',
}

export const enum DateParts {
  Day = 'day',
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  AmPm = 'ampm',
  Literal = 'literal',
}

export interface DatePartInfo {
  type: DateParts;
  start: number;
  end: number;
  format: string;
}

// const TIME_CHARS = ['d', 'D', 'M', 'y', 'Y'];
// const DATE_CHARS = ['h', 'H', 'm', 's', 'S', 't', 'T'];

export abstract class DateTimeUtil {
  public static readonly DEFAULT_INPUT_FORMAT = 'MM/dd/yyyy';
  public static readonly DEFAULT_TIME_INPUT_FORMAT = 'hh:mm tt';
  private static readonly SEPARATOR = 'literal';
  private static readonly DEFAULT_LOCALE = 'en';

  public static parseValueFromMask(
    inputData: string,
    dateTimeParts: DatePartInfo[],
    promptChar?: string
  ): Date | null {
    const parts: { [key in DateParts]: number } = {} as any;
    dateTimeParts.forEach((dp) => {
      let value = parseInt(
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
    locale = locale || DateTimeUtil.DEFAULT_LOCALE;
    if (
      !Intl ||
      !Intl.DateTimeFormat ||
      !Intl.DateTimeFormat.prototype.formatToParts
    ) {
      // TODO: fallback with Intl.format for IE?
      return DateTimeUtil.DEFAULT_INPUT_FORMAT;
    }
    const parts = DateTimeUtil.getDefaultLocaleMask(locale);

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

  public static parseDateTimeFormat(
    mask: string,
    locale: string = DateTimeUtil.DEFAULT_LOCALE
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

        DateTimeUtil.addCurrentPart(currentPart, dateTimeParts);
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
      DateTimeUtil.addCurrentPart(currentPart!, dateTimeParts);
    }
    // formats like "y" or "yyy" are treated like "yyyy" while editing
    const yearPart = dateTimeParts.filter((p) => p.type === DateParts.Year)[0];
    if (yearPart && yearPart.format !== 'yy') {
      yearPart.end += 4 - yearPart.format.length;
      yearPart.format = 'yyyy';
    }

    return dateTimeParts;
  }

  private static addCurrentPart(
    currentPart: DatePartInfo,
    dateTimeParts: DatePartInfo[]
  ): void {
    DateTimeUtil.ensureLeadingZero(currentPart);
    currentPart.end = currentPart.start + currentPart.format.length;
    dateTimeParts.push(currentPart);
  }

  private static ensureLeadingZero(part: DatePartInfo) {
    switch (part.type) {
      case DateParts.Date:
      case DateParts.Month:
      case DateParts.Hours:
      case DateParts.Minutes:
      case DateParts.Seconds:
        if (part.format.length === 1) {
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
    let formatter;
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

  private static trimEmptyPlaceholders(value: string, prompt?: string): string {
    const result = value.replace(new RegExp(prompt || '_', 'g'), '');
    return result;
  }

  private static daysInMonth(fullYear: number, month: number): number {
    return new Date(fullYear, month + 1, 0).getDate();
  }

  public static parseIsoDate(value: string): Date | null {
    let regex = /^\d{4}/g;
    const timeLiteral = 'T';
    if (regex.test(value)) {
      return new Date(
        value + `${value.indexOf(timeLiteral) === -1 ? 'T00:00:00' : ''}`
      );
    }

    regex = /^\d{2}/g;
    if (regex.test(value)) {
      const dateNow = new Date().toISOString();
      // eslint-disable-next-line prefer-const
      let [datePart, _timePart] = dateNow.split(timeLiteral);
      return new Date(`${datePart}T${value}`);
    }

    return null;
  }

  public static isValidDate(value: any): value is Date {
    if (isDate(value)) {
      return !isNaN(value.getTime());
    }

    return false;
  }

  public static formatDate(
    value: number | Date,
    locale: string,
    format: string
  ): string {
    let options: Intl.DateTimeFormatOptions = {};

    switch (format.toLowerCase()) {
      case 'short':
        options['dateStyle'] = 'short';
        options['timeStyle'] = 'short';
        break;
      case 'long':
        options['dateStyle'] = 'long';
        options['timeStyle'] = 'long';
        break;
      case 'medium':
        options['dateStyle'] = 'medium';
        options['timeStyle'] = 'medium';
        break;
      case 'full':
        options['dateStyle'] = 'full';
        options['timeStyle'] = 'full';
        break;
      default:
        options = this.setFormatOptions(format, locale);
        break;
    }

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat(locale, options);
    } catch {
      formatter = new Intl.DateTimeFormat(this.DEFAULT_LOCALE, options);
    }

    const formattedDate = formatter.format(value);

    return formattedDate;
  }

  //TODO: Decide with the team whether we should keep/edit this or remove it.
  private static setFormatOptions(format: string, locale: string) {
    const options: Intl.DateTimeFormatOptions = {};
    const parts = this.parseDateTimeFormat(format, locale);

    parts.forEach((p) => {
      switch (p.type) {
        case DateParts.Date:
          options['day'] = p.format === 'dd' ? '2-digit' : 'numeric';
          break;
        case DateParts.Year:
          options['year'] = p.format === 'yy' ? '2-digit' : 'numeric';
          break;
        case DateParts.Month:
          switch (p.format) {
            case 'M':
              options['month'] = 'numeric';
              break;
            case 'MM':
              options['month'] = '2-digit';
              break;
          }
          break;
        case DateParts.Hours:
          options['hour'] = p.format === 'hh' ? '2-digit' : 'numeric';
          break;
        case DateParts.Minutes:
          options['minute'] = p.format === 'mm' ? '2-digit' : 'numeric';
          break;
        case DateParts.Seconds:
          options['second'] = p.format === 'ss' ? '2-digit' : 'numeric';
          break;
        case DateParts.AmPm:
          options['dayPeriod'] = 'short';
          break;
      }
    });

    return options;
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
    switch (amPmFromMask) {
      case 'AM':
        newDate = new Date(newDate.setHours(newDate.getHours() + 12));
        break;
      case 'PM':
        newDate = new Date(newDate.setHours(newDate.getHours() - 12));
        break;
    }
    if (newDate.getDate() !== currentDate.getDate()) {
      return currentDate;
    }

    return newDate;
  }
}
