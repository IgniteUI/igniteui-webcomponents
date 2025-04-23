import { LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';

import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  type FormValue,
  createFormValueState,
  defaultBooleanTransformers,
} from '../common/mixins/forms/form-value.js';
import { isEmpty } from '../common/util.js';
import type { ToggleLabelPosition } from '../types.js';
import { checkBoxValidators } from './validators.js';

export interface IgcCheckboxChangeEventArgs {
  checked: boolean;
  value?: string;
}

/** @deprecated since 5.4.0. Use IgcCheckboxChangeEventArgs instead */
export type CheckboxChangeEventArgs = IgcCheckboxChangeEventArgs;

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

  protected _kbFocus = addKeyboardFocusRing(this);
  protected override _formValue: FormValue<boolean>;
  protected _value!: string;

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

  constructor() {
    super();

    this._formValue = createFormValueState(this, {
      initialValue: false,
      transformers: defaultBooleanTransformers,
    });
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    this.hideLabel = isEmpty(this.label);

    root.addEventListener('slotchange', () => {
      this.hideLabel = isEmpty(this.label);
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

  protected handleClick(event: PointerEvent) {
    event.stopPropagation();

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
