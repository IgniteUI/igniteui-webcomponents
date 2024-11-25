import { html } from 'lit';
import { eventOptions, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { convertToDate, getDateFormValue } from '../calendar/helpers.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  type FormValue,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import { noop, partNameMap } from '../common/util.js';
import type { IgcInputComponentEventMap } from '../input/input-base.js';
import {
  IgcMaskInputBaseComponent,
  type MaskRange,
} from '../mask-input/mask-input-base.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  DatePart,
  type DatePartDeltas,
  type DatePartInfo,
  DateParts,
  DateTimeUtil,
} from './date-util.js';
import { dateTimeInputValidators } from './validators.js';

export interface IgcDateTimeInputComponentEventMap
  extends Omit<IgcInputComponentEventMap, 'igcChange'> {
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
 * @slot value-missing - Renders content when the required validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcDateTimeInputComponent extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  public static readonly tagName = 'igc-date-time-input';

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDateTimeInputComponent,
      IgcValidationContainerComponent
    );
  }

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  protected override _formValue: FormValue<Date | null>;

  protected _defaultMask!: string;
  private _oldValue: Date | null = null;
  private _min: Date | null = null;
  private _max: Date | null = null;

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
      if (this.value) {
        this.updateMask();
      }
    }
  }

  public get value(): Date | null {
    return this._formValue.value;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the input.
   * @attr
   */
  @property({ converter: convertToDate })
  public set value(value: Date | string | null | undefined) {
    this._formValue.setValueAndFormState(value as Date | null);
    this.updateMask();
    this._validate();
  }

  /**
   * The minimum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._updateValidity();
  }

  public get min(): Date | null {
    return this._min;
  }

  /**
   * The maximum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set max(value: Date | string | null | undefined) {
    this._max = convertToDate(value);
    this._updateValidity();
  }

  public get max(): Date | null {
    return this._max;
  }

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

  protected get hasDateParts(): boolean {
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

  protected get hasTimeParts(): boolean {
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
    let result: DatePart | undefined;

    if (this.focused) {
      const partType = this._inputDateParts.find(
        (p) =>
          p.start <= this.inputSelection.start &&
          this.inputSelection.start <= p.end &&
          p.type !== DateParts.Literal
      )?.type as string as DatePart;

      if (partType) {
        result = partType;
      }
    } else if (this._inputDateParts.some((p) => p.type === DateParts.Date)) {
      result = DatePart.Date;
    } else if (this._inputDateParts.some((p) => p.type === DateParts.Hours)) {
      result = DatePart.Hours;
    } else {
      result = this._inputDateParts[0].type as string as DatePart;
    }

    return result;
  }

  private get datePartDeltas(): DatePartDeltas {
    return Object.assign({}, this._datePartDeltas, this.spinDelta);
  }

  constructor() {
    super();

    this._formValue = createFormValueState(this, {
      initialValue: null,
      transformers: {
        setValue: convertToDate,
        setDefaultValue: convertToDate,
        setFormValue: getDateFormValue,
      },
    });

    addKeybindings(this, {
      skip: () => this.readOnly,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      // Skip default spin when in the context of a date picker
      .set([altKey, arrowUp], noop)
      .set([altKey, arrowDown], noop)

      .set([ctrlKey, ';'], this.setToday)
      .set(arrowUp, this.keyboardSpin.bind(this, 'up'))
      .set(arrowDown, this.keyboardSpin.bind(this, 'down'))
      .set([ctrlKey, arrowLeft], this.navigateParts.bind(this, 0))
      .set([ctrlKey, arrowRight], this.navigateParts.bind(this, 1));
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateDefaultMask();
    this.setMask(this.inputFormat);
    this._updateValidity();
    if (this.value) {
      this.updateMask();
    }
  }

  /** Increments a date/time portion. */
  public stepUp(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this.inputSelection;
    const newValue = this.trySpinValue(targetPart, delta);
    this.value = newValue;
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: DatePart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this.inputSelection;
    const newValue = this.trySpinValue(targetPart, delta, true);
    this.value = newValue;
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this.maskedValue = '';
    this.value = null;
  }

  protected setToday() {
    this.value = new Date();
    this.handleInput();
  }

  protected updateMask() {
    if (this.focused) {
      this.maskedValue = this.getMaskedValue();
    } else {
      if (!DateTimeUtil.isValidDate(this.value)) {
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

  protected override handleInput() {
    this.emitEvent('igcInput', { detail: this.value?.toString() });
  }

  protected handleDragLeave() {
    if (!this.focused) {
      this.updateMask();
    }
  }

  protected handleDragEnter() {
    if (!this.focused) {
      this.maskedValue = this.getMaskedValue();
    }
  }

  protected async updateInput(string: string, range: MaskRange) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      string,
      range.start,
      range.end
    );

    this.maskedValue = value;

    this.updateValue();
    this.requestUpdate();

    if (range.start !== this.inputFormat.length) {
      this.handleInput();
    }
    await this.updateComplete;
    this.input.setSelectionRange(end, end);
  }

  private trySpinValue(
    datePart: DatePart,
    delta?: number,
    negative = false
  ): Date {
    // default to 1 if a delta is set to 0 or any other falsy value
    const _delta =
      delta || this.datePartDeltas[datePart as keyof DatePartDeltas] || 1;

    const spinValue = negative ? -Math.abs(_delta) : Math.abs(_delta);
    return this.spinValue(datePart, spinValue);
  }

  private spinValue(datePart: DatePart, delta: number): Date {
    if (!(this.value && DateTimeUtil.isValidDate(this.value))) {
      return new Date();
    }

    const newDate = new Date(this.value.getTime());
    let formatPart: DatePartInfo | undefined;
    let amPmFromMask: string;

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

  @eventOptions({ passive: false })
  private async onWheel(event: WheelEvent) {
    if (!this.focused || this.readOnly) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this.inputSelection;
    event.deltaY > 0 ? this.stepDown() : this.stepUp();
    this.handleInput();

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  private updateDefaultMask(): void {
    this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
  }

  private setMask(string: string): void {
    const oldFormat = this._inputDateParts?.map((p) => p.format).join('');
    this._inputDateParts = DateTimeUtil.parseDateTimeFormat(string);
    const value = this._inputDateParts.map((p) => p.format).join('');

    this._defaultMask = value;

    const newMask = (value || DateTimeUtil.DEFAULT_INPUT_FORMAT).replace(
      new RegExp(/(?=[^t])[\w]/, 'g'),
      '0'
    );

    this._mask = newMask.includes('tt')
      ? newMask.replace(/tt/g, 'LL')
      : newMask;

    this.parser.mask = this._mask;
    this.parser.prompt = this.prompt;

    if (!this.placeholder || oldFormat === this.placeholder) {
      this.placeholder = value;
    }
  }

  private parseDate(val: string) {
    return val
      ? DateTimeUtil.parseValueFromMask(val, this._inputDateParts, this.prompt)
      : null;
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
    return !this.maskedValue.includes(this.prompt);
  }

  private updateValue(): void {
    if (this.isComplete()) {
      const parsedDate = this.parseDate(this.maskedValue);
      this.value = DateTimeUtil.isValidDate(parsedDate) ? parsedDate : null;
    } else {
      this.value = null;
    }
  }

  protected override _updateSetRangeTextValue() {
    this.updateValue();
  }

  private getNewPosition(value: string, direction = 0): number {
    const cursorPos = this.selection.start;

    if (!direction) {
      // Last literal before the current cursor position or start of input value
      const part = this._inputDateParts.findLast(
        (part) => part.type === DateParts.Literal && part.end < cursorPos
      );
      return part?.end ?? 0;
    }

    // First literal after the current cursor position or end of input value
    const part = this._inputDateParts.find(
      (part) => part.type === DateParts.Literal && part.start > cursorPos
    );
    return part?.start ?? value.length;
  }

  protected async handleFocus() {
    this.focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;
    const areFormatsDifferent = this.displayFormat !== this.inputFormat;

    if (!this.value) {
      this.maskedValue = this.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (areFormatsDifferent) {
      this.updateMask();
    }
  }

  protected handleBlur() {
    const isEmptyMask = this.maskedValue === this.emptyMask;
    const isSameValue = this._oldValue === this.value;

    this.focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
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

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    this.checkValidity();
  }

  protected navigateParts(delta: number) {
    const position = this.getNewPosition(this.input.value, delta);
    this.setSelectionRange(position, position);
  }

  protected async keyboardSpin(direction: 'up' | 'down') {
    direction === 'up' ? this.stepUp() : this.stepDown();
    this.handleInput();
    await this.updateComplete;
    this.setSelectionRange(this.selection.start, this.selection.end);
  }

  protected override renderInput() {
    return html`
      <input
        type="text"
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder || this.emptyMask)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @input=${super.handleInput}
        @wheel=${this.onWheel}
        @keydown=${super.handleKeydown}
        @click=${this.handleClick}
        @cut=${this.handleCut}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${this.handleDragStart}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
