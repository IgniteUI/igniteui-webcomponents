import type { ICalendarResourceStrings } from 'igniteui-i18n-core';
import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcComboBoxBaseLikeComponent } from '#internals/bases/combo-box.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { convertToDate } from '#internals/date/converters.js';
import { CalendarDay } from '#internals/date/model.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import {
  formatDisplayDate,
  getDateTimeFormat,
} from '#internals/i18n/date-formats.js';
import type { IgcCalendarResourceStrings } from '#internals/i18n/EN/calendar.resources.js';
import type { UnpackCustomEvent } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import type { FormValue } from '#internals/mixins/forms/form-value.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { asArray, firstOf } from '#internals/utils/arrays.js';
import {
  addSafeEventListener,
  focusLeftHost,
  getElementFromPath,
  preventDefault,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { equal } from '#internals/utils/objects.js';
import type { ThemingController } from '#theming/theming-controller.js';
import IgcCalendarComponent, {
  focusActiveDate,
  type ShowDateOptions,
  showDate,
} from '../calendar/calendar.js';
import {
  createDateConstraints,
  getLocaleWeekStart,
} from '../calendar/helpers.js';
import type {
  CalendarHeaderOrientation,
  DateRangeDescriptor,
  WeekDays,
} from '../calendar/types.js';
import type IgcDateRangeInputComponent from '../date-range-picker/date-range-input.js';
import type IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
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
import { type CommitPolicy, CommitSession } from './commit-session.js';
import type { CalendarBinding, PickerValueShape } from './value-shape.js';

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
const calendarExportParts =
  `header, header-title, header-date, content: calendar-content, navigation, months-navigation,
  years-navigation, years-range, navigation-buttons, navigation-button, days-view-container,
  days-view, months-view, years-view, days-row, months-row, years-row, label: calendar-label,
  label-inner: calendar-label-inner, week-number, week-number-inner, date,
  date-inner, first, last, inactive, hidden, weekend, range, special, disabled, single, preview,
  month, month-inner, year, year-inner, selected, current` as const;

/** The components rendered by the picker chrome of every picker. */
export const pickerDependencies = [
  IgcCalendarComponent,
  IgcDialogComponent,
  IgcFocusTrapComponent,
  IgcIconComponent,
  IgcPopoverComponent,
  IgcValidationContainerComponent,
];

/** The slot queries of the base picker. Structural, so each picker declares its own slot names. */
type PickerSlots = {
  hasAssignedElements(slot: string): boolean;
};

/** An editor of a picker: a date-time input, or the masked single input of a range. */
export type PickerEditor =
  | IgcDateTimeInputComponent
  | IgcDateRangeInputComponent;

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
> extends FormAssociatedRequiredMixin(IgcComboBoxBaseLikeComponent) {
  /* blazorSuppress */
  // Typing only: each picker applies `EventEmitterMixin` with its own event map.
  /** @hidden @internal */
  declare public emitEvent: <
    K extends keyof IgcPickerBaseEventMap<Date | DateRangeValue>,
    D extends UnpackCustomEvent<
      IgcPickerBaseEventMap<Date | DateRangeValue>[K]
    >,
  >(
    event: K,
    eventInitDict?: CustomEventInit<D>
  ) => boolean;

  //#region Internal state and properties

  protected readonly _session = new CommitSession<T>({
    policy: () => this._commitPolicy(),
    read: () => this._value,
    write: (value) =>
      this._writeFrom('edit', () => {
        this._value = value;
      }),
    report: (force) => this._reportChange(this._value, force),
  });

  /** The value as the user types it. Without a draft, the calendar shows the value. */
  @state({ hasChanged: (value, old) => !equal(value, old) })
  protected _draft?: { value: T | null };

  protected _activeDate: Date | null = null;
  protected _min: Date | null = null;
  protected _max: Date | null = null;
  protected _dateConstraints: DateRangeDescriptor[] = [];
  protected _displayFormat?: string;
  protected _inputFormat?: string;
  protected _visibleMonths = 1;
  private _weekStart?: WeekDays;

  @query(IgcCalendarComponent.tagName)
  protected readonly _calendar!: IgcCalendarComponent;

  @query(IgcDialogComponent.tagName)
  private readonly _dialog?: IgcDialogComponent;

  private get _calendarSelection(): CalendarBinding {
    return this._shape.toCalendar(
      this._draft ? this._draft.value : this._value
    );
  }

  private get _startDate(): Date | null {
    const { value, values } = this._shape.toCalendar(this._value);
    return this._activeDate ?? value ?? firstOf(values) ?? null;
  }

  protected get _value(): T | null {
    return this._formValue.value;
  }

  protected set _value(value: T | null) {
    const previous = this._value;
    this._formValue.setValueAndFormState(value);
    this._draft = undefined;
    if (!this._activeDate) {
      this._setCalendarActiveDate(this._startDate);
    }
    this.requestUpdate('value', previous);
  }

  protected get _isDropDown(): boolean {
    return this.mode === 'dropdown';
  }

  protected get _isMaterial(): boolean {
    return this._themes.theme === 'material';
  }

  /** Whether a click on the editor or the label opens the dialog. */
  protected get _opensOnClick(): boolean {
    return !(this._isDropDown || this.readOnly);
  }

  /** Dialog mode is always read-only, the rest depends on the configuration. */
  protected get _isEditorReadOnly(): boolean {
    return !this._isDropDown || this.readOnly || this.nonEditable;
  }

  protected override get _blocksImplicitSubmission(): boolean {
    return true;
  }

  //#endregion

  //#region Abstract members

  /** The id of the editor the picker is anchored to. */
  protected abstract readonly _inputId: string;

  protected abstract readonly _slots: PickerSlots;

  protected abstract readonly _themes: ThemingController;

  /** Supplied by `I18nMixin` in each picker; TypeScript does not check the two match. */
  protected abstract readonly _i18nController: { locale: string };

  protected abstract readonly _shape: PickerValueShape<T>;

  declare protected readonly _formValue: FormValue<T | null>;

  protected abstract override get _ownedEditors(): (PickerEditor | undefined)[];

  /** The strings the picker forwards to its calendar. */
  protected abstract get _calendarResourceStrings(): IgcCalendarResourceStrings &
    Required<ICalendarResourceStrings>;

  /** Restores focus to the editor after a calendar selection. */
  protected abstract _focusAndSelectInput(): void;

  //#endregion

  //#region Overridable hooks

  protected get _calendarIconTitle(): string | undefined {
    return undefined;
  }

  /** The accessible name of the picker in dialog mode. */
  protected get _dialogLabel(): string | undefined {
    return this._calendarResourceStrings.calendar_select_date;
  }

  /** The format the editor(s) fall back to when no display format is set. */
  protected get _defaultDisplayFormat(): string | undefined {
    return undefined;
  }

  /** The format the editor(s) fall back to when no input format is set. */
  protected get _defaultInputFormat(): string | undefined {
    return undefined;
  }

  /** When a calendar selection is committed. */
  protected _commitPolicy(): CommitPolicy {
    return 'at-once';
  }

  //#endregion

  //#region Public properties and attributes

  /**
   * Whether the calendar opens in a dropdown or in a modal dialog.
   * In `dialog` mode, the user cannot type in the input.
   * @attr mode
   * @default dropdown
   */
  @property()
  public mode: PickerMode = 'dropdown';

  /**
   * Whether the control is read-only. The user cannot change the value or open the calendar.
   * @attr readonly
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * Whether the user cannot type in the input. The user can still select a date in the calendar.
   * @attr non-editable
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'non-editable' })
  public nonEditable = false;

  /**
   * Whether the control has an outlined appearance.
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
   * The format of the value while the input does not have focus.
   * Without it, the input uses `inputFormat` when set, else the display format of the locale.
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
   * The date format of the input while the user edits the value.
   * Without it, the input uses the input format of the locale.
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
   * The minimum value required for the picker to remain valid.
   * The calendar disables the dates before it.
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
   * The calendar disables the dates after it.
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
   * The date ranges that the user cannot select in the calendar.
   * A value that includes one of these dates is invalid.
   */
  @property({ attribute: false })
  @coercedProperty<DateRangeDescriptor[], IgcDatePickerBaseComponent<T>>({
    onChange: ({ host }) => {
      host._setDateConstraints();
      host._validate();
    },
  })
  public disabledDates: DateRangeDescriptor[] = [];

  /** The date ranges that the calendar marks as special. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  /**
   * The date that the calendar shows and highlights.
   * Without it, the calendar starts at the value, or at the current date when there is no value.
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
   * The orientation of the calendar header. It applies only in `dialog` mode.
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
   * Whether the calendar hides its header. In `dropdown` mode, the header is always hidden.
   * @attr hide-header
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-header' })
  public hideHeader = false;

  /**
   * Whether the calendar hides the dates that do not belong to the current month.
   * @attr hide-outside-days
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /**
   * Whether the calendar shows the week numbers.
   * @attr show-week-numbers
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * The first day of the week in the calendar.
   *
   * @remarks
   * When not set, the week starts on the first day of the week of the current {@link locale}.
   * Setting `undefined` returns to the locale value.
   * @attr week-start
   */
  @property({ attribute: 'week-start' })
  public set weekStart(value: WeekDays | undefined) {
    this._weekStart = value ?? undefined;
  }

  public get weekStart(): WeekDays {
    return this._weekStart ?? getLocaleWeekStart(this._i18nController.locale);
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    addAriaProjector(this, {
      target: () => firstOf(this._ownedEditors) ?? null,
      state: () => ({
        hasPopup: 'dialog',
        required: this.required ? 'true' : undefined,
      }),
    });

    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, {
      skip: () => this.disabled || this.readOnly,
    })
      .set([altKey, arrowDown], this._handleAnchorClick)
      .set([altKey, arrowUp], this._onEscapeKey)
      .set(escapeKey, this._onEscapeKey, { when: () => this.open });
  }

  protected override willUpdate(props: PropertyValues): void {
    super.willUpdate(props);

    // Disabling is not a confirm. Check the state, not a change: a draft can
    // outlive `hide()`, and a fieldset changes no property.
    if (this.disabled) {
      this._session.cancel();
    }
  }

  //#endregion

  //#region Internal API

  protected _focusInput(): void {
    firstOf(this._ownedEditors)?.focus();
  }

  protected override _formatValidationValue(
    value: unknown,
    locale: string
  ): string {
    return formatDisplayDate(
      value as Date,
      locale,
      getDateTimeFormat(this.displayFormat)
    );
  }

  protected _setDateConstraints(): void {
    this._dateConstraints = createDateConstraints(
      this._min,
      this._max,
      this.disabledDates
    );
  }

  /** In dialog mode, plays the dialog animations; a close keeps `open` true until the exit ends. */
  protected override _toggleTransition(
    open: boolean,
    signal: AbortSignal
  ): boolean | Promise<boolean> {
    const dialog = this._isDropDown ? undefined : this._dialog;

    if (!open && dialog?.open) {
      // A newer open ends the exit at once, so a later close can play its own.
      signal.addEventListener(
        'abort',
        () => {
          if (this.open) keepDialogOpen(dialog);
        },
        { once: true }
      );

      const hidden = dialog.hide();
      // A dialog that has not opened yet closes at once, so the first render must not open it.
      if (!dialog.open) this.open = false;

      return hidden.then((completed) => {
        if (completed && !signal.aborted) this.open = false;
        return completed;
      });
    }

    this.open = open;

    if (!open || !dialog) return true;

    if (dialog.open) {
      keepDialogOpen(dialog);
      return true;
    }

    // `open` set to `false` ends the entrance. `?open` skips a value equal to
    // its last commit, so check after the render.
    signal.addEventListener(
      'abort',
      () => {
        this.updateComplete.then(() => {
          if (!this.open) dialog.open = false;
        });
      },
      { once: true }
    );

    return dialog.show();
  }

  protected async _shouldCloseCalendarDropdown(): Promise<void> {
    if (this.keepOpenOnSelect) {
      return;
    }

    if (await this._hide(true)) {
      this._focusAndSelectInput();
    }
  }

  protected _setCalendarActiveDate(
    date: Date | null | undefined,
    options?: ShowDateOptions
  ): void {
    if (date && this._calendar) showDate(this._calendar, date, options);
  }

  /** Writes the value back onto the calendar. A read-only picker has no binding change to commit it. */
  protected async _restoreCalendarSelection(): Promise<void> {
    await this._calendar.updateComplete;

    const { value, values } = this._calendarSelection;
    this._calendar.value = value;
    this._calendar.values = values;
  }

  /** Commits a value from an editor. An edit back to the reported value emits nothing. */
  protected _commitEditorValue(value: T | null): void {
    this._writeFrom('user', () => this._session.commitEdit(value));
  }

  /**
   * Closes the picker with the close events. `apply` commits or reverts the value, and runs only when the close goes
   * on, so a canceled `igcClosing` changes nothing. A running close already decided the value, so the call does nothing
   * then.
   */
  protected _closeWith(apply: () => void): Promise<boolean> {
    if (!this.open || this._isClosing) return Promise.resolve(false);

    const closed = this._hide(true);
    // The exit runs, or a close without one is done.
    if (this._isClosing || !this.open) apply();
    return closed;
  }

  //#endregion

  //#region Public methods

  /* alternateName: focusComponent */
  /** Sets focus on the picker. */
  public override focus(options?: FocusOptions): void {
    super.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the picker. */
  public override blur(): void {
    cancelDeferredFocus(this);
    super.blur();
  }

  /** Clears the value and the input text of the picker. */
  public clear(): void {
    this._session.clear();

    // The editors report nothing; the picker reports the clear on blur.
    for (const editor of this._ownedEditors) {
      editor?.clear();
    }
  }

  //#endregion

  //#region Event handlers

  protected async _onEscapeKey(): Promise<void> {
    // Revert as the close starts, as Cancel does, so a reopen during the exit keeps the old value.
    if (await this._closeWith(() => this._session.cancel())) this._focusInput();
  }

  protected override async _handleAnchorClick(): Promise<void> {
    super._handleAnchorClick();
    this._setCalendarActiveDate(this._startDate ?? this._calendar?.activeDate, {
      first: true,
    });
    await this.updateComplete;
    this._calendar[focusActiveDate]({ preventScroll: true });
  }

  protected _handleInputClick(event: Event): void {
    if (getElementFromPath('input', event)) {
      this._handleAnchorClick();
    }
  }

  protected _handleFocusOut(event: FocusEvent): void {
    if (focusLeftHost(this, event)) {
      this._handleBlur();
      this._session.blur();
    }
  }

  protected async _handleCalendarChangeEvent(
    event: CustomEvent<Date | Date[]>
  ): Promise<void> {
    event.stopPropagation();

    // The running close decides the value.
    if (this.readOnly || this._isClosing) {
      this._setTouchedState();
      await this._restoreCalendarSelection();
      return;
    }

    const dates = asArray(event.detail);

    this._writeFrom('user', () =>
      this._session.pick(this._shape.fromCalendar(dates))
    );

    if (this._commitPolicy() === 'at-once' && this._shape.closesOnPick(dates)) {
      this._shouldCloseCalendarDropdown();
    }
  }

  /** Runs the close through the picker; a canceled `igcClosing` keeps the dialog open and commits nothing. */
  protected _handleDialogClosing(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this._closeWith(() => this._session.confirm());
  }

  //#endregion

  //#region Rendering

  protected _renderClearIcon(part = 'clear-icon') {
    return this._value !== null
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

    // `preventDefault` stops `delegatesFocus` from focusing the editor, which turns invalid on blur.
    return html`
      <span
        slot="prefix"
        part=${part}
        @pointerdown=${preventDefault}
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

  /** The icons and prefix/suffix slots of an editor. `suffix` identifies the editor, for example `-start`. */
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
      <slot name="title" slot="title"
        >${this._calendarResourceStrings.calendar_select_date}</slot
      >
      <slot
        name="header-date"
        slot=${bindIf(hasHeaderDate, 'header-date')}
      ></slot>
    `;
  }

  protected _renderCalendar(id: string) {
    const hideHeader = this._isDropDown || this.hideHeader;
    const selection = this._calendarSelection;

    return html`
      <igc-calendar
        aria-labelledby=${id}
        role="dialog"
        selection=${this._shape.selection}
        .inert=${!this.open}
        ?show-week-numbers=${this.showWeekNumbers}
        ?hide-outside-days=${this.hideOutsideDays}
        ?hide-header=${hideHeader}
        .activeDate=${
          // Lit commits an object binding on each render, which would undo the user's navigation.
          guard(
            [this._activeDate],
            () => this._startDate ?? CalendarDay.today.native
          )
        }
        .value=${selection.value}
        .values=${selection.values}
        .headerOrientation=${this.headerOrientation}
        .orientation=${this.orientation}
        .visibleMonths=${this._visibleMonths}
        .locale=${this._i18nController.locale}
        .resourceStrings=${this._calendarResourceStrings}
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
    return this._isDropDown
      ? html`
          <igc-popover
            ?open=${this.open}
            anchor=${id}
            flip
            .scrollStrategy=${this.scrollStrategy}
            @igcPopoverScrollClose=${this._handleClosing}
          >
            <igc-focus-trap ?disabled=${!this.open}>
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
            exportparts="base: dialog-base, title, footer"
          >
            ${this._renderPickerContent(id)}${this._renderDialogFooter()}
          </igc-dialog>
        `;
  }

  //#endregion
}

/** Ends a running exit of the dialog without an animation. */
function keepDialogOpen(dialog: IgcDialogComponent): void {
  dialog.open = false;
  dialog.open = true;
}
