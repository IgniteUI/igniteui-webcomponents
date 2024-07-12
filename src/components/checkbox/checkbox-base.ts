import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';

import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import {
  type Validator,
  requiredBooleanValidator,
} from '../common/validators.js';

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<{ checked: boolean; value: string | undefined }>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcCheckboxEventMap, Constructor<LitElement>>(LitElement)
) {
  protected override validators: Validator<this>[] = [requiredBooleanValidator];

  protected _kbFocus = addKeyboardFocusRing(this);
  protected _value!: string;
  protected _checked = false;

  @query('input', true)
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  protected hideLabel = false;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
    if (this.checked) {
      this.setFormValue(this._value || 'on');
    }
  }

  public get value(): string {
    return this._value;
  }

  /**
   * The checked state of the control.
   * @attr
   */
  @property({ type: Boolean })
  @blazorTwoWayBind('igcChange', 'detail')
  public set checked(value: boolean) {
    this._checked = Boolean(value);
    this.setFormValue(this._checked ? this.value || 'on' : null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get checked(): boolean {
    return this._checked;
  }

  /**
   * The label position of the control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => {
      this.hideLabel = this.label.length < 1;
    });
    return root;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateValidity();
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
    this.emitEvent('igcChange', {
      detail: { checked: this.checked, value: this.value },
    });
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this._kbFocus.reset();
  }

  protected handleFocus() {
    this._dirty = true;
    this.emitEvent('igcFocus');
  }
}
