import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { addRootClickController } from '#internals/controllers/root-click.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { IgcBaseComboBoxComponent } from '#internals/mixins/combo-box.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { isEmpty } from '#internals/utils/arrays.js';
import {
  addSafeEventListener,
  getElementFromPath,
  stopPropagation,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { asNumber } from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcDividerComponent from '../divider/divider.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcSelectComponent from '../select/select.js';
import type IgcSelectItemComponent from '../select/select-item.js';
import type { ColorFormat, ColorPickerMode } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { isValidColor, normalizeColor } from './common.js';
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

/** The shape of a color string in each format, shown while the input is empty. */
const formatPlaceholders: Record<ColorFormat, string> = {
  hex: '#rrggbb',
  rgb: 'rgb(r g b)',
  hsl: 'hsl(h s% l%)',
};

/**
 * The slice of the EyeDropper API this component uses.
 *
 * Declared locally rather than pulled from the DOM lib - the API is not in the
 * baseline typings and is unimplemented in Firefox and Safari.
 */
interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>;
}

type EyeDropperConstructor = new () => EyeDropperLike;

/** The EyeDropper constructor, when the browser provides one. */
function getEyeDropper(): EyeDropperConstructor | undefined {
  return (globalThis as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
}

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

  private readonly _supportsEyeDropper = Boolean(getEyeDropper());
  private _color = ColorModel.empty();
  private _oldValue = '';

  /** The last value written for each host custom property mirrored from the color. */
  private readonly _appliedProperties = new Map<string, string>();

  @query('#helper-text')
  private readonly _helperText!: IgcValidationContainerComponent | null;

  private get _isInputMode(): boolean {
    return this.mode === 'input';
  }

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
   * Switching the format re-renders `value` in the new notation without
   * changing the color, so no `igcInput` or `igcChange` is emitted.
   *
   * @attr format
   * @default 'hex'
   */
  @property()
  public format: ColorFormat = 'hex';

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
  public mode: ColorPickerMode = 'default';

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

    addThemingController(this, all);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, { skip: () => this.disabled })
      .set(escapeKey, this._handleKeyboardClosing)
      .set([altKey, arrowDown], this._handleAnchorClick)
      .set([altKey, arrowUp], this._handleKeyboardClosing);

    // Projects the host's labels and popup semantics onto the native input
    // inside the anchor `igc-input` (see ProjectedARIA for why the host cannot
    // publish these itself). Only in input mode - the default mode anchor is a
    // plain button that carries its own ARIA.
    addAriaProjector(this, {
      target: () => (this._isInputMode ? this._anchorRef.value : null),
      state: () => ({
        hasPopup: 'dialog',
        expanded: `${this.open}`,
        labelledBy: this._internals.labels,
        describedBy: this._helperText ? [this._helperText] : null,
      }),
    });
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('open')) {
      this._rootClickController.update();
    }

    // `value` is rendered in the active format, so a format change re-renders
    // it. Handled here rather than in the select's handler so that setting the
    // property directly behaves the same.
    //
    // Skipped on the first update: `format` is always listed as changed there,
    // and committing the form value would clear the pristine flag that a
    // `defaultValue` has just established.
    if (this.hasUpdated && props.has('format')) {
      this._formValue.setValueAndFormState(this._color.asString(this.format));
    }

    this._applyColorProperties();

    super.update(props);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open') || properties.has('value')) {
      // Wait until the browser paints and then sync the marker position with the color.
      requestAnimationFrame(() => this._syncCanvasPosition());
    }
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
      this._oldValue = this._alphaColor;
    }
  }

  private _handleFocusOut({ relatedTarget }: FocusEvent): void {
    if (this.contains(relatedTarget as Node)) {
      return;
    }

    this._handleBlur();

    if (this._alphaColor !== this._oldValue) {
      this._oldValue = this._alphaColor;
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

    this._color.alpha = asNumber(event.detail) / 100;
    this._updateColor();
    this._emitInputEvent();
  }

  private _handleFormatChange(
    event: CustomEvent<IgcSelectItemComponent>
  ): void {
    stopPropagation(event);

    // `update()` re-renders the value in the new format.
    this.format = event.detail.value as ColorFormat;
  }

  private _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const input = event.target as IgcInputComponent;
    const value = normalizeColor(event.detail);
    const cleared = !value;

    // A non-empty but invalid value reverts the input back to the currently
    // represented color. An empty value clears it.
    if (!cleared && !isValidColor(value, getContext())) {
      input.value = this._color.asString(this.format);
      return;
    }

    this._color = cleared ? ColorModel.empty() : ColorModel.parse(value);
    this._updateColor();
    // The model was replaced directly rather than through `value`, so no
    // `value` change is recorded and the sync in `updated()` will not run.
    this._syncCanvasPosition();
  }

  private _handleEyeDropperClick(): void {
    const EyeDropper = getEyeDropper();

    if (!EyeDropper) return;

    new EyeDropper()
      .open()
      .then((result) => {
        // Assigning `value` records the change, so `updated()` syncs the marker.
        this.value = result.sRGBHex;
        this._emitInputEvent();
      })
      .catch(() => {});
  }

  private _handleCopy(): void {
    navigator.clipboard?.writeText(this.value).catch(() => {});
  }

  private _handleSwatchClick(event: Event): void {
    const swatch = getElementFromPath<HTMLButtonElement>(
      'button[part="swatch"]',
      event
    );
    const color = swatch?.dataset.color;

    if (color) {
      this.value = color;
      this._emitInputEvent();
    }
  }

  //#endregion

  //#region Internal methods

  /**
   * The current color, alpha included, in a notation that does not depend on
   * `format`.
   *
   * `value` is rendered in whichever format is active, so comparing it across a
   * format switch would report a change the user never made. This moves only
   * when the color itself does.
   */
  private get _alphaColor(): string {
    return this._color.asString('rgb', true);
  }

  /**
   * The current color with its alpha channel forced to opaque.
   *
   * The swatch preview paints this over one half of its surface and
   * {@link _alphaColor} over the other, so a translucent color is shown next to
   * what it actually is. At full alpha the two halves are identical and the
   * split is invisible, so opaque colors need no separate branch.
   *
   * Defined even with no value: an empty color is white, which is where the
   * alpha ramp and the canvas marker belong before anything is picked. The
   * anchor keeps its "no color" mark regardless - {@link _previewStyle} is
   * driven by {@link _alphaColor}, which stays empty.
   */
  private get _opaqueColor(): string {
    return new ColorModel(this._color.toRGB()).asString('rgb');
  }

  /** The alpha channel as the whole percentage both alpha controls work in. */
  private get _alphaPercent(): string {
    return String(Math.round(this._color.alpha * 100));
  }

  /**
   * The pure hue the saturation/value plane and the hue thumb are painted from.
   *
   * Defined even with no value: an empty color is white at hue 0, so the plane
   * is drawn from red - which is where the hue slider is already pointing.
   */
  private get _currentColor(): string {
    return `hsl(${this._color.h} 100% 50%)`;
  }

  /**
   * Mirrors the colors the stylesheet needs onto the host.
   *
   * Driven from `update()` rather than from the handlers that mutate the color,
   * so that it also runs for the first render - a picker with no value never
   * goes through one of those handlers, and the plane would be left on the
   * stylesheet fallback instead of the hue it actually sits at.
   */
  private _applyColorProperties(): void {
    // The model mutates in place, so Lit cannot dirty-check it - and a style
    // write invalidates whether or not the value changed, hence the cache.
    for (const [name, value] of [
      ['--_current-color', this._currentColor],
      ['--_selected-color', this._opaqueColor],
    ]) {
      if (this._appliedProperties.get(name) !== value) {
        this._appliedProperties.set(name, value);
        this.style.setProperty(name, value);
      }
    }
  }

  private _updateColor(): void {
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

  //#endregion

  //#region Canvas area rendering

  private _renderCanvasGradient(): TemplateResult {
    const [, saturation, brightness] = this._color.toHSV();

    return html`
      <igc-picker-canvas
        exportparts="marker"
        part="picker-canvas"
        ${ref(this._canvasRef)}
        @igcColorPicked=${this._handleCanvasColorPicked}
        currentColor=${this._currentColor}
        markerColor=${this._opaqueColor}
        .saturation=${saturation}
        .brightness=${brightness}
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
        .value=${String(Math.round(this._color.h))}
        @input=${this._handleHueValueChange}
        @change=${stopPropagation}
      />
    `;
  }

  /** An icon-only action button, named for screen readers by its hidden label. */
  private _renderIconButton(
    part: string,
    icon: string,
    label: string,
    handler: () => void,
    disabled = false
  ): TemplateResult {
    return html`
      <igc-icon-button
        part=${part}
        variant="flat"
        name=${icon}
        ?disabled=${disabled}
        @click=${handler}
      >
        <igc-visually-hidden>${label}</igc-visually-hidden>
      </igc-icon-button>
    `;
  }

  private _renderPickerButtons(): TemplateResult {
    return html`
      <div part="buttons">
        ${this._renderIconButton(
          'copy',
          'copy_content',
          'Copy color value to clipboard',
          this._handleCopy
        )}
        ${this._renderIconButton(
          'eye-dropper',
          'eye_dropper',
          'Pick a color from the screen',
          this._handleEyeDropperClick,
          !this._supportsEyeDropper
        )}
      </div>
    `;
  }

  //#endregion

  //#region Alpha row rendering

  private _renderAlphaRow(): TemplateResult {
    return html`
      <input
        ${ref(this._alphaRef)}
        aria-label="Alpha slider"
        type="range"
        part="alpha"
        min="0"
        max="100"
        .value=${this._alphaPercent}
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
        part="alpha-input"
        outlined
        type="number"
        min="0"
        max="100"
        step="1"
        .value=${this._alphaPercent}
        @igcChange=${this._handleAlphaInputChange}
      >
        <span slot="suffix">%</span>
      </igc-input>
    `;
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

  private _renderInputsRow(): TemplateResult {
    return html`
      ${cache(this.hideFormats ? nothing : this._renderSelect())}
      <igc-visually-hidden>
        <label for="color-input"> Color value input </label>
      </igc-visually-hidden>

      <igc-input
        id="color-input"
        name="color-input"
        placeholder=${formatPlaceholders[this.format]}
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
                  data-color=${color}
                  aria-label=${color}
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

  /** The `part` list of the anchor, in either presentation. */
  private get _anchorParts(): ReturnType<typeof partMap> {
    return partMap({
      anchor: true,
      empty: this._color.isEmpty,
      'input-mode': this._isInputMode,
    });
  }

  /**
   * The swatch preview style shared by both anchors.
   *
   * `--_color-preview` paints the opaque color over the left half and
   * `--_alpha-preview` the color with its real alpha across the whole surface,
   * so the two must not be transposed - see the `swatch-preview` mixin.
   */
  private _previewStyle(): ReturnType<typeof styleMap> {
    const color = this._alphaColor;

    return bindIf(
      color,
      styleMap({
        '--_alpha-preview': color,
        '--_color-preview': this._opaqueColor,
      })
    );
  }

  private _renderButtonAnchor(): TemplateResult {
    return html`
      <button
        ${ref(this._anchorRef)}
        id="trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls="picker"
        aria-expanded=${this.open}
        aria-describedby="helper-text"
        part=${this._anchorParts}
        slot="anchor"
        style=${this._previewStyle()}
        ?disabled=${this.disabled}
        @click=${this._handleAnchorClick}
      >
        <igc-visually-hidden>Open color picker</igc-visually-hidden>
      </button>
    `;
  }

  /**
   * The anchor as an editable text field, with the swatch as its prefix.
   *
   * The placeholder is not decoration: an empty Material input only floats its
   * label and cuts the outline notch while it is `:placeholder-shown`, `filled`
   * or focused. Opening the picker moves focus into the dialog - which is a
   * sibling of the anchor, not a descendant - so without one the label would
   * drop back over the outline for as long as the picker is open and empty.
   */
  private _renderInputAnchor(): TemplateResult {
    return html`
      <igc-input
        ${ref(this._anchorRef)}
        slot="anchor"
        outlined
        placeholder=${formatPlaceholders[this.format]}
        label=${ifDefined(this.label)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        .value=${this.value}
        .invalid=${this.invalid}
        @igcChange=${this._handleColorInputChange}
      >
        <div slot="prefix">
          <button
            type="button"
            part=${this._anchorParts}
            aria-label="Open color picker"
            aria-haspopup="dialog"
            aria-controls="picker"
            aria-expanded=${this.open}
            style=${this._previewStyle()}
            ?disabled=${this.disabled}
            @click=${this._handleAnchorClick}
          ></button>
        </div>
      </igc-input>
    `;
  }

  private _renderAnchor(): TemplateResult {
    return !this._isInputMode
      ? this._renderButtonAnchor()
      : this._renderInputAnchor();
  }

  private _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'helper-text',
      slot: 'anchor',
      hasHelperText: true,
    });
  }

  //#endregion

  private _renderPicker(): TemplateResult {
    return html`
      <igc-focus-trap ?disabled=${!this.open} .inert=${!this.open}>
        <div
          id="picker"
          part="picker"
          role="dialog"
          aria-label="Color picker"
          aria-modal="false"
        >
          ${this._renderCanvasGradient()}
          <div part="main-row">
            ${this._renderHueSlider()}${this._renderPickerButtons()}
          </div>
          ${
            this.showAlpha
              ? html`<div part="alpha-row">${this._renderAlphaRow()}</div>`
              : nothing
          }
          <div part="inputs-row">${this._renderInputsRow()}</div>
          ${this._renderSwatches()}
        </div>
      </igc-focus-trap>
    `;
  }

  protected override render(): TemplateResult {
    return html`
      <div part="color-picker">
        <igc-popover ?open=${this.open} shift flip>
          ${this._renderAnchor()}${this._renderHelperText()}${this._renderPicker()}
        </igc-popover>
        ${
          !this._isInputMode && this.label
            ? html`<label part="label" for="trigger">${this.label}</label>`
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-picker': IgcColorPickerComponent;
  }
}
