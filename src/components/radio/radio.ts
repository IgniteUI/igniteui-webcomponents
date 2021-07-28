import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styles } from './radio.material.css';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { watch } from '../common/decorators';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

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

  @query('input[type="radio"]')
  input!: HTMLInputElement;

  @property()
  name!: string;

  @property()
  value!: string;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

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
      this.getRadios().forEach((radio) => (radio.checked = false));
      this.input.focus();
    }

    this.emitEvent('igcChange');
  }

  getRadios() {
    const group = this.closest('igc-radio-group');

    if (!group) {
      return [];
    }

    return ([...group.querySelectorAll('igc-radio')] as this[]).filter(
      (radio: this) => radio.name === this.name && radio !== this
    );
  }

  render() {
    return html`
      <label
        part="base"
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
          aria-checked="${this.checked ? 'true' : 'false'}"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-labelledby="${this.labelId}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @focus="${this.handleFocus}"
        />
        <span part="control"></span>
        <span part="label" id="${this.labelId}">
          <slot></slot>
        </span>
      </label>
    `;
  }
}
