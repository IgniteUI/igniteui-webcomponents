import { html, LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styles } from './input.material.css';
import { Constructor } from '../common/mixins/constructor.js';
import { alternateName, watch, blazorTwoWayBind } from '../common/decorators';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util';
import { SizableMixin } from '../common/mixins/sizable';

let nextId = 0;

type Direction = 'ltr' | 'rtl' | 'auto';

export interface IgcInputEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

/**
 * @element igc-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
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
export default class IgcInputComponent extends SizableMixin(
  EventEmitterMixin<IgcInputEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-input';

  /** @private */
  public static styles = styles;

  /** @private */
  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  private inputId = `input-${nextId++}`;
  private labelId = `input-label-${this.inputId}`;

  @state()
  private _prefixLength!: number;

  @state()
  private _suffixLength!: number;

  @state()
  private theme!: string | undefined;

  @query('input', true)
  private input!: HTMLInputElement;

  @queryAssignedNodes('prefix', true)
  private _prefix!: NodeListOf<HTMLElement>;

  @queryAssignedNodes('suffix', true)
  private _suffix!: NodeListOf<HTMLElement>;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public dir: Direction = 'auto';

  /** The type attribute of the control. */
  @alternateName('displayType')
  @property({ reflect: true })
  public type:
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'url' = 'text';

  /** The input mode attribute of the control. */
  @property()
  public inputmode!:
    | 'none'
    | 'txt'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';

  /** The name attribute of the control. */
  @property()
  public name!: string;

  /** The value attribute of the control. */
  @property()
  @blazorTwoWayBind('igcChange', 'detail')
  public value = '';

  /** The pattern attribute of the control. */
  @property({ type: String })
  public pattern!: string;

  /** The label of the control.
   * @attr [label=Label]
   */
  @property({ type: String })
  public label!: string;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: string;

  /** Controls the validity of the control. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /** Makes the control a required field. */
  @property({ reflect: true, type: Boolean })
  public required = false;

  /** Makes the control a disabled field. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** Makes the control a readonly field. */
  @property({ reflect: true, type: Boolean })
  public readonly = false;

  /** The minlength attribute of the control. */
  @property({ type: Number })
  public minlength!: number;

  /** The maxlength attribute of the control. */
  @property({ type: Number })
  public maxlength!: number;

  /** The min attribute of the control. */
  @property()
  public min!: number | string;

  /** The max attribute of the control. */
  @property()
  public max!: number | string;

  /** The step attribute of the control. */
  @property({ type: Number })
  public step!: number;

  /** The autofocus attribute of the control. */
  @property({ type: Boolean })
  public autofocus!: boolean;

  /** The autocomplete attribute of the control. */
  @property()
  public autocomplete!: string;

  constructor() {
    super();
    this.size = 'medium';
  }

  public connectedCallback() {
    super.connectedCallback();
    const theme = document.defaultView
      ?.getComputedStyle(this)
      .getPropertyValue('--theme')
      .trim();

    this.theme = theme;

    this.shadowRoot?.addEventListener('slotchange', (_) => {
      this._prefixLength = this._prefix.length;
      this._suffixLength = this._suffix.length;
    });
  }

  /** Checks for validity of the control and shows the browser message if it's invalid. */
  public reportValidity() {
    return this.input.reportValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  /** Selects all text within the input. */
  public select() {
    return this.input.select();
  }

  /** Sets the text selection range of the input. */
  public setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: 'backward' | 'forward' | 'none' = 'none'
  ) {
    return this.input.setSelectionRange(
      selectionStart,
      selectionEnd,
      selectionDirection
    );
  }

  /** Replaces the selected text in the input. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);

    if (this.value !== this.input.value) {
      this.value = this.input.value;
      this.emitEvent('igcInput', { detail: this.value });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  /** Increments the numeric value of the input by one or more steps. */
  public stepUp(n?: number) {
    this.input.stepUp(n);
    this.handleChange();
  }

  /** Decrements the numeric value of the input by one or more steps. */
  public stepDown(n?: number) {
    this.input.stepDown(n);
    this.handleChange();
  }

  /** Sets focus on the control. */
  @alternateName('focusComponent')
  public focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the control. */
  @alternateName('blurComponent')
  public blur() {
    this.input.blur();
  }

  private resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this._prefixLength > 0,
      suffixed: this._suffixLength > 0,
    };
  }

  private handleInvalid() {
    this.invalid = true;
  }

  private handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  private handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  private handleFocus() {
    this.emitEvent('igcFocus');
  }

  private handleBlur() {
    this.emitEvent('igcBlur');
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected handleValueChange() {
    this.invalid = !this.input.checkValidity();
  }

  private renderInput() {
    return html`
      <input
        id="${this.inputId}"
        part="${partNameMap(this.resolvePartNames('input'))}"
        name="${ifDefined(this.name)}"
        type="${ifDefined(this.type)}"
        pattern="${ifDefined(this.pattern)}"
        placeholder="${this.placeholder ?? ' '}"
        .value="${live(this.value)}"
        ?readonly="${this.readonly}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        ?autofocus="${this.autofocus}"
        autocomplete="${ifDefined(this.autocomplete as any)}"
        inputmode="${ifDefined(this.inputmode)}"
        min="${ifDefined(this.min)}"
        max="${ifDefined(this.max)}"
        minlength="${ifDefined(this.minlength)}"
        maxlength="${ifDefined(this.maxlength)}"
        step="${ifDefined(this.step)}"
        aria-invalid="${this.invalid ? 'true' : 'false'}"
        @invalid="${this.handleInvalid}"
        @change="${this.handleChange}"
        @input="${this.handleInput}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
      />
    `;
  }

  private renderLabel() {
    return this.label
      ? html`<label id="${this.labelId}" part="label" for="${this.inputId}">
          ${this.label}
        </label>`
      : null;
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

  protected render() {
    return html`${this.theme === 'material'
      ? this.renderMaterial()
      : this.renderStandard()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-input': IgcInputComponent;
  }
}
