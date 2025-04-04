import { LitElement, type TemplateResult, html, nothing } from 'lit';
import {
  property,
  query,
  queryAll,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import {
  calendarRange,
  convertToDate,
  convertToDateRange,
} from '../calendar/helpers.js';
import { toCalendarDay } from '../calendar/model.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  type WeekDays,
} from '../calendar/types.js';
import IgcChipComponent from '../chip/chip.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from '../common/i18n/calendar.resources.js';
import { IgcBaseComboBoxLikeComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  type FormValue,
  createFormValueState,
  defaultDateRangeTransformers,
} from '../common/mixins/forms/form-value.js';
import {
  createCounter,
  findElementFromEventPath,
  last,
} from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './date-range-picker.base.css.js';
import type { DateRangePredefinedType } from './date-range-util.js';
import { selectDateRange } from './date-range-util.js';
import { dateRangePickerValidators } from './validators.js';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}
export interface IgcDateRangePickerComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<DateRangeValue | null>;
  igcInput: CustomEvent<DateRangeValue | null>;
}

/**
 * The igc-date-range-picker allows the user to select a range of dates.
 *
 * @element igc-date-range-picker
 *
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 *
 */

const formats = new Set(['short', 'medium', 'long', 'full']);

@blazorAdditionalDependencies(
  'IgcCalendarComponent, IgcDateTimeInputComponent, IgcDialogComponent, IgcIconComponent, IgcChipComponent, IgcInputComponent'
)
export default class IgcDateRangePickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDateRangePickerComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-date-range-picker';
  public static styles = [styles]; // poc styles, TODO

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected inputId = `date-range-picker-${IgcDateRangePickerComponent.increment()}`;

  protected override get __validators() {
    return dateRangePickerValidators;
  }

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDateRangePickerComponent,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcInputComponent,
      IgcFocusTrapComponent,
      IgcIconComponent,
      IgcChipComponent,
      IgcPopoverComponent,
      IgcDialogComponent,
      IgcValidationContainerComponent
    );
  }

  private _activeDate: Date | null = null;
  private _min: Date | null = null;
  private _max: Date | null = null;
  private _disabledDates?: DateRangeDescriptor[];
  private _dateConstraints?: DateRangeDescriptor[];
  private _displayFormat?: string;
  private _inputFormat?: string;
  private _placeholder?: string;
  private _defaultMask!: string;
  private _currentValue: DateRangeValue | null = null;
  private _startDate!: Date | null;
  private _endDate!: Date | null;
  private _swapDatesFlag = false;

  @state()
  private _maskedRangeValue = '';

  private get isDropDown() {
    return this.mode === 'dropdown';
  }

  @queryAll(IgcDateTimeInputComponent.tagName)
  private _inputs!: IgcDateTimeInputComponent[];

  @query(IgcInputComponent.tagName)
  private _input!: IgcInputComponent;

  @query(IgcCalendarComponent.tagName)
  private _calendar!: IgcCalendarComponent;

  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'actions' })
  private actions!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'header-date' })
  private headerDateSlotItems!: Array<HTMLElement>;

  protected override _formValue: FormValue<DateRangeValue | null>;

  @property({ converter: convertToDateRange })
  public set value(value: DateRangeValue | string | null | undefined) {
    const converted = convertToDateRange(value);
    this._startDate = converted?.start ?? null;
    this._endDate = converted?.end ?? null;
    this.setCalendarRangeValues();
    this.updateMaskedRangeValue();

    this._formValue.setValueAndFormState(converted);
    this._validate();
  }

  public get value(): DateRangeValue | null {
    if (!this._formValue.value) {
      return { start: null, end: null }; // TODO what should the default value be? null?
    }

    return this._formValue.value;
  }

  /**
   * Determines whether the calendar is opened in a dropdown or a modal dialog
   * @attr mode
   */
  @property()
  public mode: 'dropdown' | 'dialog' = 'dropdown';

  /**
   * Use a single input to display the date range values. Makes the input non-editable.
   * @attr single-input
   */
  @property({ type: Boolean, reflect: true, attribute: 'single-input' })
  public singleInput = false;

  /**
   * Makes the control a readonly field.
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * Whether to allow typing in the input.
   * @attr non-editable
   */
  @property({ type: Boolean, reflect: true, attribute: 'non-editable' })
  public nonEditable = false;

  /**
   * Whether the control will have outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * Whether the control will show chips with predefined ranges in dialog mode.
   * @attr
   */
  @property({
    reflect: true,
    type: Boolean,
    attribute: 'use-predefined-ranges',
  })
  public usePredefinedRanges = false;

  /**
   * The label of the control (single input).
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * The label attribute of the start input.
   * @attr label-start
   */
  @property({ attribute: 'label-start' })
  public labelStart = '';

  /**
   * The label attribute of the end input.
   * @attr label-end
   */
  @property({ attribute: 'label-end' })
  public labelEnd = '';

  /**
   * The placeholder attribute of the control (single input).
   * @attr
   */
  @property()
  public set placeholder(value: string) {
    this._placeholder = value;
  }

  public get placeholder(): string {
    const rangePlaceholder = this.singleInput
      ? `${this.inputFormat} - ${this.inputFormat}`
      : this.inputFormat;
    return this._placeholder ?? rangePlaceholder;
  }

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format', reflect: false })
  public set displayFormat(value: string) {
    this._displayFormat = value;
    this.updateMaskedRangeValue();
  }

  public get displayFormat(): string {
    return this._displayFormat ?? this.inputFormat;
  }

  /**
   * The date format to apply on the inputs.
   * Defaults to the current locale Intl.DateTimeFormat
   * @attr input-format
   */
  @property({ attribute: 'input-format', reflect: false })
  public set inputFormat(value: string) {
    this._inputFormat = value;
    this.updateMaskedRangeValue();
  }

  public get inputFormat(): string {
    return this._inputFormat ?? this._defaultMask;
  }

  /**
   * The minimum value required for the date range picker to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this.setDateConstraints();
    this._updateValidity();
  }

  public get min(): Date | null {
    return this._min;
  }

  /**
   * The maximum value required for the date range picker to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set max(value: Date | string | null | undefined) {
    this._max = convertToDate(value);
    this.setDateConstraints();
    this._updateValidity();
  }

  public get max(): Date | null {
    return this._max;
  }

  /**
   * The placeholder attribute of the start input.
   * @attr placeholder-start
   */
  @property({ attribute: 'placeholder-start' })
  public placeholderStart = '';

  /**
   * The placeholder attribute of the end input.
   * @attr placeholder-end
   */
  @property({ attribute: 'placeholder-end' })
  public placeholderEnd = '';

  /** The prompt symbol to use for unfilled parts of the mask.
   *  @attr
   */
  @property()
  public prompt = '_';

  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  /**
   * The orientation of the multiple months displayed in the calendar's days view.
   *  @attr
   */
  @property()
  public orientation: 'vertical' | 'horizontal' = 'horizontal';

  /**
   * Determines whether the calendar hides its header.
   * @attr hide-header
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-header' })
  public hideHeader = false;

  /**
   * Gets/Sets the date which is shown in the calendar picker and is highlighted.
   * By default it is the current date.
   */
  @property({ attribute: 'active-date', converter: convertToDate })
  public set activeDate(value: Date | string | null | undefined) {
    this._activeDate = convertToDate(value);
  }

  public get activeDate(): Date {
    return this._activeDate ?? this._calendar?.activeDate;
  }

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  public set disabledDates(dates: DateRangeDescriptor[]) {
    this._disabledDates = dates;
    this.setDateConstraints();
    this._updateValidity();
  }

  public get disabledDates() {
    return this._disabledDates as DateRangeDescriptor[];
  }

  /**
   * Whether to show the number of the week in the calendar.
   * @attr show-week-numbers
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * Controls the visibility of the dates that do not belong to the current month.
   * @attr hide-outside-days
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  /** The resource strings of the calendar. */
  @property({ attribute: false })
  public resourceStrings: IgcCalendarResourceStrings =
    IgcCalendarResourceStringEN;

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  constructor() {
    super();
    this._formValue = createFormValueState<DateRangeValue | null>(this, {
      initialValue: null,
      transformers: defaultDateRangeTransformers,
    });

    this._rootClickController.update({ hideCallback: this.handleClosing });
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    })
      .set([altKey, arrowDown], this.handleAnchorClick)
      .set([altKey, arrowUp], this.onEscapeKey)
      .set(escapeKey, this.onEscapeKey);
  }

  protected override firstUpdated() {
    this.setCalendarRangeValues();
    this.delegateInputsValidity();
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this._startDate = this._formValue.defaultValue?.start ?? null;
    this._endDate = this._formValue.defaultValue?.end ?? null;

    this.setCalendarRangeValues();

    //this._activeDate = new Date(); reset active date? (date-picker does not)
    this.updateMaskedRangeValue();
  }

  // delegate the inputs validity state to the date-range-picker
  private delegateInputsValidity() {
    const inputs = this.singleInput ? [this._input] : this._inputs;

    inputs.forEach((input) => {
      input.checkValidity = () => this.checkValidity();
      input.reportValidity = () => this.reportValidity();
    });
  }

  private setDateConstraints() {
    const dates: DateRangeDescriptor[] = [];
    if (this._min) {
      dates.push({
        type: DateRangeType.Before,
        dateRange: [this._min],
      });
      if (this._inputs[0] && this._inputs[1]) {
        this._inputs[0].min = this._min;
        this._inputs[1].min = this._min;
      }
    }
    if (this._max) {
      dates.push({
        type: DateRangeType.After,
        dateRange: [this._max],
      });
      if (this._inputs[0] && this._inputs[1]) {
        this._inputs[0].max = this._max;
        this._inputs[1].max = this._max;
      }
    }
    if (this._disabledDates?.length) {
      dates.push(...this.disabledDates);
    }

    this._dateConstraints = dates.length ? dates : undefined;
  }

  protected handleClosing() {
    this._hide(true);
  }

  protected handleDialogClosing(event: Event) {
    event.stopPropagation();
    this._hide(true);
  }

  protected setDateRange(rangeType: DateRangePredefinedType) {
    [this._startDate, this._endDate] = selectDateRange(rangeType);
    this.setCalendarRangeValues();
    this.value = { start: this._startDate, end: this._endDate };
    this.emitEvent('igcChange', { detail: this.value ?? undefined });
  }

  protected revertValue() {
    this.value = this._currentValue;
  }

  protected dialogCancel() {
    this.revertValue();
    this._hide(true);
  }

  protected dialogDone() {
    this.emitEvent('igcChange', { detail: this.value ?? undefined });
    this._hide(true);
  }

  protected handleDialogClosed(event: Event) {
    event.stopPropagation();
  }

  protected async handleInputEvent(event: CustomEvent<Date | null>) {
    event.stopPropagation();
    this._swapDatesFlag = true;
    if (this.nonEditable) {
      event.preventDefault();
      return;
    }
    const newValue = (event.target as IgcDateTimeInputComponent).value;

    if (event.target === this._inputs[0]) {
      this._startDate = newValue;
    } else {
      this._endDate = newValue;
    }

    this.value = { start: this._startDate, end: this._endDate };
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected handleInputChangeEvent(event: CustomEvent<Date | null>) {
    event.stopPropagation();
    this._swapDatesFlag = false;
    const newValue = (event.target as IgcDateTimeInputComponent).value;
    if (event.target === this._inputs[0]) {
      this._startDate = newValue;
    } else {
      this._endDate = newValue;
    }

    this.setCalendarRangeValues();
    this.value = { start: this._startDate, end: this._endDate };
    this.emitEvent('igcChange', { detail: this.value ?? undefined });
  }

  @watch('open')
  protected openChange() {
    this._rootClickController.update();

    if (this.open && this.mode === 'dialog') {
      this._currentValue = this.value ? { ...this.value } : null;
    }
  }

  @watch('locale')
  protected updateDefaultMask(): void {
    this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
    if (this._inputs[0] && this._inputs[1]) {
      this._inputs[0].locale = this.locale;
    }
    this.updateMaskedRangeValue();
  }

  @watch('singleInput')
  protected switchToSingleInput() {
    this.updateMaskedRangeValue();
    this.setCalendarRangeValues();
  }

  @watch('mode')
  protected async modeChanged() {
    if (this.mode === 'dialog') {
      this.keepOpenOnSelect = true;
    }
    await this.setCalendarRangeValues();
  }

  private updateMaskedRangeValue() {
    if (!this.singleInput) {
      return;
    }
    if (!this.value || !this.value.start || !this.value.end) {
      this._maskedRangeValue = '';
      return;
    }
    const format = this.displayFormat || this.inputFormat;
    const { start, end } = this.value;
    let startMask = '';
    let endMask = '';
    if (format) {
      startMask = start
        ? DateTimeUtil.formatDate(start, this.locale, format)
        : '';
      endMask = end ? DateTimeUtil.formatDate(end, this.locale, format) : '';
    } else {
      startMask = start ? start.toLocaleDateString() : '';
      endMask = end ? end.toLocaleDateString() : '';
    }
    this._maskedRangeValue = `${startMask} - ${endMask}`;
  }

  private async setCalendarRangeValues() {
    if (!this._calendar) {
      return;
    }

    if (!this._startDate || !this._endDate) {
      this._calendar.values = null;
      return;
    }

    const calendarDayStart = toCalendarDay(this._startDate);
    const calendarDayEnd = toCalendarDay(this._endDate);

    // dates should not be swapped while typing
    if (!this._swapDatesFlag && calendarDayStart.greaterThan(calendarDayEnd)) {
      this.swapDates();
    }
    if (!calendarDayStart.equalTo(calendarDayEnd)) {
      const range = Array.from(
        calendarRange({ start: this._startDate, end: this._endDate })
      );
      range.push(last(range).add('day', 1));
      await this._calendar.updateComplete;
      this._calendar.values = range.map((d) => d.native);
    } else {
      await this._calendar.updateComplete;
      this._calendar.values = [this._startDate];
    }
  }

  private swapDates() {
    const temp = this._startDate;
    this._startDate = this._endDate;
    this._endDate = temp;
  }

  protected handleFocusIn() {
    this._dirty = true;
  }

  protected handleFocusOut({ relatedTarget }: FocusEvent) {
    if (!this.contains(relatedTarget as Node)) {
      this.checkValidity();
    }
  }

  protected handleInputClick(event: Event) {
    if (findElementFromEventPath('input', event)) {
      // Open only if the click originates from the underlying input
      this.handleAnchorClick();
    }
  }

  protected async onEscapeKey() {
    if (await this._hide(true)) {
      if (this.mode === 'dialog') {
        this.revertValue();
      }
      this._inputs[0].focus();
    }
  }

  protected override async handleAnchorClick() {
    this._calendar.activeDate = this._startDate ?? this._calendar.activeDate;
    super.handleAnchorClick();
    await this.updateComplete;
    this._calendar[focusActiveDate]();
  }

  protected async handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.readOnly) {
      // Wait till the calendar finishes updating and then restore the current value from the date-picker.
      await this._calendar.updateComplete;
      const dateRange = [this.value?.start, this.value?.end];
      this._calendar.values = dateRange?.map((d) => d ?? '');
      return;
    }

    const rangeValues = (event.target as IgcCalendarComponent).values;
    this._startDate = rangeValues[0];
    this._endDate = rangeValues[rangeValues.length - 1];
    this.value = { start: this._startDate, end: this._endDate };

    if (this.isDropDown) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    this._shouldCloseCalendarDropdown();
  }

  protected handlerCalendarIconSlotPointerDown(event: PointerEvent) {
    event.preventDefault();
  }

  private async _shouldCloseCalendarDropdown() {
    if (
      !this.keepOpenOnSelect &&
      this._calendar.values.length > 1 &&
      (await this._hide(true))
    ) {
      if (this.singleInput) {
        this._input.focus();
      } else {
        this._inputs[0].focus();
        this._inputs[0].select();
      }
    }
  }

  /** Clears the input parts of the component of any user input */
  public clear() {
    this.value = null;
    this._activeDate = this._startDate ?? new Date();
    this._inputs[0]?.clear();
    this._inputs[1]?.clear();
  }

  private renderClearIcon(picker: 'start' | 'end' = 'start') {
    return !this.value || (this.value.start === null && this.value.end === null)
      ? nothing
      : html`
          <span slot="suffix" part="${picker}-clear-icon" @click=${this.clear}>
            <slot name="${picker}-clear-icon">
              <igc-icon
                name="input_clear"
                collection="default"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        `;
  }

  private renderCalendarIcon(picker: 'start' | 'end' = 'start') {
    const defaultIcon = html`
      <igc-icon name="today" collection="default" aria-hidden="true"></igc-icon>
    `;

    const state = this.open
      ? `${picker}-calendar-icon-open`
      : `${picker}-calendar-icon`;

    return html`
      <span
        slot="prefix"
        part=${state}
        @pointerdown=${this.handlerCalendarIconSlotPointerDown}
        @click=${this.handleAnchorClick}
      >
        <slot name=${state}>${defaultIcon}</slot>
      </span>
    `;
  }

  private renderCalendarSlots() {
    if (this.isDropDown) {
      return nothing;
    }

    const hasHeaderDate = this.headerDateSlotItems.length ? 'header-date' : '';

    return html`
      <slot name="title" slot="title">
        ${this.resourceStrings.selectDate}
      </slot>
      <slot name="header-date" slot=${hasHeaderDate}></slot>
    `;
  }

  private renderCalendar(id: string) {
    const hideHeader = this.isDropDown ? true : this.hideHeader;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role="dialog"
        .inert=${!this.open || this.disabled}
        ?show-week-numbers=${this.showWeekNumbers}
        ?hide-outside-days=${this.hideOutsideDays}
        ?hide-header=${hideHeader}
        .activeDate=${this.activeDate ?? this._startDate}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${2}
        .disabledDates=${this._dateConstraints!}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
        selection="range"
        @igcChange=${this.handleCalendarChangeEvent}
        exportparts="header, header-title, header-date, content: calendar-content, navigation, months-navigation,
          years-navigation, years-range, navigation-buttons, navigation-button, days-view-container,
          days-view, months-view, years-view, days-row, label: calendar-label, week-number, week-number-inner, date,
          date-inner, first, last, inactive, hidden, weekend, range, special, disabled, single, preview,
          month, month-inner, year, year-inner, selected, current"
      >
        ${this.renderCalendarSlots()}
      </igc-calendar>
    `;
  }

  protected renderActions() {
    const slot = this.isDropDown || !this.actions.length ? undefined : 'footer';

    // If in dialog mode use the dialog footer slot
    return html`
      <div
        part="actions"
        ?hidden=${!this.actions.length}
        slot=${ifDefined(slot)}
      >
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected renderPredefinedRanges() {
    return this.usePredefinedRanges
      ? html`
          <div part="predefined-ranges">
            <igc-chip @click=${() => this.setDateRange('last7Days')}
              >Last 7 Days</igc-chip
            >
            <igc-chip @click=${() => this.setDateRange('currentMonth')}
              >This Month</igc-chip
            >
            <igc-chip @click=${() => this.setDateRange('last30Days')}
              >Last 30 Days</igc-chip
            >
            <igc-chip @click=${() => this.setDateRange('yearToDate')}
              >Year To Date</igc-chip
            >
          </div>
        `
      : nothing;
  }

  protected renderPicker(id: string) {
    return this.isDropDown
      ? html`
          <igc-popover ?open=${this.open} anchor="${id}" flip shift>
            <igc-focus-trap ?disabled=${!this.open || this.disabled}>
              ${this.renderCalendar(id)} ${this.renderActions()}
              ${this.renderPredefinedRanges()}
            </igc-focus-trap>
          </igc-popover>
        `
      : html`
          <igc-dialog
            aria-label=${ifDefined(this.resourceStrings.selectDate)}
            role="dialog"
            ?open=${this.open}
            ?close-on-outside-click=${!this.keepOpenOnOutsideClick}
            hide-default-action
            @igcClosing=${this.handleDialogClosing}
            @igcClosed=${this.handleDialogClosed}
            exportparts="base: dialog-base, title, footer, overlay"
          >
            ${this.renderCalendar(id)} ${this.renderActions()}
            ${this.renderPredefinedRanges()}
            <igc-button slot="footer" @click=${this.dialogCancel} variant="flat"
              >Cancel</igc-button
            >
            <!--TODO: Localize -->
            <igc-button slot="footer" @click=${this.dialogDone} variant="flat"
              >Done</igc-button
            >
          </igc-dialog>
        `;
  }

  private renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected renderInput(id: string, picker: 'start' | 'end' = 'start') {
    const readOnly = !this.isDropDown || this.readOnly || this.nonEditable;
    const placeholder =
      picker === 'start' ? this.placeholderStart : this.placeholderEnd;
    const label = picker === 'start' ? this.labelStart : this.labelEnd;
    const format = formats.has(this._displayFormat!)
      ? `${this._displayFormat}Date`
      : this._displayFormat;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${readOnly}
        .value=${picker === 'start' ? this.value?.start : this.value?.end}
        .locale=${this.locale}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${placeholder}
        label=${label}
        ?invalid=${live(this.invalid)}
        @igcChange=${this.handleInputChangeEvent}
        @igcInput=${this.handleInputEvent}
        @click=${this.isDropDown ? nothing : this.handleInputClick}
        exportparts="input, label, prefix, suffix"
      >
        ${this.renderCalendarIcon(picker)}
        <slot
          name=${picker === 'start' ? 'prefix-start' : 'prefix-end'}
          slot="prefix"
        ></slot>
        ${this.renderClearIcon(picker)}
        <slot
          name=${picker === 'start' ? 'suffix-start' : 'suffix-end'}
          slot="suffix"
        ></slot>
      </igc-date-time-input>
    `;
  }

  private renderInputs(idStart: string, idEnd: string) {
    return html`
      <div part="inputs">
        ${this.renderInput(idStart, 'start')}
        <!-- TODO: localize separator string -->
        <span part="separator">to</span>
        ${this.renderInput(idEnd, 'end')}
      </div>
      ${this.renderPicker(idStart)} ${this.renderHelperText()}
    `;
  }

  private renderSingleInput(id: string) {
    return html`<igc-input
        id=${id}
        aria-haspopup="dialog"
        .value=${this._maskedRangeValue}
        label=${this.label}
        placeholder=${this.placeholder}
        ?readonly=${true}
        ?required=${this.required}
        .outlined=${this.outlined}
        ?invalid=${live(this.invalid)}
        .disabled=${this.disabled}
        @click=${this.isDropDown ? nothing : this.handleInputClick}
        exportparts="input, label, prefix, suffix"
      >
        ${this.renderCalendarIcon()}
        <slot
          name="prefix"
          slot=${ifDefined(!this.prefixes.length ? undefined : 'prefix')}
        ></slot>
        ${this.renderClearIcon()}
        <slot
          name="suffix"
          slot=${ifDefined(!this.suffixes.length ? undefined : 'suffix')}
        ></slot>
      </igc-input>
      ${this.renderHelperText()} ${this.renderPicker(id)}`;
  }

  protected override render() {
    const id = this.id || this.inputId;
    const idStart = `${id}-start`;
    const idEnd = `${id}-end`;
    if (this.singleInput) {
      return this.renderSingleInput(id);
    }
    return this.renderInputs(idStart, idEnd);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-picker': IgcDateRangePickerComponent;
  }
}
