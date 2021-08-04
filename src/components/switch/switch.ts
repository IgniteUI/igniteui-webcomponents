import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { styles } from './switch.material.css';
import { watch } from '../common/decorators/watch.js';

let nextId = 0;

export interface IgcSwitchEventMap {
  igcChange: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

// @customElement('igc-switch')
export class IgcSwitchComponent extends EventEmitterMixin<
  IgcSwitchEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = styles;

  private inputId = `switch-${nextId++}`;
  private labelId = `switch-label-${this.inputId}`;

  @query('input[type="checkbox"]')
  input!: HTMLInputElement;

  @state()
  _tabIndex = 0;

  @property()
  name!: string;

  @property()
  value!: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

  @property({ reflect: true, attribute: 'aria-labelledby' })
  ariaLabelledby!: string;

  click() {
    this.input.click();
  }

  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  blur() {
    this.input.blur();
  }

  reportValidity() {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  handleClick() {
    this.checked = !this.checked;
  }

  handleBlur() {
    this.emitEvent('igcBlur');
  }

  handleFocus() {
    this.emitEvent('igcFocus');
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input.focus();
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  handleChange() {
    if (this.checked) {
      this.input.focus();
      this._tabIndex = 0;
      this.emitEvent('igcChange');
    }
  }

  render() {
    return html`
      <label
        part="base"
        for="${this.inputId}"
        @mousedown="${this.handleMouseDown}"
      >
        <input
          id=${this.inputId}
          type="checkbox"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .disabled="${this.disabled}"
          .checked="${live(this.checked)}"
          tabindex=${this._tabIndex}
          aria-checked="${this.checked ? 'true' : 'false'}"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-labelledby="${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @focus="${this.handleFocus}"
        />
        <span part="control">
          <span part="thumb"></span>
        </span>
        <span part="label" id="${this.labelId}">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
