/**
 * Date Part Classes Module
 *
 * This module provides structured classes for date/time parts used in date-time input.
 * Each date part type has its own class with specific validation and spin behavior;
 * the time part types share one class driven by a bounds/accessor lookup.
 *
 * Classes are private to this module - only types and factory function are exported.
 */

import { clamp, modulo } from '#internals/utils/math.js';

//#region Types and Enums

export enum DatePart {
  Month = 'month',
  Year = 'year',
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
  AmPm = 'amPm',
}

/** Types of date/time parts that can appear in a format string */
export const DatePartType = {
  Month: 'month',
  Year: 'year',
  Date: 'date',
  Hours: 'hours',
  Minutes: 'minutes',
  Seconds: 'seconds',
  AmPm: 'amPm',
  Literal: 'literal',
} as const;

export type DatePartType = (typeof DatePartType)[keyof typeof DatePartType];

/** The part types that make up a calendar date. */
export const DATE_PART_TYPES = new Set<DatePartType>([
  DatePartType.Date,
  DatePartType.Month,
  DatePartType.Year,
]);

/** The part types that make up a time of day. */
export const TIME_PART_TYPES = new Set<DatePartType>([
  DatePartType.Hours,
  DatePartType.Minutes,
  DatePartType.Seconds,
]);

// Spin delta defaults
export const DEFAULT_DATE_PARTS_SPIN_DELTAS = Object.freeze<DatePartDeltas>({
  date: 1,
  month: 1,
  year: 1,
  hours: 1,
  minutes: 1,
  seconds: 1,
});

/**
 * The amounts by which each date or time part is incremented or decremented on
 * a step action in date-time input; every part defaults to `1`.
 */
export interface DatePartDeltas {
  /** The number of days the date part is spun by. */
  date?: number;
  /** The number of months the month part is spun by. */
  month?: number;
  /** The number of years the year part is spun by. */
  year?: number;
  /** The number of hours the hours part is spun by. */
  hours?: number;
  /** The number of minutes the minutes part is spun by. */
  minutes?: number;
  /** The number of seconds the seconds part is spun by. */
  seconds?: number;
}

/** Options for creating a date part */
export interface DatePartOptions {
  /** Start position in the masked string */
  start: number;
  /** End position in the masked string */
  end: number;
  /** The format string for this part (e.g., 'MM', 'yyyy') */
  format: string;
}
/* blazorSuppress */
/** Options for spin operations */
export interface SpinOptions {
  /** The current date value */
  date: Date;
  /** Whether to loop values at boundaries */
  spinLoop: boolean;
  /** For AM/PM: the current masked value to determine AM or PM */
  amPmValue?: string;
  /** For AM/PM: the original date (for rollover prevention) */
  originalDate?: Date;
}

/**
 * Read-only interface for date part information
 * @hidden
 */
export interface IDatePart {
  /** The type of date part */
  readonly type: DatePartType;
  /** Start position in the masked string */
  readonly start: number;
  /** End position in the masked string */
  readonly end: number;
  /** The format string for this part */
  readonly format: string;

  /**
   * Validates a numeric value for this part.
   * @param value - The value to validate
   * @param context - Optional context (year, month) for date-dependent validation
   * @returns true if the value is valid for this part
   */
  validate(value: number, context?: DateValidationContext): boolean;

  /**
   * Spins (increments/decrements) this part's value on the given date.
   * @param delta - The amount to spin (positive = up, negative = down)
   * @param options - Spin options including the date and loop behavior
   */
  spin(delta: number, options: SpinOptions): void;

  /**
   * Extracts the value of this part from a Date object.
   * @param date - The date to extract from
   * @returns The formatted string value
   */
  getValue(date: Date): string;
}

/* blazorSuppress */
/** Context for date validation (needed for day-of-month validation) */
export interface DateValidationContext {
  year?: number;
  month?: number;
}

//#endregion

