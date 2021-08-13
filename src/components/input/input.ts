import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './input.material.css';
import { ResizeController } from '../common/directives/resize.js';

export class IgcInputComponent extends LitElement {
  static styles = styles;
  private _size = new ResizeController(this);

  @property({ reflect: true, type: String })
  variant: 'outlined' | 'filled' = 'outlined';

  renderOutlined() {
    return html`
      <input id="outlined" type="text" placeholder=" " />
      <div part="container">
        <div part="start"></div>
        <div
          part="middle"
          .style="width: ${this._size.dimensions.width
            ? `${this._size.dimensions.width + 12 * 0.75}px`
            : 'auto'}"
        >
          <label ${this._size.observe()} for="outlined">Some long label</label>
        </div>
        <div part="end"></div>
      </div>
    `;
  }

  render() {
    console.log(this._size.dimensions);
    return html`${this.renderOutlined()}`;
  }
}
