import { html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { themes } from '../../../theming/theming-decorator.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from '../../common/i18n/calendar.resources.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partNameMap } from '../../common/util.js';
import {
  IgcCalendarBaseComponent,
  type IgcCalendarBaseEventMap,
} from '../common/calendar-base.js';
import {
  DateRangeType,
  type ICalendarDate,
  TimeDeltaInterval,
  isDateInRanges,
} from '../common/calendar.model.js';
import { areEqualDates, getDateOnly, isEqual } from '../common/utils.js';
import { styles } from '../themes/days-view.base.css.js';
import { all } from '../themes/days.js';

export interface IgcDaysViewEventMap extends IgcCalendarBaseEventMap {
  igcActiveDateChange: CustomEvent<ICalendarDate>;
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
@themes(all)
export default class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<IgcCalendarBaseComponent>
>(IgcCalendarBaseComponent) {
  public static readonly tagName = 'igc-days-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  private labelFormatter!: Intl.DateTimeFormat;
  private formatterWeekday!: Intl.DateTimeFormat;
  private dates!: ICalendarDate[][];

  @query('[tabindex="0"]')
  private activeDay!: HTMLElement;

  /** Controls the visibility of the leading dates that do not belong to the current month. */
  @property({ type: Boolean, attribute: 'hide-leading-days' })
  public hideLeadingDays = false;

  /** Controls the visibility of the trailing dates that do not belong to the current month. */
  @property({ type: Boolean, attribute: 'hide-trailing-days' })
  public hideTrailingDays = false;

  /** Gets/sets the active state of the days view. */
  @property({ type: Boolean })
  public active = false;

  /** The range preview date. */
  @property({ attribute: false })
  public rangePreviewDate?: Date;

  /** The format of the days. Defaults to narrow. */
  @property({ attribute: 'week-day-format' })
  public weekDayFormat: 'long' | 'short' | 'narrow' | undefined = 'narrow';

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings: IgcCalendarResourceStrings =
    IgcCalendarResourceStringEN;

  @watch('weekDayFormat')
  @watch('locale')
  protected formattersChange() {
    this.initFormatters();
  }

  @watch('weekStart')
  @watch('activeDate')
  protected datesChange() {
    this.dates = this.getCalendarMonth();
  }

  constructor() {
    super();
    this.setAttribute('role', 'grid');
    this.initFormatters();
  }

  /** Focuses the active date. */
  public focusActiveDate() {
    this.activeDay.focus();
  }

  private initFormatters() {
    this.formatterWeekday = new Intl.DateTimeFormat(this.locale, {
      weekday: this.weekDayFormat,
    });
    this.labelFormatter = new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private generateWeekHeader(): { label: string; ariaLabel: string }[] {
    const dayNames = [];
    const rv = this.calendarModel.monthdatescalendar(
      this.activeDate.getFullYear(),
      this.activeDate.getMonth()
    )[0];
    for (const day of rv) {
      dayNames.push({
        label: this.formatterWeekday.format(day.date),
        ariaLabel: day.date.toLocaleString(this.locale, { weekday: 'long' }),
      });
    }

    return dayNames;
  }

  private getCalendarMonth(): ICalendarDate[][] {
    return this.calendarModel.monthdatescalendar(
      this.activeDate.getFullYear(),
      this.activeDate.getMonth(),
      true
    );
  }

  private titleCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getWeekNumber(date: Date): number {
    return this.calendarModel.getWeekNumber(date);
  }

  private formattedDate(value: Date): string {
    return `${value.getDate()}`;
  }

  private get isSingleSelection(): boolean {
    return this.selection !== 'range';
  }

  private isLastInRange(date: ICalendarDate): boolean {
    if (this.isSingleSelection || !this.values || this.values.length === 0) {
      return false;
    }

    const dates = this.values;
    let lastDate = dates[dates.length - 1];

    if (this.rangePreviewDate) {
      if (this.rangePreviewDate > lastDate) {
        lastDate = this.rangePreviewDate;
      }
    }

    return isEqual(lastDate, date.date);
  }

  private isFirstInRange(date: ICalendarDate): boolean {
    if (this.isSingleSelection || !this.values || this.values.length === 0) {
      return false;
    }

    const dates = this.values;
    let firstDate = dates[0];

    if (this.rangePreviewDate) {
      if (this.rangePreviewDate < firstDate) {
        firstDate = this.rangePreviewDate;
      }
    }

    return isEqual(firstDate, date.date);
  }

  private isDisabled(date: Date): boolean {
    if (!this.disabledDates) {
      return false;
    }

    return isDateInRanges(date, this.disabledDates);
  }

  private isWithinRange(date: Date, min: Date, max: Date): boolean {
    return isDateInRanges(date, [
      {
        type: DateRangeType.Between,
        dateRange: [min, max],
      },
    ]);
  }

  private isRangeDate(date: Date) {
    if (
      this.selection !== 'range' ||
      !this.values ||
      this.values.length === 0
    ) {
      return false;
    }

    const dates = this.values;
    const min = dates[0];
    let max;

    if (dates.length === 1) {
      if (!this.rangePreviewDate) {
        return false;
      }

      max = this.rangePreviewDate;
    } else {
      max = dates[dates.length - 1];
    }

    return isDateInRanges(date, [
      {
        type: DateRangeType.Between,
        dateRange: [min, max],
      },
    ]);
  }

  private isRangePreview(date: Date) {
    if (
      this.selection === 'range' &&
      this.values &&
      this.values.length > 0 &&
      this.rangePreviewDate
    ) {
      return isDateInRanges(date, [
        {
          type: DateRangeType.Between,
          dateRange: [this.values[0], this.rangePreviewDate],
        },
      ]);
    }

    return false;
  }

  private isSelected(date: ICalendarDate) {
    if (this.isDisabled(date.date)) {
      return false;
    }

    if (this.selection === 'single') {
      if (!this.value) {
        return false;
      }
      return getDateOnly(this.value).getTime() === date.date.getTime();
    }

    if (!this.values || this.values.length === 0) {
      return false;
    }

    if (this.selection === 'range' && this.values.length === 1) {
      return getDateOnly(this.values[0]).getTime() === date.date.getTime();
    }

    if (this.selection === 'multiple') {
      const start = getDateOnly(this.values[0]);
      const end = getDateOnly(this.values[this.values.length - 1]);

      if (this.isWithinRange(date.date, start, end)) {
        const currentDate = this.values.find(
          (element) => element.getTime() === date.date.getTime()
        );
        return !!currentDate;
      } else {
        return false;
      }
    } else {
      return this.isWithinRange(
        date.date,
        this.values[0],
        this.values[this.values.length - 1]
      );
    }
  }

  private isToday(day: ICalendarDate): boolean {
    const today = new Date(Date.now());
    const date = day.date;

    // TODO
    // if (date.getDate() === today.getDate()) {
    //     this.nativeElement.setAttribute('aria-current', 'date');
    // }

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  private isWeekend(date: ICalendarDate): boolean {
    const day = date.date.getDay();
    return day === 0 || day === 6;
  }

  private isSpecial(day: ICalendarDate): boolean {
    if (this.specialDates === null) {
      return false;
    }

    return isDateInRanges(day.date, this.specialDates);
  }

  private dateClicked(event: Event, day: ICalendarDate) {
    event.stopPropagation();

    this.selectDay(day);

    this.changeActiveDate(day);
  }

  private selectDay(day: ICalendarDate) {
    if (this.rangePreviewDate) {
      this.setRangePreviewDate(undefined);
    }

    const result = this.selectDate(day.date);

    if (result) {
      this.emitEvent('igcChange', { detail: day.date });
    }
  }

  private selectDate(value: Date) {
    if (this.isDisabled(value)) {
      return false;
    }

    switch (this.selection) {
      case 'single':
        if (this.value?.getTime() === value.getTime()) {
          return false;
        }
        this.selectSingle(value);
        break;
      case 'multiple':
        this.selectMultiple(value);
        break;
      case 'range':
        this.selectRange(value);
        break;
    }

    return true;
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const result = [];
    start = getDateOnly(start);
    end = getDateOnly(end);
    while (start.getTime() < end.getTime()) {
      start = this.calendarModel.timedelta(start, TimeDeltaInterval.Day, 1);
      result.push(start);
    }

    return result;
  }

  private selectRange(value: Date) {
    let start: Date;
    let end: Date;
    let selectedDates: Date[] = (this.values ?? []) as Date[];

    if (selectedDates.length !== 1) {
      // start new range
      selectedDates = [value];
    } else {
      if (selectedDates[0].getTime() === value.getTime()) {
        this.values = [];
        return;
      }

      selectedDates.push(value);
      selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

      start = selectedDates.shift()!;
      end = selectedDates.pop()!;
      selectedDates = [start, ...this.generateDateRange(start, end)];
    }

    // exclude disabled dates
    selectedDates = selectedDates.filter((d) => !this.isDisabled(d));

    this.values = [...selectedDates];
  }

  private selectSingle(value: Date) {
    this.value = getDateOnly(value);
  }

  private selectMultiple(value: Date) {
    let selectedDates: Date[] = (this.values ?? []) as Date[];
    const valueDateOnly = getDateOnly(value);
    const newSelection = [];

    if (
      selectedDates.every(
        (date: Date) => date.getTime() !== valueDateOnly.getTime()
      )
    ) {
      newSelection.push(valueDateOnly);
    } else {
      selectedDates = selectedDates.filter(
        (date: Date) => date.getTime() !== valueDateOnly.getTime()
      );
    }

    if (newSelection.length > 0) {
      selectedDates = selectedDates.concat(newSelection);
    }

    selectedDates = selectedDates.filter((d) => !this.isDisabled(d));
    selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
    this.values = [...selectedDates];
  }

  private changeActiveDate(day: ICalendarDate) {
    this.activeDate = day.date;
    this.emitEvent('igcActiveDateChange', { detail: day });
  }

  private dateKeyDown(event: KeyboardEvent, day: ICalendarDate) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDay(day);
    }
  }

  private changeRangePreview(date: Date) {
    if (
      this.selection === 'range' &&
      this.values &&
      this.values.length === 1 &&
      !isEqual(this.values[0], date)
    ) {
      this.setRangePreviewDate(date);
    }
  }

  private clearRangePreview() {
    if (this.rangePreviewDate) {
      this.setRangePreviewDate(undefined);
    }
  }

  private setRangePreviewDate(value?: Date) {
    this.rangePreviewDate = value;
    this.emitEvent('igcRangePreviewDateChange', { detail: value });
  }

  private resolveDayItemPartName(day: ICalendarDate) {
    const isInactive = day.isNextMonth || day.isPrevMonth;
    const isHidden =
      (this.hideLeadingDays && day.isPrevMonth) ||
      (this.hideTrailingDays && day.isNextMonth);
    const isDisabled = this.isDisabled(day.date);

    return {
      date: true,
      first: this.isFirstInRange(day),
      last: this.isLastInRange(day),
      selected: !isDisabled && this.isSelected(day),
      inactive: isInactive,
      hidden: isHidden,
      current: this.isToday(day),
      weekend: this.isWeekend(day),
      range: this.selection === 'range' && this.isRangeDate(day.date),
      special: this.isSpecial(day),
      disabled: isHidden || isDisabled,
      single: this.selection !== 'range',
      preview: this.isRangePreview(day.date),
    };
  }

  private renderWeekHeaders() {
    return html`<div role="row" part="days-row first">
      ${this.showWeekNumbers
        ? html`<span role="columnheader" part="label week-number first">
            <span part="week-number-inner first"
              >${this.resourceStrings.weekLabel}</span
            >
          </span>`
        : ''}
      ${this.generateWeekHeader().map(
        (weekday) =>
          html`<span
            role="columnheader"
            part="label"
            aria-label=${weekday.ariaLabel}
          >
            <span part="label-inner">${this.titleCase(weekday.label)}</span>
          </span> `
      )}
    </div>`;
  }

  private renderDates() {
    return this.dates.map((week, i) => {
      const last = i === this.dates.length - 1;

      return html`<div role="row" part="days-row">
        ${this.showWeekNumbers
          ? html`<span
              role="rowheader"
              part=${partNameMap({ 'week-number': true, last })}
            >
              <span part=${partNameMap({ 'week-number-inner': true, last })}
                >${this.getWeekNumber(week[0].date)}</span
              >
            </span>`
          : ''}
        ${week.map((day) => this.renderDateItem(day))}
      </div>`;
    });
  }

  protected dayLabelFormatter(value: ICalendarDate) {
    // Range selection in progress
    if (
      this.rangePreviewDate &&
      areEqualDates(this.rangePreviewDate, value.date)
    ) {
      return (this.labelFormatter as any).formatRange(
        this.values!.at(0),
        this.rangePreviewDate
      );
    }

    // Range selection finished
    if (this.isFirstInRange(value) || this.isLastInRange(value)) {
      return (this.labelFormatter as any).formatRange(
        this.values!.at(0),
        this.values!.at(-1)
      );
    }

    // Default
    return this.labelFormatter.format(value.date);
  }

  private renderDateItem(day: ICalendarDate) {
    const datePartName = partNameMap(this.resolveDayItemPartName(day));
    const dateInnerPartName = datePartName.replace('date', 'date-inner');

    return html`<span part=${datePartName}>
      <span
        part=${dateInnerPartName}
        role="gridcell"
        aria-label=${this.dayLabelFormatter(day)}
        aria-selected=${this.isSelected(day)}
        aria-disabled=${this.isDisabled(day.date)}
        tabindex=${this.active && areEqualDates(this.activeDate, day.date)
          ? 0
          : -1}
        @click=${(event: MouseEvent) => this.dateClicked(event, day)}
        @focus=${() => this.changeRangePreview(day.date)}
        @blur=${() => this.clearRangePreview()}
        @keydown=${(event: KeyboardEvent) => this.dateKeyDown(event, day)}
        @mouseenter=${() => this.changeRangePreview(day.date)}
        @mouseleave=${() => this.clearRangePreview()}
        >${this.formattedDate(day.date)}</span
      >
    </span>`;
  }

  protected override render() {
    return html`${this.renderWeekHeaders()} ${this.renderDates()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-days-view': IgcDaysViewComponent;
  }
}
