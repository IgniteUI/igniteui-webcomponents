import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAll,
  queryAssignedElements,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import {
  calendarRange,
  convertToDate,
  convertToDates,
} from '../calendar/helpers.js';
import { toCalendarDay } from '../calendar/model.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  type WeekDays,
} from '../calendar/types.js';
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
} from '../common/mixins/forms/form-value.js';
import {
  createCounter,
  findElementFromEventPath,
  last,
} from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';

export interface IgcDateRangePickerComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<(Date | null)[]>;
  igcInput: CustomEvent<(Date | null)[]>;
}

const formats = new Set(['short', 'medium', 'long', 'full']);

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

@blazorAdditionalDependencies(
  'IgcCalendarComponent, IgcDateTimeInputComponent, IgcDialogComponent, IgcIconComponent'
)
export default class IgcDateRangePickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDateRangePickerComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-date-range-picker';

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected inputId = `date-range-picker-${IgcDateRangePickerComponent.increment()}`;

  // TODO: validators

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDateRangePickerComponent,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcFocusTrapComponent,
      IgcIconComponent,
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

  private get isDropDown() {
    return this.mode === 'dropdown';
  }

  @queryAll(IgcDateTimeInputComponent.tagName)
  private _inputs!: IgcDateTimeInputComponent[];

  private _startDate!: Date | null;
  private _endDate!: Date | null;

  @query(IgcCalendarComponent.tagName)
  private _calendar!: IgcCalendarComponent;

  // TODO: do we have prefixes/suffixes/actions for the separate inputs?
  // single input?
  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'actions' })
  private actions!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'header-date' })
  private headerDateSlotItems!: Array<HTMLElement>;

  protected override _formValue: FormValue<(Date | null)[] | null>;

  /**
   * The label of the start date input.
   * @attr label
   */
  @property()
  public labelStart!: string;

  /**
   * The label of the start date input.
   * @attr label
   */
  @property()
  public labelEnd!: string;

  @property({ converter: convertToDates })
  public set value(value: (Date | string | null)[] | null | undefined) {
    if (value && value?.length > 2) {
      return;
    }
    const converted = convertToDates(value?.map((d) => d ?? ''));
    this._startDate = converted?.[0] ?? null;
    this._endDate = converted?.[1] ?? null;
    this.setCalendarRangeValues();
    this._formValue.setValueAndFormState([this._startDate, this._endDate]);
  }

  public get value(): (Date | null)[] | null {
    return this._formValue.value;
  }

  /**
   * Determines whether the calendar is opened in a dropdown or a modal dialog
   * @attr mode
   */
  @property()
  public mode: 'dropdown' | 'dialog' = 'dropdown';

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
   * The placeholder attribute of the start date input.
   * @attr
   */
  @property({ attribute: 'placeholder-start', reflect: false })
  public placeholderStart!: string;

  /**
   * The placeholder attribute of the end date input.
   * @attr
   */
  @property({ attribute: 'placeholder-end', reflect: false })
  public placeholderEnd!: string;

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format', reflect: false })
  public set displayFormat(value: string) {
    this._displayFormat = value;
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
  }

  public get inputFormat(): string {
    return this._inputFormat ?? this._inputs[0]?.inputFormat;
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
   * The number of months displayed in the calendar.
   * @attr visible-months
   */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 2;

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

  @watch('open')
  protected openChange() {
    this._rootClickController.update();
  }

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  constructor() {
    super();
    this._formValue = createFormValueState<(Date | null)[] | null>(this, {
      initialValue: null,
      // TODO
      //transformers: defaultDateTimeTransformers,
    });

    this.value = null;

    this._rootClickController.update({ hideCallback: this.handleClosing });
  }

  protected override firstUpdated() {
    this.setCalendarRangeValues();
  }

  private setDateConstraints() {
    const dates: DateRangeDescriptor[] = [];
    if (this._min) {
      dates.push({
        type: DateRangeType.Before,
        dateRange: [this._min],
      });
    }
    if (this._max) {
      dates.push({
        type: DateRangeType.After,
        dateRange: [this._max],
      });
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

  protected handleDialogClosed(event: Event) {
    event.stopPropagation();
  }

  protected handleInputEvent(
    event: CustomEvent<Date[]>,
    picker: 'start' | 'end'
  ) {
    event.stopPropagation();
    const newValue = (event.target as IgcDateTimeInputComponent).value!;

    if (this.nonEditable) {
      event.preventDefault();
      return;
    }

    const newValues = this.value ? this.value.slice() : [];

    if (picker === 'start' && newValues.length > 1) {
      newValues[0] = newValue;
    } else if (picker === 'end' && newValues.length > 1) {
      newValues[newValues.length - 1] = newValue;
    }

    this.emitEvent('igcInput', { detail: newValues ?? undefined });
  }

  protected handleInputChangeEvent(
    event: CustomEvent<Date[]>,
    picker: 'start' | 'end'
  ) {
    event.stopPropagation();

    if (picker === 'start') {
      this._startDate = (event.target as IgcDateTimeInputComponent).value;
    } else {
      this._endDate = (event.target as IgcDateTimeInputComponent).value;
    }

    if (!this._startDate || !this._endDate) {
      return;
    }

    this.setCalendarRangeValues();
    this.value = [this._startDate, this._endDate];

    this.emitEvent('igcChange', { detail: this.value ?? undefined });
  }

  private swapDates() {
    const temp = this._startDate;
    this._startDate = this._endDate;
    this._endDate = temp;
  }

  private setCalendarRangeValues() {
    if (!this._calendar || !this._startDate || !this._endDate) {
      return;
    }
    const calendarDayStart = toCalendarDay(this._startDate);
    const calendarDayEnd = toCalendarDay(this._endDate);

    if (calendarDayStart.greaterThan(calendarDayEnd)) {
      this.swapDates();
    }
    if (!calendarDayStart.equalTo(calendarDayEnd)) {
      const range = Array.from(
        calendarRange({ start: this._startDate, end: this._endDate })
      );
      range.push(last(range).add('day', 1));
      this._calendar.values = range.map((d) => d.native);
    } else {
      this._calendar.values = [this._startDate];
    }
  }

  protected handleInputClick(event: Event) {
    if (findElementFromEventPath('input', event)) {
      // Open only if the click originates from the underlying input
      this.handleAnchorClick();
    }
  }

  protected override async handleAnchorClick() {
    this._calendar.activeDate = this._startDate ?? this._calendar.activeDate; //TODO

    super.handleAnchorClick();
    await this.updateComplete;
    this._calendar[focusActiveDate]();
  }

  protected async handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.readOnly) {
      // Wait till the calendar finishes updating and then restore the current value from the date-picker.
      await this._calendar.updateComplete;
      this._calendar.values = this.value?.map((d) => d ?? '');
      return;
    }

    const rangeValues = (event.target as IgcCalendarComponent).values;
    this._startDate = rangeValues[0];
    this._endDate = rangeValues[rangeValues.length - 1];
    this.value = [this._startDate, this._endDate];
    this.emitEvent('igcChange', { detail: this.value });

    this._shouldCloseCalendarDropdown();
  }

  private async _shouldCloseCalendarDropdown() {
    if (
      !this.keepOpenOnSelect &&
      this._calendar.values.length > 1 &&
      (await this._hide(true))
    ) {
      this._inputs[0].focus();
      this._inputs[0].select();
    }
  }

  /** Clears the input parts of the component of any user input */
  public clear() {
    this.value = null;
    this._startDate = null;
    this._endDate = null;
    this._calendar.values = null;
    this._inputs.forEach((input) => input.clear());
  }

  private renderClearIcon() {
    return !this.value
      ? nothing
      : html`
          <span slot="suffix" part="clear-icon" @click=${this.clear}>
            <slot name="clear-icon">
              <igc-icon
                name="input_clear"
                collection="default"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        `;
  }

  private renderCalendarIcon() {
    const defaultIcon = html`
      <igc-icon name="today" collection="default" aria-hidden="true"></igc-icon>
    `;

    const state = this.open ? 'calendar-icon-open' : 'calendar-icon';

    return html`
      <span slot="prefix" part=${state} @click=${this.handleAnchorClick}>
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
        .visibleMonths=${this.visibleMonths}
        .locale=${this.locale}
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

  protected renderPicker(id: string) {
    return this.isDropDown
      ? html`
          <igc-popover ?open=${this.open} anchor=${id} flip shift>
            <igc-focus-trap ?disabled=${!this.open || this.disabled}>
              ${this.renderCalendar(id)}
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
            ${this.renderCalendar(id)}${this.renderActions()}
          </igc-dialog>
        `;
  }

  /*
  // should change it later depending on if there are two label properties
  */
  private renderLabel(id: string) {
    return this.value![0]
      ? html`<label
          part="label"
          for=${id}
          @click=${this.isDropDown ? nothing : this.handleAnchorClick}
          >${this.value![0]}</label
        >`
      : nothing;
  }

  protected renderInput(id: string, picker: 'start' | 'end' = 'start') {
    const format = formats.has(this._displayFormat!)
      ? `${this._displayFormat}Date`
      : this._displayFormat;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        label=${picker === 'start' ? this.labelStart : this.labelEnd}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${this.readOnly}
        ?required=${this.required}
        .value=${picker === 'start' ? this._startDate : this._endDate}
        .locale=${this.locale}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${picker === 'start'
          ? this.placeholderStart
          : this.placeholderEnd}
        .min=${this.min}
        .max=${this.max}
        .invalid=${live(this.invalid)}
        @igcChange=${(event: CustomEvent<Date[]>) =>
          this.handleInputChangeEvent(event, picker)}
        @igcInput=${(event: CustomEvent<Date[]>) =>
          this.handleInputEvent(event, picker)}
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
      </igc-date-time-input>
    `;
  }

  protected override render() {
    const id = this.id || this.inputId;
    const idStart = `${id}-start`;
    const idEnd = `${id}-end`;

    return html`
      ${this.renderInput(idStart, 'start')}${this.renderPicker(idStart)}
      <span style="margin-left: 20px; margin-right: 20px">-</span>
      ${this.renderInput(idEnd, 'end')}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-picker': IgcDateRangePickerComponent;
  }
}
