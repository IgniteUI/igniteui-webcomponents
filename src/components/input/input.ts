import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './input.material.css';
import { ResizeController } from '../common/directives/resize.js';

export class IgcInputComponent extends LitElement {
  static styles = styles;
  private _start = new ResizeController(this);
  private _label = new ResizeController(this);
  private _end = new ResizeController(this);

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  @property({ type: String })
  label!: string;

  @property({ type: String })
  placeholder!: string;

  @property({ reflect: true, type: String })
  variant: 'outlined' | 'filled' = 'outlined';

  renderOutlined() {
    const gap = 4;
    const scale = 0.75;
    const labelWidth = this._label.width;
    const startWidth = this._start.width;
    const endWidth = this._end.width;
    const width = `${labelWidth * scale + gap * 2}px`;

    return html`
      <input
        id="outlined"
        type="text"
        placeholder="${this.placeholder ?? ' '}"
        style="padding-inline-start: calc(${startWidth}px + 12px); padding-inline-end: calc(${endWidth}px + 12px);"
      />
      <div part="container">
        <div part="start" ${this._start.observe()}>
          <slot name="start"></slot>
        </div>
        <div part="middle" style="width: ${labelWidth > 0 ? width : 'auto'}">
          <label
            ${this._label.observe()}
            for="outlined"
            style="transform-origin: ${this.isLTR ? 'left' : 'right'}"
          >
            ${this.label}
          </label>
        </div>
        <div part="filler">
          <div part="end" style="display: flex" ${this._end.observe()}>
            <slot name="end"></slot>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`${this.renderOutlined()}`;
  }
}
