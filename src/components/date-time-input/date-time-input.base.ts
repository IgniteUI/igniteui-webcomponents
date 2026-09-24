import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { eventOptions, property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import {
  addAriaTarget,
  helperText,
} from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '#internals/controllers/key-bindings.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { convertToDate } from '#internals/date/converters.js';
import { blazorDeepImport } from '#internals/decorators/blazorDeepImport.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { addI18nController } from '#internals/i18n/i18n-controller.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import type { FormValue } from '#internals/mixins/forms/form-value.js';
import {
  MaskBehaviorMixin,
  type MaskSelection,
} from '#internals/mixins/mask-behavior.js';
import {
  nextInputId,
  renderInputShell,
  resolveInputPartNames,
} from '#internals/templates/input-shell.js';
import { renderMaskedNativeInput } from '#internals/templates/masked-input.js';
import { equal } from '#internals/utils/objects.js';
import type { ThemingController } from '#theming/theming-controller.js';
import type { RangeTextSelectMode } from '../types.js';
import {
  type DatePartDeltas,
  DatePartType,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
  type IDatePart,
} from './date-part.js';
import type { DateFormatMaskParser } from './datetime-mask-parser.js';
import { dateTimeInputValidators } from './validators.js';

export type { MaskSelection };

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'range-overflow',
  'range-underflow',
  'custom-error',
  'invalid'
);

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/* omitModule */
@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcDateTimeInputBaseComponent<
  T,
