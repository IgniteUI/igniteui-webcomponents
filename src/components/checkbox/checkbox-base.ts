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
  input!: HTMLInputElement;

  @property()
  name!: string;

  @property()
  value!: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean })
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
}
