import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent extends EventEmitterMixin<
  IgcCheckboxEventMap,
  Constructor<LitElement>
>(LitElement) {
  @query('input[type="checkbox"]', true)
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  protected focused = false;

  @state()
  protected hideLabel = false;

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
   * Disables the control.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

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
    return this.input.reportValidity();
  }

  /** Checks for validity of the control and emits the invalid event if it invalid. */
  public checkValidity() {
    return this.input.checkValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
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

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keyup', this.handleKeyUp);
  }

  public override disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
    super.disconnectedCallback();
  }

  protected handleKeyUp() {
    if (!this.focused) {
      this.focused = true;
    }
  }

  protected override async firstUpdated() {
    if (this.label.length === 0) {
      this.hideLabel = true;
    }

    await this.updateComplete;
  }
}
