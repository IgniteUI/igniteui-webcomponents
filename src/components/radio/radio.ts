import { html, LitElement } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { themes } from '../../theming/theming-decorator.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  any,
  createCounter,
  isLTR,
  partNameMap,
  wrap,
} from '../common/util.js';
import { styles } from './themes/light/radio.base.css.js';
import { styles as bootstrap } from './themes/light/radio.bootstrap.css.js';
import { styles as fluent } from './themes/light/radio.fluent.css.js';
import { styles as indigo } from './themes/light/radio.indigo.css.js';
import { styles as material } from './themes/light/radio.material.css.js';
import { FormAssociatedMixin } from '../common/mixins/form-associated.js';
import messages from '../common/localization/validation-en.js';

export interface IgcRadioEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

const arrowKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const arrowKeyDelta = new Map(
  Object.entries({
    ArrowUp: () => -1,
    ArrowLeft: (ltr?: boolean) => (ltr ? -1 : 1),
    ArrowRight: (ltr?: boolean) => (ltr ? 1 : -1),
    ArrowDown: () => 1,
  })
);

type RadioQueryResult = {
  /** All the radio components under the same name */
  radios: IgcRadioComponent[];
  /** All the radio components under the same name which are not disabled */
  nonDisabled: IgcRadioComponent[];
  /** All the radio components under the same name except the caller */
  siblings: IgcRadioComponent[];
};

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
@themes({ material, bootstrap, fluent, indigo })
export default class IgcRadioComponent extends FormAssociatedMixin(
  EventEmitterMixin<IgcRadioEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-radio';
  protected static styles = styles;
  private static readonly increment = createCounter();

  private inputId = `radio-${IgcRadioComponent.increment()}`;
  private labelId = `radio-label-${this.inputId}`;

  @query('input[type="radio"]', true)
  protected input!: HTMLInputElement;

  @queryAssignedNodes({ flatten: true })
  protected label!: Array<Node>;

  @state()
  private _tabIndex = 0;

  @state()
  private focused = false;

  @state()
  protected hideLabel = false;

  private get radioGroup(): RadioQueryResult {
    const radios: IgcRadioComponent[] = Array.from(
      document.querySelectorAll(`${this.tagName}[name='${this.name}']`)
    );
    return {
      radios,
      nonDisabled: radios.filter((r) => !r.disabled),
      siblings: radios.filter((r) => !r.isSameNode(this)),
    };
  }

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
   * The label position of the radio control.
   * @attr label-position
   */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  /**
   * Sets the aria-labelledby attribute for the radio control.
   * @attr
   */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  public ariaLabelledby!: string;

  constructor() {
    super();
    this.addEventListener('keyup', this.handleKeyUp);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  /** Simulates a click on the radio control. */
  public override click() {
    this.input.click();
  }

  /** Sets focus on the radio control. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the radio control. */
  @alternateName('blurComponent')
  public override blur() {
    this.input.blur();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public override setCustomValidity(message: string): void {
    const { radios } = this.radioGroup;

    for (const radio of radios) {
      radio.updateValidity(message);
      radio.invalid = !radio.checkValidity();
    }
  }

  @watch('required', { waitUntilFirstUpdate: true })
  protected override requiredChange(): void {
    const { radios } = this.radioGroup;
    for (const radio of radios) {
      radio.updateValidity();
      radio.invalid = !this.checkValidity();
    }
  }

  @watch('checked')
  protected checkedChanged() {
    if (this.checked) {
      const { siblings } = this.radioGroup;
      for (const radio of siblings) {
        radio.checked = false;
        radio._tabIndex = -1;
        radio.updateValidity();
        radio.setInvalidState();
      }
      this.setFormValue(this.value || 'on');
      this.input?.focus();
      this._tabIndex = 0;
    } else {
      if (this.hasUpdated) {
        this._tabIndex = -1;
      }
      this.setFormValue(null);
    }
    this.updateValidity();
    this.setInvalidState();
  }

  protected override handleFormReset(): void {
    const { radios } = this.radioGroup;
    const defaultChecked = radios.find((r) => r.hasAttribute('checked'));
    if (defaultChecked) {
      defaultChecked.checked = true;
    } else {
      for (const radio of radios) {
        radio.checked = false;
        radio._tabIndex = 0;
        radio.updateValidity();
      }
    }
  }

  protected override updateValidity(message = ''): void {
    const flags: ValidityStateFlags = {};
    let msg = '';
    const { radios } = this.radioGroup;

    if (any(radios, 'required') && !any(radios, 'checked')) {
      flags.valueMissing = true;
      msg = messages.required;
    }

    if (message) {
      flags.customError = true;
      msg = message;
    }

    this.setValidity(flags, msg);
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

  protected handleKeyDown(event: KeyboardEvent) {
    if (!arrowKeys.has(event.key)) return;

    event.preventDefault();

    const { nonDisabled } = this.radioGroup;
    const LTR = isLTR(this);
    const idx = wrap(
      0,
      nonDisabled.length - 1,
      nonDisabled.indexOf(this) + arrowKeyDelta.get(event.key)!(LTR)
    );

    const target = nonDisabled[idx];
    target.focus();
    target.checked = true;
    target.emitEvent('igcChange', { detail: target.checked });
  }

  protected handleSlotChange() {
    this.hideLabel = this.label.length < 1;
  }

  protected override render() {
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
          aria-labelledby=${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}
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
