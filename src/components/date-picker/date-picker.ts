import {
  type ComplexAttributeConverter,
  LitElement,
  type TemplateResult,
  html,
  nothing,
} from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { getThemeController, themes } from '../../theming/theming-decorator.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import {
  type DateRangeDescriptor,
  DateRangeType,
  isDateInRanges,
} from '../calendar/common/calendar.model.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from '../common/i18n/calendar.resources.js';
import messages from '../common/localization/validation-en.js';
import { IgcBaseComboBoxLikeComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import {
  createCounter,
  findElementFromEventPath,
  formatString,
} from '../common/util.js';
import {
  type Validator,
  maxDateValidator,
  minDateValidator,
  requiredValidator,
} from '../common/validators.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DatePart } from '../date-time-input/date-util.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/date-picker.base.css.js';
import { styles as shared } from './themes/shared/date-picker.common.css.js';
import { all } from './themes/themes.js';

export interface IgcDatepickerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<Date>;
  igcInput: CustomEvent<Date>;
}

const converter: ComplexAttributeConverter<Date | undefined> = {
  fromAttribute: (value: string) => (value ? new Date(value) : undefined),
  toAttribute: (value: Date) => value.toISOString(),
};

const formats = new Set(['short', 'medium', 'long', 'full']);

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
@themes(all, { exposeController: true })
@blazorAdditionalDependencies(
  'IgcCalendarComponent, IgcDateTimeInputComponent, IgcDialogComponent, IgcIconComponent'
)
export default class IgcDatePickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDatepickerEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-date-picker';
  public static styles = [styles, shared];

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected inputId = `date-picker-${IgcDatePickerComponent.increment()}`;

  protected override validators: Validator<this>[] = [
    requiredValidator,
    minDateValidator,
    maxDateValidator,
    {
      key: 'badInput',
      message: () => formatString(messages.disabledDate, this.value),
      isValid: () =>
        this.value
          ? !isDateInRanges(this.value, this.disabledDates ?? [])
          : true,
    },
  ];

  /* blazorSuppress */
  public static register() {
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

  private _value?: Date | null;
  private _activeDate?: Date | null;
  private _min?: Date;
  private _max?: Date;
  private _disabledDates?: DateRangeDescriptor[];
  private _dateConstraints?: DateRangeDescriptor[];
  private _displayFormat?: string;
  private _inputFormat?: string;

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: this.handleClosing,
  });

  private get isDropDown() {
    return this.mode === 'dropdown';
  }

  @query(IgcDateTimeInputComponent.tagName)
  private _input!: IgcDateTimeInputComponent;

  @query(IgcCalendarComponent.tagName)
  private _calendar!: IgcCalendarComponent;

  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'actions' })
  private actions!: Array<HTMLElement>;

  protected get _isMaterialTheme(): boolean {
    return getThemeController(this)?.theme === 'material';
  }

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
  public mode: 'dropdown' | 'dialog' = 'dropdown';

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
  @property({ converter: converter })
  public set value(value: Date | null) {
    this._value = value;
    this.setFormValue(value ? value.toISOString() : null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get value(): Date | null {
    return this._value ?? null;
  }

  /**
   * Gets/Sets the date which is shown in the calendar picker and is highlighted.
   * By default it is the current date.
   */
  @property({ attribute: 'active-date', converter: converter })
  public set activeDate(value: Date) {
    this._activeDate = value;
  }

  public get activeDate(): Date {
    return this._activeDate ?? this._calendar?.activeDate;
  }

  /**
   * The minimum value required for the date picker to remain valid.
   * @attr
   */
  @property({ converter: converter })
  public set min(value: Date) {
    this._min = value;
    this.setDateConstraints();
    this.updateValidity();
  }

  public get min(): Date {
    return this._min as Date;
  }

  /**
   * The maximum value required for the date picker to remain valid.
   * @attr
   */
  @property({ converter: converter })
  public set max(value: Date) {
    this._max = value;
    this.setDateConstraints();
    this.updateValidity();
  }

  public get max(): Date {
    return this._max as Date;
  }

  /** The orientation of the calendar header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  /** The orientation of the multiple months displayed in the calendar's days view.
   *  @attr
   */
  @property()
  public orientation: 'vertical' | 'horizontal' = 'horizontal';

  /** Determines whether the calendar hides its header.
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
    this.setDateConstraints();
    this.updateValidity();
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

  @watch('open')
  protected openChange() {
    this._rootClickController.update();
  }

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

  constructor() {
    super();

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

  public override connectedCallback() {
    super.connectedCallback();
    this.updateValidity();
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  /** Clears the input part of the component of any user input */
  public clear() {
    this.value = null;
    this._input?.clear();
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
    direction?: 'none' | 'backward' | 'forward'
  ): void {
    this._input.setSelectionRange(start, end, direction);
  }

  /* Replaces the selected text in the input and re-applies the mask */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    mode?: 'select' | 'start' | 'end' | 'preserve'
  ): void {
    this._input.setRangeText(replacement, start, end, mode);
    this.value = this._input.value;
  }

  protected async onEscapeKey() {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  protected handleFocusIn() {
    this._dirty = true;
  }

  protected handleFocusOut({ relatedTarget }: FocusEvent) {
    if (!this.contains(relatedTarget as Node)) {
      this.checkValidity();
    }
  }

  protected handlerCalendarIconSlotPointerDown(event: PointerEvent) {
    // This is where the delegateFocus of the underlying input is a chore.
    // If we have a required validator we don't want the input to enter an invalid
    // state right off the bat when opening the picker which will happen since focus is transferred to the calendar element.
    // So we call preventDefault on the event in order to not focus the input and trigger its validation logic on blur.
    event.preventDefault();
  }

  protected handleInputClick(event: Event) {
    if (findElementFromEventPath('input', event)) {
      // Open only if the click originates from the underlying input
      this.handleAnchorClick();
    }
  }

  protected override async handleAnchorClick() {
    this._calendar.activeDate = this.value ?? this._calendar.activeDate;

    super.handleAnchorClick();
    await this.updateComplete;
    this._calendar[focusActiveDate]();
  }

  private async _shouldCloseCalendarDropdown() {
    if (!this.keepOpenOnSelect && (await this._hide(true))) {
      this._input.focus();
      this._input.select();
    }
  }

  protected handleInputChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected async handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.readOnly) {
      // Wait till the calendar finishes updating and then restore the current value from the date-picker.
      await this._calendar.updateComplete;
      this._calendar.value = this._value ?? undefined;
      return;
    }

    this.value = (event.target as IgcCalendarComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });

    this._shouldCloseCalendarDropdown();
  }

  protected handleInputEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.nonEditable) {
      event.preventDefault();
      return;
    }

    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcInput', { detail: this.value });
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

  private setDateConstraints() {
    const dates: DateRangeDescriptor[] = [];
    if (this._min) {
      dates.push({ type: DateRangeType.Before, dateRange: [this._min] });
    }
    if (this._max) {
      dates.push({ type: DateRangeType.After, dateRange: [this._max] });
    }
    if (this._disabledDates?.length) {
      dates.push(...this.disabledDates);
    }

    this._dateConstraints = dates.length ? dates : undefined;
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
        .activeDate=${this.activeDate ?? this.value ?? new Date()}
        .value=${this.value ?? undefined}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${this.visibleMonths}
        .locale=${this.locale}
        .disabledDates=${this._dateConstraints!}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
        @igcChange=${this.handleCalendarChangeEvent}
        exportparts="header, header-title, header-date, content: calendar-content, navigation, months-navigation,
        years-navigation, years-range, navigation-buttons, navigation-button, days-view-container,
        days-view, months-view, years-view, days-row, label: calendar-label, week-number, week-number-inner, date,
        date-inner, first, last, inactive, hidden, weekend, range, special, disabled, single, preview,
        month, month-inner, year, year-inner, selected, current"
      >
        ${!this.isDropDown
          ? html`<slot name="title" slot="title"
              >${this.resourceStrings.selectDate}</slot
            >`
          : nothing}
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
              ${this.renderCalendar(id)}${this.renderActions()}
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

  private renderLabel(id: string) {
    return this.label
      ? html`<label
          part="label"
          for=${id}
          @click=${this.isDropDown ? nothing : this.handleAnchorClick}
          >${this.label}</label
        >`
      : nothing;
  }

  private renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected renderInput(id: string) {
    const format = formats.has(this._displayFormat!)
      ? `${this._displayFormat}Date`
      : this._displayFormat;

    // Dialog mode is always readonly, rest depends on configuration
    const readOnly = !this.isDropDown || this.readOnly || this.nonEditable;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        label=${ifDefined(this._isMaterialTheme ? this.label : undefined)}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${readOnly}
        ?required=${this.required}
        .value=${this.value ?? null}
        .locale=${this.locale}
        .prompt=${this.prompt}
        .outlined=${this.outlined}
        .placeholder=${this.placeholder}
        .min=${this.min}
        .max=${this.max}
        .invalid=${live(this.invalid)}
        @igcChange=${this.handleInputChangeEvent}
        @igcInput=${this.handleInputEvent}
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

    return html`
      ${!this._isMaterialTheme ? this.renderLabel(id) : nothing}
      ${this.renderInput(id)}${this.renderPicker(id)}${this.renderHelperText()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-picker': IgcDatePickerComponent;
  }
}
