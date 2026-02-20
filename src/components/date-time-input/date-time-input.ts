import { getDateFormatter } from 'igniteui-i18n-core';
import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { convertToDate, isValidDate } from '../calendar/helpers.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  addI18nController,
  formatDisplayDate,
  getDefaultDateTimeFormat,
} from '../common/i18n/i18n-controller.js';
import { FormValueDateTimeTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  DatePart,
  type DatePartDeltas,
  DEFAULT_DATE_PARTS_SPIN_DELTAS,
} from './date-part.js';
import { IgcDateTimeInputBaseComponent } from './date-time-input.base.js';
import {
  createDatePart,
  type DatePartInfo,
  DateParts,
  DateTimeMaskParser,
} from './datetime-mask-parser.js';

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
  public static register(): void {
    registerComponent(
      IgcDateTimeInputComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Private state and properties

  protected override readonly _parser = new DateTimeMaskParser();

  private _displayFormat?: string;
  protected override _inputFormat = '';

  private readonly _i18nController = addI18nController(this, {
    defaultEN: {},
    onResourceChange: this._handleResourceChange,
  });

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: setSlots(
      'prefix',
      'suffix',
      'helper-text',
      'value-missing',
      'range-overflow',
      'range-underflow',
      'custom-error',
      'invalid'
    ),
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  protected get _targetDatePart(): DatePart | undefined {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  protected get _datePartDeltas(): DatePartDeltas {
    return { ...DEFAULT_DATE_PARTS_SPIN_DELTAS, ...this.spinDelta };
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public override set inputFormat(val: string) {
    if (val) {
      this.setMask(val);
      this._inputFormat = val;
      this.updateMask();
    }
  }

  public override get inputFormat(): string {
    return this._inputFormat || this._parser.mask;
  }

  /**
   * The value of the input.
   * @attr
   */
  @property({ converter: convertToDate })
  public override set value(value: Date | string | null | undefined) {
    this._formValue.setValueAndFormState(value as Date | null);
    this.updateMask();
  }

  public override get value(): Date | null {
    return this._formValue.value;
  }

  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public override set displayFormat(value: string) {
    this._displayFormat = value;
  }

  public override get displayFormat(): string {
    return (
      this._displayFormat ?? this._inputFormat ?? this._defaultDisplayFormat
    );
  }

  /**
   * Delta values used to increment or decrement each date part on step actions.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public override spinDelta?: DatePartDeltas;

  /**
   * Sets whether to loop over the currently spun segment.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public override spinLoop = true;

  /**
   * Gets/Sets the locale used for formatting the display value.
   * @attr locale
   */
  @property()
  public override set locale(value: string) {
    this._i18nController.locale = value;
  }

  public override get locale(): string {
    return this._i18nController.locale;
  }

  //#endregion

  //#region Lifecycle Hooks

  protected override update(props: PropertyValues<this>): void {
    if (props.has('displayFormat')) {
      this._updateDefaultDisplayFormat();
    }

    if (props.has('locale')) {
      this.updateDefaultMask();
    }

    if (props.has('displayFormat') || props.has('locale')) {
      this.updateMask();
    }

    super.update(props);
  }

  //#endregion

  //#region Overrides

  protected override _resolvePartNames(base: string) {
    const result = super._resolvePartNames(base);
    // Apply `filled` part when the mask is not empty
    result.filled = result.filled || !this._isEmptyMask;
    return result;
  }

  protected override _updateSetRangeTextValue(): void {
    this.updateValue();
  }

  //#endregion

  //#region Event handlers

  private _handleResourceChange(): void {
    this.updateDefaultMask();
    this.updateMask();
  }

  public override async handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    this._oldValue = this.value;

    if (!this.value) {
      this._maskedValue = this._parser.emptyMask;
      await this.updateComplete;
      this.select();
    } else if (this.displayFormat !== this.inputFormat) {
      this.updateMask();
    }
  }

  public override handleBlur(): void {
    this._focused = false;

    // Handle incomplete mask input
    if (!(this._isMaskComplete() || this._isEmptyMask)) {
      const parsedDate = this._parser.parseDate(this._maskedValue);

      if (parsedDate) {
        this.value = parsedDate;
      } else {
        this.clear();
      }
    } else {
      this.updateMask();
    }

    // Emit change event if value changed
    if (!this.readOnly && this._oldValue !== this.value) {
      this.emitEvent('igcChange', { detail: this.value });
    }

    super._handleBlur();
  }

  //#endregion

  //#region Internal API

  public override updateMask(): void {
    if (this._focused) {
      this._maskedValue = this.getMaskedValue();
      return;
    }

    if (!isValidDate(this.value)) {
      this._maskedValue = '';
      return;
    }

    this._maskedValue = formatDisplayDate(
      this.value,
      this.locale,
      this.displayFormat
    );
  }

  public override updateValue(): void {
    if (!this._isMaskComplete()) {
      this.value = null;
      return;
    }

    const parsedDate = this._parser.parseDate(this._maskedValue);
    this.value = isValidDate(parsedDate) ? parsedDate : null;
  }

  public override spinValue(datePart: DatePart, delta: number): Date {
    if (!isValidDate(this.value)) {
      return new Date();
    }

    const newDate = new Date(this.value.getTime());
    const partType = datePart as unknown as DateParts;

    // Get the part instance from the parser, or create one for explicit spin operations
    let part = this._parser.getPartByType(partType);
    if (!part) {
      // For explicit spin operations (e.g., stepDown(DatePart.Minutes)),
      // create a temporary part even if not in the format
      part = createDatePart(partType, { start: 0, end: 0, format: '' });
    }

    // For AM/PM, we need to extract the current AM/PM value from the mask
    let amPmValue: string | undefined;
    if (datePart === DatePart.AmPm) {
      const formatPart = this._parser.getPartByType(DateParts.AmPm);
      if (formatPart) {
        amPmValue = this._maskedValue.substring(
          formatPart.start,
          formatPart.end
        );
      }
    }

    part.spin(delta, {
      date: newDate,
      spinLoop: this.spinLoop,
      amPmValue,
      originalDate: this.value,
    });

    return newDate;
  }

  public override setMask(formatString: string): void {
    const previous = this._parser.mask;
    this._parser.mask = formatString;

    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  public override getMaskedValue(): string {
    return isValidDate(this.value)
      ? this._parser.formatDate(this.value)
      : this._maskedValue || this._parser.emptyMask;
  }

  protected override updateDefaultMask(): void {
    this._updateDefaultDisplayFormat();

    if (!this._inputFormat) {
      this.setMask(getDefaultDateTimeFormat(this.locale));
    }
  }

  public override getNewPosition(
    inputValue: string,
    direction: number
  ): number {
    const cursorPos = this._maskSelection.start;
    const dateParts = this._parser.dateParts;

    if (direction === 0) {
      const part = dateParts.findLast(
        (part) => part.type === DateParts.Literal && part.end < cursorPos
      );
      return part?.end ?? 0;
    }

    const part = dateParts.find(
      (part) => part.type === DateParts.Literal && part.start > cursorPos
    );
    return part?.start ?? inputValue.length;
  }

  private _updateDefaultDisplayFormat(): void {
    this._defaultDisplayFormat = getDateFormatter().getLocaleDateTimeFormat(
      this.locale
    );
  }

  /**
   * Gets the date part at the current cursor position.
   * Uses inclusive end to handle cursor at the end of the last part.
   * Returns undefined if cursor is not within a valid date part.
   */
  private _getDatePartAtCursor(): DatePart | undefined {
    return this._parser.getDatePartForCursor(this._inputSelection.start)
      ?.type as DatePart | undefined;
  }

  private _getDefaultDatePart(): DatePart | undefined {
    return (this._parser.getPartByType(DateParts.Date)?.type ??
      this._parser.getPartByType(DateParts.Hours)?.type ??
      this._parser.getFirstDatePart()?.type) as DatePart | undefined;
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  public override get hasDateParts(): boolean {
    return this._parser.hasDateParts();
  }

  /* blazorSuppress */
  public override get hasTimeParts(): boolean {
    return this._parser.hasTimeParts();
  }

  //#endregion

  protected override _renderInput() {
    return html`
      <input
        type="text"
        part=${partMap(this._resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this._maskedValue)}
        .placeholder=${this.placeholder || this._parser.emptyMask}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @input=${super._handleInput}
        @wheel=${this._handleWheel}
        @keydown=${super._setMaskSelection}
        @click=${super._handleClick}
        @cut=${super._setMaskSelection}
        @compositionstart=${super._handleCompositionStart}
        @compositionend=${super._handleCompositionEnd}
        @dragenter=${this._handleDragEnter}
        @dragleave=${this._handleDragLeave}
        @dragstart=${super._setMaskSelection}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}
