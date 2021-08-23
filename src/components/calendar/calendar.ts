import { html } from 'lit';
import { property } from 'lit/decorators.js';
import {
  IgcCalendarBaseComponent,
  IgcCalendarBaseEventMap,
} from './common/calendar-base';
import { IgcMonthsViewComponent } from './months-view/months-view';
import { IgcYearsViewComponent } from './years-view/years-view';
import { styles } from './calendar.css';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { Constructor } from '../common/mixins/constructor';
import { IgcDaysViewComponent } from './days-view/days-view';
import { ICalendarDate } from './common/calendar.model';
import { watch } from '../common/decorators';
import { calculateYearsRangeStart } from './common/utils';
import { SizableMixin } from '../common/mixins/sizable';

/**
 * @element igc-calendar
 */
export class IgcCalendarComponent extends SizableMixin(
  EventEmitterMixin<
    IgcCalendarBaseEventMap,
    Constructor<IgcCalendarBaseComponent>
  >(IgcCalendarBaseComponent)
) {
  /**
   * @private
   */
  static styles = [styles];

  private formatterMonth!: Intl.DateTimeFormat;

  // @query('igc-days-view')
  // daysView!: IgcDaysViewComponent;

  // @query('igc-months-view')
  // monthsView!: IgcMonthsViewComponent;

  // @query('igc-years-view')
  // yearsView!: IgcYearsViewComponent;

  @property()
  activeView: 'days' | 'months' | 'years' = 'days';

  @property({ attribute: false })
  formatOptions: Intl.DateTimeFormatOptions = {
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

  private get yearPerPage() {
    return this.size === 'small' ? 18 : 15;
  }

  private initFormatters() {
    this.formatterMonth = new Intl.DateTimeFormat(this.locale, {
      month: this.formatOptions.month,
    });
  }

  private formattedMonth(value: Date) {
    return this.formatterMonth.format(value);
  }

  private changeValue(event: CustomEvent<void>) {
    event.stopPropagation();
    this.value = (event.target as IgcDaysViewComponent).value;
    this.emitEvent('igcChange');
  }

  private changeMonth(event: CustomEvent<void>) {
    event.stopPropagation();
    this.viewDate = (event.target as IgcMonthsViewComponent).value;
    this.activeView = 'days';
  }

  private changeYear(event: CustomEvent<void>) {
    event.stopPropagation();
    this.viewDate = (event.target as IgcYearsViewComponent).value;
    this.activeView = 'months';
  }

  private switchToMonths() {
    this.activeView = 'months';
  }

  private switchToYears() {
    this.activeView = 'years';
  }

  private outsideDaySelected(event: CustomEvent<ICalendarDate>) {
    const date = event.detail;
    if (date.isNextMonth) {
      this.nextMonth();
    } else if (date.isPrevMonth) {
      this.previousMonth();
    }
  }

  private nextMonth() {
    this.viewDate = this.calendarModel.getNextMonth(this.viewDate);
  }

  private previousMonth() {
    this.viewDate = this.calendarModel.getPrevMonth(this.viewDate);
  }

  private nextYear() {
    this.viewDate = this.calendarModel.getNextYear(this.viewDate);
  }

  private previousYear() {
    this.viewDate = this.calendarModel.getPrevYear(this.viewDate);
  }

  private nextYearsPage() {
    this.viewDate = this.calendarModel.timedelta(
      this.viewDate,
      'year',
      this.yearPerPage
    );
  }

  private previousYearsPage() {
    this.viewDate = this.calendarModel.timedelta(
      this.viewDate,
      'year',
      -this.yearPerPage
    );
  }

  private navigateNext() {
    if (this.activeView === 'days') {
      this.nextMonth();
    } else if (this.activeView === 'months') {
      this.nextYear();
    } else if (this.activeView === 'years') {
      this.nextYearsPage();
    }
  }

  private navigatePrevious() {
    if (this.activeView === 'days') {
      this.previousMonth();
    } else if (this.activeView === 'months') {
      this.previousYear();
    } else if (this.activeView === 'years') {
      this.previousYearsPage();
    }
  }

  private renderNavigation() {
    let startYear = undefined;
    let endYear = undefined;

    if (this.activeView === 'years') {
      startYear = calculateYearsRangeStart(this.viewDate, this.yearPerPage);
      endYear = startYear + this.yearPerPage - 1;
    }

    return html`<div class="navigation">
      <div>
        ${this.activeView === 'days'
          ? html`<button @click=${this.switchToMonths}>
              ${this.formattedMonth(this.viewDate)}
            </button>`
          : ''}
        ${this.activeView === 'days' || this.activeView === 'months'
          ? html`<button @click=${this.switchToYears}>
              ${this.viewDate.getFullYear()}
            </button>`
          : ''}
        ${this.activeView === 'years'
          ? html`<span>${`${startYear} - ${endYear}`}</span>`
          : ''}
      </div>
      <div>
        <button @click=${this.navigatePrevious}><</button>
        <button @click=${this.navigateNext}>></button>
      </div>
    </div>`;
  }

  render() {
    return html`
      ${this.renderNavigation()}
      ${this.activeView === 'days'
        ? html`<igc-days-view
            .viewDate=${this.viewDate}
            .weekStart=${this.weekStart}
            .weekDayFormat=${this.formatOptions.weekday!}
            .locale=${this.locale}
            .selection=${this.selection}
            .value=${this.value}
            .hideOutsideDays=${this.hideOutsideDays}
            .showWeekNumbers=${this.showWeekNumbers}
            .disabledDates=${this.disabledDates}
            .specialDates=${this.specialDates}
            @igcChange=${this.changeValue}
            @igcOutsideDaySelected=${this.outsideDaySelected}
          ></igc-days-view>`
        : ''}
      ${this.activeView === 'months'
        ? html`<igc-months-view
            .value=${this.viewDate}
            .locale=${this.locale}
            .monthFormat=${this.formatOptions.month!}
            @igcChange=${this.changeMonth}
          ></igc-months-view>`
        : ''}
      ${this.activeView === 'years'
        ? html`<igc-years-view
            .value=${this.viewDate}
            .yearsPerPage=${this.yearPerPage}
            @igcChange=${this.changeYear}
          ></igc-years-view>`
        : ''}
    `;
  }
}
