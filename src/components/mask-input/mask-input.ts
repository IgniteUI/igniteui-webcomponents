import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { partNameMap } from '../common/util.js';
import { IgcMaskInputBaseComponent, MaskRange } from './mask-input-base.js';
import messages from '../common/localization/validation-en.js';

/**
 * A masked input is an input field where a developer can control user input and format the visible value,
 * based on configurable rules
 *
 * @element igc-mask-input
 *
 * @slot prefix - Renders content before the input
 * @slot suffix - Renders content after the input
 * @slot helper-text - Renders content below the input
 *
 * @fires igcInput - Emitted when the control receives user input
 * @fires igcChange - Emitted when an alteration of the control's value is committed by the user
 * @fires igcFocus - Emitted when the control gains focus
 * @fires igcBlur - Emitted when the control loses focus
 *
 * @csspart container - The main wrapper that holds all main input elements
 * @csspart input - The native input element
 * @csspart label - The native label element
 * @csspart prefix - The prefix wrapper
 * @csspart suffix - The suffix wrapper
 * @csspart helper-text - The helper text wrapper
 */
export default class IgcMaskInputComponent extends IgcMaskInputBaseComponent {
  public static readonly tagName = 'igc-mask-input';

  protected _value = '';

  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw` will return the clean user input.
   * - `withFormatting` will return the value with all literals and prompts.
   * @attr value-mode
   */
  @property({ attribute: 'value-mode' })
  public valueMode: 'raw' | 'withFormatting' = 'raw';

  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value will return an empty string.
   * @attr
   */
  @property()
  @blazorTwoWayBind('igcChange', 'detail')
  public get value() {
    return this.valueMode !== 'raw' ? this.maskedValue : this._value;
  }

  public set value(string: string) {
    this._value = string ?? '';
    this.maskedValue = this.parser.apply(this._value);
    this.updateFormValue();
  }

  /**
   * The mask pattern to apply on the input.
   * @attr
   */
  @property()
  public get mask() {
    return this._mask;
  }

  /** The mask pattern to apply on the input. */
  public set mask(value: string) {
    this._mask = value;
    this.parser.mask = value;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.updateValidity();
  }

  protected updateFormValue() {
    this.valueMode === 'raw'
      ? this.setFormValue(this.value || null, this.value)
      : this.setFormValue(this.maskedValue || null, this.maskedValue);
    this.updateValidity();
    this.setInvalidState();
  }

  protected override updateValidity(message = '') {
    const flags: ValidityStateFlags = {};
    let msg = '';

    if (this.required && !this._value) {
      flags.valueMissing = true;
      msg = messages.required;
    }

    if (!this.parser.isValidString(this.maskedValue)) {
      flags.badInput = true;
      msg = messages.mask;
    }

    if (message) {
      flags.customError = true;
      msg = message;
    }

    this.setValidity(flags, msg);
  }

  protected override handleFormReset() {
    this.value = this.getAttribute('value') ?? '';
    this.updateMaskedValue();
  }

  @watch('prompt')
  protected promptChange() {
    this.parser.prompt = this.prompt;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
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
    this._value = this.parser.parse(value);

    this.updateFormValue();
    this.requestUpdate();

    if (range.start !== this.mask.length) {
      this.emitEvent('igcInput', { detail: this.value });
    }
    await this.updateComplete;

    this.input.setSelectionRange(end, end);
  }

  protected handleDragEnter() {
    if (!this.focused && !this._value) {
      this.maskedValue = this.emptyMask;
    }
  }

  protected handleDragLeave() {
    if (!this.focused) {
      this.updateMaskedValue();
    }
  }

  protected override async handleFocus() {
    this.focused = true;
    super.handleFocus();

    if (this.readonly) {
      return;
    }

    if (!this._value) {
      // In case of empty value, select the whole mask
      this.maskedValue = this.emptyMask;

      await this.updateComplete;
      this.select();
    }
  }

  protected override handleBlur() {
    this.focused = false;
    this.updateMaskedValue();
    this.invalid = !this.checkValidity();
    super.handleBlur();
  }

  protected handleChange() {
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleClick() {
    const { selectionStart: start, selectionEnd: end } = this.input;

    // Clicking at the end of the input field will select the entire mask
    if (start === end && start === this.maskedValue.length) {
      this.select();
    }
  }

  protected updateMaskedValue() {
    if (this.maskedValue === this.emptyMask) {
      this.maskedValue = '';
    }
  }

  /* blazorSuppress */
  /** Replaces the selected text in the control and re-applies the mask */
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    _selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    const { value } = this.parser.replace(
      this.maskedValue || this.emptyMask,
      replacement,
      start,
      end
    );
    this.maskedValue = this.parser.apply(this.parser.parse(value));
    this.value = this.parser.parse(this.maskedValue);
  }

  protected override renderInput() {
    return html`
      <input
        type="text"
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder ?? this.parser.escapedMask)}
        ?readonly=${this.readonly}
        ?disabled=${this.disabled}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${this.handleDragStart}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @cut=${this.handleCut}
        @change=${this.handleChange}
        @click=${this.handleClick}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @input=${this.handleInput}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @keydown=${this.handleKeydown}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-mask-input': IgcMaskInputComponent;
  }
}
