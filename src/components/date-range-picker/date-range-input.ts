import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { CalendarDay } from '../calendar/model.js';
import { registerComponent } from '../common/definitions/register.js';
import { formatDisplayDate } from '../common/i18n/i18n-controller.js';
import { FormValueDateRangeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { equal } from '../common/util.js';
import {
  type DatePart,
  type DatePartDeltas,
  DatePartType,
} from '../date-time-input/date-part.js';
import {
  IgcDateTimeInputBaseComponent,
  type IgcDateTimeInputComponentEventMap,
} from '../date-time-input/date-time-input.base.js';
import { DateParts } from '../date-time-input/datetime-mask-parser.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import type { DateRangeValue } from '../types.js';
import {
  DateRangeMaskParser,
  type DateRangePart,
  DateRangePosition,
} from './date-range-mask-parser.js';

export interface IgcDateRangeInputEventMap extends Omit<
  IgcDateTimeInputComponentEventMap,
  'igcChange'
> {
  igcChange: CustomEvent<DateRangeValue | null>;
}

export default class IgcDateRangeInputComponent extends IgcDateTimeInputBaseComponent {
  public static readonly tagName = 'igc-date-range-input';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDateRangeInputComponent);
  }

  //#region Private state and properties

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _parser = new DateRangeMaskParser();

  protected override get _datePartDeltas(): DatePartDeltas {
    return {
      date: 1,
      month: 1,
      year: 1,
    };
  }

  protected _oldValue: DateRangeValue | null = null;

  // #endregion

  // #region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false, true) */
  /**
   * The value of the date range input.
   * @attr
   */
  @property({ attribute: false })
  public set value(value: DateRangeValue | null) {
    this._formValue.setValueAndFormState(value);
    this._updateMaskDisplay();
  }

  public get value(): DateRangeValue | null {
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

  protected override async _handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;

    if (!this.value || (!this.value.start && !this.value.end)) {
      this._maskedValue = this._parser.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (this.displayFormat !== this.inputFormat) {
      this._updateMaskDisplay();
    }
  }

  protected override _handleBlur(): void {
    const isSameValue = equal(this._oldValue, this.value);

    this._focused = false;

    if (!(this._isMaskComplete() || this._isEmptyMask)) {
      const parsed = this._parser.parseDateRange(this._maskedValue);

      if (parsed && (parsed.start || parsed.end)) {
        this.value = parsed;
      } else {
        this.value = null;
        this._maskedValue = '';
      }
    } else {
      this._updateMaskDisplay();
    }

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    super._handleBlur();
  }

  // #endregion

  // #region Keybindings overrides

  protected override _setCurrentDateTime(): void {
    const today = CalendarDay.today.native;
    this.value = { start: today, end: today };
    this._emitInputEvent();
  }

  protected override _calculatePartNavigationPosition(
    inputValue: string,
    direction: number
  ): number {
    const cursorPos = this._maskSelection.start;
    const rangeParts = this._parser.rangeParts;

    const currentPart = rangeParts.find(
      (p) =>
        p.type !== DateParts.Literal &&
        cursorPos >= p.start &&
        cursorPos <= p.end
    );

    const isStartOrEndPart =
      currentPart &&
      (currentPart.position === DateRangePosition.Start ||
        currentPart.position === DateRangePosition.End);

    if (direction === 0) {
      // Backward: if inside a start/end part, move to its start; else, move to previous part's start
      if (isStartOrEndPart && cursorPos !== currentPart.start) {
        return currentPart.start;
      }
      const prevPart = [...rangeParts]
        .reverse()
        .find((p) => p.type !== DateParts.Literal && p.end < cursorPos);
      return prevPart?.start ?? 0;
    }

    // Forward: if inside a start/end part, move to its end; else, move to next part's end
    if (isStartOrEndPart && cursorPos !== currentPart.end) {
      return currentPart.end;
    }
    const nextPart = rangeParts.find(
      (p) => p.type !== DateParts.Literal && p.start > cursorPos
    );
    return nextPart?.end ?? inputValue.length;
  }

  // #endregion

  // #region Internal API Overrides

  protected override _updateMaskDisplay(): void {
    if (this._focused) {
      // Only reset mask from value when value is non-null (i.e. after spinning or programmatic set).
      // When value is null the user is mid-typing — leave _maskedValue unchanged.
      if (this.value?.start || this.value?.end) {
        this._maskedValue = this._buildMaskedValue();
      } else if (!this._maskedValue) {
        this._maskedValue = this._parser.emptyMask;
      }
      return;
    }

    if (!this.value?.start && !this.value?.end) {
      this._maskedValue = '';
      return;
    }

    const { start, end } = this.value;
    const startStr = start
      ? formatDisplayDate(start, this.locale, this.displayFormat)
      : '';
    const endStr = end
      ? formatDisplayDate(end, this.locale, this.displayFormat)
      : '';
    this._maskedValue =
      startStr && endStr
        ? `${startStr}${this._parser.separator}${endStr}`
        : startStr || endStr;
  }

  protected override _performStep(
    datePart: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    // If no value exists, set to today's date first
    if (!this.value?.start && !this.value?.end) {
      const today = CalendarDay.today.native;
      this.value = { start: today, end: today };
      const { start, end } = this._inputSelection;
      this.updateComplete.then(() =>
        this._input?.setSelectionRange(start, end)
      );
      return;
    }

    super._performStep(datePart, delta, isDecrement);
  }

  protected override _commitSpunValue(value: unknown): void {
    this.value = value as DateRangeValue;
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

    if (!part) {
      return this.value || defaultValue;
    }

    const effectiveDelta =
      delta ?? this._datePartDeltas[range.part as keyof DatePartDeltas] ?? 1;
    const spinAmount = effectiveDelta * (isDecrement ? -1 : 1);

    // For AM/PM spinning, extract the current AM/PM value from the mask
    const amPmValue =
      part.type === DatePartType.AmPm
        ? this._maskedValue.substring(part.start, part.end)
        : undefined;

    return this._parser.spinDateRangePart(
      part,
      spinAmount,
      this.value,
      this.spinLoop,
      amPmValue
    );
  }

  /**
   * Gets the date range part at the current cursor position.
   * If the cursor is at a literal, finds the nearest non-literal part.
   * Returns undefined if no valid part is found.
   */
  protected override _getDatePartAtCursor(): DateRangePart | undefined {
    const cursorPos = this._inputSelection.start;
    let part = this._parser.getDateRangePartForCursor(cursorPos);

    // If cursor is at a literal, find the nearest non-literal part
    if (part?.type === DatePartType.Literal) {
      const nextPart = this._parser.rangeParts.find(
        (p) => p.start >= cursorPos && p.type !== DatePartType.Literal
      );
      if (nextPart) {
        part = nextPart;
      } else {
        part = this._parser.rangeParts.findLast(
          (p) => p.end <= cursorPos && p.type !== DatePartType.Literal
        );
      }
    }

    if (part && part.type !== DatePartType.Literal) {
      return {
        part: part.type as DatePart,
        position: part.position,
      };
    }

    return undefined;
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

  protected override _buildMaskedValue(): string {
    return this._parser.formatDateRange(this.value);
  }

  protected override _applyMask(string: string): void {
    const previous = this._parser.mask;

    this._parser.mask = string;
    this._defaultMask = string;
    this._parser.prompt = this.prompt;

    // Update placeholder if not set or if it matches the previous format
    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  protected override _syncValueFromMask(): void {
    if (!this._isMaskComplete()) {
      this.value = null;
      return;
    }

    const parsed = this._parser.parseDateRange(this._maskedValue);
    this.value = parsed?.start || parsed?.end ? parsed : null;
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

  /** Clears the input element of user input. */
  public override clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  public override hasDateParts(): boolean {
    return this._parser.rangeParts.some(
      (p) =>
        p.type === DatePartType.Date ||
        p.type === DatePartType.Month ||
        p.type === DatePartType.Year
    );
  }

  public override hasTimeParts(): boolean {
    return this._parser.rangeParts.some(
      (p) =>
        p.type === DatePartType.Hours ||
        p.type === DatePartType.Minutes ||
        p.type === DatePartType.Seconds
    );
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
