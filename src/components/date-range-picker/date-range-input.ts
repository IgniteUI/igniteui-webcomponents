import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CalendarDay } from '../calendar/model.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { FormValueDateRangeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { createCounter, equal } from '../common/util.js';
import { IgcDateTimeInputBaseComponent } from '../date-time-input/date-time-input.base.js';
import {
  DatePart,
  type DatePartDeltas,
  DateParts,
  type DateRangePart,
  type DateRangePartInfo,
  DateRangePosition,
  DateTimeUtil,
} from '../date-time-input/date-util.js';
import type { DateRangeValue } from './date-range-picker.js';
import { isCompleteDateRange } from './validators.js';

const SINGLE_INPUT_SEPARATOR = ' - ';

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

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDateRangeInputComponent);
  }

  // #region Properties

  private static readonly increment = createCounter();

  protected override inputId = `date-range-input-${IgcDateRangeInputComponent.increment()}`;
  protected override _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
  };

  private _oldRangeValue: DateRangeValue | null = null;

  protected override _inputFormat!: string;

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override get targetDatePart(): DateRangePart | undefined {
    let result: DateRangePart | undefined;

    if (this.focused) {
      const part = this._inputDateParts.find(
        (p) =>
          p.start <= this.inputSelection.start &&
          this.inputSelection.start <= p.end &&
          p.type !== DateParts.Literal
      );
      const partType = part?.type as string as DatePart;

      if (partType) {
        result = { part: partType, position: part?.position! };
      }
    } else {
      result = {
        part: this._inputDateParts[0].type as string as DatePart,
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

  protected override setMask(string: string) {
    const oldFormat = this._inputDateParts?.map((p) => p.format).join('');
    this._inputDateParts = DateTimeUtil.parseDateTimeFormat(string);
    const startParts = this._inputDateParts.map((part) => ({
      ...part,
      position: DateRangePosition.Start,
    })) as DateRangePartInfo[];

    const separatorStart = startParts[startParts.length - 1].end;
    const separatorParts: DateRangePartInfo[] = [];

    for (let i = 0; i < SINGLE_INPUT_SEPARATOR.length; i++) {
      const element = SINGLE_INPUT_SEPARATOR.charAt(i);

      separatorParts.push({
        type: DateParts.Literal,
        format: element,
        start: separatorStart + i,
        end: separatorStart + i + 1,
        position: DateRangePosition.Separator,
      });
    }

    let currentPosition = separatorStart + SINGLE_INPUT_SEPARATOR.length;

    // Clone original parts, adjusting positions
    const endParts: DateRangePartInfo[] = startParts.map((part) => {
      const length = part.end - part.start;
      const newPart: DateRangePartInfo = {
        type: part.type,
        format: part.format,
        start: currentPosition,
        end: currentPosition + length,
        position: DateRangePosition.End,
      };
      currentPosition += length;
      return newPart;
    });

    this._inputDateParts = [...startParts, ...separatorParts, ...endParts];

    this._defaultMask = this._inputDateParts.map((p) => p.format).join('');

    const value = this._defaultMask;
    this._mask = (value || DateTimeUtil.DEFAULT_INPUT_FORMAT).replace(
      new RegExp(/(?=[^t])[\w]/, 'g'),
      '0'
    );

    this.parser.mask = this._mask;
    this.parser.prompt = this.prompt;

    if (!this.placeholder || oldFormat === this.placeholder) {
      this.placeholder = value;
    }
  }

  protected override getMaskedValue() {
    let mask = this.emptyMask;

    if (DateTimeUtil.isValidDate(this.value?.start)) {
      const startParts = this._inputDateParts.filter(
        (p) => p.position === DateRangePosition.Start
      );
      mask = this._setDatePartInMask(mask, startParts, this.value.start);
    }
    if (DateTimeUtil.isValidDate(this.value?.end)) {
      const endParts = this._inputDateParts.filter(
        (p) => p.position === DateRangePosition.End
      );
      mask = this._setDatePartInMask(mask, endParts, this.value.end);
      return mask;
    }

    return this.maskedValue === '' ? mask : this.maskedValue;
  }

  protected override getNewPosition(value: string, direction = 0): number {
    let cursorPos = this.selection.start;

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
        (part) => part.type === DateParts.Literal && part.end < cursorPos
      );
      // skip over the separator parts
      if (
        part?.position === DateRangePosition.Separator &&
        cursorPos === lastSeparator
      ) {
        cursorPos = firstSeparator;
        part = this._inputDateParts.findLast(
          (part) => part.type === DateParts.Literal && part.end < cursorPos
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
      (part) => part.type === DateParts.Literal && part.start > cursorPos
    );
    return part?.start ?? value.length;
  }

  protected override updateValue(): void {
    if (this.isComplete()) {
      const parsedRange = this._parseRangeValue(this.maskedValue);
      this.value = parsedRange;
    } else {
      this.value = null;
    }
  }

  protected override async handleFocus() {
    this.focused = true;

    if (this.readOnly) {
      return;
    }
    this._oldRangeValue = this.value;
    const areFormatsDifferent = this.displayFormat !== this.inputFormat;

    if (!this.value || !this.value.start || !this.value.end) {
      this.maskedValue = this.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (areFormatsDifferent) {
      this.updateMask();
    }
  }

  protected override async handleBlur() {
    const isEmptyMask = this.maskedValue === this.emptyMask;
    const isSameValue = equal(this._oldRangeValue, this.value);

    this.focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
      const parse = this._parseRangeValue(this.maskedValue);

      if (parse) {
        this.value = parse;
      } else {
        this.value = null;
        this.maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    this._handleBlur();
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

    switch (datePart.part) {
      case DatePart.Date:
        DateTimeUtil.spinDate(delta, newDate, this.spinLoop);
        break;
      case DatePart.Month:
        DateTimeUtil.spinMonth(delta, newDate, this.spinLoop);
        break;
      case DatePart.Year:
        DateTimeUtil.spinYear(delta, newDate);
        break;
    }
    const value = {
      ...this.value,
      [datePart.position]: newDate,
    } as DateRangeValue;
    return value;
  }

  protected override updateMask() {
    if (this.focused) {
      this.maskedValue = this.getMaskedValue();
    } else {
      if (!isCompleteDateRange(this.value)) {
        this.maskedValue = '';
        return;
      }

      const { formatDate, predefinedToDateDisplayFormat } = DateTimeUtil;

      const { start, end } = this.value;
      const format =
        predefinedToDateDisplayFormat(this.displayFormat) ??
        this.displayFormat ??
        this.inputFormat;

      this.maskedValue = format
        ? `${formatDate(start, this.locale, format)} - ${formatDate(end, this.locale, format)}`
        : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
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
    let resultMask = mask;
    for (const part of parts) {
      if (part.type === DateParts.Literal) {
        continue;
      }

      const targetValue = DateTimeUtil.getPartValue(
        part,
        part.format.length,
        value
      );

      resultMask = this.parser.replace(
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

    const startParts = this._inputDateParts.filter(
      (p) => p.position === DateRangePosition.Start
    );

    const endPartsOriginal = this._inputDateParts.filter(
      (p) => p.position === DateRangePosition.End
    );

    // Rebase endParts to start from 0, so they can be parsed on their own
    const offset = endPartsOriginal.length > 0 ? endPartsOriginal[0].start : 0;
    const endParts = endPartsOriginal.map((p) => ({
      ...p,
      start: p.start - offset,
      end: p.end - offset,
    }));

    const start = DateTimeUtil.parseValueFromMask(
      dates[0],
      startParts,
      this.prompt
    );

    const end = DateTimeUtil.parseValueFromMask(
      dates[1],
      endParts,
      this.prompt
    );

    return { start: start ?? null, end: end ?? null };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
