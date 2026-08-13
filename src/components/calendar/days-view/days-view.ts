import { getDateFormatter, getDisplayNamesFormatter } from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { addKeybindings } from '#internals/controllers/key-bindings.js';
import {
  CalendarDay,
  calendarRange,
  DAYS_IN_WEEK,
} from '#internals/date/model.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '#internals/decorators/blazorSuppressComponent.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { chunk, firstOf, lastOf } from '#internals/utils/arrays.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { addThemingController } from '#theming/theming-controller.js';
import { IgcCalendarBaseComponent } from '../base.js';
import {
  areSameMonth,
  generateMonth,
  getViewElement,
  isDateInRanges,
  isNextMonth,
  isPreviousMonth,
} from '../helpers.js';
import { all } from '../themes/days.js';
import { styles } from '../themes/days-view.base.css.js';
import type { IgcCalendarViewComponentEventMap } from '../types.js';

export interface IgcDaysViewEventMap extends IgcCalendarViewComponentEventMap {
  igcActiveDateChange: CustomEvent<Date>;
  igcRangePreviewDateChange: CustomEvent<Date>;
}

/** Inclusive timestamp bounds of a range of days. */
interface DayBounds {
  min: number;
  max: number;
}

/**
 * State derived once per render pass and shared by every day cell, so that the
 * per-cell work stays down to a handful of numeric comparisons.
 */
interface DayRenderContext {
  today: CalendarDay;
  /** Formats the accessible label of a cell. */
  formatter: Intl.DateTimeFormat;
  /** The dates selected in `multiple` selection. */
  selectedDates: Set<number>;
  /** The selected range in `range` selection. */
  selectedRange?: DayBounds;
  /** The dates rendered as part of the current range, including the previewed ones. */
  rangeDates?: DayBounds;
  /** The dates rendered as previewed. */
  previewDates?: DayBounds;
  /** The first date of the current range, accounting for the preview. */
  first?: number;
  /** The last date of the current range, accounting for the preview. */
  last?: number;
}

