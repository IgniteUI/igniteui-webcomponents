import {
  createDatePart,
  type DatePart,
  DatePartType,
  type IDatePart,
  type SpinOptions,
} from '../date-time-input/date-part.js';
import {
  DateFormatMaskParser,
  DateTimeMaskParser,
  DEFAULT_DATETIME_FORMAT,
} from '../date-time-input/datetime-mask-parser.js';
import type { MaskOptions } from '../mask-input/mask-parser.js';
import type { DateRangeValue } from '../types.js';

//#region Types and Enums

/**
 * @hidden
 */
export interface DateRangePart {
  part: DatePart;
  position: DateRangePosition;
}

/**
 * Position of a date part within the date range
 * @hidden
 */
export enum DateRangePosition {
  Start = 'start',
  End = 'end',
  Separator = 'separator',
}

/**
 * Extended date part with range position information
 * @hidden
 */
export interface IDateRangePart extends IDatePart {
  position: DateRangePosition;
}

/** Options for the DateRangeMaskParser */
export interface DateRangeMaskOptions extends MaskOptions {
  /** Separator (defaults to ' - ') */
  separator?: string;
}

//#endregion

//#region Constants

/** Default separator between start and end dates */
const DEFAULT_SEPARATOR = ' - ';

//#endregion

/**
 * Re-creates one date's parts at their position within the range. Going back through the
 * factory keeps them real part instances - spreading would copy the data and lose the
 * prototype along with it.
 */
function offsetParts(
  parts: ReadonlyArray<IDatePart>,
  offset: number,
  position: DateRangePosition
): IDateRangePart[] {
  return parts.map((part) =>
    Object.assign(
      createDatePart(part.type, {
        start: part.start + offset,
        end: part.end + offset,
        format: part.format,
      }),
      { position }
    )
  );
}

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
export class DateRangeMaskParser extends DateFormatMaskParser<IDateRangePart> {
  private _startParser: DateTimeMaskParser;
  private _endParser: DateTimeMaskParser;

  /** The separator between start and end dates */
  private _separator: string;

  /** Start position of the separator in the mask */
  private _separatorStart: number;

  /** End position of the separator in the mask */
  private _separatorEnd: number;

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

    super({ format: `${format}${separator}${format}`, promptCharacter });

    this._startParser = new DateTimeMaskParser({ format, promptCharacter });
    this._endParser = new DateTimeMaskParser({ format, promptCharacter });
    this._separator = separator;
    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + separator.length;
  }

  protected override _buildParts(): IDateRangePart[] {
    return [
      ...offsetParts(this._startParser.parts, 0, DateRangePosition.Start),
      ...offsetParts(
        this._endParser.parts,
        this._separatorEnd,
        DateRangePosition.End
      ),
    ];
  }

  /**
   * Sets a new date format and updates both parsers.
   *
   * @remarks
   * Takes the format of a *single* date; the getter returns the combined range format.
   */
  public override set mask(value: string) {
    this._startParser.mask = value;
    this._endParser.mask = value;

    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + this._separator.length;

    super.mask = `${value}${this._separator}${value}`;
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

    const start = this._startParser.parseDate(
      masked.substring(0, this._separatorStart)
    );
    const end = this._endParser.parseDate(masked.substring(this._separatorEnd));

    return { start, end };
  }

  //#endregion

  //#region Date Range Formatting

  /**
   * Formats a DateRangeValue into a masked string using the two internal parsers.
   */
  public formatDateRange(range: DateRangeValue | null): string {
    const start = this._startParser.formatDate(range?.start ?? null);
    const end = this._endParser.formatDate(range?.end ?? null);

    return start + this._separator + end;
  }

  //#endregion

  //#region Part Queries

  /**
   * Gets a specific part type for a position.
   */
  public getPartByTypeAndPosition(
    type: DatePartType,
    position: DateRangePosition
  ): IDateRangePart | undefined {
    return this.parts.find((p) => p.type === type && p.position === position);
  }

  /**
   * Gets the first non-literal date part for a position.
   */
  public getFirstDatePartForPosition(
    position: DateRangePosition
  ): IDateRangePart | undefined {
    return this.parts.find(
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
    const isStart = part.position === DateRangePosition.Start;

    // Spin a copy of the targeted date, defaulting to today when the range has no value.
    const originalDate = (isStart ? value.start : value.end) ?? new Date();
    const date = new Date(originalDate.getTime());

    const spinOptions: SpinOptions = {
      date,
      spinLoop,
      originalDate,
      amPmValue,
    };

    part.spin(delta, spinOptions);

    return isStart ? { ...value, start: date } : { ...value, end: date };
  }

  //#endregion
}
