import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import { watch } from '../common/decorators/watch.js';
import {
  dateFromISOString,
  datesFromISOStrings,
  getWeekDayNumber,
} from './helpers.js';
import { CalendarDay } from './model.js';
import type { DateRangeDescriptor } from './types.js';

@blazorIndirectRender
@blazorDeepImport
export class IgcCalendarBaseComponent extends LitElement {
  private _initialActiveDateSet = false;

  protected get _hasValues() {
    return this._values.length > 0;
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
  protected _value?: CalendarDay;

  @state()
  protected _values: CalendarDay[] = [];

  @state()
  protected _specialDates: DateRangeDescriptor[] = [];

  @state()
  protected _disabledDates: DateRangeDescriptor[] = [];

  public get value(): Date | undefined {
    return this._value ? this._value.native : undefined;
  }

  /* blazorSuppress */
  /**
   * The current value of the calendar.
   * Used when selection is set to single
   *
   * @attr value
   */
  @property({ converter: dateFromISOString })
  public set value(value) {
    this._value = value ? CalendarDay.from(value) : undefined;
  }

  public get values(): Date[] {
    return this._values ? this._values.map((v) => v.native) : [];
  }

  /* blazorSuppress */
  /**
   * The current values of the calendar.
   * Used when selection is set to multiple of range.
   *
   * @attr values
   */
  @property({ converter: datesFromISOStrings })
  public set values(values) {
    this._values = values ? values.map((v) => CalendarDay.from(v)) : [];
  }

  public get activeDate(): Date {
    return this._activeDate.native;
  }

  /* blazorSuppress */
  /** Get/Set the date which is shown in view and is highlighted. By default it is the current date. */
  @property({ attribute: 'active-date', converter: dateFromISOString })
  public set activeDate(value) {
    this._initialActiveDateSet = true;
    this._activeDate = value ? CalendarDay.from(value) : CalendarDay.today;
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
  public weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

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
    this._value = undefined;
    this._values = [];
  }

  protected override firstUpdated() {
    if (this._initialActiveDateSet) {
      return;
    }

    if (this._isSingle) {
      this.activeDate = this.value ?? this.activeDate;
    } else {
      this.activeDate = this.values[0] ?? this.activeDate;
    }
  }
}
