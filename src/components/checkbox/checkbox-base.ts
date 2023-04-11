import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { watch } from '../common/decorators/watch.js';
import type { FormAssociatedElement } from '../common/types';

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent
  extends EventEmitterMixin<IgcCheckboxEventMap, Constructor<LitElement>>(
    LitElement
  )
  implements FormAssociatedElement
{
  public static readonly formAssociated = true;

  #internals: ElementInternals;
  #disabled = false;

  @query('input[type="checkbox"]', true)
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  protected focused = false;

  @state()
  protected hideLabel = false;

  /** Returns the HTMLFormElement associated with this element. */
  public get form() {
    return this.#internals.form;
  }

  /**
   * Returns a ValidityState object which represents the different validity states
   * the element can be in, with respect to constraint validation.
   */
  public get validity() {
    return this.#internals.validity;
  }

  /** A string containing the validation message of this element. */
  public get validationMessage() {
    return this.#internals.validationMessage;
  }

  /**
   * A boolean value which returns true if the element is a submittable element
   * that is a candidate for constraint validation.
   */
  public get willValidate() {
    return this.#internals.willValidate;
  }

  /**
   * The name attribute of the control.
   * @attr
   */
  @property()
  public name!: string;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public value!: string;

  /**
   * The disabled state of the component
   * @attr [disabled=false]
   */
  @property({ type: Boolean, reflect: true })
  public get disabled() {
    return this.#disabled;
  }

  public set disabled(value: boolean) {
    const old = this.#disabled;
    this.#disabled = value;
    this.toggleAttribute('disabled', this.#disabled);
    this.requestUpdate('disabled', old);
  }
  /**
   * The checked state of the control.
   * @attr
   */
  @property({ type: Boolean })
  @blazorTwoWayBind('igcChange', 'detail')
  public checked = false;

  /**
   * Makes the control a required field.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public required = false;

  /**
   * Controls the validity of the control.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public invalid = false;

  /**
   * The label position of the control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  /** Sets the aria-labelledby attribute for the control. */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  public ariaLabelledby!: string;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.addEventListener('keyup', this.handleKeyUp);

    this.addEventListener('invalid', (e) => {
      e.preventDefault();
      this.invalid = true;
    });
  }

  @watch('checked')
  protected checkedChanged() {
    this.checked
      ? this.#internals.setFormValue(this.value || 'on')
      : this.#internals.setFormValue(null);

    this.#updateValidity();

    if (this.hasUpdated) {
      this.invalid = !this.checkValidity();
    }
  }

  @watch('required', { waitUntilFirstUpdate: true })
  protected requiredChange() {
    this.#updateValidity();
  }

  @watch('focused', { waitUntilFirstUpdate: true })
  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected handleChange() {
    this.invalid = !this.checkValidity();
  }

  #updateValidity(message = '') {
    const flags: ValidityStateFlags = {};
    let msg = '';

    if (this.required && !this.checked) {
      flags.valueMissing = true;
      msg = 'This field is required';
    }

    if (message) {
      flags.customError = true;
      msg = message;
    }

    this.#internals.setValidity(flags, msg);
  }

  protected formResetCallback() {
    this.checked = Boolean(this.getAttribute('checked'));
    this.invalid = false;
  }

  protected formDisabledCallback(state: boolean) {
    this.#disabled = state;
    this.requestUpdate();
  }

  /** Simulates a click on the control. */
  public override click() {
    this.input.click();
  }

  /** Sets focus on the control. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the control. */
  @alternateName('blurComponent')
  public override blur() {
    this.input.blur();
  }

  /** Checks for validity of the control and shows the browser message if it invalid. */
  public reportValidity() {
    return this.#internals.reportValidity();
  }

  /** Checks for validity of the control and emits the invalid event if it invalid. */
  public checkValidity() {
    return this.#internals.checkValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.#updateValidity(message);
    this.invalid = !this.checkValidity();
  }

  protected handleClick() {
    this.checked = !this.checked;
    this.emitEvent('igcChange', { detail: this.checked });
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this.focused = false;
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleMouseDown(event: PointerEvent) {
    event.preventDefault();
    this.input.focus();
    this.focused = false;
  }

  protected handleKeyUp() {
    if (!this.focused) {
      this.focused = true;
    }
  }

  protected handleSlotChange() {
    this.hideLabel = this.label.length < 1;
  }
}
