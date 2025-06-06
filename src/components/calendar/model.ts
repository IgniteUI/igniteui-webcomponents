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

export const daysInWeek = 7;
const millisecondsInDay = 86400000;

export function toCalendarDay(date: DayParameter) {
  return date instanceof Date ? CalendarDay.from(date) : date;
}

function checkRollover(original: CalendarDay, modified: CalendarDay) {
  return original.date !== modified.date ? modified.set({ date: 0 }) : modified;
}

/* blazorSuppress */
export class CalendarDay {
  private readonly _date: Date;

  /** Constructs and returns the current day. */
  public static get today() {
    return CalendarDay.from(new Date());
  }

  /** Constructs a new CalendarDay instance from a Date object. */
  public static from(date: Date) {
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
  public static compare(first: DayParameter, second: DayParameter) {
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
  public clone() {
    return CalendarDay.from(this._date);
  }

  /**
   * Returns a new instance with values replaced.
   */
  public set(args: Partial<CalendarDayParams>) {
    const year = args.year ?? this.year;
    const month = args.month ?? this.month;
    const date = args.date ?? this.date;

    const temp = new Date(year, month, date);

    if (date > 0 && temp.getMonth() !== month) {
      return new CalendarDay({
        year,
        month,
        date: new Date(year, month + 1, 0).getDate(),
      });
    }

    return new CalendarDay({ year, month, date });
  }

  public add(unit: DayInterval, value: number) {
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
        throw new Error('Invalid interval');
    }
  }

  /** Returns the day of the week (Sunday = 0). */
  public get day() {
    return this._date.getDay();
  }

  /** Returns the full year. */
  public get year() {
    return this._date.getFullYear();
  }

  /** Returns the month. */
  public get month() {
    return this._date.getMonth();
  }

  /** Returns the date */
  public get date() {
    return this._date.getDate();
  }

  /** Returns the timestamp since epoch in milliseconds. */
  public get timestamp() {
    return this._date.getTime();
  }

  /** Returns the current week number. */
  public get week() {
    const firstDay = new CalendarDay({ year: this.year, month: 0 }).timestamp;
    const currentDay =
      (this.timestamp - firstDay + millisecondsInDay) / millisecondsInDay;
    return Math.ceil(currentDay / daysInWeek);
  }

  /** Returns the underlying native date instance. */
  public get native() {
    return new Date(this._date);
  }

  /**
   * Whether the current date is a weekend day.
   *
   * @remarks
   * This is naive, since it does not account for locale specifics.
   */
  public get weekend() {
    return this.day < 1 || this.day > 5;
  }

  public equalTo(value: DayParameter) {
    return this.timestamp === toCalendarDay(value).timestamp;
  }

  public greaterThan(value: DayParameter) {
    return this.timestamp > toCalendarDay(value).timestamp;
  }

  public greaterThanOrEqual(value: DayParameter) {
    return this.timestamp >= toCalendarDay(value).timestamp;
  }

  public lessThan(value: DayParameter) {
    return this.timestamp < toCalendarDay(value).timestamp;
  }

  public lessThanOrEqual(value: DayParameter) {
    return this.timestamp <= toCalendarDay(value).timestamp;
  }

  public toString() {
    return `${this.native}`;
  }
}
