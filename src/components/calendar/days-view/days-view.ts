import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { addThemingController } from '../../../theming/theming-controller.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import { IgcCalendarResourceStringEN } from '../../common/i18n/calendar.resources.js';
import { createDateTimeFormatters } from '../../common/localization/intl-formatters.js';
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
import { CalendarDay, daysInWeek } from '../model.js';
import { all } from '../themes/days.js';
import { styles } from '../themes/days-view.base.css.js';
import { DateRangeType, type IgcCalendarComponentEventMap } from '../types.js';

export interface IgcDaysViewEventMap extends IgcCalendarComponentEventMap {
  igcActiveDateChange: CustomEvent<Date>;
  igcRangePreviewDateChange: CustomEvent<Date>;
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
  public static register() {
    registerComponent(IgcDaysViewComponent);
  }

  @state()
  private dates!: CalendarDay[];

  @query('[tabindex="0"]')
  private activeDay!: HTMLElement;

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
  public set rangePreviewDate(value) {
    this._rangePreviewDate = value ? CalendarDay.from(value) : undefined;
  }

  public get rangePreviewDate() {
    return this._rangePreviewDate?.native;
  }

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings = IgcCalendarResourceStringEN;

  /**
   * The format of the days. Defaults to narrow.
   * @attr week-day-format
   */
  @property({ attribute: 'week-day-format' })
  public weekDayFormat: 'long' | 'short' | 'narrow' = 'narrow';

  private _intl = createDateTimeFormatters(this.locale, {
    weekday: { weekday: this.weekDayFormat },
    label: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    ariaWeekday: { weekday: 'long' },
  });

  @watch('locale')
  protected localeChange() {
    this._intl.locale = this.locale;
  }

  @watch('weekDayFormat')
  protected weekDayFormatChange() {
    this._intl.update({ weekday: { weekday: this.weekDayFormat } });
  }

