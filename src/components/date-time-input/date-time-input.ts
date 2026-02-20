import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { convertToDate, isValidDate } from '../calendar/helpers.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { DatePart, type DatePartDeltas, DatePartType } from './date-part.js';
import { IgcDateTimeInputBaseComponent } from './date-time-input.base.js';
import {
  type DatePartInfo,
  DateTimeMaskParser,
} from './datetime-mask-parser.js';

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'range-overflow',
  'range-underflow',
  'custom-error',
  'invalid'
);

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
  public static styles = [styles, shared];

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

  protected override readonly _parser: DateTimeMaskParser =
    new DateTimeMaskParser();

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  protected override _datePartDeltas: DatePartDeltas = {
    date: 1,
    month: 1,
    year: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
  };

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

  public override get hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  public override get hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
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
  }

  protected override get targetDatePart(): DatePart | undefined {
    let result: DatePart | undefined;

    if (this._focused) {
      const part = this._parser.getDatePartAtPosition(
        this._inputSelection.start
      );
      if (part) {
        result = part.type as DatePart;
      }
    } else {
      // Default to date if available, otherwise hours, otherwise first part
      const datePart = this._parser.getPartByType(DatePartType.Date);
      const hoursPart = this._parser.getPartByType(DatePartType.Hours);
      const firstPart = this._parser.getFirstDatePart();

      if (datePart) {
        result = DatePart.Date;
      } else if (hoursPart) {
        result = DatePart.Hours;
      } else if (firstPart) {
        result = firstPart.type as DatePart;
      }
    }

    return result;
  }

  protected override updateMask(): void {
    if (this._focused) {
      this._maskedValue = this.getMaskedValue();
    } else {
      if (!isValidDate(this.value)) {
        this._maskedValue = '';
        return;
      }

      if (this.displayFormat) {
        // Use locale-based formatting for display format
        this._maskedValue = this.value!.toLocaleDateString(this.locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } else {
        // Use parser formatting for input format
        this._maskedValue = this._parser.formatDate(this.value);
      }
    }
  }

  protected override handleInput(): void {
    this._setTouchedState();
    this.emitEvent('igcInput', { detail: this._maskedValue });
  }

  protected override spinValue(datePart: DatePart, delta: number): Date {
    if (!isValidDate(this.value)) {
      return new Date();
    }

    const newDate = new Date(this.value.getTime());
    const part = this._parser.getPartByType(datePart as DatePartType);

    if (!part) {
      return newDate;
    }

    // Extract AM/PM value if spinning AM/PM part
    let amPmValue: string | undefined;
    if (datePart === DatePart.AmPm) {
      const amPmPart = this._parser.getPartByType(DatePartType.AmPm);
      if (amPmPart) {
        amPmValue = this._maskedValue.substring(amPmPart.start, amPmPart.end);
      }
    }

    // Spin the value using the part's spin method
    part.spin(delta, {
      date: newDate,
      spinLoop: this.spinLoop,
      amPmValue,
      originalDate: this.value,
    });

    return newDate;
  }

  protected override setMask(string: string): void {
    const oldFormat = this._parser.mask;

    // Set the parser's mask which will parse the date format
    this._parser.mask = string;

    // Store the formatted mask as default
    this._defaultMask = string;

    // Update mask and placeholder
    this.mask = this._parser.mask;

    if (!this.placeholder || oldFormat === this.placeholder) {
      this.placeholder = string;
    }
  }

  protected override getMaskedValue(): string {
    if (isValidDate(this.value)) {
      return this._parser.formatDate(this.value);
    }

    if (this.readOnly) {
      return '';
    }

    return this._maskedValue === ''
      ? this._parser.emptyMask
      : this._maskedValue;
  }

  protected override updateValue(): void {
    if (this.isComplete()) {
      const parsedDate = this._parser.parseDate(this._maskedValue);
      this.value = isValidDate(parsedDate) ? parsedDate : null;
    } else {
      this.value = null;
    }
  }

  protected override getNewPosition(value: string, direction = 0): number {
    const cursorPos = this._inputSelection.start;
    const dateParts = this._parser.dateParts;

    if (!direction) {
      // Last literal before the current cursor position or start of input value
      const part = dateParts.findLast(
        (part) => part.type === DatePartType.Literal && part.end < cursorPos
      );
      return part?.end ?? 0;
    }

    // First literal after the current cursor position or end of input value
    const part = dateParts.find(
      (part) => part.type === DatePartType.Literal && part.start > cursorPos
    );
    return part?.start ?? value.length;
  }

  public override async handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;
    const areFormatsDifferent = this.displayFormat !== this.inputFormat;

    if (!this.value) {
      this._maskedValue = this._parser.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (areFormatsDifferent) {
      this.updateMask();
    }
  }

  public override handleBlur(): void {
    const isEmptyMask = this._maskedValue === this._parser.emptyMask;

    this._focused = false;

    if (!(this.isComplete() || isEmptyMask)) {
      const parse = this._parser.parseDate(this._maskedValue);

      if (isValidDate(parse)) {
        this.value = parse;
      } else {
        this.value = null;
        this._maskedValue = '';
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
