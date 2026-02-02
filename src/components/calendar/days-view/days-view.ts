import { getDateFormatter } from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { addThemingController } from '../../../theming/theming-controller.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { registerComponent } from '../../common/definitions/register.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partMap } from '../../common/part-map.js';
import {
  addSafeEventListener,
  chunk,
  first,
  last,
  take,
} from '../../common/util.js';
import { IgcCalendarBaseComponent } from '../base.js';
import {
  areSameMonth,
  calendarRange,
  generateMonth,
  getViewElement,
  isDateInRanges,
  isNextMonth,
  isPreviousMonth,
} from '../helpers.js';
import { CalendarDay, DAYS_IN_WEEK } from '../model.js';
import { all } from '../themes/days.js';
import { styles } from '../themes/days-view.base.css.js';
import { DateRangeType, type IgcCalendarComponentEventMap } from '../types.js';

export interface IgcDaysViewEventMap extends IgcCalendarComponentEventMap {
  igcActiveDateChange: CustomEvent<Date>;
  igcRangePreviewDateChange: CustomEvent<Date>;
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
    return this._hasValues ? first(this._values) : undefined;
  }

  /** Returns the last date in the current range selection. */
  private get _rangeEnd(): CalendarDay | undefined {
    return this._hasValues ? last(this._values) : undefined;
  }

  //#endregion

  //#region Public attributes and properties

  /** The active state of the component. */
  @property({ type: Boolean })
  public active = false;

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
  protected override update(props: PropertyValues<this>): void {
    if (props.has('activeDate') || props.has('weekStart')) {
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
    range.push(last(range).add('day', 1));

    // Filter out disabled dates
    this._values = range.filter((v) => !isDateInRanges(v, this._disabledDates));
  }

  private _isSelected(day: CalendarDay): boolean {
    if (isDateInRanges(day, this._disabledDates)) {
      return false;
    }

    switch (this.selection) {
      case 'single':
        return Boolean(this._value?.equalTo(day));

      case 'multiple':
        return (
          this._hasValues &&
          isDateInRanges(day, [
            { type: DateRangeType.Specific, dateRange: this.values },
          ])
        );

      case 'range':
        return (
          this._hasValues &&
          isDateInRanges(day, [
            {
              type: DateRangeType.Between,
              dateRange: [this._rangeStart!.native, this._rangeEnd!.native],
            },
          ])
        );
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
    if (this._values.length === 1 && !first(this._values).equalTo(day)) {
      this._setRangePreviewDate(day);
    }
  }

  private _clearRangePreview(): void {
    if (this._rangePreviewDate) {
      this._setRangePreviewDate();
    }
  }

  /** Gets the effective start of the visual range, accounting for preview. */
  private _getEffectiveRangeStart(): CalendarDay | undefined {
    if (!this._rangeStart) return undefined;

    return this._rangePreviewDate?.lessThan(this._rangeStart)
      ? this._rangePreviewDate
      : this._rangeStart;
  }

  /** Gets the effective end of the visual range, accounting for preview. */
  private _getEffectiveRangeEnd(): CalendarDay | undefined {
    if (!this._rangeEnd) return undefined;

    return this._rangePreviewDate?.greaterThan(this._rangeEnd)
      ? this._rangePreviewDate
      : this._rangeEnd;
  }

  private _isFirstInRange(day: CalendarDay): boolean {
    const effectiveStart = this._getEffectiveRangeStart();
    return this._isRange && Boolean(effectiveStart?.equalTo(day));
  }

  private _isLastInRange(day: CalendarDay): boolean {
    const effectiveEnd = this._getEffectiveRangeEnd();
    return this._isRange && Boolean(effectiveEnd?.equalTo(day));
  }

  private _isRangeDate(day: CalendarDay): boolean {
    if (!this._hasValues) return false;

    const isSingleSelection = this._values.length === 1;
    if (isSingleSelection && !this._rangePreviewDate) return false;

    const max = isSingleSelection ? this._rangePreviewDate! : this._rangeEnd!;

    return isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [this._rangeStart!.native, max.native],
      },
    ]);
  }

  private _isRangePreview(day: CalendarDay): boolean {
    if (!this._hasValues || !this._rangePreviewDate) return false;

    return isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [this._rangeStart!.native, this._rangePreviewDate.native],
      },
    ]);
  }

  //#endregion

  //#region Internal methods

  private _intlFormatDay(day: CalendarDay): string {
    const fmt = getDateFormatter().getIntlFormatter(this.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Range selection in progress
    if (this._rangePreviewDate?.equalTo(day)) {
      return fmt.formatRange(
        first(this._values).native,
        this._rangePreviewDate.native
      );
    }

    // Range selection finished
    if (this._isFirstInRange(day) || this._isLastInRange(day)) {
      return fmt.formatRange(
        first(this._values).native,
        last(this._values).native
      );
    }

    // Default
    return fmt.format(day.native);
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
    today: CalendarDay
  ): DayProperties {
    const inactive = !areSameMonth(day, this._activeDate);
    const disabled = isDateInRanges(day, this._disabledDates);

    const hidden =
      (this.hideLeadingDays && isPreviousMonth(day, this._activeDate)) ||
      (this.hideTrailingDays && isNextMonth(day, this._activeDate));

    return {
      disabled: disabled || hidden,
      first: this._isFirstInRange(day),
      last: this._isLastInRange(day),
      range: this._isRange && this._isRangeDate(day),
      preview: this._isRange && this._isRangePreview(day),
      current: !inactive && day.equalTo(today),
      inactive,
      hidden,
      weekend: day.weekend,
      single: !this._isRange,
      selected: !disabled && this._isSelected(day),
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
    props: DayProperties
  ): TemplateResult {
    const ariaLabel = this._intlFormatDay(day);
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
          tabindex=${day.equalTo(this._activeDate) ? 0 : -1}
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
        <span part="week-number-inner first">
          ${this.resourceStrings.weekLabel}
        </span>
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
    const days = take(
      generateMonth(this._activeDate, this._firstDayOfWeek),
      DAYS_IN_WEEK
    );

    const weekNumber = this.showWeekNumbers
      ? this._renderHeaderWeekNumber()
      : nothing;

    const headers = days.map(
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
    const today = CalendarDay.today;
    const weeks = Array.from(chunk(this._dates, DAYS_IN_WEEK));
    const lastIndex = weeks.length - 1;

    // Pre-compute day properties for all dates to avoid redundant calculations
    const dayPropertiesMap = new Map<number, DayProperties>();

    for (const day of this._dates) {
      dayPropertiesMap.set(day.timestamp, this._getDayProperties(day, today));
    }

    for (const [idx, week] of weeks.entries()) {
      const isLast = idx === lastIndex;

      const hidden = week.every(
        (day) => dayPropertiesMap.get(day.timestamp)?.hidden
      );

      yield html`
        <div role="row" part="days-row" aria-hidden=${hidden}>
          ${this.showWeekNumbers
            ? this._renderWeekNumber(week[0], isLast)
            : nothing}
          ${week.map((day) =>
            this._renderDayWithProps(day, dayPropertiesMap.get(day.timestamp)!)
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
