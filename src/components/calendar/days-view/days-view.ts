import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { themes } from '../../../theming/theming-decorator.js';
// import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
// import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  IgcCalendarResourceStrings,
} from '../../common/i18n/calendar.resources.js';
import { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partNameMap } from '../../common/util.js';
import {
  BaseCalendarModel,
  IgcCalendarBaseEventMap,
} from '../common/calendar-base.js';
import { DateRangeType, ICalendarDate } from '../common/calendar.model.js';
import {
  CalendarDay,
  isDateInRanges as _isDateInRanges,
  chunk,
  daysInWeek,
  generateFullMonth,
} from '../common/day.js';
import { createDateTimeFormatters } from '../common/intl-formatters.js';
import { styles } from '../themes/days-view.base.css.js';
import { all } from '../themes/days.js';

export interface IgcDaysViewEventMap extends IgcCalendarBaseEventMap {
  igcActiveDateChange: CustomEvent<ICalendarDate>;
  igcRangePreviewDateChange: CustomEvent<Date>;
}

function isPreviousMonth(day: CalendarDay, anchor: CalendarDay) {
  return day.year === anchor.year
    ? day.month < anchor.month
    : day.year < anchor.year;
}

function isNextMonth(day: CalendarDay, anchor: CalendarDay) {
  return day.year === anchor.year
    ? day.month > anchor.month
    : day.year > anchor.year;
}

// function isSameMonth(day: CalendarDay, anchor: CalendarDay) {
//   return day.year === anchor.year && day.month === anchor.month;
// }

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
@themes(all)
export default class IgcDaysViewComponent extends EventEmitterMixin<
  IgcDaysViewEventMap,
  Constructor<BaseCalendarModel>
