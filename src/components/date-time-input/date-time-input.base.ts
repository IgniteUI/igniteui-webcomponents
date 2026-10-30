import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { eventOptions, property, query } from 'lit/decorators.js';
import {
  addAriaTarget,
  HOST_COMBOBOX_ATTRIBUTES,
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
import {
  formatDisplayDate,
  getLocaleDateTimeFormats,
} from '#internals/i18n/date-formats.js';
import { addLocaleController } from '#internals/i18n/i18n-controller.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import type { FormValue } from '#internals/mixins/forms/form-value.js';
import { MaskBehaviorMixin } from '#internals/mixins/mask-behavior.js';
import {
  nextInputId,
  renderInputShell,
  resolveInputPartFlags,
} from '#internals/templates/input-shell.js';
import { renderMaskedNativeInput } from '#internals/templates/masked-input.js';
import { equal } from '#internals/utils/objects.js';
import type { ThemingController } from '#theming/theming-controller.js';
import type { RangeTextSelectMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  type DatePartDeltas,
  DatePartType,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
  type IDatePart,
} from './date-part.js';
import type { DateFormatMaskParser } from './datetime-mask-parser.js';
import { dateTimeInputValidators } from './validators.js';

/** The direction of a part navigation: `Ctrl + ArrowLeft` or `Ctrl + ArrowRight`. */
export type PartDirection = 'back' | 'forward';

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
  P,
> extends MaskBehaviorMixin(
  FormAssociatedRequiredMixin(LitElement, HOST_COMBOBOX_ATTRIBUTES)
) {
  // #region Internal state and properties

  protected abstract readonly _themes: ThemingController;

  protected abstract override readonly _parser: DateFormatMaskParser<IDatePart>;

  protected readonly _slots = addSlotController(this, { slots: Slots });

  protected readonly _inputId = nextInputId();

  /** Part flags of the current render, shared by the container and the input. */
  private _partFlags: Record<string, boolean> = {};

  @query('input')
  protected override readonly _input?: HTMLInputElement;

  /**
   * Names and describes the native input, and applies the projected and the
   * host ARIA. See {@link addAriaTarget}.
   */
  protected readonly _ariaTarget = addAriaTarget(this, () =>
    helperText(this, this._slots)
  );

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  private readonly _localeController = addLocaleController(this);

  protected _min: Date | null = null;
  protected _max: Date | null = null;

  protected _displayFormat?: string;
  protected _inputFormat?: string;

  protected get _defaultDisplayFormat(): string {
    return getLocaleDateTimeFormats(this.locale).display;
  }

  /**
   * Whether the user has an uncommitted edit. While set, the masked text is the source
   * of truth until blur, so a two-way bound host cannot replace a half-typed mask.
   */
  protected _isEditing = false;

  /** The value the input was focused with, used to detect a committed change. */
  protected _oldValue: T | null = null;

  /**
   * The parsed draft during an edit, else the committed value.
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

  protected get _targetDatePart(): P | undefined {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  // #endregion

  // #region Public attributes and properties

  /**
   * Whether the control has an outlined appearance.
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
   * The date format of the input while the user edits the value.
   * Without it, the input uses the input format of the locale.
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
   * The format of the value while the input does not have focus.
   * Without it, the input uses `inputFormat` when set, else the display format of the locale.
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
   * The amount by which a step action increments or decrements each date part.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public spinDelta?: DatePartDeltas;

  /**
   * Whether a spun date part wraps around at its limits.
   * When false, the part stops at its minimum or maximum.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  /**
   * The locale used to format the display value. Without it, the input takes
   * its own `lang`, else the locale of the nearest ancestor that has a
   * `locale` (a component) or a `lang`, and then the global locale.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._localeController.locale = value;
  }

  public get locale(): string {
    return this._localeController.locale;
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
      .set(arrowUp, this._keyboardSpin.bind(this, 1))
      .set(arrowDown, this._keyboardSpin.bind(this, -1))
      .set([ctrlKey, arrowLeft], this._navigateParts.bind(this, 'back'))
      .set([ctrlKey, arrowRight], this._navigateParts.bind(this, 'forward'));
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

  protected _handleDragEnter(): void {
    if (!this._focused) {
      this._maskedValue = this._buildMaskedValue();
    }
  }

  protected override _handleFocus(): Promise<void> {
    if (!this.readOnly) {
      this._oldValue = this.value;
    }

    return super._handleFocus();
  }

  protected override _showEditMask(): void {
    if (this.displayFormat !== this.inputFormat) {
      this._updateMaskDisplay();
    }
  }

  protected override _handleBlur(): void {
    this._focused = false;
    this._commitEdit();
    super._handleBlur();
  }

  @eventOptions({ passive: false })
  protected async _handleWheel(event: WheelEvent): Promise<void> {
    if (!this._focused || this.readOnly) return;

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this._inputSelection;
    if (this._performStep(undefined, undefined, event.deltaY > 0 ? -1 : 1)) {
      this._emitInputEvent();
    }

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  // #endregion

  //#region Keybindings

  protected _navigateParts(direction: PartDirection): void {
    const position = this._calculatePartNavigationPosition(
      this._input?.value ?? '',
      direction
    );
    this.setSelectionRange(position, position);
  }

  protected async _keyboardSpin(sign: 1 | -1): Promise<void> {
    if (this._performStep(undefined, undefined, sign)) {
      this._emitInputEvent();
    }
    await this.updateComplete;
    this.setSelectionRange(this._maskSelection.start, this._maskSelection.end);
  }

  // #endregion

  //#region Internal API

  /** @internal */
  /** Spins the given or targeted date part. Returns false when no part is targeted, for example in a literal. */
  protected _performStep(
    datePart: P | undefined,
    delta: number | undefined,
    sign: 1 | -1,
    commit = false
  ): boolean {
    const part = datePart || this._targetDatePart;
    if (!part) return false;

    this._applyStep(this._calculateSpunValue(part, delta, sign), commit);
    return true;
  }

  /** Keeps the selection. With `commit`, a focused editor also updates `value`, not only the draft. */
  protected _applyStep(value: T, commit: boolean): void {
    const { start, end } = this._inputSelection;
    this._setDraftValue(value);

    // A focused editor holds the step as a draft. Commit the exact value: the mask can lack the stepped part.
    if (commit && this._focused) {
      this._applyDraft(value);
    }

    this.updateComplete.then(() => this._input?.setSelectionRange(start, end));
  }

  /** Shows the editable mask when focused, else the display format. */
  protected override _updateMaskDisplay(): void {
    if (!this._focused) {
      this._maskedValue = this._buildDisplayValue();
    } else if (!this._isEditing) {
      // An edit in progress owns the masked text. A rebuild discards the typed text.
      this._maskedValue = this._buildMaskedValue();
    }
  }

  /** Builds the editable mask shown while the input is focused. */
  protected _buildMaskedValue(): string {
    const masked = this._formatValue(this.value);

    // Keep the editor text for an empty value, so a partial mask survives a re-render.
    return masked === this._parser.emptyMask
      ? this._maskedValue || masked
      : masked;
  }

  /**
   * Applies a value from a spin or `Ctrl + ;`. A focused editor moves only the draft.
   * An unfocused one commits at once, because no blur follows.
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
  }

  /**
   * Whether the committed value is empty. Focus then starts the edit from the
   * empty mask, not from the formatted value.
   */
  protected override _isValueEmpty(): boolean {
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

  /** Applies the masked text, or `value`, to the public value without emitting anything. */
  protected _applyDraft(value: T | null = this._parseMask(true)): void {
    this._isEditing = false;
    this.value = value;
    this._updateMaskDisplay();
  }

  /**
   * Commits the draft to the public value. Emits `igcChange` if the committed
   * value differs from the value at focus.
   */
  protected _commitEdit(): void {
    // Only a real edit is parsed again. A display-formatted mask parses wrong
    // under the input format.
    if (this._isEditing) {
      this._isEditing = false;

      // A partial mask parses leniently. Only an empty result clears the value.
      const parsed = this._parseMask(false);

      if (parsed === null) {
        this.clear();
      } else {
        this.value = parsed;
      }
    }

    // The assignments skip an unchanged value, so restore the display format here.
    this._updateMaskDisplay();

    // `clear()` or a set while focused also moves the value. That is a commit too.
    if (!this.readOnly && !equal(this._oldValue, this.value)) {
      this._oldValue = this.value;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  /**
   * Marks the masked text as an uncommitted edit. The parsed result reaches `value`
   * at commit. See {@link _isEditing}.
   */
  protected override _commitMaskedValue(value: string): void {
    this._maskedValue = value;

    if (this._focused) {
      this._isEditing = true;
      return;
    }

    // A change outside an edit, such as a drop on an unfocused input, gets no blur.
    this._applyDraft();
  }

  protected override _restoreDefaultValue(): void {
    this._isEditing = false;
    super._restoreDefaultValue();
    this._updateMaskDisplay();
  }

  protected _isMaskComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  /**
   * Applies a mask pattern to the input, parsing the format string into date parts.
   */
  protected _applyMask(formatString: string): void {
    const previous = this._parser.mask;
    this._parser.mask = formatString;

    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  protected override _formatValidationValue(
    value: unknown,
    locale: string
  ): string {
    return formatDisplayDate(value as Date, locale, this.displayFormat);
  }

  /** Applies the locale-default mask, unless an explicit input format is set. */
  protected _initializeDefaultMask(): void {
    if (!this._inputFormat) {
      this._applyMask(getLocaleDateTimeFormats(this.locale).input);
    }
  }

  protected _resolvePartNames(base: string): Record<string, boolean> {
    return { [base]: true, ...this._partFlags };
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
  /**
   * Increments a date or time part by `delta`, or by its `spinDelta` value.
   * Without `datePart`, it changes the part at the cursor or a default part.
   * The `value` updates at once.
   */
  public stepUp(datePart?: P, delta?: number): void {
    this._performStep(datePart, delta, 1, true);
  }

  /* blazorSuppress */
  /**
   * Decrements a date or time part by `delta`, or by its `spinDelta` value.
   * Without `datePart`, it changes the part at the cursor or a default part.
   * The `value` updates at once.
   */
  public stepDown(datePart?: P, delta?: number): void {
    this._performStep(datePart, delta, -1, true);
  }

  /* blazorSuppress */
  /**
   * Replaces the text from `start` to `end` in the input and re-applies the mask.
   * Without `start` and `end`, replaces the selected text. The `value` updates at once.
   */
  public override setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ): void {
    super.setRangeText(replacement, start, end, selectMode);
    this._applyDraft();
  }

  /** Clears the value and the text of the input. */
  public clear(): void {
    this._isEditing = false;
    this._maskedValue = '';
    this.value = null;
    this._updateMaskDisplay();
  }

  //#endregion

  //#region Render

  protected _renderInput(): TemplateResult {
    return renderMaskedNativeInput(this, {
      id: this._inputId,
      partNames: this._resolvePartNames('input'),
      value: this._maskedValue,
      placeholder: this.placeholder || this._parser.emptyMask,
      aria: this._ariaTarget.resolveBindings(),
      ...this._maskInputBindings,
      onWheel: this._handleWheel,
      onDragEnter: this._handleDragEnter,
    });
  }

  protected override render() {
    this._partFlags = resolveInputPartFlags(this._slots, !this._isEmptyMask);

    return renderInputShell(this, {
      theme: this._themes.theme,
      label: this.label,
      labelId: this._inputId,
      containerParts: this._resolvePartNames('container'),
      renderInput: this._renderInput,
      helperText: IgcValidationContainerComponent.create(this),
    });
  }

  //#endregion

  // #region Abstract methods and properties

  protected abstract override readonly _formValue: FormValue<T | null>;

  /**
   * Provided by `EventEmitterMixin` in the concrete components.
   * @hidden @internal
   */
  public abstract emitEvent(name: string, init?: CustomEventInit): boolean;

  /** The committed value of the input. */
  public abstract get value(): T | null;
  public abstract set value(value: T | null);

  /**
   * Parses the masked text into the value type of the leaf. A `strict` parse gives `null`
   * for an incomplete mask; a lenient one fills the missing parts from their defaults.
   * An empty mask gives `null` in both modes.
   */
  protected abstract _parseMask(strict: boolean): T | null;

  /** Formats a value into the editable mask. */
  protected abstract _formatValue(value: T | null): string;

  protected abstract _buildDisplayValue(): string;
  protected abstract _calculatePartNavigationPosition(
    value: string,
    direction: PartDirection
  ): number;
  protected abstract _calculateSpunValue(
    part: P,
    delta: number | undefined,
    sign: 1 | -1
  ): T;
  protected abstract _setCurrentDateTime(): void;
  protected abstract _getDatePartAtCursor(): P | undefined;
  protected abstract _getDefaultDatePart(): P | undefined;

  /* blazorSuppress */
  /** Returns whether the input format has a date part: day, month or year. */
  public hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  /* blazorSuppress */
  /** Returns whether the input format has a time part: hours, minutes or seconds. */
  public hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
  }

  // #endregion
}