> extends MaskBehaviorMixin(FormAssociatedRequiredMixin(LitElement)) {
  // #region Internal state and properties

  protected abstract readonly _themes: ThemingController;

  protected abstract override readonly _parser: DateFormatMaskParser<IDatePart>;

  protected readonly _slots = addSlotController(this, { slots: Slots });

  protected readonly _inputId = nextInputId();

  @query('input')
  protected override readonly _input?: HTMLInputElement;

  /**
   * Names and describes the native input, and applies the ARIA that a
   * composite host, for example `igc-date-picker`, projects. See
   * {@link addAriaTarget}.
   */
  protected readonly _ariaTarget = addAriaTarget(this, {
    description: () => helperText(this, this._slots),
    hasOwnLabel: () => Boolean(this.label),
  });

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  private readonly _i18nController = addI18nController(this, {
    defaultEN: {},
    onResourceChange: this._handleResourceChange,
  });

  protected _min: Date | null = null;
  protected _max: Date | null = null;

  protected _displayFormat?: string;
  protected _inputFormat?: string;

  /** The locale-default display format, resolved by the i18n controller. */
  protected get _defaultDisplayFormat(): string {
    return this._i18nController.localeDisplayFormat;
  }

  /**
   * Whether the user has an uncommitted edit.
   *
   * @remarks
   * While set, the masked text is the source of truth, not the public `value`.
   * Typing changes only the mask, and the parsed result reaches `value`, with
   * `igcChange`, when the edit commits on blur. `value` thus agrees with the
   * last `igcChange`, which stops a host that binds the property two ways from
   * replacing a half-typed mask on an unrelated render.
   */
  protected _isEditing = false;

  /** The value the input was focused with, used to detect a committed change. */
  protected _oldValue: T | null = null;

  /**
   * The value in the editor: the parsed draft during an edit, and the committed
   * public value in all other cases.
   *
   * @hidden @internal
   */
  public get _uncommittedValue(): T | null {
    return this._isEditing ? this._parseMask(true) : this.value;
  }

  /** The spin amount for each date part - the defaults overlaid with `spinDelta`. */
  protected get _datePartDeltas(): DatePartDeltas {
    return { ...DEFAULT_DATE_PARTS_SPIN_DELTAS, ...this.spinDelta };
  }

  protected get _targetDatePart(): unknown {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  // #endregion

  // #region Public attributes and properties

  /**
   * Whether the control will have outlined appearance.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * The label for the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public get inputFormat(): string {
    return this._inputFormat || this._parser.mask;
  }

  public set inputFormat(val: string) {
    if (val) {
      this._applyMask(val);
      this._inputFormat = val;
      this._updateMaskDisplay();
    }
  }

  /**
   * The minimum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._validate();
  }

  public get min(): Date | null {
    return this._min;
  }

  /**
   * The maximum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set max(value: Date | string | null | undefined) {
    this._max = convertToDate(value);
    this._validate();
  }

  public get max(): Date | null {
    return this._max;
  }

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
    return (
      this._displayFormat ?? this._inputFormat ?? this._defaultDisplayFormat
    );
  }

  /**
   * Delta values used to increment or decrement each date part on step actions.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public spinDelta?: DatePartDeltas;

  /**
   * Sets whether to loop over the currently spun segment.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  /**
   * The locale used to format the display value and to resolve the
   * component's resource strings. Falls back to the global locale when not set.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale(): string {
    return this._i18nController.locale;
  }

  // #endregion

  //#region Lifecycle Hooks

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.readOnly,
      bindingDefaults: { repeat: true },
    })
      .set([ctrlKey, ';'], this._setCurrentDateTime)
      .set(arrowUp, this._keyboardSpin.bind(this, 'up'))
      .set(arrowDown, this._keyboardSpin.bind(this, 'down'))
      .set([ctrlKey, arrowLeft], this._navigateParts.bind(this, 0))
      .set([ctrlKey, arrowRight], this._navigateParts.bind(this, 1));
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('locale')) {
      this._initializeDefaultMask();
    }

    if (props.has('displayFormat') || props.has('locale')) {
      this._updateMaskDisplay();
    }

    super.update(props);
  }

  //#endregion

  // #region Event handlers

  private _handleResourceChange(): void {
    this._initializeDefaultMask();
    this._updateMaskDisplay();
  }

  protected _handleDragLeave(): void {
    if (!this._focused) {
      this._updateMaskDisplay();
    }
  }

  protected _handleDragEnter(): void {
    if (!this._focused) {
      this._maskedValue = this._buildMaskedValue();
    }
  }

  protected async _handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;

    if (this._isValueEmpty()) {
      this._maskedValue = this._parser.emptyMask;
      this._historyResync();
      await this.updateComplete;
      this.select();
      return;
    }

    if (this.displayFormat !== this.inputFormat) {
      this._updateMaskDisplay();
    }

    this._historyResync();
  }

  protected override _handleBlur(): void {
    this._focused = false;
    this._commitEdit();
    super._handleBlur();
  }

  /**
   * Handles wheel events for spinning date parts.
   */
  @eventOptions({ passive: false })
  protected async _handleWheel(event: WheelEvent): Promise<void> {
    if (!this._focused || this.readOnly) return;

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this._inputSelection;
    event.deltaY > 0 ? this.stepDown() : this.stepUp();
    this._emitInputEvent();

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  // #endregion

  //#region Keybindings

  /**
   * Navigates to the previous or next date part.
   */
  protected _navigateParts(direction: number): void {
    const position = this._calculatePartNavigationPosition(
      this._input?.value ?? '',
      direction
    );
    this.setSelectionRange(position, position);
  }

  /**
   * Handles keyboard-triggered spinning (arrow up/down).
   */
  protected async _keyboardSpin(direction: 'up' | 'down'): Promise<void> {
    direction === 'up' ? this.stepUp() : this.stepDown();
    this._emitInputEvent();
    await this.updateComplete;
    this.setSelectionRange(this._maskSelection.start, this._maskSelection.end);
  }

  // #endregion

  //#region Internal API

  /** @internal */
  protected _performStep(
    datePart: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    const part = datePart || this._targetDatePart;
    if (!part) return;

    const { start, end } = this._inputSelection;
    this._setDraftValue(this._calculateSpunValue(part, delta, isDecrement));
    this.updateComplete.then(() => this._input?.setSelectionRange(start, end));
  }

  /**
   * Updates the displayed mask for the focus state. A focused editor shows the
   * editable mask, an unfocused one uses the display formatter of the leaf.
   */
  protected _updateMaskDisplay(): void {
    if (!this._focused) {
      this._maskedValue = this._buildDisplayValue();
    } else if (!this._isEditing) {
      // An edit in progress owns the masked text. Rebuilding it from `value` here
      // would discard whatever the user has typed so far.
      this._maskedValue = this._buildMaskedValue();
    }
  }

  /** Builds the editable mask shown while the input is focused. */
  protected _buildMaskedValue(): string {
    const masked = this._formatValue(this.value);

    // A value-less mask formats to the empty mask; prefer whatever is already in
    // the editor so that a partially typed mask survives a re-render.
    return masked === this._parser.emptyMask
      ? this._maskedValue || masked
      : masked;
  }

  /**
   * Applies a value from an interactive edit, such as a spin or `Ctrl + ;`.
   * A focused editor moves only the draft. Outside an edit, for example a
   * `stepUp()` from code, no blur follows to commit it.
   */
  protected _setDraftValue(value: T): void {
    if (!this._focused) {
      this.value = value;
      return;
    }

    const next = this._formatValue(value);

    this._recordHistory('atomic', next, this._inputSelection.start);

    this._isEditing = true;
    this._maskedValue = next;
    this.requestUpdate();
  }

  /**
   * Whether the committed value is empty. Focus then starts the edit from the
   * empty mask, not from the formatted value.
   */
  protected _isValueEmpty(): boolean {
    return !this.value;
  }

  /**
   * Applies a value assignment from code. Stops if the value is unchanged,
   * cancels an edit, and renders the mask again from the new value.
   */
  protected _applyValue(value: T | null): void {
    if (equal(this._formValue.value, value)) {
      return;
    }

    this._isEditing = false;
    this._formValue.setValueAndFormState(value);
    this._updateMaskDisplay();
  }

  /**
   * Reads the AM/PM designator as typed in the mask for the given format part,
   * so that a spin changes what the user sees, not the date below it.
   */
  protected _readAmPmFromMask(part?: IDatePart): string | undefined {
    return part?.type === DatePartType.AmPm
      ? this._maskedValue.substring(part.start, part.end)
      : undefined;
  }

  /** Applies the masked text to the public value without emitting anything. */
  protected _applyDraft(): void {
    this._isEditing = false;
    this.value = this._parseMask(true);
    this._updateMaskDisplay();
  }

  /**
   * Commits the draft to the public value. Emits `igcChange` if the committed
   * value differs from the value at focus.
   */
  protected _commitEdit(): void {
    // Only a real edit is parsed again. Without this guard, a mask that holds a
    // display-formatted value, in a read-only or untouched input, is read under
    // the input format and becomes wrong.
    if (this._isEditing) {
      this._isEditing = false;

      // A partially filled mask is parsed leniently, missing parts falling back to
      // their defaults; only a mask that resolves to nothing clears the value.
      const parsed = this._parseMask(false);

      if (parsed === null) {
        this.clear();
      } else {
        this.value = parsed;
      }
    }

    // The assignments above are no-ops when the value did not change, so the mask
    // still has to be flipped back to the display format explicitly.
    this._updateMaskDisplay();

    // The value can also have moved without an edit - `clear()` or a programmatic
    // assignment while focused - and that is a committed change just the same.
    if (!this.readOnly && !equal(this._oldValue, this.value)) {
      this._oldValue = this.value;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  /**
   * Marks the masked text as an uncommitted edit. The parsed result reaches the
   * public `value` at commit, not here, so that the property agrees with the
   * last `igcChange`. See {@link _isEditing}.
   */
  protected override _syncValueFromMask(): void {
    if (this._focused) {
      this._isEditing = true;
      return;
    }

    // A mask mutation outside of an editing session - e.g. text dropped onto an
    // unfocused input - has no blur coming to commit it.
    this._applyDraft();
  }

  protected override _restoreDefaultValue(): void {
    this._isEditing = false;
    super._restoreDefaultValue();
    this._updateMaskDisplay();
  }

  /**
   * Checks if all mask positions are filled (no prompt characters remain).
   */
  protected _isMaskComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  /**
   * Applies a mask pattern to the input, parsing the format string into date parts.
   */
  protected _applyMask(formatString: string): void {
    const previous = this._parser.mask;
    this._parser.mask = formatString;

    // Update placeholder if not set or if it matches the old format
    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  /** Applies the locale-default mask, unless an explicit input format is set. */
  protected _initializeDefaultMask(): void {
    if (!this._inputFormat) {
      this._applyMask(this._i18nController.localeInputFormat);
    }
  }

  /**
   * Resolves the part names for the container based on the current state.
   */
  protected _resolvePartNames(base: string): Record<string, boolean> {
    return resolveInputPartNames(this._slots, base, !this._isEmptyMask);
  }

  // #endregion

  // #region Public API

  /** Selects all the text inside the input. */
  public select(): void {
    this._input?.select();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur(): void {
    this._input?.blur();
  }

  /* blazorSuppress */
  /** Increments a date/time portion. */
  public stepUp(datePart?: unknown, delta?: number): void {
    this._performStep(datePart, delta, false);
  }

  /* blazorSuppress */
  /** Decrements a date/time portion. */
  public stepDown(datePart?: unknown, delta?: number): void {
    this._performStep(datePart, delta, true);
  }

  /* blazorSuppress */
  /** Replaces the selected text in the control and re-applies the mask. */
  public override setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ): void {
    super.setRangeText(replacement, start, end, selectMode);
    this._applyDraft();
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._isEditing = false;
    this._maskedValue = '';
    this.value = null;
    this._updateMaskDisplay();
  }

  //#endregion

  //#region Render

  protected _renderInput(): TemplateResult {
    const hasNegativeTabIndex = this.getAttribute('tabindex') === '-1';

    return renderMaskedNativeInput({
      id: this._inputId,
      partNames: this._resolvePartNames('input'),
      name: this.name,
      value: this._maskedValue,
      placeholder: this.placeholder || this._parser.emptyMask,
      readOnly: this.readOnly,
      disabled: this.disabled,
      tabindex: hasNegativeTabIndex ? -1 : undefined,
      aria: this._ariaTarget.resolveBindings(),
      onInput: this._handleInput,
      onBeforeInput: this._handleBeforeInput,
      onFocus: this._handleFocus,
      onBlur: this._handleBlur,
      onClick: this._handleClick,
      onSetMaskSelection: this._setMaskSelection,
      onCompositionStart: this._handleCompositionStart,
      onCompositionEnd: this._handleCompositionEnd,
      onWheel: this._handleWheel,
      onDragEnter: this._handleDragEnter,
      onDragLeave: this._handleDragLeave,
    });
  }

  protected override render() {
    return cache(
      renderInputShell(this, {
        theme: this._themes.theme,
        label: this.label,
        labelId: this._inputId,
        containerParts: this._resolvePartNames('container'),
        renderInput: this._renderInput,
      })
    );
  }

  //#endregion

  // #region Abstract methods and properties

  protected abstract override readonly _formValue: FormValue<T | null>;

  /** Provided by `EventEmitterMixin` in the concrete components. */
  public abstract emitEvent(name: string, init?: CustomEventInit): boolean;

  /** The committed value of the input. */
  public abstract get value(): T | null;
  public abstract set value(value: T | null);

  /**
   * Parses the masked text into the value type of the leaf.
   *
   * @remarks
   * A `strict` parse agrees with the committed value: an incomplete mask has no
   * value and gives `null`. A lenient parse completes the missing parts from
   * their defaults. An empty mask has nothing to complete and gives `null` in
   * both modes.
   */
  protected abstract _parseMask(strict: boolean): T | null;

  /** Formats a value into the editable mask. */
  protected abstract _formatValue(value: T | null): string;

  protected abstract _buildDisplayValue(): string;
  protected abstract _calculatePartNavigationPosition(
    value: string,
    direction: number
  ): number;
  protected abstract _calculateSpunValue(
    part: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): T;
  protected abstract _setCurrentDateTime(): void;
  protected abstract _getDatePartAtCursor(): unknown;
  protected abstract _getDefaultDatePart(): unknown;

  /* blazorSuppress */
  /** Whether the current format holds a date part: day, month or year. */
  public hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  /* blazorSuppress */
  /** Whether the current format holds a time part: hours, minutes or seconds. */
  public hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
  }

  // #endregion
}
