import { LitElement, html } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import messages from '../common/localization/validation-en.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { createCounter, isLTR, partNameMap, wrap } from '../common/util.js';
import type { Validator } from '../common/validators.js';
import { styles } from './themes/radio.base.css.js';
import { styles as shared } from './themes/shared/radio.common.css.js';
import { all } from './themes/themes.js';
import { getGroup } from './utils.js';

export interface IgcRadioEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

/**
 * @element igc-radio
 *
 * @slot - The radio label.
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart base - The radio control base wrapper.
 * @csspart control - The radio control.
 * @csspart label - The radio control label.
 */
@themes(all)
export default class IgcRadioComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcRadioEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-radio';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRadioComponent);
  }

  private static readonly increment = createCounter();

  protected override validators: Validator<this>[] = [
    {
      key: 'valueMissing',
      message: messages.required,
      isValid: () => {
        const { radios, checked } = this.group;
        return radios.some((radio) => radio.required)
          ? checked.length > 0
          : true;
      },
    },
  ];

  private inputId = `radio-${IgcRadioComponent.increment()}`;
  private labelId = `radio-label-${this.inputId}`;

  protected _checked = false;
  protected _value!: string;

  @query('input[type="radio"]')
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  private _tabIndex = 0;

  @state()
  private focused = false;

  @state()
  protected hideLabel = false;

  private get group() {
    return getGroup(this);
  }

  protected override setDefaultValue(): void {
    this._defaultValue = this === this.group.checked[0];
  }

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
    if (this._checked) {
      this.setFormValue(this._value || 'on');
    }
  }

  public get value(): string {
    return this._value;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
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
    this.addEventListener('keyup', this.handleKeyUp);

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set(arrowLeft, () => this.navigate(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this.navigate(isLTR(this) ? 1 : -1))
      .set(arrowUp, () => this.navigate(-1))
      .set(arrowDown, () => this.navigate(1));
  }

  public override connectedCallback() {
    super.connectedCallback();

    this._checked = this === this.group.checked[0];
    this.updateValidity();
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
    const { radios } = this.group;

    for (const radio of radios) {
      radio.updateValidity(message);
      radio.setInvalidState();
    }
  }

  @watch('required', { waitUntilFirstUpdate: true })
  protected override requiredChange(): void {
    const { radios } = this.group;

    for (const radio of radios) {
      radio.updateValidity();
      radio.setInvalidState();
    }
  }

  private _updateCheckedState() {
    const { siblings } = this.group;

    this.setFormValue(this.value || 'on');
    this.updateValidity();
    this.setInvalidState();

    this._tabIndex = 0;
    this.input?.focus();

    for (const radio of siblings) {
      radio.checked = false;
      radio._tabIndex = -1;
      radio.updateValidity();
      radio.setInvalidState();
    }
  }

  private _updateUncheckedState() {
    const { siblings } = this.group;

    this.setFormValue(null);
    this.updateValidity();
    this.setInvalidState();

    if (this.hasUpdated) {
      this._tabIndex = -1;
    }

    for (const radio of siblings) {
      radio.updateValidity();
    }
  }

  protected handleMouseDown(event: PointerEvent) {
    event.preventDefault();
    this.input.focus();
    this.focused = false;
  }

  protected handleClick() {
    this.checked = true;
    this.emitEvent('igcChange', { detail: this.checked });
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this.focused = false;
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleKeyUp() {
    if (!this.focused) {
      this.focused = true;
    }
  }

  protected navigate(idx: number) {
    const { active } = this.group;
    const nextIdx = wrap(0, active.length - 1, active.indexOf(this) + idx);
    const radio = active[nextIdx];

    radio.focus();
    radio.checked = true;
    radio.emitEvent('igcChange', { detail: radio.checked });
  }

  protected handleSlotChange() {
    this.hideLabel = this.label.length < 1;
  }

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');

    return html`
      <label
        part=${partNameMap({
          base: true,
          checked: this.checked,
          focused: this.focused,
        })}
        for=${this.inputId}
        @pointerdown=${this.handleMouseDown}
      >
        <input
          id=${this.inputId}
          type="radio"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .required=${this.required}
          .disabled=${this.disabled}
          .checked=${live(this.checked)}
          tabindex=${this._tabIndex}
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-labelledby=${labelledBy ? labelledBy : this.labelId}
          @click=${this.handleClick}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
        />
        <span part=${partNameMap({ control: true, checked: this.checked })}>
          <span
            .hidden=${this.disabled}
            part=${partNameMap({ ripple: true, checked: this.checked })}
          ></span>
        </span>
        <span
          .hidden=${this.hideLabel}
          part=${partNameMap({ label: true, checked: this.checked })}
          id=${this.labelId}
        >
          <slot @slotchange=${this.handleSlotChange}></slot>
        </span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio': IgcRadioComponent;
  }
}
