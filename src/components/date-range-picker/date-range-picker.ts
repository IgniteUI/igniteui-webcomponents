import {
  CalendarResourceStringsEN,
  DateRangePickerResourceStringsEN,
  getDateFormatter,
  type ICalendarResourceStrings,
  type IDateRangePickerResourceStrings,
} from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { convertToDateRange } from '#internals/date/converters.js';
import { CalendarDay } from '#internals/date/model.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { IgcDateRangePickerResourceStrings } from '#internals/i18n/EN/date-range-picker.resources.js';
import {
  addI18nController,
  getDateTimeFormat,
  getDefaultDateTimeFormat,
} from '#internals/i18n/i18n-controller.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueDateRangeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { bindIf } from '#internals/utils/lit.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import type IgcCalendarComponent from '../calendar/calendar.js';
import type { CalendarSelection } from '../calendar/types.js';
import {
  IgcDatePickerBaseComponent,
  type IgcPickerBaseEventMap,
  pickerDependencies,
} from '../date-picker/date-picker.base.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DateRangeValue } from '../types.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import { DateRangePosition } from './date-range-mask-parser.js';
import { styles } from './date-range-picker.base.css.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';
import { styles as shared } from './themes/shared/date-range-picker.common.css.js';
import { all } from './themes/themes.js';
import { dateRangeValidators, isCompleteDateRange } from './validators.js';

export type { DateRangeValue } from '../types.js';

/* jsonAPIPlainObject */
/** A predefined date range with label for {@link IgcDateRangePickerComponent.customRanges} */
export interface CustomDateRange {
  label: string;
  dateRange: DateRangeValue;
}

export type IgcDateRangePickerComponentEventMap =
  IgcPickerBaseEventMap<DateRangeValue>;

export type DateRangePickerResourceStringsType =
  IDateRangePickerResourceStrings & ICalendarResourceStrings;

