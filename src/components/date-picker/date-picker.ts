import {
  CalendarResourceStringsEN,
  DatePickerResourceStringsEN,
  type ICalendarResourceStrings,
  type IDatePickerResourceStrings,
} from 'igniteui-i18n-core';
import { html, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { convertToDate } from '#internals/date/converters.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { IgcCalendarResourceStrings } from '#internals/i18n/EN/calendar.resources.js';
import {
  addI18nController,
  getDateTimeFormat,
} from '#internals/i18n/i18n-controller.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueDateTimeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { bindIf } from '#internals/utils/lit.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import type IgcCalendarComponent from '../calendar/calendar.js';
import type { CalendarSelection } from '../calendar/types.js';
import type { DatePart } from '../date-time-input/date-part.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { RangeTextSelectMode, SelectionRangeDirection } from '../types.js';
import {
  IgcDatePickerBaseComponent,
  type IgcPickerBaseEventMap,
  pickerDependencies,
} from './date-picker.base.js';
import { styles } from './themes/date-picker.base.css.js';
import { styles as shared } from './themes/shared/date-picker.common.css.js';
import { all } from './themes/themes.js';
import { datePickerValidators } from './validators.js';

export type IgcDatePickerComponentEventMap = IgcPickerBaseEventMap<Date>;

const nextId = createIdGenerator('date-picker');
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
type DatePickerResourceStringsType = IDatePickerResourceStrings &
  ICalendarResourceStrings;

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * The date picker is a feature rich component used for entering a date through manual text input or
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
 * @fires igcOpening - Emitted just before the calendar popover is shown.
 * @fires igcOpened - Emitted after the calendar popover is shown.
 * @fires igcClosing - Emitted just before the calendar popover is hidden.
 * @fires igcClosed - Emitted after the calendar popover is hidden.
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
export default class IgcDatePickerComponent extends EventEmitterMixin<
  IgcDatePickerComponentEventMap,
  AbstractConstructor<IgcDatePickerBaseComponent<Date>>
>(IgcDatePickerBaseComponent) {
  public static readonly tagName = 'igc-date-picker';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDatePickerComponent,
      IgcDateTimeInputComponent,
      ...pickerDependencies
    );
  }

  //#region Private properties and state

  protected override get __validators() {
    return datePickerValidators;
  }

  protected override readonly _inputId = nextId();
  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  /**
   * For now we use the core validation strings internally only, to avoid mixing with old resources by users.
   * To Do: Update resourceStrings type when the IgcCalendarResourceStrings is changed to ICalendarResourceStrings
   */
  protected override readonly _i18nController = addI18nController<
    IgcCalendarResourceStrings | DatePickerResourceStringsType
  >(this, {
    defaultEN: Object.assign(
      {},
      DatePickerResourceStringsEN,
      CalendarResourceStringsEN
    ),
    resourceMapName: 'date-picker',
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  @query(IgcDateTimeInputComponent.tagName)
  private readonly _input!: IgcDateTimeInputComponent;

  //#endregion

  //#region Base class hooks

  protected override get _value(): Date | null {
    return this.value;
  }

  protected override set _value(value: Date | null) {
    this.value = value;
  }

  protected override get _hasValue(): boolean {
    return this.value !== null;
  }

  protected override get _calendarSelection(): CalendarSelection {
    return 'single';
  }

  protected override get _calendarValue(): Date | null {
    return this.value;
  }

  protected override get _selectDateLabel(): string | undefined {
    return this.resourceStrings.calendar_select_date;
  }

  protected override get _calendarIconTitle(): string | undefined {
    return this.value
      ? this.resourceStrings.date_picker_change_date
      : this.resourceStrings.date_picker_choose_date;
  }

  protected override get _dialogLabel(): string | undefined {
    return this._calendarIconTitle;
  }

  protected override get _defaultDisplayFormat(): string | undefined {
    return this._input?.displayFormat;
  }

  protected override get _defaultInputFormat(): string | undefined {
    return this._input?.inputFormat;
  }

  protected override get _labelTarget() {
    return this._input ?? null;
  }

  protected override _focusInput(): void {
    this._input.focus();
  }

  protected override _focusAndSelectInput(): void {
    this._input.focus();
    this._input.select();
  }

  protected override _syncCalendarOnToggle(): void {
    this._calendar.activeDate = this.value ?? this._calendar.activeDate;
  }

  protected override _clearEditors(): void {
    this._input?.clear();
  }

  /**
   * A committed edit in the input already emits `igcChange` on its own, so only a
   * value which the picker itself has changed is left to notify about here.
   */
  protected override _onBlur(): void {
    if (this._isEditorReadOnly) {
      this._emitChangeIfDirty();
    }
  }

  protected override _onDialogClosing(): void {
    this._oldValue = this.value;
  }

  //#endregion

  //#region Public properties and attributes

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the picker.
   *
   * Only ever holds a committed value. While the user is typing in the input, the
   * intermediate state stays in the editor and is committed - together with an
   * `igcChange` event - when the edit is committed on blur. Use the `igcInput` event
   * to observe the value as it is being typed.
   *
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
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public set resourceStrings(
    value: IgcCalendarResourceStrings | DatePickerResourceStringsType
  ) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IgcCalendarResourceStrings &
    DatePickerResourceStringsType {
    return this._i18nController.resourceStrings;
  }

  //#endregion

  //#region Event handlers

  protected _handleInputChangeEvent(event: CustomEvent<Date>): void {
    event.stopPropagation();

    this._setTouchedState();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected override async _handleCalendarChangeEvent(
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

    const draft = (event.target as IgcDateTimeInputComponent)._uncommittedValue;

    this._calendar.activeDate = draft ?? this._calendar.activeDate;
    this.emitEvent('igcInput', { detail: draft });
  }

  //#endregion

  //#region Public methods

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

  /* blazorSuppress */
  /** Sets the text selection range in the input of the component */
  public setSelectionRange(
    start: number,
    end: number,
    direction?: SelectionRangeDirection
  ): void {
    this._input.setSelectionRange(start, end, direction);
  }

  /* blazorSuppress */
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

  private _renderLabel(id: string) {
    const isDisabled = this._isDropDown || this.readOnly;

    return this.label
      ? html`
          <label
            part="label"
            for=${id}
            @click=${bindIf(!isDisabled, this._handleAnchorClick)}
          >
            ${this.label}
          </label>
        `
      : nothing;
  }

  protected _renderInput(id: string) {
    const format = getDateTimeFormat(this._displayFormat);
    const hasClickHandler = !(this._isDropDown || this.readOnly);

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        label=${bindIf(this._isMaterial, this.label)}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${this._isEditorReadOnly}
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
        @keydown=${this._handleEnterKeydown}
        @click=${bindIf(hasClickHandler, this._handleInputClick)}
        exportparts="input, label, prefix, suffix"
      >
        ${this._renderEditorSlots()}
      </igc-date-time-input>
    `;
  }

  protected override render(): TemplateResult {
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
