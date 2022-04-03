import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  blazorIndirectRender,
  blazorSuppress,
  watch,
} from '../../common/decorators';
import { Calendar, DateRangeDescriptor } from './calendar.model';
import { getWeekDayNumber } from './utils';

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;

export interface IgcCalendarBaseEventMap {
  igcChange: CustomEvent<Date | Date[]>;
}

@blazorIndirectRender
export class IgcCalendarBaseComponent extends LitElement {
  protected calendarModel = new Calendar();

  /**
   * Тhe current value of the calendar.
   * Used when selection is set to single.
   */
  @blazorSuppress()
  @property({
    converter: (value) => {
      return value ? new Date(value) : undefined;
    },
  })
  public value?: Date;
  //we suppress value for blazor since we need to expose it on the leaves with the events for now.

  /**
   * Тhe current values of the calendar.
   * Used when selection is set to multiple or range.
   */
  @blazorSuppress()
  @property({
    converter: (value) => {
      if (!value) {
        return undefined;
      }
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
        .map((v) => new Date(v));
    },
  })
  public values?: Date[];

  /** Sets the type of date selection. */
  @property()
  public selection: 'single' | 'multiple' | 'range' = 'single';

  /** Show/hide the week numbers. */
  @property({ type: Boolean, attribute: 'show-week-numbers', reflect: true })
  public showWeekNumbers = false;

  /** Sets the start day of the week. */
  @property({ attribute: 'week-start' })
  public weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

  /** Sets the date which is shown in view and is highlighted. By default it is the current date. */
  @blazorSuppress()
  @property({
    attribute: 'active-date',
    converter: (value) => (value ? new Date(value) : new Date()),
  })
  public activeDate = new Date();

  /** Sets the locale used for formatting and displaying the dates in the calendar. */
  @property()
  public locale = 'en';

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  public disabledDates!: DateRangeDescriptor[];

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  @watch('weekStart')
  protected weekStartChange() {
    this.calendarModel.firstWeekDay = getWeekDayNumber(this.weekStart);
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected selectionChange() {
    this.value = undefined;
  }
}
