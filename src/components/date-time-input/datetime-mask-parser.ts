import { isValidDate } from '#internals/date/converters.js';
import { createDate } from '#internals/date/model.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import {
  escapeMaskFlags,
  type MaskOptions,
  MaskParser,
  type MaskReplaceResult,
} from '../mask-input/mask-parser.js';
import {
  createDatePart,
  DATE_PART_TYPES,
  type DatePart,
  type DatePartDeltas,
  type DatePartOptions,
  DatePartType,
  type IDatePart,
  TIME_PART_TYPES,
} from './date-part.js';

//#region Types

/** The direction of a part navigation: `Ctrl + ArrowLeft` or `Ctrl + ArrowRight`. */
export type PartDirection = 'back' | 'forward';

/** A spin from an editor: `stepUp`, `stepDown`, an arrow key or the mouse wheel. */
export interface SpinRequest {
  /** The step. Zero or unset falls back to `spinDelta`, then to `1`. */
  delta?: number;
  /** `1` spins up and `-1` spins down. The sign of the step does not change the direction. */
  sign: 1 | -1;
  spinDelta?: DatePartDeltas;
  spinLoop: boolean;
  /** The date that an empty value takes, without a step. */
  seed: Date;
}

/** A spun edit: the new masked text and the value that it shows. */
export interface SpunText<V> {
  masked: string;
  value: V;
}

//#endregion

//#region Constants

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

const CENTURY_THRESHOLD = 50;
const CENTURY_BASE = 2000;

/**
 * Applies the century threshold to a year of one or two typed digits. Keeps a longer
 * or a negative year.
 */
function resolveYear(year: number, typed: string): number {
  if (typed.length > 2 || year < 0) {
    return year;
  }

  return year + (year < CENTURY_THRESHOLD ? CENTURY_BASE : CENTURY_BASE - 100);
}

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

/** The width of a long year run before a fit. */
const YEAR_WIDTH = 4;

/** Sets each year run, except `yy`, to `width` characters. Keeps the case of the run. */
function setYearWidth(format: string, width = YEAR_WIDTH): string {
  return format.replace(/y+|Y+/g, (run) =>
    run.length === 2 ? run : run[0].repeat(width)
  );
}

