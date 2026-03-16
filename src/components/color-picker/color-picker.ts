import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  addKeybindings,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseComboBoxLikeComponent } from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/forms/associated.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { addSafeEventListener, asNumber } from '../common/util.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import type { IgcRadioChangeEventArgs } from '../radio/radio.js';
import IgcRadioGroupComponent from '../radio-group/radio-group.js';
import { ColorModel } from './model.js';
import IgcPickerCanvasComponent, {
  type IgcPickerCanvasEventMap,
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

function stopPropagation(event: Event, immediate = false) {
  immediate ? event.stopImmediatePropagation() : event.stopPropagation();
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
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-color-picker';
  public static styles = styles;

  public static register(): void {
    registerComponent(
      IgcColorPickerComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcFocusTrapComponent,
      IgcRadioGroupComponent,
      IgcPickerCanvasComponent
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

  private _color = ColorModel.default();

  @state({ hasChanged: () => true })
  private _ownCurrentColor = '';

  @query(IgcInputComponent.tagName, true)
  protected readonly _input!: IgcInputComponent;

  @query('#color-thumb', true)
  protected readonly _preview!: HTMLSpanElement;

  @query('[part="hue"]')
  protected readonly _hueSlider!: HTMLInputElement;

  @query('[part="alpha"]')
  protected readonly _alphaSlider!: HTMLInputElement;

  @query(IgcPickerCanvasComponent.tagName)
  protected readonly _canvasPicker!: IgcPickerCanvasComponent;

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
    this._syncCanvasPosition();
  }

  public get value(): string {
    return this._formValue.value;
  }

  /**
   * Sets the color format for the string value.
   * @attr
   */
  @property()
  public format: 'hex' | 'rgb' | 'hsl' = 'hex';

  /**
   * Whether to hide the format picker buttons.
   * @attr
   */
  @property({ type: Boolean, attribute: 'hide-formats', reflect: true })
  public hideFormats = false;

  constructor() {
    super();

    addSafeEventListener(this, 'igcOpened' as any, this._syncCanvasPosition);

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

  private _handleClosing(): void {
    this._hide(true);
  }

  protected async _onEscapeKey(): Promise<void> {
    if (await this._hide(true)) {
      this._input.focus();
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

    this._color.h = this._hueSlider.valueAsNumber;
    this._updateColor();
    this._emitColorPickedEvent();
  }

  private _handleAlphaValueChange(event: Event): void {
    stopPropagation(event);

    this._color.alpha = this._alphaSlider.valueAsNumber / 100;
    this._updateColor();
    this._emitColorPickedEvent();
  }

  private _updateColor(): void {
    this._ownCurrentColor = `hsl(${this._color.h}, 100%, 50%)`;
    this.style.setProperty('--current-color', this._ownCurrentColor);
    this._formValue.setValueAndFormState(this._color.asString(this.format));
  }

  private _syncCanvasPosition(): void {
    if (!(this.open || this._canvasPicker)) return;

    const rect = this._canvasPicker.getBoundingClientRect();
    const { width: markerWidth, height: markerHeight } =
      this._canvasPicker.getMarkerDimensions();

    const x = (this._color.s / 100) * rect.width - markerWidth;
    const y = ((100 - this._color.v) / 100) * rect.height - markerHeight;

    this._canvasPicker.x = x;
    this._canvasPicker.y = y;
  }

  protected _emitColorPickedEvent(): void {
    this.emitEvent('igcColorPicked', { detail: this.value });
  }

  protected _handleFormatChange(event: CustomEvent<IgcRadioChangeEventArgs>) {
    stopPropagation(event);

    this.format = event.detail.value as typeof this.format;
    this._updateColor();
  }

  protected _handleCanvasColorPicked(
    event: IgcPickerCanvasEventMap['igcColorPicked']
  ): void {
    stopPropagation(event);

    this._color.s = event.detail.x;
    this._color.v = 100 - event.detail.y;
    this._updateColor();
  }

  protected _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const input = event.target as IgcInputComponent;

    if (input.name === 'hex') {
      this._color = ColorModel.parse(event.detail);
    } else {
      const value = asNumber(event.detail);

      switch (input.name) {
        case 'red':
          this._color.r = value;
          break;
        case 'green':
          this._color.g = value;
          break;
        case 'blue':
          this._color.b = value;
          break;
        case 'hue':
          this._color.h = value;
          break;
        case 'saturation':
          this._color.s = value;
          break;
        case 'lightness':
          this._color.l = value;
          break;
        case 'alpha':
          this._color.alpha = value;
          break;
      }
    }

    this._updateColor();
    this._syncCanvasPosition();
  }

  protected _renderFormatRadios() {
    return html`
      <igc-radio-group
        alignment="horizontal"
        .value=${this.format}
        name="format"
        @igcChange=${this._handleFormatChange}
      >
        <igc-radio value="hex">Hex</igc-radio>
        <igc-radio value="rgb">RGB</igc-radio>
        <igc-radio value="hsl">HSL</igc-radio>
      </igc-radio-group>
    `;
  }

  protected _renderFormats() {
    return html`
      ${cache(this.hideFormats ? nothing : this._renderFormatRadios())}
    `;
  }

  protected _renderGradientArea() {
    return html`
      <igc-picker-canvas
        @igcColorPicked=${this._handleCanvasColorPicked}
        currentColor=${this._ownCurrentColor}
      >
      </igc-picker-canvas>
    `;
  }

  protected _renderHueSlider() {
    return html`
      <input
        aria-label="Hue"
        part="hue"
        type="range"
        min="0"
        max="360"
        .value=${this._color.h.toString()}
        @input=${this._handleHueValueChange}
        @change=${stopPropagation}
      />
    `;
  }

  protected _renderAlphaSlider() {
    return html`
      <input
        aria-label="Alpha"
        type="range"
        part="alpha"
        min="0"
        max="100"
        .value=${(this._color.alpha * 100).toString()}
        @input=${this._handleAlphaValueChange}
        @change=${stopPropagation}
      />
    `;
  }

  protected _renderRGBInput() {
    const { r, g, b, h, s, l } = this._color;
    const isRGB = this.format === 'rgb';

    return html`
      <igc-input
        label=${isRGB ? 'R' : 'H'}
        outlined
        type="number"
        min="0"
        max=${isRGB ? '255' : '360'}
        name=${isRGB ? 'red' : 'hue'}
        .value=${isRGB ? r.toFixed() : h.toFixed()}
      ></igc-input>
      <igc-input
        label=${isRGB ? 'G' : 'S'}
        outlined
        type="number"
        min="0"
        max=${isRGB ? '255' : '100'}
        name=${isRGB ? 'green' : 'saturation'}
        .value=${isRGB ? g.toFixed() : s.toFixed()}
      ></igc-input>
      <igc-input
        label=${isRGB ? 'B' : 'L'}
        outlined
        type="number"
        min="0"
        max=${isRGB ? '255' : '100'}
        name=${isRGB ? 'blue' : 'lightness'}
        .value=${isRGB ? b.toFixed() : l.toFixed()}
      ></igc-input>
    `;
  }

  protected _renderHexInput() {
    return html`
      <igc-input
        label="Hex"
        outlined
        type="text"
        .value=${this._color.asString('hex')}
        name="hex"
      ></igc-input>
    `;
  }

  protected _renderAlphaInput() {
    return html`
      <igc-input
        label="A"
        outlined
        type="number"
        min="0"
        max="1"
        step="0.01"
        .value=${this._color.alpha.toString()}
        name="alpha"
      ></igc-input>
    `;
  }

  protected _renderColorInputs() {
    return html`
      <div part="inputs" @igcChange=${this._handleColorInputChange}>
        ${cache(
          this.format === 'hex'
            ? this._renderHexInput()
            : this._renderRGBInput()
        )}
        ${this._renderAlphaInput()}
      </div>
    `;
  }

  protected _renderPicker() {
    return html`
      <igc-focus-trap ?disabled=${!this.open}>
        <div part="picker" .inert=${!this.open}>
          ${this._renderGradientArea()}

          <div>
            ${this._renderHueSlider()}${this._renderAlphaSlider()}
            ${this._renderFormats()}${this._renderColorInputs()}
          </div>
        </div>
      </igc-focus-trap>
    `;
  }

  protected override render() {
    const style = styleMap({
      'background-color': this._color.asString('rgb', true),
    });

    return html`
      <igc-popover ?open=${this.open} shift flip>
        <igc-input
          slot="anchor"
          readonly
          ?disabled=${this.disabled}
          .value=${this.value}
          label=${ifDefined(this.label)}
          @pointerdown=${this.handleAnchorClick}
        >
          <span id="color-thumb" style=${style} slot="prefix"></span>
        </igc-input>
        ${this._renderPicker()}
      </igc-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-picker': IgcColorPickerComponent;
  }
}
