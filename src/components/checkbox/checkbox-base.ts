import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';

import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  createFormValueState,
  defaultBooleanTransformers,
  type FormValueOf,
} from '../common/mixins/forms/form-value.js';
import { isEmpty } from '../common/util.js';
import type { ToggleLabelPosition } from '../types.js';
import { checkBoxValidators } from './validators.js';

export interface IgcCheckboxChangeEventArgs {
  checked: boolean;
  value?: string;
}

export interface IgcCheckboxComponentEventMap {
  igcChange: CustomEvent<IgcCheckboxChangeEventArgs>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

@blazorDeepImport
export class IgcCheckboxBaseComponent extends FormAssociatedCheckboxRequiredMixin(
  EventEmitterMixin<IgcCheckboxComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  protected override get __validators() {
    return checkBoxValidators;
  }

  protected readonly _focusRingManager = addKeyboardFocusRing(this);
  protected override readonly _formValue: FormValueOf<boolean> =
    createFormValueState(this, {
      initialValue: false,
      transformers: defaultBooleanTransformers,
    });
  protected _value!: string;

  @query('input', true)
  protected readonly _input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected readonly _label!: Array<Node>;

  @state()
  protected _hideLabel = false;

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
    this._formValue.setValueAndFormState(value);
    this._validate();
  }

  public get checked(): boolean {
    return this._formValue.value;
  }

  /**
   * The label position of the control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: ToggleLabelPosition = 'after';

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    this._hideLabel = isEmpty(this._label);

    root.addEventListener('slotchange', () => {
      this._hideLabel = isEmpty(this._label);
    });

    return root;
  }

  /** Simulates a click on the control. */
  public override click(): void {
    this._input.click();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions): void {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur(): void {
    this._input.blur();
  }

  protected _handleClick(event: PointerEvent): void {
    event.stopPropagation();

    this.checked = !this.checked;
    this.emitEvent('igcChange', {
      detail: { checked: this.checked, value: this.value },
    });
  }

  protected _handleFocus(): void {
    this._dirty = true;
  }
}
