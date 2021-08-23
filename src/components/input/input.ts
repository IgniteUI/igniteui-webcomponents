import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styles } from './input.material.css';
import { ResizeController, DirectionController } from '../common/controllers';

export class IgcInputComponent extends LitElement {
  static styles = styles;
  private direction = new DirectionController(this);
  private _start = new ResizeController(this);
  private _label = new ResizeController(this);
  private _end = new ResizeController(this);

  @query('input', true)
  input!: HTMLInputElement;

  @property({ type: String })
  type!: string;

  @property({ type: String })
  pattern!: string;

  @property({ type: String })
  label!: string;

  @property({ type: String })
  placeholder!: string;

  @property({ reflect: true, type: Boolean })
  valid!: boolean;

  @property({ reflect: true, type: Boolean })
  invalid!: boolean;

  @property({ reflect: true, type: Boolean })
  outlined = false;

  @property({ reflect: true, type: Boolean })
  required = false;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  reportValidity() {
    this.input.reportValidity();
  }

  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
    this.valid = !this.invalid;
  }

  renderInput(startWidth: number, endWidth: number, padding: number) {
    const inputStyle = css`
      padding-inline-start: calc(${startWidth}px + ${padding}px);
      padding-inline-end: calc(${endWidth}px + ${padding}px);
    `;

    return html`
      <input
        id="outlined"
        type="${ifDefined(this.type)}"
        pattern="${ifDefined(this.pattern)}"
        style="${inputStyle}"
        placeholder="${this.placeholder ?? ' '}"
        ?disabled="${ifDefined(this.disabled)}"
        ?required="${ifDefined(this.required)}"
      />
    `;
  }

  renderLabel() {
    return html`<label
      ${this._label.observe()}
      for="outlined"
      style="transform-origin: ${this.direction.value === 'ltr'
        ? 'left'
        : 'right'}"
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

  renderDefault() {
    return html`${this.renderLabel()}
      <div part="container">
        ${this.renderPrefix()} ${this.renderInput(0, 0, 16)}
        ${this.renderSuffix()}
      </div>`;
  }

  renderOutlined() {
    const gap = 4;
    const scale = 0.75;
    const padding = 12;
    const labelWidth = this._label.width;
    const startWidth = this._start.width;
    const endWidth = this._end.width;
    const width = `${labelWidth * scale + gap * 2}px`;

    return html`
      ${this.renderInput(startWidth, endWidth, padding)}
      <div part="container">
        ${this.renderPrefix()}
        <div part="notch" style="width: ${labelWidth > 0 ? width : 'auto'}">
          ${this.renderLabel()}
        </div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
    `;
  }

  render() {
    return html`${this.outlined
      ? this.renderOutlined()
      : this.renderDefault()}`;
  }
}
