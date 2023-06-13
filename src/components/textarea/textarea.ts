import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  queryAssignedNodes,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import type { ReactiveTheme, ThemeController } from '../../theming/types.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter, extractText, partNameMap } from '../common/util.js';

export interface IgcTextareaEventMap {
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

/**
 * This element represents a multi-line plain-text editing control,
 * useful when you want to allow users to enter a sizeable amount of free-form text,
 * for example a comment on a review or feedback form.
 *
 * @element igc-textarea
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control receives user input.
 * @fires igcChange - Emitted when the a change to the control value is committed by the user.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
@themes({})
export default class IgcTextareaComponent
  extends EventEmitterMixin<IgcTextareaEventMap, Constructor<LitElement>>(
    LitElement
  )
  implements ReactiveTheme
{
  public static readonly tagName = 'igc-textarea';

  private static readonly increment = createCounter();
  protected inputId = `textarea-${IgcTextareaComponent.increment()}`;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private observer!: ResizeObserver;
  protected themeController!: ThemeController;

  @queryAssignedNodes({ flatten: true })
  private projected!: Array<Node>;

  @queryAssignedElements({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @query('textarea', true)
  private input!: HTMLTextAreaElement;

  private get resizeStyles(): StyleInfo {
    return {
      resize: this.resize === 'auto' ? 'none' : this.resize,
    };
  }

  /**
   * The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 20.
   *
   * @attr
   */
  @property({ type: Number })
  public cols = 20;

  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 2.
   *
   * @attr
   */
  @property({ type: Number })
  public rows = 2;

  /**
   * The value of the component
   *
   * @attr
   */
  @property()
  public value = '';

  /**
   * The placeholder attribute of the control.
   *
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * Whether the control will have outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The label for the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   *
   * @attr
   */
  @property()
  public resize: 'auto' | 'both' | 'vertical' | 'horizontal' | 'none' = 'both';

  /**
   * The minimum number of characters (UTF-16 code units) required that the user should enter.
   *
   * @attr
   */
  @property({ type: Number })
  public minLength!: number;

  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   *
   * @attr
   */
  @property({ type: Number })
  public maxLength!: number;

  public override async connectedCallback() {
    super.connectedCallback();

    await this.updateComplete;

    this.setAreaHeight();
    this.observer = new ResizeObserver(() => this.setAreaHeight());
    this.observer.observe(this.input);
  }

  public override disconnectedCallback(): void {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  public themeAdopted(controller: ThemeController): void {
    this.themeController = controller;
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur() {
    this.input.blur();
  }

  /** Selects all text within the control. */
  public select() {
    this.input.select();
  }

  /** Sets the text selection range of the control */
  public setSelectionRange(
    start: number,
    end: number,
    direction: 'backward' | 'forward' | 'none' = 'none'
  ) {
    this.input.setSelectionRange(start, end, direction);
  }

  /** Replaces the selected text in the control. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);
    this.value = this.input.value;
  }

  public override scrollTo(options?: ScrollToOptions | undefined): void;
  public override scrollTo(x: number, y: number): void;
  public override scrollTo(x?: unknown, y?: unknown): void {
    if (x !== undefined && y !== undefined)
      this.input.scrollTo(x as number, y as number);
    else this.input.scrollTo(x as ScrollToOptions);
  }

  protected resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
      filled: !!this.value,
    };
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected async valueChanged() {
    await this.updateComplete;
    this.setAreaHeight();
  }

  @watch('rows', { waitUntilFirstUpdate: true })
  @watch('resize', { waitUntilFirstUpdate: true })
  protected setAreaHeight() {
    if (this.resize === 'auto') {
      this.input.style.height = 'auto';
      this.input.style.height = `${this.input.scrollHeight}px`;
    } else {
      Object.assign(this.input.style, { height: undefined });
    }
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  protected handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected valueSlotChange() {
    const value = extractText(this.projected);

    if (value.length) {
      this.value = value.join('\r\n');
    }
  }

  protected renderValueSlot() {
    return html`<slot
      style="display: none"
      @slotchange=${this.valueSlotChange}
    ></slot>`;
  }

  protected renderPrefix() {
    return html`<div part="prefix">
      <slot name="prefix"></slot>
    </div>`;
  }

  protected renderSuffix() {
    return html`<div part="suffix">
      <slot name="suffix"></slot>
    </div>`;
  }

  protected renderLabel() {
    return this.label
      ? html`<label part="label" for=${this.inputId}>${this.label}</label>`
      : nothing;
  }

  protected renderStandard() {
    return html`
      ${this.renderLabel()}
      <div part=${partNameMap(this.resolvePartNames('container'))}>
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text" .hidden=${this.helperText.length < 1}>
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  protected renderMaterial() {
    return html`
      <div
        part=${partNameMap({
          ...this.resolvePartNames('container'),
          labelled: this.label,
        })}
      >
        <div part="start">${this.renderPrefix()}</div>
        ${this.renderInput()}
        <div part="notch">${this.renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      <div part="helper-text" .hidden=${this.helperText.length < 0}>
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  protected renderInput() {
    return html`${this.renderValueSlot()}
      <textarea
        style=${styleMap(this.resizeStyles)}
        @input=${this.handleInput}
        @change=${this.handleChange}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
        .placeholder=${ifDefined(this.placeholder)}
        .cols=${this.cols}
        .rows=${this.rows}
        .value=${live(this.value)}
      ></textarea>`;
  }

  protected override render() {
    const isMaterial = this.themeController.theme === 'material';
    return isMaterial ? this.renderMaterial() : this.renderStandard();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-textarea': IgcTextareaComponent;
  }
}