>(BaseCalendarModel) {
  public static readonly tagName = 'igc-days-view';
  public static styles = styles;

  public static register() {
    registerComponent(this);
  }

  private dates!: CalendarDay[];

  @query(`[tabindex='0']`)
  private activeDay!: HTMLElement;

  @state()
  protected _rangePreviewDate?: CalendarDay;

  public get rangePreviewDate() {
    return this._rangePreviewDate?.native;
  }

  @property({ type: Boolean })
  public active = false;

  @property({ attribute: false })
  public set rangePreviewDate(value) {
    this._rangePreviewDate = value ? CalendarDay.from(value) : undefined;
  }

  @property({ attribute: 'week-day-format' })
  public weekDayFormat: 'long' | 'short' | 'narrow' = 'narrow';

  /** Controls the visibility of the leading dates that do not belong to the current month. */
  @property({ type: Boolean, attribute: 'hide-leading-days' })
  public hideLeadingDays = false;

  /** Controls the visibility of the trailing dates that do not belong to the current month. */
  @property({ type: Boolean, attribute: 'hide-trailing-days' })
  public hideTrailingDays = false;

  private __formatters = createDateTimeFormatters(this.locale, {
    weekday: { weekday: this.weekDayFormat },
    label: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    ariaWeekday: { weekday: 'long' },
  });

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings: IgcCalendarResourceStrings =
    IgcCalendarResourceStringEN;

  @watch('weekStart')
  @watch('activeDate')
  protected datesChange() {
    this.dates = Array.from(
      generateFullMonth(this._activeDate, this._firstDayOfWeek)
    );
  }

  @watch('locale')
  protected localeChanged() {
    this.__formatters.locale = this.locale;
  }

  @watch('weekDayFormat')
  protected weekDayFormatChange() {
    this.__formatters.update({ weekday: { weekday: this.weekDayFormat } });
  }

  public focusActiveDate() {
    this.activeDay?.focus();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  protected isDisabled(day: CalendarDay) {
    return this.disabledDates?.length
      ? _isDateInRanges(day, this.disabledDates)
      : false;
  }

  protected isSpecial(day: CalendarDay) {
    return this.specialDates?.length
      ? _isDateInRanges(day, this.specialDates)
      : false;
  }

  protected isSelected(day: CalendarDay) {
    if (this.isDisabled(day)) return false;

    if (!(this._value || this._hasValues)) {
      return false;
    }

    const [start, end] = [this._values.at(0)!, this._values.at(-1)!];

    if (this._isSingle) {
      return this._value!.equalTo(day);
    }

    if (this._isMultiple) {
      return _isDateInRanges(day, [
        {
          type: DateRangeType.Specific,
          dateRange: this._values.map((v) => v.native),
        },
      ]);
    }

    if (this._isRange) {
      return _isDateInRanges(day, [
        {
          type: DateRangeType.Between,
          dateRange: [start.native, end.native],
        },
      ]);
    }

    return false;
  }

  protected select(value: CalendarDay) {
    if (this._isSingle) {
      if (this._value && this._value.equalTo(value)) {
        return false;
      }

      this._value = value;
    }

    if (this._isMultiple) {
      const dateSet = new Set(this._values.map((v) => v.timestamp));
      const ts = value.timestamp;

      dateSet.has(ts) ? dateSet.delete(ts) : dateSet.add(ts);
      this._values = Array.from(dateSet).map((ts) =>
        CalendarDay.from(new Date(ts))
      );
    }

    if (this._isRange) {
      // TODO
    }

    return true;
  }

  private changeActiveDate(date: CalendarDay) {
    this._activeDate = date;
    // TODO
    // this.emitEvent('igcActiveDateChange', { detail: date });
  }

  protected clickHandler(value: CalendarDay) {
    this.select(value);
    this.changeActiveDate(value);
  }

  protected isRangeDate(day: CalendarDay) {
    if (!this._hasValues) return false;
    const singleRange = this._values.length === 1;

    if (singleRange && !this._rangePreviewDate) {
      return false;
    }

    const min = this._values[0];
    const max = singleRange ? this._rangePreviewDate! : this._values.at(-1)!;

    return _isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [min.native, max.native],
      },
    ]);
  }

  protected isRangePreview(day: CalendarDay) {
    if (!(this._isRange && this._hasValues && this._rangePreviewDate)) {
      return false;
    }
    return _isDateInRanges(day, [
      {
        type: DateRangeType.Between,
        dateRange: [this._values[0].native, this._rangePreviewDate.native],
      },
    ]);
  }

  protected resolveDayProps(day: CalendarDay) {
    const inactive = day.month !== this._activeDate.month;
    const hidden =
      (this.hideLeadingDays && isPreviousMonth(day, this._activeDate)) ||
      (this.hideTrailingDays && isNextMonth(day, this._activeDate));
    const current = day.today;
    const disabled = this.isDisabled(day);
    const selected = !disabled && this.isSelected(day);
    const weekend = day.weekend;
    const special = this.isSpecial(day);
    const single = !this._isRange;
    const first = this.isFirstInRange(day);
    const last = this.isLastInRange(day);
    const range = this._isRange && this.isRangeDate(day);
    const preview = this.isRangePreview(day);

    return {
      current,
      date: true,
      disabled: hidden || disabled,
      first,
      last,
      range,
      hidden,
      inactive,
      preview,
      selected,
      single,
      special,
      weekend,
    };
  }

  protected renderHeaders() {
    const labels = this.__formatters.getFormatter('weekday');
    const ariaLabels = this.__formatters.getFormatter('ariaWeekday');

    const headers = this.dates.slice(0, daysInWeek).map(
      ({ native }) => html`
        <span
          role="columnheader"
          part="label"
          aria-label=${ariaLabels.format(native)}
        >
          <span part="label-inner">${labels.format(native)}</span>
        </span>
      `
    );

    return html`
      <div role="row" part="days-row first">
        ${this.showWeekNumbers ? this.renderWeekHeader() : nothing}${headers}
      </div>
    `;
  }

  protected renderWeekHeader() {
    return html`
      <span role="columnheader" part="label week-number first">
        <span part="week-number-inner first">
          ${this.resourceStrings.weekLabel}
        </span>
      </span>
    `;
  }

  protected renderWeekNumber(week: CalendarDay[]) {
    return html`<span role="rowheader" part="week-number">
      <span part="week-number-inner">${week[0].week}</span>
    </span>`;
  }

  protected *renderWeeks() {
    for (const week of chunk(this.dates, daysInWeek)) {
      yield html`<div role="row" part="days-row">
        ${this.showWeekNumbers ? this.renderWeekNumber(week) : nothing}
        ${week.map((day) => this.renderDay(day))}
      </div>`;
    }
  }

  protected isFirstInRange(day: CalendarDay) {
    if (this._isSingle || !this._hasValues) {
      return false;
    }

    const first = this._values[0];
    const preview = this._rangePreviewDate;

    return preview && preview.lessThan(first)
      ? preview.equalTo(day)
      : first.equalTo(day);
  }

  protected isLastInRange(day: CalendarDay) {
    if (this._isSingle || !this._hasValues) {
      return false;
    }

    const last = this._values.at(-1)!;
    const preview = this._rangePreviewDate;

    return preview && preview.greaterThan(day)
      ? preview.equalTo(day)
      : last.equalTo(day);
  }

  protected dayLabelFormatter(day: CalendarDay) {
    const formatter = this.__formatters.getFormatter('label');

    // Range selection active
    if (this._rangePreviewDate && this._rangePreviewDate.equalTo(day)) {
      return formatter.formatRange(
        this._values[0].native,
        this._rangePreviewDate.native
      );
    }

    // Range selection finished
    if (this.isFirstInRange(day) || this.isLastInRange(day)) {
      return formatter.formatRange(this.values.at(0)!, this.values.at(-1)!);
    }

    // Default
    return formatter.format(day.native);
  }

  protected setRangePreviewDay(day?: CalendarDay) {
    this._rangePreviewDate = day;
    this.emitEvent('igcRangePreviewDateChange', {
      detail: day ? day.native : undefined,
    });
  }

  protected changeRangePreview(day: CalendarDay) {
    if (this._hasValues && !this._values[0].equalTo(day)) {
      this.setRangePreviewDay(day);
    }
  }

  protected clearRangePreview() {
    if (this._rangePreviewDate) {
      this.setRangePreviewDay(undefined);
    }
  }

  protected renderDay(day: CalendarDay) {
    const props = this.resolveDayProps(day);

    const parts = partNameMap(props);
    const partsInner = parts.replace('date', 'date-inner');
    const ariaLabel = this.dayLabelFormatter(day);
    const isRange = this._isRange;
    const tabindex = day.equalTo(this._activeDate) ? 0 : -1;

    const changePreview = isRange
      ? this.changeRangePreview.bind(this, day)
      : nothing;
    const clearPreview = isRange ? this.clearRangePreview : nothing;
    const onClick = props.disabled
      ? nothing
      : this.clickHandler.bind(this, day);

    return html`<span part=${parts}>
      <span
        role="gridcell"
        part=${partsInner}
        aria-label=${ariaLabel}
        aria-selected=${props.selected}
        aria-disabled=${props.disabled}
        tabindex=${tabindex}
        @click=${onClick}
        @focus=${changePreview}
        @blur=${clearPreview}
        @mouseenter=${changePreview}
        @mouseleave=${clearPreview}
      >
        ${day.date}
      </span>
    </span>`;
  }

  protected override render() {
    return html`${this.renderHeaders()}${this.renderWeeks()}`;
  }
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
// @blazorSuppressComponent
// @blazorIndirectRender
// @themes(all)
// export class IgccDaysViewComponent extends EventEmitterMixin<
//   IgcDaysViewEventMap,
//   Constructor<IgcCalendarBaseComponent>
// >(IgcCalendarBaseComponent) {
//   public static readonly tagName = 'igc-days-view';
//   public static styles = styles;

