import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { DatePartInfo, DateParts, DateTimeUtil } from './date-util';
import IgcMaskedInputComponent from './../masked-input/masked-input';
import { watch } from '../common/decorators';

export interface DatePartDeltas {
  date?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default class IgcDateInputComponent extends IgcMaskedInputComponent {
  public static override tagName = 'igc-date-input';
  protected _defaultMask!: string;
  protected _minValue!: string | Date;
  protected _maxValue!: string | Date;
  private _dateValue!: Date | null;
  private _inputDateParts!: DatePartInfo[];
  private _inputFormat!: string;
  // private _datePartDeltas: DatePartDeltas = {
  //   date: 1,
  //   month: 1,
  //   year: 1,
  //   hours: 1,
  //   minutes: 1,
  //   seconds: 1,
  // };

  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  @property()
  public locale = 'e';

  @property()
  public get inputFormat(): string {
    return this._inputFormat || this._defaultMask;
  }

  public set inputFormat(val: string) {
    if (val) {
      this.setMask(val);
      this._inputFormat = val;
    }
  }

  @property()
  public displayFormat!: string;

  @property({ attribute: false })
  public spinDelta!: DatePartDeltas;

  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  @property()
  public override get value(): string {
    return this._value;
  }

  public override set value(val: string) {
    this._value = val;

    const parse = DateTimeUtil.parseIsoDate(val);

    if (parse !== null) {
      this._dateValue = parse;
    }

    this.updateMask();
  }

  @property()
  public get minValue(): string | Date {
    return this._minValue;
  }

  public set minValue(value: string | Date) {
    this._minValue = value;
    //this.onValidatorChange();
  }

  @property()
  public get maxValue(): string | Date {
    return this._maxValue;
  }

  public set maxValue(value: string | Date) {
    this._maxValue = value;
    //this.onValidatorChange();
  }

  private get emptyMask(): string {
    return this.parser.apply();
  }

  // private get datePartDeltas(): DatePartDeltas {
  //   return Object.assign({}, this._datePartDeltas, this.spinDelta);
  // }

  private get targetDatePart(): DateParts {
    let result = DateParts.Year;

    if (document.activeElement === this) {
      const partType = this._inputDateParts.find(
        (p) =>
          p.start <= this.inputSelection.start &&
          this.inputSelection.start <= p.end &&
          p.type !== DateParts.Literal
      )?.type;

      if (partType) {
        result = partType;
      }
    } else {
      if (this._inputDateParts.some((p) => p.type === DateParts.Date)) {
        result = DateParts.Date;
      } else if (this._inputDateParts.some((p) => p.type === DateParts.Hours)) {
        result = DateParts.Hours;
      }
    }

    return result;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateDefaultMask();
    this.setMask(this.inputFormat);
    this.updateMask();
  }

  @watch('locale', { waitUntilFirstUpdate: true })
  protected setDefaultMask(): void {
    if (!this._inputFormat) {
      this.updateDefaultMask();
      this.setMask(this._defaultMask);
    }

    if (this._dateValue) {
      this.updateMask();
    }
  }

  @watch('displayFormat', { waitUntilFirstUpdate: true })
  protected setDisplayFormat(): void {
    if (this._dateValue) {
      this.maskedValue = DateTimeUtil.formatDate(
        this._dateValue,
        this.locale,
        this.displayFormat
      );
    }
  }

  @watch('mask', { waitUntilFirstUpdate: true })
  protected override maskChange() {
    if (this.value) {
      this.updateMask();
    }
  }

  public increment(datePart?: DateParts, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta);
    this.value = newValue.toISOString();
  }

