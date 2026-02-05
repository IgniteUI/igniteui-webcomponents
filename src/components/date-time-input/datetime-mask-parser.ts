import { asNumber, clamp } from '../common/util.js';
import { MaskParser } from '../mask-input/mask-parser.js';
import { createDatePart, DatePartType, type IDatePart } from './date-part.js';

//#region Types and Enums

/**
 * Types of date/time parts that can appear in a format string.
 * Re-exported from date-part.ts for backward compatibility.
 */
export { DatePartType as DateParts };

/**
 * Re-export createDatePart factory for creating standalone parts.
 */
export { createDatePart };

/**
 * Information about a parsed date part within a format string.
 * This is a type alias for IDatePart for backward compatibility.
 */
export type DatePartInfo = IDatePart;

/** Options for the DateTimeMaskParser */
export interface DateTimeMaskOptions {
  /** The date/time format string (e.g., 'MM/dd/yyyy', 'HH:mm:ss') */
  format?: string;
  /** The prompt character for unfilled positions */
  promptCharacter?: string;
}

//#endregion

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

/** Set of valid date/time format characters */
const DATE_FORMAT_CHARS = new Set(FORMAT_CHAR_TO_DATE_PART.keys());

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
const DEFAULT_DATETIME_FORMAT = 'MM/dd/yyyy';

//#endregion

/**
 * A specialized mask parser for date/time input fields.
 * Extends MaskParser to handle date-specific format patterns and validation.
 *
 * @example
 * ```ts
 * const parser = new DateTimeMaskParser({ format: 'MM/dd/yyyy' });
 * parser.apply('12252023'); // Returns '12/25/2023'
 * parser.parseDate('12/25/2023'); // Returns Date object
 * ```
 */
export class DateTimeMaskParser extends MaskParser {
  /** Parsed date parts from the format string */
  private _dateParts!: IDatePart[];

  /**
   * Gets the parsed date parts from the format string.
   * Each part contains type, position, and format information.
   */
  public get dateParts(): ReadonlyArray<IDatePart> {
    return this._dateParts;
  }

  constructor(options?: DateTimeMaskOptions) {
    const format = options?.format || DEFAULT_DATETIME_FORMAT;

    super(
      options?.promptCharacter
        ? { format, promptCharacter: options.promptCharacter }
        : { format }
    );
  }

  /**
   * Sets a new date/time format and re-parses the date parts.
   */
  public override set mask(value: string) {
    super.mask = value;
    this._parseDateFormat();
  }

  public override get mask(): string {
    return super.mask;
  }

  //#region Date Format Parsing

  /**
   * Parses the format string into IDatePart objects.
   * This identifies each date/time component and its position.
   */
  private _parseDateFormat(): void {
    const format = this.mask;
    const builders: Array<{
      type: DatePartType;
      start: number;
      end: number;
      format: string;
    }> = [];
    const chars = Array.from(format);
    const length = chars.length;

    let currentBuilder: (typeof builders)[0] | null = null;
    let position = 0;

    for (let i = 0; i < length; i++, position++) {
      const char = chars[i];
      const partType = FORMAT_CHAR_TO_DATE_PART.get(char);

      if (partType) {
        // Date/time format character
        if (currentBuilder?.format.includes(char)) {
          // Continue building the same part
          currentBuilder.end = position + 1;
          currentBuilder.format += char;
        } else {
          // Start a new part
          if (currentBuilder) {
            builders.push(currentBuilder);
          }
          currentBuilder = {
            type: partType,
            start: position,
            end: position + 1,
            format: char,
          };
        }
      } else {
        // Literal character
        if (currentBuilder) {
          builders.push(currentBuilder);
          currentBuilder = null;
        }
        builders.push({
          type: DatePartType.Literal,
          start: position,
          end: position + 1,
          format: char,
        });
      }
    }

    // Don't forget the last part
    if (currentBuilder) {
      builders.push(currentBuilder);
    }

    // Normalize year format for editing (except 'yy')
    this._normalizeYearFormatBuilder(builders);

    // Create immutable date parts from builders using factory
    this._dateParts = builders.map((b) =>
      createDatePart(b.type, { start: b.start, end: b.end, format: b.format })
    );
  }

  /**
   * Normalizes year format to 'yyyy' for editing (except for 'yy').
   * Also updates the end position to account for the expanded format.
   */
  private _normalizeYearFormatBuilder(
    builders: Array<{ type: DatePartType; end: number; format: string }>
  ): void {
    const yearBuilder = builders.find((b) => b.type === DatePartType.Year);
    if (yearBuilder && yearBuilder.format.length !== 2) {
      const expansion = 4 - yearBuilder.format.length;
      yearBuilder.end += expansion;
      yearBuilder.format = 'yyyy';
    }
  }

  //#endregion

  //#region Date Parsing