//   /* blazorSuppress */
//   public static register() {
//     registerComponent(this);
//   }

//   private get hasValues() {
//     return Array.isArray(this.values) && this.values.length > 0;
//   }

//   private dates!: ICalendarDate[][];

//   @query('[tabindex="0"]')
//   private activeDay!: HTMLElement;

//   /** Controls the visibility of the leading dates that do not belong to the current month. */
//   @property({ type: Boolean, attribute: 'hide-leading-days' })
//   public hideLeadingDays = false;

//   /** Controls the visibility of the trailing dates that do not belong to the current month. */
//   @property({ type: Boolean, attribute: 'hide-trailing-days' })
//   public hideTrailingDays = false;

//   /** Gets/sets the active state of the days view. */
//   @property({ type: Boolean })
//   public active = false;

//   /** The range preview date. */
//   @property({ attribute: false })
//   public rangePreviewDate?: Date;

//   /** The format of the days. Defaults to narrow. */
//   @property({ attribute: 'week-day-format' })
//   public weekDayFormat: 'long' | 'short' | 'narrow' | undefined = 'narrow';

//   /** The resource strings. */
//   @property({ attribute: false })
//   public resourceStrings: IgcCalendarResourceStrings =
//     IgcCalendarResourceStringEN;

//   @watch('locale')
//   protected localeChanged() {
//     this.__formatters.locale = this.locale;
//   }

//   @watch('weekDayFormat')
//   protected weekDayFormatChange() {
//     this.__formatters.update({ weekday: { weekday: this.weekDayFormat } });
//   }

