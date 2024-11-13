import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import { watch } from '../common/decorators/watch.js';
import { first } from '../common/util.js';
import { convertToDate, convertToDates, getWeekDayNumber } from './helpers.js';
import { CalendarDay } from './model.js';
import type { DateRangeDescriptor, WeekDays } from './types.js';

@blazorIndirectRender
@blazorDeepImport
export class IgcCalendarBaseComponent extends LitElement {
  private _initialActiveDateSet = false;

  protected get _hasValues() {
    return this._values && this._values.length > 0;
  }

  protected get _isSingle() {
    return this.selection === 'single';
  }

  protected get _isMultiple() {
    return this.selection === 'multiple';
  }

  protected get _isRange() {
    return this.selection === 'range';
  }

  @state()
  protected _rangePreviewDate?: CalendarDay;

  @state()
  protected _firstDayOfWeek = 0;

  @state()
  protected _activeDate = CalendarDay.today;

  @state()
  protected _value: CalendarDay | null = null;

  @state()
  protected _values: CalendarDay[] = [];

  @state()
  protected _specialDates: DateRangeDescriptor[] = [];

  @state()
  protected _disabledDates: DateRangeDescriptor[] = [];

  /* blazorSuppress */
  /**
   * The current value of the calendar.
   * Used when selection is set to single
   *
   * @attr value
   */
  @property({ converter: convertToDate })
  public set value(value: Date | string | null | undefined) {
    const converted = convertToDate(value);
    this._value = converted ? CalendarDay.from(converted) : null;
  }

  public get value(): Date | null {
    return this._value ? this._value.native : null;
  }

  /* blazorSuppress */
  /**
   * The current values of the calendar.
   * Used when selection is set to multiple of range.
   *
   * @attr values
   */
  @property({ converter: convertToDates })
  public set values(values: (Date | string)[] | string | null | undefined) {
    const converted = convertToDates(values);
    this._values = converted ? converted.map((v) => CalendarDay.from(v)) : [];
  }

  public get values(): Date[] {
    return this._values ? this._values.map((v) => v.native) : [];
  }

  /* blazorSuppress */
  /** Get/Set the date which is shown in view and is highlighted. By default it is the current date. */
  @property({ attribute: 'active-date', converter: convertToDate })
  public set activeDate(value: Date | string | null | undefined) {
    this._initialActiveDateSet = true;
    const converted = convertToDate(value);
    this._activeDate = converted
      ? CalendarDay.from(converted)
      : CalendarDay.today;
  }

  public get activeDate(): Date {
    return this._activeDate.native;
  }

  /**
   * Sets the type of selection in the component.
   * @attr selection
   */
  @property()
  public selection: 'single' | 'multiple' | 'range' = 'single';

  /**
   * Whether to show the week numbers.
   * @attr show-week-numbers
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * Gets/Sets the first day of the week.
   * @attr week-start
   */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  /**
   * Gets/Sets the locale used for formatting and displaying the dates in the component.
   * @attr locale
   */
  @property()
  public locale = 'en';

  /** Gets/Sets the special dates for the component. */
  @property({ attribute: false })
  public set specialDates(value: DateRangeDescriptor[]) {
    this._specialDates = value ?? [];
  }

  public get specialDates(): DateRangeDescriptor[] | undefined {
    return this._specialDates.length ? this._specialDates : undefined;
  }

  /** Gets/Sets the disabled dates for the component. */
  @property({ attribute: false })
  public set disabledDates(value: DateRangeDescriptor[]) {
    this._disabledDates = value ?? [];
  }

  public get disabledDates(): DateRangeDescriptor[] | undefined {
    return this._disabledDates.length ? this._disabledDates : undefined;
  }

  @watch('weekStart')
  protected weekStartChanged() {
    this._firstDayOfWeek = getWeekDayNumber(this.weekStart);
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected selectionChanged() {
    this._rangePreviewDate = undefined;
    this._value = null;
    this._values = [];
  }

  protected override firstUpdated() {
    if (this._initialActiveDateSet) {
      return;
    }

    if (this._isSingle) {
      this.activeDate = this.value ?? this.activeDate;
    } else {
      this.activeDate = first(this.values) ?? this.activeDate;
    }
  }
}
