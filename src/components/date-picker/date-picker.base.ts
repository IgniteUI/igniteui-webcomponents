import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { addRootClickController } from '#internals/controllers/root-click.js';
import { convertToDate } from '#internals/date/converters.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { IgcComboBoxBaseLikeComponent } from '#internals/mixins/combo-box.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { asArray } from '#internals/utils/arrays.js';
import {
  addSafeEventListener,
  focusLeftHost,
  getElementFromPath,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { equal } from '#internals/utils/objects.js';
import type { ThemingController } from '#theming/theming-controller.js';
import IgcCalendarComponent, { focusActiveDate } from '../calendar/calendar.js';
import { createDateConstraints } from '../calendar/helpers.js';
import type {
  CalendarHeaderOrientation,
  CalendarSelection,
  DateRangeDescriptor,
  WeekDays,
} from '../calendar/types.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent from '../popover/popover.js';
import type {
  ContentOrientation,
  DateRangeValue,
  PickerMode,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';

/**
 * The events emitted by a picker driven by a calendar.
 * `T` is the value type of the picker - a single date or a date range.
 */
export interface IgcPickerBaseEventMap<T> {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<T | null>;
  igcInput: CustomEvent<T | null>;
}

/** The parts of the calendar which the pickers re-export to their own consumers. */
export const calendarExportParts =
  `header, header-title, header-date, content: calendar-content, navigation, months-navigation,
  years-navigation, years-range, navigation-buttons, navigation-button, days-view-container,
  days-view, months-view, years-view, days-row, months-row, years-row, label: calendar-label,
  label-inner: calendar-label-inner, week-number, week-number-inner, date,
  date-inner, first, last, inactive, hidden, weekend, range, special, disabled, single, preview,
  month, month-inner, year, year-inner, selected, current` as const;

/** Stable identity for "no range", so that the calendar binding is committed only once. */
const emptyValues: Date[] = [];

/** The components rendered by the picker chrome of every picker. */
export const pickerDependencies = [
  IgcCalendarComponent,
  IgcDialogComponent,
  IgcFocusTrapComponent,
  IgcIconComponent,
  IgcPopoverComponent,
  IgcValidationContainerComponent,
];

/**
 * The subset of the slot controller which the base picker queries.
 * Kept structural so that each picker can declare its own set of slot names.
 */
type PickerSlots = {
  hasAssignedElements(slot: string): boolean;
};

/* blazorIndirectRender */
/* omitModule */
/**
 * Common behavior for the pickers which drive an `igc-calendar` from an editor -
 * {@link IgcDatePickerComponent} and {@link IgcDateRangePickerComponent}.
 *
 * It owns the calendar and editor facing properties, the open/close plumbing and the
 * picker chrome - calendar, popover/dialog, icons and actions. The value itself, its
 * form state and the editors are left to the concrete pickers.
 */
export abstract class IgcDatePickerBaseComponent<
  T extends Date | DateRangeValue,
> extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcPickerBaseEventMap<Date | DateRangeValue>,
    AbstractConstructor<IgcComboBoxBaseLikeComponent>
  >(IgcComboBoxBaseLikeComponent)
) {
  //#region Internal state and properties

  protected _oldValue: T | null = null;

  protected _activeDate: Date | null = null;
  protected _min: Date | null = null;
  protected _max: Date | null = null;
  protected _dateConstraints: DateRangeDescriptor[] = [];
  protected _displayFormat?: string;
  protected _inputFormat?: string;
  protected _visibleMonths = 1;

  protected override readonly _rootClickController = addRootClickController(
    this,
    { onHide: this._handleClosing }
  );

  @query(IgcCalendarComponent.tagName)
  protected readonly _calendar!: IgcCalendarComponent;

  @query('#helper-text')
  protected readonly _helperText!: IgcValidationContainerComponent | null;

  protected get _isDropDown(): boolean {
    return this.mode === 'dropdown';
  }

  protected get _isMaterial(): boolean {
    return this._themes.theme === 'material';
  }

  /** Dialog mode is always read-only, the rest depends on the configuration. */
  protected get _isEditorReadOnly(): boolean {
    return !this._isDropDown || this.readOnly || this.nonEditable;
  }

  //#endregion

  //#region Abstract members

  /** The id of the editor the picker is anchored to. */
  protected abstract readonly _inputId: string;

  /** The slots of the concrete picker. */
  protected abstract readonly _slots: PickerSlots;

  /** The theming controller of the concrete picker. */
  protected abstract readonly _themes: ThemingController;

  /**
   * The localization controller of the concrete picker.
   * Only the locale is shared - the resource strings differ per picker.
   */
  protected abstract readonly _i18nController: { locale: string };

  /**
   * The current value of the picker.
   *
   * The public `value` is declared by the concrete pickers, since its type,
   * converter and form state differ between them.
   */
  protected abstract get _value(): T | null;
  protected abstract set _value(value: T | null);

  /** Clears any user input left in the editor(s) of the picker. */
  protected abstract _clearEditors(): void;

  /** Whether the picker holds a value. */
  protected abstract get _hasValue(): boolean;

  /** The selection mode of the underlying calendar. */
  protected abstract get _calendarSelection(): CalendarSelection;

  /** The localized label of the calendar picker. */
  protected abstract get _selectDateLabel(): string | undefined;

  /**
   * The editor the host's ARIA state is projected onto — its associated
   * labels and the `aria-haspopup="dialog"` semantics of the picker, both of
   * which must land on the native input assistive technology reports.
   */
  protected abstract get _projectionTarget(): Element | null;

  /** Moves focus to the editor of the picker. */
  protected abstract _focusInput(): void;

  /** Restores focus to the editor after a value has been selected in the calendar. */
  protected abstract _focusAndSelectInput(): void;

  /**
   * Resolves the value of the picker from the dates selected in the calendar, which come
   * in ascending order.
   */
  protected abstract _valueFromCalendarSelection(dates: Date[]): T | null;

  //#endregion

  //#region Overridable hooks

  /** The value reflected in the calendar when it is in single selection mode. */
  protected get _calendarValue(): Date | null {
    return null;
  }

  /** The values reflected in the calendar when it is in range selection mode. */
  protected get _calendarValues(): Date[] | null {
    return null;
  }

  /**
   * Seeds the active date of the calendar on the initial render, when the picker holds
   * a value but no explicit active date. From then on the calendar owns its active date
   * and `activeDate` reads it back, so this is consulted once.
   */
  protected get _defaultActiveDate(): Date | null {
    return this._calendarValue;
  }

  /** The title of the calendar icon, if the picker provides one. */
  protected get _calendarIconTitle(): string | undefined {
    return undefined;
  }

  /** The accessible name of the picker in dialog mode. */
  protected get _dialogLabel(): string | undefined {
    return this._selectDateLabel;
  }

  /** The format the editor(s) fall back to when no display format is set. */
  protected get _defaultDisplayFormat(): string | undefined {
    return undefined;
  }

  /** The format the editor(s) fall back to when no input format is set. */
  protected get _defaultInputFormat(): string | undefined {
    return undefined;
  }

  /** Whether the current calendar selection is complete enough to close the picker. */
  protected _canCloseOnSelect(): boolean {
    return true;
  }

  /** Invoked when the picker is dismissed through the Escape key. */
  protected _handleDismiss(): void {}

  /** Invoked when focus has left the picker for good. */
  protected _onBlur(): void {}

  /** Invoked when the dialog of the picker is closing, before the picker is hidden. */
  protected _onDialogClosing(): void {}

  /** Invoked when the picker is toggled, before the update is awaited. */
  protected _syncCalendarOnToggle(): void {}

  /** Whether a selection made in the calendar commits the value of the picker right away. */
  protected _commitsCalendarSelection(): boolean {
    return true;
  }

  //#endregion

  //#region Public properties and attributes

  /**
   * Determines whether the calendar is opened in a dropdown or a modal dialog.
   * @attr mode
   * @default dropdown
   */
  @property()
  public mode: PickerMode = 'dropdown';

  /**
   * Makes the control a readonly field.
   * @attr readonly
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * Whether to allow typing in the input.
   * @attr non-editable
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'non-editable' })
  public nonEditable = false;

  /**
   * Whether the control will have outlined appearance.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The label of the picker.
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * The prompt symbol to use for unfilled parts of the mask.
   * @attr
   * @default _
   */
  @property()
  public prompt = '_';

  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public set displayFormat(value: string) {
    this._displayFormat = value;
  }

  public get displayFormat(): string {
    return (this._displayFormat ?? this._defaultDisplayFormat)!;
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
    return (this._inputFormat ?? this._defaultInputFormat)!;
  }

  /**
   * Gets/Sets the locale used for formatting the display value.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale(): string {
    return this._i18nController.locale;
  }

  /**
   * The minimum value required for the picker to remain valid.
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
   * The maximum value required for the picker to remain valid.
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

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  @coercedProperty<DateRangeDescriptor[], IgcDatePickerBaseComponent<T>>({
    onChange: ({ host }) => {
      host._setDateConstraints();
      host._validate();
    },
  })
  public disabledDates: DateRangeDescriptor[] = [];

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

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
   * The number of months displayed in the calendar.
   * @attr visible-months
   * @default 1
   */
  @property({ type: Number, attribute: 'visible-months' })
  public set visibleMonths(value: number) {
    this._visibleMonths = value;
  }

  public get visibleMonths(): number {
    return this._visibleMonths;
  }

  /**
   * The orientation of the calendar header.
   * @attr header-orientation
   * @default horizontal
   */
  @property({ attribute: 'header-orientation', reflect: true })
  public headerOrientation: CalendarHeaderOrientation = 'horizontal';

  /**
   * The orientation of the multiple months displayed in the calendar's days view.
   * @attr
   * @default horizontal
   */
  @property()
  public orientation: ContentOrientation = 'horizontal';

  /**
   * Determines whether the calendar hides its header.
   * @attr hide-header
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-header' })
  public hideHeader = false;

  /**
   * Controls the visibility of the dates that do not belong to the current month.
   * @attr hide-outside-days
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /**
   * Whether to show the number of the week in the calendar.
   * @attr show-week-numbers
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /** Sets the start day of the week for the calendar. */
  @property({ attribute: 'week-start' })
  public weekStart: WeekDays = 'sunday';

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    // Projects the host's labels and popup semantics onto the native input
    // inside the editor (see ProjectedARIA for why the host cannot publish
    // these itself).
    addAriaProjector(this, {
      target: () => this._projectionTarget,
      state: () => ({
        hasPopup: 'dialog',
        labelledBy: this._internals.labels,
        describedBy: this._helperText ? [this._helperText] : null,
      }),
    });

    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, {
      skip: () => this.disabled || this.readOnly,
    })
      .set([altKey, arrowDown], this._handleAnchorClick)
      .set([altKey, arrowUp], this._onEscapeKey)
      .set(escapeKey, this._onEscapeKey);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('open')) {
      this._rootClickController.update();

      if (this.open) {
        this._oldValue = this._value;
      }
    }
  }

  //#endregion

  //#region Internal API

  protected _setDateConstraints(): void {
    this._dateConstraints =
      createDateConstraints(this._min, this._max, this.disabledDates) ?? [];
  }

  protected async _shouldCloseCalendarDropdown(): Promise<void> {
    if (this.keepOpenOnSelect || !this._canCloseOnSelect()) {
      return;
    }

    if (await this._hide(true)) {
      this._focusAndSelectInput();
    }
  }

  /**
   * Pushes the value of the picker back onto the calendar, which a read-only picker has
   * to do directly - the binding is left with nothing to re-commit.
   */
  protected async _restoreCalendarSelection(): Promise<void> {
    await this._calendar.updateComplete;

    if (this._calendarSelection === 'single') {
      this._calendar.value = this._calendarValue;
    } else {
      this._calendar.values = this._calendarValues ?? emptyValues;
    }
  }

  /** Emits `igcChange` if the value has moved away from the last committed one. */
  protected _emitChangeIfDirty(): void {
    if (!equal(this._value, this._oldValue)) {
      this.emitEvent('igcChange', { detail: this._value });
      this._oldValue = this._value;
    }
  }

  //#endregion

  //#region Public methods

  /** Clears the editor(s) of the picker of any user input. */
  public clear(): void {
    this._oldValue = this._value;
    this._value = null;
    this._clearEditors();
  }

  //#endregion

  //#region Event handlers

  protected async _onEscapeKey(): Promise<void> {
    if (await this._hide(true)) {
      this._handleDismiss();
      this._focusInput();
    }
  }

  protected override async _handleAnchorClick(): Promise<void> {
    super._handleAnchorClick();
    this._syncCalendarOnToggle();
    await this.updateComplete;
    this._calendar[focusActiveDate]({ preventScroll: true });
  }

  protected _handleInputClick(event: Event): void {
    if (getElementFromPath('input', event)) {
      // Open only if the click originates from the underlying input
      this._handleAnchorClick();
    }
  }

  protected _handleCalendarIconSlotPointerDown(event: PointerEvent): void {
    // Keeps the `delegatesFocus` of the host from focusing the editor, which would enter
    // an invalid state on blur as focus moves on to the calendar.
    event.preventDefault();
  }

  protected _handleFocusOut(event: FocusEvent): void {
    if (focusLeftHost(this, event)) {
      this._handleBlur();
      this._onBlur();
    }
  }

  protected _handleClosing(): void {
    this._hide(true);
  }

  protected async _handleCalendarChangeEvent(
    event: CustomEvent<Date | Date[]>
  ): Promise<void> {
    event.stopPropagation();
    this._setTouchedState();

    if (this.readOnly) {
      await this._restoreCalendarSelection();
      return;
    }

    this._value = this._valueFromCalendarSelection(asArray(event.detail));

    if (this._commitsCalendarSelection()) {
      this.emitEvent('igcChange', { detail: this._value });
    }

    this._shouldCloseCalendarDropdown();
  }

  protected _handleDialogClosing(event: Event): void {
    event.stopPropagation();
    this._onDialogClosing();
    this._hide(true);
  }

  protected _handleDialogClosed(event: Event): void {
    event.stopPropagation();
  }

  //#endregion

  //#region Rendering

  protected _renderClearIcon(part = 'clear-icon') {
    return this._hasValue
      ? html`
          <span
            slot="suffix"
            part=${part}
            @click=${bindIf(!this.readOnly, this.clear)}
          >
            ${renderSlottedIcon({ slot: part, icon: 'input_clear' })}
          </span>
        `
      : nothing;
  }

  protected _renderCalendarIcon(suffix = '') {
    const part = `${this.open ? 'calendar-icon-open' : 'calendar-icon'}${suffix}`;

    return html`
      <span
        slot="prefix"
        part=${part}
        @pointerdown=${this._handleCalendarIconSlotPointerDown}
        @click=${bindIf(!this.readOnly, this._handleAnchorClick)}
      >
        ${renderSlottedIcon({
          slot: part,
          icon: 'today',
          title: this._calendarIconTitle,
        })}
      </span>
    `;
  }

  /**
   * The content projected into an editor of the picker - its icons and prefix/suffix slots.
   *
   * The suffix distinguishes the editors of a picker which renders more than one,
   * e.g. `-start` and `-end`.
   */
  protected _renderEditorSlots(suffix = '') {
    const prefixSlot = `prefix${suffix}`;
    const suffixSlot = `suffix${suffix}`;

    return html`
      ${this._renderCalendarIcon(suffix)}
      <slot
        name=${prefixSlot}
        slot=${bindIf(this._slots.hasAssignedElements(prefixSlot), 'prefix')}
      ></slot>
      ${this._renderClearIcon(`clear-icon${suffix}`)}
      <slot
        name=${suffixSlot}
        slot=${bindIf(this._slots.hasAssignedElements(suffixSlot), 'suffix')}
      ></slot>
    `;
  }

  protected _renderCalendarSlots() {
    if (this._isDropDown) {
      return nothing;
    }

    const hasHeaderDate = this._slots.hasAssignedElements('header-date');

    return html`
      <slot name="title" slot="title">${this._selectDateLabel}</slot>
      <slot
        name="header-date"
        slot=${bindIf(hasHeaderDate, 'header-date')}
      ></slot>
    `;
  }

  protected _renderCalendar(id: string) {
    const hideHeader = this._isDropDown ? true : this.hideHeader;
    const isInert = !this.open || this.disabled;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role="dialog"
        selection=${this._calendarSelection}
        .inert=${isInert}
        ?show-week-numbers=${this.showWeekNumbers}
        ?hide-outside-days=${this.hideOutsideDays}
        ?hide-header=${hideHeader}
        .activeDate=${this.activeDate ?? this._defaultActiveDate}
        .value=${this._calendarValue}
        .values=${this._calendarValues ?? emptyValues}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${this._visibleMonths}
        .locale=${this.locale}
        .disabledDates=${this._dateConstraints}
        .specialDates=${this.specialDates}
        .weekStart=${this.weekStart}
        @igcChange=${this._handleCalendarChangeEvent}
        exportparts=${calendarExportParts}
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
        slot=${bindIf(!this._isDropDown && hasActions, 'footer')}
      >
        <slot name="actions"></slot>
      </div>
    `;
  }

  /** The content rendered inside the popover/dialog of the picker. */
  protected _renderPickerContent(id: string) {
    return html`${this._renderCalendar(id)}${this._renderActions()}`;
  }

  /** Additional content rendered in the dialog of the picker. */
  protected _renderDialogFooter(): TemplateResult | typeof nothing {
    return nothing;
  }

  protected _renderPicker(id: string) {
    const isDisabled = !this.open || this.disabled;

    return this._isDropDown
      ? html`
          <igc-popover ?open=${this.open} anchor=${id} flip shift>
            <igc-focus-trap ?disabled=${isDisabled}>
              ${this._renderPickerContent(id)}
            </igc-focus-trap>
          </igc-popover>
        `
      : html`
          <igc-dialog
            aria-label=${ifDefined(this._dialogLabel)}
            role="dialog"
            ?open=${this.open}
            ?close-on-outside-click=${!this.keepOpenOnOutsideClick}
            hide-default-action
            @igcClosing=${this._handleDialogClosing}
            @igcClosed=${this._handleDialogClosed}
            exportparts="base: dialog-base, title, footer, overlay"
          >
            ${this._renderPickerContent(id)}${this._renderDialogFooter()}
          </igc-dialog>
        `;
  }

  //#endregion
}
