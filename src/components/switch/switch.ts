import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styles } from './switch.material.css';

// @customElement('igc-switch')
export class IgcSwitchComponent extends LitElement {
  static styles = styles;

  @query('input[type="radio"]')
  input?: HTMLInputElement;

  @property()
  name?: string;

  @property()
  value?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ reflect: true, attribute: 'label-position' })
  labelPosition?: 'before' | 'after' = 'after';

  handleClick() {
    if (this.checked == true) {
      this.checked = false;
    } else {
      this.checked = true;
    }
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input?.focus();
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
        <span part="control">
          <span part="thumb"></span>
        </span>
        <span part="label">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
