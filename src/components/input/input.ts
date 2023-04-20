import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { partNameMap, format, asNumber, isDefined } from '../common/util.js';
import { IgcInputBaseComponent } from './input-base.js';
import messages from '../common/localization/validation-en.js';

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

  /**
   * The value of the control.
   * @attr
   */
  @property()
  @blazorTwoWayBind('igcChange', 'detail')
  public value = '';

  /**
   * The type attribute of the control.
   * @attr
   */
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

  /**
   * The input mode attribute of the control.
   * @attr
   */
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

  /**
   * The pattern attribute of the control.
   * @attr
   */
  @property({ type: String })
  public pattern!: string;

  /**
   * The minlength attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public minlength!: number;

  /**
   * The maxlength attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public maxlength!: number;

  /**
   * The min attribute of the control.
   * @attr
   */
  @property()
  public min!: number | string;

  /**
   * The max attribute of the control.
   * @attr
   */
  @property()
  public max!: number | string;

  /**
   * The step attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public step!: number;

  /**
   * The autofocus attribute of the control.
   * @attr
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * The autocomplete attribute of the control.
   * @attr
   */
  @property()
  public autocomplete!: string;

  @property({ type: Number })
  public override tabIndex = 0;

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('minlength', { waitUntilFirstUpdate: true })
  @watch('maxlength', { waitUntilFirstUpdate: true })
  @watch('pattern', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected constraintsChanged() {
    this.updateValidity();
  }

  @watch('value')
  protected valueChange() {
    const value = this.value ? this.value : null;
    this.setFormValue(value, value);
    this.updateValidity();
    this.setInvalidState();
  }

  private numberValidation(message: string) {
    const flags: ValidityStateFlags = {};
    let msg = '';

    const hasValue = isDefined(this.value);
    const valueAsNumber = asNumber(this.value);

    if (this.required && !hasValue) {
      flags.valueMissing = true;
      msg = messages.required;
    }

    if (isDefined(this.min) && hasValue && valueAsNumber < asNumber(this.min)) {
      flags.rangeUnderflow = true;
      msg = format(messages.min, `${this.min}`);
    }

    if (isDefined(this.max) && hasValue && valueAsNumber > asNumber(this.max)) {
      flags.rangeOverflow = true;
      msg = format(messages.max, `${this.max}`);
    }

    if (
      isDefined(this.step) &&
      hasValue &&
      (valueAsNumber - asNumber(this.min)) % asNumber(this.step, 1) !== 0
    ) {
      flags.stepMismatch = true;
      msg = `Value does not conform to step constrain`;
    }

    if (message) {
      flags.customError = true;
      msg = message;
    }

    this.setValidity(flags, msg);
  }

  private stringValidation(message: string) {
    const flags: ValidityStateFlags = {};
    let msg = '';

    if (this.required && !this.value) {
      flags.valueMissing = true;
      msg = messages.required;
    }

    if (this.minlength && this.value?.length < this.minlength) {
      flags.tooShort = true;
      msg = format(messages.minLength, `${this.minlength}`);
    }

    if (this.maxlength && this.value?.length > this.maxlength) {
      flags.tooLong = true;
      msg = format(messages.maxLength, `${this.maxlength}`);
    }

    if (this.pattern && !new RegExp(this.pattern, 'u').test(this.value)) {
      flags.patternMismatch = true;
      msg = messages.pattern;
    }

    if (message) {
      flags.customError = true;
      msg = message;
    }

    this.setValidity(flags, msg);
  }

  protected override updateValidity(message = '') {
    this.type === 'number'
      ? this.numberValidation(message)
      : this.stringValidation(message);
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this.value = this.getAttribute('value') ?? '';
    this.invalid = false;
  }

  /** Replaces the selected text in the input. */
  @blazorSuppress()
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    super.setRangeText(replacement, start, end, selectMode);
    this.value = this.input.value;
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

  private handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  private handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected override handleFocus(): void {
    this._dirty = true;
    super.handleFocus();
  }

  protected override handleBlur(): void {
    this.invalid = !this.checkValidity();
    super.handleBlur();
  }

  protected renderInput() {
    return html`
      <input
        id=${this.inputId}
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        type=${ifDefined(this.type)}
        pattern=${ifDefined(this.pattern)}
        placeholder=${ifDefined(this.placeholder)}
        .value=${live(this.value)}
        ?readonly=${this.readonly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        tabindex=${this.tabIndex}
        autocomplete=${ifDefined(this.autocomplete as any)}
        inputmode=${ifDefined(this.inputmode)}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        minlength=${ifDefined(this.minlength)}
        maxlength=${ifDefined(this.maxlength)}
        step=${ifDefined(this.step)}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-input': IgcInputComponent;
  }
}
