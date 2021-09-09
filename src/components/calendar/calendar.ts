import { html } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  IgcCalendarBaseComponent,
  IgcCalendarBaseEventMap,
} from './common/calendar-base';
import { IgcMonthsViewComponent } from './months-view/months-view';
import { IgcYearsViewComponent } from './years-view/years-view';
import { styles } from './calendar.material.css';
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
  private formatterWeekday!: Intl.DateTimeFormat;
  private formatterMonthDay!: Intl.DateTimeFormat;

  @queryAll('igc-days-view')
  daysViews!: NodeList;

  @state()
  rangePreviewDate?: Date;

  // @query('igc-months-view')
  // monthsView!: IgcMonthsViewComponent;

  // @query('igc-years-view')
  // yearsView!: IgcYearsViewComponent;

  @state()
  protected activeDateMonthIndex = 0;

  @property({ type: Boolean, attribute: 'has-header' })
  hasHeader = true;

  @property({ attribute: 'header-orientation', reflect: true })
  headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  @property()
  orientation: 'vertical' | 'horizontal' = 'horizontal';

  @property({ type: Number, attribute: 'visible-months' })
  visibleMonths = 1;

  @property({ attribute: 'active-view' })
  activeView: 'days' | 'months' | 'years' = 'days';

  @property({ attribute: false })
  formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    weekday: 'narrow',
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
    this.formatterWeekday = new Intl.DateTimeFormat(this.locale, {
      weekday: this.formatOptions.weekday,
    });
    this.formatterMonthDay = new Intl.DateTimeFormat(this.locale, {
      month: this.formatOptions.month,
      day: this.formatOptions.day,
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
    this.activeDate = (event.target as IgcMonthsViewComponent).value;
    this.activeView = 'days';
  }

  private changeYear(event: CustomEvent<void>) {
    event.stopPropagation();
    this.activeDate = (event.target as IgcYearsViewComponent).value;
    this.activeView = 'months';
  }

  private switchToMonths() {
    this.activeView = 'months';
  }

  private switchToYears() {
    this.activeView = 'years';
  }

  private activeDateChanged(event: CustomEvent<Date>) {
    const daysViews = Array.from(this.daysViews);
    this.activeDateMonthIndex = daysViews.findIndex((d) => d === event.target);
    this.activeDate = event.detail;
  }

  private async outsideDaySelected(event: CustomEvent<ICalendarDate>) {
    const date = event.detail.date;
    this.activeDate = date;
    await this.updateComplete;
    (this.daysViews[0] as IgcDaysViewComponent).focusDate(date);
  }

  private rangePreviewDateChange(event: CustomEvent<Date>) {
    this.rangePreviewDate = event.detail;
  }

  private nextMonth() {
    this.activeDate = this.calendarModel.getNextMonth(this.activeDate);
  }

  private previousMonth() {
    this.activeDate = this.calendarModel.getPrevMonth(this.activeDate);
  }

  private nextYear() {
    this.activeDate = this.calendarModel.getNextYear(this.activeDate);
  }

  private previousYear() {
    this.activeDate = this.calendarModel.getPrevYear(this.activeDate);
  }

  private nextYearsPage() {
    this.activeDate = this.calendarModel.timedelta(
      this.activeDate,
      'year',
      this.yearPerPage
    );
  }

  private previousYearsPage() {
    this.activeDate = this.calendarModel.timedelta(
      this.activeDate,
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

  private renderNavigation(activeDate?: Date, renderButtons = true) {
    activeDate = activeDate ?? this.activeDate;

    let startYear = undefined;
    let endYear = undefined;

    if (this.activeView === 'years') {
      startYear = calculateYearsRangeStart(activeDate, this.yearPerPage);
      endYear = startYear + this.yearPerPage - 1;
    }

    return html`<div part="navigation">
      <div>
        ${this.activeView === 'days'
          ? html`<button part="months-navigation" @click=${this.switchToMonths}>
              ${this.formattedMonth(activeDate)}
            </button>`
          : ''}
        ${this.activeView === 'days' || this.activeView === 'months'
          ? html`<button part="years-navigation" @click=${this.switchToYears}>
              ${activeDate.getFullYear()}
            </button>`
          : ''}
        ${this.activeView === 'years'
          ? html`<span part="years-range">${`${startYear} - ${endYear}`}</span>`
          : ''}
      </div>
      ${renderButtons
        ? html`<div part="navigation-buttons">
            <button part="navigation-button" @click=${this.navigatePrevious}>
              <igc-icon name="navigate_before" collection="internal"></igc-icon>
            </button>
            <button part="navigation-button" @click=${this.navigateNext}>
              <igc-icon name="navigate_next" collection="internal"></igc-icon>
            </button>
          </div>`
        : ''}
    </div>`;
  }

  private renderHeader() {
    if (!this.hasHeader || this.selection === 'multi') {
      return '';
    }

    return html`<div part="header">
      <h5 part="header-title">
        <slot name="title"
          >${this.selection === 'single'
            ? 'Select a date'
            : 'Select a date range'}</slot
        >
      </h5>
      <h2 part="header-date">${this.renderHeaderDate()}</h2>
    </div>`;
  }

  private renderHeaderDate() {
    if (this.selection === 'single') {
      const date = this.value as Date;
      return html`${date
        ? html`${this.formatterWeekday.format(date)},${this
            .headerOrientation === 'vertical'
            ? html`<br />`
            : ' '}${this.formatterMonthDay.format(date)}`
        : 'Selected date'}`;
    }

    const dates = this.value as Date[];

    return html`<span
        >${dates && dates.length
          ? this.formatterMonthDay.format(dates[0])
          : 'Start'}</span
      >
      <span> - </span>
      <span
        >${dates && dates.length > 1
          ? this.formatterMonthDay.format(dates[dates.length - 1])
          : 'End'}</span
      >`;
  }

  render() {
    const activeDates: Date[] = [];
    const monthsCount = this.visibleMonths > 1 ? this.visibleMonths : 1;

    for (let i = 0; i < monthsCount; i++) {
      activeDates.push(
        this.calendarModel.timedelta(
          this.activeDate,
          'month',
          i - this.activeDateMonthIndex
        )
      );
    }

    return html`
      ${this.renderHeader()}
      <div
        part="content"
        style=${styleMap({
          display: 'flex',
          flexGrow: '1',
          flexDirection:
            this.activeView === 'days'
              ? this.orientation === 'horizontal'
                ? 'row'
                : 'column'
              : 'column',
        })}
      >
        ${this.activeView === 'days'
          ? activeDates.map(
              (activeDate, i) => html`<div part="days-view-container">
                ${this.renderNavigation(
                  activeDate,
                  this.orientation === 'horizontal'
                    ? i === activeDates.length - 1
                    : i === 0
                )}
                <igc-days-view
                  part="days-view"
                  .activeDate=${activeDate}
                  .weekStart=${this.weekStart}
                  .weekDayFormat=${this.formatOptions.weekday!}
                  .locale=${this.locale}
                  .selection=${this.selection}
                  .value=${this.value}
                  .hideOutsideDays=${this.hideOutsideDays ||
                  this.visibleMonths > 1}
                  .showWeekNumbers=${this.showWeekNumbers}
                  .disabledDates=${this.disabledDates}
                  .specialDates=${this.specialDates}
                  .rangePreviewDate=${this.rangePreviewDate}
                  exportparts="days-row, label, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, weekend, range, special, disabled, single, preview"
                  @igcChange=${this.changeValue}
                  @igcOutsideDaySelected=${this.outsideDaySelected}
                  @igcActiveDateChange=${this.activeDateChanged}
                  @igcRangePreviewDateChange=${this.rangePreviewDateChange}
                ></igc-days-view>
              </div>`
            )
          : ''}
        ${this.activeView === 'months'
          ? html` ${this.renderNavigation()}
              <igc-months-view
                part="months-view"
                .value=${this.activeDate}
                .locale=${this.locale}
                .monthFormat=${this.formatOptions.month!}
                exportparts="month, selected, month-inner, current"
                @igcChange=${this.changeMonth}
              ></igc-months-view>`
          : ''}
        ${this.activeView === 'years'
          ? html`${this.renderNavigation()}
              <igc-years-view
                part="years-view"
                .value=${this.activeDate}
                .yearsPerPage=${this.yearPerPage}
                exportparts="year, selected, year-inner, current"
                @igcChange=${this.changeYear}
              ></igc-years-view>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-calendar': IgcCalendarComponent;
  }
}
