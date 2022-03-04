import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { IgcInputBaseComponent } from '../input/input-base';
import { watch } from '../common/decorators';
import { partNameMap } from '../common/util';
import { MaskParser } from './mask-parser';
import { styles } from './masked-input.material.css';

interface MaskSelection {
  start: number;
  end: number;
}

/**
 * A masked input is an input field where a developer can control user input and format the visible value,
 * based on configurable rules
 *
 * @element igc-masked-input
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
export default class IgcMaskedInputComponent extends IgcInputBaseComponent {
  public static readonly tagName = 'igc-masked-input';
  public static styles = styles;

  protected parser = new MaskParser();
  protected _value!: string;
  protected selection: MaskSelection = { start: 0, end: 0 };
  protected compositionStart = 0;
  protected droppedText = '';

  @state()
  protected hasFocus = false;

  @state()
  protected maskedValue = '';

  protected get inputSelection(): MaskSelection {
    return {
      start: this.input.selectionStart || 0,
      end: this.input.selectionEnd || 0,
    };
  }

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /**
   * When enabled, retrieving the value of the control will return it
   * with literal symbols applied.
   */
  @property({ type: Boolean, attribute: 'with-literals' })
  public withLiterals = false;

  /**
   * The value of the input.
   *
   * If `with-literals` is set, it will return the current value with the mask (literals and all) applied.
   */
  @property()
  public get value() {
    return this.withLiterals
      ? this.maskedValue
        ? this.maskedValue
        : this.parser.apply()
      : this._value;
  }

  public set value(string: string) {
    this._value = string;
    this.maskedValue = this.parser.apply(this._value);
  }

  /** The mask pattern to apply on the input. */
  @property()
  public mask!: string;

  /** The prompt symbol to use for unfilled parts of the mask. */
  @property()
  public prompt!: string;

  @watch('prompt', { waitUntilFirstUpdate: true })
  protected promptChange() {
    this.parser.prompt = this.prompt;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  @watch('mask', { waitUntilFirstUpdate: true })
  protected maskChange() {
    this.parser.mask = this.mask;
    if (this.value) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.mask = this.mask || this.parser.mask;
    this.prompt = this.prompt || this.parser.prompt;
  }

  protected handleKeydown(e: KeyboardEvent) {
    if (!e.key) {
      return;
    }
    this.selection = this.inputSelection;
  }

  protected handleCompositionStart() {
    this.compositionStart = this.inputSelection.start;
  }

  protected handleCompositionEnd({ data }: CompositionEvent) {
    const start = this.compositionStart,
      end = this.inputSelection.end;
    this.updateInput(data, start, end);
  }

  protected handleInput({ inputType, isComposing }: InputEvent) {
    const value = this.input.value;
    const start = this.selection.start;
    let end = this.selection.end;

    switch (inputType) {
      case 'deleteContentForward':
        this.updateInput('', start, (end = start === end ? ++end : end));
        return this.updateComplete.then(() =>
          this.input.setSelectionRange(end, end)
        );

      case 'deleteContentBackward':
        if (isComposing) return;
        return this.updateInput('', this.inputSelection.start, end);

      case 'deleteByCut':
        return this.updateInput('', start, end);

      case 'insertText':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          start,
          end
        );

      case 'insertFromPaste':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          start,
          this.inputSelection.start
        );

      case 'insertFromDrop':
        return this.insertFromDrop(this.input.value);
    }
  }

  protected insertFromDrop(value: string) {
    const { start, end } = this.inputSelection;
    this.maskedValue = this.parser.apply(value);
    this._value = this.parser.parse(this.maskedValue);
    this.droppedText = '';
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
    this._value = this.parser.parse(value);

    this.requestUpdate();
    this.emitEvent('igcInput', { detail: this.value });
    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  }

  protected handleCut() {
    this.selection = this.inputSelection;
  }

  protected handleDragStart() {
    this.selection = this.inputSelection;
  }

  protected handleDrop(e: DragEvent) {
    this.droppedText = e.dataTransfer?.getData('text') ?? '';
  }

  protected handleDragEnter() {
    if (!this.hasFocus) {
      this.maskedValue = this.parser.apply(this._value);
    }
  }

  protected handleDragLeave() {
    if (!this.hasFocus) {
      this.updateMask();
    }
  }

  protected override handleFocus() {
    this.hasFocus = true;
    this.maskedValue = this.parser.apply(this._value);
    super.handleFocus();
  }

  protected override handleBlur() {
    this.hasFocus = false;
    this.updateMask();
    super.handleBlur();
  }

  protected override handleChange() {
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected updateMask() {
    this._value
      ? (this.maskedValue = this.parser.apply(this._value))
      : (this.maskedValue = '');
  }

  /** Replaces the selected text in the control and re-applies the mask */
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    super.setRangeText(replacement, start, end, selectMode);
    this.maskedValue = this.parser.apply(this.input.value);
    this._value = this.parser.parse(this.maskedValue);
  }

  protected override renderInput() {
    return html`<div>
      <input
        type="text"
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder || this.parser.apply())}
        ?readonly=${this.readonly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${this.handleDragStart}
        @drop=${this.handleDrop}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @cut=${this.handleCut}
        @change=${this.handleChange}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @input=${this.handleInput}
        @keydown=${this.handleKeydown}
      />
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-masked-input': IgcMaskedInputComponent;
  }
}
