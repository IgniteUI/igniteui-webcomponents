import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CalendarDay } from '../calendar/model.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter } from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import {
  DatePart,
  type DatePartDeltas,
  DateParts,
  type DateRangePart,
  type DateRangePartInfo,
  DateTimeUtil,
} from '../date-time-input/date-util.js';
import type { MaskRange } from '../mask-input/mask-input-base.js';
import type { DateRangeValue } from './date-range-picker.js';

export interface IgcDateRangeInputComponentEventMap {
  igcChange: CustomEvent<DateRangeValue | null>;
}

const SINGLE_INPUT_SEPARATOR = ' - ';

export default class IgcDateRangeInputComponent extends EventEmitterMixin<
  IgcDateRangeInputComponentEventMap,
  Constructor<IgcDateTimeInputComponent>
>(IgcDateTimeInputComponent) {
  public static readonly tagName = 'igc-date-range-input';

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected override inputId = `date-range-input-${IgcDateRangeInputComponent.increment()}`;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDateRangeInputComponent, IgcDateTimeInputComponent);
  }

  private _range: DateRangeValue | null = null;
  private _inputDateRangeParts!: DateRangePartInfo[];
  private _oldRangeValue: DateRangeValue | null = null;

  protected override _inputFormat!: string;

  private get isRangeValid(): boolean {
    return (
      !!this.range &&
      DateTimeUtil.isValidDate(this.range?.start) &&
      DateTimeUtil.isValidDate(this.range?.end)
    );
  }

  public get range(): DateRangeValue | null {
    return this._range;
  }

  public set range(value: DateRangeValue | null) {
    this._range = value;
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
      if (this.range) {
        this.updateMask();
      }
    }
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setMask(this.inputFormat);
    if (this.range) {
      this.updateMask();
    }
  }

  @watch('displayFormat')
  protected onDisplayFormatChange() {
    this.updateMask();
  }

  protected get targetDateRangePart(): DateRangePart | undefined {
    let result: DateRangePart | undefined;

    if (this.focused) {
      const part = this._inputDateRangeParts.find(
        (p) =>
          p.start <= this.inputSelection.start &&
          this.inputSelection.start <= p.end &&
          p.type !== DateParts.Literal
      );
      const partType = part?.type as string as DatePart;

      if (partType) {
        result = { part: partType, rangePart: part?.rangePart! };
      }
    } else {
      result = {
        part: this._inputDateRangeParts[0].type as string as DatePart,
        rangePart: 'start',
      };
    }

    return result;
  }

  /** Increments a date portion. */
  public override stepUp(datePart?: DatePart, delta?: number): void {
    const targetPart = (datePart || this.targetDateRangePart) as DateRangePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this.inputSelection;
    const newValue = this.trySpinRangeValue(targetPart, delta);
    this.range = newValue;
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  /** Decrements a date portion. */
  public override stepDown(datePart?: DatePart, delta?: number): void {
    const targetPart = (datePart || this.targetDateRangePart) as DateRangePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this.inputSelection;
    const newValue = this.trySpinRangeValue(targetPart, delta, true);
    this.range = newValue;
    this.updateComplete.then(() => {
      this.input.setSelectionRange(start, end);
    });
  }

  protected override setMask(string: string) {
    const oldFormat = this._inputDateRangeParts?.map((p) => p.format).join('');
    this._inputDateRangeParts = DateTimeUtil.parseDateTimeFormat(string);
    const startParts = this._inputDateRangeParts.map((part) => ({
      ...part,
      rangePart: 'start',
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
        rangePart: 'separator',
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
        rangePart: 'end',
      };
      currentPosition += length;
      return newPart;
    });

    this._inputDateRangeParts = [...startParts, ...separatorParts, ...endParts];

    this._defaultMask = this._inputDateRangeParts.map((p) => p.format).join('');

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

    if (DateTimeUtil.isValidDate(this.range?.start)) {
      const startParts = this._inputDateRangeParts.filter(
        (p) => p.rangePart === 'start'
      );
      mask = this.setDatePartInMask(mask, startParts, this.range.start);
    }
    if (DateTimeUtil.isValidDate(this.range?.end)) {
      const endParts = this._inputDateRangeParts.filter(
        (p) => p.rangePart === 'end'
      );
      mask = this.setDatePartInMask(mask, endParts, this.range.end);
      return mask;
    }

    return this.maskedValue === '' ? mask : this.maskedValue;
  }

  protected override navigateParts(delta: number) {
    const position = this.getNewPosition(this.input.value, delta);
    this.setSelectionRange(position, position);
  }

  protected override getNewPosition(value: string, direction = 0): number {
    let cursorPos = this.selection.start;

    const separatorPart = this._inputDateRangeParts.find(
      (part) => part.rangePart === 'separator'
    );

    if (!direction) {
      const firstSeparator =
        this._inputDateRangeParts.find((p) => p.rangePart === 'separator')
          ?.start ?? 0;
      const lastSeparator =
        this._inputDateRangeParts.findLast((p) => p.rangePart === 'separator')
          ?.end ?? 0;
      // Last literal before the current cursor position or start of input value
      let part = this._inputDateRangeParts.findLast(
        (part) => part.type === DateParts.Literal && part.end < cursorPos
      );
      // skip over the separator parts
      if (part?.rangePart === 'separator' && cursorPos === lastSeparator) {
        cursorPos = firstSeparator;
        part = this._inputDateRangeParts.findLast(
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
    const part = this._inputDateRangeParts.find(
      (part) => part.type === DateParts.Literal && part.start > cursorPos
    );
    return part?.start ?? value.length;
  }

  private setDatePartInMask(
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

  private updateRange(): void {
    if (this.isComplete()) {
      const parsedRange = this.parseRangeValue(this.maskedValue);
      this.range = parsedRange;
    } else {
      this.range = null;
    }
  }

  protected override async handleFocus() {
    this.focused = true;

    if (this.readOnly) {
      return;
    }
    this._oldRangeValue = this.range;
    const areFormatsDifferent = this.displayFormat !== this.inputFormat;

    if (!this.range || !this.range.start || !this.range.end) {
      this.maskedValue = this.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (areFormatsDifferent) {
      this.updateMask();
    }
  }

  protected override async handleBlur() {
    const isEmptyMask = this.maskedValue === this.emptyMask;
    const isSameValue = DateTimeUtil.areDateRangesEqual(
      this._oldRangeValue,
      this.range
    );

    this.focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
      const parse = this.parseRangeValue(this.maskedValue);

      if (parse) {
        this.range = parse;
      } else {
        this.range = null;
        this.maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.range });
    }
  }

  protected trySpinRangeValue(
    datePart: DateRangePart,
    delta?: number,
    negative = false
  ): DateRangeValue {
    // default to 1 if a delta is set to 0 or any other falsy value
    const _delta =
      delta || this.datePartDeltas[datePart.part as keyof DatePartDeltas] || 1;

    const spinValue = negative ? -Math.abs(_delta) : Math.abs(_delta);
    return this.spinRangeValue(datePart, spinValue);
  }

  protected spinRangeValue(
    datePart: DateRangePart,
    delta: number
  ): DateRangeValue {
    if (!this.isRangeValid) {
      return { start: CalendarDay.today.native, end: CalendarDay.today.native };
    }

    let newDate = this.range?.start
      ? CalendarDay.from(this.range.start).native
      : CalendarDay.today.native;
    if (datePart.rangePart === 'end') {
      newDate = this.range?.end
        ? CalendarDay.from(this.range.end).native
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
      ...this.range,
      [datePart.rangePart]: newDate,
    } as DateRangeValue;
    return value;
  }

  protected override updateMask() {
    if (this.focused) {
      this.maskedValue = this.getMaskedValue();
    } else {
      if (!this.isRangeValid) {
        this.maskedValue = '';
        return;
      }

      let startMask = '';
      let endMask = '';
      const format = this.displayFormat || this.inputFormat;

      if (format) {
        startMask = DateTimeUtil.formatDate(
          this.range!.start!,
          this.locale,
          format
        );
        endMask = DateTimeUtil.formatDate(
          this.range!.end!,
          this.locale,
          format
        );
        this.maskedValue = `${startMask} - ${endMask}`;
      } else {
        startMask = this.range!.start!.toLocaleDateString();
        endMask = this.range!.end!.toLocaleDateString();
        this.maskedValue = `${startMask} - ${endMask}`;
      }
    }
  }

  protected override async updateInput(string: string, range: MaskRange) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      string,
      range.start,
      range.end
    );

    this.maskedValue = value;

    this.updateRange();
    this.requestUpdate();

    if (range.start !== this.inputFormat.length) {
      this.handleInput();
    }
    await this.updateComplete;
    this.input.setSelectionRange(end, end);
  }

  private parseRangeValue(value: string): DateRangeValue | null {
    const dates = value.split(SINGLE_INPUT_SEPARATOR);
    if (dates.length !== 2) {
      return null;
    }

    const startParts = this._inputDateRangeParts.filter(
      (p) => p.rangePart === 'start'
    );

    const endPartsOriginal = this._inputDateRangeParts.filter(
      (p) => p.rangePart === 'end'
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

  protected override handleInput() {
    this.emitEvent('igcInput', { detail: JSON.stringify(this.range) });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}
