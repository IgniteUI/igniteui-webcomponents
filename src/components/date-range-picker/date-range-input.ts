import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { CalendarDay } from '../calendar/model.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  formatDisplayDate,
  getDefaultDateTimeFormat,
} from '../common/i18n/i18n-controller.js';
import { FormValueDateRangeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { equal } from '../common/util.js';
import {
  type DatePart,
  type DatePartDeltas,
  DatePartType,
} from '../date-time-input/date-part.js';
import { IgcDateTimeInputBaseComponent } from '../date-time-input/date-time-input.base.js';
import { DateParts } from '../date-time-input/datetime-mask-parser.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import {
  DateRangeMaskParser,
  DateRangePosition,
} from './date-range-mask-parser.js';
import type { DateRangeValue } from './date-range-picker.js';

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'bad-input',
  'custom-error',
  'invalid'
);

/** @ignore */
export interface DateRangePart {
  part: DatePart;
  position: DateRangePosition;
}

export default class IgcDateRangeInputComponent extends IgcDateTimeInputBaseComponent<
  DateRangeValue | null,
  DateRangePart
> {
  public static readonly tagName = 'igc-date-range-input';

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDateRangeInputComponent);
  }

  // #region Properties

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override readonly _parser = new DateRangeMaskParser();

  protected override _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
  };

  protected override get _targetDatePart(): DateRangePart | undefined {
    if (this._focused) {
      const cursorPos = this._inputSelection.start;
      let part = this._parser.getDateRangePartForCursor(cursorPos);

      // If cursor is at a literal, find the nearest non-literal part
      if (part && part.type === DatePartType.Literal) {
        // Try to find the next non-literal part after the cursor
        const nextPart = this._parser.rangeParts.find(
          (p) => p.start >= cursorPos && p.type !== DatePartType.Literal
        );

        if (nextPart) {
          part = nextPart;
        } else {
          // If no next part, find the previous non-literal part
          const prevPart = [...this._parser.rangeParts]
            .reverse()
            .find((p) => p.end <= cursorPos && p.type !== DatePartType.Literal);
          part = prevPart;
        }
      }

      if (part && part.type !== DatePartType.Literal) {
        return {
          part: part.type as string as DatePart,
          position: part.position,
        };
      }
    } else {
      const firstPart = this._parser.getFirstDatePartForPosition(
        DateRangePosition.Start
      );
      if (firstPart) {
        return {
          part: firstPart.type as string as DatePart,
          position: DateRangePosition.Start,
        };
      }
    }

    return undefined;
  }

  // #endregion

  // #region Public properties

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

  // #region Lifecycle

  public override connectedCallback(): void {
    super.connectedCallback();
    // Initialize with locale-aware format on first connection
    this._initializeDefaultMask();
    // Set initial display value
    this._updateMaskDisplay();
  }

  // #endregion

  // #region Methods

  @watch('locale', { waitUntilFirstUpdate: true })
  protected _localeChanged(): void {
    this.updateDefaultMask();
    this._updateMaskDisplay();
  }

  protected override _initializeDefaultMask(): void {
    // Call base to update _defaultDisplayFormat
    super._initializeDefaultMask();

    // Apply range-specific mask if no custom input format
    if (!this._inputFormat) {
      const singleFormat = getDefaultDateTimeFormat(this.locale);
      this._parser.mask = singleFormat;
      this._defaultMask = singleFormat;
      this.placeholder = `${singleFormat}${this._parser.separator}${singleFormat}`;
    }
  }

  protected override hasDateParts(): boolean {
    return this._parser.rangeParts.some(
      (p) =>
        p.type === DatePartType.Date ||
        p.type === DatePartType.Month ||
        p.type === DatePartType.Year
    );
  }

  protected override hasTimeParts(): boolean {
    return this._parser.rangeParts.some(
      (p) =>
        p.type === DatePartType.Hours ||
        p.type === DatePartType.Minutes ||
        p.type === DatePartType.Seconds
    );
  }

  protected override buildMaskedValue(): string {
    // Format the range - parser handles null/undefined values gracefully
    // by returning empty masks for missing start/end dates
    return this._parser.formatDateRange(this.value);
  }

  protected override updateDefaultMask(): void {
    if (!this._inputFormat) {
      const singleFormat = getDefaultDateTimeFormat(this.locale);
      this._parser.mask = singleFormat;
      this._defaultMask = singleFormat;
      this.placeholder = `${singleFormat}${this._parser.separator}${singleFormat}`;
    }
  }

  protected override _applyMask(string: string): void {
    const oldPlaceholder = this.placeholder;
    const oldFormat = this._defaultMask;

    // string is the single date format
    this._parser.mask = string;
    this._defaultMask = string;
    this._parser.prompt = this.prompt;

    // Update placeholder if it was using the old format
    if (!this.placeholder || oldFormat === oldPlaceholder) {
      this.placeholder = `${string}${this._parser.separator}${string}`;
    }
  }

  protected override _updateMaskDisplay(): void {
    if (this._focused) {
      // Only reset mask from value when value is non-null (e.g. after spinning or programmatic set).
      // When value is null the user is mid-typing — leave _maskedValue unchanged.
      if (this.value && (this.value.start || this.value.end)) {
        this._maskedValue = this.buildMaskedValue();
      } else if (!this._maskedValue) {
        // Not yet initialised — show the empty mask so prompts are visible.
        this._maskedValue = this._parser.emptyMask;
      }
      return;
    }

    if (!this.value || (!this.value.start && !this.value.end)) {
      this._maskedValue = '';
      return;
    }

    // When unfocused always use formatDisplayDate (locale-aware, un-padded).
    // displayFormat can be undefined — formatDisplayDate handles that by using locale defaults.
    const { start, end } = this.value;
    const startStr = start
      ? formatDisplayDate(start, this.locale, this._displayFormat)
      : '';
    const endStr = end
      ? formatDisplayDate(end, this.locale, this._displayFormat)
      : '';
    this._maskedValue =
      startStr && endStr
        ? `${startStr}${this._parser.separator}${endStr}`
        : startStr || endStr;
  }

  protected override calculatePartNavigationPosition(
    inputValue: string,
    direction: number
  ): number {
    const cursorPos = this._maskSelection.start;
    const rangeParts = this._parser.rangeParts;

    // Find the current non-literal part containing the cursor
    const currentPart = rangeParts.find(
      (p) =>
        p.type !== DateParts.Literal &&
        cursorPos >= p.start &&
        cursorPos <= p.end
    );

    // Only apply start/end jump for start/end parts
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

  protected override _performStep(
    datePart: DateRangePart | undefined,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    // If no value exists, set to today's date first
    if (!this.value || (!this.value.start && !this.value.end)) {
      const today = CalendarDay.today.native;
      this.value = { start: today, end: today };
      const { start, end } = this._inputSelection;
      this.updateComplete.then(() =>
        this._input?.setSelectionRange(start, end)
      );
      return;
    }

    // Otherwise, use the base class implementation
    super._performStep(datePart, delta, isDecrement);
  }

  protected override calculateSpunValue(
    datePart: DateRangePart,
    delta: number | undefined,
    isDecrement: boolean
  ): DateRangeValue {
    // Get the part from the parser
    const part = this._parser.getPartByTypeAndPosition(
      datePart.part as DatePartType,
      datePart.position
    );

    if (!part) {
      // Fallback if part not found
      return (
        this.value || {
          start: CalendarDay.today.native,
          end: CalendarDay.today.native,
        }
      );
    }

    // Default to 1 if delta is 0 or undefined
    const effectiveDelta =
      delta || this._datePartDeltas[datePart.part as keyof DatePartDeltas] || 1;

    const spinAmount = isDecrement
      ? -Math.abs(effectiveDelta)
      : Math.abs(effectiveDelta);

    // Use the parser's spinDateRangePart method
    return this._parser.spinDateRangePart(
      part,
      spinAmount,
      this.value,
      this.spinLoop
    );
  }

  /**
   * Checks if the mask has actual user input (not just prompts or empty).
   */
  protected override _isMaskComplete(): boolean {
    // Check if ALL non-literal positions are filled (no prompts remaining)
    return !this._maskedValue.split('').some((char, index) => {
      if (char === this.prompt && !this._parser.literalPositions.has(index)) {
        return true; // Found a prompt in a non-literal position = incomplete
      }
      return false;
    });
  }

  protected override updateValueFromMask(): void {
    // Only parse and update value if the mask is complete
    // This prevents filling in default dates (01/01/2000) for incomplete masks
    if (!this._isMaskComplete()) {
      // Don't parse incomplete masks - just emit igcInput with null
      this.value = null;
      return;
    }

    // Parse the date range from the current masked value
    const parsed = this._parser.parseDateRange(this._maskedValue);

    if (parsed && (parsed.start || parsed.end)) {
      this.value = parsed;
    } else {
      this.value = null;
    }
  }

  /**
   * Emits the input event with the DateRangeValue detail.
   */
  protected override _emitInputEvent(): void {
    this._setTouchedState();
    // Cast to any to bypass type checking - the event map doesn't define igcInput for date range
    // but runtime emits the DateRangeValue as detail
    this.emitEvent('igcInput' as any, { detail: this.value });
  }

  public override async handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;

    // Always update mask display when focused to show the editable format
    this._updateMaskDisplay();

    // If no value, select all to allow immediate typing
    if (!this.value || (!this.value.start && !this.value.end)) {
      await this.updateComplete;
      this.select();
    }
  }

  public override _handleBlur(): void {
    const isEmptyMask = this._maskedValue === this._parser.emptyMask;
    const isSameValue = equal(this._oldValue, this.value);

    this._focused = false;

    if (!(this._isMaskComplete() || isEmptyMask)) {
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

  /**
   * Sets the value to a range of the current date/time as start and end.
   */
  protected override _setCurrentDateTime(): void {
    const today = CalendarDay.today.native;
    this.value = { start: today, end: today };
    this._emitInputEvent();
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
