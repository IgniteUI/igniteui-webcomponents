import { html, LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styles } from './input.material.css';
import { ResizeController } from '../common/controllers';
import { Constructor } from '../common/mixins/constructor.js';
import { watch } from '../common/decorators';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util';
import { SizableMixin } from '../common/mixins/sizable';

let nextId = 0;

type Direction = 'ltr' | 'rtl' | 'auto';

export interface IgcRadioEventMap {
  igcInput: CustomEvent<void>;
  igcChange: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export class IgcInputComponent extends SizableMixin(
  EventEmitterMixin<IgcRadioEventMap, Constructor<LitElement>>(LitElement)
) {
  static styles = styles;
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  private _start = new ResizeController(this);
  private _label = new ResizeController(this);
  private _end = new ResizeController(this);
  private inputId = `input-${nextId++}`;
  private labelId = `input-label-${this.inputId}`;

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
  }

  resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this._prefix?.length > 0,
      suffixed: this._suffix?.length > 0,
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

  renderInput(startWidth: number, endWidth: number, padding: number) {
    const inputStyle = `
      padding-inline-start: calc(${startWidth}px + ${padding}px);
      padding-inline-end: calc(${endWidth}px + ${padding}px);
    `;

    return html`
      <input
        id="${this.inputId}"
        part="${partNameMap(this.resolvePartNames('input'))}"
        name="${ifDefined(this.name)}"
        type="${ifDefined(this.type)}"
        pattern="${ifDefined(this.pattern)}"
        style="${inputStyle}"
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
    return html`<label
      id="${this.labelId}"
      part="label"
      for="${this.inputId}"
      style="transform-origin: ${this.dir === 'ltr' ? 'left' : 'right'}"
      ${this._label.observe()}
    >
      ${this.label}
    </label>`;
  }

  renderPrefix() {
    return html`<div part="prefix" ${this._start.observe()}>
      <slot name="prefix"></slot>
    </div>`;
  }

  renderSuffix() {
    return html`<div part="suffix" ${this._end.observe()}>
      <slot name="suffix"></slot>
    </div>`;
  }

  renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput(0, 0, 16)}
        ${this.renderSuffix()}
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>`;
  }

  renderMaterial() {
    const gap = 4;
    const scale = 0.75;
    const padding = 12;
    const labelWidth = this._label.width;
    const startWidth = this._start.width;
    const endWidth = this._end.width;
    const width = `${labelWidth * scale + gap * 2}px`;

    return html`
      ${this.renderInput(startWidth, endWidth, padding)}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        <div part="start">${this.renderPrefix()}</div>
        <div part="notch" style="width: ${labelWidth > 0 ? width : 'auto'}">
          ${this.renderLabel()}
        </div>
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
