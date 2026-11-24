import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  type ColorPanelContext,
  colorPanelContext,
  colorPickerContext,
} from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  isKey,
} from '#internals/controllers/key-bindings.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import {
  addSlotController,
  DefaultSlot,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HydrationMixin } from '#internals/mixins/hydration.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import { createTimer } from '#internals/timing.js';
import { isEmpty } from '#internals/utils/arrays.js';
import {
  getElementFromPath,
  stopPropagation,
} from '#internals/utils/events.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import { formatString } from '#internals/utils/strings.js';
import { all } from '#themes/color-panel/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcButtonGroupComponent from '../button-group/button-group.js';
import IgcToggleButtonComponent from '../button-group/toggle-button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  formatColorName,
  formatHueValue,
  formatOklchAreaValue,
  formatPercent,
  formatSwatchName,
  formatValueWithName,
} from '../color-picker/color-name.js';
import {
  CONTRAST_LEVELS,
  contrastRatio,
  formatContrastRatio,
} from '../color-picker/contrast.js';
import { colorPickerI18nConfig, formatNameKeys } from '../color-picker/i18n.js';
import {
  ColorModel,
  colorFormats,
  colorKey,
  formatPlaceholders,
  parseTypedColor,
  opaqueColor,
} from '../color-picker/model.js';
import {
  type AreaSpace,
  cuspColor,
  OKLCH_AREA_CHROMA,
  oklchHueTrack,
} from '../color-picker/oklch.js';
import IgcPickerCanvasComponent, {
  type PickerCanvasEventDetail,
} from '../color-picker/picker-canvas.js';
import IgcDividerComponent from '../divider/divider.js';
import IgcInputComponent from '../input/input.js';
import IgcSelectItemComponent from '../select/select-item.js';
import IgcSelectComponent from '../select/select.js';
import type { ColorFormat, ColorPanelView } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import IgcColorSwatchGroupComponent from './color-swatch-group.js';
import IgcColorSwatchComponent from './color-swatch.js';
import {
  panelColor,
  parseViews,
  resolveSwatch,
  resolveView,
  SWATCH_SELECTED_STATE,
  swatchKey,
  syncMarker,
  parseContextColor,
  VIEWS,
} from './common.js';
import { styles } from './themes/color-panel.base.css.js';
import { styles as shared } from './themes/shared/color-panel.common.css.js';

export interface IgcColorPanelComponentEventMap {
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
}

/** The alpha text is `<digits>%`. An edit removes every other character. */
const nonDigits = /\D/g;

/** The last caret offset in `<digits>%`, the position in front of the `%`. */
function caretLimit(text: string): number {
  return Math.max(text.length - 1, 0);
}

/**
 * The EyeDropper API subset in use. The baseline DOM typings do not include it.
 * Firefox and Safari do not implement it.
 */
interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>;
}

type EyeDropperConstructor = new () => EyeDropperLike;

