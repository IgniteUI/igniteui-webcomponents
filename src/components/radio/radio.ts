import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addKeyboardFocusRing } from '#internals/controllers/focus-ring.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { FormValueBooleanTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { lastOf } from '#internals/utils/arrays.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { ToggleLabelPosition } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { addRadioGroupController, getGroupMembers } from './controller.js';
import { styles } from './themes/radio.base.css.js';
import { styles as shared } from './themes/shared/radio.common.css.js';
import { all } from './themes/themes.js';
import { radioValidators } from './validators.js';

export interface IgcRadioChangeEventArgs {
  checked: boolean;
  value?: string;
}

export interface IgcRadioComponentEventMap {
  igcChange: CustomEvent<IgcRadioChangeEventArgs>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

const nextId = createIdGenerator('radio');

/**
 * The radio component allows the user to select a single option from an available set of options that are listed side by side.
 *
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
export default class IgcRadioComponent extends FormAssociatedCheckboxRequiredMixin(
  EventEmitterMixin<IgcRadioComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-radio';
  protected static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcRadioComponent, IgcValidationContainerComponent);
  }

  protected override get __validators() {
    return radioValidators;
  }

  private readonly _inputId = nextId();
  private readonly _labelId = `radio-label-${this._inputId}`;
  private readonly _focusRingManager = addKeyboardFocusRing(this);

  /**
   * Keeps the roving tab index of the group. The checked radio is the only tab
   * stop. If the group has no selection, each radio is a tab stop.
   */
  private readonly _group = addRadioGroupController(this, (hasCheckedRadio) => {
    this._tabIndex = !hasCheckedRadio || this.checked ? 0 : -1;
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots('helper-text', 'value-missing', 'custom-error', 'invalid'),
    onChange: this._handleSlotChange,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: false,
    transformers: FormValueBooleanTransformers,
  });

  protected _value!: string;

  @query('input', true)
  protected readonly _input!: HTMLInputElement;

  @state()
  protected _hideLabel = true;

  @state()
  private _tabIndex = 0;

  /** All radios of the group, that is having the same name property, in DOM order. */
  private get _radios(): IgcRadioComponent[] {
    return getGroupMembers(this);
  }

  /** All radios of the group except the one that invokes the getter. */
  private get _siblings(): IgcRadioComponent[] {
    return this._radios.filter((radio) => radio !== this);
  }

  /** All radios of the group that are not disabled. */
  private get _activeRadios(): IgcRadioComponent[] {
    return this._radios.filter((radio) => !radio.disabled);
  }

