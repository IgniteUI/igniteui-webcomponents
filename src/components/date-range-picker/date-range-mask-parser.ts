import {
  DatePartType,
  type IDatePart,
  type SpinOptions,
} from '../date-time-input/date-part.js';
import {
  DateTimeMaskParser,
  DEFAULT_DATETIME_FORMAT,
} from '../date-time-input/datetime-mask-parser.js';
import { MaskParser } from '../mask-input/mask-parser.js';
import type { DateRangeValue } from './date-range-picker.js';

//#region Types and Enums

/** Position of a date part within the date range */
export enum DateRangePosition {
  Start = 'start',
  End = 'end',
  Separator = 'separator',
}

/** Extended date part with range position information */
export interface IDateRangePart extends IDatePart {
  position: DateRangePosition;
}

/** Options for the DateRangeMaskParser */
export interface DateRangeMaskOptions {
  /**
   * The date format string (e.g., 'MM/dd/yyyy').
   */
  format?: string;
  /** The prompt character for unfilled positions */
  promptCharacter?: string;
  /** Custom separator (defaults to ' - ') */
  separator?: string;
}

//#endregion

//#region Constants

/** Default separator between start and end dates */
const DEFAULT_SEPARATOR = ' - ';

//#endregion

/**
 * A specialized mask parser for date range input fields.
 * Uses composition with two DateTimeMaskParser instances to handle start and end dates.
 *
 * Accepts a single date format (e.g., 'MM/dd/yyyy') which creates two parsers
 * internally, one for the start date and one for the end date.
 *
 * @example
 * ```ts
 * const parser = new DateRangeMaskParser({ format: 'MM/dd/yyyy' });
 * parser.parseDateRange('12/25/2023 - 12/31/2023'); // Returns DateRangeValue
 * parser.formatDateRange({ start: date1, end: date2 }); // Returns formatted string
 * ```
 */
export class DateRangeMaskParser extends MaskParser {
  /** Parser for the start date */
  private _startParser: DateTimeMaskParser;

  /** Parser for the end date */
  private _endParser: DateTimeMaskParser;

  /** Cached date range parts with position information */
  private _rangeParts: IDateRangePart[] = [];

  /** The separator between start and end dates */
  private _separator: string;

  /** Start position of the separator in the mask */
  private _separatorStart: number;

  /** End position of the separator in the mask */
  private _separatorEnd: number;

  /** Flag to prevent recursive mask setting */
  private _isUpdatingMask = false;

  /**
   * Gets the parsed date range parts with position information.
   */
  public get rangeParts(): ReadonlyArray<IDateRangePart> {
    return this._rangeParts;
  }

  /**
   * Gets the separator string used between start and end dates.
   */
  public get separator(): string {
    return this._separator;
  }

  constructor(options?: DateRangeMaskOptions) {
    const format = options?.format || DEFAULT_DATETIME_FORMAT;
    const separator = options?.separator || DEFAULT_SEPARATOR;
    const promptCharacter = options?.promptCharacter;

    // Build the combined range format for the parent MaskParser
    const rangeFormat = `${format}${separator}${format}`;

    super(
      promptCharacter
        ? { format: rangeFormat, promptCharacter }
        : { format: rangeFormat }
    );

    // Create two parsers for start and end dates
    const parserOptions = promptCharacter
      ? { format, promptCharacter }
      : { format };
    this._startParser = new DateTimeMaskParser(parserOptions);
    this._endParser = new DateTimeMaskParser(parserOptions);
    this._separator = separator;

    // Calculate separator positions
    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + separator.length;

    // Build range parts from the two parsers
    this._buildRangeParts();
  }

  //#region Mask Format Conversion

  /**
   * Overrides base class to convert date format to mask format
   * before parsing literals. This ensures date format characters
   * (M, d, y, etc.) are properly converted to mask characters (0, L).
   */
  protected override _parseMaskLiterals(): void {
    // Convert the range format to mask format
    // e.g., "M/d/yyyy - M/d/yyyy" → "0/0/0000 - 0/0/0000"
    const dateFormat = this._options.format;
    const maskFormat = this._convertDateFormatToMaskFormat(dateFormat);

    // Temporarily set the converted format for base class parsing
    const originalFormat = this._options.format;
    this._options.format = maskFormat;

    super._parseMaskLiterals();

    // Restore the original date format
    this._options.format = originalFormat;
  }

  /**
   * Converts date format characters to mask format characters.
   * Date parts become '0' (numeric) and time markers become 'L' (alpha).
   */
  private _convertDateFormatToMaskFormat(dateFormat: string): string {
    // Set of date/time format characters
    const dateChars = new Set([
      'M',
      'd',
      'y',
      'Y',
      'D',
      'h',
      'H',
      'm',
      's',
      'S',
      't',
      'T',
    ]);

    let result = '';
    for (const char of dateFormat) {
      if (dateChars.has(char)) {
        // AM/PM markers are alphabetic, others are numeric
        result += char === 't' || char === 'T' ? 'L' : '0';
      } else {
        result += char;
      }
    }
    return result;
  }

  //#endregion

