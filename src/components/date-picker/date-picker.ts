import { ComplexAttributeConverter, LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import IgcCalendarComponent from '../calendar/calendar.js';
import {
  DateRangeDescriptor,
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
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  IgcCalendarResourceStringEN,
  IgcCalendarResourceStrings,
} from '../common/i18n/calendar.resources.js';
import messages from '../common/localization/validation-en.js';
import { IgcBaseComboBoxLikeComponent } from '../common/mixins/combo-box.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { createCounter, format } from '../common/util.js';
import {
  Validator,
  maxDateValidator,
  minDateValidator,
  requiredValidator,
} from '../common/validators.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DatePart } from '../date-time-input/date-util.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcPopoverComponent from '../popover/popover.js';

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
 * @element igc-datepicker
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot title - Renders content in the calendar title.
 * @slot clear-icon - Renders a clear icon template.
 * @slot calendar-icon - Renders the icon/content for the calendar picker.
 * @slot calendar-icon-open - Renders the icon/content for the picker in open state.
 *
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 */
export default class IgcDatepickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDatepickerEventMap,
    Constructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-datepicker';

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected inputId = `datepicker-${IgcDatepickerComponent.increment()}`;

  public override validators: Validator<this>[] = [
    requiredValidator,
    minDateValidator,
    maxDateValidator,
    {
      key: 'badInput',
      message: () => format(messages.disabledDate, `${this.value}`),
      isValid: () =>
        this.value
          ? !isDateInRanges(this.value, this.disabledDates ?? [])
          : true,
    },
  ];

  public static register() {
    registerComponent(
      this,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcFocusTrapComponent,
      IgcPopoverComponent,
      IgcDialogComponent
    );
  }

  private _value?: Date | null;
  private _activeDate?: Date | null;
  private _displayFormat?: string;
  private _inputFormat?: string;

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: () => this._hide(true),
  });

  @query(IgcDateTimeInputComponent.tagName, true)
  private _input!: IgcDateTimeInputComponent;

  @query(IgcCalendarComponent.tagName)
  private _calendar!: IgcCalendarComponent;

  @queryAssignedElements({ slot: 'calendar-icon' })
  protected calendarIcon!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'calendar-icon-open' })
  protected calendarIconOpen!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'clear-icon' })
  protected clearIcon!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'title' })
  protected titleSlot!: Array<HTMLElement>;

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

  /**
   * The value of the picker
   * @attr
   */
  @property({ converter: converter })
  public set value(value: Date | null) {
    this._value = value;
    this.value
      ? this.setFormValue(this.value.toISOString())
      : this.setFormValue(null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get value(): Date | null {
    return this._value ?? null;
  }

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
  public min!: Date;

  /**
   * The maximum value required for the date picker to remain valid.
   * @attr
   */
  @property({ converter: converter })
  public max!: Date;

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
  public disabledDates!: DateRangeDescriptor[];

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

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    })
      .set([altKey, arrowDown], this._show.bind(this, true))
      .set([altKey, arrowUp], this.onEscapeKey)
      .set(escapeKey, this.onEscapeKey);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateValidity();
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

  protected handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    if (this.readOnly) {
      event.preventDefault();
      this._calendar.value = this.value ?? undefined;
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

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('disabledDates', { waitUntilFirstUpdate: true })
  protected constraintChange() {
    this.updateValidity();
  }

  private renderClearIcon() {
    return (
      this.value &&
      html`<span
        slot="suffix"
        part="clear-icon"
        @click=${this.clear}
        ?hidden=${this.clearIcon.length === 0}
      >
        <slot name="clear-icon">
          <igc-icon
            name="clear"
            collection="internal"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </span>`
    );
  }

  private renderCalendarIcon() {
    const defaultIcon = '📅';
    return html`<span
      slot="suffix"
      part="${this.open ? 'calendar-icon-open' : 'calendar-icon'}"
      @click=${this.handleAnchorClick}
      ?hidden=${this.open
        ? this.calendarIconOpen.length === 0
        : this.calendarIcon.length === 0}
    >
      ${this.open
        ? html`<slot name="calendar-icon-open">${defaultIcon}</slot>`
        : html`<slot name="calendar-icon">${defaultIcon}</slot>`}
    </span>`;
  }

  private renderCalendar(id: string) {
    const calendarDisabled = !this.open || this.disabled;
    const role = this.mode === 'dropdown' ? 'dialog' : undefined;
    const hideHeader =
      (this.mode === 'dialog' && this.hideHeader) ||
      (this.mode === 'dropdown' && this.titleSlot!.length === 0);

    const calendar = html`<igc-calendar
      aria-labelledby=${id}
      role=${ifDefined(role)}
      .activeDate=${this.activeDate ?? this.value ?? new Date()}
      .value=${this.value ?? undefined}
      .inert=${!this.open || this.disabled}
      .hideHeader=${hideHeader}
      .headerOrientation=${this.headerOrientation}
      .orientation=${this.orientation}
      ?show-week-numbers=${this.showWeekNumbers}
      ?hide-outside-days=${this.hideOutsideDays}
      .visibleMonths=${this.visibleMonths}
      .locale=${this.locale}
      .disabledDates=${this.disabledDates}
      .specialDates=${this.specialDates}
      .weekStart=${this.weekStart}
      @igcChange=${this.handleCalendarChangeEvent}
    >
      ${this.mode === 'dropdown' &&
      html`<slot name="title" slot="title"></slot>`}
    </igc-calendar>`;

    if (this.mode === 'dropdown') {
      return html`<igc-popover
        ?open=${this.open}
        anchor=${id}
        strategy="fixed"
        flip
        shift
        same-width
      >
        <igc-focus-trap ?disabled=${calendarDisabled}>
          ${calendar}
        </igc-focus-trap>
      </igc-popover>`;
    } else {
      return html` <igc-dialog
        aria-label="Select date"
        ?open=${this.open}
        ?close-on-outside-click="${!this.keepOpenOnOutsideClick}"
        hide-default-action
        @igcClosing=${() => this._hide(true)}
      >
        ${calendar}
      </igc-dialog>`;
    }
  }

  protected override render() {
    const id = this.id || this.inputId;
    const displayFormat = formats.has(this._displayFormat!)
      ? `${this._displayFormat}Date`
      : this._displayFormat;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="true"
        ?disabled=${this.disabled}
        ?readonly=${this.nonEditable || this.readOnly}
        ?required=${this.required}
        label=${ifDefined(this.label)}
        aria-expanded=${this.open ? 'true' : 'false'}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(displayFormat)}
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
      >
        <slot name="prefix" slot="prefix"></slot>
        ${this.renderClearIcon()} ${this.renderCalendarIcon()}
        <slot name="suffix" slot="suffix"></slot>
        <slot name="helper-text" slot="helper-text"></slot>
      </igc-date-time-input>
      ${this.renderCalendar(id)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-datepicker': IgcDatepickerComponent;
  }
}
