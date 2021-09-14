import { html } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
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
import { ICalendarDate, TimeDeltaInterval } from './common/calendar.model';
import { watch } from '../common/decorators';
import { calculateYearsRangeStart, setDateSafe } from './common/utils';
import { SizableMixin } from '../common/mixins/sizable';

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;

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

  @state()
  rangePreviewDate?: Date;

  @queryAll('igc-days-view')
  daysViews!: NodeList;

  @query('igc-months-view')
  monthsView!: IgcMonthsViewComponent;

  @query('igc-years-view')
  yearsView!: IgcYearsViewComponent;

  @state()
  protected activeDaysViewIndex = 0;

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

  private handleKeyDown = (event: KeyboardEvent) => {
    const tagName = (event.target as HTMLElement).tagName.toLowerCase();

    if (
      tagName !== 'igc-days-view' &&
      tagName !== 'igc-months-view' &&
      tagName !== 'igc-years-view'
    ) {
      return;
    }

    switch (event.key) {
      case 'PageDown':
        event.preventDefault();

        if (event.shiftKey && this.activeView === 'days') {
          this.nextYear();
        } else {
          this.navigateNext();
        }

        if (this.activeView === 'days') {
          this.focusActiveDate();
        }
        break;
      case 'PageUp':
        event.preventDefault();

        if (event.shiftKey && this.activeView === 'days') {
          this.previousYear();
        } else {
          this.navigatePrevious();
        }

        if (this.activeView === 'days') {
          this.focusActiveDate();
        }
        break;
      case 'Home':
        event.preventDefault();

        if (this.activeView === 'days') {
          const firstDaysView = this.daysViews[0] as IgcDaysViewComponent;
          const activeDate = firstDaysView.activeDate;
          const date = new Date(activeDate);
          date.setDate(1);
          this.activeDate = date;
          this.activeDaysViewIndex = 0;
        } else if (this.activeView === 'months') {
          const date = new Date(this.activeDate);
          date.setMonth(0);
          this.activeDate = date;
        } else if (this.activeView === 'years') {
          const startYear = calculateYearsRangeStart(
            this.activeDate,
            this.yearPerPage
          );
          const date = new Date(this.activeDate);
          date.setDate(1);
          date.setFullYear(startYear);
          setDateSafe(date, this.activeDate.getDate());
          this.activeDate = date;
        }

        this.focusActiveDate();
        break;
      case 'End':
        event.preventDefault();

        if (this.activeView === 'days') {
          const index = this.daysViews.length - 1;
          const lastDaysView = this.daysViews[index] as IgcDaysViewComponent;
          const activeDate = lastDaysView.activeDate;
          const date = new Date(activeDate);
          date.setDate(1);
          date.setMonth(date.getMonth() + 1);
          date.setDate(0);
          this.activeDate = date;
          this.activeDaysViewIndex = index;
        } else if (this.activeView === 'months') {
          const date = new Date(this.activeDate);
          date.setMonth(11);
          this.activeDate = date;
        } else if (this.activeView === 'years') {
          const startYear = calculateYearsRangeStart(
            this.activeDate,
            this.yearPerPage
          );
          const date = new Date(this.activeDate);
          date.setDate(1);
          date.setFullYear(startYear + this.yearPerPage - 1);
          setDateSafe(date, this.activeDate.getDate());
          this.activeDate = date;
        }

        this.focusActiveDate();
        break;
      case 'ArrowLeft':
        event.preventDefault();

        if (this.activeView === 'days') {
          const date = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Day,
            -1
          );

          if (this.visibleMonths > 1) {
            const activeDayView = this.daysViews[
              this.activeDaysViewIndex
            ] as IgcDaysViewComponent;
            const activeMonthDate = activeDayView.activeDate;

            if (activeMonthDate.getMonth() !== date.getMonth()) {
              this.activeDaysViewIndex =
                this.activeDaysViewIndex > 0
                  ? this.activeDaysViewIndex - 1
                  : this.visibleMonths - 1;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.previousMonth();
        } else if (this.activeView === 'years') {
          this.previousYear();
        }

        this.focusActiveDate();
        break;
      case 'ArrowRight':
        event.preventDefault();

        if (this.activeView === 'days') {
          const date = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Day,
            1
          );

          if (this.visibleMonths > 1) {
            const activeDayView = this.daysViews[
              this.activeDaysViewIndex
            ] as IgcDaysViewComponent;
            const activeMonthDate = activeDayView.activeDate;

            if (activeMonthDate.getMonth() !== date.getMonth()) {
              this.activeDaysViewIndex =
                this.activeDaysViewIndex === this.visibleMonths - 1
                  ? 0
                  : this.activeDaysViewIndex + 1;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.nextMonth();
        } else if (this.activeView === 'years') {
          this.nextYear();
        }

        this.focusActiveDate();
        break;
      case 'ArrowUp':
        event.preventDefault();

        if (this.activeView === 'days') {
          const date = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Week,
            -1
          );

          if (this.visibleMonths > 1) {
            const activeDayView = this.daysViews[
              this.activeDaysViewIndex
            ] as IgcDaysViewComponent;
            const activeMonthDate = activeDayView.activeDate;

            if (activeMonthDate.getMonth() !== date.getMonth()) {
              this.activeDaysViewIndex =
                this.activeDaysViewIndex > 0
                  ? this.activeDaysViewIndex - 1
                  : this.visibleMonths - 1;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.activeDate = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Month,
            -MONTHS_PER_ROW
          );
        } else if (this.activeView === 'years') {
          this.activeDate = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Year,
            -YEARS_PER_ROW
          );
        }

        this.focusActiveDate();
        break;
      case 'ArrowDown':
        event.preventDefault();

        if (this.activeView === 'days') {
          const date = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Week,
            1
          );

          if (this.visibleMonths > 1) {
            const activeDayView = this.daysViews[
              this.activeDaysViewIndex
            ] as IgcDaysViewComponent;
            const activeMonthDate = activeDayView.activeDate;

            if (activeMonthDate.getMonth() !== date.getMonth()) {
              this.activeDaysViewIndex =
                this.activeDaysViewIndex === this.visibleMonths - 1
                  ? 0
                  : this.activeDaysViewIndex + 1;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.activeDate = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Month,
            MONTHS_PER_ROW
          );
        } else if (this.activeView === 'years') {
          this.activeDate = this.calendarModel.timedelta(
            this.activeDate,
            TimeDeltaInterval.Year,
            YEARS_PER_ROW
          );
        }

        this.focusActiveDate();
        break;
    }
  };

  private async focusActiveDate() {
    await this.updateComplete;

    if (this.activeView === 'days') {
      const daysView = this.daysViews[
        this.activeDaysViewIndex
      ] as IgcDaysViewComponent;
      daysView.focusActiveDate();
    } else if (this.activeView === 'months') {
      this.monthsView.focusActiveDate();
    } else if (this.activeView === 'years') {
      this.yearsView.focusActiveDate();
    }
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

    this.focusActiveDate();
  }

  private changeYear(event: CustomEvent<void>) {
    event.stopPropagation();
    this.activeDate = (event.target as IgcYearsViewComponent).value;
    this.activeView = 'months';

    this.focusActiveDate();
  }

  private switchToMonths(daysViewIndex: number) {
    this.activateDaysView(daysViewIndex);
    this.activeView = 'months';
  }

  private switchToYears(daysViewIndex: number) {
    if (this.activeView === 'days') {
      this.activateDaysView(daysViewIndex);
    }
    this.activeView = 'years';
  }

  private activateDaysView(daysViewIndex: number) {
    const activeDaysView = this.daysViews[
      daysViewIndex
    ] as IgcDaysViewComponent;
    this.activeDate = activeDaysView.activeDate;
    this.activeDaysViewIndex = daysViewIndex;
  }

  private activeDateChanged(event: CustomEvent<Date>) {
    const daysViews = Array.from(this.daysViews);
    this.activeDaysViewIndex = daysViews.findIndex((d) => d === event.target);
    this.activeDate = event.detail;
  }

  private outsideDaySelected(event: CustomEvent<ICalendarDate>) {
    event.stopPropagation();
    const date = event.detail.date;
    this.activeDate = date;

    this.focusActiveDate();
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
      TimeDeltaInterval.Year,
      this.yearPerPage
    );
  }

  private previousYearsPage() {
    this.activeDate = this.calendarModel.timedelta(
      this.activeDate,
      TimeDeltaInterval.Year,
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

  private renderNavigation(
    activeDate?: Date,
    renderButtons = true,
    daysViewIndex = 0
  ) {
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
          ? html`<button
              part="months-navigation"
              @click=${() => this.switchToMonths(daysViewIndex)}
            >
              ${this.formattedMonth(activeDate)}
            </button>`
          : ''}
        ${this.activeView === 'days' || this.activeView === 'months'
          ? html`<button
              part="years-navigation"
              @click=${() => this.switchToYears(daysViewIndex)}
            >
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
          TimeDeltaInterval.Month,
          i - this.activeDaysViewIndex
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
        @keydown=${this.handleKeyDown}
      >
        ${this.activeView === 'days'
          ? activeDates.map(
              (activeDate, i) => html`<div part="days-view-container">
                ${this.renderNavigation(
                  activeDate,
                  this.orientation === 'horizontal'
                    ? i === activeDates.length - 1
                    : i === 0,
                  i
                )}
                <igc-days-view
                  part="days-view"
                  .active=${this.activeDaysViewIndex === i}
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
