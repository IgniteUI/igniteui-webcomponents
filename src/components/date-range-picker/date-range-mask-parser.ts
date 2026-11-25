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
 * The end of the range that a date part belongs to.
 * @hidden
 */
export enum DateRangePosition {
  Start = 'start',
  End = 'end',
}

/**
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

/** A date range mask: one date format on each side of the separator. */
export class DateRangeMaskParser extends DateFormatMaskParser<
  IDateRangePart,
  DateRangeValue,
  DateRangePart
> {
  /** Parses, formats and spins the text of either end. */
  private readonly _dateParser: DateTimeMaskParser;

  private _separator: string;

  private _separatorStart!: number;

  private _separatorEnd!: number;

  public get separator(): string {
    return this._separator;
  }

  constructor(options?: DateRangeMaskOptions) {
    const separator = options?.separator || DEFAULT_SEPARATOR;
    const promptCharacter = options?.promptCharacter;
    const dateParser = new DateTimeMaskParser({
      format: options?.format,
      promptCharacter,
    });
    const format = dateParser.mask;

    super({ format: `${format}${separator}${format}`, promptCharacter });

    this._dateParser = dateParser;
    this._separator = separator;
    this._setSeparatorBounds();

    // Parse again. The base constructor ran before the separator was set.
    this._parseMaskLiterals();
  }

  private _setSeparatorBounds(): void {
    this._separatorStart = this._dateParser.mask.length;
    this._separatorEnd = this._separatorStart + this._separator.length;
  }

  private _endTexts(masked: string): Record<DateRangePosition, string> {
    return {
      start: masked.substring(0, this._separatorStart),
      end: masked.substring(this._separatorEnd),
    };
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
    const parts = this._dateParser.parts;

    return [
      ...offsetParts(parts, 0, DateRangePosition.Start),
      ...offsetParts(parts, this._separatorEnd, DateRangePosition.End),
    ];
  }

  /** Takes the format of one date; the getter returns the range format. */
  public override set mask(value: string) {
    this._dateParser.mask = value;
    this._setSeparatorBounds();

    const format = this._dateParser.mask;
    super.mask = `${format}${this._separator}${format}`;
  }

  public override get mask(): string {
    return super.mask;
  }

  /** The date parser reads the prompt back through `super`, which normalizes it. */
  public override set prompt(value: string) {
    super.prompt = value;
    this._dateParser.prompt = this.prompt;
  }

  public override get prompt(): string {
    return super.prompt;
  }

  //#region Date Range Parsing

  /** Parses each end leniently. Gives `null` only for an empty mask. */
  public parseDateRange(masked: string): DateRangeValue | null {
    if (!masked || masked === this.emptyMask) {
      return null;
    }

    const text = this._endTexts(masked);

    return {
      start: this._dateParser.parseDate(text.start),
      end: this._dateParser.parseDate(text.end),
    };
  }

  /**
   * A strict parse needs both ends complete. When neither end is a valid date, the
   * result is `null`.
   */
  public override parseValue(
    masked: string,
    strict: boolean
  ): DateRangeValue | null {
    if (strict && !this.isComplete(masked)) {
      return null;
    }

    const parsed = this.parseDateRange(masked);
    return parsed?.start || parsed?.end ? parsed : null;
  }

  /** Parses each end alone, so an incomplete end keeps the end of `previous`. */
  public override parseEdit(
    masked: string,
    previous: DateRangeValue | null
  ): DateRangeValue | null {
    const text = this._endTexts(masked);
    const start = this._dateParser.parseEdit(
      text.start,
      previous?.start ?? null
    );
    const end = this._dateParser.parseEdit(text.end, previous?.end ?? null);

    return start || end ? { start, end } : null;
  }

  //#endregion

  //#region Date Range Formatting

  public override formatValue(range: DateRangeValue | null): string {
    return (
      this._dateParser.formatValue(range?.start ?? null) +
      this._separator +
      this._dateParser.formatValue(range?.end ?? null)
    );
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
    const part = this._dateParser.defaultPart();
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
      [position]: this._dateParser.spin(value[position], part, request),
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
      return { masked: this.formatValue(value), value };
    }

    const text = this._endTexts(masked);
    const spun = this._dateParser.spinText(text[position], part, request);
    text[position] = spun.masked;

    return {
      masked: text.start + this._separator + text.end,
      value: {
        start: this._dateParser.parseValue(text.start, true),
        end: this._dateParser.parseValue(text.end, true),
        [position]: spun.value,
      },
    };
  }

  public override seeded(seed: Date): DateRangeValue {
    return {
      start: this._dateParser.seeded(seed),
      end: this._dateParser.seeded(seed),
    };
  }

  //#endregion
}
