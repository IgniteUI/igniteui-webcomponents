import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowRight,
  arrowUp,
  endKey,
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
  focusLeftHost,
  getElementFromPath,
  stopPropagation,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcDividerComponent from '../divider/divider.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import type IgcSelectItemComponent from '../select/select-item.js';
import IgcSelectComponent from '../select/select.js';
import type {
  ColorFormat,
  ColorPickerMode,
  PopoverScrollStrategy,
} from '../types.js';
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

/** The color string shape of each format. Shown while the input is empty. */
const formatPlaceholders: Record<ColorFormat, string> = {
  hex: '#rrggbb',
  rgb: 'rgb(r g b)',
  hsl: 'hsl(h s% l%)',
};

/** The alpha text is `<digits>%`. An edit removes every other character. */
const nonDigits = /\D/g;

/** The last caret offset in `<digits>%`, the position in front of the `%`. */
function caretLimit(text: string): number {
  return Math.max(text.length - 1, 0);
}

/**
 * The part of the EyeDropper API that this component uses.
 *
 * The type is declared locally, because the API is not in the baseline DOM
 * typings. Firefox and Safari do not implement it.
 */
interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>;
}

type EyeDropperConstructor = new () => EyeDropperLike;

/** Returns the EyeDropper constructor, if the browser provides one. */
function getEyeDropper(): EyeDropperConstructor | undefined {
  return (globalThis as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
}

/**
 * Color input component.
 *
 * The user picks a color with the HSV saturation/value canvas, the hue slider
 * and the optional alpha slider. The user can also type a color string: hex,
 * rgb(a), hsl(a) or a named CSS color.
 *
 * The component supports pre-defined swatches and the native EyeDropper API,
 * where the browser provides one. The anchor is a trigger button
 * (`mode="default"`) or an editable text field (`mode="input"`).
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
  private readonly _alphaInputRef = createRef<IgcInputComponent>();
  private readonly _canvasRef = createRef<IgcPickerCanvasComponent>();
  private readonly _hueRef = createRef<HTMLInputElement>();
  private readonly _anchorRef = createRef<
    HTMLButtonElement | IgcInputComponent
  >();

  private readonly _supportsEyeDropper = Boolean(getEyeDropper());
  private _color = ColorModel.empty();
  private _oldValue = '';

  /** The last value written for each host custom property. */
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
   * In `mode="input"` the component forwards the label to the anchor input.
   * In `mode="default"` it renders the label as a separate element.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The value of the component as a CSS color string. Accepts hex, rgb(a),
   * hsl(a) and named colors.
   *
   * An empty, whitespace-only or invalid string clears the value.
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
   * Sets the color format of the string value.
   *
   * A format change renders `value` in the new notation. The color does not
   * change, so the component emits no `igcInput` or `igcChange`.
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
   * In `"default"` mode the anchor is a trigger button. In `"input"` mode the
   * anchor is an editable text field with a color swatch prefix. The prefix
   * also opens the picker.
   *
   * @attr mode
   * @default 'default'
   */
  @property({ reflect: true })
  public mode: ColorPickerMode = 'default';

  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: PopoverScrollStrategy = 'hide';

  /**
   * Pre-defined color strings. The component renders them as clickable
   * swatches below the picker controls. A click on a swatch commits its color
   * as the value.
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

    addKeybindings(this, {
      skip: () => this.disabled || !this._alphaInputRef.value,
      ref: this._alphaInputRef,
      bindingDefaults: { repeat: true },
    })
      .set(arrowUp, () => this._handleAlphaInputSpin(1))
      .set(arrowDown, () => this._handleAlphaInputSpin(-1))
      .set(arrowRight, this._handleAlphaInputCaretForward, {
        preventDefault: false,
      })
      .set(endKey, this._handleAlphaInputCaretForward, {
        preventDefault: false,
      });

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

    if (this.hasUpdated && props.has('format')) {
      this._formValue.setValueAndFormState(this._color.asString(this.format));
    }

    this._applyColorProperties();

    super.update(props);
  }

  protected override updated(props: PropertyValues<this>): void {
    super.updated(props);

    if (props.has('open') || props.has('value')) {
      // Wait for the paint, then sync the marker position with the color.
      requestAnimationFrame(() => this._syncCanvasPosition());
    }
  }

  //#endregion

  //#region Form associated overrides

  protected override formResetCallback(): void {
    super.formResetCallback();

    if (this._isInputMode) {
      const input = this._anchorRef.value as IgcInputComponent;
      input?.['formResetCallback']();
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

  private _handleFocusIn(event: FocusEvent): void {
    if (focusLeftHost(this, event)) {
      this._oldValue = this._alphaColor;
    }
  }

  private _handleFocusOut(event: FocusEvent): void {
    if (!focusLeftHost(this, event)) {
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

    this._setAlpha(asNumber(this._alphaRef.value?.value));
  }

  /**
   * Rewrites the alpha field as `<digits>%` after each edit.
   *
   * The `%` is part of the value and not a suffix element, so the browser
   * treats it as editable text. This handler normalizes the result of an edit
   * instead of a filter on the keystrokes in `beforeinput`. The `%` then
   * behaves as a literal for each way that text reaches the field: typing,
   * paste, drop, composition, undo and autofill. Of these, `beforeinput`
   * carries `data` only for typing.
   */
  private _handleAlphaInputEdit(event: Event): void {
    const input = this._alphaInputRef.value;
    const native = getElementFromPath<HTMLInputElement>('input', event);

    if (!input || !native) return;

    const caret = native.selectionStart ?? native.value.length;
    const typed = native.value.slice(0, caret).replace(nonDigits, '').length;
    const digits = native.value.replace(nonDigits, '');
    const percent = clamp(asNumber(digits), 0, 100);

    const text = digits ? `${percent}%` : '';

    this._writeAlphaText(input, text, Math.min(typed, caretLimit(text)));

    if (digits) {
      this._setAlpha(percent);
    }
  }

  /**
   * Keeps the caret and the selection inside the digits.
   *
   * The trailing `%` is a literal. Without this handler the caret goes after
   * the `%` on focus, on a click past the text, and after a shifted selection
   * extends over it. The handler therefore runs on `keyup` as well as on
   * `focusin` and `click`. Text after the `%` falls outside the number, and the
   * parse discards it.
   */
  private _handleAlphaInputCaret(event: Event): void {
    const native = getElementFromPath<HTMLInputElement>('input', event);
    if (!native) return;

    const limit = caretLimit(native.value);

    native.setSelectionRange(
      Math.min(native.selectionStart ?? 0, limit),
      Math.min(native.selectionEnd ?? 0, limit)
    );
  }

  /**
   * Steps the alpha by one percent.
   *
   * The step applies to the color and not to the text of the field. This keeps
   * a held arrow key correct. The key downs repeat faster than a render, so the
   * text of the field can be stale.
   *
   * The handler writes the new text and does not leave it to the render, so
   * that the caret does not move. A value assignment puts the caret behind the
   * `%`. A write from the render applies one frame after the keypress, which
   * the user sees as a jump forward and back.
   */
  private _handleAlphaInputSpin(increment: -1 | 1): void {
    const input = this._alphaInputRef.value;
    const percent = clamp(this._alphaPercent + increment, 0, 100);

    if (!input || percent === this._alphaPercent) return;

    this._writeAlphaText(input, `${percent}%`);
    this._setAlpha(percent);
  }

  /**
   * Holds the caret at the `%`. Without this handler the caret steps past the
   * `%`, and `keyup` pulls it back. This is the frame-late jump that
   * {@link _handleAlphaInputSpin} describes.
   */
  private _handleAlphaInputCaretForward(event: KeyboardEvent): void {
    const native = getElementFromPath<HTMLInputElement>('input', event);
    if (!native) return;

    const limit = caretLimit(native.value);

    if (event.key === endKey || (native.selectionEnd ?? 0) >= limit) {
      event.preventDefault();
      native.setSelectionRange(limit, limit);
    }
  }

  private _handleAlphaInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const input = event.target as IgcInputComponent;

    if (!input.value) {
      input.value = `${this._alphaPercent}%`;
    }
  }

  private _handleFormatChange(
    event: CustomEvent<IgcSelectItemComponent>
  ): void {
    stopPropagation(event);
    this.format = event.detail.value as ColorFormat;
  }

  private _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const input = event.target as IgcInputComponent;
    const value = normalizeColor(event.detail);
    const cleared = !value;

    // An invalid and non-empty value reverts the input to the current color.
    // An empty value clears the color.
    if (!cleared && !isValidColor(value, getContext())) {
      input.value = this._color.asString(this.format);
      return;
    }

    this._color = cleared ? ColorModel.empty() : ColorModel.parse(value);
    this._updateColor();
    this._syncCanvasPosition();
  }

  private _handleEyeDropperClick(): void {
    const EyeDropper = getEyeDropper();

    if (!EyeDropper) return;

    new EyeDropper()
      .open()
      .then((result) => {
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
   * The current color with its alpha, in a notation that is independent of
   * `format`.
   */
  private get _alphaColor(): string {
    return this._color.asString('rgb', true);
  }

  /**
   * The current color with an opaque alpha channel.
   *
   * The swatch preview paints this color over one half of its surface, and
   * {@link _alphaColor} over the other half. A translucent color is then shown
   * next to its opaque form. At full alpha the two halves are identical and the
   * split is invisible, so opaque colors need no separate branch.
   *
   * This value is defined also with no color value. An empty color is white,
   * which is where the alpha ramp and the canvas marker belong before the first
   * pick. The anchor keeps its "no color" mark, because {@link _previewStyle}
   * uses {@link _alphaColor}, which stays empty.
   */
  private get _opaqueColor(): string {
    return new ColorModel(this._color.toRGB()).asString('rgb');
  }

  /** The alpha channel as the whole percentage that both alpha controls use. */
  private get _alphaPercent(): number {
    return Math.round(this._color.alpha * 100);
  }

  /** The pure hue that the saturation/value plane and the hue thumb use. */
  private get _currentColor(): string {
    return `hsl(${this._color.h} 100% 50%)`;
  }

  /**
   * Mirrors the colors that the stylesheet needs onto the host.
   *
   * `update()` drives this, and not the handlers that change the color. It
   * therefore also runs for the first render. A picker with no value calls none
   * of those handlers, and the plane would keep the stylesheet fallback instead
   * of its actual hue.
   */
  private _applyColorProperties(): void {
    const properties = {
      '--_current-color': this._currentColor,
      '--_selected-color': this._opaqueColor,
    };

    for (const [name, value] of Object.entries(properties)) {
      if (this._appliedProperties.get(name) !== value) {
        this._appliedProperties.set(name, value);
        this.style.setProperty(name, value);
      }
    }
  }

  /**
   * Replaces the whole text of the alpha field and puts the caret in front of
   * the `%` by default.
   */
  private _writeAlphaText(
    input: IgcInputComponent,
    text: string,
    caret = caretLimit(text)
  ): void {
    input.setRangeText(text, 0, input.value.length);
    input.setSelectionRange(caret, caret);
  }

  private _setAlpha(percent: number): void {
    const alpha = clamp(percent, 0, 100) / 100;

    if (this._color.alpha === alpha) {
      return;
    }

    this._color.alpha = alpha;
    this._updateColor();
    this._emitInputEvent();
  }

  private _updateColor(): void {
    this._formValue.setValueAndFormState(this._color.asString(this.format));
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
        exportparts="marker, dragging"
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
        .value=${String(this._alphaPercent)}
        @input=${this._handleAlphaSliderValueChange}
        @change=${stopPropagation}
      />

      <igc-visually-hidden>
        <label for="alpha">Alpha value</label>
      </igc-visually-hidden>

      <igc-input
        ${ref(this._alphaInputRef)}
        id="alpha"
        name="alpha"
        placeholder="Alpha value"
        inputmode="numeric"
        part="alpha-input"
        outlined
        type="text"
        .value=${live(`${this._alphaPercent}%`)}
        @input=${this._handleAlphaInputEdit}
        @focusin=${this._handleAlphaInputCaret}
        @click=${this._handleAlphaInputCaret}
        @keyup=${this._handleAlphaInputCaret}
        @igcChange=${this._handleAlphaInputChange}
      ></igc-input>
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
        .value=${live(this._color.asString(this.format))}
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

  private get _anchorParts(): ReturnType<typeof partMap> {
    return partMap({
      anchor: true,
      empty: this._color.isEmpty,
      'input-mode': this._isInputMode,
    });
  }

  /**
   * The swatch preview style that both anchors use.
   *
   * `--_color-preview` paints the opaque color over the left half.
   * `--_alpha-preview` paints the color with its real alpha over the whole
   * surface. Do not transpose the two. See the `swatch-preview` mixin.
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
        .value=${live(this.value)}
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
    return this._isInputMode
      ? this._renderInputAnchor()
      : this._renderButtonAnchor();
  }

  private _renderHelperText(): TemplateResult {
    return this._renderValidationContainer({
      id: 'helper-text',
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
        <igc-popover
          ?open=${this.open}
          flip
          .scrollStrategy=${this.scrollStrategy}
          @igcPopoverScrollClose=${this._handleClosing}
        >
          ${this._renderAnchor()}${this._renderPicker()}
        </igc-popover>
        ${
          !this._isInputMode && this.label
            ? html`<label part="label" for="trigger">${this.label}</label>`
            : nothing
        }
        ${this._renderHelperText()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-picker': IgcColorPickerComponent;
  }
}
