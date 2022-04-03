// import { html } from 'lit';
// import { property } from 'lit/decorators.js';
// import { live } from 'lit/directives/live.js';
// import { DatePartInfo, DateParts, DateTimeUtil } from './date-util';
// import { watch } from '../common/decorators';
// import { ifDefined } from 'lit/directives/if-defined.js';
//import { IgcMaskedInputBaseComponent } from '../masked-input/masked-input-base';
import { LitElement } from 'lit';

export interface DatePartDeltas {
  date?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

//export default class IgcDateInputComponent extends IgcMaskedInputBaseComponent {
export default class IgcDateInputComponent extends LitElement {

  public static readonly tagName = 'igc-date-input';

  // protected _defaultMask!: string;
  // protected _minValue!: string | Date;
  // protected _maxValue!: string | Date;
  // protected _value!: Date | null;

  // private _dateValue!: Date | null;
  // private _inputDateParts!: DatePartInfo[];
  // private _inputFormat!: string;
  // // private _datePartDeltas: DatePartDeltas = {
  // //   date: 1,
  // //   month: 1,
  // //   year: 1,
  // //   hours: 1,
  // //   minutes: 1,
  // //   seconds: 1,
  // // };

  // @property()
  // public get inputFormat(): string {
  //   return this._inputFormat || this._defaultMask;
  // }

  // public set inputFormat(val: string) {
  //   if (val) {
  //     this.setMask(val);
  //     this._inputFormat = val;
  //   }
  // }

  // @property({
  //     converter: (value) => {
  //       return value ? new Date(value) : null;
  //     },
  // })
  // public get value(): Date | null {
  //   return this._value;
  // }

  // public set value(val: Date | null) {
  //   this._value = val;

  //   this._dateValue = DateTimeUtil.isValidDate(val) ? val : null

  //   this.updateMask();
  // }

  // @property({ attribute: 'min-value' })
  // public get minValue(): string | Date {
  //   return this._minValue;
  // }

  // public set minValue(value: string | Date) {
  //   this._minValue = value;
  //   //this.onValidatorChange();
  // }

  // @property({ attribute: 'max-value' })
  // public get maxValue(): string | Date {
  //   return this._maxValue;
  // }

  // public set maxValue(value: string | Date) {
  //   this._maxValue = value;
  //   //this.onValidatorChange();
  // }

  // @property()
  // public displayFormat!: string;

  // @property({ attribute: false })
  // public spinDelta!: DatePartDeltas;

  // @property({ type: Boolean, attribute: 'spin-loop' })
  // public spinLoop = true;

  // @property({ reflect: true })
  // public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  // @property()
  // public locale = 'e';

  // @watch('locale', { waitUntilFirstUpdate: true })
  // protected setDefaultMask(): void {
  //   if (!this._inputFormat) {
  //     this.updateDefaultMask();
  //     this.setMask(this._defaultMask);
  //   }

  //   if (this._dateValue) {
  //     this.updateMask();
  //   }
  // }

  // @watch('displayFormat', { waitUntilFirstUpdate: true })
  // protected setDisplayFormat(): void {
  //   if (this._dateValue) {
  //     this.maskedValue = DateTimeUtil.formatDate(
  //       this._dateValue,
  //       this.locale,
  //       this.displayFormat
  //     );
  //   }
  // }

  // @watch('mask', { waitUntilFirstUpdate: true })
  // protected maskChange(): void {
  //   if (this.value) {
  //     this.updateMask();
  //   }
  // }

  // @watch('prompt', { waitUntilFirstUpdate: true })
  // protected promptChange(): void {
  //   if (!this.prompt) {
  //     this.prompt = this.parser.prompt;
  //   } else {
  //     this.parser.prompt = this.prompt;
  //   }
  // }

  // private get targetDatePart(): DateParts {
  //   let result = DateParts.Year;

  //   if (document.activeElement === this) {
  //     const partType = this._inputDateParts.find(
  //       (p) =>
  //         p.start <= this.inputSelection.start &&
  //         this.inputSelection.start <= p.end &&
  //         p.type !== DateParts.Literal
  //     )?.type;

