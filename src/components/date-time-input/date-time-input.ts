import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import {
  DatePartDeltas,
  DatePartInfo,
  DateParts,
  DatePart,
  DateTimeUtil,
} from './date-util.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcMaskInputBaseComponent } from '../mask-input/mask-input-base.js';
import { partNameMap } from '../common/util.js';
import { IgcInputEventMap } from '../input/input-base.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { AbstractConstructor } from '../common/mixins/constructor.js';

export interface IgcDateTimeInputEventMap
  extends Omit<IgcInputEventMap, 'igcChange'> {
  igcChange: CustomEvent<Date | null>;
}

/**
 * A date time input is an input field that lets you set and edit the date and time in a chosen input element
 * using customizable display and input formats.
 *
 * @element igc-date-time-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcDateTimeInputComponent extends EventEmitterMixin<
  IgcDateTimeInputEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  public static readonly tagName = 'igc-date-time-input';

  protected _defaultMask!: string;
  protected _value!: Date | null;

  private _oldValue: Date | null = null;
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

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public get inputFormat(): string {
    return this._inputFormat || this._defaultMask;
  }

  public set inputFormat(val: string) {
    if (val) {
      this.setMask(val);
      this._inputFormat = val;
    }
  }

  /**
   * The value of the input.
   * @attr
   */
  @property({
    converter: {
      fromAttribute: (value: string) =>
        !value ? null : DateTimeUtil.parseIsoDate(value),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  @blazorTwoWayBind('igcChange', 'detail')
  public get value(): Date | null {
    return this._value;
  }

  public set value(val: Date | null) {
    this._value = val
      ? DateTimeUtil.isValidDate(val)
        ? val
        : DateTimeUtil.parseIsoDate(val)
      : null;

    this.updateMask();
    this.validate();
  }

  /**
   * The minimum value required for the input to remain valid.
   * @attr min-value
   */
  @property({
    attribute: 'min-value',
    converter: {
      fromAttribute: (value: string) =>
        !value ? null : DateTimeUtil.parseIsoDate(value),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  public minValue!: Date | null;

  /**
   * The maximum value required for the input to remain valid.
   * @attr max-value
   */
  @property({
    attribute: 'max-value',
    converter: {
      fromAttribute: (value: string) =>
        !value ? null : DateTimeUtil.parseIsoDate(value),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  public maxValue!: Date | null;

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public displayFormat!: string;

  /**
   * Delta values used to increment or decrement each date part on step actions.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public spinDelta!: DatePartDeltas;

  /**
   * Sets whether to loop over the currently spun segment.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  @watch('locale', { waitUntilFirstUpdate: true })
  protected setDefaultMask(): void {
    if (!this._inputFormat) {
      this.updateDefaultMask();
      this.setMask(this._defaultMask);
    }

    if (this.value) {
      this.updateMask();
    }
  }

  @watch('displayFormat', { waitUntilFirstUpdate: true })
  protected setDisplayFormat(): void {
    if (this.displayFormat) {
      if (this.value) {
        this.maskedValue = DateTimeUtil.formatDate(
          this.value!,
          this.locale,
          this.displayFormat,
          true
        );
      }
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

    if (this.minValue || this.maxValue) {
      errors = DateTimeUtil.validateMinMax(
        this.value,
        this.minValue!,
        this.maxValue!,
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
    const parts =
      this._inputDateParts ||
      DateTimeUtil.parseDateTimeFormat(this.inputFormat);

    return parts.some(
      (p) =>
        p.type === DateParts.Date ||
        p.type === DateParts.Month ||
        p.type === DateParts.Year
    );
  }

  private get hasTimeParts(): boolean {
    const parts =
      this._inputDateParts ||
      DateTimeUtil.parseDateTimeFormat(this.inputFormat);
    return parts.some(
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
    if (this.value) {
      this.updateMask();
    }
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

  /** Increments a date/time portion. */
  public stepUp(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta);
    this.value = newValue;
    this.handleInput();
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const newValue = this.trySpinValue(targetPart, delta, true);
    this.value = newValue;
    this.handleInput();
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this.maskedValue = '';
    this.value = null;
  }

  protected updateMask() {
    if (this.hasFocus) {
      this.maskedValue = this.getMaskedValue();
    } else {
      if (!this.value || !DateTimeUtil.isValidDate(this.value)) {
        this.maskedValue = '';
        return;
      }

      const format = this.displayFormat || this.inputFormat;

      if (this.displayFormat) {
        this.maskedValue = DateTimeUtil.formatDate(
          this.value,
          this.locale,
          format,
          true
        );
      } else if (this.inputFormat) {
        this.maskedValue = DateTimeUtil.formatDate(
          this.value,
          this.locale,
          format
        );
      } else {
        this.maskedValue = this.value.toLocaleString();
      }
    }
  }

  protected handleChange() {
    this.emitEvent('igcChange', { detail: this.value });
    this.invalid = !this.checkValidity();
  }

  protected override handleInput() {
    this.emitEvent('igcInput', { detail: this.value?.toString() });
  }

  protected handleDragLeave() {
    if (!this.hasFocus) {
      this.updateMask();
    }
  }

  protected handleDragEnter() {
    if (!this.hasFocus) {
      this.maskedValue = this.getMaskedValue();
    }
  }

  protected updateInput(part: string, start: number, finish: number) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      part,
      start,
      finish
    );

    this.maskedValue = value;

    this.updateValue();
    this.requestUpdate();

    if (start !== this.inputFormat.length) {
      this.emitEvent('igcInput', { detail: this.value?.toString() });
    }

    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
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
    if (!this.value || !DateTimeUtil.isValidDate(this.value)) {
      return new Date();
    }

    const newDate = new Date(this.value.getTime());
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
          return DateTimeUtil.spinAmPm(newDate, this.value, amPmFromMask);
        }
        break;
    }

    return newDate;
  }

  private onWheel(event: WheelEvent) {
    if (!this.hasFocus) {
      return;
    }

    this.selection = this.inputSelection;

    event.preventDefault();
    event.stopPropagation();

    if (event.deltaY > 0) {
      this.stepDown();
    } else {
      this.stepUp();
    }

    this.updateComplete.then(() =>
      this.setSelectionRange(this.selection.start, this.selection.end)
    );
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

    this._mask =
      newMask.indexOf('tt') !== -1
        ? newMask.replace(new RegExp('tt', 'g'), 'LL')
        : newMask;

    this.parser.mask = this._mask;
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
          this.value
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
      }
    } else {
      this.value = null;
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
    this._oldValue = this.value;
    this.updateMask();
    this.emitEvent('igcFocus');
  }

  protected override handleBlur() {
    this.hasFocus = false;

    if (!this.isComplete() && this.maskedValue !== this.emptyMask) {
      const parse = this.parseDate(this.maskedValue);

      if (parse) {
        this.value = parse;
      } else {
        this.value = null;
        this.maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    if (this._oldValue !== this.value) {
      this.handleChange();
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
      case 'ArrowDown':
        e.preventDefault();
        key === 'ArrowUp' ? this.stepUp() : this.stepDown();

        this.updateComplete.then(() =>
          this.setSelectionRange(this.selection.start, this.selection.end)
        );
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
        @input=${super.handleInput}
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