  /** All radios of the group that are checked. */
  private get _checkedRadios(): IgcRadioComponent[] {
    return this._radios.filter((radio) => radio.checked);
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
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
    if (this.checked) {
      this._formValue.setValueAndFormState(this.checked);
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
    const previous = this.checked;

    this._formValue.setValueAndFormState(value);
    if (this.hasUpdated && this.checked) {
      this._updateCheckedState();
    }

    // The tab stop is a state of the group, so a change of the selection derives it
    // again. A write of the same state leaves the group as it is.
    if (this.checked !== previous) {
      this._group.sync();
    }
  }

  public get checked(): boolean {
    return this._formValue.value;
  }

  /**
   * The label position of the radio control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: ToggleLabelPosition = 'after';

  constructor() {
    super();

    addThemingController(this, all);

    addRovingFocusController(this, {
      keybindings: {
        skip: () => this.disabled,
        bindingDefaults: { preventDefault: true, repeat: true },
      },
      vertical: true,
      homeEnd: false,
      items: () => this._activeRadios,
      current: () => this,
      focusItem: (radio) => this._navigate(radio),
    });
  }

  protected override willUpdate(properties: PropertyValues<this>): void {
    // The name is the identity of a group, so a new name moves this radio to another one.
    if (properties.has('name')) {
      this._group.updateMembership();
    }

    // The tab stop of the group depends on which of its radios are disabled.
    if (properties.has('disabled')) {
      this._group.sync();
    }
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;

    if (this.checked && this === lastOf(this._checkedRadios)) {
      for (const radio of this._siblings) {
        radio.checked = false;
        radio.defaultChecked = false;
      }
    } else {
      this._validate();
    }
  }

  protected _handleSlotChange(): void {
    this._hideLabel = !this._slots.hasAssignedNodes('[default]', true);
  }

  protected override _setDefaultValue(current: string | null): void {
    // The base mixin passes 'true' if the `checked` attribute is present, and null
    // if it is removed. `isDefined` would accept null as present and check the radio
    // again on a form reset.
    this._formValue.defaultValue = isString(current);
    for (const radio of this._siblings) {
      radio.defaultChecked = false;
    }
  }

  /**
   * Restores the default state without the `checked` setter. That setter unchecks all
   * siblings, which damages the state of the radios that the browser already reset in
   * the same `form.reset()` pass.
   */
  protected override _restoreDefaultValue(): void {
    const checked = this.checked;
    this._formValue.setValueAndFormState(this.defaultChecked);
    this.requestUpdate('checked', checked);
  }

  /** Simulates a click on the radio control. */
  public override click(): void {
    this._input.click();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the radio control. */
  public override focus(options?: FocusOptions): void {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the radio control. */
  public override blur(): void {
    this._input.blur();
  }

  private _checkValidity(): boolean {
    return super.checkValidity();
  }

  private _reportValidity(): boolean {
    return super.reportValidity();
  }

  /** Checks for validity of the control and emits the invalid event if it's invalid. */
  public override checkValidity(): boolean {
    for (const radio of this._siblings) {
      radio._checkValidity();
    }

    return this._checkValidity();
  }

  /** Checks for validity of the control and shows the browser message if it's invalid. */
  public override reportValidity(): boolean {
    for (const radio of this._siblings) {
      radio._reportValidity();
    }

    return this._reportValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public override setCustomValidity(message: string): void {
    for (const radio of this._radios) {
      radio._validate(message);
      radio.requestUpdate();
    }
  }

  private _updateCheckedState(): void {
    for (const radio of this._siblings) {
      radio.checked = false;
    }
  }

  protected override formResetCallback(): void {
    super.formResetCallback();
    this._group.sync();
    this.updateComplete.then(() => this._validate());
  }

  protected _handleClick(event: PointerEvent) {
    event.stopPropagation();
    this._setTouchedState();

    if (this.checked) {
      return;
    }

    this.checked = true;
    this._input.focus();
    this.emitEvent('igcChange', {
      detail: {
        checked: this.checked,
        value: this.value,
      },
    });
  }

  protected _navigate(radio: IgcRadioComponent): void {
    this._setTouchedState();
    radio.focus();
    radio.checked = true;
    radio.emitEvent('igcChange', {
      detail: { checked: radio.checked, value: radio.value },
    });
  }

  protected override render() {
    const labelledBy = this.getAttribute('aria-labelledby');
    const describedBy = this._slots.hasAssignedElements('helper-text')
      ? 'helper-text'
      : nothing;
    const checked = this.checked;

    return html`
      <label
        part=${partMap({
          base: true,
          checked,
          focused: this._focusRingManager.focused,
        })}
        for=${this._inputId}
      >
        <input
          id=${this._inputId}
          type="radio"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          .checked=${live(checked)}
          tabindex=${this._tabIndex}
          aria-labelledby=${labelledBy ? labelledBy : this._labelId}
          aria-describedby=${describedBy}
          @click=${this._handleClick}
          @keydown=${this._handleEnterKeydown}
        />
        <span part=${partMap({ control: true, checked })}>
          <span
            part=${partMap({ ripple: true, checked })}
            ?hidden=${this.disabled}
          ></span>
        </span>
        <span
          id=${this._labelId}
          part=${partMap({ label: true, checked })}
          ?hidden=${this._hideLabel}
        >
          <slot></slot>
        </span>
      </label>
      ${this._renderValidationContainer()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio': IgcRadioComponent;
  }
}
