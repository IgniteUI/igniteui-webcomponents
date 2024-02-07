import { html, nothing } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';

import {
  BaseCalendarModel,
  IgcCalendarBaseEventMap,
  MONTHS_PER_ROW,
  YEARS_PER_ROW,
} from './common/calendar-base.js';
import { CalendarDay, areSameMonth, first, last } from './common/day.js';
import { createDateTimeFormatters } from './common/intl-formatters.js';
import IgcDaysViewComponent from './days-view/days-view.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import { styles } from './themes/calendar.base.css.js';
import { all } from './themes/calendar.js';
import { styles as shared } from './themes/shared/material/calendar.common.css.js';
import IgcYearsViewComponent from './years-view/years-view.js';
import { themeSymbol, themes } from '../../theming/theming-decorator.js';
import type { Theme } from '../../theming/types.js';
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
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import {
  format,
  getElementsFromEventPath,
  partNameMap,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';

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
export default class IgcCalendarComponent extends SizableMixin(
  EventEmitterMixin<IgcCalendarBaseEventMap, Constructor<BaseCalendarModel>>(
    BaseCalendarModel
  )
) {
  public static readonly tagName = 'igc-calendar';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      this,
      IgcIconComponent,
      IgcDaysViewComponent,
      IgcMonthsViewComponent,
      IgcYearsViewComponent
    );
  }

  private declare readonly [themeSymbol]: Theme;

  private get yearRangeStart() {
    return (
      Math.floor(this._activeDate.year / this.yearPerPage) * this.yearPerPage
    );
  }

  private get yearPerPage() {
    return this.size === 'small' ? 18 : 15;
  }

  private get previousButtonLabel() {
    switch (this.activeView) {
      case 'days':
        return this.resourceStrings.previousMonth;
      case 'months':
        return this.resourceStrings.previousYear;
      case 'years':
        return format(
          this.resourceStrings.previousYears,
          `${this.yearPerPage}`
        );
      default:
        return '';
    }
  }

  private get nextButtonLabel() {
    switch (this.activeView) {
      case 'days':
        return this.resourceStrings.nextMonth;
      case 'months':
        return this.resourceStrings.nextYear;
      case 'years':
        return format(this.resourceStrings.nextYears, `${this.yearPerPage}`);
      default:
        return '';
    }
  }

  private contentRef: Ref<HTMLDivElement> = createRef();

  // TODO: Move to base class
  @state()
  private rangePreviewDate?: CalendarDay;

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
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  /**
   * The orientation of the calendar months when more than one month
   * is being shown.
   * @attr orientation
   */
  @property()
  public orientation: 'vertical' | 'horizontal' = 'horizontal';

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
  public activeView: 'days' | 'months' | 'years' = 'days';

  /**
   * The
   */
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

  private async focusActiveDate() {
    await this.updateComplete;

    switch (this.activeView) {
      case 'days':
        return this.daysViews.item(this.activeDaysViewIndex).focusActiveDate();
      case 'months':
        return this.monthsView.focusActiveDate();
      case 'years':
        return this.yearsView.focusActiveDate();
    }
  }

  private updateViewIndex(date: CalendarDay, newIndex: number) {
    if (this.visibleMonths === 1) return;

    const index = this.activeDaysViewIndex;
    const other = CalendarDay.from(this.daysViews.item(index).activeDate);

    if (date.month !== other.month) {
      this.activeDaysViewIndex = newIndex;
    }
  }

  private onArrowLeft() {
    const index = this.activeDaysViewIndex;

    switch (this.activeView) {
      case 'days':
        {
          const date = this._activeDate.add('day', -1);

          this.updateViewIndex(date, Math.max(index - 1, 0));
          this._activeDate = date;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.add('month', -1);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', -1);
        break;
    }

    this.focusActiveDate();
  }

  private onArrowRight() {
    const index = this.activeDaysViewIndex;

    switch (this.activeView) {
      case 'days':
        {
          const date = this._activeDate.add('day', 1);

          this.updateViewIndex(
            date,
            index === this.visibleMonths - 1 ? index : index + 1
          );
          this._activeDate = date;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.add('month', 1);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', 1);
        break;
    }

    this.focusActiveDate();
  }

  private onArrowUp() {
    const index = this.activeDaysViewIndex;

    switch (this.activeView) {
      case 'days':
        {
          const date = this._activeDate.add('week', -1);

          this.updateViewIndex(date, Math.max(index - 1, 0));
          this._activeDate = date;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.add('month', -MONTHS_PER_ROW);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', -YEARS_PER_ROW);
        break;
    }

    this.focusActiveDate();
  }

  private onArrowDown() {
    const index = this.activeDaysViewIndex;

    switch (this.activeView) {
      case 'days':
        {
          const date = this._activeDate.add('week', 1);

          this.updateViewIndex(
            date,
            index === this.visibleMonths - 1 ? index : index + 1
          );
          this._activeDate = date;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.add('month', MONTHS_PER_ROW);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', YEARS_PER_ROW);
        break;
    }

    this.focusActiveDate();
  }

  private onShiftPageDown() {
    if (this.activeView === 'days') {
      this._activeDate = this._activeDate.add('year', 1);
      this.focusActiveDate();
    }
  }

  private onShiftPageUp() {
    if (this.activeView === 'days') {
      this._activeDate = this._activeDate.add('year', -1);
      this.focusActiveDate();
    }
  }

  private onHomeKey() {
    switch (this.activeView) {
      case 'days':
        {
          const first = CalendarDay.from(this.daysViews.item(0).activeDate);
          this._activeDate = first.replace({ date: 1 });
          this.activeDaysViewIndex = 0;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.replace({ month: 0 });
        break;
      case 'years':
        this._activeDate = this._activeDate.replace({
          year: this.yearRangeStart,
          date: 1,
        });
        break;
    }

    this.focusActiveDate();
  }

  private onEndKey() {
    const index = this.daysViews.length - 1;

    switch (this.activeView) {
      case 'days':
        {
          const last = CalendarDay.from(this.daysViews.item(index).activeDate);
          this._activeDate = last.replace({ month: last.month + 1, date: 0 });
          this.activeDaysViewIndex = index;
        }
        break;
      case 'months':
        this._activeDate = this._activeDate.replace({ month: 11 });
        break;
      case 'years':
        this._activeDate = this._activeDate.replace({
          year: this.yearRangeStart + this.yearPerPage - 1,
          date: 1,
        });
        break;
    }

    this.focusActiveDate();
  }

  private isNotFromView(_: Element, event: KeyboardEvent) {
    return !getElementsFromEventPath(event).some((element) =>
      element.matches(
        `${IgcDaysViewComponent.tagName}, ${IgcMonthsViewComponent.tagName}, ${IgcYearsViewComponent.tagName}`
      )
    );
  }

  constructor() {
    super();

    addKeybindings(this, {
      skip: this.isNotFromView,
      ref: this.contentRef,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set(arrowLeft, this.onArrowLeft)
      .set(arrowRight, this.onArrowRight)
      .set(arrowUp, this.onArrowUp)
      .set(arrowDown, this.onArrowDown)
      .set(pageUpKey, this.navigatePrevious)
      .set(pageDownKey, this.navigateNext)
      .set([shiftKey, pageUpKey], this.onShiftPageUp)
      .set([shiftKey, pageDownKey], this.onShiftPageDown)
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey);
  }

  protected renderNavigationButtons() {
    const isFluent = this[themeSymbol] === 'fluent';
    const prevIcon = isFluent ? 'arrow_upward' : 'navigate_before';
    const nextIcon = isFluent ? 'arrow_downward' : 'navigate_next';
    const parts = partNameMap({
      'navigation-button': true,
      vertical: this.orientation === 'vertical',
    });

    return html`
      <div part="navigation-buttons">
        <button
          part=${parts}
          aria-label=${this.previousButtonLabel}
          @click=${this.navigatePrevious}
        >
          <igc-icon
            aria-hidden="true"
            name=${prevIcon}
            collection="internal"
          ></igc-icon>
        </button>

        <button
          part=${parts}
          aria-label=${this.nextButtonLabel}
          @click=${this.navigateNext}
        >
          <igc-icon
            aria-hidden="true"
            name=${nextIcon}
            collection="internal"
          ></igc-icon>
        </button>
      </div>
    `;
  }

  protected renderMonthButtonNavigation(
    active: CalendarDay,
    viewIndex: number
  ) {
    const labelFmt = this._intl.getFormatter('monthLabel').format;
    const valueFmt = this._intl.getFormatter('month').format;
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
    const isDay = this.activeView === 'days';
    const fmt = this._intl.getFormatter('yearLabel').format;
    const ariaLabel = `${active.year}, ${this.resourceStrings.selectYear}`;
    const ariaSkip = isDay ? fmt(active.native) : active.year;

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
    const start = Math.floor(active.year / this.yearPerPage) * this.yearPerPage;
    const end = start + this.yearPerPage - 1;

    return html`<span part="years-range" aria-live="polite">
      ${start} - ${end}
    </span>`;
  }

  protected renderNavigation(
    date?: CalendarDay,
    showButtons = true,
    viewIndex = 0
  ) {
    const activeDate = date ?? this._activeDate;
    const isDay = this.activeView === 'days';
    const isMonth = this.activeView === 'months';
    const isYear = this.activeView === 'years';

    return html`
      <div part="navigation">
        <div>
          ${isDay
            ? this.renderMonthButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${isDay || isMonth
            ? this.renderYearButtonNavigation(activeDate, viewIndex)
            : nothing}
          ${isYear ? this.renderYearRangeNavigation(activeDate) : nothing}
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
    const date = this.value;
    const weekday = this._intl.getFormatter('weekday');
    const monthDay = this._intl.getFormatter('monthDay');
    const separator =
      this.headerOrientation === 'vertical' ? html`<br />` : ' ';

    return date
      ? html`${weekday.format(date)},${separator}${monthDay.format(date)}`
      : this.resourceStrings.selectedDate;
  }

  protected renderHeaderDateRange() {
    const values = this.values;
    const fmt = this._intl.getFormatter('monthDay');
    const { startDate, endDate } = this.resourceStrings;

    const start = this._hasValues ? fmt.format(first(values)) : startDate;
    const end =
      this._hasValues && values.length > 1 ? fmt.format(last(values)) : endDate;

    return html`
      <span>${start}</span>
      <span> - </span>
      <span>${end}</span>
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
            exportparts="days-row, label, date-inner, week-number-inner, week-number, date, first, last, selected, inactive, hidden, current, weekend, range, special, disabled, single, preview"
            .active=${this.activeDaysViewIndex === idx}
            .activeDate=${date.native}
            .disabledDates=${this.disabledDates}
            .hideLeadingDays=${this.hideOutsideDays || idx !== 0}
            .hideTrailingDays=${this.hideHeader || idx !== length}
            .locale=${this.locale}
            .rangePreviewDate=${this.rangePreviewDate?.native}
            .resourceStrings=${this.resourceStrings}
            .selection=${this.selection}
            .showWeekNumbers=${this.showWeekNumbers}
            .specialDates=${this.specialDates}
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

    return html`${this.renderNavigation()}
      <igc-months-view
        part="months-view"
        exportparts="month, selected, month-inner, current"
        @igcChange=${this.changeMonth}
        .value=${this.activeDate}
        .locale=${this.locale}
        .monthFormat=${format!}
      ></igc-months-view>`;
  }

  protected renderYearView() {
    return html`
      ${this.renderNavigation()}
      <igc-years-view
        part="years-view"
        exportparts="year, selected, year-inner, current"
        @igcChange=${this.changeYear}
        .value=${this.activeDate}
        .yearsPerPage=${this.yearPerPage}
      ></igc-years-view>
    `;
  }

  protected override render() {
    const direction =
      this.activeView === 'days' && this.orientation === 'horizontal';

    const styles = {
      display: 'flex',
      flexGrow: 1,
      flexDirection: direction ? 'row' : 'column',
    };

    return html`
      ${this.renderHeader()}
      <div ${ref(this.contentRef)} part="content" style=${styleMap(styles)}>
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

    this.focusActiveDate();
  }

  protected changeYear(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.activeDate = event.detail;
    this.activeView = 'months';

    this.focusActiveDate();
  }

  protected changeValue(event: CustomEvent<Date>) {
    event.stopPropagation();

    const view = event.target as IgcDaysViewComponent;
    this._isSingle ? (this.value = view.value) : (this.values = view.values);

    this.emitEvent('igcChange', {
      detail: this._isSingle ? this.value : this.values,
    });
  }

  protected activeDateChanged(event: CustomEvent<Date>) {
    const view = event.target as IgcDaysViewComponent;
    const views = Array.from(this.daysViews);

    this.activeDaysViewIndex = views.indexOf(view);
    this.activeDate = event.detail;

    if (!areSameMonth(this.activeDate, view.activeDate)) {
      this.focusActiveDate();
    }
  }

  protected rangePreviewDateChanged(event: CustomEvent<Date>) {
    this.rangePreviewDate = event.detail
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

  // XXX: Navigation

  private navigatePrevious() {
    switch (this.activeView) {
      case 'days':
        this._activeDate = this._activeDate.add('month', -1);
        break;
      case 'months':
        this._activeDate = this._activeDate.add('year', -1);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', -this.yearPerPage);
    }
  }

  private navigateNext() {
    switch (this.activeView) {
      case 'days':
        this._activeDate = this._activeDate.add('month', 1);
        break;
      case 'months':
        this._activeDate = this._activeDate.add('year', 1);
        break;
      case 'years':
        this._activeDate = this._activeDate.add('year', this.yearPerPage);
    }
  }

  private switchToMonths(viewIndex: number) {
    this.activateDaysView(viewIndex);
    this.activeView = 'months';

    this.focusActiveDate();
  }

  private switchToYears(viewIndex: number) {
    if (this.activeView === 'days') {
      this.activateDaysView(viewIndex);
    }
    this.activeView = 'years';

    this.focusActiveDate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-calendar': IgcCalendarComponent;
  }
}