/** The width that shows the year of `date`: four digits or more, and a sign below year 0. */
function yearWidthOf(date: Date | null): number {
  if (!isValidDate(date)) {
    return YEAR_WIDTH;
  }

  const year = date.getFullYear();
  const digits = Math.max(YEAR_WIDTH, `${Math.abs(year)}`.length);
  return year < 0 ? digits + 1 : digits;
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
 * pattern. Owns the translation between the two, the list of positioned parts, and part
 * editing.
 *
 * `V` is the value type of the editor, and `R` is the part reference of its `stepUp`
 * and `stepDown`.
 */
export abstract class DateFormatMaskParser<
  T extends IDatePart,
  V,
  R,
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

  public getPartByType(type: DatePartType): T | undefined {
    return this.parts.find((part) => part.type === type);
  }

  /** The first non-literal part. */
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

  /**
   * Whether no date/time position is a prompt. A literal can match the prompt. A widened
   * year part is complete at four digits.
   */
  public isComplete(masked: string): boolean {
    return this.parts.every((part) => {
      if (part.type === DatePartType.Literal) {
        return true;
      }

      return part.type === DatePartType.Year &&
        part.end - part.start > YEAR_WIDTH
        ? this._typedPart(masked, part).length >= YEAR_WIDTH
        : !masked.substring(part.start, part.end).includes(this.prompt);
    });
  }

  /** Whether the format contains a day, month or year part. */
  public hasDateParts(): boolean {
    return this.parts.some((part) => DATE_PART_TYPES.has(part.type));
  }

  /** Whether the format contains an hours, minutes or seconds part. */
  public hasTimeParts(): boolean {
    return this.parts.some((part) => TIME_PART_TYPES.has(part.type));
  }

  /**
   * The caret position after `Ctrl + Arrow`: forward, the nearest part end after the
   * caret; back, the nearest part start before it. Past the last part, the text edges.
   */
  public partEdge(position: number, direction: PartDirection): number {
    if (direction === 'back') {
      return (
        this.parts.findLast(
          (part) => part.type !== DatePartType.Literal && part.start < position
        )?.start ?? 0
      );
    }

    return (
      this.parts.find(
        (part) => part.type !== DatePartType.Literal && part.end > position
      )?.end ?? this.emptyMask.length
    );
  }

  /**
   * Parses the masked text. A `strict` parse gives `null` for an incomplete mask; a
   * lenient one fills the missing parts from their defaults. A blank mask gives `null`.
   */
  public abstract parseValue(masked: string, strict: boolean): V | null;

  /** Parses an edit. A blank mask gives `null`; an incomplete or invalid date keeps `previous`. */
  public abstract parseEdit(masked: string, previous: V | null): V | null;

  /** Formats a value into the editable mask. */
  public abstract formatValue(value: V | null): string;

  /** Fits the long year runs to a text in this format, such as a restored edit. */
  public abstract fitToText(masked: string): void;

  /**
   * Replaces as typing does. The user types at most four year digits: an edit in a
   * widened year part that holds a year from code replaces the whole part, and the
   * part keeps only its first four typed characters.
   */
  public override replace(
    masked: string,
    value: string,
    start: number,
    end: number
  ): MaskReplaceResult {
    const reach = Math.max(end, start + value.length);
    const edited = this.parts.filter(
      (part) =>
        part.type === DatePartType.Year &&
        part.end - part.start > YEAR_WIDTH &&
        start < part.end &&
        reach > part.start
    );
    let text = masked || this.emptyMask;

    for (const part of edited) {
      if (this._typedPart(text, part).length > YEAR_WIDTH) {
        text = this._fillPart(text, part, () => this.prompt);
      }
    }

    const result = super.replace(text, value, start, end);

    for (const part of edited) {
      let typed = 0;
      result.value = this._fillPart(result.value, part, (char) =>
        char !== this.prompt && ++typed > YEAR_WIDTH ? this.prompt : char
      );
    }

    return result;
  }

  /** `masked` with each character of `part` mapped by `fill`. */
  private _fillPart(
    masked: string,
    part: T,
    fill: (char: string) => string
  ): string {
    const chars = masked.substring(part.start, part.end).split('').map(fill);
    return (
      masked.slice(0, part.start) + chars.join('') + masked.slice(part.end)
    );
  }

  /** The part at a caret position, or `undefined` in a literal. */
  public abstract partAt(position: number): R | undefined;

  /** The part that a spin targets while the editor is not focused. */
  public abstract defaultPart(): R | undefined;

  /**
   * Spins `part` of a value. An empty value takes the seed of the request, without a
   * step. A part that the format does not show still spins.
   */
  public abstract spin(value: V | null, part: R, request: SpinRequest): V;

  /** Spins `part` of the value that the masked text shows. */
  public abstract spinText(
    masked: string,
    part: R,
    request: SpinRequest
  ): SpunText<V>;

  /** The value that `seed` gives to an empty editor. */
  public abstract seeded(seed: Date): V;

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
export class DateTimeMaskParser extends DateFormatMaskParser<
  IDatePart,
  Date,
  DatePart
> {
  /** The width of the long year runs. No initializer: the base constructor parses first. */
  private _yearWidth?: number;

  constructor(options?: MaskOptions) {
    super({
      ...options,
      format: setYearWidth(options?.format || DEFAULT_DATETIME_FORMAT),
    });
  }

  public override get mask(): string {
    return super.mask;
  }

  /** Sets the date format. Widens each year format, except `yy`, to four characters. */
  public override set mask(value: string) {
    super.mask = value && setYearWidth(value);
  }

  /** `mask`, with the long year runs as wide as the last fitted year. */
  public get fittedFormat(): string {
    return setYearWidth(this.mask, this._yearWidth);
  }

  public override fitToText(masked: string): void {
    const runs = this.mask.match(/y{4}|Y{4}/g)?.length ?? 0;
    const extra = masked.length - this.mask.length;

    if (runs && extra >= 0 && extra % runs === 0) {
      this._fitYearWidth(YEAR_WIDTH + extra / runs);
    }
  }

  private _fitYearWidth(width: number): void {
    if (width !== (this._yearWidth ?? YEAR_WIDTH)) {
      this._yearWidth = width;
      this._parseMaskLiterals();
    }
  }

  protected override _toMaskFormat(format: string): string {
    return super._toMaskFormat(setYearWidth(format, this._yearWidth));
  }

  //#region Date Format Parsing

  protected override _buildParts(): IDatePart[] {
    const builders: PartBuilder[] = [];

    let run: PartBuilder | null = null;
    let position = 0;

    // Iterate by UTF-16 code unit, like the mask positions.
    for (const char of this.fittedFormat.split('')) {
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

  /** An invalid date gives `null` in both modes. */
  public override parseValue(masked: string, strict: boolean): Date | null {
    if ((strict && !this.isComplete(masked)) || this.isBlank(masked)) {
      return null;
    }

    const parsed = this.parseDate(masked);
    return isValidDate(parsed) ? parsed : null;
  }

  public override parseEdit(
    masked: string,
    previous: Date | null
  ): Date | null {
    return (
      this.parseValue(masked, true) ?? (this.isBlank(masked) ? null : previous)
    );
  }

  /** Parses a masked string into a Date. Returns null if it is not a valid date. */
  public parseDate(masked: string): Date | null {
    const parts = this._extractDateValues(masked);

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

      parts[datePart.type] =
        datePart.type === DatePartType.Year
          ? resolveYear(asNumber(typed), typed)
          : clamp(
              asNumber(typed),
              isMonthOrDate ? 1 : 0,
              Number.MAX_SAFE_INTEGER
            );
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

  /** Fits the year runs to `date` first, so the parts match the text. */
  public override formatValue(date: Date | null): string {
    this._fitYearWidth(yearWidthOf(date));

    return date
      ? this.parts.map((part) => part.getValue(date)).join('')
      : this.emptyMask;
  }

  //#endregion

  //#region Part editing

  public override partAt(position: number): DatePart | undefined {
    return this.getPartForCursor(position)?.type as DatePart | undefined;
  }

  public override defaultPart(): DatePart | undefined {
    return (
      this.getPartByType(DatePartType.Date) ??
      this.getPartByType(DatePartType.Hours) ??
      this.getFirstPart()
    )?.type as DatePart | undefined;
  }

  public override spin(
    value: Date | null,
    part: DatePart,
    request: SpinRequest
  ): Date {
    if (!isValidDate(value)) {
      return this.seeded(request.seed);
    }

    const type: DatePartType = part;
    const step =
      request.delta || request.spinDelta?.[part as keyof DatePartDeltas] || 1;
    const date = new Date(value.getTime());

    // An explicit spin, such as stepDown(DatePart.Minutes), can target a part not in the format.
    const target =
      this.getPartByType(type) ??
      createDatePart(type, { start: 0, end: 0, format: '' });

    target.spin(request.sign * Math.abs(step), {
      date,
      spinLoop: request.spinLoop,
      // The value, not the shown text, gives the side: the text can be in the display format.
      amPmValue: value.getHours() < 12 ? 'AM' : 'PM',
      originalDate: value,
    });

    return date;
  }

  /** A partial mask takes the seed. */
  public override spinText(
    masked: string,
    part: DatePart,
    request: SpinRequest
  ): SpunText<Date> {
    const value = this.spin(this.parseValue(masked, true), part, request);
    return { masked: this.formatValue(value), value };
  }

  public override seeded(seed: Date): Date {
    return new Date(seed.getTime());
  }

  //#endregion
}