  @watch('weekStart')
  @watch('activeDate')
  protected datesChange() {
    this.dates = Array.from(
      generateMonth(this._activeDate, this._firstDayOfWeek)
    );
  }

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleInteraction);

    addSafeEventListener(this, 'click', this.handleInteraction);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  /** Focuses the active date. */
  public focusActiveDate(options?: FocusOptions) {
    this.activeDay.focus(options);
  }

  protected handleInteraction(event: Event) {
    const value = getViewElement(event);

    if (value !== -1) {
      const date = CalendarDay.from(new Date(value));

      if (this._rangePreviewDate) {
        this.setRangePreviewDate();
      }

      if (this.selectDate(date)) {
        this.emitEvent('igcChange', { detail: date.native });
      }

      if (event.type === 'click') {
        // XXX: Why ?
        event.stopPropagation();
        this.emitEvent('igcActiveDateChange', { detail: date.native });
        this._activeDate = date;
      }
    }
  }

  private _selectMultiple(day: CalendarDay) {
    const values = this._values;
    const idx = values.findIndex((v) => v.equalTo(day));

    idx < 0 ? values.push(day) : values.splice(idx, 1);
    values.sort((a, b) => a.timestamp - b.timestamp);
    this._values = Array.from(values);
  }

  private _selectRange(day: CalendarDay) {
    let values = this._values;

    if (values.length !== 1) {
      values = [day];
    } else {
      const beginning = first(values);

      if (beginning.equalTo(day)) {
        this._values = [];
        return;
      }

      values = beginning.greaterThan(day)
        ? Array.from(calendarRange({ start: day, end: beginning }))
        : Array.from(calendarRange({ start: beginning, end: day }));

      values.push(last(values).add('day', 1));
    }

    this._values = values.filter(
      (v) => !isDateInRanges(v, this._disabledDates)
    );
  }

  private selectDate(value: CalendarDay) {
    if (isDateInRanges(value, this._disabledDates)) {
      return false;
    }

    if (this._isSingle) {
      if (this._value?.equalTo(value)) {
        return false;
      }
      this._value = value;
    }

    if (this._isMultiple) {
      this._selectMultiple(value);
    }

    if (this._isRange) {
      this._selectRange(value);
    }

    return true;
  }

  private isSelected(day: CalendarDay) {
    if (isDateInRanges(day, this._disabledDates)) {
      return false;
    }

    if (this._isSingle) {
      return !!this._value && this._value.equalTo(day);
    }

    if (!this._hasValues) {
      return false;
    }

    if (this._isMultiple) {
      return isDateInRanges(day, [
        {
          type: DateRangeType.Specific,
          dateRange: this.values,
        },
      ]);
    }
    return isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [first(this._values).native, last(this._values).native],
      },
    ]);
  }

  // XXX: Range interaction
  private setRangePreviewDate(day?: CalendarDay) {
    this._rangePreviewDate = day;
    this.emitEvent('igcRangePreviewDateChange', {
      detail: day ? day.native : undefined,
    });
  }

  private changeRangePreview(day: CalendarDay) {
    if (this._values.length === 1 && !first(this._values).equalTo(day)) {
      this.setRangePreviewDate(day);
    }
  }

  private clearRangePreview() {
    if (this._rangePreviewDate) {
      this.setRangePreviewDate();
    }
  }

  // XXX: Ranges

  private isFirstInRange(day: CalendarDay) {
    if (this._isSingle || !this._hasValues) {
      return false;
    }

    const target = this._rangePreviewDate?.lessThan(first(this._values))
      ? this._rangePreviewDate
      : first(this._values);

    return target.equalTo(day);
  }

  private isLastInRange(day: CalendarDay) {
    if (this._isSingle || !this._hasValues) {
      return false;
    }

    const target = this._rangePreviewDate?.greaterThan(last(this._values))
      ? this._rangePreviewDate
      : last(this._values);

    return target.equalTo(day);
  }

  private isRangeDate(day: CalendarDay) {
    const isSingleRange = this._values.length === 1;

    if (!this._hasValues || (isSingleRange && !this._rangePreviewDate)) {
      return false;
    }

    const min = first(this._values);
    const max = isSingleRange ? this._rangePreviewDate! : last(this._values);

    return isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [min.native, max.native],
      },
    ]);
  }

  private isRangePreview(day: CalendarDay) {
    if (!(this._hasValues && this._rangePreviewDate)) {
      return false;
    }

    return isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [first(this._values).native, this._rangePreviewDate.native],
      },
    ]);
  }

  private intlFormatDay(day: CalendarDay) {
    const fmt = this._intl.get('label');

    // Range selection in progress
    if (this._rangePreviewDate?.equalTo(day)) {
      return fmt.formatRange(
        first(this._values).native,
        this._rangePreviewDate.native
      );
    }

    // Range selection finished
    if (this.isFirstInRange(day) || this.isLastInRange(day)) {
      return fmt.formatRange(
        first(this._values).native,
        last(this._values).native
      );
    }

    // Default
    return fmt.format(day.native);
  }

  private getDayHandlers(day: CalendarDay) {
    const range = this._isRange;
    const changePreview = range
      ? this.changeRangePreview.bind(this, day)
      : nothing;
    const clearPreview = range ? this.clearRangePreview : nothing;

    return { changePreview, clearPreview };
  }

  private getDayProperties(day: CalendarDay, today: CalendarDay) {
    const isRange = this._isRange;
    const disabled = isDateInRanges(day, this._disabledDates);

    const hiddenLeading =
      this.hideLeadingDays && isPreviousMonth(day, this._activeDate);
    const hiddenTrailing =
      this.hideTrailingDays && isNextMonth(day, this._activeDate);

    const hidden = hiddenLeading || hiddenTrailing;
    const inactive = !areSameMonth(day, this._activeDate);

    return {
      disabled: disabled || hidden,
      first: this.isFirstInRange(day),
      last: this.isLastInRange(day),
      range: isRange && this.isRangeDate(day),
      preview: isRange && this.isRangePreview(day),
      current: !inactive && day.equalTo(today),
      inactive,
      hidden,
      weekend: day.weekend,
      single: !isRange,
      selected: !disabled && this.isSelected(day),
      special: isDateInRanges(day, this._specialDates) && !inactive,
    };
  }

  protected renderDay(day: CalendarDay, today: CalendarDay) {
    const ariaLabel = this.intlFormatDay(day);
    const { changePreview, clearPreview } = this.getDayHandlers(day);

    const props = this.getDayProperties(day, today);

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
          @mouseenter=${changePreview}
          @mouseleave=${clearPreview}
        >
          ${day.date}
        </span>
      </span>
    `;
  }

  protected renderHeaderWeekNumber() {
    return html`
      <span role="columnheader" part="label week-number first">
        <span part="week-number-inner first">
          ${this.resourceStrings.weekLabel}
        </span>
      </span>
    `;
  }

  protected renderWeekNumber(start: CalendarDay, last: boolean) {
    return html`
      <span role="rowheader" part=${partMap({ 'week-number': true, last })}>
        <span part=${partMap({ 'week-number-inner': true, last })}>
          ${start.week}
        </span>
      </span>
    `;
  }

  protected renderHeaders() {
    const label = this._intl.get('weekday');
    const aria = this._intl.get('ariaWeekday');
    const days = take(
      generateMonth(this._activeDate, this._firstDayOfWeek),
      daysInWeek
    );

    const weekNumber = this.showWeekNumbers
      ? this.renderHeaderWeekNumber()
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

  protected *renderWeeks() {
    const today = CalendarDay.today;
    const weeks = Array.from(chunk(this.dates, daysInWeek));
    const last = weeks.length - 1;

    for (const [idx, week] of weeks.entries()) {
      let hidden = false;
      if (idx === 0 || idx === last) {
        hidden = week.every((day) => this.getDayProperties(day, today).hidden);
      }
      yield html`
        <div role="row" part="days-row" aria-hidden=${hidden}>
          ${this.showWeekNumbers
            ? this.renderWeekNumber(week[0], idx === last)
            : nothing}
          ${week.map((day) => this.renderDay(day, today))}
        </div>
      `;
    }
  }

  protected override render() {
    return html`${this.renderHeaders()}${this.renderWeeks()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-days-view': IgcDaysViewComponent;
  }
}
