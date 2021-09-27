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
  public value?: Date | Date[];

  @property()
  public selection: 'single' | 'multiple' | 'range' = 'single';

  @property({ type: Boolean, attribute: 'show-week-numbers', reflect: true })
  public showWeekNumbers = false;

  @property({ attribute: 'week-start' })
  public weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

  @property({ attribute: false })
  public activeDate = new Date();

  @property()
  public locale = 'en';

  @property({ attribute: false })
  public disabledDates!: DateRangeDescriptor[];

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