  /**
   * Parses a masked string into a Date object.
   * Returns null if the string cannot be parsed into a valid date.
   *
   * @param masked - The masked input string to parse
   * @returns A Date object or null if parsing fails
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

    // Handle AM/PM conversion
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

    for (const datePart of this._dateParts) {
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
   * Uses the validate() method on each date part instance.
   */
  private _validateDateParts(
    parts: Partial<Record<DatePartType, number>>
  ): boolean {
    // Build validation context for date-dependent validation
    const context = {
      year: parts[DatePartType.Year],
      month: parts[DatePartType.Month],
    };

    // Validate each parsed value using its corresponding part instance
    for (const datePart of this._dateParts) {
      if (datePart.type === DatePartType.Literal) continue;

      const value = parts[datePart.type];
      if (value === undefined) continue;

      if (!datePart.validate(value, context)) {
        return false;
      }
    }

    // Additional check: validate date against month/year context
    // (the part's validate method needs both year and month for proper validation)
    if (
      parts[DatePartType.Date] !== undefined &&
      parts[DatePartType.Month] !== undefined &&
      parts[DatePartType.Year] !== undefined
    ) {
      if (
        parts[DatePartType.Date]! >
        this._daysInMonth(parts[DatePartType.Year]!, parts[DatePartType.Month]!)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Applies AM/PM conversion to hours if format includes AM/PM.
   */
  private _applyAmPmConversion(
    parts: Partial<Record<DatePartType, number>>,
    masked: string
  ): void {
    const amPmPart = this._dateParts.find((p) => p.type === DatePartType.AmPm);
    if (!amPmPart) return;

    parts[DatePartType.Hours]! %= 12;

    const amPmValue = masked
      .substring(amPmPart.start, amPmPart.end)
      .replaceAll(this.prompt, '');

    if (amPmValue.toLowerCase() === 'pm') {
      parts[DatePartType.Hours]! += 12;
    }
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

  /**
   * Gets the number of days in a specific month/year.
   */
  private _daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  //#endregion

  //#region Date Formatting

  /**
   * Formats a Date object into a masked string according to the current format.
   *
   * @param date - The date to format
   * @returns The formatted masked string
   */
  public formatDate(date: Date | null): string {
    return date
      ? this._dateParts.map((part) => part.getValue(date)).join('')
      : this.emptyMask;
  }

  //#endregion

  //#region Part Queries

  /**
   * Finds the date part at a given cursor position.
   * Uses exclusive end (position < end) for precise character targeting.
   *
   * @param position - The cursor position to check
   * @returns The DatePartInfo at that position, or undefined if not found
   */
  public getDatePartAtPosition(position: number): DatePartInfo | undefined {
    return this._dateParts.find(
      (p) =>
        p.type !== DatePartType.Literal &&
        position >= p.start &&
        position < p.end
    );
  }

  /**
   * Finds the date part for a cursor position, using inclusive end.
   * This handles the edge case where cursor is at the end of the mask
   * (position equals the end of the last part).
   *
   * @param position - The cursor position to check
   * @returns The DatePartInfo at that position, or undefined if not found
   */
  public getDatePartForCursor(position: number): DatePartInfo | undefined {
    return this._dateParts.find(
      (p) =>
        p.type !== DatePartType.Literal &&
        position >= p.start &&
        position <= p.end
    );
  }

  /**
   * Checks if the format includes any date parts (day, month, year).
   */
  public hasDateParts(): boolean {
    return this._dateParts.some(
      (p) =>
        p.type === DatePartType.Date ||
        p.type === DatePartType.Month ||
        p.type === DatePartType.Year
    );
  }

  /**
   * Checks if the format includes any time parts (hours, minutes, seconds).
   */
  public hasTimeParts(): boolean {
    return this._dateParts.some(
      (p) =>
        p.type === DatePartType.Hours ||
        p.type === DatePartType.Minutes ||
        p.type === DatePartType.Seconds
    );
  }

  /**
   * Gets the first non-literal date part (useful for default selection).
   */
  public getFirstDatePart(): DatePartInfo | undefined {
    return this._dateParts.find((p) => p.type !== DatePartType.Literal);
  }

  /**
   * Gets a specific type of date part.
   */
  public getPartByType(type: DatePartType): DatePartInfo | undefined {
    return this._dateParts.find((p) => p.type === type);
  }

  //#endregion

  //#region Override for Date-Specific Mask

  /**
   * Builds the internal mask pattern from the date format.
   * Converts date format characters to mask pattern characters.
   */
  protected override _parseMaskLiterals(): void {
    // First, convert date format to mask format
    const dateFormat = this._options.format;
    const maskFormat = this._convertToMaskFormat(dateFormat);

    // Temporarily set the converted format for the base class parsing
    const originalFormat = this._options.format;
    this._options.format = maskFormat;

    super._parseMaskLiterals();

    // Restore the original date format
    this._options.format = originalFormat;

    // Parse date-specific format structure
    this._parseDateFormat();
  }

  /**
   * Converts a date format string to a mask format string.
   * Date format chars become '0' (numeric) or 'L' (alpha for AM/PM).
   */
  private _convertToMaskFormat(dateFormat: string): string {
    let result = '';

    for (const char of dateFormat) {
      if (DATE_FORMAT_CHARS.has(char)) {
        // AM/PM markers are alphabetic, others are numeric
        result += char === 't' || char === 'T' ? 'L' : '0';
      } else {
        result += char;
      }
    }

    return result;
  }

  //#endregion
}
