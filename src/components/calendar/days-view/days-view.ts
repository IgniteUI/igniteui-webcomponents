import { html } from 'lit';
import { watch } from '../../common/decorators';
import {
  DateRangeType,
  ICalendarDate,
  isDateInRanges,
  TimeDeltaInterval,
} from '../common/calendar.model';
import {
  IgcCalendarBaseComponent,
  IgcCalendarBaseEventMap,
} from '../common/calendar-base';
import { areEqualDates, getDateOnly, isEqual } from '../common/utils';
import { styles } from './days-view-material.css';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { Constructor } from '../../common/mixins/constructor';
import { property, query } from 'lit/decorators.js';
import { partNameMap } from '../../common/util';
import {
  IgcCalendarResourceStringEN,
  IgcCalendarResourceStrings,
} from '../../common/i18n/calendar.resources';

export interface IgcDaysViewEventMap extends IgcCalendarBaseEventMap {
  igcOutsideDaySelected: CustomEvent<ICalendarDate>;
  igcActiveDateChange: CustomEvent<Date>;
  igcRangePreviewDateChange: CustomEvent<Date>;
}

export class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<IgcCalendarBaseComponent>
>(IgcCalendarBaseComponent) {
  /**
   * @private
   */
  static styles = [styles];

  private formatterWeekday!: Intl.DateTimeFormat;
  private dates!: ICalendarDate[][];

  @query('[tabindex="0"]')
  activeDay!: HTMLElement;

  @property({ type: Boolean })
  active = false;

  @property({ attribute: false })
  rangePreviewDate?: Date;

  @property({ attribute: 'week-day-format' })
  weekDayFormat: 'long' | 'short' | 'narrow' = 'narrow';

  @property({ attribute: false })
  resourceStrings: IgcCalendarResourceStrings = IgcCalendarResourceStringEN;

  @watch('weekDayFormat')
  @watch('locale')
  formattersChange() {
    this.initFormatters();
  }

  @watch('weekStart')
  @watch('activeDate')
  datesChange() {
    this.dates = this.getCalendarMonth();
  }

  constructor() {
    super();
    this.setAttribute('role', 'grid');
    this.initFormatters();
  }

  focusActiveDate() {
    this.activeDay.focus();
  }

  private initFormatters() {
    this.formatterWeekday = new Intl.DateTimeFormat(this.locale, {
      weekday: this.weekDayFormat,
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
    if (this.isSingleSelection || !this.value) {
      return false;
    }

    const dates = this.value as Date[];
    let lastDate = dates[dates.length - 1];

    if (this.rangePreviewDate) {
      if (this.rangePreviewDate > lastDate) {
        lastDate = this.rangePreviewDate;
      }
    }

    return isEqual(lastDate, date.date);
  }

  private isFirstInRange(date: ICalendarDate): boolean {
    if (this.isSingleSelection || !this.value) {
      return false;
    }

    const dates = this.value as Date[];
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

  private isWithinRange(date: Date, min?: Date, max?: Date): boolean {
    const valueArr = this.value as Date[];
    min = min ? min : valueArr[0];
    max = max ? max : valueArr[valueArr.length - 1];

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
      !this.value ||
      (this.value as Date[]).length === 0
    ) {
      return false;
    }

    const dates = this.value as Date[];
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
    if (this.selection === 'range' && this.rangePreviewDate) {
      return isDateInRanges(date, [
        {
          type: DateRangeType.Between,
          dateRange: [(this.value as Date[])[0], this.rangePreviewDate],
        },
      ]);
    }

    return false;
  }

  private isSelected(date: ICalendarDate) {
    let selectedDates: Date | Date[];
    if (
      this.isDisabled(date.date) ||
      !this.value ||
      (Array.isArray(this.value) && this.value.length === 0)
    ) {
      return false;
    }

    if (this.selection === 'single') {
      selectedDates = this.value as Date;
      return getDateOnly(selectedDates).getTime() === date.date.getTime();
    }

    selectedDates = this.value as Date[];
    if (this.selection === 'range' && selectedDates.length === 1) {
      return getDateOnly(selectedDates[0]).getTime() === date.date.getTime();
    }

    if (this.selection === 'multi') {
      const start = getDateOnly(selectedDates[0]);
      const end = getDateOnly(selectedDates[selectedDates.length - 1]);

      if (this.isWithinRange(date.date, start, end)) {
        const currentDate = selectedDates.find(
          (element) => element.getTime() === date.date.getTime()
        );
        return !!currentDate;
      } else {
        return false;
      }
    } else {
      return this.isWithinRange(date.date);
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

    if (!day.isCurrentMonth) {
      this.emitEvent('igcOutsideDaySelected', { detail: day });
    }
  }

  private selectDay(day: ICalendarDate) {
    if (this.rangePreviewDate) {
      this.setRangePreviewDate(undefined);
    }

    const result = this.selectDate(day.date);

    if (result) {
      this.emitEvent('igcChange');
    }
  }

  private selectDate(value: Date) {
    if (this.isDisabled(value)) {
      return false;
    }

    switch (this.selection) {
      case 'single':
        if ((this.value as Date)?.getTime() === value.getTime()) {
          return false;
        }
        this.selectSingle(value);
        break;
      case 'multi':
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
    let selectedDates: Date[] = (this.value ?? []) as Date[];

    if (selectedDates.length !== 1) {
      // start new range
      selectedDates = [value];
    } else {
      if (selectedDates[0].getTime() === value.getTime()) {
        this.value = [];
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

    this.value = [...selectedDates];
  }

  private selectSingle(value: Date) {
    this.value = getDateOnly(value);
  }

  private selectMultiple(value: Date) {
    let selectedDates: Date[] = (this.value ?? []) as Date[];
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
    this.value = [...selectedDates];
  }

  private changeActiveDate(day: ICalendarDate) {
    if (day.isCurrentMonth) {
      this.activeDate = day.date;
      this.emitEvent('igcActiveDateChange', { detail: day.date });
    }
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
      this.value &&
      (this.value as Date[]).length === 1 &&
      !isEqual((this.value as Date[])[0], date)
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
    const isHidden = this.hideOutsideDays && isInactive;
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
      disabled: isHidden || isDisabled || !day.isCurrentMonth,
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
        (weekday) => html`<span
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

  private renderDateItem(day: ICalendarDate) {
    const datePartName = partNameMap(this.resolveDayItemPartName(day));
    const dateInnerPartName = datePartName.replace('date', 'date-inner');

    return html`<span part=${datePartName}>
      <span
        part=${dateInnerPartName}
        role="gridcell"
        aria-label=${day.date.toLocaleString(this.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
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

  render() {
    return html`${this.renderWeekHeaders()} ${this.renderDates()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-days-view': IgcDaysViewComponent;
  }
}
