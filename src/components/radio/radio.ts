import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styles } from './radio.material.css';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { watch } from '../common/decorators';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { partNameMap } from '../common/util.js';

let nextId = 0;

export interface IgcRadioEventMap {
  igcChange: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export class IgcRadioComponent extends EventEmitterMixin<
  IgcRadioEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = styles;

  private inputId = `radio-${nextId++}`;
  private labelId = `radio-label-${this.inputId}`;

  @query('input[type="radio"]', true)
  input!: HTMLInputElement;

  @state()
  _tabIndex = 0;

  @property()
  name!: string;

  @property()
  value!: string;

  @property({ type: Boolean })
  checked = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

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
    this.input.reportValidity();
  }

  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input.focus();
  }

  handleClick() {
    this.checked = true;
  }

  handleBlur() {
    this.emitEvent('igcBlur');
  }

  handleFocus() {
    this.emitEvent('igcFocus');
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  handleChange() {
    if (this.checked) {
      this.getSiblings().forEach((radio) => {
        radio.checked = false;
        radio._tabIndex = -1;
      });
      this.input.focus();
      this._tabIndex = 0;
      this.emitEvent('igcChange');
    }
  }

  getSiblings() {
    const group = this.closest('igc-radio-group');
    if (!group) return [];

    return Array.from<IgcRadioComponent>(
      group.querySelectorAll('igc-radio')
    ).filter((radio) => radio.name === this.name && radio !== this);
  }

  render() {
    return html`
      <label
        part="${partNameMap({ base: true, checked: this.checked })}"
        for="${this.inputId}"
        @mousedown="${this.handleMouseDown}"
      >
        <input
          id="${this.inputId}"
          type="radio"
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
        <span
          part="${partNameMap({ control: true, checked: this.checked })}"
        ></span>
        <span
          part="${partNameMap({ label: true, checked: this.checked })}"
          id="${this.labelId}"
        >
          <slot></slot>
        </span>
      </label>
    `;
  }
}
