import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import IgcButtonComponent from '../button/button.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  type FormValue,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import { isEmpty, partNameMap } from '../common/util.js';
import type { RangeTextSelectMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { IgcInputBaseComponent } from './input-base.js';
import { numberValidators, stringValidators } from './validators.js';

/**
 * @element igc-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 * @slot file-selector-text - Renders content for the browse button when input type is file.
 * @slot file-missing-text - Renders content when input type is file and no file is chosen.
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
 * @csspart file-names - The file names wrapper when input type is 'file'.
 * @csspart file-selector-button - The browse button when input type is 'file'.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcInputComponent extends IgcInputBaseComponent {
  public static readonly tagName = 'igc-input';

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcInputComponent,
      IgcValidationContainerComponent,
      IgcButtonComponent
    );
  }

  protected override _formValue: FormValue<string>;

  protected override get __validators() {
    return this.type !== 'number' ? stringValidators : numberValidators;
  }

  private _min?: number;
  private _max?: number;
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: string;
  private _step?: number;

  private get _fileNames(): string | null {
    if (!this.files || this.files.length === 0) return null;

    return Array.from(this.files)
      .map((file) => file.name)
      .join(', ');
  }

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
  public type:
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'file'
    | 'url' = 'text';

  /**
   * The multiple attribute of the control.
   * Used to indicate that a file input allows the user to select more than one file.
   * @attr
   */
  @property({ type: Boolean })
  public multiple = false;

  /**
   * The accept attribute of the control.
   * Defines the file types as a list of comma-separated values that the file input should accept.
   * @attr
   */
  @property({ type: String })
  public accept = '';

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

  constructor() {
    super();
    this._formValue = createFormValueState(this, { initialValue: '' });
  }

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

  public get files(): FileList | null {
    if (this.type !== 'file' || !this.input) return null;
    return this.input.files;
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

  protected renderFileParts() {
    if (this.type !== 'file') return nothing;

    return html`
      <div part="file-parts">
        <div part="file-selector-button">
          <igc-button variant="flat" ?disabled=${this.disabled} tabindex="-1">
            <slot name="file-selector-text">Browse</slot>
          </igc-button>
        </div>
        <div part="file-names">
          ${this._fileNames ??
          html`<slot name="file-missing-text">No file chosen</slot>`}
        </div>
      </div>
    `;
  }

  protected renderInput() {
    return html`
      <input
        id=${this.inputId}
        part=${partNameMap(this.resolvePartNames('input'))}
        class="native-input"
        name=${ifDefined(this.name)}
        type=${ifDefined(this.type)}
        pattern=${ifDefined(this.pattern)}
        placeholder=${ifDefined(this.placeholder)}
        .value=${live(this.value)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        ?multiple=${this.type === 'file' && this.multiple}
        tabindex=${this.tabIndex}
        autocomplete=${ifDefined(this.autocomplete as any)}
        inputmode=${ifDefined(this.inputMode)}
        min=${ifDefined(this.validateOnly ? undefined : this.min)}
        max=${ifDefined(this.validateOnly ? undefined : this.max)}
        minlength=${ifDefined(this.minLength)}
        maxlength=${ifDefined(this.validateOnly ? undefined : this.maxLength)}
        step=${ifDefined(this.step)}
        accept=${ifDefined(this.type !== 'file' ? undefined : this.accept)}
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
