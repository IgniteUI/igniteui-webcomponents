import { property } from 'lit/decorators.js';
import { registerComponent } from '../../internals/definitions/register.js';
import { formatDisplayDate } from '../../internals/i18n/i18n-controller.js';
import type { AbstractConstructor } from '../../internals/mixins/constructor.js';
import { EventEmitterMixin } from '../../internals/mixins/event-emitter.js';
import { FormValueDateTimeTransformers } from '../../internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '../../internals/mixins/forms/form-value.js';
import { equal } from '../../internals/utils/objects.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { convertToDate, isValidDate } from '../calendar/helpers.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  createDatePart,
  DatePart,
  type DatePartDeltas,
  DatePartType,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
} from './date-part.js';
import { IgcDateTimeInputBaseComponent } from './date-time-input.base.js';
import { DateTimeMaskParser } from './datetime-mask-parser.js';
import { dateTimeInputValidators } from './validators.js';

export interface IgcDateTimeInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<Date | null>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
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
  AbstractConstructor<IgcDateTimeInputBaseComponent<Date>>
>(IgcDateTimeInputBaseComponent) {
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

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the input.
   *
   * Only ever holds a committed value. While the user is typing, the intermediate
   * state lives in the masked text and is committed - together with an `igcChange`
   * event - when the edit is committed on blur. Use the `igcInput` event to observe
   * the value as it is being typed.
   *
   * @attr
   */
  @property({ converter: convertToDate })
  public override set value(value: Date | string | null | undefined) {
    const next = convertToDate(value);

    if (equal(this._formValue.value, next)) {
      return;
    }

    this._isEditing = false;
    this._formValue.setValueAndFormState(next);
    this._updateMaskDisplay();
  }

  public override get value(): Date | null {
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
    const dateParts = this._parser.parts;

    if (direction === 0) {
      // Navigate backwards: find last literal before cursor
      const part = dateParts.findLast(
        (part) => part.type === DatePartType.Literal && part.end < cursorPos
      );
      return part?.end ?? 0;
    }

    // Navigate forwards: find first literal after cursor
    const part = dateParts.find(
      (part) => part.type === DatePartType.Literal && part.start > cursorPos
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
    return this._parser.getPartForCursor(this._inputSelection.start)?.type as
      DatePart | undefined;
  }

  /**
   * Gets the default date part to target when the input is not focused.
   * Prioritizes: Date > Hours > First available part
   */
  protected override _getDefaultDatePart(): DatePart | undefined {
    return (this._parser.getPartByType(DatePartType.Date)?.type ??
      this._parser.getPartByType(DatePartType.Hours)?.type ??
      this._parser.getFirstPart()?.type) as DatePart | undefined;
  }

  protected override _parseMask(strict: boolean): Date | null {
    if (strict && !this._isMaskComplete()) {
      return null;
    }

    const parsed = this._parser.parseDate(this._maskedValue);
    return isValidDate(parsed) ? parsed : null;
  }

  protected override _formatValue(value: Date | null): string {
    return this._parser.formatDate(value);
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
   * Sets the value to the current date/time.
   */
  protected override _setCurrentDateTime(): void {
    this._setDraftValue(new Date());
    this._emitInputEvent();
  }

  /**
   * Emits an `igcInput` event whose `detail` is the parsed value as an ISO
   * string (preserving the legacy contract for this component).
   */
  protected override _emitInputEvent(): void {
    this._setTouchedState();
    this.emitEvent('igcInput', {
      detail: this._uncommittedValue?.toISOString(),
    });
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
    const current = this._uncommittedValue;

    if (!isValidDate(current)) {
      return new Date();
    }

    const newDate = new Date(current.getTime());
    const partType = datePart as unknown as DatePartType;

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
      const formatPart = this._parser.getPartByType(DatePartType.AmPm);
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
      originalDate: current,
    });

    return newDate;
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
