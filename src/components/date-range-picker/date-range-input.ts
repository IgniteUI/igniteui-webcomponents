import { property } from 'lit/decorators.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import { formatDisplayDate } from '#internals/i18n/i18n-controller.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueDateRangeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { addThemingController } from '#theming/theming-controller.js';
import {
  type DatePart,
  type DatePartDeltas,
  DatePartType,
} from '../date-time-input/date-part.js';
import { IgcDateTimeInputBaseComponent } from '../date-time-input/date-time-input.base.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import type { DateRangeValue } from '../types.js';
import {
  DateRangeMaskParser,
  type DateRangePart,
  DateRangePosition,
} from './date-range-mask-parser.js';

export interface IgcDateRangeInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<DateRangeValue | null>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/* blazorSuppress */
export default class IgcDateRangeInputComponent extends EventEmitterMixin<
  IgcDateRangeInputComponentEventMap,
  AbstractConstructor<IgcDateTimeInputBaseComponent<DateRangeValue>>
>(IgcDateTimeInputBaseComponent) {
  public static readonly tagName = 'igc-date-range-input';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDateRangeInputComponent);
  }

  //#region Private state and properties

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _parser = new DateRangeMaskParser();

  // #endregion

  // #region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false, true) */
  /**
   * The value of the date range input.
   *
   * Only ever holds a committed value. While the user is typing, the intermediate
   * state lives in the masked text and is committed - together with an `igcChange`
   * event - when the edit is committed on blur.
   *
   * @attr
   */
  @property({ attribute: false })
  public override set value(value: DateRangeValue | null) {
    this._applyValue(value);
  }

  public override get value(): DateRangeValue | null {
    return this._formValue.value;
  }

  // #endregion

  // #region Lifecycle Hooks

  public override connectedCallback(): void {
    super.connectedCallback();
    this._initializeDefaultMask();
    this._updateMaskDisplay();
  }

  // #endregion

  // #region Event Handlers Overrides

  protected override _isValueEmpty(): boolean {
    return !this.value || (!this.value.start && !this.value.end);
  }

  // #endregion

  // #region Keybindings overrides

  protected override _setCurrentDateTime(): void {
    const today = CalendarDay.today.native;
    this._setDraftValue({ start: today, end: today });
    this._emitInputEvent();
  }

  protected override _calculatePartNavigationPosition(
    inputValue: string,
    direction: number
  ): number {
    const cursorPos = this._maskSelection.start;
    const rangeParts = this._parser.parts;

    const currentPart = this._parser.getPartForCursor(cursorPos);

    const isStartOrEndPart =
      currentPart &&
      (currentPart.position === DateRangePosition.Start ||
        currentPart.position === DateRangePosition.End);

    if (direction === 0) {
      // Backward: if inside a start/end part, move to its start; else, move to previous part's start
      if (isStartOrEndPart && cursorPos !== currentPart.start) {
        return currentPart.start;
      }
      const prevPart = rangeParts.findLast(
        (p) => p.type !== DatePartType.Literal && p.end < cursorPos
      );
      return prevPart?.start ?? 0;
    }

    // Forward: if inside a start/end part, move to its end; else, move to next part's end
    if (isStartOrEndPart && cursorPos !== currentPart.end) {
      return currentPart.end;
    }
    const nextPart = rangeParts.find(
      (p) => p.type !== DatePartType.Literal && p.start > cursorPos
    );
    return nextPart?.end ?? inputValue.length;
  }

  // #endregion

  // #region Internal API Overrides

  protected override _performStep(
    datePart: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    // If no value exists, set to today's date first
    const current = this._uncommittedValue;

    if (!current?.start && !current?.end) {
      const today = CalendarDay.today.native;
      this._setDraftValue({ start: today, end: today });
      const { start, end } = this._inputSelection;
      this.updateComplete.then(() =>
        this._input?.setSelectionRange(start, end)
      );
      return;
    }

    super._performStep(datePart, delta, isDecrement);
  }

  protected override _buildDisplayValue(): string {
    if (!this.value?.start && !this.value?.end) {
      return '';
    }

    const { start, end } = this.value;
    const startStr = start
      ? formatDisplayDate(start, this.locale, this.displayFormat)
      : '';
    const endStr = end
      ? formatDisplayDate(end, this.locale, this.displayFormat)
      : '';
    return startStr && endStr
      ? `${startStr}${this._parser.separator}${endStr}`
      : startStr || endStr;
  }

  protected override _calculateSpunValue(
    datePart: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): DateRangeValue {
    const range = datePart as DateRangePart;
    const part = this._parser.getPartByTypeAndPosition(
      range.part as DatePartType,
      range.position
    );

    const today = CalendarDay.today.native;
    const defaultValue = { start: today, end: today };
    const current = this._uncommittedValue;

    if (!part) {
      return current || defaultValue;
    }

    const effectiveDelta =
      delta ?? this._datePartDeltas[range.part as keyof DatePartDeltas] ?? 1;
    const spinAmount = effectiveDelta * (isDecrement ? -1 : 1);

    // For AM/PM spinning, extract the current AM/PM value from the mask
    const amPmValue = this._readAmPmFromMask(part);

    return this._parser.spinDateRangePart(
      part,
      spinAmount,
      current,
      this.spinLoop,
      amPmValue
    );
  }

  /**
   * Gets the date range part at the current cursor position.
   * Returns undefined if the cursor sits outside any part - in the separator, say.
   */
  protected override _getDatePartAtCursor(): DateRangePart | undefined {
    const part = this._parser.getPartForCursor(this._inputSelection.start);

    return part
      ? { part: part.type as DatePart, position: part.position }
      : undefined;
  }

  /**
   * Gets the default date range part to target when the input is not focused.
   * Returns the first date part at the start position.
   */
  protected override _getDefaultDatePart(): DateRangePart | undefined {
    const firstPart = this._parser.getFirstDatePartForPosition(
      DateRangePosition.Start
    );
    if (firstPart) {
      return {
        part: firstPart.type as DatePart,
        position: DateRangePosition.Start,
      };
    }

    return undefined;
  }

  protected override _parseMask(strict: boolean): DateRangeValue | null {
    if (strict && !this._isMaskComplete()) {
      return null;
    }

    const parsed = this._parser.parseDateRange(this._maskedValue);
    return parsed?.start || parsed?.end ? parsed : null;
  }

  protected override _formatValue(value: DateRangeValue | null): string {
    return this._parser.formatDateRange(value);
  }

  protected override _applyMask(formatString: string): void {
    super._applyMask(formatString);
    this._parser.prompt = this.prompt;
  }

  // #region Public API Overrides

  /** Increments a date/time portion. */
  public override stepUp(datePart?: DateRangePart, delta?: number): void {
    super.stepUp(datePart, delta);
  }

  /** Decrements a date/time portion. */
  public override stepDown(datePart?: DateRangePart, delta?: number): void {
    super.stepDown(datePart, delta);
  }

  public override hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  public override hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
