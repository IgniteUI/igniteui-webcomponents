import { asNumber, clamp } from '#internals/utils/math.js';
import { type MaskOptions, MaskParser } from '../mask-input/mask-parser.js';
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

/** Default values for missing date parts */
const DEFAULT_DATE_VALUES = {
  year: 2000,
  month: 0,
  date: 1,
  hours: 0,
  minutes: 0,
  seconds: 0,
} as const;

/** Default date/time format */
export const DEFAULT_DATETIME_FORMAT = 'MM/dd/yyyy';

//#endregion

//#region Format conversion

/** A mutable date part under construction, before it is handed to `createDatePart`. */
type PartBuilder = DatePartOptions & { type: DatePartType };

/**
 * Converts a date format string into a mask pattern. Date characters become `0`, or `L`
 * for the alphabetic AM/PM marker; everything else is carried over as a literal.
 *
 * @example
 * ```ts
 * toMaskFormat('MM/dd/yyyy'); // '00/00/0000'
 * ```
 */
export function toMaskFormat(dateFormat: string): string {
  let result = '';

  for (const char of dateFormat) {
    const type = FORMAT_CHAR_TO_DATE_PART.get(char);
    result += type ? (type === DatePartType.AmPm ? 'L' : '0') : char;
  }

  return result;
}

/**
 * Widens a short year format to `yyyy` for editing purposes, `yy` excluded - a two digit
 * year is edited as two digits.
 */
function normalizeYearFormat(builders: PartBuilder[]): void {
  const year = builders.find((part) => part.type === DatePartType.Year);

  if (year && year.format.length !== 2) {
    year.end += 4 - year.format.length;
    year.format = 'yyyy';
  }
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
   * Built on first read, because {@link MaskParser} parses the mask from its constructor -
   * before any subclass field exists. Declared without an initializer so that it survives
   * the `_invalidate` call made from there.
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

  /**
   * The part at a cursor position. The end is inclusive, so a caret resting at the end of
   * a part still resolves to it.
   */
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

  /** Whether the format contains a day, month or year part. */
  public hasDateParts(): boolean {
    return this.parts.some((part) => DATE_PART_TYPES.has(part.type));
  }

  /** Whether the format contains an hours, minutes or seconds part. */
  public hasTimeParts(): boolean {
    return this.parts.some((part) => TIME_PART_TYPES.has(part.type));
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
    super({ ...options, format: options?.format || DEFAULT_DATETIME_FORMAT });
  }

  //#region Date Format Parsing

  protected override _buildParts(): IDatePart[] {
    const builders: PartBuilder[] = [];

    let run: PartBuilder | null = null;
    let position = 0;

    for (const char of this.mask) {
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

    normalizeYearFormat(builders);

    return builders.map(({ type, ...options }) =>
      createDatePart(type, options)
    );
  }

  //#endregion

  //#region Date Parsing

  /**
   * Parses a masked string into a Date object.
   * Returns null if the string cannot be parsed into a valid date.
   */
  public parseDate(masked: string): Date | null {
    const parts = this._extractDateValues(masked);

    // Convert to zero-based month (only if month is in format)
    if (parts[DatePartType.Month] !== undefined) {
      parts[DatePartType.Month]! -= 1;
    }

    // Apply century threshold for two-digit years (only if year is in format)
    if (
      parts[DatePartType.Year] !== undefined &&
      parts[DatePartType.Year]! < CENTURY_THRESHOLD
    ) {
      parts[DatePartType.Year]! += CENTURY_BASE;
    }

    if (!this._validateDateParts(parts)) {
      return null;
    }

    this._applyAmPmConversion(parts, masked);

    return this._createDateFromParts(parts);
  }

  /**
   * Extracts numeric values from the masked string for each date part.
   */
  private _extractDateValues(
    masked: string
  ): Partial<Record<DatePartType, number>> {
    const parts: Partial<Record<DatePartType, number>> = {};
    const prompt = this.prompt;

    for (const datePart of this.parts) {
      if (datePart.type === DatePartType.Literal) continue;

      const isMonthOrDate =
        datePart.type === DatePartType.Date ||
        datePart.type === DatePartType.Month;

      const raw = masked.substring(datePart.start, datePart.end);
      const cleaned = raw.replaceAll(prompt, '');
      const value = asNumber(cleaned);

      parts[datePart.type] = clamp(
        value,
        isMonthOrDate ? 1 : 0,
        Number.MAX_SAFE_INTEGER
      );
    }

    return parts;
  }

  /**
   * Validates that parsed date parts are within valid ranges.
   * Only validates parts that are present in the format.
   */
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

    const marker = masked
      .substring(amPm.start, amPm.end)
      .replaceAll(this.prompt, '');

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
    return new Date(
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
