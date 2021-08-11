import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import {
  Calendar,
  ICalendarDate,
  IFormattingOptions,
  WEEKDAYS,
} from '../common/calendar';
import { styles } from './days-view.css';

export interface IgcDaysViewEventMap {
  igcChange: CustomEvent<void>;
}

export class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = [styles];

  private calendarModel = new Calendar();
  // private formatterDay!: Intl.DateTimeFormat;
  private formatterWeekday!: Intl.DateTimeFormat;
  // private formatterMonth: Intl.DateTimeFormat;
  // private formatterYear: Intl.DateTimeFormat;
  // private formatterMonthday: Intl.DateTimeFormat;

  @property({ type: Boolean })
  showWeekNumber = false;

  @property({ type: Number, attribute: 'week-start' })
  weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

  @watch('weekStart')
  weekStartChange() {
    this.calendarModel.firstWeekDay = this.weekStart;
  }

  @property({ attribute: false })
  viewDate = new Date();

  @property()
  locale = 'en';

  @property({ attribute: false })
  formatOptions: IFormattingOptions = {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  };

  @watch('formatOptions')
  @watch('locale')
  formattersChange() {
    this.initFormatters();
  }

  constructor() {
    super();
    this.initFormatters();
  }

  private initFormatters() {
    // this.formatterDay = new Intl.DateTimeFormat(this.locale, {
    //   day: this.formatOptions.day,
    // });
    this.formatterWeekday = new Intl.DateTimeFormat(this.locale, {
      weekday: this.formatOptions.weekday,
    });
    // this.formatterMonth = new Intl.DateTimeFormat(this.locale, {
    //   month: this.formatOptions.month,
    // });
    // this.formatterYear = new Intl.DateTimeFormat(this.locale, {
    //   year: this.formatOptions.year,
    // });
    // this.formatterMonthday = new Intl.DateTimeFormat(this.locale, {
    //   month: this.formatOptions.month,
    //   day: this.formatOptions.day,
    // });
  }

  private generateWeekHeader(): string[] {
    const dayNames = [];
    const rv = this.calendarModel.monthdatescalendar(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth()
    )[0];
    for (const day of rv) {
      dayNames.push(this.formatterWeekday.format(day.date));
    }

    return dayNames;
  }

  private getCalendarMonth(): ICalendarDate[][] {
    return this.calendarModel.monthdatescalendar(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth(),
      true
    );
  }

  private titleCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getWeekNumber(date: Date): number {
    return this.calendarModel.getWeekNumber(date);
  }

  private formattedDate(value: Date): string {
    // TODO
    // if (this.formatViews.day) {
    //     return this.formatterDay.format(value);
    // }
    return `${value.getDate()}`;
  }

  render() {
    return html`
      <div role="row" class="body-row">
        ${this.showWeekNumber
          ? html`<div role="columnheader" class="label label--week-number">
              <span>Wk</span>
            </div>`
          : ''}
        ${this.generateWeekHeader().map(
          (dayName) => html`<span
            role="columnheader"
            aria-label=${dayName}
            class="label"
          >
            ${this.titleCase(dayName)}
          </span>`
        )}
      </div>

      ${this.getCalendarMonth().map(
        (week) => html`<div role="row" class="body-row">
          ${this.showWeekNumber
            ? html`<div role="columnheader" class="date date--week-number">
                <span
                  role="rowheader"
                  class="date-content date-content--week-number"
                >
                  ${this.getWeekNumber(week[0].date)}
                </span>
              </div>`
            : ''}
          ${week.map(
            (day) => html`<span class="date" role="gridcell">
              ${this.formattedDate(day.date)}
            </span>`
          )}
        </div>`
      )}
    `;
  }
}
