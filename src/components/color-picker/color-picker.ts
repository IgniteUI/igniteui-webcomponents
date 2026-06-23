import { html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
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
  private readonly _anchorRef = createRef<IgcButtonComponent>();
  private readonly _canvasRef = createRef<IgcPickerCanvasComponent>();
  private readonly _hueRef = createRef<HTMLInputElement>();

  private _supportsEyeDropper = 'EyeDropper' in globalThis;
  private _color = ColorModel.empty();

  @state()
  private _ownCurrentColor = '';

  /**
   * The label of the component.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The value of the component.
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

  /** Pre-defined color swatches. */
  @property({ attribute: false })
  public swatches: string[] = [];

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

  private _handleClosing(): void {
    this._hide(true);
  }

  protected async _onEscapeKey(): Promise<void> {
    if (await this._hide(true)) {
      this._anchorRef.value?.focus();
    }
  }

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    this._color = ColorModel.parse(this._formValue.value);
    this._updateColor();
    this._syncCanvasPosition();
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

  protected _handleFormatChange(
    event: CustomEvent<IgcSelectItemComponent>
  ): void {
    stopPropagation(event);

    this.format = event.detail.value as typeof this.format;
    this._updateColor();
  }

  protected _handleCanvasColorPicked(
    event: CustomEvent<PickerCanvasEventDetail>
  ): void {
    stopPropagation(event);

    this._color.s = event.detail.x;
    this._color.v = 100 - event.detail.y;
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

  protected _emitColorPickedEvent(): void {
    this.emitEvent('igcColorPicked', { detail: this.value });
  }

  protected _renderSelect() {
    return html`
      <igc-visually-hidden>
        <label for="format-select">Color format</label>
      </igc-visually-hidden>

      <igc-select
        id="format-select"
        part="format-select"
        placeholder="Color format"
        name="format"
        .value=${this.format}
        @igcChange=${this._handleFormatChange}
      >
        <igc-select-item value="hex">Hex</igc-select-item>
        <igc-select-item value="rgb">RGB</igc-select-item>
        <igc-select-item value="hsl">HSL</igc-select-item>
      </igc-select>
    `;
  }

  protected _renderFormats() {
    return html`${cache(this.hideFormats ? nothing : this._renderSelect())}`;
  }

  protected _renderGradientArea() {
    return html`
      <igc-picker-canvas
        ${ref(this._canvasRef)}
        @igcColorPicked=${this._handleCanvasColorPicked}
        currentColor=${this._ownCurrentColor}
      >
      </igc-picker-canvas>
    `;
  }

  protected _renderHueSlider() {
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

  private _renderAlphaRow() {
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

  private _renderEyeDropperButton() {
    return html`
      <igc-icon-button
        part="eye-dropper"
        variant="outlined"
        ?disabled=${!this._supportsEyeDropper}
        @click=${this._handleEyeDropperClick}
      >
        🫳
        <igc-visually-hidden>Pick a color from the screen</igc-visually-hidden>
      </igc-icon-button>
    `;
  }

  private _renderCopyButton() {
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

  private _renderSwatches() {
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

  private _renderInputsRow() {
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

  private _renderPicker() {
    return html`
      <igc-focus-trap ?disabled=${!this.open} .inert=${!this.open}>
        <div part="picker">
          ${this._renderGradientArea()}

          <div part="main-row">
            ${this._renderHueSlider()}
            <div part="buttons">
              ${this._renderCopyButton()} ${this._renderEyeDropperButton()}
            </div>
          </div>

          <div part="alpha-row">${this._renderAlphaRow()}</div>
          <div part="inputs-row">${this._renderInputsRow()}</div>

          ${this._renderSwatches()}
        </div>
      </igc-focus-trap>
    `;
  }

  protected override render() {
    const style = styleMap({
      '--background': this._color.asString('rgb', true),
    });

    return html`
      <div>
        <span part="label">
          <slot>${this.label}</slot>
        </span>

        <igc-popover ?open=${this.open} shift flip>
          <igc-button
            ${ref(this._anchorRef)}
            aria-haspopup="dialog"
            part=${partMap({
              anchor: true,
              empty: this._color.isEmpty,
            })}
            slot="anchor"
            style=${style}
            ?disabled=${this.disabled}
            @click=${this._handleAnchorClick}
          >
            <igc-visually-hidden>Open color picker</igc-visually-hidden>
          </igc-button>
          ${this._renderPicker()}
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
