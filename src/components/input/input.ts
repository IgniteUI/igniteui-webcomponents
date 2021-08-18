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

  renderOutlined() {
    const gap = 4;
    const scale = 0.75;
    const padding = 12;
    const labelWidth = this._label.width;
    const startWidth = this._start.width;
    const endWidth = this._end.width;
    const width = `${labelWidth * scale + gap * 2}px`;

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
        .disabled="${this.disabled}"
        .required="${this.required}"
      />
      <div part="container">
        <div part="start" ${this._start.observe()}>
          <slot name="prefix"></slot>
        </div>
        <div part="middle" style="width: ${labelWidth > 0 ? width : 'auto'}">
          <label
            ${this._label.observe()}
            for="outlined"
            style="transform-origin: ${this.direction.value === 'ltr'
              ? 'left'
              : 'right'}"
          >
            ${this.label}
          </label>
        </div>
        <div part="filler">
          <div part="end" ${this._end.observe()}>
            <slot name="suffix"></slot>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`${this.renderOutlined()}`;
  }
}