//#region Constants

type TimePartType =
  | typeof DatePartType.Hours
  | typeof DatePartType.Minutes
  | typeof DatePartType.Seconds;

/** Per-part bounds and `Date` accessors driving the shared {@link TimePart}. */
interface TimePartConfig {
  /** Inclusive lower bound for validation and spinning. */
  min: number;
  /** Inclusive upper bound for validation and spinning. */
  max: number;
  get(date: Date): number;
  set(date: Date, value: number): void;
  /** Maps the raw value to its rendered form - 12-hour hours, say. */
  display?(value: number, format: string): number;
}

const TIME_PART_CONFIG: Record<TimePartType, TimePartConfig> = {
  hours: {
    min: 0,
    max: 23,
    get: (date) => date.getHours(),
    set: (date, value) => date.setHours(value),
    display: (value, format) =>
      format.includes('h') ? toTwelveHourFormat(value) : value,
  },
  minutes: {
    min: 0,
    max: 59,
    get: (date) => date.getMinutes(),
    set: (date, value) => date.setMinutes(value),
  },
  seconds: {
    min: 0,
    max: 59,
    get: (date) => date.getSeconds(),
    set: (date, value) => date.setSeconds(value),
  },
};

/** Date bounds for validation */
const DATE_BOUNDS = {
  month: { min: 0, max: 11 },
  date: { min: 1, max: 31 },
} as const;

//#endregion

//#region Helper Functions

/**
 * Gets the number of days in a specific month/year.
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Pads a value with zeros to the specified length.
 */
function padValue(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}

/**
 * Converts 24-hour format to 12-hour format.
 */
function toTwelveHourFormat(hours: number): number {
  const h = hours % 12;
  return h === 0 ? 12 : h;
}

/**
 * Wraps a spun value around the inclusive `[min, max]` range, or clamps it to
 * the nearest bound when looping is off.
 */
function wrapOrClamp(
  value: number,
  min: number,
  max: number,
  spinLoop: boolean
): number {
  return spinLoop
    ? min + modulo(value - min, max - min + 1)
    : clamp(value, min, max);
}

//#endregion

//#region Abstract Base Class

/**
 * Abstract base class for all date parts.
 * Provides common functionality and defines the contract for concrete implementations.
 */
abstract class DatePartBase implements IDatePart {
  readonly type: DatePartType;
  readonly start: number;
  readonly end: number;
  readonly format: string;

  constructor(type: DatePartType, options: DatePartOptions) {
    this.type = type;
    this.start = options.start;
    this.end = options.end;
    this.format = options.format;
  }

  abstract validate(value: number, context?: DateValidationContext): boolean;
  abstract spin(delta: number, options: SpinOptions): void;
  abstract getValue(date: Date): string;
}

//#endregion

//#region Concrete Implementations

/**
 * Year part (yyyy, yy)
 */
class YearPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Year, options);
  }

  validate(_value: number): boolean {
    // Years are always valid (no upper bound)
    return _value >= 0;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date } = options;
    const maxDate = daysInMonth(date.getFullYear() + delta, date.getMonth());

    // Clip to max day to avoid leap year change shifting the entire value
    if (date.getDate() > maxDate) {
      date.setDate(maxDate);
    }

    date.setFullYear(date.getFullYear() + delta);
  }

  getValue(date: Date): string {
    const length = this.format.length;
    const year =
      length === 2
        ? date.getFullYear().toString().slice(-2)
        : date.getFullYear();
    return padValue(year, length);
  }
}

/**
 * Month part (MM, M)
 */
class MonthPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Month, options);
  }

  validate(value: number): boolean {
    // Month is 0-based internally, but 1-12 in display
    return value >= DATE_BOUNDS.month.min && value <= DATE_BOUNDS.month.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const { min, max } = DATE_BOUNDS.month;

    const maxDate = daysInMonth(date.getFullYear(), date.getMonth() + delta);
    if (date.getDate() > maxDate) {
      date.setDate(maxDate);
    }

    date.setMonth(wrapOrClamp(date.getMonth() + delta, min, max, spinLoop));
  }

  getValue(date: Date): string {
    return padValue(date.getMonth() + 1, this.format.length);
  }
}

