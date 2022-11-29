import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { watch } from '../common/decorators/watch.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { partNameMap } from '../common/util.js';
import { IgcMaskInputBaseComponent } from './mask-input-base.js';

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
    return this._value
      ? this.valueMode !== 'raw'
        ? this.maskedValue
        : this._value
      : this._value;
  }

  public set value(string: string) {
    this._value = string ?? '';
    this.maskedValue = this.parser.apply(this._value);
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
  public set mask(val: string) {
    this._mask = val;
  }

  @watch('prompt')
  protected promptChange() {
    this.parser.prompt = this.prompt;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  @watch('_mask')
  protected maskChange() {
    this.parser.mask = this.mask;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  @watch('required', { waitUntilFirstUpdate: true })
  @watch('disabled', { waitUntilFirstUpdate: true })
  @watch('value', { waitUntilFirstUpdate: true })
  protected handleInvalidState() {
    this.updateComplete.then(() => (this.invalid = !this.checkValidity()));
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.mask = this.mask || this.parser.mask;
    this.prompt = this.prompt || this.parser.prompt;
  }

  protected updateInput(part: string, start: number, finish: number) {
    const { value, end } = this.parser.replace(
      this.maskedValue,
      part,
      start,
      finish
    );
    this.maskedValue = value;
    this._value = this.parser.parse(value);

    this.requestUpdate();
    if (start !== this.mask.length) {
      this.emitEvent('igcInput', { detail: this.value });
    }
    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  }

  protected handleDragEnter() {
    if (!this.hasFocus && !this._value) {
      this.maskedValue = this.parser.apply();
    }
  }

  protected handleDragLeave() {
    if (!this.hasFocus) {
      this.updateMaskedValue();
    }
  }

  protected override handleFocus() {
    this.hasFocus = true;
    super.handleFocus();

    if (this.readonly) {
      return;
    }

    if (!this._value) {
      this.maskedValue = this.parser.apply();
      // In case of empty value, select the whole mask
      this.updateComplete.then(() => this.select());
    }
  }

  protected override handleBlur() {
    this.hasFocus = false;
    this.updateMaskedValue();
    super.handleBlur();
  }

  protected handleChange() {
    this.emitEvent('igcChange', { detail: this.value });
    this.invalid = !this.checkValidity();
  }

  protected handleClick() {
    // Clicking at the end of the input field will select the entire mask
    if (
      this.input.selectionStart === this.input.selectionEnd &&
      this.input.selectionStart === this.maskedValue.length
    ) {
      this.select();
    }
  }

  protected updateMaskedValue() {
    if (this.maskedValue === this.parser.apply()) {
      this.maskedValue = '';
    }
  }

  /** Replaces the selected text in the control and re-applies the mask */
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    _selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.value = this.parser.replace(
      this.input.value,
      replacement,
      start,
      end
    ).value;
    this.maskedValue = this.parser.apply(this.parser.parse(this.input.value));
    this._value = this.parser.parse(this.maskedValue);
  }

  /** Checks for validity of the control and shows the browser message if it's invalid. */
  public reportValidity() {
    const state = this._value
      ? this.parser.isValidString(this.input.value)
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
      this.input.checkValidity() && this.parser.isValidString(this.input.value)
    );
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
        ?required=${this.required}
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
        aria-invalid="${this.invalid ? 'true' : 'false'}"
        @invalid="${this.handleInvalid}"
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
