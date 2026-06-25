import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  addKeybindings,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseComboBoxComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/forms/associated.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import {
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
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { isValidColor } from './common.js';
import { ColorModel, getContext } from './model.js';
import IgcPickerCanvasComponent, {
  type PickerCanvasEventDetail,
} from './picker-canvas.js';
import { styles } from './themes/color-picker.base.css.js';

export interface IgcColorPickerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  igcColorPicked: CustomEvent<string>;
}

/**
 * Color input component.
 *
 * @element igc-color-picker
 *
 * @fires igcOpening - Emitted just before the picker dropdown is open.
 * @fires igcOpened - Emitted after the picker dropdown is open.
 * @fires igcClosing - Emitter just before the picker dropdown is closed.
 * @fires igcClosed - Emitted after closing the picker dropdown.
 * @fires igcColorPicked - Emitted when the color is changed in the picker area.
 */
export default class IgcColorPickerComponent extends FormAssociatedMixin(
  EventEmitterMixin<
    IgcColorPickerEventMap,
    AbstractConstructor<IgcBaseComboBoxComponent>
  >(IgcBaseComboBoxComponent)
) {
  public static readonly tagName = 'igc-color-picker';
  public static styles = styles;

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
      IgcVisuallyHiddenComponent
    );
  }

  //#region Internal state and properties

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
    IgcButtonComponent | IgcInputComponent
  >();

  private _supportsEyeDropper = 'EyeDropper' in globalThis;
  private _color = ColorModel.empty();

  @state()
  private _ownCurrentColor = '';

  //#endregion

  //#region Public attributes and properties

  /**
   * The label of the component.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The value of the component.
   *
   * @attr value
   */
  @property()
  public set value(value: string) {
    this._color = ColorModel.parse(value);
    this._formValue.setValueAndFormState(this._color.asString(this.format));
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
   * @attr mode
   * @default 'default'
   */
  @property()
  public mode: 'default' | 'input' = 'default';

  /**
   * Pre-defined color swatches.
   */
  @property({ attribute: false })
  public swatches: string[] = [];

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addKeybindings(this, { skip: () => this.disabled }).set(
      escapeKey,
      this._onEscapeKey
    );
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

  private async _onEscapeKey(): Promise<void> {
    if (await this._hide(true)) {
      this._anchorRef.value?.focus();
    }
  }

  private _handleCanvasColorPicked(
    event: CustomEvent<PickerCanvasEventDetail>
  ): void {
    stopPropagation(event);

    this._color.s = event.detail.x;
    this._color.v = 100 - event.detail.y;
    this._updateColor();
  }

  private _handleHueValueChange(event: Event): void {
    stopPropagation(event);

    this._color.h = this._hueRef.value?.valueAsNumber ?? 0;
    this._updateColor();
    this._emitColorPickedEvent();
  }

  private _handleAlphaSliderValueChange(event: Event): void {
    stopPropagation(event);

    this._color.alpha = (this._alphaRef.value?.valueAsNumber ?? 0) / 100;
    this._updateColor();
    this._emitColorPickedEvent();
  }

  private _handleAlphaInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    this._color.alpha = asNumber(event.detail) ?? 0;
    this._updateColor();
    this._emitColorPickedEvent();
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

    // Commit only valid colors. An empty or invalid value reverts the input
    // back to the currently represented color.
    if (!isValidColor(event.detail, getContext())) {
      input.value = this._color.asString(this.format);
      return;
    }

    this._color = ColorModel.parse(event.detail);
    this._updateColor();
    this._syncCanvasPosition();
  }

  private _handleEyeDropperClick(): void {
    const eyeDropper = new (globalThis as any).EyeDropper();

    eyeDropper
      .open()
      .then((result: { sRGBHex: string }) => {
        this.value = result.sRGBHex;
        this._syncCanvasPosition();
        this._emitColorPickedEvent();
      })
      .catch(() => {});
  }

  private _handleCopy(): void {
    navigator.clipboard.writeText(this.value);
  }

  private _handleSwatchClick(event: Event): void {
    const color = getElementFromPath('button[part="swatch"]', event)?.ariaLabel;

    if (color) {
      this.value = color;
      this._syncCanvasPosition();
      this._emitColorPickedEvent();
    }
  }

  //#endregion

  //#region Internal methods

  private _updateColor(): void {
    this._ownCurrentColor = `hsl(${this._color.h} 100% 50%)`;
    this.style.setProperty('--current-color', this._ownCurrentColor);
    this._formValue.setValueAndFormState(this._color.asString(this.format));
    this.requestUpdate('_ownCurrentColor');
  }

  private _syncCanvasPosition(): void {
    if (!this._canvasRef.value || !this.open) return;

    const rect = this._canvasRef.value.getBoundingClientRect();
    const { width: markerWidth, height: markerHeight } =
      this._canvasRef.value.getMarkerDimensions();

    const x = (this._color.s / 100) * rect.width - markerWidth;
    const y = ((100 - this._color.v) / 100) * rect.height - markerHeight;

    this._canvasRef.value.x = x;
    this._canvasRef.value.y = y;
  }

  private _emitColorPickedEvent(): void {
    this.emitEvent('igcColorPicked', { detail: this.value });
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
      <igc-button
        ${ref(this._anchorRef)}
        id="trigger"
        aria-haspopup="dialog"
        part=${parts}
        slot="anchor"
        style=${bindIf(color, styleMap({ '--background': color }))}
        ?disabled=${this.disabled}
        @click=${this._handleAnchorClick}
      >
        <igc-visually-hidden>Open color picker</igc-visually-hidden>
      </igc-button>
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
        slot="anchor"
        label=${ifDefined(this.label)}
        .value=${this.value}
        @igcChange=${this._handleColorInputChange}
      >
        <div
          slot="prefix"
          part=${parts}
          style=${styleMap({ padding: '1rem', background: color })}
          @click=${this._handleAnchorClick}
        ></div>
      </igc-input>
    `;
  }

  private _renderAnchor(
    color: string,
    parts: ReturnType<typeof partMap>
  ): TemplateResult {
    const isDefaultMode = this.mode === 'default';

    return isDefaultMode
      ? this._renderButtonAnchor(color, parts)
      : this._renderInputAnchor(color, parts);
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
    const parts = partMap({ anchor: true, empty: this._color.isEmpty });
    const isDefaultMode = this.mode === 'default';

    return html`
      <div>
        ${isDefaultMode
          ? html`<label part="label" for="trigger">${this.label}</label>`
          : nothing}
        <igc-popover ?open=${this.open} shift flip>
          ${this._renderAnchor(color, parts)}${this._renderPicker()}
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
