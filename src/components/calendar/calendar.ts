import { html, nothing } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
} from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcCalendarResourceStringEN } from '../common/i18n/calendar.resources.js';
import { createDateTimeFormatters } from '../common/localization/intl-formatters.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  clamp,
  findElementFromEventPath,
  first,
  formatString,
  last,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import type { ContentOrientation } from '../types.js';
import { IgcCalendarBaseComponent } from './base.js';
import IgcDaysViewComponent from './days-view/days-view.js';
import {
  areSameMonth,
  getYearRange,
  isDateInRanges,
  MONTHS_PER_ROW,
  YEARS_PER_PAGE,
  YEARS_PER_ROW,
} from './helpers.js';
import { CalendarDay } from './model.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import { styles } from './themes/calendar.base.css.js';
import { all } from './themes/calendar.js';
import type {
  CalendarActiveView,
  CalendarHeaderOrientation,
  IgcCalendarComponentEventMap,
} from './types.js';
import IgcYearsViewComponent from './years-view/years-view.js';

export const focusActiveDate = Symbol();

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * Represents a calendar that lets users
 * to select a date value in a variety of different ways.
 *
 * @element igc-calendar
 *
 * @slot - The default slot for the calendar.
 * @slot title - Renders the title of the calendar header.
 * @slot header-date - Renders content instead of the current date/range in the calendar header.
 *
 * @fires igcChange - Emitted when calendar changes its value.
 *
 * @csspart header - The header element of the calendar.
 * @csspart header-title - The header title element of the calendar.
 * @csspart header-date - The header date element of the calendar.
 * @csspart content - The content element which contains the views and navigation elements of the calendar.
 * @csspart content-vertical - The content element which contains the views and navigation elements of the calendar in vertical orientation.
 * @csspart navigation - The navigation container element of the calendar.
 * @csspart months-navigation - The months navigation button element of the calendar.
 * @csspart years-navigation - The years navigation button element of the calendar.
 * @csspart years-range - The years range element of the calendar.
 * @csspart navigation-buttons - The navigation buttons container of the calendar.
 * @csspart navigation-button - Previous/next navigation button of the calendar.
 * @csspart days-view-container - The days view container element of the calendar.
 * @csspart days-view - Days view element of the calendar.
 * @csspart months-view - The months view element of the calendar.
 * @csspart years-view - The years view element of the calendar.
 * @csspart days-row - Days row element of the calendar.
 * @csspart label - Week header label element of the calendar.
 * @csspart week-number - Week number element of the calendar.
 * @csspart week-number-inner - Week number inner element of the calendar.
 * @csspart date - Date element of the calendar.
 * @csspart date-inner - Date inner element of the calendar.
 * @csspart first - The first selected date element of the calendar in range selection.
 * @csspart last - The last selected date element of the calendar in range selection.
 * @csspart inactive - Inactive date element of the calendar.
 * @csspart hidden - Hidden date element of the calendar.
 * @csspart weekend - Weekend date element of the calendar.
 * @csspart range - Range selected element of the calendar.
 * @csspart special - Special date element of the calendar.
 * @csspart disabled - Disabled date element of the calendar.
 * @csspart single - Single selected date element of the calendar.
 * @csspart preview - Range selection preview date element of the calendar.
 * @csspart month - Month element of the calendar.
 * @csspart month-inner - Month inner element of the calendar.
 * @csspart year - Year element of the calendar.
 * @csspart year-inner - Year inner element of the calendar.
 * @csspart selected - Indicates selected state. Applies to date, month and year elements of the calendar.
 * @csspart current - Indicates current state. Applies to date, month and year elements of the calendar.
 */
