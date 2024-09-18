import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';

import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { checkBoxValidators } from './validators.js';

export interface CheckboxChangeEventArgs {
  checked: boolean;
  value?: string;
}

export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<CheckboxChangeEventArgs>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent extends FormAssociatedCheckboxRequiredMixin(
  EventEmitterMixin<IgcCheckboxEventMap, Constructor<LitElement>>(LitElement)
) {
  protected override get __validators() {
    return checkBoxValidators;
  }

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
      this._setFormValue(this._value || 'on');
    }
  }

  public get value(): string {
    return this._value;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail.checked", false) */
  /**
   * The checked state of the control.
   * @attr
   */
  @property({ type: Boolean })
  public set checked(value: boolean) {
    this._checked = Boolean(value);
    this._setFormValue(this._checked ? this.value || 'on' : null);
    this._validate();
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

  /** Simulates a click on the control. */
  public override click() {
    this.input.click();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
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
    this._kbFocus.reset();
  }

  protected handleFocus() {
    this._dirty = true;
  }
}
