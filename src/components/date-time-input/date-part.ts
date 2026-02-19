/**
 * Date Part Classes Module
 *
 * This module provides structured classes for date/time parts used in date-time input.
 * Each part type has its own class with specific validation and spin behavior.
 *
 * Classes are private to this module - only types and factory function are exported.
 */

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

// Spin delta defaults
export const DEFAULT_DATE_PARTS_SPIN_DELTAS = Object.freeze<DatePartDeltas>({
  date: 1,
  month: 1,
  year: 1,
  hours: 1,
  minutes: 1,
  seconds: 1,
});

export interface DatePartDeltas {
  date?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
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

/** Read-only interface for date part information */
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

/** Context for date validation (needed for day-of-month validation) */
export interface DateValidationContext {
  year?: number;
  month?: number;
}

//#endregion

//#region Constants

/** Time bounds for validation */
const TIME_BOUNDS = {
  hours: { min: 0, max: 23 },
  minutes: { min: 0, max: 59 },
  seconds: { min: 0, max: 59 },
} as const;

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
 * Generic spin helper for time parts.
 */
function spinTimePart(
  date: Date,
  delta: number,
  max: number,
  min: number,
  setter: (value: number) => number,
  getter: () => number,
  spinLoop: boolean
): void {
  let value = getter.call(date) + delta;

  if (value > max) {
    value = spinLoop ? value % (max + 1) : max;
  } else if (value < min) {
    value = spinLoop ? max + 1 + (value % (max + 1)) : min;
  }

  setter.call(date, value);
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

    let month = date.getMonth() + delta;

    if (month > max) {
      month = spinLoop ? (month % max) - 1 : max;
    } else if (month < min) {
      month = spinLoop ? max + (month % max) + 1 : min;
    }

    date.setMonth(month);
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

    let dayOfMonth = date.getDate() + delta;

    if (dayOfMonth > maxDate) {
      dayOfMonth = spinLoop ? dayOfMonth % maxDate : maxDate;
    } else if (dayOfMonth < min) {
      dayOfMonth = spinLoop ? maxDate + (dayOfMonth % maxDate) : min;
    }

    date.setDate(dayOfMonth);
  }

  getValue(date: Date): string {
    return padValue(date.getDate(), this.format.length);
  }
}

/**
 * Hours part (HH, H, hh, h)
 */
class HoursPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Hours, options);
  }

  validate(value: number): boolean {
    return value >= TIME_BOUNDS.hours.min && value <= TIME_BOUNDS.hours.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const { min, max } = TIME_BOUNDS.hours;
    spinTimePart(date, delta, max, min, date.setHours, date.getHours, spinLoop);
  }

  getValue(date: Date): string {
    const isTwelveHour = this.format.includes('h');
    const hours = isTwelveHour
      ? toTwelveHourFormat(date.getHours())
      : date.getHours();
    return padValue(hours, this.format.length);
  }
}

/**
 * Minutes part (mm, m)
 */
class MinutesPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Minutes, options);
  }

  validate(value: number): boolean {
    return value >= TIME_BOUNDS.minutes.min && value <= TIME_BOUNDS.minutes.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const { min, max } = TIME_BOUNDS.minutes;
    spinTimePart(
      date,
      delta,
      max,
      min,
      date.setMinutes,
      date.getMinutes,
      spinLoop
    );
  }

  getValue(date: Date): string {
    return padValue(date.getMinutes(), this.format.length);
  }
}

/**
 * Seconds part (ss, s)
 */
class SecondsPart extends DatePartBase {
  constructor(options: DatePartOptions) {
    super(DatePartType.Seconds, options);
  }

  validate(value: number): boolean {
    return value >= TIME_BOUNDS.seconds.min && value <= TIME_BOUNDS.seconds.max;
  }

  spin(delta: number, options: SpinOptions): void {
    const { date, spinLoop } = options;
    const { min, max } = TIME_BOUNDS.seconds;
    spinTimePart(
      date,
      delta,
      max,
      min,
      date.setSeconds,
      date.getSeconds,
      spinLoop
    );
  }

  getValue(date: Date): string {
    return padValue(date.getSeconds(), this.format.length);
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
      return new HoursPart(options);
    case DatePartType.Minutes:
      return new MinutesPart(options);
    case DatePartType.Seconds:
      return new SecondsPart(options);
    case DatePartType.AmPm:
      return new AmPmPart(options);
    case DatePartType.Literal:
      return new LiteralPart(options);
    default:
      throw new Error(`Unknown date part type: ${type}`);
  }
}

//#endregion
