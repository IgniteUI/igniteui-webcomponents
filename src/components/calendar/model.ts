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

  /** Constructs a new CalendarDay instance from a Date object. */
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
    const a = toCalendarDay(first);
    const b = toCalendarDay(second);

    if (a.equalTo(b)) {
      return 0;
    }
    return a.greaterThan(b) ? 1 : -1;
  }

  constructor(args: CalendarDayParams) {
    this._date = new Date(args.year, args.month, args.date ?? 1);
  }

  /** Returns a copy of this instance. */
  public clone(): CalendarDay {
    return CalendarDay.from(this._date);
  }

  /**
   * Returns a new instance with values replaced.
   */
  public set(args: Partial<CalendarDayParams>): CalendarDay {
    const year = args.year ?? this.year;
    const month = args.month ?? this.month;
    const date = args.date ?? this.date;

    // Clamp date to the last day of the month if it exceeds the month's days
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

  /** Returns the full year. */
  public get year(): number {
    return this._date.getFullYear();
  }

  /** Returns the month. */
  public get month(): number {
    return this._date.getMonth();
  }

  /** Returns the date */
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
   * Week 1 is the week containing the first Thursday of the year.
   * Weeks start on Monday. Some years can have 53 weeks.
   */
  public get week(): number {
    const target = new Date(this._date);

    const dayNum = target.getDay() || 7;
    target.setDate(target.getDate() + 4 - dayNum);

    const yearStart = new Date(target.getFullYear(), 0, 1);

    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(
      ((target.getTime() - yearStart.getTime()) / MILLISECONDS_PER_DAY + 1) /
        DAYS_IN_WEEK
    );

    return weekNo;
  }

  /** Returns the underlying native date instance. */
  public get native(): Date {
    return new Date(this._date);
  }

  /**
   * Whether the current date is a weekend day.
   *
   * @remarks
   * This is naive, since it does not account for locale specifics.
   */
  public get weekend(): boolean {
    return this.day < WEEKDAY_MIN || this.day > WEEKDAY_MAX;
  }

  public equalTo(value: DayParameter): boolean {
    const other = toCalendarDay(value).timestamp;
    return this.timestamp === other;
  }

  public greaterThan(value: DayParameter): boolean {
    const other = toCalendarDay(value).timestamp;
    return this.timestamp > other;
  }

  public greaterThanOrEqual(value: DayParameter): boolean {
    const other = toCalendarDay(value).timestamp;
    return this.timestamp >= other;
  }

  public lessThan(value: DayParameter): boolean {
    const other = toCalendarDay(value).timestamp;
    return this.timestamp < other;
  }

  public lessThanOrEqual(value: DayParameter): boolean {
    const other = toCalendarDay(value).timestamp;
    return this.timestamp <= other;
  }

  public toString(): string {
    return `${this.native}`;
  }
}
