import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseComboBoxComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  asNumber,
  bindIf,
  getElementFromPath,
  isEmpty,
  stopPropagation,
} from '../common/util.js';
import IgcDividerComponent from '../divider/divider.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcSelectComponent from '../select/select.js';
import type IgcSelectItemComponent from '../select/select-item.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { isValidColor } from './common.js';
import { ColorModel, getContext } from './model.js';
import IgcPickerCanvasComponent, {
  type PickerCanvasEventDetail,
} from './picker-canvas.js';
import { styles } from './themes/color-picker.base.css.js';
import { styles as shared } from './themes/shared/color-picker.common.css.js';
import { all } from './themes/themes.js';
import { colorPickerValidators } from './validators.js';

export interface IgcColorPickerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
}

const Slots = setSlots(
  'value-missing',
  'custom-error',
  'invalid',
  'helper-text'
);

/**
 * Color input component.
 *
 * Lets the user pick a color visually - via an HSV saturation/value canvas, a
 * hue slider and an optional alpha slider - or by typing a color string
 * (hex, rgb(a), hsl(a) or a named CSS color) directly. Supports pre-defined
 * swatches, the native EyeDropper API where available, and two anchor
 * presentations: a trigger button (`mode="default"`) or an editable text
 * field (`mode="input"`).
 *
 * @element igc-color-picker
 *
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 * @slot helper-text - Renders content below the picker.
 *
 * @fires igcOpening - Emitted just before the picker dropdown is open.
 * @fires igcOpened - Emitted after the picker dropdown is open.
 * @fires igcClosing - Emitted just before the picker dropdown is closed.
 * @fires igcClosed - Emitted after closing the picker dropdown.
 * @fires igcInput - Emitted when the value of the component is changed.
 * @fires igcChange - Emitted when the value of the component is committed.
 *
 * @csspart anchor - The trigger element that opens the picker (the button in default mode, or the swatch prefix in input mode).
 * @csspart empty - Applied alongside `anchor` when no color value is set, rendering a checkered background.
 * @csspart label - The label rendered above the anchor in default mode.
 * @csspart picker - The popover container holding the canvas, sliders, inputs and swatches.
 * @csspart main-row - The row containing the hue slider and the copy/eyedropper buttons.
 * @csspart alpha-row - The row containing the alpha slider and input, rendered when `show-alpha` is set.
 * @csspart inputs-row - The row containing the format select and the color value input.
 * @csspart buttons - The wrapper around the copy and eyedropper buttons.
 * @csspart hue - The hue slider.
 * @csspart alpha - The alpha slider.
 * @csspart copy - The button that copies the current color value to the clipboard.
 * @csspart eye-dropper - The button that activates the EyeDropper API.
 * @csspart format-select - The select control used to switch the color string format.
 * @csspart swatches - The container of the pre-defined color swatches.
 * @csspart swatch - An individual color swatch button.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcColorPickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcColorPickerEventMap,
    AbstractConstructor<IgcBaseComboBoxComponent>
  >(IgcBaseComboBoxComponent)
) {
  public static readonly tagName = 'igc-color-picker';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcColorPickerComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcFocusTrapComponent,
      IgcSelectComponent,
      IgcPickerCanvasComponent,
      IgcDividerComponent,
      IgcButtonComponent,
      IgcIconButtonComponent,
      IgcValidationContainerComponent,
      IgcVisuallyHiddenComponent
    );
  }

  //#region Internal state and properties

  protected override get __validators() {
    return colorPickerValidators;
  }

  protected readonly _slots = addSlotController(this, { slots: Slots });

  private readonly _themes = addThemingController(this, all);

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  private readonly _alphaRef = createRef<HTMLInputElement>();
  private readonly _canvasRef = createRef<IgcPickerCanvasComponent>();
  private readonly _hueRef = createRef<HTMLInputElement>();
  private readonly _anchorRef = createRef<
    HTMLButtonElement | IgcInputComponent
  >();

  private _supportsEyeDropper = 'EyeDropper' in globalThis;
  private _color = ColorModel.empty();
  private _oldValue = '';

  @state()
  private _ownCurrentColor = '';

  //#endregion

  //#region Public attributes and properties

  /**
   * The label of the component.
   *
   * In `mode="input"` this is forwarded to the anchor input's own label
   * instead of being rendered as a separate element.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The value of the component, as a CSS color string (hex, rgb(a), hsl(a)
   * or a named color).
   *
   * Setting an empty, whitespace-only or otherwise invalid string clears
   * the value.
   *
   * @attr value
   */
  @property()
  public set value(value: string) {
    this._color = ColorModel.parse(value);
    this._updateColor();
  }

  public get value(): string {
    return this._formValue.value;
  }

  /**
   * Sets the color format for the string value.
   *
   * @attr format
   * @default 'hex'
   */
  @property()
  public format: 'hex' | 'rgb' | 'hsl' = 'hex';

  /**
   * Whether to hide the format picker buttons.
   *
   * @attr hide-formats
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-formats' })
  public hideFormats = false;

  /**
   * Whether to show the alpha slider and input.
   *
   * @attr show-alpha
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-alpha' })
  public showAlpha = false;

  /**
   * The mode of the color picker.
   *
   * In `"default"` mode the anchor is a trigger button. In `"input"` mode
   * the anchor is an editable text field with a color swatch prefix that
   * also opens the picker.
   *
   * @attr mode
   * @default 'default'
   */
  @property()
  public mode: 'default' | 'input' = 'default';

  /**
   * Pre-defined color strings rendered as clickable swatches below the
   * picker controls. Clicking a swatch commits its color as the value.
   */
  @property({ attribute: false })
  public swatches: string[] = [];

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, { skip: () => this.disabled })
      .set(escapeKey, this._handleKeyboardClosing)
      .set([altKey, arrowDown], this._handleAnchorClick)
      .set([altKey, arrowUp], this._handleKeyboardClosing);
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('open')) {
      this._rootClickController.update();
    }

    super.update(props);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open') || properties.has('value')) {
      // Wait until the browser paints and then sync the marker position with the color.
      requestAnimationFrame(() => this._syncCanvasPosition());
    }
    this._forwardLabelElements();
  }

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    this._color = ColorModel.parse(this._formValue.value);
    this._updateColor();
    this._syncCanvasPosition();
  }

  //#endregion

  //#region Event handlers

  private _handleClosing(): void {
    this._hide(true);
  }

  private async _handleKeyboardClosing(): Promise<void> {
    if (await this._hide(true)) {
      this._anchorRef.value?.focus();
    }
  }

  private _handleFocusIn({ relatedTarget }: FocusEvent): void {
    if (!this.contains(relatedTarget as Node)) {
      this._oldValue = this.value;
    }
  }

  private _handleFocusOut({ relatedTarget }: FocusEvent): void {
    if (this.contains(relatedTarget as Node)) {
      return;
    }

    this._handleBlur();

    if (this.value !== this._oldValue) {
      this._oldValue = this.value;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  private _handleCanvasColorPicked(
    event: CustomEvent<PickerCanvasEventDetail>
  ): void {
    this._color.setSaturationAndValue(event.detail.x, 100 - event.detail.y);
    this._updateColor();
    this._emitInputEvent();
  }

  private _handleHueValueChange(event: Event): void {
    stopPropagation(event);

    this._color.h = asNumber(this._hueRef.value?.value);
    this._updateColor();
    this._emitInputEvent();
  }

  private _handleAlphaSliderValueChange(event: Event): void {
    stopPropagation(event);

    this._color.alpha = asNumber(this._alphaRef.value?.value) / 100;
    this._updateColor();
    this._emitInputEvent();
  }

  private _handleAlphaInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    this._color.alpha = asNumber(event.detail);
    this._updateColor();
    this._emitInputEvent();
  }

  private _handleFormatChange(
    event: CustomEvent<IgcSelectItemComponent>
  ): void {
    stopPropagation(event);

    this.format = event.detail.value as typeof this.format;
    this._updateColor();
  }

  private _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const input = event.target as IgcInputComponent;
    const value = event.detail;
    const cleared = !value?.trim();

    // A non-empty but invalid value reverts the input back to the currently
    // represented color. An empty value clears it.
    if (!cleared && !isValidColor(value, getContext())) {
      input.value = this._color.asString(this.format);
      return;
    }

    this._color = cleared ? ColorModel.empty() : ColorModel.parse(value);
    this._updateColor();
    this._syncCanvasPosition();
  }

  private _handleEyeDropperClick(): void {
    if (!this._supportsEyeDropper) return;

    const eyeDropper = new (globalThis as any).EyeDropper();

    eyeDropper
      .open()
      .then((result: { sRGBHex: string }) => {
        this.value = result.sRGBHex;
        this._syncCanvasPosition();
        this._emitInputEvent();
      })
      .catch(() => {});
  }

  private _handleCopy(): void {
    navigator.clipboard?.writeText(this.value).catch(() => {});
  }

  private _handleSwatchClick(event: Event): void {
    const color = getElementFromPath('button[part="swatch"]', event)?.ariaLabel;

    if (color) {
      this.value = color;
      this._syncCanvasPosition();
      this._emitInputEvent();
    }
  }

  //#endregion

  //#region Internal methods

  private _updateColor(): void {
    this._ownCurrentColor = `hsl(${this._color.h} 100% 50%)`;
    this.style.setProperty('--current-color', this._ownCurrentColor);
    this._formValue.setValueAndFormState(this._color.asString(this.format));
    this._validate();
    this.requestUpdate();
  }

  private _syncCanvasPosition(): void {
    if (!this._canvasRef.value || !this.open) return;

    const rect = this._canvasRef.value.getBoundingClientRect();
    const { width: markerWidth, height: markerHeight } =
      this._canvasRef.value.getMarkerDimensions();

    const [, s, v] = this._color.toHSV();
    const x = (s / 100) * rect.width - markerWidth;
    const y = ((100 - v) / 100) * rect.height - markerHeight;

    this._canvasRef.value.x = x;
    this._canvasRef.value.y = y;
  }

  private _emitInputEvent(): void {
    this.emitEvent('igcInput', { detail: this.value });
  }

  private _forwardLabelElements(): void {
    if (this.mode === 'input' && this._anchorRef.value) {
      const input = this._anchorRef.value as IgcInputComponent;
      input._labelElements = this._internals.labels;
    }
  }

  //#endregion

  //#region Canvas area rendering

  private _renderCanvasGradient(): TemplateResult {
    return html`
      <igc-picker-canvas
        ${ref(this._canvasRef)}
        @igcColorPicked=${this._handleCanvasColorPicked}
        currentColor=${this._ownCurrentColor}
      >
      </igc-picker-canvas>
    `;
  }

  //#endregion

  //#region Hue row and buttons rendering

  private _renderHueSlider(): TemplateResult {
    return html`
      <input
        ${ref(this._hueRef)}
        aria-label="Hue"
        type="range"
        part="hue"
        min="0"
        max="360"
        value=${String(this._color.h)}
        @input=${this._handleHueValueChange}
        @change=${stopPropagation}
      />
    `;
  }

  private _renderCopyButton(): TemplateResult {
    const style = styleMap({
      '--current-color': this._color.asString('rgb', true),
      '--border-color': 'transparent',
    });

    return html`
      <igc-icon-button
        variant="outlined"
        collection="default"
        name="copy_content"
        part="copy"
        @click=${this._handleCopy}
        style=${style}
      >
        <igc-visually-hidden>Copy color value to clipboard</igc-visually-hidden>
      </igc-icon-button>
    `;
  }

  private _renderEyeDropperButton(): TemplateResult {
    return html`
      <igc-icon-button
        part="eye-dropper"
        variant="outlined"
        ?disabled=${!this._supportsEyeDropper}
        @click=${this._handleEyeDropperClick}
      >
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 11.25L16.5 12.75L17.25 12V8.75798L19.5264 8.14802C20.019 8.01652 20.4847 7.75778 20.8712 7.37132C22.0428 6.19975 22.0428 4.30025 20.8712 3.12868C19.6996 1.95711 17.8001 1.95711 16.6286 3.12868C16.2421 3.51509 15.9832 3.98069 15.8517 4.47324L15.2416 6.74998H12L11.25 7.49998L12.75 8.99999M15 11.25L6.53033 19.7197C6.19077 20.0592 5.73022 20.25 5.25 20.25C4.76978 20.25 4.30924 20.4408 3.96967 20.7803L3 21.75L2.25 21L3.21967 20.0303C3.55923 19.6908 3.75 19.2302 3.75 18.75C3.75 18.2698 3.94077 17.8092 4.28033 17.4697L12.75 8.99999M15 11.25L12.75 8.99999"
            stroke="#0F172A"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <igc-visually-hidden>Pick a color from the screen</igc-visually-hidden>
      </igc-icon-button>
    `;
  }

  private _renderHueRowAndButtons(): TemplateResult {
    return html`
      ${this._renderHueSlider()}
      <div part="buttons">
        ${this._renderCopyButton()} ${this._renderEyeDropperButton()}
      </div>
    `;
  }

  //#endregion

  //#region Alpha row rendering

  private _renderAlphaRow(): TemplateResult | typeof nothing {
    return this.showAlpha
      ? html`
          <input
            ${ref(this._alphaRef)}
            aria-label="Alpha slider"
            type="range"
            part="alpha"
            min="0"
            max="100"
            value=${String(this._color.alpha * 100)}
            @input=${this._handleAlphaSliderValueChange}
            @change=${stopPropagation}
          />

          <igc-visually-hidden>
            <label for="alpha">Alpha value</label>
          </igc-visually-hidden>

          <igc-input
            id="alpha"
            name="alpha"
            placeholder="Alpha value"
            outlined
            type="number"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this._color.alpha)}
            @igcChange=${this._handleAlphaInputChange}
          ></igc-input>
        `
      : nothing;
  }

  //#endregion

  //#region Color formats and input row rendering

  private _renderSelect(): TemplateResult {
    return html`
      <igc-visually-hidden>
        <label for="format-select">Color format</label>
      </igc-visually-hidden>

      <igc-select
        id="format-select"
        part="format-select"
        placeholder="Color format"
        name="format"
        outlined
        .value=${this.format}
        @igcChange=${this._handleFormatChange}
      >
        <igc-select-item value="hex">Hex</igc-select-item>
        <igc-select-item value="rgb">RGB</igc-select-item>
        <igc-select-item value="hsl">HSL</igc-select-item>
      </igc-select>
    `;
  }

  private _renderFormats(): TemplateResult {
    return html`${cache(this.hideFormats ? nothing : this._renderSelect())}`;
  }

  private _renderInputsRow(): TemplateResult {
    return html`
      ${this._renderFormats()}
      <igc-visually-hidden>
        <label for="color-input"> Color value input </label>
      </igc-visually-hidden>

      <igc-input
        id="color-input"
        name="color-input"
        placeholder="Color value"
        outlined
        .value=${this._color.asString(this.format)}
        @igcChange=${this._handleColorInputChange}
      ></igc-input>
    `;
  }

  //#endregion

  //#region Swatches rendering

  private _renderSwatches(): TemplateResult | typeof nothing {
    return !isEmpty(this.swatches)
      ? html`
          <igc-divider></igc-divider>
          <div part="swatches" @click=${this._handleSwatchClick}>
            ${this.swatches.map(
              (color) => html`
                <button
                  type="button"
                  part="swatch"
                  aria-label="${color}"
                  style="background-color: ${color}"
                ></button>
              `
            )}
          </div>
        `
      : nothing;
  }

  //#endregion

  //#region Anchor rendering

  private _renderButtonAnchor(
    color: string,
    parts: ReturnType<typeof partMap>
  ): TemplateResult {
    return html`
      <button
        ${ref(this._anchorRef)}
        id="trigger"
        aria-haspopup="dialog"
        aria-describedby="color-picker-helper-text"
        part=${parts}
        slot="anchor"
        style=${bindIf(color, styleMap({ '--background': color }))}
        ?disabled=${this.disabled}
        @click=${this._handleAnchorClick}
        type="button"
      >
        <igc-visually-hidden>Open color picker</igc-visually-hidden>
      </button>
      <!--      TODO: DECIDE WHETHER WE ARE GOING TO USE SVG OR GRADIENT FOR THE TRANSPARENT GRID -->
      <!--      <svg-->
      <!--        slot="anchor"-->
      <!--        width="800px"-->
      <!--        height="800px"-->
      <!--        viewBox="0 0 15 15"-->
      <!--        fill="none"-->
      <!--        xmlns="http://www.w3.org/2000/svg"-->
      <!--      >-->
      <!--        <path-->
      <!--          opacity=".25"-->
      <!--          fill-rule="evenodd"-->
      <!--          clip-rule="evenodd"-->
      <!--          d="M0 0H3V3H0V0ZM6 3H3V6H0V9H3V12H0V15H3V12H6V15H9V12H12V15H15V12H12V9H15V6H12V3H15V0H12V3H9V0H6V3ZM6 6V3H9V6H6ZM6 9H3V6H6V9ZM9 9V6H12V9H9ZM9 9H6V12H9V9Z"-->
      <!--          fill="#000000"-->
      <!--        />-->
      <!--      </svg>-->
    `;
  }

  private _renderInputAnchor(
    color: string,
    parts: ReturnType<typeof partMap>
  ): TemplateResult {
    return html`
      <igc-input
        ${ref(this._anchorRef)}
        aria-haspopup="dialog"
        aria-describedby="color-picker-helper-text"
        slot="anchor"
        outlined
        label=${ifDefined(this.label)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        .value=${this.value}
        .invalid=${this.invalid}
        @igcChange=${this._handleColorInputChange}
      >
        <div
          slot="prefix"
          part=${parts}
          style=${styleMap({ background: color })}
          @click=${this._handleAnchorClick}
        ></div>
      </igc-input>
    `;
  }

  private _renderAnchor(
    color: string,
    parts: ReturnType<typeof partMap>,
    isDefaultMode: boolean
  ): TemplateResult {
    return isDefaultMode
      ? this._renderButtonAnchor(color, parts)
      : this._renderInputAnchor(color, parts);
  }

  private _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'color-picker-helper-text',
      slot: 'anchor',
      hasHelperText: true,
    });
  }

  //#endregion

  private _renderPicker(): TemplateResult {
    return html`
      <igc-focus-trap ?disabled=${!this.open} .inert=${!this.open}>
        <div part="picker">
          ${this._renderCanvasGradient()}
          <div part="main-row">${this._renderHueRowAndButtons()}</div>
          <div part="alpha-row">${this._renderAlphaRow()}</div>
          <div part="inputs-row">${this._renderInputsRow()}</div>
          ${this._renderSwatches()}
        </div>
      </igc-focus-trap>
    `;
  }

  protected override render(): TemplateResult {
    const color = this._color.asString('rgb', true);
    const parts = partMap({
      anchor: true,
      empty: this._color.isEmpty,
      'input-mode': this.mode === 'input',
    });
    const isDefaultMode = this.mode === 'default';

    return html`
      <div part="color-picker">
        ${
          isDefaultMode && this.label
            ? html`<label part="label" for="trigger">${this.label}</label>`
            : nothing
        }
        <igc-popover ?open=${this.open} shift flip>
          ${this._renderAnchor(color, parts, isDefaultMode)}${this._renderHelperText()}${this._renderPicker()}
        </igc-popover>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-picker': IgcColorPickerComponent;
  }
}
