import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { registerComponent } from '../common/definitions/register.js';
import {
  type FormValueOf,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import { isEmpty } from '../common/util.js';
import type { InputType, RangeTextSelectMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { IgcInputBaseComponent } from './input-base.js';
import { numberValidators, stringValidators } from './validators.js';

/**
 * @element igc-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot type-mismatch - Renders content when the a type url/email input pattern validation fails.
 * @slot pattern-mismatch - Renders content when the pattern validation fails.
 * @slot too-long - Renders content when the maxlength validation fails.
 * @slot too-short - Renders content when the minlength validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot step-mismatch - Renders content when the step validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
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
    registerComponent(IgcInputComponent, IgcValidationContainerComponent);
  }

  protected override readonly _formValue: FormValueOf<string> =
    createFormValueState(this, { initialValue: '' });

  protected override get __validators() {
    return this.type !== 'number' ? stringValidators : numberValidators;
  }

  private _min?: number;
  private _max?: number;
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: string;
  private _step?: number;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
    this._validate();
  }

  public get value(): string {
    return this._formValue.value;
  }

  /* alternateName: displayType */
  /**
   * The type attribute of the control.
   * @attr
   */
  @property({ reflect: true })
  public type: InputType = 'text';

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
  public set pattern(value: string | undefined) {
    this._pattern = value;
    this._validate();
  }

  public get pattern(): string | undefined {
    return this._pattern;
  }

  /**
   * The minimum string length required by the control.
   * @attr minlength
   */
  @property({ type: Number, attribute: 'minlength' })
  public set minLength(value: number | undefined) {
    this._minLength = value;
    this._validate();
  }

  public get minLength(): number | undefined {
    return this._minLength;
  }

  /**
   * The maximum string length of the control.
   * @attr maxlength
   */
  @property({ type: Number, attribute: 'maxlength' })
  public set maxLength(value: number | undefined) {
    this._maxLength = value;
    this._validate();
  }

  public get maxLength(): number | undefined {
    return this._maxLength;
  }

  /**
   * The min attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public set min(value: number | undefined) {
    this._min = value;
    this._validate();
  }

  public get min(): number | undefined {
    return this._min;
  }

  /**
   * The max attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public set max(value: number | undefined) {
    this._max = value;
    this._validate();
  }

  public get max(): number | undefined {
    return this._max;
  }

  /**
   * The step attribute of the control.
   * @attr
   */
  @property({ type: Number })
  public set step(value: number | undefined) {
    this._step = value;
    this._validate();
  }

  public get step(): number | undefined {
    return this._step;
  }

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

  /* blazorSuppress */
  /** Replaces the selected text in the input. */
  public override setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: RangeTextSelectMode = 'preserve'
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
    this._validate();
  }

  protected renderInput() {
    return html`
      <input
        id=${this.inputId}
        part=${partMap(this.resolvePartNames('input'))}
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
        aria-describedby=${ifDefined(
          isEmpty(this._helperText) ? nothing : 'helper-text'
        )}
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
