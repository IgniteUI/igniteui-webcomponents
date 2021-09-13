import { html, LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styles } from './input.material.css';
import { Constructor } from '../common/mixins/constructor.js';
import { watch } from '../common/decorators';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util';
import { SizableMixin } from '../common/mixins/sizable';

let nextId = 0;

type Direction = 'ltr' | 'rtl' | 'auto';

export interface IgcInputEventMap {
  igcInput: CustomEvent<void>;
  igcChange: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export class IgcInputComponent extends SizableMixin(
  EventEmitterMixin<IgcInputEventMap, Constructor<LitElement>>(LitElement)
) {
  static styles = styles;
  static shadowRootOptions = {
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
  theme!: string | undefined;

  @query('input', true)
  input!: HTMLInputElement;

  @queryAssignedNodes('prefix', true)
  _prefix!: NodeListOf<HTMLElement>;

  @queryAssignedNodes('suffix', true)
  _suffix!: NodeListOf<HTMLElement>;

  @property({ reflect: true })
  dir: Direction = 'auto';

  @property({ reflect: true })
  type: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' =
    'text';

  @property()
  inputmode!:
    | 'none'
    | 'txt'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';

  @property()
  name!: string;

  @property()
  value = '';

  @property({ type: String })
  pattern!: string;

  @property({ type: String })
  label!: string;

  @property({ type: String })
  placeholder!: string;

  @property({ reflect: true, type: Boolean })
  invalid = false;

  @property({ reflect: true, type: Boolean })
  outlined = false;

  @property({ reflect: true, type: Boolean })
  required = false;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property({ reflect: true, type: Boolean })
  readonly = false;

  @property({ type: Number })
  minlength!: number;

  @property({ type: Number })
  maxlength!: number;

  @property()
  min!: number | string;

  @property()
  max!: number | string;

  @property({ type: Number })
  step!: number;

  @property({ type: Boolean })
  autofocus!: boolean;

  @property()
  autocomplete!: any;

  connectedCallback() {
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

  resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this._prefixLength > 0,
      suffixed: this._suffixLength > 0,
    };
  }

  reportValidity() {
    this.input.reportValidity();
  }

  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  select() {
    return this.input.select();
  }

  setSelectionRange(
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

  setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);

    if (this.value !== this.input.value) {
      this.value = this.input.value;
      this.emitEvent('igcInput');
      this.emitEvent('igcChange');
    }
  }

  stepUp(n?: number) {
    this.input.stepUp(n);
    this.handleChange();
  }

  stepDown(n?: number) {
    this.input.stepDown(n);
    this.handleChange();
  }

  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  blur() {
    this.input.blur();
  }

  handleInvalid() {
    this.invalid = true;
  }

  handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput');
  }

  handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange');
  }

  handleFocus() {
    this.emitEvent('igcFocus');
  }

  handleBlur() {
    this.emitEvent('igcBlur');
  }

  @watch('value', { waitUntilFirstUpdate: true })
  handleValueChange() {
    this.invalid = !this.input.checkValidity();
  }

  renderInput() {
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
        autocomplete="${ifDefined(this.autocomplete)}"
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

  renderLabel() {
    return this.label
      ? html`<label id="${this.labelId}" part="label" for="${this.inputId}">
          ${this.label}
        </label>`
      : null;
  }

  renderPrefix() {
    return html`<div part="prefix">
      <slot name="prefix"></slot>
    </div>`;
  }

  renderSuffix() {
    return html`<div part="suffix">
      <slot name="suffix"></slot>
    </div>`;
  }

  renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>`;
  }

  renderMaterial() {
    return html`
      <div part="${partNameMap(this.resolvePartNames('container'))}">
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

  render() {
    return html`${this.theme === 'material'
      ? this.renderMaterial()
      : this.renderStandard()}`;
  }
}
