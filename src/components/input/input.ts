import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { IgcInputBaseComponent } from './input-base.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import {
  Validator,
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

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
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

  /**
   * The value of the control.
   * @attr
   */
  @property()
  @blazorTwoWayBind('igcChange', 'detail')
  public set value(value: string) {
    this._value = value;
    this.setFormValue(value ? value : null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get value() {
    return this._value;
  }

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

  // TODO: Deprecate
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
  @property()
  public pattern!: string;

  /**
   * The minimum string length required by the control.
   * @attr minlength
   */
  @property({ type: Number, attribute: 'minlength' })
  public minLength!: number;

  /**
   * The minlength attribute of the control.
   * @prop
   *
   * @deprecated - since v4.4.0
   * Use the `minLength` property instead.
   */
  @property({ attribute: false })
  public get minlength() {
    return this.minLength;
  }

  public set minlength(value: number) {
    this.minLength = value;
  }

  /**
   * The maximum string length of the control.
   * @attr maxlength
   */
  @property({ type: Number, attribute: 'maxlength' })
  public maxLength!: number;

  /**
   * The maxlength attribute of the control.
   * @prop
   *
   * @deprecated - since v4.4.0
   * Use the `maxLength` property instead.
   */
  @property({ attribute: false })
  public get maxlength() {
    return this.maxLength;
  }

  public set maxlength(value: number) {
    this.maxLength = value;
  }

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

  protected override handleFocus(): void {
    this._dirty = true;
    super.handleFocus();
  }

  protected override handleBlur(): void {
    this.checkValidity();
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
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        tabindex=${this.tabIndex}
        autocomplete=${ifDefined(this.autocomplete as any)}
        inputmode=${ifDefined(this.inputmode)}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        minlength=${ifDefined(this.minLength)}
        maxlength=${ifDefined(this.maxLength)}
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
