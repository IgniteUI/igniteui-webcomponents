import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { watch } from '../../common/decorators';
import {
  DateRangeType,
  ICalendarDate,
  isDateInRanges,
} from '../common/calendar.model';
import {
  IgcCalendarBaseComponent,
  IgcCalendarBaseEventMap,
} from '../common/calendar-base';
import { getDateOnly, isDate, isEqual } from '../common/utils';
import { styles } from './days-view.css';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { Constructor } from '../../common/mixins/constructor';
import { property } from 'lit/decorators.js';

export interface IgcDaysViewEventMap extends IgcCalendarBaseEventMap {
  igcOutsideDaySelected: CustomEvent<ICalendarDate>;
}

const WEEK_LABEL = 'Wk';

/**
 * Days view component
 *
 * @element igc-days-view
 */
export class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<IgcCalendarBaseComponent>
>(IgcCalendarBaseComponent) {
  /**
   * @private
   */
  static styles = [styles];

  private rangeStarted = false;
  private formatterWeekday!: Intl.DateTimeFormat;

  @property()
  weekDayFormat: 'long' | 'short' | 'narrow' = 'short';

  @watch('selection', { waitUntilFirstUpdate: true })
  selectionChange() {
    this.value = undefined;
    this.rangeStarted = false;
  }

  @watch('weekDayFormat')
  @watch('locale')
  formattersChange() {
    this.initFormatters();
  }

  constructor() {
    super();
    this.initFormatters();
  }

  private initFormatters() {
    this.formatterWeekday = new Intl.DateTimeFormat(this.locale, {
      weekday: this.weekDayFormat,
    });
  }

  private generateWeekHeader(): string[] {
    const dayNames = [];
    const rv = this.calendarModel.monthdatescalendar(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth()
    )[0];
    for (const day of rv) {
      dayNames.push(this.formatterWeekday.format(day.date));
    }

    return dayNames;
  }

  private getCalendarMonth(): ICalendarDate[][] {
    return this.calendarModel.monthdatescalendar(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth(),
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
    // TODO
    // if (this.formatViews.day) {
    //     return this.formatterDay.format(value);
    // }
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
    const lastDate = dates[dates.length - 1];
    return isEqual(lastDate, date.date);
  }

  private isFirstInRange(date: ICalendarDate): boolean {
    if (this.isSingleSelection || !this.value) {
      return false;
    }

    return isEqual((this.value as Date[])[0], date.date);
  }

  private isDisabled(date: Date): boolean {
    if (!this.disabledDates) {
      return false;
    }

    return isDateInRanges(date, this.disabledDates);
  }

  private isWithinRange(
    date: Date,
    checkForRange: boolean,
    min?: Date,
    max?: Date
  ): boolean {
    if (
      checkForRange &&
      !(Array.isArray(this.value) && this.value.length > 1)
    ) {
      return false;
    }

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

      if (this.isWithinRange(date.date, false, start, end)) {
        const currentDate = selectedDates.find(
          (element) => element.getTime() === date.date.getTime()
        );
        return !!currentDate;
      } else {
        return false;
      }
    } else {
      return this.isWithinRange(date.date, true);
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

  private selectDay(event: Event, day: ICalendarDate) {
    event.stopPropagation();
    this.selectDateFromClient(day.date);
    this.emitEvent('igcChange');

    if (!day.isCurrentMonth) {
      this.emitEvent('igcOutsideDaySelected', { detail: day, bubbles: false });
    }
  }

  private selectDateFromClient(value: Date) {
    switch (this.selection) {
      case 'single':
      case 'multi':
        this.selectDate(value);
        break;
      case 'range':
        this.selectRange(value, true);
        break;
    }
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const result = [];
    start = getDateOnly(start);
    end = getDateOnly(end);
    while (start.getTime() < end.getTime()) {
      start = this.calendarModel.timedelta(start, 'day', 1);
      result.push(start);
    }

    return result;
  }

  private selectRange(value: Date | Date[], excludeDisabledDates = false) {
    let start: Date;
    let end: Date;
    let selectedDates: Date[] = (this.value ?? []) as Date[];

    if (Array.isArray(value)) {
      // this.rangeStarted = false;
      value.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
      start = getDateOnly(value[0]);
      end = getDateOnly(value[value.length - 1]);
      selectedDates = [start, ...this.generateDateRange(start, end)];
    } else {
      if (!this.rangeStarted) {
        this.rangeStarted = true;
        selectedDates = [value];
      } else {
        this.rangeStarted = false;

        if (selectedDates[0].getTime() === value.getTime()) {
          // selectedDates = [];
          this.value = [];
          // this._onChangeCallback(this.selectedDates);
          return;
        }

        selectedDates.push(value);
        selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

        start = selectedDates.shift()!;
        end = selectedDates.pop()!;
        selectedDates = [start, ...this.generateDateRange(start, end)];
      }
    }

    if (excludeDisabledDates) {
      selectedDates = selectedDates.filter((d) => !this.isDisabled(d));
    }

    this.value = [...selectedDates];
    // this._onChangeCallback(this.selectedDates);
  }

  private selectSingle(value: Date) {
    this.value = getDateOnly(value);
    // this._onChangeCallback(this.selectedDates);
  }

  private selectMultiple(value: Date | Date[]) {
    let selectedDates: Date[] = (this.value ?? []) as Date[];

    if (Array.isArray(value)) {
      const newDates = value.map((v) => getDateOnly(v).getTime());
      const selDates = selectedDates.map((v) => getDateOnly(v).getTime());

      if (JSON.stringify(newDates) === JSON.stringify(selDates)) {
        return;
      }

      selectedDates = Array.from(new Set([...newDates, ...selDates])).map(
        (v) => new Date(v)
      );
    } else {
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
    }
    selectedDates = selectedDates.filter((d) => !this.isDisabled(d));
    selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
    this.value = [...selectedDates];
    // this._onChangeCallback(this.selectedDates);
  }

  private selectDate(value: Date | Date[]) {
    if (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    switch (this.selection) {
      case 'single':
        if (isDate(value) && !this.isDisabled(value as Date)) {
          this.selectSingle(value as Date);
        }
        break;
      case 'multi':
        this.selectMultiple(value);
        break;
      case 'range':
        this.selectRange(value, true);
        break;
    }
  }

  private resolveDayItemClasses(day: ICalendarDate) {
    const isInactive = day.isNextMonth || day.isPrevMonth;
    const isHidden = this.hideOutsideDays && isInactive;
    const isDisabled = this.isDisabled(day.date);

    return {
      date: true,
      'date--first': this.isFirstInRange(day),
      'date--last': this.isLastInRange(day),
      'date--selected': !isDisabled && this.isSelected(day),
      'date--inactive': isInactive,
      'date--hidden': isHidden,
      'date--current': this.isToday(day),
      'date--weekend': this.isWeekend(day),
      'date--range':
        this.selection === 'range' && this.isWithinRange(day.date, true),
      'date--special': this.isSpecial(day),
      'date--disabled': isHidden || isDisabled || !day.isCurrentMonth,
      'date--single': this.selection !== 'range',
    };
  }

  private renderWeekHeaders() {
    return html`<div role="row" class="body-row">
      ${this.showWeekNumbers
        ? html`<div role="columnheader" class="label label--week-number">
            <span>${WEEK_LABEL}</span>
          </div>`
        : ''}
      ${this.generateWeekHeader().map(
        (dayName) => html`<span
          role="columnheader"
          aria-label=${dayName}
          class="label"
        >
          ${this.titleCase(dayName)}
        </span>`
      )}
    </div>`;
  }

  private renderDates() {
    return this.getCalendarMonth().map(
      (week) => html`<div role="row" class="body-row">
        ${this.showWeekNumbers
          ? html`<div role="columnheader" class="date date--week-number">
              <span
                role="rowheader"
                class="date-content date-content--week-number"
              >
                ${this.getWeekNumber(week[0].date)}
              </span>
            </div>`
          : ''}
        ${week.map((day) => this.renderDateItem(day))}
      </div>`
    );
  }

  private renderDateItem(day: ICalendarDate) {
    return html`<span
      class=${classMap(this.resolveDayItemClasses(day))}
      role="gridcell"
      @click=${(event: MouseEvent) => this.selectDay(event, day)}
    >
      ${this.formattedDate(day.date)}
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
