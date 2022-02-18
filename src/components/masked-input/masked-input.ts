import { html, LitElement, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { alternateName, watch } from '../common/decorators';
import { SizableMixin } from '../common/mixins/sizable';
import { partNameMap } from '../common/util';
import { MaskParser } from './mask-parser';
import { styles } from '../input/input.material.css';

interface MaskSelection {
  start: number;
  end: number;
}

export default class IgcMaskedInputComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-masked-input';

  public static override styles = styles;

  public static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected parser = new MaskParser();
  protected _value!: string;
  protected selection: MaskSelection = { start: 0, end: 0 };
  protected droppedText = '';
  protected historyStack: string[] = [];

  @state()
  protected theme!: string;

  @state()
  protected hasFocus = false;

  @query('input', true)
  protected input!: HTMLInputElement;

  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  @state()
  protected maskedValue = '';

  protected get inputSelection(): MaskSelection {
    return {
      start: this.input.selectionStart || 0,
      end: this.input.selectionEnd || 0,
    };
  }

  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  @property({ type: Boolean, attribute: 'with-literals' })
  public withLiterals = false;

  @property()
  public label!: string;

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

  @property()
  public placeholder!: string;

  @property()
  public mask!: string;

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

  protected handleBeforeInput() {
    // XXX: Decide whether to handle undo/redo actions for the component
    // if (!['historyUndo', 'historyRedo'].includes(inputType)) {
    //   this.historyStack.push(this.maskedValue);
    // }
  }

  protected handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const inputType = e.inputType;
    const newValue = target.value;
    let part = '';
    let { start, end } = this.selection;

    // console.log({ inputType });

    switch (inputType) {
      case 'deleteContentForward':
        end === start ? end++ : end;
        break;

      case 'deleteContentBackward':
        start = this.inputSelection.start;
        break;

      case 'insertText':
        part = newValue.substring(start, this.inputSelection.end);
        break;

      case 'insertFromPaste':
        end = this.inputSelection.start;
        part = newValue.substring(start, this.inputSelection.end);
        break;

      case 'insertFromDrop':
        part = this.droppedText;
        ({ start, end } = this.inputSelection);
        end = start + part.length;
        this.droppedText = '';
        break;
      case 'deleteByDrag':
        part = newValue.substring(start, end);
    }

    const replace = this.parser.replace(this.maskedValue, part, start, end);
    this.maskedValue = replace.value;
    this._value = this.parser.parse(replace.value);

    this.requestUpdate();
    this.updateComplete.then(() => {
      this.input.setSelectionRange(replace.end, replace.end);
      this.resetSelection();
    });
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

  protected handleDrop({ dataTransfer }: DragEvent) {
    this.droppedText = dataTransfer?.getData('text') ?? '';
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
  }

  protected handleBlur() {
    this.hasFocus = false;
    if (this.maskedValue === this.parser.apply()) {
      this.maskedValue = '';
    }
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
        .value=${live(this.maskedValue)}
        .placeholder=${live(this.placeholder || this.parser.apply())}
        @dragenter=${this.handleDragEnter}
        @dragleave=${this.handleDragLeave}
        @dragstart=${this.handleDragStart}
        @drop=${this.handleDrop}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @cut=${this.handleCut}
        @beforeinput=${this.handleBeforeInput}
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
