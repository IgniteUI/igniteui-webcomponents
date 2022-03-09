import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { ReactiveTheme, ThemeController, themes } from '../../theming';
import { alternateName, blazorTwoWayBind, watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable';
import { partNameMap } from '../common/util';
import { styles } from './themes/light/input.base.css';
import { styles as bootstrap } from './themes/light/input.bootstrap.css';
import { styles as fluent } from './themes/light/input.fluent.css';
import { styles as indigo } from './themes/light/input.indigo.css';
import { styles as material } from './themes/light/input.material.css';

let nextId = 0;

type Direction = 'ltr' | 'rtl' | 'auto';

/**
 * @element igc-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
@themes({ bootstrap, material, fluent, indigo })
export default class IgcInputComponent
  extends SizableMixin(
    EventEmitterMixin<IgcInputEventMap, Constructor<LitElement>>(LitElement)
  )
  implements ReactiveTheme
{
  public static readonly tagName = 'igc-input';
  public static styles = styles;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  private inputId = `input-${nextId++}`;
  private labelId = `input-label-${this.inputId}`;

  @state()
  private _prefixLength!: number;

  @state()
  private _suffixLength!: number;

  private themeController!: ThemeController;

  @query('input', true)
  private input!: HTMLInputElement;

  @queryAssignedElements({ slot: 'prefix' })
  private _prefix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private _suffix!: Array<HTMLElement>;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: Direction = 'auto';

  /** The type attribute of the control. */
  @alternateName('displayType')
  @property({ reflect: true })
  public type:
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'url' = 'text';

  /** The input mode attribute of the control. */
  @property()
  public inputmode!:
    | 'none'
    | 'txt'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';

  /** The pattern attribute of the control. */
  @property({ type: String })
  public pattern!: string;

  /** Controls the validity of the control. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  /** The minlength attribute of the control. */
  @property({ type: Number })
  public minlength!: number;

  /** The maxlength attribute of the control. */
  @property({ type: Number })
  public maxlength!: number;

  /** The min attribute of the control. */
  @property()
  public min!: number | string;

  /** The max attribute of the control. */
  @property()
  public max!: number | string;

  /** The step attribute of the control. */
  @property({ type: Number })
  public step!: number;

  /** The autofocus attribute of the control. */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /** The autocomplete attribute of the control. */
  @property()
  public autocomplete!: string;

  constructor() {
    super();
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.shadowRoot?.addEventListener('slotchange', (_) => {
      this._prefixLength = this._prefix.length;
      this._suffixLength = this._suffix.length;
    });
  }

  public themeAdopted(controller: ThemeController) {
    this.themeController = controller;
  }

  /** Checks for validity of the control and shows the browser message if it's invalid. */
  public reportValidity() {
    return this.input.reportValidity();
  }

  /** Replaces the selected text in the input. */
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    super.setRangeText(replacement, start, end, selectMode);
    this.value = this.input.value;
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  /** Selects all text within the input. */
  public select() {
    return this.input.select();
  }

  /** Increments the numeric value of the input by one or more steps. */
  public stepUp(n?: number) {
    this.input.stepUp(n);
    this.handleChange();
  }

  /** Decrements the numeric value of the input by one or more steps. */
  public stepDown(n?: number) {
    this.input.stepDown(n);
    this.handleChange();
  }

  private handleInvalid() {
    this.invalid = true;
  }

  private handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected handleValueChange() {
    this.updateComplete.then(
      () => (this.invalid = !this.input.checkValidity())
    );
  }

  protected renderInput() {
    return html`
      <input
        id="${this.inputId}"
        part="${partNameMap(this.resolvePartNames('input'))}"
        name="${ifDefined(this.name)}"
        type="${ifDefined(this.type)}"
        pattern="${ifDefined(this.pattern)}"
        placeholder="${this.placeholder ?? ' '}"
        .value="${live(this.value)}"
        ?readonly="${this.readonly}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        ?autofocus="${this.autofocus}"
        autocomplete="${ifDefined(this.autocomplete as any)}"
        inputmode="${ifDefined(this.inputmode)}"
        min="${ifDefined(this.min)}"
        max="${ifDefined(this.max)}"
        minlength="${ifDefined(this.minlength)}"
        maxlength="${ifDefined(this.maxlength)}"
        step="${ifDefined(this.step)}"
        aria-invalid="${this.invalid ? 'true' : 'false'}"
        @invalid="${this.handleInvalid}"
        @change="${this.handleChange}"
        @input="${this.handleInput}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
      />
    `;
  }

  private renderLabel() {
    return this.label
      ? html`<label id="${this.labelId}" part="label" for="${this.inputId}">
          ${this.label}
        </label>`
      : null;
  }

  private renderPrefix() {
    return html`<div part="prefix">
      <slot name="prefix"></slot>
    </div>`;
  }

  private renderSuffix() {
    return html`<div part="suffix">
      <slot name="suffix"></slot>
    </div>`;
  }

  private renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>`;
  }

  private renderMaterial() {
    return html`
      <div
        part="${partNameMap({
          ...this.resolvePartNames('container'),
          labelled: this.label,
        })}"
      >
        <div part="start">${this.renderPrefix()}</div>
        ${this.renderInput()}
        <div part="notch">${this.renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  protected override render() {
    return html`${this.themeController.theme === 'material'
      ? this.renderMaterial()
      : this.renderStandard()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-input': IgcInputComponent;
  }
}
