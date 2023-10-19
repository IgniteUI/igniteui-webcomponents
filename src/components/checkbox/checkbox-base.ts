import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';

import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { Validator, requiredBooleanValidator } from '../common/validators.js';

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcCheckboxEventMap, Constructor<LitElement>>(LitElement)
) {
  protected override validators: Validator<this>[] = [requiredBooleanValidator];

  @query('input[type="checkbox"]', true)
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  protected focused = false;

  @state()
  protected hideLabel = false;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public value!: string;

  /**
   * The checked state of the control.
   * @attr
   */
  @property({ type: Boolean })
  @blazorTwoWayBind('igcChange', 'detail')
  public checked = false;

  /**
   * The label position of the control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  constructor() {
    super();
    this.addEventListener('keyup', this.handleKeyUp);
  }

  @watch('checked')
  protected checkedChanged() {
    const value = this.value || 'on';
    this.checked ? this.setFormValue(value, value) : this.setFormValue(null);
    this.updateValidity();
    this.setInvalidState();
  }

  @watch('focused', { waitUntilFirstUpdate: true })
  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected handleChange() {
    this.invalid = !this.checkValidity();
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

  protected handleClick() {
    this.checked = !this.checked;
    this.emitEvent('igcChange', { detail: this.checked });
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this.focused = false;
  }

  protected handleFocus() {
    this._dirty = true;
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
