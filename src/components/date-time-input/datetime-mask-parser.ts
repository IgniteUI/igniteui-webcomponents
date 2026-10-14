import { createDate } from '#internals/date/model.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import {
  escapeMaskFlags,
  type MaskOptions,
  MaskParser,
} from '../mask-input/mask-parser.js';
import {
  createDatePart,
  DATE_PART_TYPES,
  type DatePartOptions,
  DatePartType,
  type IDatePart,
  TIME_PART_TYPES,
} from './date-part.js';

//#region Constants

/** Maps format characters to their corresponding DatePartType */
const FORMAT_CHAR_TO_DATE_PART = new Map<string, DatePartType>([
  ['d', DatePartType.Date],
  ['D', DatePartType.Date],
  ['M', DatePartType.Month],
  ['y', DatePartType.Year],
  ['Y', DatePartType.Year],
  ['h', DatePartType.Hours],
  ['H', DatePartType.Hours],
  ['m', DatePartType.Minutes],
  ['s', DatePartType.Seconds],
  ['S', DatePartType.Seconds],
  ['t', DatePartType.AmPm],
  ['T', DatePartType.AmPm],
]);

/** Century threshold for two-digit year interpretation */
const CENTURY_THRESHOLD = 50;
const CENTURY_BASE = 2000;

/**
 * Applies the century threshold to a year of one or two typed digits. Keeps a year of
 * three or four typed digits.
 */
function resolveYear(year: number, typed: string): number {
  if (typed.length > 2) {
    return year;
  }

  return year + (year < CENTURY_THRESHOLD ? CENTURY_BASE : CENTURY_BASE - 100);
}

/** Default values for missing date parts */
const DEFAULT_DATE_VALUES = {
  year: 2000,
  month: 0,
  date: 1,
  hours: 0,
  minutes: 0,
  seconds: 0,
} as const;

const DEFAULT_DATETIME_FORMAT = 'MM/dd/yyyy';

//#endregion

//#region Format conversion

/** A mutable date part under construction, before it is handed to `createDatePart`. */
type PartBuilder = DatePartOptions & { type: DatePartType };

/**
 * Converts a date format string into a mask pattern. Date characters become `0`, or `L`
 * for the alphabetic AM/PM marker. Other characters stay literal.
 */
function toMaskFormat(dateFormat: string): string {
  let result = '';

  for (const char of dateFormat) {
    const type = FORMAT_CHAR_TO_DATE_PART.get(char);

    if (!type) {
      result += escapeMaskFlags(char);
    } else {
      result += type === DatePartType.AmPm ? 'L' : '0';
    }
  }

  return result;
}

/** Widens each year run, except `yy`, to four characters. Keeps the case of the run. */
function normalizeYearFormat(format: string): string {
  return format.replace(/y+|Y+/g, (run) =>
    run.length === 2 ? run : run[0].repeat(4)
  );
}

function hasPartOf(format: string, types: ReadonlySet<DatePartType>): boolean {
  for (const char of format) {
    const type = FORMAT_CHAR_TO_DATE_PART.get(char);
    if (type && types.has(type)) {
      return true;
    }
  }
  return false;
}

/** Returns whether a date format has a day, month or year part. */
export function formatHasDateParts(format: string): boolean {
  return hasPartOf(format, DATE_PART_TYPES);
}

/** Returns whether a date format has an hours, minutes or seconds part. */
export function formatHasTimeParts(format: string): boolean {
  return hasPartOf(format, TIME_PART_TYPES);
}

//#endregion

/**
 * Base for parsers whose public format is a date/time format string rather than a mask
 * pattern. Owns the translation between the two and the list of positioned parts.
 */
export abstract class DateFormatMaskParser<
  T extends IDatePart = IDatePart,
> extends MaskParser {
  /**
   * Built on first read, because {@link MaskParser} parses the mask in its constructor.
   * It has no initializer, so it survives the `_invalidate` call from there.
   */
  private _parts?: T[];

  /** The positioned parts of the current format, literals included. */
  public get parts(): ReadonlyArray<T> {
    this._parts ??= this._buildParts();
    return this._parts;
  }

  protected abstract _buildParts(): T[];

  protected override _toMaskFormat(format: string): string {
    return toMaskFormat(format);
  }

  protected override _invalidate(): void {
    super._invalidate();
    this._parts = undefined;
  }

  /** The part at a cursor position. The end is inclusive, so a caret at a part end resolves to it. */
  public getPartForCursor(position: number): T | undefined {
    return this.parts.find(
      (part) =>
        part.type !== DatePartType.Literal &&
        position >= part.start &&
        position <= part.end
    );
  }

  /** The first part of the given type, if the format contains one. */
  public getPartByType(type: DatePartType): T | undefined {
    return this.parts.find((part) => part.type === type);
  }

  /** The first non-literal part - the default target when nothing is focused. */
  public getFirstPart(): T | undefined {
    return this.parts.find((part) => part.type !== DatePartType.Literal);
  }

  /** Whether every date/time position is still a prompt, so there is nothing to complete. */
  public isBlank(masked: string): boolean {
    return this.parts.every(
      (part) =>
        part.type === DatePartType.Literal || !this._typedPart(masked, part)
    );
  }

  /** Whether the format contains a day, month or year part. */
  public hasDateParts(): boolean {
    return this.parts.some((part) => DATE_PART_TYPES.has(part.type));
  }

  /** Whether the format contains an hours, minutes or seconds part. */
  public hasTimeParts(): boolean {
    return this.parts.some((part) => TIME_PART_TYPES.has(part.type));
  }

  /** The characters typed into `part`, the prompts of the unfilled positions removed. */
  protected _typedPart(masked: string, part: T): string {
    return masked.substring(part.start, part.end).replaceAll(this.prompt, '');
  }
}

