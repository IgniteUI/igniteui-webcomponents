import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { convertToDate, isValidDate } from '../calendar/helpers.js';
import { registerComponent } from '../common/definitions/register.js';
import { formatDisplayDate } from '../common/i18n/i18n-controller.js';
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  DatePart,
  type DatePartDeltas,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
} from './date-part.js';
import {
  IgcDateTimeInputBaseComponent,
  type IgcDateTimeInputComponentEventMap,
} from './date-time-input.base.js';
import {
  createDatePart,
  DateParts,
  DateTimeMaskParser,
} from './datetime-mask-parser.js';
import { dateTimeInputValidators } from './validators.js';

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
export interface IgcDateTimeInputEventMap extends Omit<
  IgcDateTimeInputComponentEventMap,
  'igcChange'
> {
  igcChange: CustomEvent<Date | null>;
}

export default class IgcDateTimeInputComponent extends IgcDateTimeInputBaseComponent {
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

  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _parser = new DateTimeMaskParser();
  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  protected override get _datePartDeltas(): DatePartDeltas {
    return { ...DEFAULT_DATE_PARTS_SPIN_DELTAS, ...this.spinDelta };
  }

  protected _oldValue: Date | null = null;

  //#endregion

  //#region Public attributes and properties

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

  //#endregion

  //#region Event handlers

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

  //#region Navigation

  /**
   * Calculates the new cursor position when navigating between date parts.
   * direction = 0: navigate to start of previous part
   * direction = 1: navigate to start of next part
   */
  protected override _calculatePartNavigationPosition(
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

  //#endregion

  //#region Internal API

  /**
   * Gets the date part at the current cursor position.
   * Uses inclusive end to handle cursor at the end of the last part.
   * Returns undefined if cursor is not within a valid date part.
   */
  protected override _getDatePartAtCursor(): DatePart | undefined {
    return this._parser.getDatePartForCursor(this._inputSelection.start)
      ?.type as DatePart | undefined;
  }

  /**
   * Gets the default date part to target when the input is not focused.
   * Prioritizes: Date > Hours > First available part
   */
  protected override _getDefaultDatePart(): DatePart | undefined {
    return (this._parser.getPartByType(DateParts.Date)?.type ??
      this._parser.getPartByType(DateParts.Hours)?.type ??
      this._parser.getFirstDatePart()?.type) as DatePart | undefined;
  }

  /**
   * Builds the masked value string from the current date value.
   * Returns empty mask if no value, or existing masked value if incomplete.
   */
  protected override _buildMaskedValue(): string {
    return isValidDate(this.value)
      ? this._parser.formatDate(this.value)
      : this._maskedValue || this._parser.emptyMask;
  }

  /**
   * Builds the formatted display value shown when the input is not focused.
   */
  protected override _buildDisplayValue(): string {
    return isValidDate(this.value)
      ? formatDisplayDate(this.value, this.locale, this.displayFormat)
      : '';
  }

  /**
   * Commits a value produced by spinning a date part.
   */
  protected override _commitSpunValue(value: unknown): void {
    this.value = value as Date;
  }

  /**
   * Sets the value to the current date/time.
   */
  protected override _setCurrentDateTime(): void {
    this.value = new Date();
    this._emitInputEvent();
  }

  /**
   * Emits an `igcInput` event whose `detail` is the parsed value as an ISO
   * string (preserving the legacy contract for this component).
   */
  protected override _emitInputEvent(): void {
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: this.value?.toString() });
  }

  /**
   * Calculates the new date value after spinning a date part.
   */
  protected override _calculateSpunValue(
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
  protected _spinDatePart(datePart: DatePart, delta: number): Date {
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
   * Updates the internal value based on the current masked input.
   * Only sets a value if the mask is complete and parses to a valid date.
   */
  protected override _syncValueFromMask(): void {
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
  public override stepUp(datePart?: DatePart, delta?: number): void {
    super.stepUp(datePart, delta);
  }

  /** Decrements a date/time portion. */
  public override stepDown(datePart?: DatePart, delta?: number): void {
    super.stepDown(datePart, delta);
  }

  /** Clears the input element of user input. */
  public override clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  /* blazorSuppress */
  /**
   * Checks whether the current format includes date parts (day, month, year).
   * @internal
   */
  public override hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  /* blazorSuppress */
  /**
   * Checks whether the current format includes time parts (hours, minutes, seconds).
   * @internal
   */
  public override hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
