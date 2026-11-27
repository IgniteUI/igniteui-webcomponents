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
  /** One parser per end: each end fits its year runs to its own year. */
  private readonly _ends: Record<DateRangePosition, DateTimeMaskParser>;

  private _separator: string;

  /** The fitted range format of the last parse. */
  private _fittedFormat!: string;

  private get _separatorStart(): number {
    return this._ends.start.fittedFormat.length;
  }

  private get _separatorEnd(): number {
    return this._separatorStart + this._separator.length;
  }

  public get separator(): string {
    return this._separator;
  }

  constructor(options?: DateRangeMaskOptions) {
    const separator = options?.separator || DEFAULT_SEPARATOR;
    const promptCharacter = options?.promptCharacter;
    const createEnd = () =>
      new DateTimeMaskParser({ format: options?.format, promptCharacter });
    const ends = { start: createEnd(), end: createEnd() };
    const format = ends.start.mask;

    super({ format: `${format}${separator}${format}`, promptCharacter });

    this._ends = ends;
    this._separator = separator;
    this._parseFittedFormat();
  }

  /** The fitted formats of the ends around the separator. */
  private get _endsFormat(): string {
    const { start, end } = this._ends;
    return `${start.fittedFormat}${this._separator}${end.fittedFormat}`;
  }

  /** Parses again when the year width of an end changed. */
  private _parseFittedFormat(): void {
    const format = this._endsFormat;

    if (format !== this._fittedFormat) {
      this._fittedFormat = format;
      this._parseMaskLiterals();
    }
  }

  private _endTexts(masked: string): Record<DateRangePosition, string> {
    return {
      start: masked.substring(0, this._separatorStart),
      end: masked.substring(this._separatorEnd),
    };
  }

  /**
   * Converts the fitted format of each end and escapes the separator. The ends hold
   * the year widths, so the range format is not read. Empty while the base
   * constructor runs.
   */
  protected override _toMaskFormat(): string {
    if (this._separator === undefined) {
      return '';
    }

    const { start, end } = this._ends;

    return (
      super._toMaskFormat(start.fittedFormat) +
      escapeMaskFlags(this._separator) +
      super._toMaskFormat(end.fittedFormat)
    );
  }

  protected override _buildParts(): IDateRangePart[] {
    const { start, end } = this._ends;

    return [
      ...offsetParts(start.parts, 0, DateRangePosition.Start),
      ...offsetParts(end.parts, this._separatorEnd, DateRangePosition.End),
    ];
  }

  /** Takes the format of one date; the getter returns the range format. */
  public override set mask(value: string) {
    for (const end of Object.values(this._ends)) {
      end.mask = value;
    }

    const format = this._ends.start.mask;
    this._fittedFormat = this._endsFormat;
    super.mask = `${format}${this._separator}${format}`;
  }

  public override get mask(): string {
    return super.mask;
  }

  /** The date parsers read the prompt back through `super`, which normalizes it. */
  public override set prompt(value: string) {
    super.prompt = value;

    for (const end of Object.values(this._ends)) {
      end.prompt = this.prompt;
    }
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
      start: this._ends.start.parseDate(text.start),
      end: this._ends.end.parseDate(text.end),
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
    const start = this._ends.start.parseEdit(
      text.start,
      previous?.start ?? null
    );
    const end = this._ends.end.parseEdit(text.end, previous?.end ?? null);

    return start || end ? { start, end } : null;
  }

  //#endregion

  //#region Date Range Formatting

  /** Fits the year runs of each end to its date first, so the parts match the text. */
  public override formatValue(range: DateRangeValue | null): string {
    const { start, end } = this._ends;
    const text =
      start.formatValue(range?.start ?? null) +
      this._separator +
      end.formatValue(range?.end ?? null);

    this._parseFittedFormat();
    return text;
  }

  /** Splits the text at the first separator after the start format and fits each end. */
  public override fitToText(masked: string): void {
    const { start, end } = this._ends;
    const at = masked.indexOf(this._separator, start.mask.length);

    if (at >= 0) {
      start.fitToText(masked.slice(0, at));
      end.fitToText(masked.slice(at + this._separator.length));
      this._parseFittedFormat();
    }
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
    const part = this._ends.start.defaultPart();
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
      [position]: this._ends[position].spin(value[position], part, request),
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
    const spun = this._ends[position].spinText(text[position], part, request);
    text[position] = spun.masked;
    this._parseFittedFormat();

    return {
      masked: text.start + this._separator + text.end,
      value: {
        start: this._ends.start.parseValue(text.start, true),
        end: this._ends.end.parseValue(text.end, true),
        [position]: spun.value,
      },
    };
  }

  public override seeded(seed: Date): DateRangeValue {
    return {
      start: this._ends.start.seeded(seed),
      end: this._ends.end.seeded(seed),
    };
  }

  //#endregion
}