export default class IgcCalendarComponent extends EventEmitterMixin<
  IgcCalendarComponentEventMap,
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

  private get _isDayView() {
    return this.activeView === 'days';
  }

  private get _isMonthView() {
    return this.activeView === 'months';
  }

  private get _isYearView() {
    return this.activeView === 'years';
  }

  private get previousButtonLabel() {
    if (this._isDayView) {
      return this.resourceStrings.previousMonth;
    }
    if (this._isMonthView) {
      return this.resourceStrings.previousYear;
    }
    return formatString(this.resourceStrings.previousYears, YEARS_PER_PAGE);
  }

  private get nextButtonLabel() {
    if (this._isDayView) {
      return this.resourceStrings.nextMonth;
    }
    if (this._isMonthView) {
      return this.resourceStrings.nextYear;
    }
    return formatString(this.resourceStrings.nextYears, YEARS_PER_PAGE);
  }

  private contentRef: Ref<HTMLDivElement> = createRef();

  @state()
  private activeDaysViewIndex = 0;

  @queryAll(IgcDaysViewComponent.tagName)
  private daysViews!: NodeListOf<IgcDaysViewComponent>;

  @query(IgcMonthsViewComponent.tagName)
  private monthsView!: IgcMonthsViewComponent;

  @query(IgcYearsViewComponent.tagName)
  private yearsView!: IgcYearsViewComponent;

  /**
   * Whether to show the dates that do not belong to the current active month.
   * @attr hide-outside-days
   */
  @property({ type: Boolean, attribute: 'hide-outside-days', reflect: true })
  public hideOutsideDays = false;

  /**
   * Whether to render the calendar header part.
   * When the calendar selection is set to `multiple` the header is always hidden.
   *
   * @attr hide-header
   */
  @property({ type: Boolean, attribute: 'hide-header', reflect: true })
  public hideHeader = false;

  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   */
  @property({ reflect: true, attribute: 'header-orientation' })
  public headerOrientation: CalendarHeaderOrientation = 'horizontal';

  /**
   * The orientation of the calendar months when more than one month
   * is being shown.
   * @attr orientation
   */
  @property({ reflect: true, attribute: 'orientation' })
  public orientation: ContentOrientation = 'horizontal';

  /**
   * The number of months displayed in the days view.
   * @attr visible-months
   */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 1;

  /**
   * The current active view of the component.
   * @attr active-view
   */
  @property({ attribute: 'active-view' })
  public activeView: CalendarActiveView = 'days';

  /** The options used to format the months and the weekdays in the calendar views. */
  @property({ attribute: false })
  public formatOptions: Pick<Intl.DateTimeFormatOptions, 'month' | 'weekday'> =
    { month: 'long', weekday: 'narrow' };

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public resourceStrings = IgcCalendarResourceStringEN;

  private _intl = createDateTimeFormatters(this.locale, {
    month: {
      month: this.formatOptions.month,
    },
    monthLabel: { month: 'long' },
    weekday: { weekday: 'short' },
    monthDay: { month: 'short', day: 'numeric' },
    yearLabel: { month: 'long', year: 'numeric' },
  });

  @watch('locale')
  protected localeChange() {
    this._intl.locale = this.locale;
  }

  @watch('formatOptions')
  protected formatOptionsChange() {
    this._intl.update({
      month: {
        month: this.formatOptions.month,
      },
    });
  }

  /** @private @hidden @internal */
  public async [focusActiveDate](options?: FocusOptions) {
    await this.updateComplete;

    if (this._isDayView) {
      return this.daysViews
        .item(this.activeDaysViewIndex)
        .focusActiveDate(options);
    }

    if (this._isMonthView) {
      return this.monthsView.focusActiveDate(options);
    }

    if (this._isYearView) {
      return this.yearsView.focusActiveDate(options);
    }
  }

  private updateViewIndex(date: CalendarDay, delta: -1 | 1) {
    if (this.visibleMonths === 1) return;

    const index = this.activeDaysViewIndex;
    const view = CalendarDay.from(this.daysViews.item(index).activeDate);

    if (date.month !== view.month) {
      this.activeDaysViewIndex = clamp(
        index + delta,
        0,
        this.visibleMonths - 1
      );
    }
  }

  private getSubsequentActiveDate(start: CalendarDay, delta: number) {
    const disabled = this._disabledDates;
    let beginning = start.clone();

    while (isDateInRanges(beginning, disabled)) {
      beginning = beginning.add('day', delta);
    }

    return beginning;
  }

  private handleArrowKey(period: 'day' | 'week', delta: -1 | 1) {
    if (this._isDayView) {
      const date = this.getSubsequentActiveDate(
        this._activeDate.add(period, delta),
        delta
      );
      this.updateViewIndex(date, delta);
      this._activeDate = date;
    } else {
      const monthOrYear = this._isMonthView ? 'month' : 'year';
      const monthOrYearDelta =
        (this._isMonthView ? MONTHS_PER_ROW : YEARS_PER_ROW) * delta;

      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.add(
          monthOrYear,
          period === 'week' ? monthOrYearDelta : delta
        ),
        delta
      );
    }

    this[focusActiveDate]();
  }

  private onPageKeys(delta: -1 | 1) {
    const unit = this._isDayView ? 'month' : 'year';
    const increment = (this._isYearView ? YEARS_PER_PAGE : 1) * delta;

    this._activeDate = this.getSubsequentActiveDate(
      this._activeDate.add(unit, increment),
      increment
    );
    this[focusActiveDate]();
  }

  private onShiftPageKeys(delta: -1 | 1) {
    if (this._isDayView) {
      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.add('year', delta),
        delta
      );
      this[focusActiveDate]();
    }
  }

  private onHomeKey() {
    if (this._isDayView) {
      const first = CalendarDay.from(this.daysViews.item(0).activeDate);
      this._activeDate = this.getSubsequentActiveDate(
        first.set({ date: 1 }),
        1
      );

      this.activeDaysViewIndex = 0;
    }

    if (this._isMonthView) {
      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.set({ month: 0 }),
        1
      );
    }

    if (this._isYearView) {
      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.set({
          year: getYearRange(this._activeDate, YEARS_PER_PAGE).start,
        }),
        1
      );
    }

    this[focusActiveDate]();
  }

  private onEndKey() {
    if (this._isDayView) {
      const index = this.daysViews.length - 1;
      const last = CalendarDay.from(this.daysViews.item(index).activeDate);
      this._activeDate = this.getSubsequentActiveDate(
        last.set({ month: last.month + 1, date: 0 }),
        -1
      );
      this.activeDaysViewIndex = index;
    }

    if (this._isMonthView) {
      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.set({ month: 11 }),
        -1
      );
    }

    if (this._isYearView) {
      this._activeDate = this.getSubsequentActiveDate(
        this._activeDate.set({
          year: getYearRange(this._activeDate, YEARS_PER_PAGE).end,
        }),
        -1
      );
    }

    this[focusActiveDate]();
  }

  private isNotFromCalendarView(_: Element, event: KeyboardEvent) {
    return !findElementFromEventPath(
      `${IgcDaysViewComponent.tagName}, ${IgcMonthsViewComponent.tagName}, ${IgcYearsViewComponent.tagName}`,
      event
    );
  }

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      skip: this.isNotFromCalendarView,
      ref: this.contentRef,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set(arrowLeft, this.handleArrowKey.bind(this, 'day', -1))
      .set(arrowRight, this.handleArrowKey.bind(this, 'day', 1))
      .set(arrowUp, this.handleArrowKey.bind(this, 'week', -1))
      .set(arrowDown, this.handleArrowKey.bind(this, 'week', 1))
      .set([shiftKey, pageUpKey], this.onShiftPageKeys.bind(this, -1))
      .set([shiftKey, pageDownKey], this.onShiftPageKeys.bind(this, 1))
      .set(pageUpKey, this.onPageKeys.bind(this, -1))
      .set(pageDownKey, this.onPageKeys.bind(this, 1))
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey);
  }

  protected renderNavigationButtons() {
    const parts = {
      'navigation-button': true,
      vertical: this.orientation === 'vertical',
    };

    return html`
      <div part="navigation-buttons">
        <button
          part=${partMap(parts)}
          aria-label=${this.previousButtonLabel}
          @click=${this.navigatePrevious}
        >
          <igc-icon
            aria-hidden="true"
            name="arrow_prev"
            collection="default"
          ></igc-icon>
        </button>

        <button
          part=${partMap(parts)}
          aria-label=${this.nextButtonLabel}
          @click=${this.navigateNext}
        >
          <igc-icon
            aria-hidden="true"
            name="arrow_next"
            collection="default"
          ></igc-icon>
        </button>
      </div>
    `;
  }

  protected renderMonthButtonNavigation(
    active: CalendarDay,
    viewIndex: number
  ) {
    const labelFmt = this._intl.get('monthLabel').format;
    const valueFmt = this._intl.get('month').format;
    const ariaLabel = `${labelFmt(active.native)}, ${this.resourceStrings.selectMonth}`;

    return html`
      <button
        part="months-navigation"
        aria-label=${ariaLabel}
        @click=${() => this.switchToMonths(viewIndex)}
      >
        ${valueFmt(active.native)}
      </button>
    `;
  }

  protected renderYearButtonNavigation(active: CalendarDay, viewIndex: number) {
    const fmt = this._intl.get('yearLabel').format;
    const ariaLabel = `${active.year}, ${this.resourceStrings.selectYear}`;
    const ariaSkip = this._isDayView ? fmt(active.native) : active.year;

    return html`
      <span class="aria-off-screen" aria-live="polite">${ariaSkip}</span>
      <button
        part="years-navigation"
        aria-label=${ariaLabel}
        @click=${() => this.switchToYears(viewIndex)}
      >
        ${active.year}
      </button>
    `;
  }

  protected renderYearRangeNavigation(active: CalendarDay) {
    const { start, end } = getYearRange(active, YEARS_PER_PAGE);

    return html`
      <span part="years-range" aria-live="polite"> ${start} - ${end} </span>
    `;
  }

  protected renderNavigation(
    date?: CalendarDay,
    showButtons = true,
    viewIndex = 0
  ) {
    const activeDate = date ?? this._activeDate;

    return html`
      <div part="navigation">
        <div part="picker-dates">
          ${this._isDayView
            ? this.renderMonthButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${this._isDayView || this._isMonthView
            ? this.renderYearButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${this._isYearView
            ? this.renderYearRangeNavigation(activeDate)
            : nothing}
        </div>
        ${showButtons ? this.renderNavigationButtons() : nothing}
      </div>
    `;
  }

  protected renderHeader() {
    if (this.hideHeader || this._isMultiple) {
      return nothing;
    }

    const title = this._isSingle
      ? this.resourceStrings.selectDate
      : this.resourceStrings.selectRange;

    return html`
      <div part="header">
        <h5 part="header-title">
          <slot name="title">${title}</slot>
        </h5>
        <h2 part="header-date">${this.renderHeaderDate()}</h2>
      </div>
    `;
  }

  protected renderHeaderDateSingle() {
    const date = this.value ?? CalendarDay.today.native;
    const day = this._intl.get('weekday').format(date);
    const month = this._intl.get('monthDay').format(date);
    const separator =
      this.headerOrientation === 'vertical' ? html`<br />` : ' ';

    const formatted = html`${day},${separator}${month}`;

    return html`<slot name="header-date">${formatted}</slot>`;
  }

  protected renderHeaderDateRange() {
    const values = this.values;
    const fmt = this._intl.get('monthDay').format;
    const { startDate, endDate } = this.resourceStrings;

    const start = this._hasValues ? fmt(first(values)) : startDate;
    const end =
      this._hasValues && values.length > 1 ? fmt(last(values)) : endDate;

    return html`
      <slot name="header-date">
        <span>${start}</span>
        <span> - </span>
        <span>${end}</span>
      </slot>
    `;
  }

  protected renderHeaderDate() {
    return this._isSingle
      ? this.renderHeaderDateSingle()
      : this.renderHeaderDateRange();
  }

  protected renderDaysView() {
    const activeDates = this.getActiveDates();
    const horizontal = this.orientation === 'horizontal';
    const length = activeDates.length - 1;
    const format = this.formatOptions
      .weekday as Intl.DateTimeFormatOptions['weekday'];

    return html`${activeDates.map(
      (date, idx) => html`
        <div part="days-view-container">
          ${this.renderNavigation(
            date,
            horizontal ? idx === length : idx === 0,
            idx
          )}
          <igc-days-view
            @igcChange=${this.changeValue}
            @igcActiveDateChange=${this.activeDateChanged}
            @igcRangePreviewDateChange=${this.rangePreviewDateChanged}
            part="days-view"
            exportparts="days-row, label, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, current-vertical, weekend, range, special, disabled, single, preview"
            .active=${this.activeDaysViewIndex === idx}
            .activeDate=${date.native}
            .disabledDates=${this.disabledDates}
            .hideLeadingDays=${this.hideOutsideDays || idx !== 0}
            .hideTrailingDays=${this.hideOutsideDays || idx !== length}
            .locale=${this.locale}
            .rangePreviewDate=${this._rangePreviewDate?.native}
            .resourceStrings=${this.resourceStrings}
            .selection=${this.selection}
            .showWeekNumbers=${this.showWeekNumbers}
            .specialDates=${this._specialDates}
            .value=${this.value}
            .values=${this.values}
            .weekDayFormat=${format!}
            .weekStart=${this.weekStart}
          ></igc-days-view>
        </div>
      `
    )}`;
  }

  protected renderMonthView() {
    const format = this.formatOptions
      .month as Intl.DateTimeFormatOptions['month'];

    return html`
      ${this.renderNavigation()}
      <igc-months-view
        part="months-view"
        exportparts="month, selected, month-inner, current"
        @igcChange=${this.changeMonth}
        .value=${this.activeDate}
        .locale=${this.locale}
        .monthFormat=${format!}
      ></igc-months-view>
    `;
  }

  protected renderYearView() {
    return html`
      ${this.renderNavigation()}
      <igc-years-view
        part="years-view"
        exportparts="year, selected, year-inner, current"
        @igcChange=${this.changeYear}
        .value=${this.activeDate}
        .yearsPerPage=${YEARS_PER_PAGE}
      ></igc-years-view>
    `;
  }

  protected override render() {
    const direction = this._isDayView && this.orientation === 'horizontal';

    const part = direction ? 'content' : 'content content-vertical';

    return html`
      ${this.renderHeader()}
      <div ${ref(this.contentRef)} part="${part}">
        ${choose(this.activeView, [
          ['days', () => this.renderDaysView()],
          ['months', () => this.renderMonthView()],
          ['years', () => this.renderYearView()],
        ])}
      </div>
    `;
  }

  protected changeMonth(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.activeDate = event.detail;
    this.activeView = 'days';

    this[focusActiveDate]();
  }

  protected changeYear(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.activeDate = event.detail;
    this.activeView = 'months';

    this[focusActiveDate]();
  }

  protected changeValue(event: CustomEvent<Date>) {
    event.stopPropagation();

    const view = event.target as IgcDaysViewComponent;
    if (this._isSingle) {
      this.value = view.value;
    } else {
      this.values = view.values;
    }

    this.emitEvent('igcChange', {
      detail: this._isSingle ? (this.value as Date) : this.values,
    });
  }

  protected activeDateChanged(event: CustomEvent<Date>) {
    const view = event.target as IgcDaysViewComponent;
    const views = Array.from(this.daysViews);

    this.activeDaysViewIndex = views.indexOf(view);
    this.activeDate = event.detail;

    if (!areSameMonth(this.activeDate, view.activeDate)) {
      this[focusActiveDate]();
    }
  }

  protected rangePreviewDateChanged(event: CustomEvent<Date>) {
    this._rangePreviewDate = event.detail
      ? CalendarDay.from(event.detail)
      : undefined;
  }

  private getActiveDates() {
    const current = this.activeDaysViewIndex;
    const length = Math.max(this.visibleMonths, 1);

    return Array.from({ length }, (_, i) =>
      this._activeDate.add('month', i - current)
    );
  }

  private activateDaysView(index: number) {
    const view = this.daysViews.item(index);
    this.activeDate = view.activeDate;
    this.activeDaysViewIndex = index;
  }

  private navigatePrevious() {
    const unit = this._isDayView ? 'month' : 'year';
    const delta = this._isYearView ? YEARS_PER_PAGE : 1;
    this._activeDate = this._activeDate.add(unit, -delta);
  }

  private navigateNext() {
    const unit = this._isDayView ? 'month' : 'year';
    const delta = this._isYearView ? YEARS_PER_PAGE : 1;
    this._activeDate = this._activeDate.add(unit, delta);
  }

  private switchToMonths(viewIndex: number) {
    this.activateDaysView(viewIndex);
    this.activeView = 'months';

    this[focusActiveDate]();
  }

  private switchToYears(viewIndex: number) {
    if (this._isDayView) {
      this.activateDaysView(viewIndex);
    }
    this.activeView = 'years';

    this[focusActiveDate]();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-calendar': IgcCalendarComponent;
  }
}