  /**
   * Builds the range parts array by combining parts from start and end parsers
   * and adding position information.
   */
  private _buildRangeParts(): void {
    const startParts = this._startParser.dateParts.map(
      (part): IDateRangePart => ({
        ...part,
        position: DateRangePosition.Start,
        // Explicitly bind methods to preserve functionality
        getValue: part.getValue.bind(part),
        validate: part.validate.bind(part),
        spin: part.spin.bind(part),
      })
    );

    const endParts = this._endParser.dateParts.map(
      (part): IDateRangePart => ({
        ...part,
        // Adjust positions for end date (offset by separator)
        start: part.start + this._separatorEnd,
        end: part.end + this._separatorEnd,
        position: DateRangePosition.End,
        // Delegate methods to the original part
        getValue: part.getValue.bind(part),
        validate: part.validate.bind(part),
        spin: part.spin.bind(part),
      })
    );

    this._rangeParts = [...startParts, ...endParts];
  }

  /**
   * Sets a new date format and updates both parsers.
   */
  public override set mask(value: string) {
    // Prevent recursive calls when we set the parent mask
    if (this._isUpdatingMask) {
      return;
    }

    this._isUpdatingMask = true;

    try {
      // Update both parsers with the new format
      this._startParser.mask = value;
      this._endParser.mask = value;

      // Recalculate separator positions
      this._separatorStart = this._startParser.mask.length;
      this._separatorEnd = this._separatorStart + this._separator.length;

      // Update parent mask with combined format
      const rangeFormat = `${value}${this._separator}${value}`;
      super.mask = rangeFormat;

      // Rebuild range parts
      this._buildRangeParts();
    } finally {
      this._isUpdatingMask = false;
    }
  }

  public override get mask(): string {
    return super.mask;
  }

  //#region Date Range Parsing

  /**
   * Parses a masked string into a DateRangeValue using the two internal parsers.
   * Returns null if the string cannot be parsed.
   */
  public parseDateRange(masked: string): DateRangeValue | null {
    if (!masked || masked === this.emptyMask) {
      return null;
    }

    // Extract start and end date strings
    const startString = masked.substring(0, this._separatorStart);
    const endString = masked.substring(this._separatorEnd);

    // Delegate parsing to the individual parsers
    const start = this._startParser.parseDate(startString);
    const end = this._endParser.parseDate(endString);

    if (!start && !end) {
      return null;
    }

    return { start, end };
  }

  //#endregion

  //#region Date Range Formatting

  /**
   * Formats a DateRangeValue into a masked string using the two internal parsers.
   */
  public formatDateRange(range: DateRangeValue | null): string {
    // If range is completely null/undefined, return the empty masks
    if (!range) {
      return (
        this._startParser.emptyMask +
        this._separator +
        this._endParser.emptyMask
      );
    }

    // Delegate formatting to the individual parsers
    const startString = range.start
      ? this._startParser.formatDate(range.start)
      : this._startParser.emptyMask;

    const endString = range.end
      ? this._endParser.formatDate(range.end)
      : this._endParser.emptyMask;

    return startString + this._separator + endString;
  }

  //#endregion

  //#region Part Queries

  /**
   * Gets the date range part at a cursor position.
   * Uses exclusive end for precise character targeting.
   */
  public getDateRangePartAtPosition(
    position: number
  ): IDateRangePart | undefined {
    return this._rangeParts.find(
      (part) => position >= part.start && position < part.end
    );
  }

  /**
   * Gets the date range part for cursor (inclusive end).
   * Handles the edge case where cursor is at the end of the last part.
   */
  public getDateRangePartForCursor(
    position: number
  ): IDateRangePart | undefined {
    return this._rangeParts.find(
      (part) => position >= part.start && position <= part.end
    );
  }

  /**
   * Gets all parts for a specific position (start or end).
   */
  public getPartsForPosition(
    position: DateRangePosition
  ): ReadonlyArray<IDateRangePart> {
    return this._rangeParts.filter((p) => p.position === position);
  }

  /**
   * Gets a specific part type for a position.
   */
  public getPartByTypeAndPosition(
    type: DatePartType,
    position: DateRangePosition
  ): IDateRangePart | undefined {
    return this._rangeParts.find(
      (p) => p.type === type && p.position === position
    );
  }

  /**
   * Gets the first non-literal date part for a position.
   */
  public getFirstDatePartForPosition(
    position: DateRangePosition
  ): IDateRangePart | undefined {
    return this._rangeParts.find(
      (p) => p.position === position && p.type !== DatePartType.Literal
    );
  }

  //#endregion

  //#region Override for Date Range Mask

  //#endregion

  //#region Spinning Support

  /**
   * Spins a date part within the range (for stepUp/stepDown functionality).
   * Delegates to the underlying date part's spin method.
   */
  public spinDateRangePart(
    part: IDateRangePart,
    delta: number,
    currentValue: DateRangeValue | null,
    spinLoop: boolean
  ): DateRangeValue {
    // Ensure we have a value to work with
    const value = currentValue || { start: null, end: null };

    // Determine which date to spin
    const targetDate =
      part.position === DateRangePosition.Start ? value.start : value.end;

    // If no date exists, create one with today's date
    const dateToSpin = targetDate || new Date();

    // Create a new date instance to spin
    const newDate = new Date(dateToSpin.getTime());

    // Spin using the part's built-in spin method
    const spinOptions: SpinOptions = {
      date: newDate,
      spinLoop,
      originalDate: dateToSpin,
    };

    part.spin(delta, spinOptions);

    // Return updated range
    return {
      ...value,
      start: part.position === DateRangePosition.Start ? newDate : value.start,
      end: part.position === DateRangePosition.End ? newDate : value.end,
    };
  }

  //#endregion
}