//   @watch('weekStart')
//   @watch('activeDate')
//   protected datesChange() {
//     this.dates = this.getCalendarMonth();
//   }

//   private __formatters = createDateTimeFormatters(this.locale, {
//     weekday: { weekday: this.weekDayFormat },
//     label: {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     },
//     ariaWeekday: { weekday: 'long' },
//   });

//   constructor() {
//     super();
//     this.setAttribute('role', 'grid');
//   }

//   /** Focuses the active date. */
//   public focusActiveDate() {
//     this.activeDay.focus();
//   }

//   private generateWeekHeader(): { label: string; ariaLabel: string }[] {
//     const dayNames = [];
//     const labelFormatter = this.__formatters.getFormatter('weekday');
//     const ariaFormatter = this.__formatters.getFormatter('ariaWeekday');
//     const rv = this.calendarModel.monthdatescalendar(
//       this.activeDate.getFullYear(),
//       this.activeDate.getMonth()
//     )[0];

//     for (const day of rv) {
//       dayNames.push({
//         label: labelFormatter.format(day.date),
//         ariaLabel: ariaFormatter.format(day.date),
//       });
//     }

//     return dayNames;
//   }

//   private getCalendarMonth(): ICalendarDate[][] {
//     return this.calendarModel.monthdatescalendar(
//       this.activeDate.getFullYear(),
//       this.activeDate.getMonth(),
//       true
//     );
//   }

//   private titleCase(str: string) {
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   }

//   private getWeekNumber(date: Date): number {
//     return this.calendarModel.getWeekNumber(date);
//   }

//   private get isSingleSelection(): boolean {
//     return this.selection !== 'range';
//   }

//   private isLastInRange(date: ICalendarDate): boolean {
//     if (this.isSingleSelection || !this.values || this.values.length === 0) {
//       return false;
//     }

//     const dates = this.values;
//     let lastDate = dates[dates.length - 1];

//     if (this.rangePreviewDate) {
//       if (this.rangePreviewDate > lastDate) {
//         lastDate = this.rangePreviewDate;
//       }
//     }

//     return isEqual(lastDate, date.date);
//   }

//   private isFirstInRange(date: ICalendarDate): boolean {
//     if (this.isSingleSelection || !this.hasValues) {
//       return false;
//     }

//     const dates = this.values;
//     let firstDate = dates![0];

//     if (this.rangePreviewDate) {
//       if (this.rangePreviewDate < firstDate) {
//         firstDate = this.rangePreviewDate;
//       }
//     }

//     return isEqual(firstDate, date.date);
//   }

//   private isDisabled(date: Date): boolean {
//     if (!this.disabledDates) {
//       return false;
//     }

//     return isDateInRanges(date, this.disabledDates);
//   }

//   private isWithinRange(date: Date, min: Date, max: Date): boolean {
//     return isDateInRanges(date, [
//       {
//         type: DateRangeType.Between,
//         dateRange: [min, max],
//       },
//     ]);
//   }

//   private isRangeDate(date: Date) {
//     if (
//       this.selection !== 'range' ||
//       !this.values ||
//       this.values.length === 0
//     ) {
//       return false;
//     }

//     const dates = this.values;
//     const min = dates[0];
//     let max;

//     if (dates.length === 1) {
//       if (!this.rangePreviewDate) {
//         return false;
//       }

//       max = this.rangePreviewDate;
//     } else {
//       max = dates[dates.length - 1];
//     }

//     return isDateInRanges(date, [
//       {
//         type: DateRangeType.Between,
//         dateRange: [min, max],
//       },
//     ]);
//   }

//   private isRangePreview(date: Date) {
//     if (
//       this.selection === 'range' &&
//       this.values &&
//       this.values.length > 0 &&
//       this.rangePreviewDate
//     ) {
//       return isDateInRanges(date, [
//         {
//           type: DateRangeType.Between,
//           dateRange: [this.values[0], this.rangePreviewDate],
//         },
//       ]);
//     }

//     return false;
//   }

//   private isSelected(date: ICalendarDate) {
//     if (this.isDisabled(date.date)) {
//       return false;
//     }

//     if (this.selection === 'single') {
//       if (!this.value) {
//         return false;
//       }
//       return getDateOnly(this.value).getTime() === date.date.getTime();
//     }

//     if (!this.values || this.values.length === 0) {
//       return false;
//     }

//     if (this.selection === 'range' && this.values.length === 1) {
//       return getDateOnly(this.values[0]).getTime() === date.date.getTime();
//     }

