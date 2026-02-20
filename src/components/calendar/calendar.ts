import { getDateFormatter } from 'igniteui-i18n-core';
import { html, nothing, type TemplateResult } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { createRef, ref } from 'lit/directives/ref.js';
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
import { registerComponent } from '../common/definitions/register.js';
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
  public static register(): void {
    registerComponent(
      IgcCalendarComponent,
      IgcIconComponent,
      IgcDaysViewComponent,
      IgcMonthsViewComponent,
      IgcYearsViewComponent
    );
  }

  //#region Internal state

  private readonly _contentRef = createRef<HTMLDivElement>();

  private get _isDayView(): boolean {
    return this.activeView === 'days';
  }

  private get _isMonthView(): boolean {
    return this.activeView === 'months';
  }

  private get _isYearView(): boolean {
    return this.activeView === 'years';
  }

  private get _previousButtonLabel(): string {
    switch (this.activeView) {
      case 'days':
        return this.resourceStrings.previousMonth;
      case 'months':
        return this.resourceStrings.previousYear;
      case 'years':
        return formatString(this.resourceStrings.previousYears, YEARS_PER_PAGE);
      default:
        return '';
    }
  }

  private get _nextButtonLabel(): string {
    switch (this.activeView) {
      case 'days':
        return this.resourceStrings.nextMonth;
      case 'months':
        return this.resourceStrings.nextYear;
      case 'years':
        return formatString(this.resourceStrings.nextYears, YEARS_PER_PAGE);
      default:
        return '';
    }
  }

  @state()
  private _activeDaysViewIndex = 0;

  @queryAll(IgcDaysViewComponent.tagName)
  private readonly _daysViews!: NodeListOf<IgcDaysViewComponent>;

  @query(IgcMonthsViewComponent.tagName)
  private readonly _monthsView!: IgcMonthsViewComponent;

  @query(IgcYearsViewComponent.tagName)
  private readonly _yearsView!: IgcYearsViewComponent;

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether to show the dates that do not belong to the current active month.
   * @attr hide-outside-days
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-outside-days', reflect: true })
  public hideOutsideDays = false;

  /**
   * Whether to render the calendar header part.
   * When the calendar selection is set to `multiple` the header is always hidden.
   *
   * @attr hide-header
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-header', reflect: true })
  public hideHeader = false;

  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   * @default "horizontal"
   */
  @property({ reflect: true, attribute: 'header-orientation' })
  public headerOrientation: CalendarHeaderOrientation = 'horizontal';

  /**
   * The orientation of the calendar months when more than one month
   * is being shown.
   * @attr orientation
   * @default "horizontal"
   */
  @property()
  public orientation: ContentOrientation = 'horizontal';

  /**
   * The number of months displayed in the days view.
   * @attr visible-months
   * @default 1
   */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 1;

  /**
   * The current active view of the component.
   * @attr active-view
   * @default "days"
   */
  @property({ attribute: 'active-view' })
  public activeView: CalendarActiveView = 'days';

  /** The options used to format the months and the weekdays in the calendar views. */
  @property({ attribute: false })
  public formatOptions: Pick<Intl.DateTimeFormatOptions, 'month' | 'weekday'> =
    { month: 'long', weekday: 'narrow' };

  //#endregion

  //#region Lifecycle hooks

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      skip: this._shouldSkipKeyboardEvent,
      ref: this._contentRef,
      bindingDefaults: { triggers: ['keydownRepeat'] },
    })
      .set(arrowLeft, this._handleArrowKey.bind(this, 'day', -1))
      .set(arrowRight, this._handleArrowKey.bind(this, 'day', 1))
      .set(arrowUp, this._handleArrowKey.bind(this, 'week', -1))
      .set(arrowDown, this._handleArrowKey.bind(this, 'week', 1))
      .set([shiftKey, pageUpKey], this._handleShiftPageKeys.bind(this, -1))
      .set([shiftKey, pageDownKey], this._handleShiftPageKeys.bind(this, 1))
      .set(pageUpKey, this._handlePageKeys.bind(this, -1))
      .set(pageDownKey, this._handlePageKeys.bind(this, 1))
      .set(homeKey, this._handleHomeKey)
      .set(endKey, this._handleEndKey);
  }

  //#endregion

  //#region Keyboard event handlers

  private _shouldSkipKeyboardEvent(_: Element, event: KeyboardEvent): boolean {
    return !findElementFromEventPath(
      `${IgcDaysViewComponent.tagName}, ${IgcMonthsViewComponent.tagName}, ${IgcYearsViewComponent.tagName}`,
      event
    );
  }

  private _handleArrowKey(period: 'day' | 'week', delta: -1 | 1): void {
    if (this._isDayView) {
      const date = this._getNextEnabledDate(
        this._activeDate.add(period, delta),
        delta
      );
      this._updateViewIndex(date, delta);
      this._activeDate = date;
    } else {
      const monthOrYear = this._isMonthView ? 'month' : 'year';
      const monthOrYearDelta =
        (this._isMonthView ? MONTHS_PER_ROW : YEARS_PER_ROW) * delta;

      this._activeDate = this._getNextEnabledDate(
        this._activeDate.add(
          monthOrYear,
          period === 'week' ? monthOrYearDelta : delta
        ),
        delta
      );
    }

    this[focusActiveDate]();
  }

  private _handlePageKeys(delta: -1 | 1): void {
    const unit = this._isDayView ? 'month' : 'year';
    const increment = (this._isYearView ? YEARS_PER_PAGE : 1) * delta;

    this._activeDate = this._getNextEnabledDate(
      this._activeDate.add(unit, increment),
      increment
    );
    this[focusActiveDate]();
  }

  private _handleShiftPageKeys(delta: -1 | 1): void {
    if (this._isDayView) {
      this._activeDate = this._getNextEnabledDate(
        this._activeDate.add('year', delta),
        delta
      );
      this[focusActiveDate]();
    }
  }

  private _handleHomeKey(): void {
    switch (this.activeView) {
      case 'days': {
        const firstView = CalendarDay.from(this._daysViews.item(0).activeDate);
        this._activeDate = this._getNextEnabledDate(
          firstView.set({ date: 1 }),
          1
        );
        this._activeDaysViewIndex = 0;
        break;
      }
      case 'months':
        this._activeDate = this._getNextEnabledDate(
          this._activeDate.set({ month: 0 }),
          1
        );
        break;
      case 'years':
        this._activeDate = this._getNextEnabledDate(
          this._activeDate.set({
            year: getYearRange(this._activeDate, YEARS_PER_PAGE).start,
          }),
          1
        );
        break;
    }

    this[focusActiveDate]();
  }

  private _handleEndKey(): void {
    switch (this.activeView) {
      case 'days': {
        const index = this._daysViews.length - 1;
        const lastView = CalendarDay.from(
          this._daysViews.item(index).activeDate
        );
        this._activeDate = this._getNextEnabledDate(
          lastView.set({ month: lastView.month + 1, date: 0 }),
          -1
        );
        this._activeDaysViewIndex = index;
        break;
      }
      case 'months':
        this._activeDate = this._getNextEnabledDate(
          this._activeDate.set({ month: 11 }),
          -1
        );
        break;
      case 'years':
        this._activeDate = this._getNextEnabledDate(
          this._activeDate.set({
            year: getYearRange(this._activeDate, YEARS_PER_PAGE).end,
          }),
          -1
        );
        break;
    }

    this[focusActiveDate]();
  }

  //#endregion

  //#region Event handlers

  private _handleMonthChange(event: CustomEvent<Date>): void {
    event.stopPropagation();
    this.activeDate = event.detail;
    this.activeView = 'days';

    this[focusActiveDate]();
  }

  private _handleYearChange(event: CustomEvent<Date>): void {
    event.stopPropagation();
    this.activeDate = event.detail;
    this.activeView = 'months';

    this[focusActiveDate]();
  }

  private _handleValueChange(event: CustomEvent<Date>): void {
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

  private _handleActiveDateChange(event: CustomEvent<Date>): void {
    const view = event.target as IgcDaysViewComponent;
    const views = Array.from(this._daysViews);

    this._activeDaysViewIndex = views.indexOf(view);
    this.activeDate = event.detail;

    if (!areSameMonth(this.activeDate, view.activeDate)) {
      this[focusActiveDate]();
    }
  }

  private _handleRangePreviewChange(event: CustomEvent<Date>): void {
    this._rangePreviewDate = event.detail
      ? CalendarDay.from(event.detail)
      : undefined;
  }

  //#endregion

  //#region Internal navigation methods

  private _setActiveDaysView(viewIndex: number): void {
    const view = this._daysViews.item(viewIndex);
    this.activeDate = view.activeDate;
    this._activeDaysViewIndex = viewIndex;
  }

  private _navigate(delta: 1 | -1): void {
    const unit = this._isDayView ? 'month' : 'year';
    const increment = (this._isYearView ? YEARS_PER_PAGE : 1) * delta;
    this._activeDate = this._activeDate.add(unit, increment);
  }

  private _navigatePrevious(): void {
    this._navigate(-1);
  }

  private _navigateNext(): void {
    this._navigate(1);
  }

  private _navigateToMonthView(viewIndex: number): void {
    this._setActiveDaysView(viewIndex);
    this.activeView = 'months';

    this[focusActiveDate]();
  }

  private _navigateToYearView(viewIndex: number): void {
    if (this._isDayView) {
      this._setActiveDaysView(viewIndex);
    }
    this.activeView = 'years';

    this[focusActiveDate]();
  }

  //#endregion

  //#region Internal API

  /** @private @hidden @internal */
  public async [focusActiveDate](options?: FocusOptions): Promise<void> {
    await this.updateComplete;

    switch (this.activeView) {
      case 'days':
        return this._daysViews
          .item(this._activeDaysViewIndex)
          .focusActiveDate(options);
      case 'months':
        return this._monthsView.focusActiveDate(options);
      case 'years':
        return this._yearsView.focusActiveDate(options);
    }
  }

  private _updateViewIndex(date: CalendarDay, delta: -1 | 1): void {
    if (this.visibleMonths === 1) {
      return;
    }

    const index = this._activeDaysViewIndex;
    const view = CalendarDay.from(this._daysViews.item(index).activeDate);

    if (date.month !== view.month) {
      this._activeDaysViewIndex = clamp(
        index + delta,
        0,
        this.visibleMonths - 1
      );
    }
  }

  private _getActiveDates(): CalendarDay[] {
    const current = this._activeDaysViewIndex;
    const length = Math.max(this.visibleMonths, 1);

    return Array.from({ length }, (_, i) =>
      this._activeDate.add('month', i - current)
    );
  }

  private _getNextEnabledDate(start: CalendarDay, delta: number): CalendarDay {
    const disabled = this._disabledDates;
    let beginning = start.clone();

    while (isDateInRanges(beginning, disabled)) {
      beginning = beginning.add('day', delta);
    }

    return beginning;
  }

  //#endregion

  protected _renderNavigationButtons() {
    const parts = {
      'navigation-button': true,
      vertical: this.orientation === 'vertical',
    };

    return html`
      <div part="navigation-buttons">
        <button
          part=${partMap(parts)}
          aria-label=${this._previousButtonLabel}
          @click=${this._navigatePrevious}
        >
          <igc-icon
            aria-hidden="true"
            name="arrow_prev"
            collection="default"
          ></igc-icon>
        </button>

        <button
          part=${partMap(parts)}
          aria-label=${this._nextButtonLabel}
          @click=${this._navigateNext}
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

  protected _renderMonthButtonNavigation(
    active: CalendarDay,
    viewIndex: number
  ): TemplateResult {
    const formatter = getDateFormatter();
    const label = formatter.formatDateTime(active.native, this.locale, {
      month: 'long',
    });
    const value = formatter.formatDateTime(active.native, this.locale, {
      month: this.formatOptions.month,
    });
    const ariaLabel = `${label}, ${this.resourceStrings.selectMonth}`;

    return html`
      <button
        part="months-navigation"
        aria-label=${ariaLabel}
        @click=${() => this._navigateToMonthView(viewIndex)}
      >
        ${value}
      </button>
    `;
  }

  protected _renderYearButtonNavigation(
    active: CalendarDay,
    viewIndex: number
  ): TemplateResult {
    const { format } = getDateFormatter().getIntlFormatter(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    const ariaLabel = `${active.year}, ${this.resourceStrings.selectYear}`;
    const ariaSkip = this._isDayView ? format(active.native) : active.year;

    return html`
      <span class="aria-off-screen" aria-live="polite">${ariaSkip}</span>
      <button
        part="years-navigation"
        aria-label=${ariaLabel}
        @click=${() => this._navigateToYearView(viewIndex)}
      >
        ${active.year}
      </button>
    `;
  }

  protected _renderYearRangeNavigation(active: CalendarDay): TemplateResult {
    const { start, end } = getYearRange(active, YEARS_PER_PAGE);

    return html`
      <span part="years-range" aria-live="polite"> ${start} - ${end} </span>
    `;
  }

  protected _renderNavigation(
    date?: CalendarDay,
    showButtons = true,
    viewIndex = 0
  ): TemplateResult {
    const activeDate = date ?? this._activeDate;

    return html`
      <div part="navigation">
        <div part="picker-dates">
          ${this._isDayView
            ? this._renderMonthButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${this._isDayView || this._isMonthView
            ? this._renderYearButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${this._isYearView
            ? this._renderYearRangeNavigation(activeDate)
            : nothing}
        </div>
        ${showButtons ? this._renderNavigationButtons() : nothing}
      </div>
    `;
  }

  protected _renderHeader() {
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
        <h2 part="header-date">${this._renderHeaderDate()}</h2>
      </div>
    `;
  }

  protected _renderHeaderDateSingle(): TemplateResult {
    const date = this.value ?? CalendarDay.today.native;
    const formatter = getDateFormatter();
    const weekday = formatter.formatDateTime(date, this.locale, {
      weekday: 'short',
    });
    const monthDay = formatter.formatDateTime(date, this.locale, {
      month: 'short',
      day: 'numeric',
    });
    const separator =
      this.headerOrientation === 'vertical' ? html`<br />` : ' ';

    const formatted = html`${weekday},${separator}${monthDay}`;

    return html`<slot name="header-date">${formatted}</slot>`;
  }

  protected _renderHeaderDateRange(): TemplateResult {
    const values = this.values;
    const { format } = getDateFormatter().getIntlFormatter(this.locale, {
      month: 'short',
      day: 'numeric',
    });
    const { startDate, endDate } = this.resourceStrings;

    const start = this._hasValues ? format(first(values)) : startDate;
    const end =
      this._hasValues && values.length > 1 ? format(last(values)) : endDate;

    return html`
      <slot name="header-date">
        <span>${start}</span>
        <span> - </span>
        <span>${end}</span>
      </slot>
    `;
  }

  protected _renderHeaderDate(): TemplateResult {
    return this._isSingle
      ? this._renderHeaderDateSingle()
      : this._renderHeaderDateRange();
  }

  protected _renderDaysView(): TemplateResult {
    const activeDates = this._getActiveDates();
    const horizontal = this.orientation === 'horizontal';
    const length = activeDates.length - 1;
    const format = this.formatOptions
      .weekday as Intl.DateTimeFormatOptions['weekday'];

    return html`${activeDates.map(
      (date, idx) => html`
        <div part="days-view-container">
          ${this._renderNavigation(
            date,
            horizontal ? idx === length : idx === 0,
            idx
          )}
          <igc-days-view
            @igcChange=${this._handleValueChange}
            @igcActiveDateChange=${this._handleActiveDateChange}
            @igcRangePreviewDateChange=${this._handleRangePreviewChange}
            part="days-view"
            exportparts="days-row, label, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, content-vertical, weekend, range, special, disabled, single, preview"
            .active=${this._activeDaysViewIndex === idx}
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

  protected _renderMonthView(): TemplateResult {
    const format = this.formatOptions
      .month as Intl.DateTimeFormatOptions['month'];

    return html`
      ${this._renderNavigation()}
      <igc-months-view
        part="months-view"
        exportparts="month, selected, month-inner, current"
        @igcChange=${this._handleMonthChange}
        .value=${this.activeDate}
        .locale=${this.locale}
        .monthFormat=${format!}
      ></igc-months-view>
    `;
  }

  protected _renderYearView(): TemplateResult {
    return html`
      ${this._renderNavigation()}
      <igc-years-view
        part="years-view"
        exportparts="year, selected, year-inner, current"
        @igcChange=${this._handleYearChange}
        .value=${this.activeDate}
        .yearsPerPage=${YEARS_PER_PAGE}
      ></igc-years-view>
    `;
  }

  protected override render() {
    const parts = {
      content: true,
      'content-vertical': this._isDayView && this.orientation === 'vertical',
    };

    return html`
      ${this._renderHeader()}
      <div ${ref(this._contentRef)} part=${partMap(parts)}>
        ${choose(this.activeView, [
          ['days', () => this._renderDaysView()],
          ['months', () => this._renderMonthView()],
          ['years', () => this._renderYearView()],
        ])}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-calendar': IgcCalendarComponent;
  }
}
