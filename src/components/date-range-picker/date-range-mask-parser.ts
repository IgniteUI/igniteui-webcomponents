import {
  type DatePart,
  DatePartType,
  type IDatePart,
  type SpinOptions,
} from '../date-time-input/date-part.js';
import {
  type DateTimeMaskOptions,
  DateTimeMaskParser,
  DEFAULT_DATETIME_FORMAT,
} from '../date-time-input/datetime-mask-parser.js';
import { MaskParser } from '../mask-input/mask-parser.js';
import type { DateRangeValue } from '../types.js';

//#region Types and Enums

export interface DateRangePart {
  part: DatePart;
  position: DateRangePosition;
}

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
export interface DateRangeMaskOptions extends DateTimeMaskOptions {
  /** Separator (defaults to ' - ') */
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
  private _startParser: DateTimeMaskParser;
  private _endParser: DateTimeMaskParser;

  /** Cached date range parts with position information */
  private _rangeParts: IDateRangePart[] = [];

  /** The separator between start and end dates */
  private _separator: string;

  /** Start position of the separator in the mask */
  private _separatorStart: number;

  /** End position of the separator in the mask */
  private _separatorEnd: number;

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
      options?.promptCharacter
        ? { format: rangeFormat, promptCharacter: options.promptCharacter }
        : { format: rangeFormat }
    );

    // Create two parsers for start and end dates
    this._startParser = new DateTimeMaskParser({ format, promptCharacter });
    this._endParser = new DateTimeMaskParser({ format, promptCharacter });
    this._separator = separator;

    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + separator.length;

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
    const maskFormat =
      DateTimeMaskParser.convertDateFormatToMaskFormat(dateFormat);

    // Temporarily set the converted format for base class parsing
    const originalFormat = this._options.format;
    this._options.format = maskFormat;

    super._parseMaskLiterals();

    // Restore the original date format
    this._options.format = originalFormat;
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
    this._startParser.mask = value;
    this._endParser.mask = value;

    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + this._separator.length;

    const rangeFormat = `${value}${this._separator}${value}`;
    super.mask = rangeFormat;

    this._buildRangeParts();
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

    const startString = masked.substring(0, this._separatorStart);
    const endString = masked.substring(this._separatorEnd);

    const start = this._startParser.parseDate(startString);
    const end = this._endParser.parseDate(endString);

    return { start, end };
  }

  //#endregion

  //#region Date Range Formatting

  /**
   * Formats a DateRangeValue into a masked string using the two internal parsers.
   */
  public formatDateRange(range: DateRangeValue | null): string {
    const startString = range?.start
      ? this._startParser.formatDate(range.start)
      : this._startParser.emptyMask;

    const endString = range?.end
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

  //#region Spinning Support

  /**
   * Spins a date part within the range (for stepUp/stepDown functionality).
   * Delegates to the underlying date part's spin method.
   */
  public spinDateRangePart(
    part: IDateRangePart,
    delta: number,
    currentValue: DateRangeValue | null,
    spinLoop: boolean,
    amPmValue?: string
  ): DateRangeValue {
    const value = currentValue || { start: null, end: null };

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
      amPmValue,
    };

    part.spin(delta, spinOptions);

    return part.position === DateRangePosition.Start
      ? { ...value, start: newDate }
      : { ...value, end: newDate };
  }

  //#endregion
}