function getEyeDropper(): EyeDropperConstructor | undefined {
  return (globalThis as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
}

/** The vertical distance in pixels within which two swatches share a row. */
const ROW_TOLERANCE = 1;

/** The icon and the name of the copy button in each status. */
const COPY_STATUSES = {
  copy: { icon: 'copy_content', labelKey: 'color_picker_copy' },
  success: { icon: 'copy_success', labelKey: 'color_picker_copied' },
  error: { icon: 'error', labelKey: 'color_picker_copy_failed' },
} as const;

type CopyStatus = keyof typeof COPY_STATUSES;

/** How long the copy button shows the result of a copy, in milliseconds. */
const COPY_RESET_DELAY = 1000;

/** The controls where Enter applies the draft of a color picker in the confirm mode. */
const valueControls = `${IgcColorSwatchComponent.tagName}, ${IgcPickerCanvasComponent.tagName}, input[type="range"]`;

/**
 * A color selection surface that stays in the page.
 *
 * The user picks a color with the color area, the hue slider and the optional
 * alpha slider. The area is saturation by value, or lightness by chroma at the
 * OKLCH hue in the `oklch` format. The user can also type any CSS color string,
 * such as hex, `rgb()`, `hsl()`, `oklch()` or a named color, pick a swatch, or
 * pick a color from the screen with the native EyeDropper API, where the
 * browser provides one.
 *
 * The panel is not a form control. The color picker shows it in a popup.
 *
 * @element igc-color-panel
 *
 * @slot - The color swatches and swatch groups. The panel shows them in its swatch list, after the swatches of `swatches`.
 *
 * @fires igcInput - Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eye dropper.
 * @fires igcChange - Emitted when the user ends a change of the color: on the release of the canvas or a slider, on each key that moves them, on a commit of the color text or the alpha input, and on a swatch or an eye dropper pick.
 *
 * @csspart base - The wrapper of the panel.
 * @csspart picker-canvas - The area: saturation by value, or lightness by chroma in the `oklch` format.
 * @csspart marker - The marker on the area that shows the picked color.
 * @csspart dragging - Added to the marker part while the user drags it.
 * @csspart main-row - The row containing the hue slider and the copy/eyedropper buttons.
 * @csspart alpha-row - The row containing the alpha slider and input, rendered when `show-alpha` is set.
 * @csspart inputs-row - The row containing the format select and the color value input.
 * @csspart buttons - The wrapper around the copy and eyedropper buttons.
 * @csspart hue - The hue slider.
 * @csspart alpha - The alpha slider.
 * @csspart alpha-input - The input of the alpha value, rendered when `show-alpha` is set.
 * @csspart copy - The button that copies the current color value to the clipboard.
 * @csspart eye-dropper - The button that activates the EyeDropper API.
 * @csspart format-select - The select control used to switch the color string format.
 * @csspart swatches - The swatch list.
 * @csspart swatch - A swatch of the `swatches` property.
 * @csspart selected - Added to the swatch part of the selected swatch.
 * @csspart view-switcher - The view switcher, rendered when `views` has both views.
 * @csspart view-button - A button of the view switcher.
 * @csspart active - Added to the view-button part of the view on screen.
 * @csspart contrast - The contrast readout, rendered when `contrast-against` has a color and the value is not empty.
 * @csspart contrast-ratio - The contrast ratio of the value over `contrast-against`.
 * @csspart contrast-mark - A WCAG level of the contrast readout, AA or AAA.
 * @csspart pass - Added to the contrast-mark part of a level that the ratio passes.
 * @csspart fail - Added to the contrast-mark part of a level that the ratio fails.
 */
export default class IgcColorPanelComponent extends HydrationMixin(
  I18nMixin(
    EventEmitterMixin<IgcColorPanelComponentEventMap>(LitElement),
    colorPickerI18nConfig
  )
) {
  public static readonly tagName = 'igc-color-panel';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcColorPanelComponent,
      IgcPickerCanvasComponent,
      IgcInputComponent,
      IgcSelectComponent,
      IgcSelectItemComponent,
      IgcDividerComponent,
      IgcIconButtonComponent,
      IgcButtonGroupComponent,
      IgcToggleButtonComponent,
      IgcColorSwatchComponent,
      IgcColorSwatchGroupComponent,
      IgcVisuallyHiddenComponent
    );
  }

  //#region Internal state and properties

  private readonly _picker = addAsyncContextConsumer(this, colorPickerContext);

  private readonly _alphaInputRef = createRef<IgcInputComponent>();
  private readonly _canvasRef = createRef<IgcPickerCanvasComponent>();
  private readonly _listboxRef = createRef<HTMLElement>();

  private readonly _supportsEyeDropper = Boolean(getEyeDropper());
  private _color = ColorModel.empty();

  /** The color of the last `igcChange` or the last value from code. */
  private _reportedKey = '';

  /** Whether the marker waits for a move to the color. */
  private _markerStale = false;

  private readonly _appliedProperties = new Map<string, string>();

  private _activeView: ColorPanelView = 'gradient';

  /** Whether a swatch connected, disconnected or changed its color. */
  private _swatchesStale = true;

  private _selectedKey?: string;

  private _hasSlottedSwatches = false;

  /** The color of `contrastAgainst`. It is empty when it does not resolve. */
  private _contrastColor = ColorModel.empty();

  /** Whether `contrastAgainst` depends on its context, such as a `var()`. */
  private _contrastInContext = false;

  @state()
  private _copyStatus: CopyStatus = 'copy';

  /** Only the latest copy in the page shows its result. */
  private _copyId = 0;

  private readonly _copyTimer = createTimer(
    () => (this._copyStatus = 'copy'),
    COPY_RESET_DELAY
  );

  private readonly _panelContext: ColorPanelContext = {
    noColorLabel: () => this.resourceStrings.color_picker_no_color,
    swatchName: (color) => formatSwatchName(color, this),
    refreshSwatches: () => {
      this._swatchesStale = true;
      this.requestUpdate();
    },
  };

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._panelContext.refreshSwatches,
  });

  //#endregion

  //#region Public attributes and properties

  /**
   * The value of the component as a CSS color string, in `format`. Accepts any
   * CSS color, such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named
   * color. A color outside the sRGB gamut is clipped to it.
   *
   * An empty, whitespace-only or invalid string clears the value. So does a
   * color that depends on its context: `currentcolor`, `var()`, `light-dark()`
   * or a system color.
   *
   * @attr value
   */
  @property()
  public set value(value: string) {
    const color = ColorModel.parse(value);
    const key = colorKey(color);

    this._reportedKey = key;

    // The same color keeps the hue and the saturation that a gray does not
    // carry. Only an empty color has an empty key.
    if (key === colorKey(this._color)) {
      return;
    }

    this._color = color;
    this._markerStale = true;
  }

  public get value(): string {
    return this._color.asString(this.format);
  }

  /**
   * The color format of the string value.
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
   * Whether the format select is hidden.
   *
   * @attr hide-formats
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-formats' })
  public hideFormats = false;

  /**
   * Whether to show the alpha slider and input.
   *
   * @attr show-alpha
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-alpha' })
  public showAlpha = false;

  /**
   * Pre-defined color strings. The component renders them as swatches in its
   * swatch list, in front of the swatch children. An empty string gives the
   * no-color swatch.
   */
  @property({ attribute: false })
  public swatches: string[] = [];

  /**
   * The views of the component, as a space-separated list of `gradient` and
   * `swatches`. With both views, a view switcher shows at the top.
   *
   * With only the gradient view, the swatch list shows below the gradient
   * controls. With the swatch view, the swatch list shows only in that view.
   *
   * @attr views
   * @default 'gradient'
   */
  @property()
  public views = 'gradient';

  /**
   * The view on screen: `gradient` or `swatches`. The view switcher sets it
   * and emits no event. A view that `views` does not have gives the first
   * view of `views`.
   *
   * @attr active-view
   * @default 'gradient'
   */
  @property({ attribute: 'active-view' })
  public set activeView(value: ColorPanelView) {
    this._activeView = value;
  }

  public get activeView(): ColorPanelView {
    return resolveView(this.views, this._activeView);
  }

  /**
   * The background color of the contrast readout, as any CSS color. A color
   * that depends on its context, such as a `var()`, resolves from the
   * component. The readout shows the WCAG 2 contrast ratio of the value over
   * this color, with the AA and AAA levels for normal text. An empty or
   * invalid color hides it.
   *
   * @attr contrast-against
   */
  @property({ attribute: 'contrast-against' })
  public contrastAgainst = '';

  //#endregion

  constructor() {
    super();

    // A theme can change the `var()` colors.
    addThemingController(this, all, {
      themeChange: () => this._refreshContextColors(),
    });

    addContextProvider(this, {
      context: colorPanelContext,
      value: () => this._panelContext,
      // The locale formats the alpha of a swatch name.
      watch: ['resourceStrings', 'locale'],
    });

    // The canvas has no size while the panel is hidden, as in a closed popup.
    // A panel that shows again can have new `var()` colors, and a swatch in a
    // group that rendered late reads its color from the page only now.
    addResizeObserverController(this, {
      callback: () => {
        this[syncMarker]();
        this._refreshContextColors();
      },
      requestUpdate: false,
    });

    // The `focusin` handler moves the tab stop.
    addRovingFocusController<IgcColorSwatchComponent>(this, {
      items: () => this._swatchElements(),
      current: () => this._focusedSwatch(),
      focusItem: (swatch) => swatch.focus(),
      activateItem: this._pickSwatch,
      keybindings: { ref: this._listboxRef },
    });

    addKeybindings(this, { ref: this._listboxRef })
      .set(arrowUp, () => this._focusRow(-1))
      .set(arrowDown, () => this._focusRow(1));

    addKeybindings(this, {
      skip: () => !this._alphaInputRef.value,
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

    // After the roving focus, so the picker gets a swatch that Enter picks.
    addKeybindings(this, {
      skip: (_, event) => !getElementFromPath(valueControls, event),
    }).set(enterKey, () => this._picker.value!.applyDraft(), {
      when: () => this._picker.value?.isConfirmMode() ?? false,
    });
  }

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    this._copyId++;
    this._copyTimer.stop();
    this._copyStatus = 'copy';
    super.disconnectedCallback();
  }

  protected override update(props: PropertyValues<this>): void {
    this._applyColorProperties();
    super.update(props);
  }

  protected override willUpdate(props: PropertyValues<this>): void {
    // A switch to the gradient view renders the canvas again, and the area
    // of the OKLCH format has other axes.
    if (props.has('activeView') || props.has('views') || props.has('format')) {
      this._markerStale = true;
    }

    if (this._swatchesStale) {
      this._hasSlottedSwatches = !isEmpty(this._slottedSwatches());
    }

    if (props.has('contrastAgainst')) {
      this._resolveContrastColor();
    }
  }

  protected override updated(): void {
    if (this._markerStale) {
      this._markerStale = false;
      // Wait for the paint, then move the marker to the color.
      requestAnimationFrame(() => this[syncMarker]());
    }

    const key = colorKey(this._color);

    if (this._swatchesStale || key !== this._selectedKey) {
      this._syncSwatches(key);
    }
  }

  //#endregion

  //#region Event handlers

  private _handleCanvasColorPicked(
    event: CustomEvent<PickerCanvasEventDetail>
  ): void {
    stopPropagation(event);

    const { x, y } = event.detail;

    if (this._areaSpace === 'oklch') {
      this._pickLightnessAndChroma(100 - y, (x / 100) * OKLCH_AREA_CHROMA);
      return;
    }

    this._color.setSaturationAndValue(x, 100 - y);
    this._applyUserColor();
  }

  private _handleHueValueChange(event: Event): void {
    stopPropagation(event);

    const hue = asNumber((event.target as HTMLInputElement).value);

    if (this._areaSpace === 'oklch') {
      // The gamut of the new hue can cut the chroma, which moves the marker.
      if (this._color.setOklchHue(hue)) {
        this[syncMarker]();
      }
    } else {
      this._color.h = hue;
    }

    this._applyUserColor();
  }

  private _handleAlphaSliderValueChange(event: Event): void {
    stopPropagation(event);

    this._setAlpha(asNumber((event.target as HTMLInputElement).value));
  }

  /** The `change` of a slider or the canvas: at the release, or on a key. */
  private _handleGestureEnd(event: Event): void {
    stopPropagation(event);
    this._endChange();
  }

  /**
   * Writes the alpha field again as `<digits>%` after each edit, because
   * `beforeinput` carries `data` only for typing, not for paste, drop,
   * composition, undo or autofill.
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
   * Keeps the caret and the selection in the digits. `keyup`, `focusin` and
   * `click` can put the caret after the `%`.
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
   * Steps the alpha from the color, not the text, because a held key repeats
   * faster than a render. It writes the text itself, because a write from the
   * render applies one frame late and the caret jumps.
   */
  private _handleAlphaInputSpin(increment: -1 | 1): void {
    const input = this._alphaInputRef.value;
    const percent = clamp(this._alphaPercent + increment, 0, 100);

    if (!input || percent === this._alphaPercent) return;

    this._writeAlphaText(input, `${percent}%`);
    this._setAlpha(percent);
    this._endChange();
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

    if (isKey(event, endKey) || (native.selectionEnd ?? 0) >= limit) {
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

    this._endChange();
  }

  private _handleFormatChange(
    event: CustomEvent<IgcSelectItemComponent>
  ): void {
    stopPropagation(event);

    this.format = event.detail.value as ColorFormat;
    this._picker.value?.setFormat(this.format);
  }

  private _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const color = parseTypedColor(event.detail);

    if (!color) {
      (event.target as IgcInputComponent).value = this.value;
      return;
    }

    // A commit of the text, so no `igcInput`.
    this._color = color;
    this._markerStale = true;
    this.requestUpdate();
    this._endChange();
  }

  private _handleEyeDropperClick(): void {
    const EyeDropper = getEyeDropper();

    if (!EyeDropper) return;

    new EyeDropper()
      .open()
      .then((result) => this._pickColor(result.sRGBHex))
      .catch(() => {});
  }

  private async _handleCopy(): Promise<void> {
    const id = ++this._copyId;
    let status: CopyStatus = 'success';

    try {
      // Outside a secure context there is no clipboard, and this throws.
      await navigator.clipboard.writeText(this.value);
    } catch {
      status = 'error';
    }

    if (id === this._copyId) {
      this._copyStatus = status;
      this._copyTimer.start();
    }
  }

  private _handleSwatchClick(event: Event): void {
    const swatch = this._swatchFromEvent(event);

    if (swatch) {
      this._pickSwatch(swatch);
    }
  }

  private _handleSwatchFocusIn(event: FocusEvent): void {
    const swatch = this._swatchFromEvent(event);

    if (swatch) {
      this._setTabStop(swatch, this._swatchElements());
    }
  }

  private _handleViewSelect(event: CustomEvent<string>): void {
    stopPropagation(event);

    this.activeView = event.detail as ColorPanelView;
    this._picker.value?.setActiveView(this.activeView);
  }

  //#endregion

  //#region Color changes

  private get _areaSpace(): AreaSpace {
    return this.format === 'oklch' ? 'oklch' : 'hsv';
  }

  /**
   * The marker position in percent of the area: across, and up from the
   * bottom. In the OKLCH format, the chroma and the lightness.
   */
  private get _areaPosition(): [across: number, up: number] {
    if (this._areaSpace === 'oklch') {
      const [lightness, chroma] = this._color.toOKLCH();
      return [(chroma / OKLCH_AREA_CHROMA) * 100, lightness];
    }

    const [, saturation, value] = this._color.toHSV();
    return [saturation, value];
  }

  /**
   * Takes a pick on the OKLCH area. Beyond the gamut edge the chroma stops at
   * the edge, and so does the marker. A pick of the same color reports
   * nothing.
   */
  private _pickLightnessAndChroma(lightness: number, chroma: number): void {
    const previous = this.value;

    if (this._color.setLightnessAndChroma(lightness, chroma)) {
      this[syncMarker]();
    }

    if (this.value !== previous) {
      this._applyUserColor();
    }
  }

  /** The alpha channel as the whole percentage that both alpha controls use. */
  private get _alphaPercent(): number {
    return Math.round(this._color.alpha * 100);
  }

  /**
   * The pure hue that the HSV area and the hue thumb use. In the OKLCH format,
   * the cusp of the hue.
   */
  private get _currentColor(): string {
    return this._areaSpace === 'oklch'
      ? cuspColor(this._color.toOKLCH()[2])
      : `hsl(${this._color.h} 100% 50%)`;
  }

  /**
   * Copies the colors that the stylesheet needs onto the host. `update()` calls
   * it, so it also runs on a first render with no value.
   */
  private _applyColorProperties(): void {
    this._setHostColor('--_current-color', this._currentColor);
    this._setHostColor('--_selected-color', opaqueColor(this._color));
    this._setHostColor(
      '--_hue-slider-track',
      this._areaSpace === 'oklch' ? oklchHueTrack() : ''
    );
  }

  private _setHostColor(name: string, value: string): void {
    if (this._appliedProperties.get(name) !== value) {
      this._appliedProperties.set(name, value);
      this.style.setProperty(name, value);
    }
  }

  /** Replaces the alpha text. The caret goes in front of the `%` by default. */
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
    this._applyUserColor();
  }

  private _applyUserColor(): void {
    this.requestUpdate();
    this.emitEvent('igcInput', { detail: this.value });
  }

  /** Takes a whole color from a swatch or the eye dropper, as one change. */
  private _pickColor(value: string): void {
    this._color = ColorModel.parse(value);
    this._markerStale = true;
    this._applyUserColor();
    this._endChange();
  }

  private _endChange(): void {
    const key = colorKey(this._color);

    if (key !== this._reportedKey) {
      this._reportedKey = key;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  /** Reads the colors that depend on the context again. */
  private _refreshContextColors(): void {
    if (this._contrastInContext) {
      this._resolveContrastColor();
    }

    this._panelContext.refreshSwatches();
  }

  /** Reads the color of `contrastAgainst`, also from the context. */
  private _resolveContrastColor(): void {
    const value = this.contrastAgainst ?? '';
    const color = ColorModel.parse(value);

    // The parser rejects the colors that depend on the context.
    this._contrastInContext = color.isEmpty && Boolean(value);
    this._contrastColor = this._contrastInContext
      ? parseContextColor(this, value)
      : color;
  }

  //#endregion

  //#region Swatch list

  /**
   * All swatches of the list, in order: the swatches of `swatches`, then the
   * slotted swatches and the swatches inside the slotted elements, such as a
   * swatch group.
   */
  private _swatchElements(): IgcColorSwatchComponent[] {
    const own = Array.from(
      this._listboxRef.value?.querySelectorAll<IgcColorSwatchComponent>(
        `:scope > ${IgcColorSwatchComponent.tagName}`
      ) ?? []
    );

    return [...own, ...this._slottedSwatches()];
  }

  /** The slotted swatches and the swatches inside the slotted elements. */
  private _slottedSwatches(): IgcColorSwatchComponent[] {
    const tag = IgcColorSwatchComponent.tagName;

    // A swatch that is not defined yet has no internal API.
    return this._slots
      .getAssignedElements(DefaultSlot, { flatten: true })
      .flatMap((element) =>
        element.localName === tag
          ? [element]
          : Array.from(element.querySelectorAll(tag))
      )
      .filter(
        (swatch): swatch is IgcColorSwatchComponent =>
          swatch instanceof IgcColorSwatchComponent
      );
  }

  private _swatchFromEvent(event: Event): IgcColorSwatchComponent | undefined {
    const swatch = getElementFromPath(IgcColorSwatchComponent.tagName, event);
    return swatch instanceof IgcColorSwatchComponent ? swatch : undefined;
  }

  private _focusedSwatch(): IgcColorSwatchComponent | undefined {
    return this._swatchElements().find((swatch) => swatch.matches(':focus'));
  }

  /**
   * Moves the focus to the nearest swatch in the next row of the list, up or
   * down. Rows come from the layout, so the swatch groups and the column count
   * of the theme count.
   */
  private _focusRow(direction: -1 | 1): void {
    const current = this._focusedSwatch();

    if (!current) {
      return;
    }

    const from = current.getBoundingClientRect();
    const center = from.left + from.width / 2;
    let best:
      | { swatch: IgcColorSwatchComponent; dy: number; dx: number }
      | undefined;

    for (const swatch of this._swatchElements()) {
      const rect = swatch.getBoundingClientRect();
      const dy =
        direction > 0 ? rect.top - from.bottom : from.top - rect.bottom;

      // The same row, a row on the other side, or a hidden swatch.
      if (dy < -ROW_TOLERANCE || swatch === current || !rect.width) {
        continue;
      }

      const dx = Math.abs(rect.left + rect.width / 2 - center);

      if (
        !best ||
        dy < best.dy - ROW_TOLERANCE ||
        (Math.abs(dy - best.dy) <= ROW_TOLERANCE && dx < best.dx)
      ) {
        best = { swatch, dy, dx };
      }
    }

    if (best) {
      best.swatch.focus();
    }
  }

  private _setTabStop(
    stop: IgcColorSwatchComponent | undefined,
    swatches: IgcColorSwatchComponent[]
  ): void {
    for (const swatch of swatches) {
      const tabIndex = swatch === stop ? '0' : '-1';

      // A write restyles the swatch, also for the same value.
      if (swatch.getAttribute('tabindex') !== tabIndex) {
        swatch.setAttribute('tabindex', tabIndex);
      }
    }
  }

  /**
   * Selects the first swatch that has the color of the value: the list is a
   * single-select listbox. The tab stop is the focused swatch, else the
   * selected swatch, else the first swatch.
   */
  private _syncSwatches(key: string): void {
    const swatches = this._swatchElements();
    const readColors = this._swatchesStale;

    this._swatchesStale = false;
    this._selectedKey = key;

    if (readColors) {
      for (const swatch of swatches) {
        swatch[resolveSwatch]();
      }
    }

    const selected = swatches.find((swatch) => swatch[swatchKey] === key);

    for (const swatch of swatches) {
      const isSelected = swatch === selected;
      const internals = internalsOf(swatch);

      internals?.setARIA({ ariaSelected: `${isSelected}` });
      internals?.setState(SWATCH_SELECTED_STATE, isSelected);

      // Only the swatches of the `swatches` shortcut are parts of the panel.
      if (swatch.getRootNode() === this.renderRoot) {
        swatch.part.toggle('selected', isSelected);
      }
    }

    this._setTabStop(
      swatches.find((swatch) => swatch.matches(':focus')) ??
        selected ??
        swatches[0],
      swatches
    );
  }

  private _pickSwatch(swatch: IgcColorSwatchComponent): void {
    swatch[resolveSwatch]();

    const key = swatch[swatchKey];

    if (key !== null) {
      this._pickColor(key);
    }
  }

  //#endregion

  //#region Internal API

  /** @internal */
  public [panelColor](): ColorModel {
    return this._color.clone();
  }

  /** @internal */
  public [syncMarker](): void {
    const canvas = this._canvasRef.value;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // A hidden canvas has no size to place the marker on.
    if (!(rect.width && rect.height)) return;

    const { width: markerWidth, height: markerHeight } =
      canvas.getMarkerDimensions();

    const [across, up] = this._areaPosition;

    canvas.x = (across / 100) * rect.width - markerWidth;
    canvas.y = ((100 - up) / 100) * rect.height - markerHeight;
  }

  //#endregion

  private _renderCanvasGradient(): TemplateResult {
    const strings = this.resourceStrings;
    const space = this._areaSpace;
    const oklch = space === 'oklch';
    const [across, up] = this._areaPosition;
    const [, chroma, hue] = this._color.toOKLCH();
    const axes = oklch
      ? formatOklchAreaValue(up, chroma, this)
      : formatString(
          strings.color_picker_canvas_value,
          Math.round(across),
          Math.round(up)
        );
    // An empty value has no color name.
    const valueText = this._color.isEmpty
      ? axes
      : formatValueWithName(
          axes,
          formatColorName(this._color.toRGB(), strings),
          strings
        );

    return html`
      <igc-picker-canvas
        exportparts="marker, dragging"
        part="picker-canvas"
        ${ref(this._canvasRef)}
        @change=${this._handleGestureEnd}
        @igcColorPicked=${this._handleCanvasColorPicked}
        currentColor=${this._currentColor}
        markerColor=${opaqueColor(this._color)}
        .space=${space}
        .hue=${hue}
        .saturation=${across}
        .brightness=${up}
        .markerLabel=${
          oklch
            ? strings.color_picker_canvas_oklch_label
            : strings.color_picker_canvas_label
        }
        .markerValueText=${valueText}
      >
      </igc-picker-canvas>
    `;
  }

  private _renderHueSlider(): TemplateResult {
    const space = this._areaSpace;
    const hue = Math.round(
      space === 'oklch' ? this._color.toOKLCH()[2] : this._color.h
    );

    return html`
      <input
        aria-label=${this.resourceStrings.color_picker_hue}
        aria-valuetext=${formatHueValue(hue, this, space)}
        type="range"
        part="hue"
        min="0"
        max="360"
        .value=${String(hue)}
        @input=${this._handleHueValueChange}
        @change=${this._handleGestureEnd}
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

  private _renderButtons(): TemplateResult {
    const strings = this.resourceStrings;
    const copy = COPY_STATUSES[this._copyStatus];

    return html`
      <div part="buttons">
        ${this._renderIconButton(
          'copy',
          copy.icon,
          strings[copy.labelKey],
          this._handleCopy
        )}
        ${this._renderIconButton(
          'eye-dropper',
          'eye_dropper',
          strings.color_picker_eye_dropper,
          this._handleEyeDropperClick,
          !this._supportsEyeDropper
        )}
      </div>
    `;
  }

  private _renderAlphaRow(): TemplateResult {
    const strings = this.resourceStrings;

    return html`
      <input
        aria-label=${strings.color_picker_alpha}
        aria-valuetext=${formatPercent(this._alphaPercent / 100, this.locale)}
        type="range"
        part="alpha"
        min="0"
        max="100"
        .value=${String(this._alphaPercent)}
        @input=${this._handleAlphaSliderValueChange}
        @change=${this._handleGestureEnd}
      />

      <igc-visually-hidden>
        <label for="alpha">${strings.color_picker_alpha_value}</label>
      </igc-visually-hidden>

      <igc-input
        ${ref(this._alphaInputRef)}
        id="alpha"
        name="alpha"
        placeholder=${strings.color_picker_alpha_value}
        inputmode="numeric"
        part="alpha-input"
        outlined
        type="text"
        .value=${live(`${this._alphaPercent}%`)}
        @input=${this._handleAlphaInputEdit}
        @focusin=${this._handleAlphaInputCaret}
        @click=${this._handleAlphaInputCaret}
        @keyup=${this._handleAlphaInputCaret}
        @igcInput=${stopPropagation}
        @igcChange=${this._handleAlphaInputChange}
      ></igc-input>
    `;
  }

  private _renderSelect(): TemplateResult {
    const strings = this.resourceStrings;
    const label = strings.color_picker_format;

    return html`
      <igc-visually-hidden>
        <label for="format-select">${label}</label>
      </igc-visually-hidden>

      <igc-select
        id="format-select"
        part="format-select"
        placeholder=${label}
        name="format"
        outlined
        .value=${this.format}
        @igcChange=${this._handleFormatChange}
        @igcOpening=${stopPropagation}
        @igcOpened=${stopPropagation}
        @igcClosing=${stopPropagation}
        @igcClosed=${stopPropagation}
      >
        ${colorFormats.map(
          (format) =>
            html`<igc-select-item value=${format}
              >${strings[formatNameKeys[format]]}</igc-select-item
            >`
        )}
      </igc-select>
    `;
  }

  private _renderInputsRow(): TemplateResult {
    const label = this.resourceStrings.color_picker_value;

    return html`
      ${cache(this.hideFormats ? nothing : this._renderSelect())}
      <igc-visually-hidden>
        <label for="color-input">${label}</label>
      </igc-visually-hidden>

      <igc-input
        id="color-input"
        name="color-input"
        placeholder=${formatPlaceholders[this.format]}
        outlined
        .value=${live(this.value)}
        @igcInput=${stopPropagation}
        @igcChange=${this._handleColorInputChange}
      ></igc-input>
    `;
  }

  private _renderSwatches(
    view: ColorPanelView,
    views: ColorPanelView[]
  ): TemplateResult {
    // With only the gradient view, the list shows below the controls.
    const below = view === 'gradient' && !views.includes('swatches');
    const shown =
      (below || view === 'swatches') &&
      (!isEmpty(this.swatches) || this._hasSlottedSwatches);

    return html`
      ${shown && below ? html`<igc-divider></igc-divider>` : nothing}
      <div
        ${ref(this._listboxRef)}
        part="swatches"
        role="listbox"
        aria-label=${this.resourceStrings.color_picker_swatches}
        ?hidden=${!shown}
        @click=${this._handleSwatchClick}
        @focusin=${this._handleSwatchFocusIn}
      >
        ${this.swatches.map(
          (color) => html`
            <igc-color-swatch part="swatch" color=${color}></igc-color-swatch>
          `
        )}
        <slot></slot>
      </div>
    `;
  }

  private _renderViewSwitcher(view: ColorPanelView): TemplateResult {
    const strings = this.resourceStrings;
    const labels: Record<ColorPanelView, string> = {
      gradient: strings.color_picker_view_gradient,
      swatches: strings.color_picker_view_swatches,
    };

    return html`
      <igc-button-group
        part="view-switcher"
        selection="single-required"
        @igcSelect=${this._handleViewSelect}
        @igcDeselect=${stopPropagation}
      >
        ${VIEWS.map(
          (item) => html`
            <igc-toggle-button
              part=${partMap({ 'view-button': true, active: item === view })}
              value=${item}
              ?selected=${item === view}
            >
              ${labels[item]}
            </igc-toggle-button>
          `
        )}
      </igc-button-group>
    `;
  }

  private _renderContrast(): TemplateResult | typeof nothing {
    // The server parses no colors, so the readout waits for the hydration.
    if (this._hydrating || this._color.isEmpty || this._contrastColor.isEmpty) {
      return nothing;
    }

    const strings = this.resourceStrings;
    const ratio = contrastRatio(this._color, this._contrastColor);

    return html`
      <div part="contrast">
        <span part="contrast-ratio">${formatContrastRatio(ratio, this)}</span>
        ${CONTRAST_LEVELS.map(({ nameKey, minimumRatio }) => {
          const pass = ratio >= minimumRatio;
          const text = pass
            ? strings.color_picker_contrast_pass
            : strings.color_picker_contrast_fail;

          return html`
            <span part=${partMap({ 'contrast-mark': true, pass, fail: !pass })}
              >${formatString(text, strings[nameKey])}</span
            >
          `;
        })}
      </div>
    `;
  }

  private _renderGradientView(): TemplateResult {
    return html`
      ${this._renderCanvasGradient()}
      <div part="main-row">
        ${this._renderHueSlider()}${this._renderButtons()}
      </div>
      ${
        this.showAlpha
          ? html`<div part="alpha-row">${this._renderAlphaRow()}</div>`
          : nothing
      }
      <div part="inputs-row">${this._renderInputsRow()}</div>
    `;
  }

  protected override render(): TemplateResult {
    const views = parseViews(this.views);
    const view = this.activeView;

    return html`
      <div part="base">
        ${views.length > 1 ? this._renderViewSwitcher(view) : nothing}
        ${cache(view === 'gradient' ? this._renderGradientView() : nothing)}
        ${this._renderSwatches(view, views)} ${this._renderContrast()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-panel': IgcColorPanelComponent;
  }
}