function boundsOf(first: CalendarDay, second: CalendarDay): DayBounds {
  const [a, b] = [first.timestamp, second.timestamp];
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

function isInBounds(day: CalendarDay, bounds?: DayBounds): boolean {
  return bounds
    ? day.timestamp >= bounds.min && day.timestamp <= bounds.max
    : false;
}

interface DayProperties {
  disabled: boolean;
  first: boolean;
  last: boolean;
  range: boolean;
  preview: boolean;
  current: boolean;
  inactive: boolean;
  hidden: boolean;
  weekend: boolean;
  single: boolean;
  selected: boolean;
  special: boolean;
}

/**
 * Instantiate a days view as a separate component in the calendar.
 *
 * @element igc-days-view
 *
 * @fires igcActiveDateChange - Emitted when the active date changes.
 * @fires igcRangePreviewDateChange - Emitted when the range preview date changes.
 *
 * @csspart days-row - The days row container.
 * @csspart label - The label container.
 * @csspart label-inner - The inner label container.
 * @csspart week-number - The week number container.
 * @csspart week-number-inner - The inner week number container.
 */
@blazorSuppressComponent
@blazorIndirectRender
export default class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<IgcCalendarBaseComponent>
>(IgcCalendarBaseComponent) {
  public static readonly tagName = 'igc-days-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDaysViewComponent);
  }

  //#region Internal properties and state

  @state()
  private _dates: CalendarDay[] = [];

  @query('[tabindex="0"]')
  private _activeDay?: HTMLElement;

  /** Returns the first date in the current range selection. */
  private get _rangeStart(): CalendarDay | undefined {
    return this._hasValues ? firstOf(this._values) : undefined;
  }

  /** Returns the last date in the current range selection. */
  private get _rangeEnd(): CalendarDay | undefined {
    return this._hasValues ? lastOf(this._values) : undefined;
  }

  private get _weekLabel(): string {
    return getDisplayNamesFormatter().getWeekLabel(this.locale, {
      style: 'short',
    });
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The active state of the component.
   *
   * @remarks
   * Only the active view holds the tab stop of its active date. The calendar sets this
   * so that a multi-month view exposes a single tab stop instead of one per month.
   *
   * @default true
   */
  @property({ type: Boolean })
  public active = true;

  /**
   * Whether to show leading days which do not belong to the current month.
   * @attr hide-leading-days
   */
  @property({ type: Boolean, attribute: 'hide-leading-days' })
  public hideLeadingDays = false;

  /**
   * Whether to show trailing days which do not belong to the current month.
   * @attr hide-trailing-days
   */
  @property({ type: Boolean, attribute: 'hide-trailing-days' })
  public hideTrailingDays = false;

  /** The range preview date. */
  @property({ attribute: false })
  public set rangePreviewDate(value: Date | undefined) {
    this._rangePreviewDate = value ? CalendarDay.from(value) : undefined;
  }

  public get rangePreviewDate(): Date | undefined {
    return this._rangePreviewDate?.native;
  }

  /**
   * The format of the days. Defaults to narrow.
   * @attr week-day-format
   */
  @property({ attribute: 'week-day-format' })
  public weekDayFormat: 'long' | 'short' | 'narrow' = 'narrow';

  //#endregion

  //#region Lifecycle hooks

  constructor() {
    super();

    addThemingController(this, all);
    addKeybindings(this).setActivateHandler(this._handleInteraction);
    addSafeEventListener(this, 'click', this._handleInteraction);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'grid';
  }

  /** @internal */
  protected override update(props: PropertyValues): void {
    // `_activeDate` covers both the public `activeDate` setter and the internal writes
    // done on interaction, which the public property key does not see.
    if (props.has('_activeDate') || props.has('weekStart')) {
      this._dates = Array.from(
        generateMonth(this._activeDate, this._firstDayOfWeek)
      );
    }

    super.update(props);
  }

  //#endregion

  //#region Event handlers

  protected _handleInteraction(event: Event): void {
    const value = getViewElement(event);

    if (value !== -1) {
      const date = CalendarDay.from(new Date(value));

      if (this._rangePreviewDate) {
        this._setRangePreviewDate();
      }

      if (this._selectDate(date)) {
        this.emitEvent('igcChange', { detail: date.native });
      }

      if (event.type === 'click') {
        this.emitEvent('igcActiveDateChange', { detail: date.native });
        this._activeDate = date;
      }
    }
  }

  //#endregion

  //#region Internal selection methods

  private _selectDate(value: CalendarDay): boolean {
    if (isDateInRanges(value, this._disabledDates)) {
      return false;
    }

    switch (this.selection) {
      case 'single':
        if (this._value?.equalTo(value)) {
          return false;
        }
        this._value = value;
        break;
      case 'multiple':
        this._selectMultiple(value);
        break;
      case 'range':
        this._selectRange(value);
        break;
    }

    return true;
  }

  private _selectMultiple(day: CalendarDay): void {
    const idx = this._values.findIndex((v) => v.equalTo(day));

    if (idx < 0) {
      this._values.push(day);
    } else {
      this._values.splice(idx, 1);
    }

    this._values = this._values.toSorted((a, b) => a.timestamp - b.timestamp);
  }

  private _selectRange(day: CalendarDay): void {
    // Start a new range selection
    if (this._values.length !== 1) {
      this._values = [day];
      return;
    }

    const rangeStart = this._rangeStart!;

    // Clicking the same date clears the selection
    if (rangeStart.equalTo(day)) {
      this._values = [];
      return;
    }

    // Build the complete range, ensuring correct order
    const [start, end] = rangeStart.greaterThan(day)
      ? [day, rangeStart]
      : [rangeStart, day];

    const range = Array.from(calendarRange({ start, end }));
    range.push(lastOf(range).add('day', 1));

    // Filter out disabled dates
    this._values = range.filter((v) => !isDateInRanges(v, this._disabledDates));
  }

  /**
   * @remarks
   * Disabled dates are never selected. The caller already knows whether the day is
   * disabled, so this does not check it again.
   */
  private _isSelected(day: CalendarDay, context: DayRenderContext): boolean {
    switch (this.selection) {
      case 'single':
        return Boolean(this._value?.equalTo(day));

      case 'multiple':
        return context.selectedDates.has(day.timestamp);

      case 'range':
        return isInBounds(day, context.selectedRange);
    }
  }

  //#endregion

  //#region Range helpers

  private _setRangePreviewDate(day?: CalendarDay): void {
    this._rangePreviewDate = day;
    this.emitEvent('igcRangePreviewDateChange', {
      detail: day ? day.native : undefined,
    });
  }

  private _changeRangePreview(day: CalendarDay): void {
    if (this._values.length === 1 && !firstOf(this._values).equalTo(day)) {
      this._setRangePreviewDate(day);
    }
  }

  private _clearRangePreview(): void {
    if (this._rangePreviewDate) {
      this._setRangePreviewDate();
    }
  }

  //#endregion

  //#region Internal methods

  /**
   * Resolves the selection state shared by all cells of the current render pass.
   *
   * @remarks
   * Everything here used to be recomputed for each of the 42 rendered cells, which for
   * `multiple` selection meant converting the whole selection to native dates per cell.
   */
  private _createRenderContext(): DayRenderContext {
    const context: DayRenderContext = {
      today: CalendarDay.today,
      formatter: getDateFormatter().getIntlFormatter(this.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      selectedDates: new Set(),
    };

    if (this._isMultiple) {
      for (const value of this._values) {
        context.selectedDates.add(value.timestamp);
      }
      return context;
    }

    if (!this._isRange || !this._hasValues) {
      return context;
    }

    const start = this._rangeStart!;
    const end = this._rangeEnd!;
    const preview = this._rangePreviewDate;

    context.selectedRange = boundsOf(start, end);

    // The endpoints of the range extend to the previewed date while it is outside of it
    context.first = (preview?.lessThan(start) ? preview : start).timestamp;
    context.last = (preview?.greaterThan(end) ? preview : end).timestamp;

    if (preview) {
      context.previewDates = boundsOf(start, preview);
    }

    // A single selected date renders as a range only while a second one is previewed
    const rangeEnd = this._values.length === 1 ? preview : end;

    if (rangeEnd) {
      context.rangeDates = boundsOf(start, rangeEnd);
    }

    return context;
  }

  private _intlFormatDay(day: CalendarDay, context: DayRenderContext): string {
    const { formatter, first, last } = context;

    // Range selection in progress
    if (this._rangePreviewDate?.equalTo(day)) {
      return formatter.formatRange(
        firstOf(this._values).native,
        this._rangePreviewDate.native
      );
    }

    // Range selection finished
    if (day.timestamp === first || day.timestamp === last) {
      return formatter.formatRange(
        firstOf(this._values).native,
        lastOf(this._values).native
      );
    }

    // Default
    return formatter.format(day.native);
  }

  private _getDayHandlers(day: CalendarDay) {
    if (!this._isRange) {
      return { changePreview: nothing, clearPreview: nothing };
    }

    return {
      changePreview: this._changeRangePreview.bind(this, day),
      clearPreview: this._clearRangePreview.bind(this),
    };
  }

  private _getDayProperties(
    day: CalendarDay,
    context: DayRenderContext
  ): DayProperties {
    const inactive = !areSameMonth(day, this._activeDate);
    const disabled = isDateInRanges(day, this._disabledDates);

    const hidden =
      (this.hideLeadingDays && isPreviousMonth(day, this._activeDate)) ||
      (this.hideTrailingDays && isNextMonth(day, this._activeDate));

    return {
      disabled: disabled || hidden,
      first: day.timestamp === context.first,
      last: day.timestamp === context.last,
      range: isInBounds(day, context.rangeDates),
      preview: isInBounds(day, context.previewDates),
      current: !inactive && day.equalTo(context.today),
      inactive,
      hidden,
      weekend: day.weekend,
      single: !this._isRange,
      selected: !disabled && this._isSelected(day, context),
      special: !inactive && isDateInRanges(day, this._specialDates),
    };
  }

  //#endregion

  //#region Public methods

  /** Focuses the active date. */
  public focusActiveDate(options?: FocusOptions): void {
    this._activeDay?.focus(options);
  }

  //#endregion

  protected _renderDayWithProps(
    day: CalendarDay,
    props: DayProperties,
    context: DayRenderContext
  ): TemplateResult {
    const ariaLabel = this._intlFormatDay(day, context);
    const { changePreview, clearPreview } = this._getDayHandlers(day);

    return html`
      <span part=${partMap({ date: true, ...props })}>
        <span
          role="gridcell"
          part=${partMap({ 'date-inner': true, ...props })}
          aria-label=${ariaLabel}
          aria-disabled=${props.disabled}
          aria-selected=${props.selected}
          data-value=${day.timestamp}
          tabindex=${this.active && day.equalTo(this._activeDate) ? 0 : -1}
          @focus=${changePreview}
          @blur=${clearPreview}
          @pointerenter=${changePreview}
          @pointerleave=${clearPreview}
        >
          ${day.date}
        </span>
      </span>
    `;
  }

  protected _renderHeaderWeekNumber() {
    return html`
      <span role="columnheader" part="label week-number first">
        <span part="week-number-inner first"> ${this._weekLabel} </span>
      </span>
    `;
  }

  protected _renderWeekNumber(start: CalendarDay, last: boolean) {
    return html`
      <span role="rowheader" part=${partMap({ 'week-number': true, last })}>
        <span part=${partMap({ 'week-number-inner': true, last })}>
          ${start.week}
        </span>
      </span>
    `;
  }

  protected _renderHeaders() {
    const label = getDateFormatter().getIntlFormatter(this.locale, {
      weekday: this.weekDayFormat,
    });
    const aria = getDateFormatter().getIntlFormatter(this.locale, {
      weekday: 'long',
    });

    const weekNumber = this.showWeekNumbers
      ? this._renderHeaderWeekNumber()
      : nothing;

    // The first week of the grid, so that the labels cannot disagree with it
    const headers = this._dates.slice(0, DAYS_IN_WEEK).map(
      (day) => html`
        <span
          role="columnheader"
          part="label"
          aria-label=${aria.format(day.native)}
        >
          <span part="label-inner">${label.format(day.native)}</span>
        </span>
      `
    );

    return html`
      <div role="row" part="days-row first">${weekNumber}${headers}</div>
    `;
  }

  protected *_renderWeeks(): Generator<TemplateResult> {
    const context = this._createRenderContext();
    const weeks = Array.from(chunk(this._dates, DAYS_IN_WEEK));
    const lastIndex = weeks.length - 1;

    for (const [idx, week] of weeks.entries()) {
      const isLast = idx === lastIndex;
      const properties = week.map((day) =>
        this._getDayProperties(day, context)
      );
      const hidden = properties.every((props) => props.hidden);

      yield html`
        <div role="row" part="days-row" aria-hidden=${hidden}>
          ${
            this.showWeekNumbers
              ? this._renderWeekNumber(week[0], isLast)
              : nothing
          }
          ${week.map((day, i) =>
            this._renderDayWithProps(day, properties[i], context)
          )}
        </div>
      `;
    }
  }

  protected override render() {
    return html`${this._renderHeaders()}${this._renderWeeks()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-days-view': IgcDaysViewComponent;
  }
}
