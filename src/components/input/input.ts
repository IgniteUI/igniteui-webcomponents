import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './input.material.css';
import { ResizeController } from '../common/directives/resize.js';

export class IgcInputComponent extends LitElement {
  static styles = styles;
  private _size = new ResizeController(this);
  private _size2 = new ResizeController(this);

  @property({ type: String })
  label!: string;

  @property({ type: String })
  placeholder!: string;

  @property({ reflect: true, type: String })
  variant: 'outlined' | 'filled' = 'outlined';

  renderOutlined() {
    const gap = 4;
    const scale = 0.75;
    const labelWidth = this._size.width;
    const startWidth = this._size2.width;
    const width = `${labelWidth * scale + gap * 2}px`;

    return html`
      <input
        id="outlined"
        type="text"
        placeholder="${this.placeholder ?? ' '}"
        style="padding-inline-start: calc(${startWidth}px + 12px)"
      />
      <div part="container">
        <div part="start" ${this._size2.observe()}>
          <slot name="start"></slot>
        </div>
        <div part="middle" style="width: ${labelWidth > 0 ? width : 'auto'}">
          <label ${this._size.observe()} for="outlined"> ${this.label} </label>
        </div>
        <div part="end"></div>
      </div>
    `;
  }

  render() {
    return html`${this.renderOutlined()}`;
  }
}
