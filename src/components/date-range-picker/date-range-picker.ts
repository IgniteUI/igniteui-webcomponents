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
import { themes } from '../../theming/theming-decorator.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import {
  calendarRange,
  convertToDate,
  convertToDateRange,
} from '../calendar/helpers.js';
import { CalendarDay, toCalendarDay } from '../calendar/model.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  type WeekDays,
} from '../calendar/types.js';
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
  type IgcDateRangePickerResourceStrings,
  IgcDateRangePickerResourceStringsEN,
} from '../common/i18n/date-range-picker.resources.js';
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
  asNumber,
  clamp,
  createCounter,
  equal,
  findElementFromEventPath,
  isEmpty,
} from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import type {
  ContentOrientation,
  DateRangePickerInput,
  PickerMode,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './date-range-picker.base.css.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';
import { styles as shared } from './themes/shared/date-range-picker.common.css.js';
import { all } from './themes/themes.js';
import { dateRangeValidators } from './validators.js';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface CustomDateRange {
  label: string;
  dateRange: DateRangeValue;
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
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 *
 * @csspart separator - The separator element between the two inputs.
 * @csspart label - The label wrapper that renders content above the target input.
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart calendar-icon - The calendar icon wrapper for closed state.
 * @csspart calendar-icon-start - The calendar icon wrapper for closed state for the start input (two inputs).
 * @csspart calendar-icon-end - The calendar icon wrapper for closed state for the end input (two inputs).
 * @csspart calendar-icon-open - The calendar icon wrapper for opened state.
 * @csspart calendar-icon-open-start - The calendar icon wrapper for opened state for the start input (two inputs).
 * @csspart calendar-icon-open-end - The calendar icon wrapper for opened state for the end input (two inputs).
 * @csspart clear-icon - The clear icon wrapper (single input).
 * @csspart clear-icon-start - The clear icon wrapper for the start input (two inputs).
 * @csspart clear-icon-end - The clear icon wrapper for the end input (two inputs).
 * @csspart actions - The actions wrapper.
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
/* blazorElement */

@themes(all)
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
  public static styles = [styles, shared];

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDateRangePickerComponent,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcInputComponent,
      IgcFocusTrapComponent,
      IgcIconComponent,
      IgcPopoverComponent,
      IgcDialogComponent,
      IgcValidationContainerComponent,
      IgcPredefinedRangesAreaComponent
    );
  }

  // #region Internal state & properties

  private static readonly increment = createCounter();

  protected inputId = `date-range-picker-${IgcDateRangePickerComponent.increment()}`;
  protected override _formValue: FormValue<DateRangeValue | null>;

  private _activeDate: Date | null = null;
  private _min: Date | null = null;
  private _max: Date | null = null;
  private _disabledDates: DateRangeDescriptor[] = [];
  private _dateConstraints: DateRangeDescriptor[] = [];
  private _displayFormat?: string;
  private _inputFormat?: string;
  private _placeholder?: string;
  private _defaultMask!: string;
  private _oldValue: DateRangeValue | null = null;
  private _visibleMonths = 2;

  protected override get __validators() {
    return dateRangeValidators;
  }

  private get _isDropDown(): boolean {
    return this.mode === 'dropdown';
  }

  private get _areStartAndEndSet(): boolean {
    return !!this.value?.start && !!this.value?.end;
  }

  private get _firstDefinedInRange(): Date | null {
    return this.value?.start ?? this.value?.end ?? null;
  }

  @state()
  private _maskedRangeValue = '';

  @queryAll(IgcDateTimeInputComponent.tagName)
  private readonly _inputs!: IgcDateTimeInputComponent[];

  @query(IgcInputComponent.tagName)
  private readonly _input!: IgcInputComponent;

  @query(IgcCalendarComponent.tagName)
  private readonly _calendar!: IgcCalendarComponent;

  @queryAssignedElements({ slot: 'prefix' })
  private readonly _prefixes!: HTMLElement[];

  @queryAssignedElements({ slot: 'suffix' })
  private readonly _suffixes!: HTMLElement[];

  @queryAssignedElements({ slot: 'actions' })
  private readonly _actions!: HTMLElement[];

  @queryAssignedElements({ slot: 'header-date' })
  private readonly _headerDateSlotItems!: HTMLElement[];

  // #endregion

  // #region General properties

  @property({ converter: convertToDateRange })
  public set value(value: DateRangeValue | string | null | undefined) {
    const converted = convertToDateRange(value);

    this._formValue.setValueAndFormState(converted);
    this._validate();

    this._setCalendarRangeValues();
    this._updateMaskedRangeValue();
  }

  public get value(): DateRangeValue | null {
    return this._formValue.value;
  }
  /**
   * Renders chips with custom ranges based on the elements of the array.
   */
  @property({ type: Array, attribute: 'custom-ranges' })
  public customRanges: CustomDateRange[] = [];

  /**
   * Determines whether the calendar is opened in a dropdown or a modal dialog
   * @attr mode
   */
  @property()
  public mode: PickerMode = 'dropdown';

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
    reflect: true,
    type: Boolean,
    attribute: 'use-predefined-ranges',
  })
  public usePredefinedRanges = false;

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  /** The resource strings of the date range picker. */
  @property({ attribute: false })
  public resourceStrings: IgcDateRangePickerResourceStrings =
    IgcDateRangePickerResourceStringsEN;

  // #endregion

  // #region Input-related properties

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
    const rangePlaceholder = `${this.inputFormat} - ${this.inputFormat}`;
    return this._placeholder ?? rangePlaceholder;
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
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public set displayFormat(value: string) {
    this._displayFormat = value;
    this._updateMaskedRangeValue();
  }

  public get displayFormat(): string {
    return this._displayFormat ?? this.inputFormat;
  }

  /**
   * The date format to apply on the inputs.
   * Defaults to the current locale Intl.DateTimeFormat
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public set inputFormat(value: string) {
    this._inputFormat = value;
    this._updateMaskedRangeValue();
  }

  public get inputFormat(): string {
    return this._inputFormat ?? this._defaultMask;
  }

  // #endregion

  // #region Validation properties

  /**
   * The minimum value required for the date range picker to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._setDateConstraints();
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
    this._setDateConstraints();
    this._updateValidity();
  }

  public get max(): Date | null {
    return this._max;
  }

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  public set disabledDates(dates: DateRangeDescriptor[]) {
    this._disabledDates = dates;
    this._setDateConstraints();
    this._updateValidity();
  }

  public get disabledDates() {
    return this._disabledDates as DateRangeDescriptor[];
  }

  // #endregion

  // #region Calendar properties

  /**
   * The number of months displayed in the calendar.
   * @attr visible-months
   */
  @property({ type: Number, attribute: 'visible-months' })
  public get visibleMonths(): number {
    return this._visibleMonths;
  }

  public set visibleMonths(value: number) {
    this._visibleMonths = clamp(asNumber(value, 2), 1, 2);
  }
  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: ContentOrientation = 'horizontal';

  /**
   * The orientation of the multiple months displayed in the calendar's days view.
   *  @attr
   */
  @property()
  public orientation: ContentOrientation = 'horizontal';

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

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  // #endregion

  // #region Life-cycle hooks

  constructor() {
    super();
    this._formValue = createFormValueState<DateRangeValue | null>(this, {
      initialValue: {
        start: null,
        end: null,
      },
      transformers: defaultDateRangeTransformers,
    });

    this._rootClickController.update({ hideCallback: this._handleClosing });
    this.addEventListener('focusin', this._handleFocusIn);
    this.addEventListener('focusout', this._handleFocusOut);

    addKeybindings(this, {
      skip: () => this.disabled || this.readOnly,
      bindingDefaults: { preventDefault: true },
    })
      .set([altKey, arrowDown], this.handleAnchorClick)
      .set([altKey, arrowUp], this._onEscapeKey)
      .set(escapeKey, this._onEscapeKey);
  }

  protected override firstUpdated() {
    this._setCalendarRangeValues();
    this._delegateInputsValidity();
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this._setCalendarRangeValues();
    this._updateMaskedRangeValue();
  }

  // #endregion

  // #region Public API methods

  /** Clears the input parts of the component of any user input */
  public clear() {
    this._oldValue = this.value;
    this.value = null;
    if (this.useTwoInputs) {
      this._inputs[0]?.clear();
      this._inputs[1]?.clear();
    }
  }

  /** Selects a date range value in the picker */
  public select(value: DateRangeValue | null) {
    this._select(value);
  }

  // #endregion

  // #region Observed properties

  @watch('open')
  protected _openChange() {
    this._rootClickController.update();

    if (this.open) {
      this._oldValue = this.value;
    }
  }

  @watch('locale')
  protected _updateDefaultMask(): void {
    this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
    this._updateMaskedRangeValue();
  }

  @watch('useTwoInputs')
  protected async _updateDateRange() {
    await this._calendar?.updateComplete;
    this._updateMaskedRangeValue();
    this._setCalendarRangeValues();
  }

  @watch('mode')
  protected async _modeChanged() {
    if (!this._isDropDown) {
      this.keepOpenOnSelect = true;
    }
    await this._calendar?.updateComplete;
    this._setCalendarRangeValues();
  }

  // #endregion

  // #region Event handlers

  protected _handleClosing() {
    this._hide(true);
  }

  protected _handleDialogClosing(event: Event) {
    event.stopPropagation();
    if (!equal(this.value, this._oldValue)) {
      this.emitEvent('igcChange', { detail: this.value });
      this._oldValue = this.value;
    }
    this._hide(true);
  }

  protected _handleDialogClosed(event: Event) {
    event.stopPropagation();
  }

  protected _dialogCancel() {
    this._revertValue();
    this._hide(true);
  }

  protected _dialogDone() {
    if (!equal(this.value, this._oldValue)) {
      this.emitEvent('igcChange', { detail: this.value });
      this._oldValue = this.value;
    }
    this._hide(true);
  }

  protected _handleInputEvent(event: CustomEvent<Date | null>) {
    event.stopPropagation();
    if (this.nonEditable) {
      event.preventDefault();
      return;
    }
    const input = event.target as IgcDateTimeInputComponent;
    const newValue = input.value ? CalendarDay.from(input.value).native : null;

    this.value = this._getUpdatedDateRange(input, newValue);
    this._calendar.activeDate =
      newValue ?? this._firstDefinedInRange ?? this._calendar.activeDate;

    this.emitEvent('igcInput', { detail: this.value });
  }

  protected _handleInputChangeEvent(event: CustomEvent<Date | null>) {
    event.stopPropagation();

    const input = event.target as IgcDateTimeInputComponent;
    const newValue = input.value ? CalendarDay.from(input.value).native : null;

    const updatedRange = this._getUpdatedDateRange(input, newValue);
    const { start, end } = this._swapDates(updatedRange);

    this._setCalendarRangeValues();
    this.value = { start, end };
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected _handleFocusIn() {
    this._dirty = true;
  }

  protected _handleFocusOut({ relatedTarget }: FocusEvent) {
    if (!this.contains(relatedTarget as Node)) {
      this.checkValidity();

      const isSameValue = equal(this.value, this._oldValue);
      if (!(this.useTwoInputs || this.readOnly || isSameValue)) {
        this.emitEvent('igcChange', { detail: this.value });
        this._oldValue = this.value;
      }
    }
  }

  protected _handleInputClick(event: Event) {
    if (findElementFromEventPath('input', event)) {
      // Open only if the click originates from the underlying input
      this.handleAnchorClick();
    }
  }

  protected async _onEscapeKey() {
    if (await this._hide(true)) {
      if (!this._isDropDown) {
        this._revertValue();
      }
      this._inputs[0]?.focus();
    }
  }

  protected override async handleAnchorClick() {
    this._calendar.activeDate =
      this._firstDefinedInRange ?? this._calendar.activeDate;
    super.handleAnchorClick();
    await this.updateComplete;
    this._calendar[focusActiveDate]();
  }

  protected async _handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.readOnly) {
      // Wait till the calendar finishes updating and then restore the current value from the date-picker.
      await this._calendar.updateComplete;
      const dateRange = [this.value?.start, this.value?.end];
      this._calendar.values = dateRange?.map((d) => d ?? '');
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

  protected _handleCalendarIconSlotPointerDown(event: PointerEvent) {
    event.preventDefault();
  }

  // #endregion

  // #region Private methods

  protected _revertValue() {
    this.value = this._oldValue;
  }

  private _getUpdatedDateRange(
    input: IgcDateTimeInputComponent,
    newValue: Date | null
  ): DateRangeValue {
    const currentStart = this.value?.start ?? null;
    const currentEnd = this.value?.end ?? null;

    return input === this._inputs[0]
      ? { start: newValue, end: currentEnd }
      : { start: currentStart, end: newValue };
  }

  // Delegates the validity methods of internal input elements
  // to the component's own validation logic specific to date-range values.
  // Checks for dirty state to avoid unnecessary validation on form reset,
  // caused by the inputs value being set.
  private _delegateInputsValidity() {
    const inputs = this.useTwoInputs ? this._inputs : [this._input];

    inputs.forEach((input) => {
      input.checkValidity = () =>
        this._dirty || !this._pristine ? this.checkValidity() : true;
      input.reportValidity = () =>
        this._dirty || !this._pristine ? this.reportValidity() : true;
    });
  }

  private _setDateConstraints() {
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
    if (!isEmpty(this.disabledDates)) {
      dates.push(...this.disabledDates);
    }

    this._dateConstraints = isEmpty(dates) ? [] : dates;
  }

  private _updateMaskedRangeValue() {
    if (this.useTwoInputs) {
      return;
    }
    if (!this._areStartAndEndSet) {
      this._maskedRangeValue = '';
      return;
    }
    const start = this.value!.start!;
    const end = this.value!.end!;
    let startMask = '';
    let endMask = '';
    const format =
      DateTimeUtil.predefinedToDateDisplayFormat(this._displayFormat!) ??
      this.displayFormat ??
      this.inputFormat;
    if (format) {
      startMask = DateTimeUtil.formatDate(start, this.locale, format);
      endMask = DateTimeUtil.formatDate(end, this.locale, format);
    } else {
      startMask = start.toLocaleDateString();
      endMask = end.toLocaleDateString();
    }
    this._maskedRangeValue = `${startMask} - ${endMask}`;
  }

  private _setCalendarRangeValues() {
    if (!this._calendar) {
      return;
    }

    if (!this._areStartAndEndSet) {
      this._calendar.values = this._firstDefinedInRange
        ? [this._firstDefinedInRange]
        : null;
      return;
    }

    const start = this.value!.start!;
    const end = this.value!.end!;

    if (toCalendarDay(start).equalTo(toCalendarDay(end))) {
      this._calendar.values = [start];
    } else {
      const range = Array.from(
        calendarRange({
          start,
          end,
          inclusive: true,
        })
      );
      this._calendar.values = range.map((d) => d.native);
    }
    this._calendar.activeDate = this._firstDefinedInRange;
  }

  private _swapDates(range: DateRangeValue): DateRangeValue {
    const { start, end } = range;
    if (start && end) {
      const calendarDayStart = toCalendarDay(start);
      const calendarDayEnd = toCalendarDay(end);
      const isStartEarlierThanEnd = calendarDayStart.lessThan(calendarDayEnd);

      if (!isStartEarlierThanEnd) {
        return { start: end, end: start };
      }
    }
    return { start, end };
  }

  private async _shouldCloseCalendarDropdown() {
    if (
      !this.keepOpenOnSelect &&
      this._calendar.values.length > 1 &&
      (await this._hide(true))
    ) {
      if (this.useTwoInputs) {
        this._inputs[0].focus();
        this._inputs[0].select();
      } else {
        this._input.focus();
      }
    }
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

  private _renderClearIcon(picker: DateRangePickerInput = 'start') {
    const clearIcon = this.useTwoInputs ? `clear-icon-${picker}` : 'clear-icon';
    return this._firstDefinedInRange
      ? html`
          <span
            slot="suffix"
            part="${clearIcon}"
            @click=${this.readOnly ? nothing : this.clear}
          >
            <slot name="${clearIcon}">
              <igc-icon
                name="input_clear"
                collection="default"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        `
      : nothing;
  }

  private _renderCalendarIcon(picker: DateRangePickerInput = 'start') {
    const defaultIcon = html`
      <igc-icon name="today" collection="default" aria-hidden="true"></igc-icon>
    `;

    const state = this.open ? 'calendar-icon-open' : 'calendar-icon';
    const calendarIcon = this.useTwoInputs ? `${state}-${picker}` : state;

    return html`
      <span
        slot="prefix"
        part=${calendarIcon}
        @pointerdown=${this._handleCalendarIconSlotPointerDown}
        @click=${this.readOnly ? nothing : this.handleAnchorClick}
      >
        <slot name=${calendarIcon}>${defaultIcon}</slot>
      </span>
    `;
  }

  private _renderCalendarSlots() {
    if (this._isDropDown) {
      return nothing;
    }

    const hasHeaderDate = isEmpty(this._headerDateSlotItems)
      ? ''
      : 'header-date';

    return html`
      <slot name="title" slot="title">
        ${this.resourceStrings.selectDate}
      </slot>
      <slot name="header-date" slot=${hasHeaderDate}></slot>
    `;
  }

  private _renderCalendar(id: string) {
    const hideHeader = this._isDropDown ? true : this.hideHeader;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role="dialog"
        .inert=${!this.open || this.disabled}
        ?show-week-numbers=${this.showWeekNumbers}
        ?hide-outside-days=${this.hideOutsideDays}
        ?hide-header=${hideHeader}
        .activeDate=${this.activeDate ?? this._firstDefinedInRange}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${this._visibleMonths}
        .disabledDates=${this._dateConstraints!}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
        selection="range"
        @igcChange=${this._handleCalendarChangeEvent}
        exportparts="header, header-title, header-date, content: calendar-content, navigation, months-navigation,
          years-navigation, years-range, navigation-buttons, navigation-button, days-view-container,
          days-view, months-view, years-view, days-row, label: calendar-label, week-number, week-number-inner, date,
          date-inner, first, last, inactive, hidden, weekend, range, special, disabled, single, preview,
          month, month-inner, year, year-inner, selected, current"
      >
        ${this._renderCalendarSlots()}
      </igc-calendar>
    `;
  }

  protected _renderActions() {
    const hasActions = !isEmpty(this._actions);
    const slot = this._isDropDown || hasActions ? undefined : 'footer';

    // If in dialog mode use the dialog footer slot
    return html`
      <div part="actions" ?hidden=${!hasActions} slot=${ifDefined(slot)}>
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected _renderPredefinedRanges() {
    const hasRanges = this.usePredefinedRanges || !isEmpty(this.customRanges);
    return html`${hasRanges
      ? html`<igc-predefined-ranges-area
          .usePredefinedRanges=${this.usePredefinedRanges}
          .customRanges=${this.customRanges}
          .resourceStrings=${this.resourceStrings}
          @igcRangeSelect=${(e: CustomEvent<DateRangeValue>) =>
            this._select(e.detail, this._isDropDown)}
        >
        </igc-predefined-ranges-area>`
      : nothing}`;
  }

  protected _renderPicker(id: string) {
    return this._isDropDown
      ? html`
          <igc-popover ?open=${this.open} anchor="${id}" flip shift>
            <igc-focus-trap ?disabled=${!this.open || this.disabled}>
              ${this._renderCalendar(id)} ${this._renderPredefinedRanges()}
              ${this._renderActions()}
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
            @igcClosing=${this._handleDialogClosing}
            @igcClosed=${this._handleDialogClosed}
            exportparts="base: dialog-base, title, footer, overlay"
          >
            ${this._renderCalendar(id)} ${this._renderActions()}
            ${this._renderPredefinedRanges()}
            <igc-button
              slot="footer"
              @click=${this._dialogCancel}
              variant="flat"
              >${this.resourceStrings.cancel}</igc-button
            >
            <igc-button slot="footer" @click=${this._dialogDone} variant="flat"
              >${this.resourceStrings.done}</igc-button
            >
          </igc-dialog>
        `;
  }

  private _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected _renderInput(id: string, picker: DateRangePickerInput = 'start') {
    const readOnly = !this._isDropDown || this.readOnly || this.nonEditable;
    const placeholder =
      picker === 'start' ? this.placeholderStart : this.placeholderEnd;
    const label = picker === 'start' ? this.labelStart : this.labelEnd;
    const format = DateTimeUtil.predefinedToDateDisplayFormat(
      this._displayFormat!
    );
    const value = picker === 'start' ? this.value?.start : this.value?.end;
    const prefix = isEmpty(this._prefixes) ? undefined : 'prefix';
    const suffix = isEmpty(this._suffixes) ? undefined : 'suffix';

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${readOnly}
        .value=${value ?? null}
        .locale=${live(this.locale)}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${placeholder}
        label=${label}
        ?invalid=${live(this.invalid)}
        @igcChange=${this._handleInputChangeEvent}
        @igcInput=${this._handleInputEvent}
        @click=${this._isDropDown ? nothing : this._handleInputClick}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderCalendarIcon(picker)}
        <slot name=${`prefix-${picker}`} slot=${ifDefined(prefix)}></slot>
        ${this._renderClearIcon(picker)}
        <slot name=${`suffix-${picker}`} slot=${ifDefined(suffix)}></slot>
      </igc-date-time-input>
    `;
  }

  private _renderInputs(idStart: string, idEnd: string) {
    return html`
      <div part="inputs">
        ${this._renderInput(idStart, 'start')}
        <div part="separator">
          <slot name="separator"> ${this.resourceStrings.separator} </slot>
        </div>
        ${this._renderInput(idEnd, 'end')}
      </div>
      ${this._renderPicker(idStart)} ${this._renderHelperText()}
    `;
  }

  private _renderSingleInput(id: string) {
    const prefix = isEmpty(this._prefixes) ? undefined : 'prefix';
    const suffix = isEmpty(this._suffixes) ? undefined : 'suffix';

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
        @click=${this._isDropDown ? nothing : this._handleInputClick}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderCalendarIcon()}
        <slot name="prefix" slot=${ifDefined(prefix)}></slot>
        ${this._renderClearIcon()}
        <slot name="suffix" slot=${ifDefined(suffix)}></slot>
      </igc-input>
      ${this._renderHelperText()} ${this._renderPicker(id)}`;
  }

  protected override render() {
    const id = this.id || this.inputId;
    const idStart = `${id}-start`;
    const idEnd = `${id}-end`;
    if (!this.useTwoInputs) {
      return this._renderSingleInput(id);
    }
    return this._renderInputs(idStart, idEnd);
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-picker': IgcDateRangePickerComponent;
  }
}
