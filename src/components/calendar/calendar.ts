import { getDateFormatter } from 'igniteui-i18n-core';
import { html, nothing, type TemplateResult } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { createRef, ref } from 'lit/directives/ref.js';
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
} from '#internals/controllers/key-bindings.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { clamp } from '#internals/utils/math.js';
import { formatString } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
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
import IgcMonthsViewComponent from './months-view/months-view.js';
import { selectDate } from './selection.js';
import { styles } from './themes/calendar.base.css.js';
import { all } from './themes/calendar.js';
import type {
  CalendarActiveView,
  CalendarHeaderOrientation,
  IgcCalendarComponentEventMap,
} from './types.js';
import IgcYearsViewComponent from './years-view/years-view.js';

export const focusActiveDate = Symbol();

/** How many consecutive disabled days keyboard navigation will skip over before giving up. */
const MAX_DISABLED_DATE_SKIP = 1000;

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
 * @csspart months-row - Months row element of the calendar.
 * @csspart years-row - Years row element of the calendar.
 * @csspart label - Week header label element of the calendar.
 * @csspart label-inner - Week header label inner element of the calendar.
 * @csspart week-number - Week number element of the calendar.
 * @csspart week-number-inner - Week number inner element of the calendar.
 * @csspart date - Date element of the calendar.
 * @csspart date-inner - Date inner element of the calendar.
 * @csspart first - The first selected date element of the calendar in range selection.
 * Also applies to the week numbers header cell.
 * @csspart last - The last selected date element of the calendar in range selection.
 * Also applies to the week number of the last rendered week.
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

  /** The accessible name of a navigation button, based on what it pages through. */
  private _getNavigationLabel(direction: 'previous' | 'next'): string {
    const isPrevious = direction === 'previous';
    const strings = this.resourceStrings;

    switch (this.activeView) {
      case 'days':
        return (
          isPrevious
            ? strings.calendar_previous_month
            : strings.calendar_next_month
        )!;
      case 'months':
        return (
          isPrevious
            ? strings.calendar_previous_year
            : strings.calendar_next_year
        )!;
      case 'years':
        return formatString(
          (isPrevious
            ? strings.calendar_previous_years
            : strings.calendar_next_years)!,
          YEARS_PER_PAGE
        );
    }
  }

  /** The unit and the amount a single navigation step covers in the current view. */
  private _getPageStep(delta: -1 | 1): {
    unit: 'month' | 'year';
    increment: number;
  } {
    return {
      unit: this._isDayView ? 'month' : 'year',
      increment: (this._isYearView ? YEARS_PER_PAGE : 1) * delta,
    };
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
   * Whether to hide the dates that do not belong to the current active month.
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
      bindingDefaults: { repeat: true },
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
    return !getElementFromPath(
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
    const { unit, increment } = this._getPageStep(delta);

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
    this._activateEdgeOfView('start');
  }

  private _handleEndKey(): void {
    this._activateEdgeOfView('end');
  }

  /**
   * Moves the active date to the first or the last date of the current view, skipping
   * over the disabled dates towards the middle of it.
   */
  private _activateEdgeOfView(edge: 'start' | 'end'): void {
    const isStart = edge === 'start';
    const delta = isStart ? 1 : -1;
    let target: CalendarDay;

    switch (this.activeView) {
      case 'days': {
        const months = this._getActiveDates();
        const index = isStart ? 0 : months.length - 1;
        const month = months[index];

        target = isStart
          ? month.set({ date: 1 })
          : month.set({ month: month.month + 1, date: 0 });
        this._activeDaysViewIndex = index;
        break;
      }
      case 'months':
        target = this._activeDate.set({ month: isStart ? 0 : 11 });
        break;
      case 'years': {
        const { start, end } = getYearRange(this._activeDate, YEARS_PER_PAGE);
        target = this._activeDate.set({ year: isStart ? start : end });
        break;
      }
    }

    this._activeDate = this._getNextEnabledDate(target, delta);
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

    const selection = selectDate(
      { value: this._value, values: this._values },
      CalendarDay.from(event.detail),
      { selection: this.selection, disabledDates: this._disabledDates }
    );

    if (!selection) {
      return;
    }

    this._value = selection.value;
    this._values = selection.values;

    this.emitEvent('igcChange', {
      detail: this._isSingle ? (this.value as Date) : this.values,
    });
  }

  private _handleActiveDateChange(event: CustomEvent<Date>): void {
    const view = event.target as IgcDaysViewComponent;
    const index = Array.from(this._daysViews).indexOf(view);

    if (index < 0) {
      return;
    }

    // Resolved before the state below is updated, since the dates of the views are
    // derived from it
    const renderedMonth = this._getActiveDates()[index];

    this._activeDaysViewIndex = index;
    this.activeDate = event.detail;

    // The cell holding the tab stop is about to be replaced, so the focus has to follow
    if (!areSameMonth(this._activeDate, renderedMonth)) {
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

  /** Makes the month rendered by the view at `viewIndex` the active one. */
  private _setActiveDaysView(viewIndex: number): void {
    this.activeDate = this._getActiveDates()[viewIndex].native;
    this._activeDaysViewIndex = viewIndex;
  }

  private _navigate(delta: 1 | -1): void {
    const { unit, increment } = this._getPageStep(delta);
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

  /** @hidden @internal */
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

  /**
   * Returns the first enabled date starting from `start` and moving day by day in the
   * direction of `delta`.
   *
   * @remarks
   * The search is bounded, since the disabled dates can describe an open-ended range
   * which no date in the given direction satisfies. The current active date is returned
   * when nothing is reachable.
   */
  private _getNextEnabledDate(start: CalendarDay, delta: number): CalendarDay {
    const disabled = this._disabledDates;
    const step = Math.sign(delta) || 1;
    let current = start;

    for (let i = 0; i <= MAX_DISABLED_DATE_SKIP; i++) {
      if (!isDateInRanges(current, disabled)) {
        return current;
      }
      current = current.add('day', step);
    }

    return this._activeDate;
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
          aria-label=${this._getNavigationLabel('previous')}
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
          aria-label=${this._getNavigationLabel('next')}
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
    const ariaLabel = `${label}, ${this.resourceStrings.calendar_select_month}`;

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
    const ariaLabel = `${active.year}, ${this.resourceStrings.calendar_select_year}`;

    return html`
      <button
        part="years-navigation"
        aria-label=${ariaLabel}
        @click=${() => this._navigateToYearView(viewIndex)}
      >
        ${active.year}
      </button>
    `;
  }

  /**
   * Renders the off screen live region announcing the period the calendar navigated to.
   *
   * @remarks
   * A single region for the whole calendar - one per rendered month would announce the
   * same navigation several times over. The years view has its visible years range as a
   * live region of its own.
   */
  protected _renderActivePeriod() {
    if (this._isYearView) {
      return nothing;
    }

    const { format } = getDateFormatter().getIntlFormatter(this.locale, {
      month: 'long',
      year: 'numeric',
    });

    return html`
      <span class="aria-off-screen" aria-live="polite">
        ${this._isDayView ? format(this._activeDate.native) : this._activeDate.year}
      </span>
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
          ${
            this._isDayView
              ? this._renderMonthButtonNavigation(activeDate, viewIndex)
              : nothing
          }
          ${
            this._isDayView || this._isMonthView
              ? this._renderYearButtonNavigation(activeDate, viewIndex)
              : nothing
          }
          ${
            this._isYearView
              ? this._renderYearRangeNavigation(activeDate)
              : nothing
          }
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
      ? this.resourceStrings.calendar_select_date
      : this.resourceStrings.calendar_range_placeholder;

    // A label and the value it describes, not a section of the document, so no headings -
    // a component cannot know which level would fit the page it is placed in. The
    // typography of both parts is set by the themes.
    return html`
      <div part="header">
        <div part="header-title">
          <slot name="title">${title}</slot>
        </div>
        <div part="header-date">${this._renderHeaderDate()}</div>
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
    const { calendar_range_label_start, calendar_range_label_end } =
      this.resourceStrings;

    const start = this._hasValues
      ? format(firstOf(values))
      : calendar_range_label_start;
    const end =
      this._hasValues && values.length > 1
        ? format(lastOf(values))
        : calendar_range_label_end;

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
            exportparts="days-row, label, label-inner, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, content-vertical, weekend, range, special, disabled, single, preview"
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
        exportparts="months-row, month, selected, month-inner, current"
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
        exportparts="years-row, year, selected, year-inner, current"
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
      ${this._renderHeader()} ${this._renderActivePeriod()}
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
