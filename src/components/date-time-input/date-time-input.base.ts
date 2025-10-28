import { html } from 'lit';
import { eventOptions, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { convertToDate } from '../calendar/helpers.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import type { DateRangeValue } from '../date-range-picker/date-range-picker.js';
import type { IgcInputComponentEventMap } from '../input/input-base.js';
import {
  IgcMaskInputBaseComponent,
  type MaskSelection,
} from '../mask-input/mask-input-base.js';
import type {
  DatePart,
  DatePartInfo,
  DateRangePart,
  DateRangePartInfo,
} from './date-util.js';
import { type DatePartDeltas, DateParts, DateTimeUtil } from './date-util.js';
import { dateTimeInputValidators } from './validators.js';

export interface IgcDateTimeInputComponentEventMap
  extends Omit<IgcInputComponentEventMap, 'igcChange'> {
  igcChange: CustomEvent<Date | DateRangeValue | null>;
}
export abstract class IgcDateTimeInputBaseComponent<
  TValue extends Date | DateRangeValue | string | null,
  TPart extends DatePart | DateRangePart,
  TPartInfo extends DatePartInfo | DateRangePartInfo,
> extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  AbstractConstructor<IgcMaskInputBaseComponent>
>(IgcMaskInputBaseComponent) {
  // #region Internal state & properties

  protected override get __validators() {
    return dateTimeInputValidators;
  }
  private _min: Date | null = null;
  private _max: Date | null = null;
  protected _defaultMask!: string;
  protected _oldValue: TValue | null = null;
  protected _inputDateParts!: TPartInfo[];
  protected _inputFormat!: string;

  protected abstract _datePartDeltas: DatePartDeltas;
  protected abstract get targetDatePart(): TPart | undefined;

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

  protected get datePartDeltas(): DatePartDeltas {
    return Object.assign({}, this._datePartDeltas, this.spinDelta);
  }

  // #endregion

  // #region Public properties

  public abstract override value: TValue | null;

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

  /**
   * The minimum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._validate();
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
    this._validate();
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

  // #endregion

  // #region Lifecycle & observers

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.readOnly,
      bindingDefaults: { triggers: ['keydownRepeat'] },
    })
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
    this._validate();
    if (this.value) {
      this.updateMask();
    }
  }

  @watch('locale', { waitUntilFirstUpdate: true })
  protected _setDefaultMask(): void {
    if (!this._inputFormat) {
      this.updateDefaultMask();
      this.setMask(this._defaultMask);
    }

    if (this.value) {
      this.updateMask();
    }
  }

  @watch('displayFormat', { waitUntilFirstUpdate: true })
  protected _setDisplayFormat(): void {
    if (this.value) {
      this.updateMask();
    }
  }

  @watch('prompt', { waitUntilFirstUpdate: true })
  protected _promptChange(): void {
    if (!this.prompt) {
      this.prompt = this._parser.prompt;
    } else {
      this._parser.prompt = this.prompt;
    }
  }

  // #endregion

  // #region Methods

  /** Increments a date/time portion. */
  public stepUp(datePart?: TPart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this._inputSelection;
    const newValue = this.trySpinValue(targetPart, delta);
    this.value = newValue as TValue;
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  /** Decrements a date/time portion. */
  public stepDown(datePart?: TPart, delta?: number): void {
    const targetPart = datePart || this.targetDatePart;

    if (!targetPart) {
      return;
    }

    const { start, end } = this._inputSelection;
    const newValue = this.trySpinValue(targetPart, delta, true);
    this.value = newValue;
    this.updateComplete.then(() => this.input.setSelectionRange(start, end));
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._maskedValue = '';
    this.value = null;
  }

  protected setToday() {
    this.value = new Date() as TValue;
    this.handleInput();
  }

  protected handleDragLeave() {
    if (!this._focused) {
      this.updateMask();
    }
  }

  protected handleDragEnter() {
    if (!this._focused) {
      this._maskedValue = this.getMaskedValue();
    }
  }

  protected override async _updateInput(string: string, range: MaskSelection) {
    const { value, end } = this._parser.replace(
      this._maskedValue,
      string,
      range.start,
      range.end
    );

    this._maskedValue = value;

    this.updateValue();
    this.requestUpdate();

    if (range.start !== this.inputFormat.length) {
      this.handleInput();
    }
    await this.updateComplete;
    this.input.setSelectionRange(end, end);
  }

  protected trySpinValue(
    datePart: TPart,
    delta?: number,
    negative = false
  ): TValue {
    // default to 1 if a delta is set to 0 or any other falsy value
    const _delta =
      delta || this.datePartDeltas[datePart as keyof DatePartDeltas] || 1;

    const spinValue = negative ? -Math.abs(_delta) : Math.abs(_delta);
    return this.spinValue(datePart, spinValue);
  }

  protected isComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  protected override _updateSetRangeTextValue() {
    this.updateValue();
  }

  protected navigateParts(delta: number) {
    const position = this.getNewPosition(this.input.value, delta);
    this.setSelectionRange(position, position);
  }

  protected async keyboardSpin(direction: 'up' | 'down') {
    direction === 'up' ? this.stepUp() : this.stepDown();
    this.handleInput();
    await this.updateComplete;
    this.setSelectionRange(this._maskSelection.start, this._maskSelection.end);
  }

  @eventOptions({ passive: false })
  private async _onWheel(event: WheelEvent) {
    if (!this._focused || this.readOnly) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this._inputSelection;
    event.deltaY > 0 ? this.stepDown() : this.stepUp();
    this.handleInput();

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  protected updateDefaultMask(): void {
    this._defaultMask = DateTimeUtil.getDefaultMask(this.locale);
  }

  protected override renderInput() {
    return html`
      <input
        type="text"
        part=${partMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this._maskedValue)}
        .placeholder=${live(this.placeholder || this._parser.emptyMask)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @input=${super._handleInput}
        @wheel=${this._onWheel}
        @keydown=${super._setMaskSelection}
        @click=${super._handleClick}
        @cut=${super._setMaskSelection}
        @compositionstart=${super._handleCompositionStart}
        @compositionend=${super._handleCompositionEnd}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${super._setMaskSelection}
      />
    `;
  }

  protected abstract handleInput(): void;
  protected abstract updateMask(): void;
  protected abstract updateValue(): void;
  protected abstract getNewPosition(value: string, direction: number): number;
  protected abstract spinValue(datePart: TPart, delta: number): TValue;
  protected abstract setMask(string: string): void;
  protected abstract getMaskedValue(): string;
  protected abstract handleBlur(): void;
  protected abstract handleFocus(): Promise<void>;

  // #endregion
}
