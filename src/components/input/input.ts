import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { partNameMap } from '../common/util.js';
import { IgcInputBaseComponent } from './input-base.js';

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
export default class IgcInputComponent extends IgcInputBaseComponent {
  public static readonly tagName = 'igc-input';

  @property()
  @blazorTwoWayBind('igcChange', 'detail')
  public value = '';

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

  private handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
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
        placeholder="${ifDefined(this.placeholder)}"
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
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-input': IgcInputComponent;
  }
}