const nextId = createIdGenerator('date-range-picker');
const Slots = setSlots(
  'prefix',
  'prefix-start',
  'prefix-end',
  'suffix',
  'suffix-start',
  'suffix-end',
  'helper-text',
  'bad-input',
  'value-missing',
  'range-overflow',
  'range-underflow',
  'custom-error',
  'invalid',
  'title',
  'header-date',
  'clear-icon',
  'clear-icon-start',
  'clear-icon-end',
  'calendar-icon',
  'calendar-icon-start',
  'calendar-icon-end',
  'calendar-icon-open',
  'calendar-icon-open-start',
  'calendar-icon-open-end',
  'actions',
  'separator'
);

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * The Date Range Picker includes a text input and a calendar pop-up, allowing users to easily select start and end dates.
 *
 * @element igc-date-range-picker
 *
 * @slot prefix - Renders content before the input (single input).
 * @slot prefix-start - Renders content before the start input (two inputs).
 * @slot prefix-end - Renders content before the end input (two inputs).
 * @slot suffix - Renders content after the input (single input).
 * @slot suffix-start - Renders content after the start input (single input).
 * @slot suffix-end - Renders content after the end input (single input).
 * @slot helper-text - Renders content below the input.
 * @slot bad-input - Renders content when the value is in the disabledDates ranges.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 * @slot title - Renders content in the calendar title.
 * @slot header-date - Renders content instead of the current date/range in the calendar header.
 * @slot clear-icon - Renders a clear icon template.
 * @slot clear-icon-start - Renders a clear icon template for the start input (two inputs).
 * @slot clear-icon-end - Renders a clear icon template for the end input (two inputs).
 * @slot calendar-icon - Renders the icon/content for the calendar picker.
 * @slot calendar-icon-start - Renders the icon/content for the calendar picker for the start input (two inputs).
 * @slot calendar-icon-end - Renders the icon/content for the calendar picker for the end input (two inputs).
 * @slot calendar-icon-open - Renders the icon/content for the picker in open state.
 * @slot calendar-icon-open-start - Renders the icon/content for the picker in open state for the start input (two inputs).
 * @slot calendar-icon-open-end - Renders the icon/content for the picker in open state for the end input (two inputs).
 * @slot actions - Renders content in the action part of the picker in open state.
 * @slot separator - Renders the separator element between the two inputs.
 *
 * @fires igcOpening - Emitted just before the calendar popover is shown.
 * @fires igcOpened - Emitted after the calendar popover is shown.
 * @fires igcClosing - Emitted just before the calendar popover is hidden.
 * @fires igcClosed - Emitted after the calendar popover is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 *
 * @csspart separator - The separator element between the two inputs.
 * @csspart ranges - The wrapper that renders the custom and predefined ranges.
 * @csspart label - The label wrapper that renders content above the target input.
 * @csspart calendar-icon - The calendar icon wrapper for closed state (single input).
 * @csspart calendar-icon-start - The calendar icon wrapper for closed state for the start input (two inputs).
 * @csspart calendar-icon-end - The calendar icon wrapper for closed state for the end input (two inputs).
 * @csspart calendar-icon-open - The calendar icon wrapper for opened state (single input).
 * @csspart calendar-icon-open-start - The calendar icon wrapper for opened state for the start input (two inputs).
 * @csspart calendar-icon-open-end - The calendar icon wrapper for opened state for the end input (two inputs).
 * @csspart clear-icon - The clear icon wrapper (single input).
 * @csspart clear-icon-start - The clear icon wrapper for the start input (two inputs).
 * @csspart clear-icon-end - The clear icon wrapper for the end input (two inputs).
 * @csspart actions - The wrapper for the custom actions area.
 * @csspart clear-icon - The clear icon wrapper.
 * @csspart input - The native input element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper-text wrapper that renders content below the target input.
 * @csspart header - The calendar header element.
 * @csspart header-title - The calendar header title element.
 * @csspart header-date - The calendar header date element.
 * @csspart calendar-content - The calendar content element which contains the views and navigation elements.
 * @csspart navigation - The calendar navigation container element.
 * @csspart months-navigation - The calendar months navigation button element.
 * @csspart years-navigation - The calendar years navigation button element.
 * @csspart years-range - The calendar years range element.
 * @csspart navigation-buttons - The calendar navigation buttons container.
 * @csspart navigation-button - The calendar previous/next navigation button.
 * @csspart days-view-container - The calendar days view container element.
 * @csspart days-view - The calendar days view element.
 * @csspart months-view - The calendar months view element.
 * @csspart years-view - The calendar years view element.
 * @csspart days-row - The calendar days row element.
 * @csspart calendar-label - The calendar week header label element.
 * @csspart week-number - The calendar week number element.
 * @csspart week-number-inner - The calendar week number inner element.
 * @csspart date - The calendar date element.
 * @csspart date-inner - The calendar date inner element.
 * @csspart first - The calendar first selected date element in range selection.
 * @csspart last - The calendar last selected date element in range selection.
 * @csspart inactive - The calendar inactive date element.
 * @csspart hidden - The calendar hidden date element.
 * @csspart weekend - The calendar weekend date element.
 * @csspart range - The calendar range selected element.
 * @csspart special - The calendar special date element.
 * @csspart disabled - The calendar disabled date element.
 * @csspart single - The calendar single selected date element.
 * @csspart preview - The calendar range selection preview date element.
 * @csspart month - The calendar month element.
 * @csspart month-inner - The calendar month inner element.
 * @csspart year - The calendar year element.
 * @csspart year-inner - The calendar year inner element.
 * @csspart selected - The calendar selected state for element(s). Applies to date, month and year elements.
 * @csspart current - The calendar current state for element(s). Applies to date, month and year elements.
 */
@blazorAdditionalDependencies(
  'IgcCalendarComponent, IgcDateTimeInputComponent, IgcDialogComponent, IgcIconComponent, IgcChipComponent, IgcInputComponent'
)
@shadowOptions({ delegatesFocus: true })
export default class IgcDateRangePickerComponent extends EventEmitterMixin<
  IgcDateRangePickerComponentEventMap,
  AbstractConstructor<IgcDatePickerBaseComponent<DateRangeValue>>
