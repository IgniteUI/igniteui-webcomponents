import { LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export class IgcCheckboxBaseComponent extends EventEmitterMixin<
  IgcCheckboxEventMap,
  Constructor<LitElement>
>(LitElement) {
  @query('input[type="checkbox"]', true)
  protected input!: HTMLInputElement;

  /** The name attribute of the control. */
  @property()
  name!: string;

  /** The value attribute of the control. */
  @property()
  value!: string;

  /** Disables the control. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** The checked state of the control. */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /** Makes the control a required field. */
  @property({ type: Boolean, reflect: true })
  required = false;

  /** Controls the validity of the control. */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  /** The label position of the control. */
  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

  /** Sets the aria-labelledby attribute for the control. */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  ariaLabelledby!: string;

  /** Simulates a click on the control. */
  click() {
    this.input.click();
  }

  /** Sets focus on the control. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the control. */
  blur() {
    this.input.blur();
  }

  /** Checks for validity of the control and shows the browser message if it invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.input.focus();
  }
}
