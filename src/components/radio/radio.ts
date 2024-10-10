import { LitElement, type TemplateResult, html } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  createCounter,
  isEmpty,
  isLTR,
  last,
  partNameMap,
  wrap,
} from '../common/util.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/radio.base.css.js';
import { styles as shared } from './themes/shared/radio.common.css.js';
import { all } from './themes/themes.js';
import { getGroup } from './utils.js';
import { radioValidators } from './validators.js';

export interface RadioChangeEventArgs {
  checked: boolean;
  value?: string;
}

export interface IgcRadioComponentEventMap {
  igcChange: CustomEvent<RadioChangeEventArgs>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/**
 * @element igc-radio
 *
 * @slot - The radio label.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 *
 * @csspart base - The radio control base wrapper.
 * @csspart control - The radio input control.
 * @csspart label - The radio control label.
 */
@themes(all)
export default class IgcRadioComponent extends FormAssociatedCheckboxRequiredMixin(
  EventEmitterMixin<IgcRadioComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-radio';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRadioComponent, IgcValidationContainerComponent);
  }

  private static readonly increment = createCounter();

  protected override get __validators() {
    return radioValidators;
  }

  private inputId = `radio-${IgcRadioComponent.increment()}`;
  private labelId = `radio-label-${this.inputId}`;
  private _kbFocus = addKeyboardFocusRing(this);

  protected _checked = false;
  protected _value!: string;

  @query('input[type="radio"]')
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  private _tabIndex = 0;

  @state()
  protected hideLabel = false;

  /** Returns all radio elements from the group, that is having the same name property. */
  private get _radios() {
    return getGroup(this).radios;
  }

  /** All sibling radio elements of the one invoking the getter. */
  private get _siblings() {
    return getGroup(this).siblings;
  }

  /** All non-disabled radio elements from the group. */
  private get _active() {
    return getGroup(this).active;
  }

  /** All checked radio elements from the group. */
  private get _checkedRadios() {
    return getGroup(this).checked;
  }

  @property({ type: Boolean, reflect: true })
  public override set required(value: boolean) {
    super.required = value;

    if (this.hasUpdated) {
      for (const radio of this._siblings) {
        radio._validate();
      }
    }
  }

  public override get required(): boolean {
    return this._required;
  }

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
    if (this._checked) {
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
    if (this.hasUpdated) {
      this._checked ? this._updateCheckedState() : this._updateUncheckedState();
    }
  }

  public get checked(): boolean {
    return this._checked;
  }

  /**
   * The label position of the radio control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set(arrowLeft, () => this.navigate(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this.navigate(isLTR(this) ? 1 : -1))
      .set(arrowUp, () => this.navigate(-1))
      .set(arrowDown, () => this.navigate(1));
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => {
      this.hideLabel = isEmpty(this.label);
    });
    return root;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this._checked && this === last(this._checkedRadios)
      ? this._updateCheckedState()
      : this._updateValidity();
  }

  /** Simulates a click on the radio control. */
  public override click() {
    this.input.click();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the radio control. */
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the radio control. */
  public override blur() {
    this.input.blur();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public override setCustomValidity(message: string): void {
    for (const radio of this._radios) {
      radio._validate(message);
    }
  }

  private _updateCheckedState() {
    this._setFormValue(this.value || 'on');
    this._validate();

    this._tabIndex = 0;
    this.input?.focus();

    for (const radio of this._siblings) {
      radio.checked = false;
      radio._tabIndex = -1;
      radio._validate();
    }
  }

  private _updateUncheckedState() {
    this._setFormValue(null);
    this._validate();

    this._tabIndex = -1;

    for (const radio of this._siblings) {
      radio._updateValidity();
    }
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this._resetTabIndexes();
  }

  /** Called after a form reset callback to restore default keyboard navigation. */
  private _resetTabIndexes() {
    for (const radio of this._radios) {
      radio._tabIndex = 0;
    }
  }

  protected handleClick(event: PointerEvent) {
    event.stopPropagation();

    if (this.checked) {
      return;
    }

    this.checked = true;
    this.emitEvent('igcChange', {
      detail: {
        checked: this.checked,
        value: this.value,
      },
    });
  }

  protected handleBlur() {
    this._kbFocus.reset();
  }

  protected navigate(idx: number) {
    const active = this._active;
    const nextIdx = wrap(0, active.length - 1, active.indexOf(this) + idx);
    const radio = active[nextIdx];

    radio.focus();
    radio.checked = true;
    radio.emitEvent('igcChange', {
      detail: { checked: radio.checked, value: radio.value },
    });
  }

  protected renderValidatorContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');
    const checked = this.checked;

    return html`
      <label
        part=${partNameMap({
          base: true,
          checked,
          focused: this._kbFocus.focused,
        })}
        for=${this.inputId}
        @pointerdown=${this._kbFocus.reset}
      >
        <input
          id=${this.inputId}
          type="radio"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .required=${this.required}
          .disabled=${this.disabled}
          .checked=${live(checked)}
          tabindex=${this._tabIndex}
          aria-checked=${checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${labelledBy ? labelledBy : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
        />
        <span part=${partNameMap({ control: true, checked })}>
          <span
            .hidden=${this.disabled}
            part=${partNameMap({ ripple: true, checked })}
          ></span>
        </span>
        <span
          .hidden=${this.hideLabel}
          part=${partNameMap({ label: true, checked })}
          id=${this.labelId}
        >
          <slot></slot>
        </span>
      </label>
      ${this.renderValidatorContainer()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio': IgcRadioComponent;
  }
}