>(IgcDatePickerBaseComponent) {
  public static readonly tagName = 'igc-date-range-picker';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDateRangePickerComponent,
      IgcDateRangeInputComponent,
      IgcDateTimeInputComponent,
      IgcPredefinedRangesAreaComponent,
      ...pickerDependencies
    );
  }

  // #region Internal state & properties

  protected override get __validators() {
    return dateRangeValidators;
  }

  protected override readonly _inputId = nextId();
  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  /**
   * For now we use the core validation strings internally only, to avoid mixing with old resources by users.
   * To Do: Update resourceStrings type when the IgcDateRangePickerResourceStrings is changed to IDateRangePickerResourceStrings
   */
  protected override readonly _i18nController = addI18nController<
    IgcDateRangePickerResourceStrings | DateRangePickerResourceStringsType
  >(this, {
    defaultEN: Object.assign(
      {},
      DateRangePickerResourceStringsEN,
      CalendarResourceStringsEN
    ),
    resourceMapName: 'date-range-picker',
    onResourceChange: this._updateDefaultMask,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override _visibleMonths = 2;

  private _localeDisplayFormat!: string;
  private _defaultMask!: string;
  private _placeholder?: string;

  /** The range reflected in the calendar, committed or still being typed. */
  @state()
  private _calendarRange: Date[] | null = null;

  @queryAll(IgcDateTimeInputComponent.tagName)
  private readonly _inputs!: IgcDateTimeInputComponent[];

  @query(IgcDateRangeInputComponent.tagName)
  private readonly _input!: IgcDateRangeInputComponent;

  private get _firstDefinedInRange(): Date | null {
    return this.value?.start ?? this.value?.end ?? null;
  }

  // #endregion

  // #region Base class hooks

  protected override get _value(): DateRangeValue | null {
    return this.value;
  }

  protected override set _value(value: DateRangeValue | null) {
    this.value = value;
  }

  protected override get _hasValue(): boolean {
    return this._firstDefinedInRange !== null;
  }

  protected override get _calendarSelection(): CalendarSelection {
    return 'range';
  }

  protected override get _calendarValues(): Date[] | null {
    return this._calendarRange;
  }

  protected override get _defaultActiveDate(): Date | null {
    return this._firstDefinedInRange;
  }

  protected override get _selectDateLabel(): string | undefined {
    return this.resourceStrings.calendar_select_date;
  }

  protected override get _defaultDisplayFormat(): string | undefined {
    return this._inputFormat ?? this._localeDisplayFormat;
  }

  protected override get _defaultInputFormat(): string | undefined {
    return this._defaultMask;
  }

  protected override get _labelTarget() {
    // Forward the host's associated labels only to the start input.
    return this._input ?? this._inputs?.[0] ?? null;
  }

  protected override _focusInput(): void {
    this.useTwoInputs ? this._inputs[0].focus() : this._input.focus();
  }

  protected override _focusAndSelectInput(): void {
    this.useTwoInputs ? this._inputs[0].select() : this._input.focus();
  }

  protected override _canCloseOnSelect(): boolean {
    return this._calendar.values.length > 1;
  }

  protected override _handleDismiss(): void {
    if (!this._isDropDown) {
      this._revertValue();
    }
  }

  protected override _syncCalendarOnToggle(): void {
    this._setCalendarActiveDateAndViewIndex();
  }

  protected override _clearEditors(): void {
    if (this.useTwoInputs) {
      this._inputs[0]?.clear();
      this._inputs[1]?.clear();
    } else {
      this._input?.clear();
    }
  }

  protected override _onDialogClosing(): void {
    this._emitChangeIfDirty();
  }

  // #endregion

  // #region General properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false, true) */
  /**
   * The value of the picker
   * @attr
   */
  @property({ converter: convertToDateRange })
  public set value(value: DateRangeValue | string | null | undefined) {
    this._formValue.setValueAndFormState(convertToDateRange(value));
    this._setCalendarRangeValues();
  }

  public get value(): DateRangeValue | null {
    return this._formValue.value;
  }

  /**
   * The number of months displayed in the calendar.
   * @attr visible-months
   * @default 2
   */
  @property({ type: Number, attribute: 'visible-months' })
  public override set visibleMonths(value: number) {
    this._visibleMonths = clamp(asNumber(value, 2), 1, 2);
  }

  public override get visibleMonths(): number {
    return this._visibleMonths;
  }

  /**
   * Renders chips with custom ranges based on the elements of the array.
   */
  @property({ attribute: false })
  public customRanges: CustomDateRange[] = [];

  /**
   * Use two inputs to display the date range values. Makes the input editable in dropdown mode.
   * @attr use-two-inputs
   */
  @property({ type: Boolean, reflect: true, attribute: 'use-two-inputs' })
  public useTwoInputs = false;

  /**
   * Whether the control will show chips with predefined ranges.
   * @attr
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'use-predefined-ranges',
  })
  public usePredefinedRanges = false;

  /** The resource strings of the date range picker. */
  @property({ attribute: false })
  public set resourceStrings(
    value:
      IgcDateRangePickerResourceStrings | DateRangePickerResourceStringsType
  ) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IgcDateRangePickerResourceStrings &
    DateRangePickerResourceStringsType {
    return this._i18nController.resourceStrings;
  }

  // #endregion

  // #region Input-related properties

  /**
   * The label of the start input.
   * @attr label-start
   */
  @property({ attribute: 'label-start' })
  public labelStart = '';

  /**
   * The label of the end input.
   * @attr label-end
   */
  @property({ attribute: 'label-end' })
  public labelEnd = '';

  /**
   * The placeholder text of the control (single input).
   * @attr
   */
  @property()
  public set placeholder(value: string) {
    this._placeholder = value;
  }

  public get placeholder(): string {
    const rangePlaceholder = `${this.inputFormat} - ${this.inputFormat}`;
    return this._placeholder ?? rangePlaceholder;
  }

  /**
   * The placeholder text of the start input.
   * @attr placeholder-start
   */
  @property({ attribute: 'placeholder-start' })
  public placeholderStart = '';

  /**
   * The placeholder text of the end input.
   * @attr placeholder-end
   */
  @property({ attribute: 'placeholder-end' })
  public placeholderEnd = '';

  // #endregion

  // #region Life-cycle hooks

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('locale')) {
      this._updateDefaultMask();
    }

    if (changedProperties.has('mode') && !this._isDropDown) {
      this.keepOpenOnSelect = true;
    }

    // The editors are swapped by the render below, so both the range and the
    // delegated validity are re-applied once the new ones are in place.
    if (changedProperties.has('useTwoInputs')) {
      this._syncEditors();
    } else if (changedProperties.has('mode')) {
      this._syncCalendarRange();
    }
  }

  protected override firstUpdated() {
    this._delegateInputsValidity();
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this._setCalendarRangeValues();
  }

  // #endregion

  // #region Public API methods

  /* blazorSuppress */
  /** @internal */
  public hasDateParts(): boolean {
    return this.useTwoInputs
      ? this._inputs[0].hasDateParts()
      : this._input.hasDateParts();
  }

  /* blazorSuppress */
  /** @internal */
  public hasTimeParts(): boolean {
    return this.useTwoInputs
      ? this._inputs[0].hasTimeParts()
      : this._input.hasTimeParts();
  }

  /** Selects a date range value in the picker */
  public select(value: DateRangeValue | null): void {
    this._select(value);
  }

  // #endregion

  // #region Event handlers

  protected _dialogCancel() {
    this._revertValue();
    this._hide(true);
  }

  protected _dialogDone() {
    this._emitChangeIfDirty();
    this._hide(true);
  }

  protected _handleInput(event: CustomEvent<string>) {
    event.stopPropagation();
    if (this.nonEditable) {
      event.preventDefault();
      return;
    }

    const input = event.target as IgcDateTimeInputComponent;
    const draft = input._uncommittedValue;
    const newValue = draft ? CalendarDay.from(draft).native : null;
    const range = this._getUpdatedDateRange(input, newValue);

    this._setCalendarRangeValues(range);
    this._calendar.activeDate =
      newValue ?? range.start ?? range.end ?? this._calendar.activeDate;

    this.emitEvent('igcInput', { detail: range });
  }

  protected _handleInputChange(event: CustomEvent<Date | null>) {
    event.stopPropagation();

    const input = event.target as IgcDateTimeInputComponent;
    const newValue = input.value ? CalendarDay.from(input.value).native : null;

    this._commitRange(this._getUpdatedDateRange(input, newValue));
  }

  protected async _handleDateRangeInput(event: CustomEvent<string>) {
    event.stopPropagation();
    if (this.nonEditable) {
      event.preventDefault();
      return;
    }

    const input = event.target as IgcDateRangeInputComponent;
    const draft = input._uncommittedValue;

    this._setCalendarRangeValues(draft);
    this._calendar.activeDate = draft?.start;

    this.emitEvent('igcInput', { detail: draft });
  }

  protected _handleDateRangeInputChange(
    event: CustomEvent<DateRangeValue | null>
  ) {
    event.stopPropagation();

    this._commitRange((event.target as IgcDateRangeInputComponent).value);
  }

  protected override async _handleCalendarChangeEvent(
    event: CustomEvent<Date>
  ) {
    event.stopPropagation();
    this._setTouchedState();

    if (this.readOnly) {
      // The calendar has moved away from the range we hold on its own, so the binding
      // has nothing to re-commit. Push the current range back onto it directly.
      await this._calendar.updateComplete;
      this._calendar.values = this._calendarRange;
      return;
    }

    const rangeValues = (event.target as IgcCalendarComponent).values;
    this.value = {
      start: rangeValues[0],
      end: rangeValues[rangeValues.length - 1],
    };

    if (this._isDropDown) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    this._shouldCloseCalendarDropdown();
  }

  // #endregion

  // #region Private methods

  private _updateDefaultMask(): void {
    this._defaultMask = getDefaultDateTimeFormat(this.locale);
    this._localeDisplayFormat = getDateFormatter().getLocaleDateTimeFormat(
      this.locale
    );
  }

  private async _syncCalendarRange(): Promise<void> {
    await this._calendar?.updateComplete;
    this._setCalendarRangeValues();
  }

  private async _syncEditors(): Promise<void> {
    await this._syncCalendarRange();
    this._delegateInputsValidity();
  }

  protected _revertValue() {
    this.value = this._oldValue;
  }

  /**
   * Sets the active date of the calendar based on current selection, if any,
   * or its current active date and its active day view index to always be the first one.
   */
  private _setCalendarActiveDateAndViewIndex() {
    const activeDaysViewIndex = '_activeDaysViewIndex';

    this._calendar.activeDate =
      this._firstDefinedInRange ?? this._calendar.activeDate;
    this._calendar[activeDaysViewIndex] = 0;
  }

  /**
   * Composes the range from what the two editors currently hold.
   *
   * The sibling input is read through its draft rather than through the committed
   * `value`, since an edit in progress there has not reached the picker yet.
   */
  private _getUpdatedDateRange(
    input: IgcDateTimeInputComponent,
    newValue: Date | null
  ): DateRangeValue {
    const [startInput, endInput] = this._inputs;

    return input === startInput
      ? { start: newValue, end: endInput?._uncommittedValue ?? null }
      : { start: startInput?._uncommittedValue ?? null, end: newValue };
  }

  // Delegates the validity methods of internal input elements
  // to the component's own validation logic specific to date-range values.
  // Checks for dirty state to avoid unnecessary validation on form reset,
  // caused by the inputs value being set.
  private _delegateInputsValidity() {
    const inputs = this.useTwoInputs ? this._inputs : [this._input];

    inputs.forEach((input) => {
      input.checkValidity = () =>
        !this._pristine ? this.checkValidity() : true;
      input.reportValidity = () =>
        !this._pristine ? this.reportValidity() : true;
    });
  }

  /**
   * Reflects a range in the calendar. Defaults to the committed value, but the input
   * handlers pass the uncommitted draft so that the calendar keeps following along
   * while the user types.
   */
  private _setCalendarRangeValues(range: DateRangeValue | null = this.value) {
    if (isCompleteDateRange(range)) {
      this._calendarRange =
        CalendarDay.compare(range.start, range.end) === 0
          ? [range.start]
          : [range.start, range.end];

      if (this._calendar) {
        this._calendar.activeDate = range.start;
      }
      return;
    }

    const first = range?.start ?? range?.end ?? null;
    this._calendarRange = first ? [first] : null;
  }

  /**
   * Commits a range entered through an editor, normalizing a reversed one, and notifies.
   * Assigning the value reflects the range in the calendar on its own.
   */
  private _commitRange(range: DateRangeValue | null): void {
    const { start, end } = (range && this._swapDates(range)) ?? {
      start: null,
      end: null,
    };

    this.value = { start, end };
    this.emitEvent('igcChange', { detail: this.value });
  }

  private _swapDates(range: DateRangeValue): DateRangeValue {
    return isCompleteDateRange(range) &&
      CalendarDay.compare(range.start, range.end) >= 1
      ? { start: range.end, end: range.start }
      : range;
  }

  private _select(value: DateRangeValue | null, emitEvent = false) {
    this.value = value;
    this._calendar.activeDate =
      this._firstDefinedInRange ?? this._calendar.activeDate;

    if (emitEvent) {
      this.emitEvent('igcChange', { detail: this.value });
      this._oldValue = this.value;
      this._hide(true);
    }
  }

  // #endregion

  // #region Rendering

  /**
   * Custom actions stay in the body of the dialog, so that they do not collide
   * with the cancel/done buttons rendered in its footer.
   */
  protected override _renderActions() {
    const hasActions = this._slots.hasAssignedElements('actions');
    const slot = this._isDropDown || hasActions ? undefined : 'footer';

    return html`
      <div part="actions" ?hidden=${!hasActions} slot=${ifDefined(slot)}>
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected _renderPredefinedRanges() {
    const hasRanges = this.usePredefinedRanges || !isEmpty(this.customRanges);

    return hasRanges
      ? html`
          <igc-predefined-ranges-area
            .usePredefinedRanges=${this.usePredefinedRanges}
            .customRanges=${this.customRanges}
            .resourceStrings=${this.resourceStrings}
            @igcRangeSelect=${({ detail }: CustomEvent<DateRangeValue>) =>
              this._select(detail, this._isDropDown)}
          >
          </igc-predefined-ranges-area>
        `
      : nothing;
  }

  protected override _renderPickerContent(id: string) {
    return this._isDropDown
      ? html`${this._renderCalendar(id)} ${this._renderPredefinedRanges()}
        ${this._renderActions()}`
      : html`${this._renderCalendar(id)} ${this._renderActions()}
        ${this._renderPredefinedRanges()}`;
  }

  protected override _renderDialogFooter() {
    const isIndigo = this._themes.theme === 'indigo';

    return html`
      <igc-button
        slot="footer"
        @click=${this._dialogCancel}
        variant=${isIndigo ? 'outlined' : 'flat'}
        >${this.resourceStrings.date_range_picker_cancel_button}</igc-button
      >
      <igc-button
        slot="footer"
        @click=${this._dialogDone}
        variant=${isIndigo ? 'contained' : 'flat'}
        >${this.resourceStrings.date_range_picker_done_button}</igc-button
      >
    `;
  }

  protected _renderInput(
    id: string,
    picker:
      DateRangePosition.Start | DateRangePosition.End = DateRangePosition.Start
  ) {
    const isStart = picker === DateRangePosition.Start;
    const placeholder = isStart ? this.placeholderStart : this.placeholderEnd;
    const label = isStart ? this.labelStart : this.labelEnd;
    const format = getDateTimeFormat(this._displayFormat);
    const value = isStart ? this.value?.start : this.value?.end;
    const hasClickHandler = !(this._isDropDown || this.readOnly);

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${this._isEditorReadOnly}
        .value=${value ?? null}
        .locale=${live(this.locale)}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${placeholder}
        .min=${this._min}
        .max=${this._max}
        label=${label}
        ?invalid=${live(this.invalid)}
        @igcChange=${this._handleInputChange}
        @igcInput=${this._handleInput}
        @keydown=${this._handleEnterKeydown}
        @click=${bindIf(hasClickHandler, this._handleInputClick)}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderEditorSlots(`-${picker}`)}
      </igc-date-time-input>
    `;
  }

  private _renderInputs(idStart: string, idEnd: string) {
    return html`
      <div part="inputs">
        ${this._renderInput(idStart, DateRangePosition.Start)}
        <div part="separator">
          <slot name="separator">
            ${this.resourceStrings.date_range_picker_date_separator}
          </slot>
        </div>
        ${this._renderInput(idEnd, DateRangePosition.End)}
      </div>
      ${this._renderPicker(idStart)} ${this._renderHelperText()}
    `;
  }

  private _renderSingleInput(id: string) {
    const format =
      getDateTimeFormat(this.displayFormat) ?? this._localeDisplayFormat;
    const hasClickHandler = !(this._isDropDown || this.readOnly);

    return html`
      <igc-date-range-input
        id=${id}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        aria-haspopup="dialog"
        label=${this.label}
        ?readonly=${this._isEditorReadOnly}
        ?required=${this.required}
        .outlined=${this.outlined}
        ?invalid=${live(this.invalid)}
        .disabled=${this.disabled}
        .inputFormat=${live(this.inputFormat)}
        .displayFormat=${live(format)}
        .locale=${live(this.locale)}
        .prompt=${this.prompt}
        @igcInput=${this._handleDateRangeInput}
        @igcChange=${this._handleDateRangeInputChange}
        @keydown=${this._handleEnterKeydown}
        @click=${bindIf(hasClickHandler, this._handleInputClick)}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderEditorSlots()}
      </igc-date-range-input>
      ${this._renderHelperText()} ${this._renderPicker(id)}
    `;
  }

  protected override render(): TemplateResult {
    const id = this.id || this._inputId;

    return html`${cache(
      !this.useTwoInputs
        ? this._renderSingleInput(id)
        : this._renderInputs(`${id}-start`, `${id}-end`)
    )}`;
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-picker': IgcDateRangePickerComponent;
  }
}
