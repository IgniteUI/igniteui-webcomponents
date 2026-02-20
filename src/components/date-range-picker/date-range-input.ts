import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { isValidDate } from '../calendar/helpers.js';
import { CalendarDay } from '../calendar/model.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { FormValueDateRangeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { equal } from '../common/util.js';
import {
  type DatePart,
  type DatePartDeltas,
  DatePartType,
} from '../date-time-input/date-part.js';
import { IgcDateTimeInputBaseComponent } from '../date-time-input/date-time-input.base.js';
import {
  type DatePartInfo,
  DateTimeMaskParser,
} from '../date-time-input/datetime-mask-parser.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import type { DateRangeValue } from './date-range-picker.js';
import { isCompleteDateRange } from './validators.js';

const SINGLE_INPUT_SEPARATOR = ' - ';

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
export enum DateRangePosition {
  Start = 'start',
  End = 'end',
  Separator = 'separator',
}

/** @ignore */
export interface DateRangePart {
  part: DatePart;
  position: DateRangePosition;
}

/** @ignore */
export interface DateRangePartInfo extends DatePartInfo {
  position?: DateRangePosition;
}

export default class IgcDateRangeInputComponent extends IgcDateTimeInputBaseComponent<
  DateRangeValue | null,
  DateRangePart,
  DateRangePartInfo
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

  private _startParser: DateTimeMaskParser = new DateTimeMaskParser();
  private _endParser: DateTimeMaskParser = new DateTimeMaskParser();

  protected override _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
  };

  private _oldRangeValue: DateRangeValue | null = null;

  protected override _inputFormat!: string;

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public displayFormat = '';

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  protected override get hasDateParts(): boolean {
    return this._startParser.hasDateParts();
  }

  protected override get hasTimeParts(): boolean {
    return this._startParser.hasTimeParts();
  }

  protected override get targetDatePart(): DateRangePart | undefined {
    let result: DateRangePart | undefined;

    if (this._focused) {
      const part = this._inputDateParts.find(
        (p) =>
          p.start <= this._inputSelection.start &&
          this._inputSelection.start <= p.end &&
          p.type !== DatePartType.Literal
      );
      const partType = part?.type as string as DatePart;

      if (partType) {
        result = { part: partType, position: part!.position! };
      }
    } else {
      const firstPart = this._inputDateParts[0];
      result = {
        part: firstPart?.type as string as DatePart,
        position: DateRangePosition.Start,
      };
    }

    return result;
  }

  public get value(): DateRangeValue | null {
    return this._formValue.value;
  }

  public set value(value: DateRangeValue | null) {
    this._formValue.setValueAndFormState(value as DateRangeValue | null);
    this.updateMask();
  }

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public override get inputFormat(): string {
    return (
      this._inputFormat || this._defaultMask?.split(SINGLE_INPUT_SEPARATOR)[0]
    );
  }

  public override set inputFormat(value: string) {
    if (value) {
      this._inputFormat = value;
      this.setMask(value);
      if (this.value) {
        this.updateMask();
      }
    }
  }

  // #endregion

  // #region Methods

  @watch('displayFormat')
  protected _onDisplayFormatChange() {
    this.updateMask();
  }

  protected override setMask(string: string): void {
    const oldFormat = this._inputDateParts?.map((p) => p.format).join('');

    // Set both parsers to the same format
    this._startParser.mask = string;
    this._endParser.mask = string;

    // Get date parts from the start parser
    const baseParts = Array.from(this._startParser.dateParts);

    // Create start parts with position
    const startParts = baseParts.map((part) => ({
      ...part,
      position: DateRangePosition.Start,
    })) as DateRangePartInfo[];

    const separatorStart = startParts[startParts.length - 1].end;
    const separatorParts: DateRangePartInfo[] = [];

    // Add separator parts
    for (let i = 0; i < SINGLE_INPUT_SEPARATOR.length; i++) {
      const element = SINGLE_INPUT_SEPARATOR.charAt(i);

      separatorParts.push({
        type: DatePartType.Literal,
        format: element,
        start: separatorStart + i,
        end: separatorStart + i + 1,
        position: DateRangePosition.Separator,
      } as DateRangePartInfo);
    }

    let currentPosition = separatorStart + SINGLE_INPUT_SEPARATOR.length;

    // Clone parts for end date, adjusting positions
    const endParts: DateRangePartInfo[] = baseParts.map((part) => {
      const length = part.end - part.start;
      const newPart: DateRangePartInfo = {
        type: part.type,
        format: part.format,
        start: currentPosition,
        end: currentPosition + length,
        position: DateRangePosition.End,
      } as DateRangePartInfo;
      currentPosition += length;
      return newPart;
    });

    this._inputDateParts = [...startParts, ...separatorParts, ...endParts];

    this._defaultMask = this._inputDateParts.map((p) => p.format).join('');

    const value = this._defaultMask;

    // Build compound mask pattern
    this.mask =
      this._startParser.mask + SINGLE_INPUT_SEPARATOR + this._endParser.mask;
    this._parser.prompt = this.prompt;

    if (!this.placeholder || oldFormat === this.placeholder) {
      this.placeholder = value;
    }
  }

  protected override getMaskedValue(): string {
    let mask = this._parser.emptyMask;

    if (isValidDate(this.value?.start)) {
      const startParts = this._inputDateParts.filter(
        (p) => p.position === DateRangePosition.Start
      );
      mask = this._setDatePartInMask(mask, startParts, this.value.start);
    }
    if (isValidDate(this.value?.end)) {
      const endParts = this._inputDateParts.filter(
        (p) => p.position === DateRangePosition.End
      );
      mask = this._setDatePartInMask(mask, endParts, this.value.end);
      return mask;
    }

    return this._maskedValue === '' ? mask : this._maskedValue;
  }

  protected override getNewPosition(value: string, direction = 0): number {
    let cursorPos = this._maskSelection.start;

    const separatorPart = this._inputDateParts.find(
      (part) => part.position === DateRangePosition.Separator
    );

    if (!direction) {
      const firstSeparator =
        this._inputDateParts.find(
          (p) => p.position === DateRangePosition.Separator
        )?.start ?? 0;
      const lastSeparator =
        this._inputDateParts.findLast(
          (p) => p.position === DateRangePosition.Separator
        )?.end ?? 0;
      // Last literal before the current cursor position or start of input value
      let part = this._inputDateParts.findLast(
        (part) => part.type === DatePartType.Literal && part.end < cursorPos
      );
      // skip over the separator parts
      if (
        part?.position === DateRangePosition.Separator &&
        cursorPos === lastSeparator
      ) {
        cursorPos = firstSeparator;
        part = this._inputDateParts.findLast(
          (part) => part.type === DatePartType.Literal && part.end < cursorPos
        );
      }
      return part?.end ?? 0;
    }

    if (
      separatorPart &&
      cursorPos >= separatorPart.start &&
      cursorPos <= separatorPart.end
    ) {
      // Cursor is inside the separator; skip over it
      cursorPos = separatorPart.end + 1;
    }
    // First literal after the current cursor position or end of input value
    const part = this._inputDateParts.find(
      (part) => part.type === DatePartType.Literal && part.start > cursorPos
    );
    return part?.start ?? value.length;
  }

  protected override updateValue(): void {
    if (this.isComplete()) {
      const parsedRange = this._parseRangeValue(this._maskedValue);
      this.value = parsedRange;
    } else {
      this.value = null;
    }
  }

  public override async handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }
    this._oldRangeValue = this.value;
    const areFormatsDifferent = this.displayFormat !== this.inputFormat;

    if (!this.value || !this.value.start || !this.value.end) {
      this._maskedValue = this._parser.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (areFormatsDifferent) {
      this.updateMask();
    }
  }

  public override handleBlur(): void {
    const isEmptyMask = this._maskedValue === this._parser.emptyMask;
    const isSameValue = equal(this._oldRangeValue, this.value);

    this._focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
      const parse = this._parseRangeValue(this._maskedValue);

      if (parse) {
        this.value = parse;
      } else {
        this.value = null;
        this._maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    super._handleBlur();
  }

  protected override spinValue(
    datePart: DateRangePart,
    delta: number
  ): DateRangeValue {
    if (!isCompleteDateRange(this.value)) {
      return { start: CalendarDay.today.native, end: CalendarDay.today.native };
    }

    let newDate = this.value?.start
      ? CalendarDay.from(this.value.start).native
      : CalendarDay.today.native;
    if (datePart.position === DateRangePosition.End) {
      newDate = this.value?.end
        ? CalendarDay.from(this.value.end).native
        : CalendarDay.today.native;
    }

    const parser =
      datePart.position === DateRangePosition.End
        ? this._endParser
        : this._startParser;
    const part = parser.getPartByType(datePart.part as DatePartType);

    if (part) {
      part.spin(delta, {
        date: newDate,
        spinLoop: this.spinLoop,
      });
    }

    const value = {
      ...this.value,
      [datePart.position]: newDate,
    } as DateRangeValue;
    return value;
  }

  protected override updateMask(): void {
    if (this._focused) {
      this._maskedValue = this.getMaskedValue();
    } else {
      if (!isCompleteDateRange(this.value)) {
        this._maskedValue = '';
        return;
      }

      const { start, end } = this.value;

      if (this.displayFormat) {
        // Use locale-based formatting for display format
        this._maskedValue = `${start.toLocaleDateString(this.locale)} - ${end.toLocaleDateString(this.locale)}`;
      } else {
        // Use parser formatting for input format
        this._maskedValue = `${this._startParser.formatDate(start)} - ${this._endParser.formatDate(end)}`;
      }
    }
  }

  protected override handleInput() {
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: JSON.stringify(this.value) });
  }

  private _setDatePartInMask(
    mask: string,
    parts: DateRangePartInfo[],
    value: Date | null
  ): string {
    if (!isValidDate(value)) {
      return mask;
    }

    let resultMask = mask;
    const parser =
      parts[0]?.position === DateRangePosition.End
        ? this._endParser
        : this._startParser;

    for (const part of parts) {
      if (part.type === DatePartType.Literal) {
        continue;
      }

      // Get the corresponding part from the parser
      const datePart = parser.getPartByType(part.type);
      if (!datePart) {
        continue;
      }

      const targetValue = datePart.getValue(value);

      resultMask = this._parser.replace(
        resultMask,
        targetValue,
        part.start,
        part.end
      ).value;
    }
    return resultMask;
  }

  private _parseRangeValue(value: string): DateRangeValue | null {
    const dates = value.split(SINGLE_INPUT_SEPARATOR);
    if (dates.length !== 2) {
      return null;
    }

    const start = this._startParser.parseDate(dates[0]);
    const end = this._endParser.parseDate(dates[1]);

    return { start: start ?? null, end: end ?? null };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
