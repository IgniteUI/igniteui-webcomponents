import { getDateFormatter } from 'igniteui-i18n-core';
import { html, type PropertyValues } from 'lit';
import { eventOptions, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { convertToDate, isValidDate } from '../calendar/helpers.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import {
  addI18nController,
  formatDisplayDate,
  getDefaultDateTimeFormat,
} from '../common/i18n/i18n-controller.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import type { IgcInputComponentEventMap } from '../input/input-base.js';
import {
  IgcMaskInputBaseComponent,
  type MaskSelection,
} from '../mask-input/mask-input-base.js';
import type { DateRangeValue } from '../types.js';
import type { DatePartDeltas } from './date-part.js';
import { dateTimeInputValidators } from './validators.js';

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

export interface IgcDateTimeInputComponentEventMap<
  TChange = Date | DateRangeValue | null,
> extends Omit<IgcInputComponentEventMap, 'igcChange'> {
  igcChange: CustomEvent<TChange>;
}

export abstract class IgcDateTimeInputBaseComponent<
  TValue extends Date | DateRangeValue | string | null,
  TPart,
> extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  // #region Private state & properties

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  private readonly _i18nController = addI18nController(this, {
    defaultEN: {},
    onResourceChange: this._handleResourceChange,
  });

  // Value tracking
  protected _oldValue: TValue | null = null;
  protected _min: Date | null = null;
  protected _max: Date | null = null;

  protected _defaultMask!: string;

  // Format and mask state
  protected _defaultDisplayFormat = '';
  protected _displayFormat?: string;
  protected _inputFormat?: string;

  protected get _targetDatePart(): TPart | undefined {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  // #endregion

  // #region Public attributes and properties

  public abstract override value: TValue | null;

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
    if (props.has('displayFormat')) {
      this._updateDefaultDisplayFormat();
    }

    if (props.has('locale')) {
      this._initializeDefaultMask();
    }

    if (props.has('displayFormat') || props.has('locale')) {
      this._updateMaskDisplay();
    }

    super.update(props);
  }

  //#endregion

  //#region Overrides

  protected override _resolvePartNames(base: string) {
    const result = super._resolvePartNames(base);
    // Apply `filled` part when the mask is not empty
    result.filled = result.filled || !this._isEmptyMask;
    return result;
  }

  protected override _updateSetRangeTextValue(): void {
    this._updateValueFromMask();
  }

  protected override async _updateInput(string: string, range: MaskSelection) {
    const { value, end } = this._parser.replace(
      this._maskedValue,
      string,
      range.start,
      range.end
    );

    this._maskedValue = value;

    this._updateValueFromMask();
    this.requestUpdate();

    if (range.start !== this.inputFormat.length) {
      this._emitInputEvent();
    }
    await this.updateComplete;
    this._input?.setSelectionRange(end, end);
  }

  // #endregion

  // #region Event handlers

  /**
   * Emits the input event after user interaction.
   */
  protected _emitInputEvent(): void {
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: this.value?.toString() });
  }

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
   * Sets the value to the current date/time.
   */
  protected _setCurrentDateTime(): void {
    this.value = new Date() as TValue;
    this._emitInputEvent();
  }

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

  /**
   * Common logic for stepping up or down a date part.
   * @internal
   */
  protected _performStep(
    datePart: TPart | undefined,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    const part = datePart || this._targetDatePart;
    if (!part) return;

    const { start, end } = this._inputSelection;
    const newValue = this._calculateSpunValue(part, delta, isDecrement);
    this.value = newValue as TValue;
    this.updateComplete.then(() => this._input?.setSelectionRange(start, end));
  }

  /**
   * Updates the displayed mask value based on focus state.
   * When focused, shows the editable mask. When unfocused, shows formatted display value.
   */
  protected _updateMaskDisplay(): void {
    if (this._focused) {
      this._maskedValue = this._buildMaskedValue();
      return;
    }

    if (!isValidDate(this.value)) {
      this._maskedValue = '';
      return;
    }

    this._maskedValue = formatDisplayDate(
      this.value,
      this.locale,
      this.displayFormat
    );
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

  /**
   * Updates the default display format based on current locale.
   */
  private _updateDefaultDisplayFormat(): void {
    this._defaultDisplayFormat = getDateFormatter().getLocaleDateTimeFormat(
      this.locale
    );
  }

  protected _initializeDefaultMask(): void {
    this._updateDefaultDisplayFormat();

    if (!this._inputFormat) {
      this._applyMask(getDefaultDateTimeFormat(this.locale));
    }
  }

  // #region Public API

  /** Increments a date/time portion. */
  public stepUp(datePart?: TPart, delta?: number): void {
    this._performStep(datePart, delta, false);
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: TPart, delta?: number): void {
    this._performStep(datePart, delta, true);
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  //#endregion

  protected override _renderInput() {
    return html`
      <input
        type="text"
        part=${partMap(this._resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this._maskedValue)}
        .placeholder=${this.placeholder || this._parser.emptyMask}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        @blur=${this._handleBlur}
        @focus=${this._handleFocus}
        @input=${this._handleInput}
        @wheel=${this._handleWheel}
        @keydown=${this._setMaskSelection}
        @click=${this._handleClick}
        @cut=${this._setMaskSelection}
        @compositionstart=${this._handleCompositionStart}
        @compositionend=${this._handleCompositionEnd}
        @dragenter=${this._handleDragEnter}
        @dragleave=${this._handleDragLeave}
        @dragstart=${this._setMaskSelection}
      />
    `;
  }

  // #region Abstract methods and properties

  protected abstract get _datePartDeltas(): DatePartDeltas;

  protected abstract _buildMaskedValue(): string;
  protected abstract _updateValueFromMask(): void;
  protected abstract _calculatePartNavigationPosition(
    value: string,
    direction: number
  ): number;
  protected abstract _calculateSpunValue(
    part: TPart,
    delta: number | undefined,
    isDecrement: boolean
  ): TValue;
  protected abstract _handleFocus(): Promise<void>;
  protected abstract _getDatePartAtCursor(): TPart | undefined;
  protected abstract _getDefaultDatePart(): TPart | undefined;

  public abstract hasDateParts(): boolean;
  public abstract hasTimeParts(): boolean;

  // #endregion
}
