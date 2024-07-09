import { html } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { themeSymbol, themes } from '../../theming/theming-decorator.js';
import type { Theme } from '../../theming/types.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from '../common/i18n/calendar.resources.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import {
  IgcCalendarBaseComponent,
  type IgcCalendarBaseEventMap,
  MONTHS_PER_ROW,
  YEARS_PER_ROW,
} from './common/calendar-base.js';
import {
  type ICalendarDate,
  TimeDeltaInterval,
} from './common/calendar.model.js';
import { calculateYearsRangeStart, setDateSafe } from './common/utils.js';
import IgcDaysViewComponent from './days-view/days-view.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import { styles } from './themes/calendar.base.css.js';
import { all } from './themes/calendar.js';
import IgcYearsViewComponent from './years-view/years-view.js';

export const focusActiveDate = Symbol();

/**
 * Represents a calendar that lets users
 * to select a date value in a variety of different ways.
 *
 * @element igc-calendar
 *
 * @slot - The default slot for the calendar.
 * @slot title - Renders the title of the calendar header.
 *
 * @fires igcChange - Emitted when calendar changes its value.
 *
 * @csspart content - The content container.
 * @csspart days-view - The days view container.
 * @csspart months-view - The months view container.
 * @csspart years-view - The years view container.
 * @csspart header - The header container.
 * @csspart header-title - The header title container.
 * @csspart header-date - The header date container.
 * @csspart navigation - The navigation container.
 * @csspart months-navigation - The months navigation container.
 * @csspart years-navigation - The years navigation container.
 * @csspart years-range - The years range container.
 * @csspart navigation-buttons - The navigation buttons container.
 * @csspart navigation-button - The navigation button container.
 * @csspart navigation-button vertical - The navigation button container
 * when calendar orientation is vertical.
 * @csspart days-view-container - The days view container.
 */
