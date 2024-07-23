import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import {
  type Validator,
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  patternValidator,
  requiredNumberValidator,
  requiredValidator,
  stepValidator,
  urlValidator,
} from '../common/validators.js';
import { IgcInputBaseComponent } from './input-base.js';

/**
 * @element igc-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
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

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcInputComponent);
  }

  private get isStringType() {
    return this.type !== 'number';
  }

  protected override validators: Validator<this>[] = [
    {
      ...requiredValidator,
      isValid: () =>
        this.isStringType
          ? requiredValidator.isValid(this)
          : requiredNumberValidator.isValid(this),
    },
    {
      ...minLengthValidator,
      isValid: () =>
        this.isStringType ? minLengthValidator.isValid(this) : true,
    },
    {
      ...maxLengthValidator,
      isValid: () =>
        this.isStringType ? maxLengthValidator.isValid(this) : true,
    },
    {
      ...minValidator,
      isValid: () => (this.isStringType ? true : minValidator.isValid(this)),
    },
    {
      ...maxValidator,
      isValid: () => (this.isStringType ? true : maxValidator.isValid(this)),
    },
    {
      ...stepValidator,
      isValid: () => (this.isStringType ? true : stepValidator.isValid(this)),
    },
    {
      ...patternValidator,
      isValid: () =>
        this.isStringType ? patternValidator.isValid(this) : true,
    },
    {
      key: 'typeMismatch',
      isValid: () => {
        switch (this.type) {
          case 'email':
            return emailValidator.isValid(this);
          case 'url':
            return urlValidator.isValid(this);
          default:
            return true;
        }
      },
      message: () =>
        (this.type === 'email'
          ? emailValidator.message
          : urlValidator.message) as string,
    },
  ];

  protected _value = '';

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value ?? '';
    this.setFormValue(value ? value : null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get value() {
    return this._value;
  }

  /* alternateName: displayType */
  /**
   * The type attribute of the control.
   * @attr
   */
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
   * See [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   * @attr inputmode
   */
  @property({ attribute: 'inputmode' })
  public override inputMode!: string;

  /**
   * The pattern attribute of the control.
   * @attr
   */
  @property()
  public pattern!: string;

  /**
   * The minimum string length required by the control.
   * @attr minlength
   */
  @property({ type: Number, attribute: 'minlength' })
  public minLength!: number;

  /**
   * The maximum string length of the control.
   * @attr maxlength
   */
  @property({ type: Number, attribute: 'maxlength' })
  public maxLength!: number;

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

  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property for
   * string-type inputs or allows spin buttons to exceed the predefined `min/max` limits for number-type inputs.
   *
   * @attr validate-only
   */
  @property({ type: Boolean, reflect: true, attribute: 'validate-only' })
  public validateOnly = false;

  /**
   * @internal
   */
  @property({ type: Number })
  public override tabIndex = 0;

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('minLength', { waitUntilFirstUpdate: true })
  @watch('maxLength', { waitUntilFirstUpdate: true })
  @watch('pattern', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected constraintsChanged() {
    this.updateValidity();
  }

  /** @hidden */
  public override connectedCallback() {
    super.connectedCallback();
    this.setFormValue(this._value ? this._value : null);
    this.updateValidity();
  }

  /* blazorSuppress */
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

  /** Selects all text within the input. */
  public select() {
    return this.input.select();
  }

  /** Increments the numeric value of the input by one or more steps. */
  public stepUp(n?: number) {
    this.input.stepUp(n);
    this.value = this.input.value;
  }

  /** Decrements the numeric value of the input by one or more steps. */
  public stepDown(n?: number) {
    this.input.stepDown(n);
    this.value = this.input.value;
  }

  private handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  private handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleFocus(): void {
    this._dirty = true;
  }

  protected handleBlur(): void {
    this.checkValidity();
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
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        tabindex=${this.tabIndex}
        autocomplete=${ifDefined(this.autocomplete as any)}
        inputmode=${ifDefined(this.inputMode)}
        min=${ifDefined(this.validateOnly ? undefined : this.min)}
        max=${ifDefined(this.validateOnly ? undefined : this.max)}
        minlength=${ifDefined(this.minLength)}
        maxlength=${ifDefined(this.validateOnly ? undefined : this.maxLength)}
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
