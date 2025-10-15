import { html, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import { convertToDate, createDateConstraints } from '../calendar/helpers.js';
import type {
  CalendarHeaderOrientation,
  DateRangeDescriptor,
  WeekDays,
} from '../calendar/types.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
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
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import {
  addSafeEventListener,
  bindIf,
  equal,
  findElementFromEventPath,
} from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { type DatePart, DateTimeUtil } from '../date-time-input/date-util.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent from '../popover/popover.js';
import type {
  ContentOrientation,
  PickerMode,
  RangeTextSelectMode,
  SelectionRangeDirection,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/date-picker.base.css.js';
import { styles as shared } from './themes/shared/date-picker.common.css.js';
import { all } from './themes/themes.js';
import { datePickerValidators } from './validators.js';

export interface IgcDatePickerComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<Date | null>;
  igcInput: CustomEvent<Date | null>;
}

let nextId = 1;
const Slots = setSlots(
  'prefix',
  'suffix',
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
  'calendar-icon',
  'calendar-icon-open',
  'actions'
);

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * igc-date-picker is a feature rich component used for entering a date through manual text input or
 * choosing date values from a calendar dialog that pops up.
 *
 * @element igc-date-picker
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
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
 * @slot calendar-icon - Renders the icon/content for the calendar picker.
 * @slot calendar-icon-open - Renders the icon/content for the picker in open state.
 * @slot actions - Renders content in the action part of the picker in open state.
 *
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 *
 * @csspart label - The label wrapper that renders content above the target input.
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart calendar-icon - The calendar icon wrapper for closed state.
 * @csspart calendar-icon-open - The calendar icon wrapper for opened state.
 * @csspart clear-icon - The clear icon wrapper.
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
@blazorAdditionalDependencies(
  'IgcCalendarComponent, IgcDateTimeInputComponent, IgcDialogComponent, IgcIconComponent'
)
@shadowOptions({ delegatesFocus: true })
export default class IgcDatePickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDatePickerComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-date-picker';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDatePickerComponent,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcFocusTrapComponent,
      IgcIconComponent,
      IgcPopoverComponent,
      IgcDialogComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Private properties and state

  protected override get __validators() {
    return datePickerValidators;
  }

  private readonly _inputId = `date-picker-${nextId++}`;
  private readonly _themes = addThemingController(this, all);
  private readonly _slots = addSlotController(this, { slots: Slots });

  private _oldValue: Date | null = null;
  private _activeDate: Date | null = null;
  private _min: Date | null = null;
  private _max: Date | null = null;
  private _disabledDates?: DateRangeDescriptor[];
  private _dateConstraints?: DateRangeDescriptor[];
  private _displayFormat?: string;
  private _inputFormat?: string;

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  @query(IgcDateTimeInputComponent.tagName)
  private readonly _input!: IgcDateTimeInputComponent;

  @query(IgcCalendarComponent.tagName)
  private readonly _calendar!: IgcCalendarComponent;

  private get _isDropDown(): boolean {
    return this.mode === 'dropdown';
  }

  private get _isMaterial(): boolean {
    return this._themes.theme === 'material';
  }

  //#endregion

  //#region Public properties and attributes

  /**
   * Sets the state of the datepicker dropdown.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public override open = false;

  /**
   * The label of the datepicker.
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * Determines whether the calendar is opened in a dropdown or a modal dialog
   * @attr mode
   */
  @property()
  public mode: PickerMode = 'dropdown';

  /**
   * Whether to allow typing in the input.
   * @attr non-editable
   */
  @property({ type: Boolean, reflect: true, attribute: 'non-editable' })
  public nonEditable = false;

  /**
   * Makes the control a readonly field.
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the picker
   * @attr
   */
  @property({ converter: convertToDate })
  public set value(value: Date | string | null | undefined) {
    this._formValue.setValueAndFormState(value as Date | null);
  }

  public get value(): Date | null {
    return this._formValue.value;
  }

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
   * The minimum value required for the date picker to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._setDateConstraints();
    this._validate();
  }

  public get min(): Date | null {
    return this._min;
  }

  /**
   * The maximum value required for the date picker to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set max(value: Date | string | null | undefined) {
    this._max = convertToDate(value);
    this._setDateConstraints();
    this._validate();
  }

  public get max(): Date | null {
    return this._max;
  }

  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: CalendarHeaderOrientation = 'horizontal';

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
   * Controls the visibility of the dates that do not belong to the current month.
   * @attr hide-outside-days
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  public set disabledDates(dates: DateRangeDescriptor[]) {
    this._disabledDates = dates;
    this._setDateConstraints();
    this._validate();
  }

  public get disabledDates() {
    return this._disabledDates as DateRangeDescriptor[];
  }

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  /**
   * Whether the control will have outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The placeholder attribute of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * The number of months displayed in the calendar.
   * @attr visible-months
   */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 1;

  /**
   * Whether to show the number of the week in the calendar.
   * @attr show-week-numbers
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public set displayFormat(value: string) {
    this._displayFormat = value;
  }

  public get displayFormat(): string {
    return this._displayFormat ?? this.inputFormat;
  }

  /**
   * The date format to apply on the input.
   * Defaults to the current locale Intl.DateTimeFormat
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public set inputFormat(value: string) {
    this._inputFormat = value;
  }

  public get inputFormat(): string {
    return this._inputFormat ?? this._input?.inputFormat;
  }

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  /** The prompt symbol to use for unfilled parts of the mask.
   *  @attr
   */
  @property()
  public prompt = '_';

  /** The resource strings of the calendar. */
  @property({ attribute: false })
  public resourceStrings: IgcCalendarResourceStrings =
    IgcCalendarResourceStringEN;

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  //#endregion

  //#region Watchers

  @watch('open')
  protected _openChange(): void {
    this._rootClickController.update();
    if (this.open) {
      this._oldValue = this.value;
    }
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, {
      skip: () => this.disabled || this.readOnly,
    })
      .set([altKey, arrowDown], this.handleAnchorClick)
      .set([altKey, arrowUp], this._onEscapeKey)
      .set(escapeKey, this._onEscapeKey);
  }

  //#endregion

  //#region Private methods

  private _setDateConstraints(): void {
    this._dateConstraints = createDateConstraints(
      this.min,
      this.max,
      this.disabledDates
    );
  }

  private async _shouldCloseCalendarDropdown(): Promise<void> {
    if (!this.keepOpenOnSelect && (await this._hide(true))) {
      this._input.focus();
      this._input.select();
    }
  }

  //#endregion

  //#region Event handlers

  protected async _onEscapeKey(): Promise<void> {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  protected _handleFocusOut({ relatedTarget }: FocusEvent): void {
    if (!this.contains(relatedTarget as Node)) {
      this._handleBlur();

      const readOnly = !this._isDropDown || this.readOnly || this.nonEditable;
      if (readOnly && !equal(this.value, this._oldValue)) {
        this.emitEvent('igcChange', { detail: this.value });
        this._oldValue = this.value;
      }
    }
  }

  protected _handlerCalendarIconSlotPointerDown(event: PointerEvent) {
    // This is where the delegateFocus of the underlying input is a chore.
    // If we have a required validator we don't want the input to enter an invalid
    // state right off the bat when opening the picker which will happen since focus is transferred to the calendar element.
    // So we call preventDefault on the event in order to not focus the input and trigger its validation logic on blur.
    event.preventDefault();
  }

  protected _handleInputClick(event: Event): void {
    if (findElementFromEventPath('input', event)) {
      // Open only if the click originates from the underlying input
      this.handleAnchorClick();
    }
  }

  protected override async handleAnchorClick(): Promise<void> {
    this._calendar.activeDate = this.value ?? this._calendar.activeDate;

    super.handleAnchorClick();
    await this.updateComplete;
    this._calendar[focusActiveDate]({ preventScroll: true });
  }

  protected _handleInputChangeEvent(event: CustomEvent<Date>): void {
    event.stopPropagation();

    this._setTouchedState();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected async _handleCalendarChangeEvent(
    event: CustomEvent<Date>
  ): Promise<void> {
    event.stopPropagation();

    this._setTouchedState();

    if (this.readOnly) {
      // Wait till the calendar finishes updating and then restore the current value from the date-picker.
      await this._calendar.updateComplete;
      this._calendar.value = this.value;
      return;
    }

    this.value = (event.target as IgcCalendarComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });

    this._shouldCloseCalendarDropdown();
  }

  protected _handleInputEvent(event: CustomEvent<Date>): void {
    event.stopPropagation();

    this._setTouchedState();

    if (this.nonEditable) {
      event.preventDefault();
      return;
    }

    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this._calendar.activeDate = this.value ?? this._calendar.activeDate;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected _handleClosing(): void {
    this._hide(true);
  }

  protected _handleDialogClosing(event: Event): void {
    event.stopPropagation();
    this._oldValue = this.value;
    this._hide(true);
  }

  protected _handleDialogClosed(event: Event): void {
    event.stopPropagation();
  }

  //#endregion

  //#region Public methods

  /** Clears the input part of the component of any user input */
  public clear(): void {
    this._oldValue = this.value;
    this.value = null;
    this._input?.clear();

    if (this.nonEditable || !this._isDropDown) {
      this._input.blur();
      Promise.resolve().then(() => this._input.focus());
    }
  }

  /** Increments the passed in date part */
  public stepUp(datePart?: DatePart, delta?: number): void {
    this._input.stepUp(datePart, delta);
  }

  /** Decrements the passed in date part */
  public stepDown(datePart?: DatePart, delta?: number): void {
    this._input.stepDown(datePart, delta);
  }

  /** Selects the text in the input of the component */
  public select(): void {
    this._input.select();
  }

  /** Sets the text selection range in the input of the component */
  public setSelectionRange(
    start: number,
    end: number,
    direction?: SelectionRangeDirection
  ): void {
    this._input.setSelectionRange(start, end, direction);
  }

  /* Replaces the selected text in the input and re-applies the mask */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    mode?: RangeTextSelectMode
  ): void {
    this._input.setRangeText(replacement, start, end, mode);
    this.value = this._input.value;
  }

  //#endregion

  //#region Render methods

  private _renderClearIcon() {
    return this.value
      ? html`
          <span
            slot="suffix"
            part="clear-icon"
            @click=${bindIf(!this.readOnly, this.clear)}
          >
            <slot name="clear-icon">
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

  private _renderCalendarIcon() {
    const defaultIcon = html`
      <igc-icon name="today" collection="default" aria-hidden="true"></igc-icon>
    `;

    const state = this.open ? 'calendar-icon-open' : 'calendar-icon';

    return html`
      <span
        slot="prefix"
        part=${state}
        @pointerdown=${this._handlerCalendarIconSlotPointerDown}
        @click=${bindIf(!this.readOnly, this.handleAnchorClick)}
      >
        <slot name=${state}>${defaultIcon}</slot>
      </span>
    `;
  }

  private _renderCalendarSlots() {
    if (this._isDropDown) {
      return nothing;
    }

    const hasHeaderDate = this._slots.hasAssignedElements('header-date');

    return html`
      <slot name="title" slot="title">
        ${this.resourceStrings.selectDate}
      </slot>
      <slot
        name="header-date"
        slot=${bindIf(hasHeaderDate, 'header-date')}
      ></slot>
    `;
  }

  private _renderCalendar(id: string) {
    const hideHeader = this._isDropDown ? true : this.hideHeader;
    const isInert = !this.open || this.disabled;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role="dialog"
        .inert=${isInert}
        ?show-week-numbers=${this.showWeekNumbers}
        ?hide-outside-days=${this.hideOutsideDays}
        ?hide-header=${hideHeader}
        .activeDate=${this.activeDate ?? this.value}
        .value=${this.value}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${this.visibleMonths}
        .locale=${this.locale}
        .disabledDates=${this._dateConstraints!}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
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
    const hasActions = this._slots.hasAssignedElements('actions');

    // If in dialog mode use the dialog footer slot
    return html`
      <div
        part="actions"
        ?hidden=${!hasActions}
        slot=${bindIf(!(this._isDropDown || hasActions), 'footer')}
      >
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected _renderPicker(id: string) {
    const isDisabled = !this.open || this.disabled;

    return this._isDropDown
      ? html`
          <igc-popover ?open=${this.open} anchor=${id} flip shift>
            <igc-focus-trap ?disabled=${isDisabled}>
              ${this._renderCalendar(id)}${this._renderActions()}
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
            ${this._renderCalendar(id)}${this._renderActions()}
          </igc-dialog>
        `;
  }

  private _renderLabel(id: string) {
    const isDisabled = this._isDropDown || this.readOnly;

    return this.label
      ? html`
          <label
            part="label"
            for=${id}
            @click=${bindIf(!isDisabled, this.handleAnchorClick)}
          >
            ${this.label}
          </label>
        `
      : nothing;
  }

  private _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected _renderInput(id: string) {
    const format = DateTimeUtil.predefinedToDateDisplayFormat(
      this._displayFormat!
    );

    // Dialog mode is always readonly, rest depends on configuration
    const readOnly = !this._isDropDown || this.readOnly || this.nonEditable;

    const hasPrefix = this._slots.hasAssignedElements('prefix');
    const hasSuffix = this._slots.hasAssignedElements('suffix');
    const hasClickHandler = !(this._isDropDown || this.readOnly);

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        label=${bindIf(this._isMaterial, this.label)}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${readOnly}
        ?required=${this.required}
        .value=${this.value}
        .locale=${this.locale}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${this.placeholder}
        .min=${this.min}
        .max=${this.max}
        .invalid=${this.invalid}
        @igcChange=${this._handleInputChangeEvent}
        @igcInput=${this._handleInputEvent}
        @click=${bindIf(hasClickHandler, this._handleInputClick)}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderCalendarIcon()}
        <slot name="prefix" slot=${bindIf(hasPrefix, 'prefix')}></slot>
        ${this._renderClearIcon()}
        <slot name="suffix" slot=${bindIf(hasSuffix, 'suffix')}></slot>
      </igc-date-time-input>
    `;
  }

  protected override render() {
    const id = this.id || this._inputId;

    return html`
      ${this._isMaterial ? nothing : this._renderLabel(id)}
      ${this._renderInput(id)} ${this._renderPicker(id)}
      ${this._renderHelperText()}
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-picker': IgcDatePickerComponent;
  }
}