//     if (this.selection === 'multiple') {
//       const start = getDateOnly(this.values[0]);
//       const end = getDateOnly(this.values[this.values.length - 1]);

//       if (this.isWithinRange(date.date, start, end)) {
//         const currentDate = this.values.find(
//           (element) => element.getTime() === date.date.getTime()
//         );
//         return !!currentDate;
//       } else {
//         return false;
//       }
//     } else {
//       return this.isWithinRange(
//         date.date,
//         this.values[0],
//         this.values[this.values.length - 1]
//       );
//     }
//   }

//   private isWeekend(date: ICalendarDate): boolean {
//     const day = date.date.getDay();
//     return day === 0 || day === 6;
//   }

//   private isSpecial(day: ICalendarDate): boolean {
//     if (this.specialDates === null) {
//       return false;
//     }

//     return isDateInRanges(day.date, this.specialDates);
//   }

//   private dateClicked(event: Event, day: ICalendarDate) {
//     event.stopPropagation();

//     this.selectDay(day);

//     this.changeActiveDate(day);
//   }

//   private selectDay(day: ICalendarDate) {
//     if (this.rangePreviewDate) {
//       this.setRangePreviewDate(undefined);
//     }

//     const result = this.selectDate(day.date);

//     if (result) {
//       this.emitEvent('igcChange', { detail: day.date });
//     }
//   }

//   private selectDate(value: Date) {
//     if (this.isDisabled(value)) {
//       return false;
//     }

//     switch (this.selection) {
//       case 'single':
//         if (this.value?.getTime() === value.getTime()) {
//           return false;
//         }
//         this.selectSingle(value);
//         break;
//       case 'multiple':
//         this.selectMultiple(value);
//         break;
//       case 'range':
//         this.selectRange(value);
//         break;
//     }

//     return true;
//   }

//   private generateDateRange(start: Date, end: Date): Date[] {
//     const result = [];
//     start = getDateOnly(start);
//     end = getDateOnly(end);
//     while (start.getTime() < end.getTime()) {
//       start = this.calendarModel.timedelta(start, TimeDeltaInterval.Day, 1);
//       result.push(start);
//     }

//     return result;
//   }

//   private selectRange(value: Date) {
//     let start: Date;
//     let end: Date;
//     let selectedDates: Date[] = (this.values ?? []) as Date[];

//     if (selectedDates.length !== 1) {
//       // start new range
//       selectedDates = [value];
//     } else {
//       if (selectedDates[0].getTime() === value.getTime()) {
//         this.values = [];
//         return;
//       }

//       selectedDates.push(value);
//       selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

//       start = selectedDates.shift()!;
//       end = selectedDates.pop()!;
//       selectedDates = [start, ...this.generateDateRange(start, end)];
//     }

//     // exclude disabled dates
//     selectedDates = selectedDates.filter((d) => !this.isDisabled(d));

//     this.values = [...selectedDates];
//   }

//   private selectSingle(value: Date) {
//     this.value = getDateOnly(value);
//   }

//   private selectMultiple(value: Date) {
//     let selectedDates: Date[] = (this.values ?? []) as Date[];
//     const valueDateOnly = getDateOnly(value);
//     const newSelection = [];

//     if (
//       selectedDates.every(
//         (date: Date) => date.getTime() !== valueDateOnly.getTime()
//       )
//     ) {
//       newSelection.push(valueDateOnly);
//     } else {
//       selectedDates = selectedDates.filter(
//         (date: Date) => date.getTime() !== valueDateOnly.getTime()
//       );
//     }

//     if (newSelection.length > 0) {
//       selectedDates = selectedDates.concat(newSelection);
//     }

//     selectedDates = selectedDates.filter((d) => !this.isDisabled(d));
//     selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
//     this.values = [...selectedDates];
//   }

//   private changeActiveDate(day: ICalendarDate) {
//     this.activeDate = day.date;
//     this.emitEvent('igcActiveDateChange', { detail: day });
//   }

//   private dateKeyDown(event: KeyboardEvent, day: ICalendarDate) {
//     if (event.key === 'Enter' || event.key === ' ') {
//       event.preventDefault();
//       this.selectDay(day);
//     }
//   }

//   private changeRangePreview(date: Date) {
//     if (
//       this.selection === 'range' &&
//       this.values &&
//       this.values.length === 1 &&
//       !isEqual(this.values[0], date)
//     ) {
//       this.setRangePreviewDate(date);
//     }
//   }

