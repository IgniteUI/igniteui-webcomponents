export type DayParameter = CalendarDay | Date;

export type CalendarRangeParams = {
  start: DayParameter;
  end: DayParameter | number;
  unit?: DayInterval;
  inclusive?: boolean;
};

type DayInterval = 'year' | 'quarter' | 'month' | 'week' | 'day';

type CalendarDayParams = {
  year: number;
  month: number;
  date?: number;
};

export const DAYS_IN_WEEK = 7;
const MILLISECONDS_PER_DAY = 86400000;
const WEEKDAY_MIN = 1; // Monday
const WEEKDAY_MAX = 5; // Friday

export function toCalendarDay(date: DayParameter): CalendarDay {
  return date instanceof Date ? CalendarDay.from(date) : date;
}

/**
 * Returns the timestamp of the date portion of `value`, at midnight local
 * time.
 *
 * @remarks
 * Avoids the `CalendarDay` instance that {@link toCalendarDay} creates for a
 * `Date`. A month view runs hundreds of these comparisons per render.
 */
function timestampOf(value: DayParameter): number {
  return value instanceof Date
    ? new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
    : value.timestamp;
}

/** Returns the {@link toCalendarDay} result of `date`, or `null` if empty. */
export function toCalendarDayOrNull(
  date?: DayParameter | null
): CalendarDay | null {
  return date ? toCalendarDay(date) : null;
}

/** Truncates the time portion of `date`. An empty value gives `null`. */
export function truncateTime(date?: Date | null): Date | null {
  return date ? CalendarDay.from(date).native : null;
}

/**
 * Yields the days between `start` and `end`, stepped by `unit`. Stops before
 * `end`, unless `inclusive` is `true`.
 */
export function* calendarRange(
  options: CalendarRangeParams
): Generator<CalendarDay, void, unknown> {
  const { start, end, unit = 'day', inclusive = false } = options;

  let currentDate = toCalendarDay(start);
  const endDate =
    typeof end === 'number'
      ? toCalendarDay(start).add(unit, end)
      : toCalendarDay(end);

  const isReversed = endDate.lessThan(currentDate);
  const step = isReversed ? -1 : 1;

  // Direction and bound are fixed, so select the comparison once.
  const isInRange = inclusive
    ? isReversed
      ? CalendarDay.prototype.greaterThanOrEqual
      : CalendarDay.prototype.lessThanOrEqual
    : isReversed
      ? CalendarDay.prototype.greaterThan
      : CalendarDay.prototype.lessThan;

  while (isInRange.call(currentDate, endDate)) {
    yield currentDate;
    currentDate = currentDate.add(unit, step);
  }
}

function checkRollover(
  original: CalendarDay,
  modified: CalendarDay
): CalendarDay {
  return original.date !== modified.date ? modified.set({ date: 0 }) : modified;
}

/* blazorSuppress */
export class CalendarDay {
  private readonly _date: Date;

  /** Constructs and returns the current day. */
  public static get today(): CalendarDay {
    return CalendarDay.from(new Date());
  }

  public static from(date: Date): CalendarDay {
    return new CalendarDay({
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate(),
    });
  }

  /**
   * Compares the date portion of two date objects.
   *
   * @returns
   * ```
   *  first === second // 0
   *  first > second // 1
   *  first < second // -1
   * ```
   */
  public static compare(first: DayParameter, second: DayParameter): number {
    const a = timestampOf(first);
    const b = timestampOf(second);

    if (a === b) {
      return 0;
    }
    return a > b ? 1 : -1;
  }

  constructor(args: CalendarDayParams) {
    this._date = new Date(args.year, args.month, args.date ?? 1);
  }

  public clone(): CalendarDay {
    return CalendarDay.from(this._date);
  }

  /** Returns a new instance with the given values replaced. */
  public set(args: Partial<CalendarDayParams>): CalendarDay {
    const year = args.year ?? this.year;
    const month = args.month ?? this.month;
    const date = args.date ?? this.date;

    // Clamp to the last day of the month when the date overflows it.
    if (date > 0) {
      const temp = new Date(year, month, date);
      if (temp.getMonth() !== month) {
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        return new CalendarDay({ year, month, date: lastDayOfMonth });
      }
    }

    return new CalendarDay({ year, month, date });
  }

  public add(unit: DayInterval, value: number): CalendarDay {
    const result = this.clone();

    switch (unit) {
      case 'year':
        result._date.setFullYear(result.year + value);
        return checkRollover(this, result);
      case 'quarter':
        result._date.setMonth(result.month + 3 * value);
        return checkRollover(this, result);
      case 'month':
        result._date.setMonth(result.month + value);
        return checkRollover(this, result);
      case 'week':
        result._date.setDate(result.date + 7 * value);
        return result;
      case 'day':
        result._date.setDate(result.date + value);
        return result;
      default:
        throw new Error(`Invalid interval: ${unit}`);
    }
  }

  /** Returns the day of the week (Sunday = 0). */
  public get day(): number {
    return this._date.getDay();
  }

  public get year(): number {
    return this._date.getFullYear();
  }

  public get month(): number {
    return this._date.getMonth();
  }

  public get date(): number {
    return this._date.getDate();
  }

  /** Returns the timestamp since epoch in milliseconds. */
  public get timestamp(): number {
    return this._date.getTime();
  }

  /**
   * Returns the ISO 8601 week number.
   *
   * @remarks
   * Week 1 holds the first Thursday of the year, weeks start on Monday, and
   * a year can have 53 weeks.
   */
  public get week(): number {
    const target = new Date(this._date);

    const dayNum = target.getDay() || 7;
    target.setDate(target.getDate() + 4 - dayNum);

    const yearStart = new Date(target.getFullYear(), 0, 1);

    // Full weeks up to the nearest Thursday.
    const weekNo = Math.ceil(
      ((target.getTime() - yearStart.getTime()) / MILLISECONDS_PER_DAY + 1) /
        DAYS_IN_WEEK
    );

    return weekNo;
  }

  /** Returns a copy of the underlying native `Date` instance. */
  public get native(): Date {
    return new Date(this._date);
  }

  /**
   * Returns whether the current date is a weekend day. The check is naive
   * and ignores locale specifics.
   */
  public get weekend(): boolean {
    return this.day < WEEKDAY_MIN || this.day > WEEKDAY_MAX;
  }

  public equalTo(value: DayParameter): boolean {
    return this.timestamp === timestampOf(value);
  }

  public greaterThan(value: DayParameter): boolean {
    return this.timestamp > timestampOf(value);
  }

  public greaterThanOrEqual(value: DayParameter): boolean {
    return this.timestamp >= timestampOf(value);
  }

  public lessThan(value: DayParameter): boolean {
    return this.timestamp < timestampOf(value);
  }

  public lessThanOrEqual(value: DayParameter): boolean {
    return this.timestamp <= timestampOf(value);
  }

  public toString(): string {
    return `${this.native}`;
  }
}