  //     if (partType) {
  //       result = partType;
  //     }
  //   } else {
  //     if (this._inputDateParts.some((p) => p.type === DateParts.Date)) {
  //       result = DateParts.Date;
  //     } else if (this._inputDateParts.some((p) => p.type === DateParts.Hours)) {
  //       result = DateParts.Hours;
  //     }
  //   }

  //   return result;
  // }

  // constructor() {
  //   super();
  //   this.addEventListener('wheel', this.onWheel);
  // }

  // public override connectedCallback() {
  //   super.connectedCallback();
  //   this.updateDefaultMask();
  //   this.setMask(this.inputFormat);
  //   this.updateMask();
  // }

  // public stepUp(datePart?: DateParts, delta?: number): void {
  //   const targetPart = datePart || this.targetDatePart;

  //   if (!targetPart) {
  //     return;
  //   }

  //   const newValue = this.trySpinValue(targetPart, delta);
  //   this.value = newValue;
  // }

  // public stepDown(datePart?: DateParts, delta?: number): void {
  //   const targetPart = datePart || this.targetDatePart;

  //   if (!targetPart) {
  //     return;
  //   }

  //   const newValue = this.trySpinValue(targetPart, delta, true);
  //   this.value = newValue;
  // }

  // public clear(): void {
  //   this.value = null;
  //   this.setSelectionRange(0, this.input.value.length);
  // }

  // protected updateMask() {
  //   if (this.hasFocus) {
  //     // store the cursor position as it will be moved during masking
  //     const cursor = this.input.selectionEnd;
  //     this.maskedValue = this.getMaskedValue();
  //     this.input.setSelectionRange(cursor, cursor);
  //   } else {
  //     if (!this._dateValue || !DateTimeUtil.isValidDate(this._dateValue)) {
  //       this.maskedValue = '';
  //       return;
  //     }

  //     const format = this.displayFormat || this.inputFormat;

  //     if (format) {
  //       this.maskedValue = DateTimeUtil.formatDate(
  //         this._dateValue,
  //         this.locale,
  //         format
  //       );
  //     } else {
  //       this.maskedValue = this._dateValue.toLocaleString();
  //     }
  //   }
  // }

  // protected handleChange() {
  //   this.emitEvent('igcChange', { detail: this.value?.toString() });
  // }

  // protected handleDragLeave() {
  //   if (!this.hasFocus) {
  //     this.updateMask();
  //   }
  // }

  // protected handleDragEnter() {
  //   if (!this.hasFocus) {
  //     this.maskedValue = this.parser.apply(this.maskedValue);
  //   }
  // }

  // protected insertFromDrop(value: string) {
  //   const { start, end } = this.inputSelection;
  //   this.maskedValue = this.parser.apply(value);

  //   this.updateValue();
  //   this.droppedText = '';
  //   this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  // }

  // protected updateInput(part: string, start: number, finish: number) {
  //   const { value, end } = this.parser.replace(
  //     this.maskedValue,
  //     part,
  //     start,
  //     finish
  //   );

  //   this.maskedValue = value;
  //   this.updateValue();
  //   this.requestUpdate();
  //   this.emitEvent('igcInput', { detail: this.value?.toString() });
  //   this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  // }

  // private trySpinValue(
  //   datePart: DateParts,
  //   delta?: number,
  //   negative = false
  // ): Date {
  //   if (!delta) {
  //     // default to 1 if a delta is set to 0 or any other falsy value
  //     //delta = this.datePartDeltas[datePart] || 1;
  //     delta = 1; //TODO Fix
  //   }

  //   const spinValue = negative ? -Math.abs(delta) : Math.abs(delta);
  //   return this.spinValue(datePart, spinValue);
  // }

  // private spinValue(datePart: DateParts, delta: number): Date {
  //   if (!this._dateValue || !DateTimeUtil.isValidDate(this._dateValue)) {
  //     return new Date();
  //   }