/**
 * Date (day of month) part (dd, d)
 */
class DateOfMonthPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Date, options);
  }

  validate(value: number, context?: DateValidationContext): boolean {
    if (value < DATE_BOUNDS.date.min) {
      return false;
    }

    if (context?.year !== undefined && context?.month !== undefined) {
      const maxDays = daysInMonth(context.year, context.month);
      return value <= maxDays;
    }

    return value <= DATE_BOUNDS.date.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const maxDate = daysInMonth(date.getFullYear(), date.getMonth());
    const { min } = DATE_BOUNDS.date;

    date.setDate(wrapOrClamp(date.getDate() + delta, min, maxDate, spinLoop));
  }

  getValue(date: Date): string {
    return padValue(date.getDate(), this.format.length);
  }
}

/**
 * Time part (HH/hh hours, mm minutes, ss seconds) - a single implementation
 * over the per-part bounds and accessors in {@link TIME_PART_CONFIG}.
 */
class TimePart extends DatePartBase {
  private readonly _config: TimePartConfig;

  constructor(type: TimePartType, options: DatePartOptions) {
    super(type, options);
    this._config = TIME_PART_CONFIG[type];
  }

  validate(value: number): boolean {
    return value >= this._config.min && value <= this._config.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const { min, max, get, set } = this._config;

    set(date, wrapOrClamp(get(date) + delta, min, max, spinLoop));
  }

  getValue(date: Date): string {
    const { get, display } = this._config;
    const value = get(date);

    return padValue(
      display ? display(value, this.format) : value,
      this.format.length
    );
  }
}

/**
 * AM/PM part (tt, t)
 */
class AmPmPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.AmPm, options);
  }

  validate(_value: number): boolean {
    // AM/PM doesn't have numeric validation
    return true;
  }

  spin(_delta: number, options: SpinOptions): void {
    const { date, amPmValue, originalDate } = options;

    if (!amPmValue) return;

    const isAM = amPmValue.toLowerCase() === 'am';
    const newHours = date.getHours() + (isAM ? 12 : -12);
    date.setHours(newHours);

    // Prevent date rollover
    if (originalDate && date.getDate() !== originalDate.getDate()) {
      date.setTime(originalDate.getTime());
    }
  }

  getValue(date: Date): string {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  }
}

/**
 * Literal part (separators like /, -, :, space, etc.)
 */
class LiteralPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Literal, options);
  }

  validate(_value: number): boolean {
    // Literals don't have validation
    return true;
  }

  spin(_delta: number, _options: SpinOptions): void {
    // Literals can't be spun
  }

  getValue(_date: Date): string {
    return this.format;
  }
}

//#endregion

//#region Factory Function

/**
 * Creates a date part instance based on the type.
 * This is the only way to create date part instances outside this module.
 *
 * @param type - The type of date part to create
 * @param options - The options for the date part
 * @returns A date part instance implementing IDatePart
 */
export function createDatePart(
  type: DatePartType,
  options: DatePartOptions
): IDatePart {
  switch (type) {
    case DatePartType.Year:
      return new YearPart(options);
    case DatePartType.Month:
      return new MonthPart(options);
    case DatePartType.Date:
      return new DateOfMonthPart(options);
    case DatePartType.Hours:
    case DatePartType.Minutes:
    case DatePartType.Seconds:
      return new TimePart(type, options);
    case DatePartType.AmPm:
      return new AmPmPart(options);
    case DatePartType.Literal:
      return new LiteralPart(options);
    default:
      throw new Error(`Unknown date part type: ${type}`);
  }
}

//#endregion