@themes(all)
export default class IgcCalendarComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<IgcCalendarBaseComponent>
>(IgcCalendarBaseComponent) {
  public static readonly tagName = 'igc-calendar';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcCalendarComponent,
      IgcIconComponent,
      IgcDaysViewComponent,
      IgcMonthsViewComponent,
      IgcYearsViewComponent
    );
  }

  private formatterMonth!: Intl.DateTimeFormat;
  private formatterWeekday!: Intl.DateTimeFormat;
  private formatterMonthDay!: Intl.DateTimeFormat;
  private declare readonly [themeSymbol]: Theme;

  @state()
  private rangePreviewDate?: Date;

  @state()
  private activeDaysViewIndex = 0;

  @queryAll('igc-days-view')
  private daysViews!: NodeList;

  @query('igc-months-view')
  private monthsView!: IgcMonthsViewComponent;

  @query('igc-years-view')
  private yearsView!: IgcYearsViewComponent;

  /** Controls the visibility of the dates that do not belong to the current month. */
  @property({ type: Boolean, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /** Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection. */
  @property({ type: Boolean, attribute: 'hide-header' })
  public hideHeader = false;

  /** The orientation of the header. */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  /** The orientation of the multiple months displayed in days view. */
  @property()
  public orientation: 'vertical' | 'horizontal' = 'horizontal';

  /** The number of months displayed in days view. */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 1;

  /** The active view. */
  @property({ attribute: 'active-view' })
  public activeView: 'days' | 'months' | 'years' = 'days';

  /** The options used to format the months and the weekdays in the calendar views. */
  @property({ attribute: false })
  public formatOptions: Pick<Intl.DateTimeFormatOptions, 'month' | 'weekday'> =
    {
      month: 'long',
      weekday: 'narrow',
    };

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings: IgcCalendarResourceStrings =
    IgcCalendarResourceStringEN;

  @watch('formatOptions')
  @watch('locale')
  protected formattersChange() {
    this.initFormatters();
  }

  private yearPerPage = 15;

  constructor() {
    super();
    this.initFormatters();
  }

  private get previousButtonLabel() {
    return this.activeView === 'days'
      ? this.resourceStrings.previousMonth
      : this.activeView === 'months'
        ? this.resourceStrings.previousYear
        : this.activeView === 'years'
          ? this.resourceStrings.previousYears.replace(
              '{0}',
              this.yearPerPage.toString()
            )
          : '';
  }

  private get nextButtonLabel() {
    return this.activeView === 'days'
      ? this.resourceStrings.nextMonth
      : this.activeView === 'months'
        ? this.resourceStrings.nextYear
        : this.activeView === 'years'
          ? this.resourceStrings.nextYears.replace(
              '{0}',
              this.yearPerPage.toString()
            )
          : '';
  }

  private monthSelectLabel(activeDate: Date) {
    return `${activeDate.toLocaleString(this.locale, {
      month: 'long',
    })}, ${this.resourceStrings.selectMonth}`;
  }

  private yearSelectLabel(activeDate: Date) {
    return `${activeDate.getFullYear()}, ${this.resourceStrings.selectYear}`;
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
          this[focusActiveDate]();
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
          this[focusActiveDate]();
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

        this[focusActiveDate]();
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

        this[focusActiveDate]();
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
                this.activeDaysViewIndex > 0 ? this.activeDaysViewIndex - 1 : 0;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.previousMonth();
        } else if (this.activeView === 'years') {
          this.previousYear();
        }

        this[focusActiveDate]();
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
                  ? this.activeDaysViewIndex
                  : this.activeDaysViewIndex + 1;
            }
          }
          this.activeDate = date;
        } else if (this.activeView === 'months') {
          this.nextMonth();
        } else if (this.activeView === 'years') {
          this.nextYear();
        }

        this[focusActiveDate]();
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
                this.activeDaysViewIndex > 0 ? this.activeDaysViewIndex - 1 : 0;
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

        this[focusActiveDate]();
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
                  ? this.activeDaysViewIndex
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

        this[focusActiveDate]();
        break;
    }
  };

  public async [focusActiveDate]() {
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
      weekday: 'short',
    });
    this.formatterMonthDay = new Intl.DateTimeFormat(this.locale, {
      month: 'short',
      day: 'numeric',
    });
  }

  private formattedMonth(value: Date) {
    return this.formatterMonth.format(value);
  }

  private changeValue(event: CustomEvent<void>) {
    event.stopPropagation();

    const daysView = event.target as IgcDaysViewComponent;
    let newValue: Date | Date[] | undefined;

    if (this.selection === 'single') {
      this.value = daysView.value;
      newValue = this.value;
    } else {
      this.values = daysView.values;
      newValue = this.values;
    }

    this.emitEvent('igcChange', { detail: newValue });
  }

  private changeMonth(event: CustomEvent<void>) {
    event.stopPropagation();
    this.activeDate = (event.target as IgcMonthsViewComponent).value;
    this.activeView = 'days';

    this[focusActiveDate]();
  }

  private changeYear(event: CustomEvent<void>) {
    event.stopPropagation();
    this.activeDate = (event.target as IgcYearsViewComponent).value;
    this.activeView = 'months';

    this[focusActiveDate]();
  }

  private async switchToMonths(daysViewIndex: number) {
    this.activateDaysView(daysViewIndex);
    this.activeView = 'months';

    await this.updateComplete;
    this[focusActiveDate]();
  }

  private async switchToYears(daysViewIndex: number) {
    if (this.activeView === 'days') {
      this.activateDaysView(daysViewIndex);
    }
    this.activeView = 'years';

    await this.updateComplete;
    this[focusActiveDate]();
  }

  private activateDaysView(daysViewIndex: number) {
    const activeDaysView = this.daysViews[
      daysViewIndex
    ] as IgcDaysViewComponent;
    this.activeDate = activeDaysView.activeDate;
    this.activeDaysViewIndex = daysViewIndex;
  }

  private activeDateChanged(event: CustomEvent<ICalendarDate>) {
    const day = event.detail;
    const daysViews = Array.from(this.daysViews);

    this.activeDaysViewIndex = daysViews.indexOf(event.target as Node);
    this.activeDate = day.date;

    if (!day.isCurrentMonth) {
      this[focusActiveDate]();
    }
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
    activeDate = this.activeDate,
    renderButtons = true,
    daysViewIndex = 0
  ) {
    let startYear = undefined;
    let endYear = undefined;
    const prev_icon =
      this[themeSymbol] === 'fluent' ? 'arrow_upward' : 'navigate_before';
    const next_icon =
      this[themeSymbol] === 'fluent' ? 'arrow_downward' : 'navigate_next';

    if (this.activeView === 'years') {
      startYear = calculateYearsRangeStart(activeDate, this.yearPerPage);
      endYear = startYear + this.yearPerPage - 1;
    }

    return html`<div part="navigation">
      <div part="picker-dates">
        ${this.activeView === 'days'
          ? html`<button
              part="months-navigation"
              aria-label=${this.monthSelectLabel(activeDate)}
              @click=${() => this.switchToMonths(daysViewIndex)}
            >
              ${this.formattedMonth(activeDate)}
            </button>`
          : ''}
        ${this.activeView === 'days' || this.activeView === 'months'
          ? html`<span class="aria-off-screen" aria-live="polite">
                ${this.activeView === 'days'
                  ? activeDate.toLocaleString(this.locale, {
                      month: 'long',
                      year: 'numeric',
                    })
                  : activeDate.getFullYear()}
              </span>
              <button
                part="years-navigation"
                aria-label=${this.yearSelectLabel(activeDate)}
                @click=${() => this.switchToYears(daysViewIndex)}
              >
                ${activeDate.getFullYear()}
              </button>`
          : ''}
        ${this.activeView === 'years'
          ? html`<span part="years-range" aria-live="polite"
              >${`${startYear} - ${endYear}`}</span
            >`
          : ''}
      </div>
      ${renderButtons
        ? html`<div part="navigation-buttons">
            <button
              part=${partNameMap({
                'navigation-button': true,
                vertical: this.orientation === 'vertical',
              })}
              aria-label=${this.previousButtonLabel}
              @click=${this.navigatePrevious}
            >
              <igc-icon
                aria-hidden="true"
                name=${prev_icon}
                collection="internal"
              ></igc-icon>
            </button>
            <button
              part=${partNameMap({
                'navigation-button': true,
                vertical: this.orientation === 'vertical',
              })}
              aria-label=${this.nextButtonLabel}
              @click=${this.navigateNext}
            >
              <igc-icon
                aria-hidden="true"
                name=${next_icon}
                collection="internal"
              ></igc-icon>
            </button>
          </div>`
        : ''}
    </div>`;
  }

  private renderHeader() {
    if (this.hideHeader || this.selection === 'multiple') {
      return '';
    }

    return html`<div part="header">
      <h5 part="header-title">
        <slot name="title"
          >${this.selection === 'single'
            ? this.resourceStrings.selectDate
            : this.resourceStrings.selectRange}</slot
        >
      </h5>
      <h2 part="header-date">${this.renderHeaderDate()}</h2>
    </div>`;
  }

  private renderHeaderDate() {
    if (this.selection === 'single') {
      const date = this.value;
      return html`${date
        ? html`${this.formatterWeekday.format(date)},${this
            .headerOrientation === 'vertical'
            ? html`<br />`
            : ' '}${this.formatterMonthDay.format(date)}`
        : this.resourceStrings.selectedDate}`;
    }

    const dates = this.values;

    return html`<span
        >${dates?.length
          ? this.formatterMonthDay.format(dates[0])
          : this.resourceStrings.startDate}</span
      >
      <span> - </span>
      <span
        >${dates && dates.length > 1
          ? this.formatterMonthDay.format(dates[dates.length - 1])
          : this.resourceStrings.endDate}</span
      >`;
  }

  protected override render() {
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
              (activeDate, i) =>
                html`<div part="days-view-container">
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
                    .weekDayFormat=${this.formatOptions.weekday as
                      | 'long'
                      | 'short'
                      | 'narrow'
                      | undefined}
                    .locale=${this.locale}
                    .selection=${this.selection}
                    .value=${this.value}
                    .values=${this.values}
                    .hideLeadingDays=${this.hideOutsideDays || i !== 0}
                    .hideTrailingDays=${this.hideOutsideDays ||
                    i !== activeDates.length - 1}
                    .showWeekNumbers=${this.showWeekNumbers}
                    .disabledDates=${this.disabledDates}
                    .specialDates=${this.specialDates}
                    .rangePreviewDate=${this.rangePreviewDate}
                    .resourceStrings=${this.resourceStrings}
                    exportparts="days-row, label, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, weekend, range, special, disabled, single, preview"
                    @igcChange=${this.changeValue}
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
                .monthFormat=${this.formatOptions.month as
                  | 'long'
                  | 'numeric'
                  | 'short'
                  | 'narrow'
                  | '2-digit'
                  | undefined}
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
