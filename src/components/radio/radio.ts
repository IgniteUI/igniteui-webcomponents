import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { addValueStateMotion } from '#animations/value-state.js';
import { helperText } from '#internals/controllers/aria-projection.js';
import { addKeyboardFocusRing } from '#internals/controllers/focus-ring.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import {
  addSlotController,
  DefaultSlot,
  setSlots,
} from '#internals/controllers/slot.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedCheckboxRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { FormValueBooleanTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { renderToggleShell } from '#internals/templates/toggle-shell.js';
import { isUserChange, markUserChange } from '#internals/user-change.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { all } from '#themes/radio/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { ToggleLabelPosition } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  addRadioGroupController,
  getGroupMembers,
  type RadioGroupState,
} from './controller.js';
import { styles } from './themes/radio.base.css.js';
import { styles as shared } from './themes/shared/radio.common.css.js';
import { isGroupValueMissing, radioValidators } from './validators.js';

const Slots = setSlots(
  'helper-text',
  'value-missing',
  'custom-error',
  'invalid'
);

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

/** The properties that the group of a radio depends on. */
const groupProperties = new Set<PropertyKey>([
  'name',
  'checked',
  'required',
  'disabled',
]);

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
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. In a radio group, only the last radio keeps the space. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
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

  //#region Internal state and properties

  protected override get __validators() {
    return radioValidators;
  }

  private readonly _inputId = nextId();
  private readonly _labelId = `radio-label-${this._inputId}`;
  private readonly _focusRingManager = addKeyboardFocusRing(this);

  /** The state of the group from its last sync. The required validator reads it. */
  private _groupState?: RadioGroupState;

  private readonly _group = addRadioGroupController(this, {
    onSync: (state) => {
      const previous = this._groupState;
      this._groupState = state;

      // The checked radio is the only tab stop. Without an enabled checked
      // radio, each radio is a tab stop.
      this._tabIndex = !state.hasEnabledCheckedRadio || this.checked ? 0 : -1;

      if (
        !previous ||
        isGroupValueMissing(state) !== isGroupValueMissing(previous)
      ) {
        this._validate();
      }
    },
    // As for a native radio, a checked radio that joins a group clears the rest.
    onJoin: () => {
      if (this.checked) {
        this._uncheckOthers();
      }
    },
  });

  private readonly _slots = addSlotController(this, { slots: Slots });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: false,
    transformers: FormValueBooleanTransformers,
  });

  @query('input', true)
  protected readonly _input!: HTMLInputElement;

  @state()
  private _tabIndex = 0;

  /** All radios of the group, in DOM order. */
  private get _radios(): IgcRadioComponent[] {
    return getGroupMembers(this);
  }

  private get _activeRadios(): IgcRadioComponent[] {
    return this._radios.filter((radio) => !radio.disabled);
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the group of the radio is required. A required group fails
   * validation while none of its radios is checked.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public override set required(value: boolean) {
    // The override gives the description of the group rule. The group follows
    // the change in `requestUpdate`.
    super.required = value;
  }

  public override get required(): boolean {
    return this._required;
  }

  /**
   * The value of the control, submitted when the control is checked.
   * @attr
   */
  @property()
  public value!: string;

  /* @tsTwoWayProperty(true, "igcChange", "detail.checked", false) */
  /**
   * Whether the control is checked. A checked radio clears the other radios
   * of its group.
   * @attr
   */
  @property({ type: Boolean })
  public set checked(value: boolean) {
    this._formValue.setValueAndFormState(value);
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

  //#endregion

  constructor() {
    super();

    addThemingController(this, all);
    addValueStateMotion(this, {
      watch: () => [this.checked, this.disabled],
    });

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

  //#region Lit lifecycle methods

  /** @internal */
  public override requestUpdate(
    ...args: Parameters<LitElement['requestUpdate']>
  ): void {
    super.requestUpdate(...args);
    const [name, previous] = args;

    // Lit calls this from the setter, at once, so the group follows each
    // write, as a native radio group does.
    if (
      name === undefined ||
      !groupProperties.has(name) ||
      Object.is(this[name as keyof this], previous)
    ) {
      return;
    }

    if (name === 'name') {
      this._group.updateMembership();
      return;
    }

    // A radio that becomes checked clears the other radios of its group.
    if (name === 'checked' && this.checked) {
      this._uncheckOthers();
    }
    this._group.sync();
  }

  //#endregion

  //#region Event handlers

  /** Focuses and checks the radio, as a native radio label does. */
  protected override _handleLabelActivation(): void {
    this._input.focus();
    this._input.click();
  }

  protected _handleClick(event: PointerEvent) {
    event.stopPropagation();

    if (this.checked) {
      this._setTouchedState();
      return;
    }

    this._writeFrom('user', () => {
      this.checked = true;
    });
    this._input.focus();
    this._emitChange(this);
  }

  //#endregion

  //#region Form integration

  protected override formAssociatedCallback(form: HTMLFormElement): void {
    super.formAssociatedCallback(form);

    // A new form owner moves this radio to another group.
    this._group.updateMembership();
  }

  private _checkValidity(): boolean {
    return super.checkValidity();
  }

  /**
   * Runs `check` on this radio and on the other radios of its group, in DOM
   * order. Returns the result of this radio.
   */
  private _checkWithGroup(
    check: (radio: IgcRadioComponent) => boolean
  ): boolean {
    let valid = true;

    for (const radio of this._radios) {
      const result = check(radio);
      if (radio === this) {
        valid = result;
      }
    }

    return valid;
  }

  //#endregion

  //#region Internal API

  /**
   * Unchecks the other radios of the group, as a native radio does. They stay
   * pristine, so a new default still applies to them. A radio that the user
   * checks animates them too.
   */
  private _uncheckOthers(): void {
    const byUser = isUserChange(this);

    for (const radio of getGroupMembers(this, false)) {
      if (radio !== this && radio.checked) {
        if (byUser) {
          markUserChange(radio);
        }
        radio._writeFrom('normalize', () => {
          radio.checked = false;
        });
      }
    }
  }

  protected _navigate(radio: IgcRadioComponent): void {
    this._setTouchedState();
    radio.focus();
    radio._writeFrom('user', () => {
      radio.checked = true;
    });
    this._emitChange(radio);
  }

  private _emitChange(radio: IgcRadioComponent): void {
    radio.emitEvent('igcChange', {
      detail: { checked: radio.checked, value: radio.value },
    });
  }

  //#endregion

  //#region Public API

  /** Simulates a click on the radio control. */
  public override click(): void {
    this._input.click();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the radio control. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the radio control. */
  public override blur(): void {
    cancelDeferredFocus(this);
    this._input?.blur();
  }

  /**
   * Checks the validity of the whole group. Each invalid radio of the group
   * emits `invalid`, in DOM order.
   */
  public override checkValidity(): boolean {
    return this._checkWithGroup((radio) => radio._checkValidity());
  }

  /**
   * Checks the validity of the whole group. Each invalid radio of the group
   * emits `invalid`, in DOM order. When this radio is invalid, it takes the
   * focus. It shows its own validation messages, not the message of the
   * browser.
   */
  public override reportValidity(): boolean {
    const valid = this._checkWithGroup((radio) => radio._reportValidity());

    if (!valid) {
      this.focus();
    }

    return valid;
  }

  /**
   * Sets a custom validation message on every radio that is in the group at
   * the time of the call. The radios are invalid while `message` is not empty.
   */
  public override setCustomValidity(message: string): void {
    for (const radio of getGroupMembers(this, false)) {
      radio._validate(message);
      radio.requestUpdate();
    }
  }

  //#endregion

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
        hideLabel: !this._slots.hasAssignedNodes(DefaultSlot, true),
        tabindex: this._tabIndex,
        description: helperText(this, this._slots),
        onClick: this._handleClick,
        onEnterKey: this._handleEnterKey,
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
