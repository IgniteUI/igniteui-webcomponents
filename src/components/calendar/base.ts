import {
  CalendarResourceStringsEN,
  type ICalendarResourceStrings,
} from 'igniteui-i18n-core';
import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { convertToDate, convertToDates } from '#internals/date/converters.js';
import { CalendarDay, toCalendarDayOrNull } from '#internals/date/model.js';
import { blazorDeepImport } from '#internals/decorators/blazorDeepImport.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import type { IgcCalendarResourceStrings } from '#internals/i18n/EN/calendar.resources.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import { calendarResourcesMap } from '#internals/i18n/utils.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { firstOf } from '#internals/utils/arrays.js';
import {
  dateChanged,
  datesChanged,
  getLocaleWeekStart,
  getWeekDayNumber,
  rangesChanged,
} from './helpers.js';
import { selectDate } from './selection.js';
import type {
  CalendarSelection,
  DateRangeDescriptor,
  WeekDays,
} from './types.js';

const i18n: I18nControllerConfig<
  IgcCalendarResourceStrings | ICalendarResourceStrings
> = {
  defaultEN: CalendarResourceStringsEN,
  resourceMap: calendarResourcesMap,
};

@blazorIndirectRender
@blazorDeepImport
export class IgcCalendarBaseComponent extends I18nMixin<
  IgcCalendarResourceStrings | ICalendarResourceStrings,
  typeof LitElement,
  IgcCalendarResourceStrings & ICalendarResourceStrings
>(LitElement, i18n) {
  private _initialActiveDateSet = false;
  private _weekStart?: WeekDays;

  protected get _hasValues(): boolean {
    return this._values.length > 0;
  }

  /**
   * The index of the first day of the week (Sunday = 0). Derived on access, so it does
   * not depend on the update order of the base class and its descendants.
   */
  protected get _firstDayOfWeek(): number {
    return getWeekDayNumber(this.weekStart);
  }

  protected get _isSingle(): boolean {
    return this.selection === 'single';
  }

  protected get _isMultiple(): boolean {
    return this.selection === 'multiple';
  }

  protected get _isRange(): boolean {
    return this.selection === 'range';
  }

  // An equal day is no change, so a new `Date` of the same day skips the update.
  @state({ hasChanged: dateChanged })
  protected _rangePreviewDate?: CalendarDay;

  @state({ hasChanged: dateChanged })
  protected _activeDate = CalendarDay.today;

  @state({ hasChanged: dateChanged })
  protected _value: CalendarDay | null = null;

  @state({ hasChanged: datesChanged })
  protected _values: CalendarDay[] = [];

  @state({ hasChanged: rangesChanged })
  protected _specialDates: DateRangeDescriptor[] = [];

  @state({ hasChanged: rangesChanged })
  protected _disabledDates: DateRangeDescriptor[] = [];

  /* blazorSuppress */
  /**
   * The current value of the calendar.
   * Used when selection is set to single
   *
   * @attr value
   */
  @property({ converter: convertToDate, hasChanged: dateChanged })
  public set value(value: Date | string | null | undefined) {
    this._value = toCalendarDayOrNull(convertToDate(value));
  }

  public get value(): Date | null {
    return this._value ? this._value.native : null;
  }

  /* blazorSuppress */
  /**
   * The current values of the calendar.
   * Used when selection is set to multiple or range.
   *
   * @attr values
   */
  @property({ converter: convertToDates, hasChanged: datesChanged })
  public set values(values: (Date | string)[] | string | null | undefined) {
    const converted = convertToDates(values);
    this._values = converted ? converted.map((v) => CalendarDay.from(v)) : [];
  }

  public get values(): Date[] {
    return this._values.map((v) => v.native);
  }

  /* blazorSuppress */
  /** Get/Set the date which is shown in view and is highlighted. By default it is the current date. */
  @property({
    attribute: 'active-date',
    converter: convertToDate,
    hasChanged: dateChanged,
  })
  public set activeDate(value: Date | string | null | undefined) {
    this._initialActiveDateSet = true;
    this._activeDate =
      toCalendarDayOrNull(convertToDate(value)) ?? CalendarDay.today;
  }

  public get activeDate(): Date {
    return this._activeDate.native;
  }

  /**
   * Sets the type of selection in the component.
   * @attr selection
   * @default single
   */
  @property()
  public selection: CalendarSelection = 'single';

  /**
   * Whether to show the week numbers.
   * @attr show-week-numbers
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * Gets/Sets the first day of the week.
   *
   * @remarks
   * When not set, the week starts on the first day of the week of the current {@link locale}.
   * Setting `undefined` returns to the locale value.
   * @attr week-start
   */
  @property({ attribute: 'week-start' })
  public set weekStart(value: WeekDays | undefined) {
    this._weekStart = value ?? undefined;
  }

  public get weekStart(): WeekDays {
    return this._weekStart ?? getLocaleWeekStart(this.locale);
  }

  /**
   * Gets/Sets the special dates for the component.
   *
   * @remarks
   * Returns `undefined` when no dates are set, which the setter accepts as well so that
   * a round trip through the property is valid.
   */
  @property({ attribute: false })
  public set specialDates(value: DateRangeDescriptor[] | undefined) {
    this._specialDates = value ?? [];
  }

  public get specialDates(): DateRangeDescriptor[] | undefined {
    return this._specialDates.length ? this._specialDates : undefined;
  }

  /**
   * Gets/Sets the disabled dates for the component.
   *
   * @remarks
   * Returns `undefined` when no dates are set, which the setter accepts as well so that
   * a round trip through the property is valid.
   */
  @property({ attribute: false })
  public set disabledDates(value: DateRangeDescriptor[] | undefined) {
    this._disabledDates = value ?? [];
  }

  public get disabledDates(): DateRangeDescriptor[] | undefined {
    return this._disabledDates.length ? this._disabledDates : undefined;
  }

  /** @internal Applies the activation of `day` to the selection and returns whether it changed. */
  protected _selectDate(day: CalendarDay): boolean {
    const selection = selectDate(
      { value: this._value, values: this._values },
      day,
      { selection: this.selection, disabledDates: this._disabledDates }
    );

    if (!selection) {
      return false;
    }

    this._value = selection.value;
    this._values = selection.values;
    return true;
  }

  /** @internal */
  protected override update(props: PropertyValues): void {
    if (props.has('selection') && this.hasUpdated) {
      this._rangePreviewDate = undefined;
      this._value = null;
      this._values = [];
    }

    super.update(props);
  }

  protected override willUpdate(props: PropertyValues): void {
    super.willUpdate(props);

    if (this.hasUpdated || this._initialActiveDateSet) {
      return;
    }

    const value = this._isSingle ? this._value : firstOf(this._values);

    if (value) {
      this._activeDate = value;
    }
  }
}