  //   const newDate = new Date(this._dateValue.getTime());
  //   let formatPart, amPmFromMask;
  //   switch (datePart) {
  //     case DateParts.Date:
  //       DateTimeUtil.spinDate(delta, newDate, this.spinLoop);
  //       break;
  //     case DateParts.Month:
  //       DateTimeUtil.spinMonth(delta, newDate, this.spinLoop);
  //       break;
  //     case DateParts.Year:
  //       DateTimeUtil.spinYear(delta, newDate);
  //       break;
  //     case DateParts.Hours:
  //       DateTimeUtil.spinHours(delta, newDate, this.spinLoop);
  //       break;
  //     case DateParts.Minutes:
  //       DateTimeUtil.spinMinutes(delta, newDate, this.spinLoop);
  //       break;
  //     case DateParts.Seconds:
  //       DateTimeUtil.spinSeconds(delta, newDate, this.spinLoop);
  //       break;
  //     case DateParts.AmPm:
  //       formatPart = this._inputDateParts.find(
  //         (dp) => dp.type === DateParts.AmPm
  //       );
  //       if (formatPart !== undefined) {
  //         amPmFromMask = this.maskedValue.substring(
  //           formatPart!.start,
  //           formatPart!.end
  //         );
  //         return DateTimeUtil.spinAmPm(newDate, this._dateValue, amPmFromMask);
  //       }
  //       break;
  //   }

  //   return newDate;
  // }

  // private onWheel(event: WheelEvent) {
  //   if (!this.hasFocus) {
  //     return;
  //   }

  //   event.preventDefault();
  //   event.stopPropagation();

  //   if (event.deltaY > 0) {
  //     this.stepDown();
  //   } else {
  //     this.stepUp();
  //   }
  // }

  // private updateDefaultMask(): void {
  //   this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
  // }

  // private setMask(val: string): void {
  //   const oldFormat = this._inputDateParts?.map((p) => p.format).join('');
  //   this._inputDateParts = DateTimeUtil.parseDateTimeFormat(val);
  //   val = this._inputDateParts.map((p) => p.format).join('');

  //   this._defaultMask = val;

  //   const newMask = (val || DateTimeUtil.DEFAULT_INPUT_FORMAT).replace(
  //     new RegExp(/(?=[^t])[\w]/, 'g'),
  //     '0'
  //   );

  //   this.mask =
  //     newMask.indexOf('tt') !== -1
  //       ? newMask.replace(new RegExp('tt', 'g'), 'LL')
  //       : newMask;

  //   this.parser.mask = this.mask;
  //   this.parser.prompt = this.prompt;

  //   if (!this.placeholder || oldFormat === this.placeholder) {
  //     this.placeholder = val;
  //   }
  // }

  // private parseDate(val: string) {
  //   if (!val) {
  //     return null;
  //   }

  //   return DateTimeUtil.parseValueFromMask(
  //     val,
  //     this._inputDateParts,
  //     this.prompt
  //   );
  // }

  // private getMaskedValue(): string {
  //   let mask = this.emptyMask;

  //   if (DateTimeUtil.isValidDate(this.value)) {
  //     for (const part of this._inputDateParts) {
  //       if (part.type === DateParts.Literal) {
  //         continue;
  //       }
  //       const targetValue = this.getPartValue(part, part.format.length);
  //       mask = this.parser.replace(
  //         mask,
  //         targetValue,
  //         part.start,
  //         part.end
  //       ).value;
  //     }
  //     return mask;
  //   }

  //   if (!this.isComplete()) {
  //     return this.maskedValue;
  //   }

  //   return mask;
  // }

  // private isComplete(): boolean {
  //   return this.maskedValue.indexOf(this.prompt) === -1;
  // }

  // private getPartValue(datePartInfo: DatePartInfo, partLength: number): string {
  //   let maskedValue: any;
  //   const datePart = datePartInfo.type;

