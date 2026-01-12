import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorIndirectRender } from '../common/decorators/blazorIndirectRender.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from '../common/i18n/EN/calendar.resources.js';
import { addI18nController } from '../common/i18n/i18n-controller.js';
import { first } from '../common/util.js';
import { convertToDate, convertToDates, getWeekDayNumber } from './helpers.js';
import { CalendarDay } from './model.js';
import type {
  CalendarSelection,
  DateRangeDescriptor,
  WeekDays,
} from './types.js';

@blazorIndirectRender
@blazorDeepImport
export class IgcCalendarBaseComponent extends LitElement {
  protected readonly _i18nController =
    addI18nController<IgcCalendarResourceStrings>(this, {
      defaultEN: IgcCalendarResourceStringEN,
    });

  private _initialActiveDateSet = false;

  protected get _hasValues(): boolean {
    return this._values && this._values.length > 0;
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
   * @attr week-start
   * @default sunday
   */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  /**
   * Gets/Sets the locale used for formatting and displaying the dates in the component.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale() {
    return this._i18nController.locale;
  }

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public set resourceStrings(value: IgcCalendarResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IgcCalendarResourceStrings {
    return this._i18nController.resourceStrings;
  }

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

  /** @internal */
  protected override update(props: PropertyValues<this>): void {
    if (props.has('weekStart')) {
      this._firstDayOfWeek = getWeekDayNumber(this.weekStart);
    }

    if (props.has('selection') && this.hasUpdated) {
      this._rangePreviewDate = undefined;
      this._value = null;
      this._values = [];
    }

    super.update(props);
  }

  /** @internal */
  protected override firstUpdated(): void {
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
