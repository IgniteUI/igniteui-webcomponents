import { ComplexAttributeConverter, LitElement, html, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { styles } from './themes/date-picker.base.css.js';
import { styles as shared } from './themes/shared/date-picker.common.css.js';
import { all } from './themes/themes.js';
import { themes } from '../../theming/theming-decorator.js';
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
import type { AbstractConstructor } from '../common/mixins/constructor.js';
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
import IgcIconComponent from '../icon/icon.js';
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
 * @slot actions - Renders content in the action part of the picker in open state.
 *
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 */
@themes(all)
export default class IgcDatepickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDatepickerEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-datepicker';
  public static styles = [styles, shared];

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
      IgcIconComponent,
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

  @queryAssignedElements({ slot: 'helper-text' })
  private helperText!: Array<HTMLElement>;

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

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('disabledDates', { waitUntilFirstUpdate: true })
  protected constraintChange() {
    this.updateValidity();
  }

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

  protected onSlotChange() {
    this.requestUpdate();
  }

  private renderClearIcon() {
    return !this.value
      ? nothing
      : html`
          <span slot="suffix" part="clear-icon" @click=${this.clear}>
            <slot name="clear-icon" @slotchange=${this.onSlotChange}>
              <igc-icon
                name="clear"
                collection="internal"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        `;
  }

  private renderCalendarIcon() {
    const defaultIcon = html`
      <igc-icon
        name="calendar"
        collection="internal"
        aria-hidden="true"
      ></igc-icon>
    `;

    const state = this.open ? 'calendar-icon-open' : 'calendar-icon';

    return html`
      <span slot="prefix" part=${state} @click=${this.handleAnchorClick}>
        <slot name=${state} @slotchange=${this.onSlotChange}>
          ${defaultIcon}
        </slot>
      </span>
    `;
  }

  private renderCalendar(id: string) {
    const role = this.isDropDown ? 'dialog' : undefined;
    const hideHeader = this.isDropDown ? true : this.hideHeader;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role=${ifDefined(role)}
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
        .disabledDates=${this.disabledDates}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
        @igcChange=${this.handleCalendarChangeEvent}
      >
        ${!this.isDropDown
          ? html`<slot
              name="title"
              slot="title"
              @slotchange=${this.onSlotChange}
            >
              Select date
            </slot> `
          : nothing}
      </igc-calendar>
    `;
  }

  protected renderActions() {
    // If in dialog mode use the dialog footer slot
    return html`
      <div
        part="actions"
        ?hidden=${!this.actions.length}
        slot=${ifDefined(
          this.isDropDown || !this.actions.length ? undefined : 'footer'
        )}
      >
        <slot name="actions"></slot>
      </div>
    `;
  }

  protected renderPicker(id: string) {
    return this.isDropDown
      ? html`
          <igc-popover
            ?open=${this.open}
            anchor=${id}
            strategy="fixed"
            flip
            shift
            same-width
          >
            <igc-focus-trap ?disabled=${!this.open || this.disabled}>
              ${this.renderCalendar(id)}${this.renderActions()}
            </igc-focus-trap>
          </igc-popover>
        `
      : html`
          <igc-dialog
            aria-label="Select date"
            role="dialog"
            ?open=${this.open}
            ?close-on-outside-click=${!this.keepOpenOnOutsideClick}
            hide-default-action
            @igcClosing=${() => this._hide(true)}
          >
            ${this.renderCalendar(id)}${this.renderActions()}
          </igc-dialog>
        `;
  }

  private renderLabel(id: string) {
    return this.label
      ? html`<label part="label" for="${id}">${this.label}</label>`
      : nothing;
  }

  private renderHelperText() {
    return html`<div part="helper-text" ?hidden="${!this.helperText.length}">
      <slot name="helper-text" @slotchange=${this.onSlotChange}></slot>
    </div>`;
  }

  protected renderInput(id: string) {
    const format = formats.has(this._displayFormat!)
      ? `${this._displayFormat}Date`
      : this._displayFormat;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="dialog"
        aria-expanded=${this.open}
        input-format=${ifDefined(this._inputFormat)}
        display-format=${ifDefined(format)}
        ?disabled=${this.disabled}
        ?readonly=${this.nonEditable || this.readOnly}
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
      >
        <slot
          name="prefix"
          slot="${ifDefined(!this.prefixes.length ? undefined : 'prefix')}"
          @slotchange=${this.onSlotChange}
        ></slot>
        ${this.renderClearIcon()}${this.renderCalendarIcon()}
        <slot
          name="suffix"
          slot="${ifDefined(!this.suffixes.length ? undefined : 'suffix')}"
          @slotchange=${this.onSlotChange}
        ></slot>
      </igc-date-time-input>
    `;
  }

  protected override render() {
    const id = this.id || this.inputId;

    return html`${this.renderLabel(id)}${this.renderInput(id)}
    ${this.renderPicker(id)} ${this.renderHelperText()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-datepicker': IgcDatepickerComponent;
  }
}
