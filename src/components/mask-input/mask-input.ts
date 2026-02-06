import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import { bindIf } from '../common/util.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import { all } from '../input/themes/themes.js';
import type { MaskInputValueMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import {
  IgcMaskInputBaseComponent,
  type MaskSelection,
} from './mask-input-base.js';
import { maskValidators } from './validators.js';

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'bad-input',
  'custom-error',
  'invalid'
);

/**
 * A masked input is an input field where a developer can control user input and format the visible value,
 * based on configurable rules
 *
 * @element igc-mask-input
 *
 * @slot prefix - Renders content before the input
 * @slot suffix - Renders content after the input
 * @slot helper-text - Renders content below the input
 * @slot value-missing - Renders content when the required validation fails.
 * @slot bad-input - Renders content when a required mask pattern validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control receives user input
 * @fires igcChange - Emitted when an alteration of the control's value is committed by the user
 *
 * @csspart container - The main wrapper that holds all main input elements
 * @csspart input - The native input element
 * @csspart label - The native label element
 * @csspart prefix - The prefix wrapper
 * @csspart suffix - The suffix wrapper
 * @csspart helper-text - The helper text wrapper
 */
export default class IgcMaskInputComponent extends IgcMaskInputBaseComponent {
  public static readonly tagName = 'igc-mask-input';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcMaskInputComponent, IgcValidationContainerComponent);
  }

  //#region Internal attributes and properties

  protected override get __validators() {
    return maskValidators;
  }

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
    transformers: {
      setFormValue: (value) =>
        this._isRawMode ? value || null : this._maskedValue || null,
    },
  });

  protected get _isRawMode(): boolean {
    return this.valueMode === 'raw';
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw`: Returns clean input (e.g. "5551234567")
   * - `withFormatting`: Returns with mask formatting (e.g. "(555) 123-4567")
   *
   * Empty values always return an empty string, regardless of the value mode.
   * @attr value-mode
   * @default 'raw'
   */
  @property({ attribute: 'value-mode' })
  public valueMode: MaskInputValueMode = 'raw';

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value will return an empty string.
   *
   * @attr
   */
  @property()
  public set value(string: string) {
    const value = string ?? '';
    this._maskedValue = this._parser.apply(value);
    this._updateMaskedValue();
    this._formValue.setValueAndFormState(value);
  }

  public get value(): string {
    const value = this._formValue.value;

    if (this._isRawMode) {
      return value;
    }
    return value ? this._maskedValue : value;
  }

  /**
   * The masked pattern of the component.
   *
   * @attr
   * @default 'CCCCCCCCCC'
   */
  @property()
  public override set mask(value: string) {
    super.mask = value;
    if (this.value) {
      this._maskedValue = this._parser.apply(this._formValue.value);
    }
  }

  public override get mask(): string {
    return super.mask;
  }

  /**
   * The prompt symbol to use for unfilled parts of the mask pattern.
   *
   * @attr
   * @default '_'
   */
  @property()
  public override set prompt(value: string) {
    super.prompt = value;
    if (this.value) {
      this._maskedValue = this._parser.apply(this._formValue.value);
    }
  }

  public override get prompt(): string {
    return super.prompt;
  }

  //#endregion

  //#region Event handlers

  protected _handleDragEnter(): void {
    if (!this._focused && !this._formValue.value) {
      this._maskedValue = this._parser.emptyMask;
    }
  }

  protected _handleDragLeave(): void {
    if (!this._focused) {
      this._updateMaskedValue();
    }
  }

  protected async _handleFocus(): Promise<void> {
    this._focused = true;

    if (this.readOnly) {
      return;
    }

    if (!this._formValue.value) {
      // In case of empty value, select the whole mask
      this._maskedValue = this._parser.emptyMask;

      await this.updateComplete;
      this.select();
    }
  }

  protected override _handleBlur(): void {
    this._focused = false;
    this._updateMaskedValue();
    super._handleBlur();
  }

  protected _handleChange(): void {
    this._setTouchedState();
    this.emitEvent('igcChange', { detail: this.value });
  }

  //#endregion

  //#region Internal methods

  protected override _restoreDefaultValue(): void {
    const value = this.defaultValue as string;

    this._maskedValue = this._parser.apply(value);
    this._updateMaskedValue();
    this._formValue.setValueAndFormState(value);
  }

  protected async _updateInput(
    text: string,
    { start, end }: MaskSelection
  ): Promise<void> {
    const result = this._parser.replace(this._maskedValue, text, start, end);

    this._maskedValue = result.value;
    this._formValue.setValueAndFormState(this._parser.parse(this._maskedValue));
    this.requestUpdate();

    if (start !== this.mask.length) {
      this.emitEvent('igcInput', { detail: this.value });
    }

    await this.updateComplete;
    this._input?.setSelectionRange(result.end, result.end);
  }

  protected override _updateSetRangeTextValue(): void {
    this.value = this._parser.parse(this._maskedValue);
  }

  private _updateMaskedValue(): void {
    if (this._maskedValue === this._parser.emptyMask) {
      this._maskedValue = '';
    }
  }

  //#endregion

  //#region Public methods

  /* blazorSuppress */
  /** Returns whether the current masked input is valid according to the mask pattern. */
  public isValidMaskPattern(): boolean {
    return this._parser.isValidString(this._maskedValue);
  }

  //#endregion

  protected override _renderInput() {
    const hasNegativeTabIndex = this.getAttribute('tabindex') === '-1';
    const hasHelperText = this._slots.hasAssignedElements('helper-text');

    return html`
      <input
        id=${this._inputId}
        type="text"
        part=${partMap(this._resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        .value=${live(this._maskedValue)}
        .placeholder=${this.placeholder ?? this._parser.escapedMask}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?autofocus=${this.autofocus}
        inputmode=${ifDefined(this.inputMode)}
        tabindex=${bindIf(hasNegativeTabIndex, -1)}
        aria-describedby=${bindIf(hasHelperText, 'helper-text')}
        @dragenter=${this._handleDragEnter}
        @dragleave=${this._handleDragLeave}
        @dragstart=${this._setMaskSelection}
        @blur=${this._handleBlur}
        @focus=${this._handleFocus}
        @cut=${this._setMaskSelection}
        @change=${this._handleChange}
        @click=${this._handleClick}
        @compositionstart=${this._handleCompositionStart}
        @compositionend=${this._handleCompositionEnd}
        @input=${this._handleInput}
        @keydown=${this._setMaskSelection}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-mask-input': IgcMaskInputComponent;
  }
}
