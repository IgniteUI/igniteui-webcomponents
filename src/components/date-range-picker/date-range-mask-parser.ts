import {
  createDatePart,
  type DatePart,
  type IDatePart,
} from '../date-time-input/date-part.js';
import {
  DateFormatMaskParser,
  DateTimeMaskParser,
  type SpinRequest,
  type SpunText,
} from '../date-time-input/datetime-mask-parser.js';
import {
  escapeMaskFlags,
  type MaskOptions,
} from '../mask-input/mask-parser.js';
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
}

/**
 * Extended date part with range position information
 * @hidden
 */
export interface IDateRangePart extends IDatePart {
  position: DateRangePosition;
}

export interface DateRangeMaskOptions extends MaskOptions {
  /** Separator (defaults to ' - ') */
  separator?: string;
}

//#endregion

//#region Constants

const DEFAULT_SEPARATOR = ' - ';

//#endregion

/**
 * Re-creates one date's parts at their range position. The factory keeps real part
 * instances; a spread loses the prototype.
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
 * A mask parser for date range inputs. A single date format (e.g. 'MM/dd/yyyy') creates
 * two internal DateTimeMaskParser instances, one for each end of the range.
 */
export class DateRangeMaskParser extends DateFormatMaskParser<
  IDateRangePart,
  DateRangeValue,
  DateRangePart
> {
  private _startParser: DateTimeMaskParser;
  private _endParser: DateTimeMaskParser;

  private _separator: string;

  private _separatorStart!: number;

  private _separatorEnd!: number;

  /** The separator between start and end dates. */
  public get separator(): string {
    return this._separator;
  }

  constructor(options?: DateRangeMaskOptions) {
    const separator = options?.separator || DEFAULT_SEPARATOR;
    const promptCharacter = options?.promptCharacter;
    const startParser = new DateTimeMaskParser({
      format: options?.format,
      promptCharacter,
    });
    const format = startParser.mask;

    super({ format: `${format}${separator}${format}`, promptCharacter });

    this._startParser = startParser;
    this._endParser = new DateTimeMaskParser({ format, promptCharacter });
    this._separator = separator;
    this._setSeparatorBounds();

    // Parse again. The base constructor ran before the separator was set.
    this._parseMaskLiterals();
  }

  private _setSeparatorBounds(): void {
    this._separatorStart = this._startParser.mask.length;
    this._separatorEnd = this._separatorStart + this._separator.length;
  }

  /**
   * Converts each date as a single date format and escapes the separator letters.
   * Returns an empty pattern while the base constructor runs.
   */
  protected override _toMaskFormat(format: string): string {
    if (this._separator === undefined) {
      return '';
    }

    return (
      super._toMaskFormat(format.slice(0, this._separatorStart)) +
      escapeMaskFlags(this._separator) +
      super._toMaskFormat(format.slice(this._separatorEnd))
    );
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
    this._setSeparatorBounds();

    const format = this._startParser.mask;
    super.mask = `${format}${this._separator}${format}`;
  }

  public override get mask(): string {
    return super.mask;
  }

  /**
   * Sets the prompt character and updates both parsers.
   *
   * @remarks
   * All three parsers must agree on the prompt. It is read back through `super`, because
   * the base setter normalizes the value.
   */
  public override set prompt(value: string) {
    super.prompt = value;

    this._startParser.prompt = this.prompt;
    this._endParser.prompt = this.prompt;
  }

  public override get prompt(): string {
    return super.prompt;
  }

  //#region Date Range Parsing

  /** Parses a masked string into a DateRangeValue. Returns null if parsing fails. */
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

  //#region Part editing

  public override partAt(position: number): DateRangePart | undefined {
    const part = this.getPartForCursor(position);

    return part
      ? { part: part.type as DatePart, position: part.position }
      : undefined;
  }

  public override defaultPart(): DateRangePart | undefined {
    const part = this._startParser.defaultPart();
    return part ? { part, position: DateRangePosition.Start } : undefined;
  }

  /** An empty range takes the seed at both ends. */
  public override spin(
    value: DateRangeValue | null,
    { part, position }: DateRangePart,
    request: SpinRequest
  ): DateRangeValue {
    if (!value?.start && !value?.end) {
      return this.seeded(request.seed);
    }

    return {
      ...value,
      [position]: this._parserOf(position).spin(value[position], part, request),
    };
  }

  /** Keeps the text of the other end. A blank mask takes the seed at both ends. */
  public override spinText(
    masked: string,
    { part, position }: DateRangePart,
    request: SpinRequest
  ): SpunText<DateRangeValue> {
    if (this.isBlank(masked)) {
      const value = this.seeded(request.seed);
      return { masked: this.formatDateRange(value), value };
    }

    const text = {
      start: masked.substring(0, this._separatorStart),
      end: masked.substring(this._separatorEnd),
    };
    const spun = this._parserOf(position).spinText(
      text[position],
      part,
      request
    );
    text[position] = spun.masked;

    return {
      masked: text.start + this._separator + text.end,
      value: {
        start: this._startParser.parseComplete(text.start),
        end: this._endParser.parseComplete(text.end),
        [position]: spun.value,
      },
    };
  }

  public override seeded(seed: Date): DateRangeValue {
    return { start: new Date(seed.getTime()), end: new Date(seed.getTime()) };
  }

  private _parserOf(position: DateRangePosition): DateTimeMaskParser {
    return position === DateRangePosition.Start
      ? this._startParser
      : this._endParser;
  }

  //#endregion
}
