import { html } from 'lit';
import { eventOptions, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { convertToDate } from '../calendar/helpers.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import type { DateRangeValue } from '../date-range-picker/date-range-picker.js';
import type { IgcInputComponentEventMap } from '../input/input-base.js';
import {
  IgcMaskInputBaseComponent,
  type MaskSelection,
} from '../mask-input/mask-input-base.js';
// Note: Concrete implementations should define their own date part types
import { dateTimeInputValidators } from './validators.js';

export interface IgcDateTimeInputComponentEventMap extends Omit<
  IgcInputComponentEventMap,
  'igcChange'
> {
  igcChange: CustomEvent<Date | DateRangeValue | null>;
}
export abstract class IgcDateTimeInputBaseComponent<
  TValue extends Date | DateRangeValue | string | null,
  TPart,
  TPartInfo,
> extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  // #region Internal state & properties

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  protected _min: Date | null = null;
  protected _max: Date | null = null;
  protected _defaultMask!: string;
  protected _oldValue: TValue | null = null;
  protected _inputDateParts!: TPartInfo[];
  protected _inputFormat = '';
  protected _defaultDisplayFormat = '';

  protected abstract get _datePartDeltas(): any;
  protected abstract get _targetDatePart(): TPart | undefined;

  protected get hasDateParts(): boolean {
    // Override in subclass with specific implementation
    return false;
  }

  protected get hasTimeParts(): boolean {
    // Override in subclass with specific implementation
    return false;
  }

  // #endregion

  // #region Public properties

  // @ts-expect-error - TValue can include DateRangeValue which is not in base type
  public abstract override value: TValue | null;

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public get inputFormat(): string {
    return this._inputFormat || this._defaultMask;
  }

  public set inputFormat(val: string) {
    if (val) {
      this.setMask(val);
      this._inputFormat = val;
      if (this.value) {
        this.updateMask();
      }
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
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public abstract displayFormat: string;

  /**
   * Delta values used to increment or decrement each date part on step actions.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public spinDelta?: any;

  /**
   * Sets whether to loop over the currently spun segment.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public abstract locale: string;

  // #endregion

  // #region Lifecycle & observers

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.readOnly,
      bindingDefaults: { triggers: ['keydownRepeat'] },
    })
      .set([ctrlKey, ';'], this._setCurrentDateTime)
      .set(arrowUp, this._keyboardSpin.bind(this, 'up'))
      .set(arrowDown, this._keyboardSpin.bind(this, 'down'))
      .set([ctrlKey, arrowLeft], this._navigateParts.bind(this, 0))
      .set([ctrlKey, arrowRight], this._navigateParts.bind(this, 1));
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateDefaultMask();
    this.setMask(this.inputFormat);
    this._validate();
    if (this.value) {
      this.updateMask();
    }
  }

  @watch('locale', { waitUntilFirstUpdate: true })
  protected _setDefaultMask(): void {
    if (!this._inputFormat) {
      this.updateDefaultMask();
      this.setMask(this._defaultMask);
    }

    if (this.value) {
      this.updateMask();
    }
  }

  @watch('displayFormat', { waitUntilFirstUpdate: true })
  protected _setDisplayFormat(): void {
    if (this.value) {
      this.updateMask();
    }
  }

  @watch('prompt', { waitUntilFirstUpdate: true })
  protected _promptChange(): void {
    if (!this.prompt) {
      this.prompt = this._parser.prompt;
    } else {
      this._parser.prompt = this.prompt;
    }
  }

  // #endregion

  // #region Methods

  /** Increments a date/time portion. */
  public stepUp(datePart?: TPart, delta?: number): void {
    this._performStep(datePart, delta, false);
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: TPart, delta?: number): void {
    this._performStep(datePart, delta, true);
  }

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
   * Calculates the new value after spinning a date part.
   */
  protected _calculateSpunValue(
    datePart: TPart,
    delta: number | undefined,
    isDecrement: boolean
  ): TValue {
    // Default to 1 if delta is 0 or undefined
    const effectiveDelta =
      delta || (this._datePartDeltas as any)[datePart as any] || 1;
    const spinAmount = isDecrement
      ? -Math.abs(effectiveDelta)
      : Math.abs(effectiveDelta);
    return this.spinValue(datePart, spinAmount);
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  /**
   * Sets the value to the current date/time.
   */
  protected _setCurrentDateTime(): void {
    this.value = new Date() as TValue;
    this._emitInputEvent();
  }

  /**
   * Handles drag leave events.
   */
  protected _handleDragLeave(): void {
    if (!this._focused) {
      this.updateMask();
    }
  }

  /**
   * Handles drag enter events.
   */
  protected _handleDragEnter(): void {
    if (!this._focused) {
      this._maskedValue = this.getMaskedValue();
    }
  }

  protected override async _updateInput(string: string, range: MaskSelection) {
    const { value, end } = this._parser.replace(
      this._maskedValue,
      string,
      range.start,
      range.end
    );

    this._maskedValue = value;

    this.updateValue();
    this.requestUpdate();

    if (range.start !== this.inputFormat.length) {
      this._emitInputEvent();
    }
    await this.updateComplete;
    this._input?.setSelectionRange(end, end);
  }

  /**
   * Checks if all mask positions are filled (no prompt characters remain).
   */
  protected _isMaskComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  protected override _updateSetRangeTextValue() {
    this.updateValue();
  }

  /**
   * Navigates to the previous or next date part.
   */
  protected _navigateParts(direction: number): void {
    const position = this.getNewPosition(this._input?.value ?? '', direction);
    this.setSelectionRange(position, position);
  }

  /**
   * Emits the input event after user interaction.
   */
  protected _emitInputEvent(): void {
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: this.value?.toString() });
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

  protected updateDefaultMask(): void {
    // Override in subclass with specific implementation
  }

  protected override _renderInput() {
    return html`
      <input
        type="text"
        part=${partMap(this._resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this._maskedValue)}
        .placeholder=${live(this.placeholder || this._parser.emptyMask)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @input=${super._handleInput}
        @wheel=${this._handleWheel}
        @keydown=${super._setMaskSelection}
        @click=${super._handleClick}
        @cut=${super._setMaskSelection}
        @compositionstart=${super._handleCompositionStart}
        @compositionend=${super._handleCompositionEnd}
        @dragenter=${this._handleDragEnter}
        @dragleave=${this._handleDragLeave}
        @dragstart=${super._setMaskSelection}
      />
    `;
  }

  protected abstract updateMask(): void;
  protected abstract updateValue(): void;
  protected abstract getNewPosition(value: string, direction: number): number;
  protected abstract spinValue(datePart: TPart, delta: number): TValue;
  protected abstract setMask(string: string): void;
  protected abstract getMaskedValue(): string;
  public abstract handleBlur(): void;
  public abstract handleFocus(): Promise<void>;

  // #endregion
}
