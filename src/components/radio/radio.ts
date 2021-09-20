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

/**
 * @element igc-radio
 *
 * @slot - The radio label.
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart base - The radio control base wrapper.
 * @csspart control - The radio control.
 * @csspart label - The radio control label.
 */
export class IgcRadioComponent extends EventEmitterMixin<
  IgcRadioEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = styles;

  private inputId = `radio-${nextId++}`;
  private labelId = `radio-label-${this.inputId}`;

  @query('input[type="radio"]', true)
  protected input!: HTMLInputElement;

  @state()
  _tabIndex = 0;

  /** The name attribute of the control. */
  @property()
  name!: string;

  /** The value attribute of the control. */
  @property()
  value!: string;

  /** The checked state of the control. */
  @property({ type: Boolean })
  checked = false;

  /** Disables the radio control. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Controls the validity of the control. */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  /** The label position of the radio control. */
  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

  /** Sets the aria-labelledby attribute for the radio control. */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  ariaLabelledby!: string;

  /** Simulates a click on the radio control. */
  click() {
    this.input.click();
  }

  /** Sets focus on the radio control. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the radio control. */
  blur() {
    this.input.blur();
  }

  /** Checks for validity of the control and shows the browser message if it invalid. */
  reportValidity() {
    this.input.reportValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  protected handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input.focus();
  }

  protected handleClick() {
    this.checked = true;
  }

  @alternateName('handleBlurred')
  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  @alternateName('handleFocused')
  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  protected handleChange() {
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

  protected getSiblings() {
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
