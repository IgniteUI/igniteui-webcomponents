import { property } from 'lit/decorators.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { FormValueTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { MaskBehaviorMixin } from '#internals/mixins/mask-behavior.js';
import { renderMaskedNativeInput } from '#internals/templates/masked-input.js';
import { all } from '#themes/input/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { IgcInputBaseComponent } from '../input/input-base.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import type { MaskInputValueMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { MaskParser } from './mask-parser.js';
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

/* blazorSupportsVisualChildren */
/* blazorIndirectRender */
/**
 * An input field that restricts user input to a mask pattern and formats the visible value.
 *
 * @element igc-mask-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot bad-input - Renders content when the value does not fill the required positions of the mask.
 * @slot custom-error - Renders content when a custom message is set with `setCustomValidity()`.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control receives user input.
 * @fires igcChange - Emitted when the user commits a change to the value of the control.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 * @csspart prefixed - Added to the container and the input when an element that is not hidden is in the prefix slot.
 * @csspart suffixed - Added to the container and the input when an element that is not hidden is in the suffix slot.
 * @csspart filled - Added to the container and the input when the control has a value.
 * @csspart labelled - Added to the container in the material theme when the control has a label.
 * @csspart start - The wrapper of the prefix in the material theme.
 * @csspart notch - The wrapper of the label in the material theme.
 * @csspart filler - The outline segment between the notch and the end in the material theme.
 * @csspart end - The wrapper of the suffix in the material theme.
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */

export default class IgcMaskInputComponent extends MaskBehaviorMixin(
  IgcInputBaseComponent
) {
  public static readonly tagName = 'igc-mask-input';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcMaskInputComponent, IgcValidationContainerComponent);
  }

  //#region Internal attributes and properties

  protected override readonly _parser = new MaskParser();

  protected override get __validators() {
    return maskValidators;
  }

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  private static readonly _transformers: Partial<
    FormValueTransformers<string>
  > = {
    // Not `_maskedValue`, which keeps the empty mask after the user empties the control.
    setFormValue: (_, host) => (host as IgcMaskInputComponent).value || null,
    reads: ['valueMode', 'mask', 'prompt'],
  };

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
    transformers: IgcMaskInputComponent._transformers,
  });

  /** The last value written. A `mask` or `prompt` change before the first update reads it again. */
  private _setupValue = '';

  /** The last text written or edited, and its prompt. A prompt change draws the text from it again. */
  private _source = { text: '', prompt: this._parser.prompt };

  //#endregion

  //#region Public attributes and properties

  /**
   * The format of the `value` and of the submitted form value:
   *
   * - `raw`: The input without the mask literals and prompts (e.g. "5551234567")
   * - `withFormatting`: The input with the mask formatting (e.g. "(555) 123-4567")
   *
   * An empty value is always an empty string, regardless of the value mode.
   * @attr value-mode
   * @default 'raw'
   */
  @property({ attribute: 'value-mode' })
  public valueMode: MaskInputValueMode = 'raw';

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control. Its format depends on `valueMode`.
   *
   * An empty value is always an empty string, regardless of the value mode.
   *
   * @attr
   */
  @property()
  public set value(string: string) {
    const value = string ?? '';
    const raw = this._parser.rawValue(value);
    this._setupValue = value;

    // A write of the current value, as a React wrapper does on each render, keeps the text.
    if (value !== this.value || raw !== this._formValue.value) {
      this._showText(value);
    }

    this._formValue.setValueAndFormState(raw);
  }

  public get value(): string {
    const value = this._formValue.value;

    if (this.valueMode === 'raw') {
      return value;
    }
    return value ? this._maskedValue : value;
  }

  /**
   * The mask pattern of the control.
   *
   * @attr
   * @default 'CCCCCCCCCC'
   */
  @property()
  public override set mask(value: string) {
    const previous = this._parser.mask;
    this._parser.mask = value;

    if (this._parser.mask === previous) {
      return;
    }

    if (!this.hasUpdated) {
      this._applySetupValue();
      return;
    }

    // A bare write of the new raw value. The `reads` hook submits it.
    this._reapplyMask();
    this._writeFrom('normalize', () => {
      this._formValue.value = this._parser.parse(this._maskedValue);
    });
  }

  public override get mask(): string {
    return this._parser.mask;
  }

  /**
   * The prompt symbol to use for unfilled parts of the mask pattern.
   *
   * @attr
   * @default '_'
   */
  @property()
  public override set prompt(value: string) {
    const previous = this._parser.prompt;
    this._parser.prompt = value;

    if (this._parser.prompt === previous) {
      return;
    }

    if (!this.hasUpdated) {
      this._applySetupValue();
      return;
    }

    // The source keeps the positions, also of a character that matches the new prompt.
    const { text, prompt } = this._source;
    this._maskedValue = this._parser.apply(text, prompt);

    if (!this._focused) {
      this._updateMaskDisplay();
    }
  }

  public override get prompt(): string {
    return this._parser.prompt;
  }

  //#endregion

  //#region Event handlers

  protected _handleDragEnter(): void {
    if (!this._focused && !this._formValue.value) {
      this._maskedValue = this._parser.emptyMask;
    }
  }

  protected override _handleBlur(): void {
    this._focused = false;
    this._updateMaskDisplay();
    super._handleBlur();
  }

  protected _handleChange(): void {
    this._emitTouchedEvent('igcChange', { detail: this.value });
  }

  //#endregion

  //#region Internal methods

  /** Not through the `value` setter, which also empties a focused empty mask. */
  protected override _commitMaskedValue(value: string): void {
    this._maskedValue = value;
    this._source = { text: value, prompt: this._parser.prompt };
    this._formValue.setValueAndFormState(this._parser.parse(value));
    this._setupValue = this._formValue.value;

    // Only `setRangeText` gets here unfocused. An emptied mask then reads as empty, as after a blur.
    if (!this._focused) {
      this._updateMaskDisplay();
    }
  }

  protected override _emitInputEvent(): void {
    this._emitTouchedEvent('igcInput', { detail: this.value });
  }

  /** Shows a value in the current mask. An empty mask shows the placeholder. */
  private _showText(value: string): void {
    this._maskedValue = this._parser.apply(value);
    this._source = { text: value, prompt: this._parser.prompt };
    this._updateMaskDisplay();
  }

  /** Reads the setup value again with the current mask and prompt. The `reads` hook submits it. */
  private _applySetupValue(): void {
    const value = this._setupValue;

    if (value) {
      this._showText(value);
      this._writeFrom('normalize', () => {
        this._formValue.value = this._parser.rawValue(value);
      });
    }
  }

  /** Shows the default first: the setter keeps the text of the same raw value, and validation reads it. */
  protected override _restoreDefaultValue(): void {
    this._showText(this._formValue.defaultValue);
    super._restoreDefaultValue();
  }

  /** Shows the value, or the empty mask of a focused control, in a new mask. */
  private _reapplyMask(): void {
    if (this._formValue.value || this._maskedValue) {
      this._maskedValue = this._parser.apply(this._formValue.value);
    }

    this._source = { text: this._maskedValue, prompt: this._parser.prompt };

    if (!this._focused) {
      this._updateMaskDisplay();
    }
  }

  protected override _isValueEmpty(): boolean {
    return !this._formValue.value;
  }

  /** An empty mask shows the placeholder while unfocused. */
  protected override _updateMaskDisplay(): void {
    if (this._isEmptyMask) {
      this._maskedValue = '';
    }
  }

  //#endregion

  //#region Public methods

  /* blazorSuppress */
  /**
   * Returns whether the current masked input is valid according to the mask pattern.
   * An empty control is valid. The `required` validator checks it.
   */
  public isValidMaskPattern(): boolean {
    return (
      !this._formValue.value || this._parser.isValidString(this._maskedValue)
    );
  }

  //#endregion

  protected override _renderInput() {
    return renderMaskedNativeInput(this, {
      id: this._inputId,
      partNames: this._resolvePartNames('input'),
      value: this._maskedValue,
      placeholder: this.placeholder ?? this._parser.escapedMask,
      autofocus: this.autofocus,
      inputMode: this.inputMode,
      aria: this._ariaTarget.resolveBindings(),
      ...this._maskInputBindings,
      onChange: this._handleChange,
      onDragEnter: this._handleDragEnter,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-mask-input': IgcMaskInputComponent;
  }
}