  //   switch (datePart) {
  //     case DateParts.Date:
  //       maskedValue = this._dateValue!.getDate();
  //       break;
  //     case DateParts.Month:
  //       // months are zero based
  //       maskedValue = this._dateValue!.getMonth() + 1;
  //       break;
  //     case DateParts.Year:
  //       if (partLength === 2) {
  //         maskedValue = this.prependValue(
  //           parseInt(this._dateValue!.getFullYear().toString().slice(-2), 10),
  //           partLength,
  //           '0'
  //         );
  //       } else {
  //         maskedValue = this._dateValue!.getFullYear();
  //       }
  //       break;
  //     case DateParts.Hours:
  //       if (datePartInfo.format.indexOf('h') !== -1) {
  //         maskedValue = this.prependValue(
  //           this.toTwelveHourFormat(this._dateValue!.getHours().toString()),
  //           partLength,
  //           '0'
  //         );
  //       } else {
  //         maskedValue = this._dateValue!.getHours();
  //       }
  //       break;
  //     case DateParts.Minutes:
  //       maskedValue = this._dateValue!.getMinutes();
  //       break;
  //     case DateParts.Seconds:
  //       maskedValue = this._dateValue!.getSeconds();
  //       break;
  //     case DateParts.AmPm:
  //       maskedValue = this._dateValue!.getHours() >= 12 ? 'PM' : 'AM';
  //       break;
  //   }

  //   if (datePartInfo.type !== DateParts.AmPm) {
  //     return this.prependValue(maskedValue, partLength, '0');
  //   }

  //   return maskedValue;
  // }

  // private prependValue(
  //   value: number,
  //   partLength: number,
  //   prependChar: string
  // ): string {
  //   return (prependChar + value.toString()).slice(-partLength);
  // }

  // private toTwelveHourFormat(value: string): number {
  //   let hour = parseInt(value.replace(new RegExp(this.prompt, 'g'), '0'), 10);
  //   if (hour > 12) {
  //     hour -= 12;
  //   } else if (hour === 0) {
  //     hour = 12;
  //   }

  //   return hour;
  // }

  // private updateValue(): void {
  //   if (this.isComplete()) {
  //     const parsedDate = this.parseDate(this.maskedValue);
  //     if (DateTimeUtil.isValidDate(parsedDate)) {
  //       this.value = parsedDate
  //     }
  //   } else {
  //     this.value = null;
  //   }
  // }

  // protected override handleFocus() {
  //   this.hasFocus = true;
  //   this.updateMask();
  //   this.emitEvent('igcFocus');
  // }

  // protected override handleBlur() {
  //   this.hasFocus = false;

  //   if (!this.isComplete() && this.maskedValue !== this.emptyMask) {
  //     const parse = this.parseDate(this.maskedValue);

  //     if (parse) {
  //       this.value = parse;
  //     } else {
  //       this.value = null;
  //       this.maskedValue = '';
  //     }
  //   } else {
  //     this.updateMask();
  //   }

  //   this.emitEvent('igcBlur');
  // }

  // protected override renderInput() {
  //   return html`<div>
  //     <input
  //       type="text"
  //       name=${ifDefined(this.name)}
  //       .value=${live(this.maskedValue)}
  //       .placeholder=${live(this.placeholder || this.emptyMask)}
  //       ?readonly=${this.readonly}
  //       ?disabled=${this.disabled}
  //       ?required=${this.required}
  //       @blur=${this.handleBlur}
  //       @focus=${this.handleFocus}
  //       @change=${this.handleChange}
  //       @input=${this.handleInput}
  //       @keydown=${this.handleKeydown}
  //       @drop=${this.handleDrop}
  //       @cut=${this.handleCut}
  //       @compositionstart=${this.handleCompositionStart}
  //       @compositionend=${this.handleCompositionEnd}
  //       @dragenter=${this.handleDragEnter}
  //       @dragleave=${this.handleDragLeave}
  //       @dragstart=${this.handleDragStart}
  //     />
  //   </div>`;
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-input': IgcDateInputComponent;
  }
}