/**
 * A mask parser for date/time input fields.
 *
 * @example
 * ```ts
 * const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
 * parser.apply('12252023');       // '12/25/2023'
 * parser.parseDate('12/25/2023'); // Date
 * ```
 */
export class DateTimeMaskParser extends DateFormatMaskParser {
  constructor(options?: MaskOptions) {
    super({
      ...options,
      format: normalizeYearFormat(options?.format || DEFAULT_DATETIME_FORMAT),
    });
  }

  public override get mask(): string {
    return super.mask;
  }

  /** Sets the date format. Widens each year format, except `yy`, to four characters. */
  public override set mask(value: string) {
    super.mask = value && normalizeYearFormat(value);
  }

  //#region Date Format Parsing

  protected override _buildParts(): IDatePart[] {
    const builders: PartBuilder[] = [];

    let run: PartBuilder | null = null;
    let position = 0;

    // Iterate by UTF-16 code unit, like the mask positions.
    for (const char of this.mask.split('')) {
      const type = FORMAT_CHAR_TO_DATE_PART.get(char);

      // A part runs only while the same format character repeats - 'MM' is one part,
      // 'Mm' is two - and any literal closes it.
      if (run && !(type && run.format.includes(char))) {
        builders.push(run);
        run = null;
      }

      if (run) {
        run.end = position + 1;
        run.format += char;
      } else {
        const builder: PartBuilder = {
          type: type ?? DatePartType.Literal,
          start: position,
          end: position + 1,
          format: char,
        };

        if (type) {
          run = builder;
        } else {
          builders.push(builder);
        }
      }

      position++;
    }

    if (run) {
      builders.push(run);
    }

    return builders.map(({ type, ...options }) =>
      createDatePart(type, options)
    );
  }

  //#endregion

  //#region Date Parsing

  /** Parses a masked string into a Date. Returns null if it is not a valid date. */
  public parseDate(masked: string): Date | null {
    const parts = this._extractDateValues(masked);

    // Convert to zero-based month (only if month is in format)
    if (parts[DatePartType.Month] !== undefined) {
      parts[DatePartType.Month]! -= 1;
    }

    if (!this._validateDateParts(parts)) {
      return null;
    }

    this._applyAmPmConversion(parts, masked);

    return this._createDateFromParts(parts);
  }

  private _extractDateValues(
    masked: string
  ): Partial<Record<DatePartType, number>> {
    const parts: Partial<Record<DatePartType, number>> = {};

    for (const datePart of this.parts) {
      if (datePart.type === DatePartType.Literal) continue;

      const isMonthOrDate =
        datePart.type === DatePartType.Date ||
        datePart.type === DatePartType.Month;

      const typed = this._typedPart(masked, datePart);
      const value = clamp(
        asNumber(typed),
        isMonthOrDate ? 1 : 0,
        Number.MAX_SAFE_INTEGER
      );

      parts[datePart.type] =
        datePart.type === DatePartType.Year ? resolveYear(value, typed) : value;
    }

    return parts;
  }

  /** Checks that the parsed parts of the format are in range. */
  private _validateDateParts(
    parts: Partial<Record<DatePartType, number>>
  ): boolean {
    // Day-of-month validation needs both, so the context is built up front.
    const context = {
      year: parts[DatePartType.Year],
      month: parts[DatePartType.Month],
    };

    return this.parts.every((datePart) => {
      const value = parts[datePart.type];

      return datePart.type === DatePartType.Literal || value === undefined
        ? true
        : datePart.validate(value, context);
    });
  }

  /**
   * Applies AM/PM conversion to hours if format includes AM/PM.
   */
  private _applyAmPmConversion(
    parts: Partial<Record<DatePartType, number>>,
    masked: string
  ): void {
    const amPm = this.getPartByType(DatePartType.AmPm);
    const hours = parts[DatePartType.Hours];

    // A format can carry an AM/PM marker without an hours part; there is nothing to shift.
    if (!amPm || hours === undefined) {
      return;
    }

    const marker = this._typedPart(masked, amPm);

    parts[DatePartType.Hours] =
      (hours % 12) + (marker.toLowerCase() === 'pm' ? 12 : 0);
  }

  /**
   * Creates a Date object from parsed parts with defaults for missing values.
   */
  private _createDateFromParts(
    parts: Partial<Record<DatePartType, number>>
  ): Date {
    const d = DEFAULT_DATE_VALUES;
    return createDate(
      parts[DatePartType.Year] ?? d.year,
      parts[DatePartType.Month] ?? d.month,
      parts[DatePartType.Date] ?? d.date,
      parts[DatePartType.Hours] ?? d.hours,
      parts[DatePartType.Minutes] ?? d.minutes,
      parts[DatePartType.Seconds] ?? d.seconds
    );
  }

  //#endregion

  //#region Date Formatting

  /**
   * Formats a Date object into a masked string according to the current format.
   */
  public formatDate(date: Date | null): string {
    return date
      ? this.parts.map((part) => part.getValue(date)).join('')
      : this.emptyMask;
  }

  //#endregion
}