//   private clearRangePreview() {
//     if (this.rangePreviewDate) {
//       this.setRangePreviewDate(undefined);
//     }
//   }

//   private setRangePreviewDate(value?: Date) {
//     this.rangePreviewDate = value;
//     this.emitEvent('igcRangePreviewDateChange', { detail: value });
//   }

//   private resolveDayItemPartName(day: ICalendarDate) {
//     const isInactive = day.isNextMonth || day.isPrevMonth;
//     const isHidden =
//       (this.hideLeadingDays && day.isPrevMonth) ||
//       (this.hideTrailingDays && day.isNextMonth);
//     const isDisabled = this.isDisabled(day.date);

//     return {
//       date: true,
//       first: this.isFirstInRange(day),
//       last: this.isLastInRange(day),
//       selected: !isDisabled && this.isSelected(day),
//       inactive: isInactive,
//       hidden: isHidden,
//       current: isToday(day.date),
//       weekend: this.isWeekend(day),
//       range: this.selection === 'range' && this.isRangeDate(day.date),
//       special: this.isSpecial(day),
//       disabled: isHidden || isDisabled,
//       single: this.selection !== 'range',
//       preview: this.isRangePreview(day.date),
//     };
//   }

//   private renderWeekHeaders() {
//     return html`<div role="row" part="days-row first">
//       ${this.showWeekNumbers
//         ? html`<span role="columnheader" part="label week-number first">
//             <span part="week-number-inner first"
//               >${this.resourceStrings.weekLabel}</span
//             >
//           </span>`
//         : ''}
//       ${this.generateWeekHeader().map(
//         (weekday) =>
//           html`<span
//             role="columnheader"
//             part="label"
//             aria-label=${weekday.ariaLabel}
//           >
//             <span part="label-inner">${this.titleCase(weekday.label)}</span>
//           </span> `
//       )}
//     </div>`;
//   }

//   private renderDates() {
//     return this.dates.map((week, i) => {
//       const last = i === this.dates.length - 1;

//       return html`<div role="row" part="days-row">
//         ${this.showWeekNumbers
//           ? html`<span
//               role="rowheader"
//               part=${partNameMap({ 'week-number': true, last })}
//             >
//               <span part=${partNameMap({ 'week-number-inner': true, last })}
//                 >${this.getWeekNumber(week[0].date)}</span
//               >
//             </span>`
//           : ''}
//         ${week.map((day) => this.renderDateItem(day))}
//       </div>`;
//     });
//   }

//   protected dayLabelFormatter(value: ICalendarDate) {
//     const formatter = this.__formatters.getFormatter('label');

//     // Range selection in progress
//     if (
//       this.rangePreviewDate &&
//       areEqualDates(this.rangePreviewDate, value.date)
//     ) {
//       return formatter.formatRange(this.values!.at(0)!, this.rangePreviewDate);
//     }

//     // Range selection finished
//     if (this.isFirstInRange(value) || this.isLastInRange(value)) {
//       return formatter.formatRange(this.values!.at(0)!, this.values!.at(-1)!);
//     }

//     // Default
//     return formatter.format(value.date);
//   }

//   private renderDateItem(day: ICalendarDate) {
//     const datePartName = partNameMap(this.resolveDayItemPartName(day));
//     const dateInnerPartName = datePartName.replace('date', 'date-inner');

//     return html`<span part=${datePartName}>
//       <span
//         part=${dateInnerPartName}
//         role="gridcell"
//         aria-label=${this.dayLabelFormatter(day)}
//         aria-selected=${this.isSelected(day)}
//         aria-disabled=${this.isDisabled(day.date)}
//         tabindex=${this.active && areEqualDates(this.activeDate, day.date)
//           ? 0
//           : -1}
//         @click=${(event: MouseEvent) => this.dateClicked(event, day)}
//         @focus=${() => this.changeRangePreview(day.date)}
//         @blur=${() => this.clearRangePreview()}
//         @keydown=${(event: KeyboardEvent) => this.dateKeyDown(event, day)}
//         @mouseenter=${() => this.changeRangePreview(day.date)}
//         @mouseleave=${() => this.clearRangePreview()}
//         >${day.date.getDate()}</span
//       >
//     </span>`;
//   }

//   protected override render() {
//     return html`${this.renderWeekHeaders()} ${this.renderDates()}`;
//   }
// }

declare global {
  interface HTMLElementTagNameMap {
    'igc-days-view': IgcDaysViewComponent;
  }
}
