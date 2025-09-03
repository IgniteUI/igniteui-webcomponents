import { property } from 'lit/decorators.js';
import { convertToDate } from '../calendar/helpers.js';
import { registerComponent } from '../common/definitions/register.js';
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { IgcDateTimeInputBaseComponent } from './date-time-input.base.js';
import {
  DatePart,
  type DatePartDeltas,
  type DatePartInfo,
  DateParts,
  DateTimeUtil,
} from './date-util.js';

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
export default class IgcDateTimeInputComponent extends IgcDateTimeInputBaseComponent<
  Date | null,
  DatePart,
  DatePartInfo
> {
  public static readonly tagName = 'igc-date-time-input';

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDateTimeInputComponent,
      IgcValidationContainerComponent
    );
  }

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  protected override _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
  };

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
  }

  protected override get targetDatePart(): DatePart | undefined {
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
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: this.value?.toString() });
  }

  protected override spinValue(datePart: DatePart, delta: number): Date {
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

  protected override async handleFocus() {
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

  protected setMask(string: string): void {
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

  private _parseDate(val: string) {
    return val
      ? DateTimeUtil.parseValueFromMask(val, this._inputDateParts, this.prompt)
      : null;
  }

  protected getMaskedValue(): string {
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

  protected updateValue(): void {
    if (this.isComplete()) {
      const parsedDate = this._parseDate(this.maskedValue);
      this.value = DateTimeUtil.isValidDate(parsedDate) ? parsedDate : null;
    } else {
      this.value = null;
    }
  }

  protected getNewPosition(value: string, direction = 0): number {
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

  protected override handleBlur() {
    const isEmptyMask = this.maskedValue === this.emptyMask;

    this.focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
      const parse = this._parseDate(this.maskedValue);

      if (parse) {
        this.value = parse;
      } else {
        this.value = null;
        this.maskedValue = '';
      }
    } else {
      this.updateMask();
    }

    const isSameValue = this._oldValue === this.value;

    if (!(this.readOnly || isSameValue)) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    super._handleBlur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