  public decrement(datePart?: DateParts, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta, true);
    this.value = newValue.toISOString();
  }

  private trySpinValue(
    datePart: DateParts,
    delta?: number,
    negative = false
  ): Date {
    if (!delta) {
      // default to 1 if a delta is set to 0 or any other falsy value
      //delta = this.datePartDeltas[datePart] || 1;
      delta = 1;
    }

    const spinValue = negative ? -Math.abs(delta) : Math.abs(delta);
    return this.spinValue(datePart, spinValue);
  }

  private spinValue(datePart: DateParts, delta: number): Date {
    if (!this._dateValue || !DateTimeUtil.isValidDate(this._dateValue)) {
      return new Date();
    }

    const newDate = new Date(this._dateValue.getTime());
    let formatPart, amPmFromMask;
    switch (datePart) {
      case DateParts.Date:
        DateTimeUtil.spinDate(delta, newDate, this.spinLoop);
        break;
      case DateParts.Month:
        DateTimeUtil.spinMonth(delta, newDate, this.spinLoop);
        break;
      case DateParts.Year:
        DateTimeUtil.spinYear(delta, newDate);
        break;
      case DateParts.Hours:
        DateTimeUtil.spinHours(delta, newDate, this.spinLoop);
        break;
      case DateParts.Minutes:
        DateTimeUtil.spinMinutes(delta, newDate, this.spinLoop);
        break;
      case DateParts.Seconds:
        DateTimeUtil.spinSeconds(delta, newDate, this.spinLoop);
        break;
      case DateParts.AmPm:
        formatPart = this._inputDateParts.find(
          (dp) => dp.type === DateParts.AmPm
        );
        if (formatPart !== undefined) {
          amPmFromMask = this.maskedValue.substring(
            formatPart!.start,
            formatPart!.end
          );
          return DateTimeUtil.spinAmPm(newDate, this._dateValue, amPmFromMask);
        }
        break;
    }

    return newDate;
  }

  private updateDefaultMask(): void {
    this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
  }

  private setMask(val: string): void {
    const oldFormat = this._inputDateParts?.map((p) => p.format).join('');
    this._inputDateParts = DateTimeUtil.parseDateTimeFormat(val);
    val = this._inputDateParts.map((p) => p.format).join('');

    this._defaultMask = val;

    const newMask = (val || DateTimeUtil.DEFAULT_INPUT_FORMAT).replace(
      new RegExp(/(?=[^t])[\w]/, 'g'),
      '0'
    );

    this.mask =
      newMask.indexOf('tt') !== -1
        ? newMask.replace(new RegExp('tt', 'g'), 'LL')
        : newMask;

    this.parser.mask = this.mask;
    this.parser.prompt = this.prompt;

    if (!this.placeholder || oldFormat === this.placeholder) {
      this.placeholder = val;
    }
  }

  protected override handleFocus() {
    this.hasFocus = true;
    this.updateMask();
    this.emitEvent('igcFocus');
  }

  protected override handleBlur() {
    this.hasFocus = false;

    if (!this.isComplete() && this.maskedValue !== this.emptyMask) {
      this.value = this.parseDate(this.maskedValue)!.toISOString();
    } else {
      this.updateMask();
    }

    this.emitEvent('igcBlur');
  }

  protected override updateMask() {
    if (this.hasFocus) {
      // store the cursor position as it will be moved during masking
      const cursor = this.input.selectionEnd;
      this.maskedValue = this.getMaskedValue();
      this.input.setSelectionRange(cursor, cursor);
    } else {
      if (!this._dateValue || !DateTimeUtil.isValidDate(this._dateValue)) {
        this.maskedValue = '';
        return;
      }

      const format = this.displayFormat || this.inputFormat;

      if (format) {
        this.maskedValue = DateTimeUtil.formatDate(
          this._dateValue,
          this.locale,
          format
        );
      } else {
        this.maskedValue = this._dateValue.toLocaleString();
      }
    }
  }

  private parseDate(val: string) {
    if (!val) {
      return null;
    }

    return DateTimeUtil.parseValueFromMask(
      val,
      this._inputDateParts,
      this.prompt
    );
  }

  private getMaskedValue(): string {
    let mask = this.emptyMask;

    if (DateTimeUtil.isValidDate(new Date(this.value))) {
      for (const part of this._inputDateParts) {
        if (part.type === DateParts.Literal) {
          continue;
        }
        const targetValue = this.getPartValue(part, part.format.length);
        mask = this.parser.replace(
          mask,
          targetValue,
          part.start,
          part.end
        ).value;
      }
      return mask;
    }

    //if (!this.isComplete() || !this._onClear) {
    if (!this.isComplete()) {
      return this.maskedValue;
    }

    return mask;
  }

  private isComplete(): boolean {
    return this.maskedValue.indexOf(this.prompt) === -1;
  }

  private getPartValue(datePartInfo: DatePartInfo, partLength: number): string {
    let maskedValue: any;
    const datePart = datePartInfo.type;

    switch (datePart) {
      case DateParts.Date:
        maskedValue = this._dateValue!.getDate();
        break;
      case DateParts.Month:
        // months are zero based
        maskedValue = this._dateValue!.getMonth() + 1;
        break;
      case DateParts.Year:
        if (partLength === 2) {
          maskedValue = this.prependValue(
            parseInt(this._dateValue!.getFullYear().toString().slice(-2), 10),
            partLength,
            '0'
          );
        } else {
          maskedValue = this._dateValue!.getFullYear();
        }
        break;
      case DateParts.Hours:
        if (datePartInfo.format.indexOf('h') !== -1) {
          maskedValue = this.prependValue(
            this.toTwelveHourFormat(this._dateValue!.getHours().toString()),
            partLength,
            '0'
          );
        } else {
          maskedValue = this._dateValue!.getHours();
        }
        break;
      case DateParts.Minutes:
        maskedValue = this._dateValue!.getMinutes();
        break;
      case DateParts.Seconds:
        maskedValue = this._dateValue!.getSeconds();
        break;
      case DateParts.AmPm:
        maskedValue = this._dateValue!.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePartInfo.type !== DateParts.AmPm) {
      return this.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private prependValue(
    value: number,
    partLength: number,
    prependChar: string
  ): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private toTwelveHourFormat(value: string): number {
    let hour = parseInt(value.replace(new RegExp(this.prompt, 'g'), '0'), 10);
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }

  protected override updateInput(part: string, start: number, finish: number) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      part,
      start,
      finish
    );
    this.maskedValue = value;
    this._value = this.parser.parse(value);

    if (this.isComplete()) {
      const parsedDate = this.parseDate(this.maskedValue);
      if (DateTimeUtil.isValidDate(parsedDate)) {
        this.value = parsedDate.toISOString();
      }
    } else {
      this._dateValue = null;
    }

    this.requestUpdate();
    this.emitEvent('igcInput', { detail: this.value });
    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  }

  protected override handleChange() {
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected override renderInput() {
    return html`<div>
      <input
        type="text"
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder || this.emptyMask)}
        ?readonly=${this.readonly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @keydown=${this.handleKeydown}
      />
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-input': IgcDateInputComponent;
  }
}
