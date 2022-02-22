import { html, LitElement, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { alternateName, watch } from '../common/decorators';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { Constructor } from '../common/mixins/constructor';
import { SizableMixin } from '../common/mixins/sizable';
import { partNameMap } from '../common/util';
import { MaskParser } from './mask-parser';
import { styles } from './masked-input.material.css';

interface MaskSelection {
  start: number;
  end: number;
}

export interface IgcMaskedInputEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
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
export default class IgcMaskedInputComponent extends SizableMixin(
  EventEmitterMixin<IgcMaskedInputEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-masked-input';
  public static styles = styles;

  public static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected parser = new MaskParser();
  protected _value!: string;
  protected selection: MaskSelection = { start: 0, end: 0 };
  protected droppedText = '';

  @state()
  protected theme!: string;

  @state()
  protected hasFocus = false;

  @state()
  protected maskedValue = '';

  @query('input', true)
  protected input!: HTMLInputElement;

  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  protected get inputSelection(): MaskSelection {
    return {
      start: this.input.selectionStart || 0,
      end: this.input.selectionEnd || 0,
    };
  }

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  @property()
  public name!: string;

  @property({ type: Boolean, reflect: true })
  public readonly = false;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @property({ type: Boolean, reflect: true })
  public required = false;

  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * When enabled, retrieving the value of the control will return it
   * with literal symbols applied.
   */
  @property({ type: Boolean, attribute: 'with-literals' })
  public withLiterals = false;

  /** The label for the control. */
  @property()
  public label!: string;

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

  /** Placeholder for the input. */
  @property()
  public placeholder!: string;

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

  constructor() {
    super();
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.mask = this.mask || this.parser.mask;
    this.prompt = this.prompt || this.parser.prompt;
    this.theme = getComputedStyle(this).getPropertyValue('--theme').trim();

    this.shadowRoot!.addEventListener('slotchange', () => this.requestUpdate());
  }

  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  @alternateName('blurComponent')
  public override blur() {
    this.input.blur();
  }

  protected handleKeydown(e: KeyboardEvent) {
    if (!e.key) {
      return;
    }

    this.selection = this.inputSelection;
  }

  protected handleCompositionStart() {
    this.selection.start = this.inputSelection.start;
  }

  protected handleCompositionEnd() {
    this.selection.end = this.inputSelection.end;
  }

  protected handleInput({ inputType, data, isComposing }: InputEvent) {
    const value = this.input.value;
    const start = this.selection.start;
    let end = this.selection.end;

    switch (inputType) {
      case 'insertCompositionText':
        return this.updateInput(data ?? '', start, end);

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

      case 'deleteByDrag':
        return;
    }
  }

  protected insertFromDrop(value: string) {
    const { start, end } = this.inputSelection;
    this.maskedValue = this.parser.apply(value);
    this._value = this.parser.parse(this.maskedValue);
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
    this.updateComplete.then(() => this.input.setSelectionRange(end, end));
  }

  /**
   * Saves the input `start:end` range at the cut event.
   *
   * Since cut triggers an input event of type `deleteByCut` it will
   * fallthrough the switch and replace the `start:end` range with the mask prompt character.
   */
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
      this.updateMask();
    }
  }

  protected handleDragLeave() {
    if (!this.hasFocus) {
      this.updateMask();
    }
  }

  protected handleFocus() {
    this.hasFocus = true;
    this.updateMask();
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.hasFocus = false;
    if (this.maskedValue === this.parser.apply()) {
      this.maskedValue = '';
    }
    this.emitEvent('igcBlur');
  }

  protected updateMask() {
    this.maskedValue = this.parser.apply(this.input.value);
  }

  protected resetSelection() {
    this.selection = { start: 0, end: 0 };
  }

  private resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
    };
  }

  protected renderInput() {
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
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @input=${this.handleInput}
        @keydown=${this.handleKeydown}
      />
    </div>`;
  }

  private renderLabel() {
    return this.label
      ? html`<label part="label">${this.label}</label>`
      : nothing;
  }

  private renderPrefix() {
    return html`<div part="prefix">
      <slot name="prefix"></slot>
    </div>`;
  }

  private renderSuffix() {
    return html`<div part="suffix">
      <slot name="suffix"></slot>
    </div>`;
  }

  private renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>`;
  }

  private renderMaterial() {
    return html`
      <div
        part="${partNameMap({
          ...this.resolvePartNames('container'),
          labelled: this.label,
        })}"
      >
        <div part="start">${this.renderPrefix()}</div>
        ${this.renderInput()}
        <div part="notch">${this.renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  protected override render() {
    return html`${this.theme === 'material'
      ? this.renderMaterial()
      : this.renderStandard()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-masked-input': IgcMaskedInputComponent;
  }
}
