import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styles } from './radio.material.css';

export class IgcRadioComponent extends LitElement {
  static styles = styles;

  @query('input[type="radio"]')
  input!: HTMLInputElement;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

  handleClick() {
    this.checked = true;
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input.focus();
  }

  render() {
    return html`
      <label part="base" for="radio" @mousedown="${this.handleMouseDown}">
        <input
          id="radio"
          type="radio"
          .disabled="${this.disabled}"
          .checked="${this.checked}"
          @click="${this.handleClick}"
        />
        <span part="control"></span>
        <span part="label">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
