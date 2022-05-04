import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import {
  DatePartDeltas,
  DatePartInfo,
  DateParts,
  DatePart,
  DateTimeUtil,
} from './date-util';
import { watch } from '../common/decorators';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcMaskInputBaseComponent } from '../mask-input/mask-input-base';
import { partNameMap } from '../common/util';

export default class IgcDateTimeInputComponent extends IgcMaskInputBaseComponent {
  public static readonly tagName = 'igc-date-time-input';

  protected _defaultMask!: string;
  protected _value!: Date | null;
  private _dataValue = '';

  private _dateValue!: Date | null;
  private _inputDateParts!: DatePartInfo[];
  private _inputFormat!: string;
  private _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
  };

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

  @property({
    converter: (value) => {
      return value ? new Date(value) : null;
    },
  })
  public get value(): Date | null {
    return this._value;
  }

  public set value(val: Date | null) {
    this._value = val;

    this._dateValue = DateTimeUtil.isValidDate(val) ? val : null;

    this.updateMask();
    this.validate();
  }

  @property({ attribute: 'min-value' })
  public minValue!: Date | string;

  @property({ attribute: 'max-value' })
  public maxValue!: Date | string;

  @property()
  public displayFormat!: string;

  @property({ attribute: false })
  public spinDelta!: DatePartDeltas;

  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  @property()
  public locale = 'e';

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
    if (this.displayFormat) {
      this.placeholder = this.displayFormat;

      if (this.value) {
        this.maskedValue = DateTimeUtil.formatDate(
          this._dateValue!, //TODO check if we can remove _dateValue and use value
          this.locale,
          this.displayFormat
        );
      }
    }
  }

  @watch('mask', { waitUntilFirstUpdate: true })
  protected maskChange(): void {
    if (this.value) {
      this.updateMask();
    }
  }

  @watch('prompt', { waitUntilFirstUpdate: true })
  protected promptChange(): void {
    if (!this.prompt) {
      this.prompt = this.parser.prompt;
    } else {
      this.parser.prompt = this.prompt;
    }
  }

  @watch('required', { waitUntilFirstUpdate: true })
  @watch('disabled', { waitUntilFirstUpdate: true })
  @watch('value', { waitUntilFirstUpdate: true })
  protected handleInvalidState(): void {
    this.updateComplete.then(
      () => (this.invalid = !this.input.checkValidity())
    );
  }

  @watch('maxValue')
  @watch('minValue')
  protected validate() {
    if (!this.value) {
      return null;
    }

    let errors = {};

    const minValueDate = DateTimeUtil.isValidDate(this.minValue)
      ? this.minValue
      : DateTimeUtil.parseIsoDate(this.minValue);

    const maxValueDate = DateTimeUtil.isValidDate(this.maxValue)
      ? this.maxValue
      : DateTimeUtil.parseIsoDate(this.maxValue);

    if (minValueDate || maxValueDate) {
      errors = DateTimeUtil.validateMinMax(
        this.value!,
        minValueDate!,
        maxValueDate!,
        this.hasTimeParts,
        this.hasDateParts
      );

      if (Object.keys(errors).length > 0) {
        this.invalid = true;
      } else {
        this.invalid = false;
      }
    }

    return errors;
  }

  private get hasDateParts(): boolean {
    return this._inputDateParts.some(
      (p) =>
        p.type === DateParts.Date ||
        p.type === DateParts.Month ||
        p.type === DateParts.Year
    );
  }

  private get hasTimeParts(): boolean {
    return this._inputDateParts.some(
      (p) =>
        p.type === DateParts.Hours ||
        p.type === DateParts.Minutes ||
        p.type === DateParts.Seconds
    );
  }

  private get targetDatePart(): DatePart | undefined {
    let result;

    if (this.hasFocus) {
      const partType = this._inputDateParts.find(
        (p) =>
          p.start <= this.inputSelection.start &&
          this.inputSelection.start <= p.end &&
          p.type !== DateParts.Literal
      )?.type as string as DatePart;

      if (partType) {
        result = partType;
      }
    } else {
      if (this._inputDateParts.some((p) => p.type === DateParts.Date)) {
        result = DatePart.Date;
      } else if (this._inputDateParts.some((p) => p.type === DateParts.Hours)) {
        result = DatePart.Hours;
      } else {
        result = this._inputDateParts[0].type as string as DatePart;
      }
    }

    return result;
  }

  private get datePartDeltas(): DatePartDeltas {
    return Object.assign({}, this._datePartDeltas, this.spinDelta);
  }

  constructor() {
    super();
    this.addEventListener('wheel', this.onWheel);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateDefaultMask();
    this.setMask(this.inputFormat);
    this.updateMask();
  }

  /** Checks for validity of the control and shows the browser message if it's invalid. */
  public reportValidity() {
    const state = this._value
      ? Object.keys(this.validate()!).length === 0
      : this.input.reportValidity();

    this.invalid = !state;
    return state;
  }

  /** Check for validity of the control */
  public checkValidity() {
    if (this.disabled) {
      return this.input.checkValidity();
    }

    if (!this._value) {
      return !this.required;
    }

    return (
      this.input.checkValidity() && Object.keys(this.validate()!).length === 0
    );
  }

  public stepUp(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta);
    this.value = newValue;
    this.setFocus();
  }

  public stepDown(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta, true);
    this.value = newValue;
    this.setFocus();
  }

  public clear(): void {
    this._dataValue = '';
    this.maskedValue = '';
    this.value = null;
    this.setSelectionRange(0, this.input.value.length);
  }

  protected updateMask() {
    if (this.hasFocus) {
      // store the cursor position as it will be moved during masking
      const cursor = this.input.selectionEnd;
      this.maskedValue = this.getMaskedValue();
      this.setSelectionRange(cursor!, cursor!);
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

  protected handleChange() {
    this.emitEvent('igcChange', { detail: this.value?.toString() });
    this.invalid = !this.checkValidity();
  }

  protected handleDragLeave() {
    if (!this.hasFocus) {
      this.updateMask();
    }
  }

  protected handleDragEnter() {
    if (!this.hasFocus) {
      this.maskedValue = this.parser.apply(this._dataValue);
    }
  }

  protected insertFromDrop(value: string) {
    const { start, end } = this.inputSelection;
    this.maskedValue = this.parser.apply(value);
    this._dataValue = this.parser.parse(value);

    this.updateValue();
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  protected updateInput(part: string, start: number, finish: number) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      part,
      start,
      finish
    );

    this.maskedValue = value;
    this._dataValue = this.parser.parse(value);

    this.updateValue();
    this.requestUpdate();
    this.emitEvent('igcInput', { detail: this.value?.toString() });
    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  }

  protected override resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
      filled: !!this.value,
    };
  }

  private trySpinValue(
    datePart: DatePart,
    delta?: number,
    negative = false
  ): Date {
    if (!delta) {
      // default to 1 if a delta is set to 0 or any other falsy value
      delta = this.datePartDeltas[datePart as keyof DatePartDeltas] || 1;
    }

    const spinValue = negative ? -Math.abs(delta) : Math.abs(delta);
    return this.spinValue(datePart, spinValue);
  }

  private spinValue(datePart: DatePart, delta: number): Date {
    if (!this._dateValue || !DateTimeUtil.isValidDate(this._dateValue)) {
      return new Date();
    }

    const newDate = new Date(this._dateValue.getTime());
    let formatPart, amPmFromMask;
    switch (datePart) {
      case DatePart.Date:
        DateTimeUtil.spinDate(delta, newDate, this.spinLoop);
        break;
      case DatePart.Month:
        DateTimeUtil.spinMonth(delta, newDate, this.spinLoop);
        break;
      case DatePart.Year:
        DateTimeUtil.spinYear(delta, newDate);
        break;
      case DatePart.Hours:
        DateTimeUtil.spinHours(delta, newDate, this.spinLoop);
        break;
      case DatePart.Minutes:
        DateTimeUtil.spinMinutes(delta, newDate, this.spinLoop);
        break;
      case DatePart.Seconds:
        DateTimeUtil.spinSeconds(delta, newDate, this.spinLoop);
        break;
      case DatePart.AmPm:
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

  private onWheel(event: WheelEvent) {
    if (!this.hasFocus) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.deltaY > 0) {
      this.stepDown();
    } else {
      this.stepUp();
    }
  }

  private async setFocus() {
    await this.updateComplete;

    this.setSelectionRange(this.selection.start, this.selection.end);
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

    if (DateTimeUtil.isValidDate(this.value)) {
      for (const part of this._inputDateParts) {
        if (part.type === DateParts.Literal) {
          continue;
        }

        const targetValue = DateTimeUtil.getPartValue(
          part,
          part.format.length,
          this._dateValue
        );

        mask = this.parser.replace(
          mask,
          targetValue,
          part.start,
          part.end
        ).value;
      }
      return mask;
    }

    return this.maskedValue === '' ? mask : this.maskedValue;
  }

  private isComplete(): boolean {
    return this.maskedValue.indexOf(this.prompt) === -1;
  }

  private updateValue(): void {
    if (this.isComplete()) {
      const parsedDate = this.parseDate(this.maskedValue);
      if (DateTimeUtil.isValidDate(parsedDate)) {
        this.value = parsedDate;
      } else {
        this.value = null;
        this._dataValue = '';
      }
    } else if (
      !this.parseDate(this.maskedValue) ||
      this.maskedValue === this.emptyMask
    ) {
      this._dataValue = '';
    }
  }

  private getNewPosition(value: string, direction = 0): number {
    const literals = this._inputDateParts.filter(
      (p) => p.type === DateParts.Literal
    );
    let cursorPos = this.selection.start;

    if (!direction) {
      do {
        cursorPos = cursorPos > 0 ? --cursorPos : cursorPos;
      } while (!literals.some((l) => l.end === cursorPos) && cursorPos > 0);
      return cursorPos;
    } else {
      do {
        cursorPos++;
      } while (
        !literals.some((l) => l.start === cursorPos) &&
        cursorPos < value.length
      );
      return cursorPos;
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
      const parse = this.parseDate(this.maskedValue);

      if (parse) {
        this.value = parse;
        this._dataValue = this.maskedValue;
      } else {
        this.value = null;
        this.maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    this.emitEvent('igcBlur');
  }

  protected override handleKeydown(e: KeyboardEvent) {
    super.handleKeydown(e);

    const key = e.key;

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if (e.ctrlKey) {
          e.preventDefault();
          const value = (e.target as HTMLInputElement).value;
          const dir = key === 'ArrowRight' ? 1 : 0;
          const pos = this.getNewPosition(value, dir);

          this.setSelectionRange(pos, pos);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.stepUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.stepDown();
        break;
      case ';':
        if (e.ctrlKey) {
          this.value = new Date();
        }
        break;
    }
  }

  protected override renderInput() {
    return html`<div>
      <input
        type="text"
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder || this.emptyMask)}
        ?readonly=${this.readonly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @invalid="${this.handleInvalid}"
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @keydown=${this.handleKeydown}
        @cut=${this.handleCut}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${this.handleDragStart}
      />
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
