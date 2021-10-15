import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Calendar, DateRangeDescriptor } from './calendar.model';
import { getWeekDayNumber } from './utils';

export interface IgcCalendarBaseEventMap {
  igcChange: CustomEvent<void>;
}

export class IgcCalendarBaseComponent extends LitElement {
  protected calendarModel = new Calendar();

  /**
   * Тhe current value of the calendar.
   * When selection is set to single, it accepts a single Date object.
   * Otherwise, it is an array of Date objects.
   */
  @property({ attribute: false })
  public value?: Date | Date[];

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
  @property({ attribute: false })
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
