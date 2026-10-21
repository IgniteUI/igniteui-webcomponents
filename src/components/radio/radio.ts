import { html, LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { helperText } from '#internals/controllers/aria-projection.js';
import { addKeyboardFocusRing } from '#internals/controllers/focus-ring.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import {
  addSlotController,
  DefaultSlot,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { FormValueBooleanTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { renderToggleShell } from '#internals/templates/toggle-shell.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
import { all } from '#themes/radio/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { ToggleLabelPosition } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { addRadioGroupController, getGroupMembers } from './controller.js';
import { styles } from './themes/radio.base.css.js';
import { styles as shared } from './themes/shared/radio.common.css.js';
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
 * Lets the user select one option from a set. Radios with the same `name`
 * form a group, and only one radio of the group is checked.
 *
 * @element igc-radio
 *
 * @slot - The radio label.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the checked state of the control changes by user interaction.
 *
 * @csspart base - The radio control base wrapper.
 * @csspart control - The circle of the radio.
 * @csspart label - The radio control label.
 * @csspart ripple - The highlight around the circle on hover and focus. A disabled radio hides it.
 * @csspart checked - Added to the base, control, label and ripple parts when the radio is checked.
 * @csspart focused - Added to the base part when the radio has keyboard focus.
 */
export default class IgcRadioComponent extends FormAssociatedCheckboxRequiredMixin(
  EventEmitterMixin<IgcRadioComponentEventMap>(LitElement)
) {
  public static readonly tagName = 'igc-radio';
  public static override styles = [componentBase, styles, shared];

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

  /** All radios of the group, in DOM order. */
  private get _radios(): IgcRadioComponent[] {
    return getGroupMembers(this);
  }

  private get _activeRadios(): IgcRadioComponent[] {
    return this._radios.filter((radio) => !radio.disabled);
  }

  /** All radios of the group except this one. Yields, so it copies nothing. */
  private *_siblings(): Generator<IgcRadioComponent> {
    for (const radio of this._radios) {
      if (radio !== this) {
        yield radio;
      }
    }
  }

  private _isLastChecked(): boolean {
    return this._radios.findLast((radio) => radio.checked) === this;
  }

  /**
   * Whether the group of the radio is required. A required group fails
   * validation while none of its radios is checked.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public override set required(value: boolean) {
    super.required = value;

    if (this.hasUpdated) {
      for (const radio of this._siblings()) {
        radio._validate();
      }
    }
  }

  public override get required(): boolean {
    return this._required;
  }

  /**
   * The value of the control, submitted when the control is checked.
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
   * Whether the control is checked. A checked radio clears the other radios
   * of its group.
   * @attr
   */
  @property({ type: Boolean })
  public set checked(value: boolean) {
    const previous = this.checked;

    this._formValue.setValueAndFormState(value);
    if (this.hasUpdated && this.checked) {
      this._updateCheckedState();
    }

    // A change of the selection moves the tab stop of the group.
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
    // A new name moves this radio to another group.
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

    if (this.checked && this._isLastChecked()) {
      for (const radio of this._siblings()) {
        radio.checked = false;
        radio.defaultChecked = false;
      }
    } else {
      this._validate();
    }
  }

  protected _handleSlotChange(): void {
    this._hideLabel = !this._slots.hasAssignedNodes(DefaultSlot, true);
  }

  /** Focuses and checks the radio, as a native radio label does. */
  protected override _handleLabelActivation(): void {
    this._input.focus();
    this._input.click();
  }

  protected override _setDefaultValue(current: string | null): void {
    // The value is null when the `checked` attribute is removed. `isDefined`
    // accepts null, which checks the radio again on a form reset.
    this._formValue.defaultValue = isString(current);
    for (const radio of this._siblings()) {
      radio.defaultChecked = false;
    }
  }

  /**
   * Skips the `checked` setter, which unchecks the siblings that the same
   * `form.reset()` pass already restored.
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

  /**
   * Checks the validity of the whole group. Each invalid radio of the group
   * emits `invalid`.
   */
  public override checkValidity(): boolean {
    for (const radio of this._siblings()) {
      radio._checkValidity();
    }

    return this._checkValidity();
  }

  /**
   * Checks the validity of the group. An invalid radio emits `invalid` and
   * takes the focus. It shows its own validation messages, not the message of
   * the browser.
   */
  public override reportValidity(): boolean {
    for (const radio of this._siblings()) {
      radio._reportValidity();
    }

    return super.reportValidity();
  }

  /**
   * Sets a custom validation message on every radio of the group. The radios
   * are invalid while `message` is not empty.
   */
  public override setCustomValidity(message: string): void {
    for (const radio of this._radios) {
      radio._validate(message);
      radio.requestUpdate();
    }
  }

  private _updateCheckedState(): void {
    for (const radio of this._siblings()) {
      radio.checked = false;
    }
  }

  protected override formResetCallback(): void {
    super.formResetCallback();
    this._group.sync();
    this.updateComplete.then(() => this._validate());
  }

  protected override formAssociatedCallback(form: HTMLFormElement): void {
    super.formAssociatedCallback(form);

    // A new form owner moves this radio to another group.
    this._group.updateMembership();
  }

  protected _handleClick(event: PointerEvent) {
    event.stopPropagation();
    this._setTouchedState();

    if (this.checked) {
      return;
    }

    this.checked = true;
    this._input.focus();
    this._emitChange(this);
  }

  protected _navigate(radio: IgcRadioComponent): void {
    this._setTouchedState();
    radio.focus();
    radio.checked = true;
    this._emitChange(radio);
  }

  private _emitChange(radio: IgcRadioComponent): void {
    radio.emitEvent('igcChange', {
      detail: { checked: radio.checked, value: radio.value },
    });
  }

  protected override render() {
    const checked = this.checked;

    return html`
      ${renderToggleShell(this, {
        type: 'radio',
        inputId: this._inputId,
        labelId: this._labelId,
        baseParts: {
          base: true,
          checked,
          focused: this._focusRingManager.focused,
        },
        controlParts: { control: true, checked },
        labelParts: { label: true, checked },
        renderControl: () => html`
          <span
            part=${partMap({ ripple: true, checked })}
            ?hidden=${this.disabled}
          ></span>
        `,
        hideLabel: this._hideLabel,
        tabindex: this._tabIndex,
        description: helperText(this, this._slots),
        onClick: this._handleClick,
        onKeyDown: this._handleEnterKeydown,
      })}
      ${IgcValidationContainerComponent.create(this)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio': IgcRadioComponent;
  }
}
