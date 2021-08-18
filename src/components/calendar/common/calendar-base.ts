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

  @property({ attribute: false })
  value?: Date | Date[];

  @property()
  selection: 'single' | 'multi' | 'range' = 'single';

  @property({ type: Boolean })
  showWeekNumbers = false;

  @property({ attribute: 'week-start' })
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

  @property({ attribute: false })
  viewDate = new Date();

  @property()
  locale = 'en';

  @property({ attribute: false })
  formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  };

  @property({ attribute: false })
  disabledDates!: DateRangeDescriptor[];

  @property({ attribute: false })
  specialDates!: DateRangeDescriptor[];

  @property({ type: Boolean, attribute: 'hide-outside-days' })
  hideOutsideDays = false;

  @watch('weekStart')
  weekStartChange() {
    this.calendarModel.firstWeekDay = getWeekDayNumber(this.weekStart);
  }
}
