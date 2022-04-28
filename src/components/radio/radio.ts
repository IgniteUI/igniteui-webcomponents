import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { themes } from '../../theming/theming-decorator.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util.js';
import { styles } from './themes/light/radio.base.css.js';
import { styles as bootstrap } from './themes/light/radio.bootstrap.css.js';
import { styles as fluent } from './themes/light/radio.fluent.css.js';
import { styles as indigo } from './themes/light/radio.indigo.css.js';
import { styles as material } from './themes/light/radio.material.css.js';

let nextId = 0;

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
@themes({ material, bootstrap, fluent, indigo })
export default class IgcRadioComponent extends EventEmitterMixin<
  IgcRadioEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-radio';
  protected static styles = styles;

  private inputId = `radio-${nextId++}`;
  private labelId = `radio-label-${this.inputId}`;

  @query('input[type="radio"]', true)
  protected input!: HTMLInputElement;

  @state()
  private _tabIndex = 0;

  @state()
  private focused = false;

  /** The name attribute of the control. */
  @property()
  public name!: string;

  /** The value attribute of the control. */
  @property()
  public value!: string;

  /** Makes the control a required field. */
  @property({ type: Boolean, reflect: true })
  public required = false;

  /** The checked state of the control. */
  @property({ type: Boolean })
  @blazorTwoWayBind('igcChange', 'detail')
  public checked = false;

  /** Disables the radio control. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Controls the validity of the control. */
  @property({ type: Boolean, reflect: true })
  public invalid = false;

  /** The label position of the radio control. */
  @property({ reflect: true, attribute: 'label-position' })
  public labelPosition: 'before' | 'after' = 'after';

  /** Sets the aria-labelledby attribute for the radio control. */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  public ariaLabelledby!: string;

  /** Simulates a click on the radio control. */
  public override click() {
    this.input.click();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keyup', this.handleKeyUp);
  }

  public override disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
  }

  protected handleKeyUp() {
    if (!this.focused) {
      this.focused = true;
    }
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

  /** Checks for validity of the control and shows the browser message if it invalid. */
  public reportValidity() {
    this.input.reportValidity();
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  protected handleMouseDown(event: PointerEvent) {
    event.preventDefault();
    this.input.focus();
    this.focused = false;
  }

  protected handleClick() {
    this.checked = true;
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this.focused = false;
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  @watch('checked', { waitUntilFirstUpdate: true })
  protected handleChange() {
    if (this.checked) {
      this.getSiblings().forEach((radio) => {
        radio.checked = false;
        radio._tabIndex = -1;
      });
      this.input.focus();
      this._tabIndex = 0;
      this.emitEvent('igcChange', { detail: this.checked });
    } else {
      if (this.required) {
        this.required = false;
        this.getAllInGroup()[0].required = true;
      }
    }
  }

  protected getSiblings() {
    return this.getAllInGroup().filter(
      (radio) => radio.name === this.name && radio !== this
    );
  }

  protected getAllInGroup() {
    const group = this.closest('igc-radio-group');
    if (!group) return [];

    return Array.from<IgcRadioComponent>(group.querySelectorAll('igc-radio'));
  }

  protected override render() {
    return html`
      <label
        part="${partNameMap({
          base: true,
          checked: this.checked,
          focused: this.focused,
        })}"
        for="${this.inputId}"
        @pointerdown="${this.handleMouseDown}"
      >
        <input
          id="${this.inputId}"
          type="radio"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .required="${this.required}"
          .disabled="${this.disabled}"
          .checked="${live(this.checked)}"
          tabindex=${this._tabIndex}
          aria-checked="${this.checked ? 'true' : 'false'}"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-labelledby="${this.ariaLabelledby
            ? this.ariaLabelledby
            : this.labelId}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @focus="${this.handleFocus}"
        />
        <span
          part="${partNameMap({ control: true, checked: this.checked })}"
        ></span>
        <span
          part="${partNameMap({ label: true, checked: this.checked })}"
          id="${this.labelId}"
        >
          <slot></slot>
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
