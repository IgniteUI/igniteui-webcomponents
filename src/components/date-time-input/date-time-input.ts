import { getDateFormatter } from 'igniteui-i18n-core';
import { html, type PropertyValues } from 'lit';
import { eventOptions, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addThemingController } from '../../theming/theming-controller.js';
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
import { registerComponent } from '../common/definitions/register.js';
import {
  addI18nController,
  formatDisplayDate,
  getDefaultDateTimeFormat,
} from '../common/i18n/i18n-controller.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import type { IgcInputComponentEventMap } from '../input/input-base.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import {
  IgcMaskInputBaseComponent,
  type MaskSelection,
} from '../mask-input/mask-input-base.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  DatePart,
  type DatePartDeltas,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
} from './date-part.js';
import {
  createDatePart,
  DateParts,
  DateTimeMaskParser,
} from './datetime-mask-parser.js';
import { dateTimeInputValidators } from './validators.js';

export interface IgcDateTimeInputComponentEventMap extends Omit<
  IgcInputComponentEventMap,
  'igcChange'
> {
  igcChange: CustomEvent<Date | null>;
}

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

/**
 * A date time input is an input field that lets you set and edit the date and time in a chosen input element
 * using customizable display and input formats.
 *
 * @element igc-date-time-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcDateTimeInputComponent extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  public static readonly tagName = 'igc-date-time-input';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDateTimeInputComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Private state and properties

  protected override readonly _parser = new DateTimeMaskParser();

  // Format and mask state
  private _defaultDisplayFormat = '';
  private _displayFormat?: string;
  private _inputFormat?: string;

  // Value tracking
  private _oldValue: Date | null = null;
  private _min: Date | null = null;
  private _max: Date | null = null;

  private readonly _i18nController = addI18nController(this, {
    defaultEN: {},
    onResourceChange: this._handleResourceChange,
  });

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  /**
   * Determines which date/time part is currently targeted based on cursor position.
   * When focused, returns the part under the cursor.
   * When unfocused, returns a default part based on available parts.
   */
  private get _targetDatePart(): DatePart | undefined {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  private get _datePartDeltas(): DatePartDeltas {
    return { ...DEFAULT_DATE_PARTS_SPIN_DELTAS, ...this.spinDelta };
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public set inputFormat(val: string) {
    if (val) {
      this._applyMask(val);
      this._inputFormat = val;
      this._updateMaskDisplay();
    }
  }

  public get inputFormat(): string {
    return this._inputFormat || this._parser.mask;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the input.
   * @attr
   */
  @property({ converter: convertToDate })
  public set value(value: Date | string | null | undefined) {
    this._formValue.setValueAndFormState(value as Date | null);
    this._updateMaskDisplay();
  }

  public get value(): Date | null {
    return this._formValue.value;
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

  //#endregion

  //#region Lifecycle Hooks

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

  //#endregion

  //#region Event handlers

  private _emitInputEvent(): void {
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

  @eventOptions({ passive: false })
  private async _handleWheel(event: WheelEvent): Promise<void> {
    if (!this._focused || this.readOnly) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this._inputSelection;
    event.deltaY > 0 ? this.stepDown() : this.stepUp();
    this._emitInputEvent();

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  protected async _handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;

    if (!this.value) {
      this._maskedValue = this._parser.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (this.displayFormat !== this.inputFormat) {
      this._updateMaskDisplay();
    }
  }

  protected override _handleBlur(): void {
    this._focused = false;

    // Handle incomplete mask input
    if (!(this._isMaskComplete() || this._isEmptyMask)) {
      const parsedDate = this._parser.parseDate(this._maskedValue);

      if (parsedDate) {
        this.value = parsedDate;
      } else {
        this.clear();
      }
    } else {
      this._updateMaskDisplay();
    }

    // Emit change event if value changed
    if (!this.readOnly && this._oldValue !== this.value) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    super._handleBlur();
  }

  //#endregion

  //#region Keybindings

  protected _setCurrentDateTime(): void {
    this.value = new Date();
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
   * Calculates the new cursor position when navigating between date parts.
   * direction = 0: navigate to start of previous part
   * direction = 1: navigate to start of next part
   */
  private _calculatePartNavigationPosition(
    inputValue: string,
    direction: number
  ): number {
    const cursorPos = this._maskSelection.start;
    const dateParts = this._parser.dateParts;

    if (direction === 0) {
      // Navigate backwards: find last literal before cursor
      const part = dateParts.findLast(
        (part) => part.type === DateParts.Literal && part.end < cursorPos
      );
      return part?.end ?? 0;
    }

    // Navigate forwards: find first literal after cursor
    const part = dateParts.find(
      (part) => part.type === DateParts.Literal && part.start > cursorPos
    );
    return part?.start ?? inputValue.length;
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

  //#endregion

  //#region Internal API

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

  protected async _updateInput(
    text: string,
    { start, end }: MaskSelection
  ): Promise<void> {
    const result = this._parser.replace(this._maskedValue, text, start, end);

    this._maskedValue = result.value;

    this._updateValueFromMask();
    this.requestUpdate();

    if (start !== this.inputFormat.length) {
      this._emitInputEvent();
    }

    await this.updateComplete;
    this._input?.setSelectionRange(result.end, result.end);
  }

  /**
   * Common logic for stepping up or down a date part.
   */
  private _performStep(
    datePart: DatePart | undefined,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    const part = datePart || this._targetDatePart;
    const { start, end } = this._inputSelection;

    this.value = this._calculateSpunValue(part!, delta, isDecrement);
    this.updateComplete.then(() => this._input?.setSelectionRange(start, end));
  }

  /**
   * Calculates the new date value after spinning a date part.
   */
  private _calculateSpunValue(
    datePart: DatePart,
    delta: number | undefined,
    isDecrement: boolean
  ): Date {
    // Default to 1 if delta is 0 or undefined
    const effectiveDelta =
      delta || this._datePartDeltas[datePart as keyof DatePartDeltas] || 1;

    const spinAmount = isDecrement
      ? -Math.abs(effectiveDelta)
      : Math.abs(effectiveDelta);

    return this._spinDatePart(datePart, spinAmount);
  }

  /**
   * Spins a specific date part by the given delta.
   */
  private _spinDatePart(datePart: DatePart, delta: number): Date {
    if (!isValidDate(this.value)) {
      return new Date();
    }

    const newDate = new Date(this.value.getTime());
    const partType = datePart as unknown as DateParts;

    // Get the part instance from the parser, or create one for explicit spin operations
    let part = this._parser.getPartByType(partType);
    if (!part) {
      // For explicit spin operations (e.g., stepDown(DatePart.Minutes)),
      // create a temporary part even if not in the format
      part = createDatePart(partType, { start: 0, end: 0, format: '' });
    }

    // For AM/PM, we need to extract the current AM/PM value from the mask
    let amPmValue: string | undefined;
    if (datePart === DatePart.AmPm) {
      const formatPart = this._parser.getPartByType(DateParts.AmPm);
      if (formatPart) {
        amPmValue = this._maskedValue.substring(
          formatPart.start,
          formatPart.end
        );
      }
    }

    part.spin(delta, {
      date: newDate,
      spinLoop: this.spinLoop,
      amPmValue,
      originalDate: this.value,
    });

    return newDate;
  }

  /**
   * Updates the default display format based on current locale.
   */
  private _updateDefaultDisplayFormat(): void {
    this._defaultDisplayFormat = getDateFormatter().getLocaleDateTimeFormat(
      this.locale
    );
  }

  /**
   * Applies a mask pattern to the input, parsing the format string into date parts.
   */
  private _applyMask(formatString: string): void {
    const previous = this._parser.mask;
    this._parser.mask = formatString;

    // Update placeholder if not set or if it matches the old format
    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  /**
   * Builds the masked value string from the current date value.
   * Returns empty mask if no value, or existing masked value if incomplete.
   */
  private _buildMaskedValue(): string {
    return isValidDate(this.value)
      ? this._parser.formatDate(this.value)
      : this._maskedValue || this._parser.emptyMask;
  }

  protected _initializeDefaultMask(): void {
    this._updateDefaultDisplayFormat();

    if (!this._inputFormat) {
      this._applyMask(getDefaultDateTimeFormat(this.locale));
    }
  }

  /**
   * Gets the date part at the current cursor position.
   * Uses inclusive end to handle cursor at the end of the last part.
   * Returns undefined if cursor is not within a valid date part.
   */
  private _getDatePartAtCursor(): DatePart | undefined {
    return this._parser.getDatePartForCursor(this._inputSelection.start)
      ?.type as DatePart | undefined;
  }

  /**
   * Gets the default date part to target when the input is not focused.
   * Prioritizes: Date > Hours > First available part
   */
  private _getDefaultDatePart(): DatePart | undefined {
    return (this._parser.getPartByType(DateParts.Date)?.type ??
      this._parser.getPartByType(DateParts.Hours)?.type ??
      this._parser.getFirstDatePart()?.type) as DatePart | undefined;
  }

  /**
   * Checks if all mask positions are filled (no prompt characters remain).
   */
  private _isMaskComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  /**
   * Updates the internal value based on the current masked input.
   * Only sets a value if the mask is complete and parses to a valid date.
   */
  private _updateValueFromMask(): void {
    if (!this._isMaskComplete()) {
      this.value = null;
      return;
    }

    const parsedDate = this._parser.parseDate(this._maskedValue);
    this.value = isValidDate(parsedDate) ? parsedDate : null;
  }

  //#endregion

  //#region Public API

  /** Increments a date/time portion. */
  public stepUp(datePart?: DatePart, delta?: number): void {
    this._performStep(datePart, delta, false);
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: DatePart, delta?: number): void {
    this._performStep(datePart, delta, true);
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  /* blazorSuppress */
  /**
   * Checks whether the current format includes date parts (day, month, year).
   * @internal
   */
  public hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  /* blazorSuppress */
  /**
   * Checks whether the current format includes time parts (hours, minutes, seconds).
   * @internal
   */
  public hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
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
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
