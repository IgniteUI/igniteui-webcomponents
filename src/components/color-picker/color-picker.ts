import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { IgcBaseComboBoxComponent } from '#internals/bases/combo-box.js';
import {
  type ColorPickerContext,
  colorPickerContext,
} from '#internals/context.js';
import {
  addAriaProjector,
  ariaBindings,
  HELPER_TEXT_ID,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import type { FormValueTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import { renderClearIcon } from '#internals/templates/slotted-icon.js';
import {
  addSafeEventListener,
  focusLeftHost,
  stopPropagation,
} from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { all } from '#themes/color-picker/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcButtonComponent from '../button/button.js';
import { renderConfirmButtons } from '../button/confirm-buttons.js';
import IgcColorPanelComponent from '../color-panel/color-panel.js';
import {
  panelColor,
  panelParts,
  resolveView,
  syncMarker,
} from '../color-panel/common.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import type {
  ColorFormat,
  ColorPanelView,
  ColorPickerMode,
  ColorPickerSelectionCommit,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { colorPickerI18nConfig } from './i18n.js';
import {
  ColorModel,
  colorKey,
  formatPlaceholders,
  parseTypedColor,
  opaqueColor,
} from './model.js';
import { styles } from './themes/color-picker.base.css.js';
import { styles as shared } from './themes/shared/color-picker.common.css.js';
import { colorPickerValidators } from './validators.js';

export interface IgcColorPickerComponentEventMap {
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
  'helper-text',
  'clear-icon',
  'footer'
);

/** The parts of the color panel that the picker exposes as its own. */
const exportedPanelParts = panelParts.join(', ');

/**
 * Color input component.
 *
 * The user picks a color with the color area, the hue slider and the optional
 * alpha slider. The area is saturation by value, or lightness by chroma at the
 * OKLCH hue in the `oklch` format. The user can also type any CSS color string,
 * such as hex, `rgb()`, `hsl()`, `oklch()` or a named color.
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
 * @slot clear-icon - Renders the clear icon in input mode.
 * @slot - The color swatches and swatch groups. The picker shows them in the swatch list of its popup.
 * @slot footer - Renders content below the color panel in the popup. In the confirm mode of `selectionCommit`, the preview, Cancel and Apply show after it.
 *
 * @fires igcOpening - Emitted before the user opens the picker dropdown. Cancelable.
 * @fires igcOpened - Emitted after the picker dropdown opens on a user action.
 * @fires igcClosing - Emitted before the user closes the picker dropdown. Cancelable.
 * @fires igcClosed - Emitted after the picker dropdown closes on a user action.
 * @fires igcInput - Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eyedropper. In the confirm mode of `selectionCommit`, these changes emit nothing.
 * @fires igcChange - Emitted when the focus leaves the component after the user changed the color, and when the user applies the draft of the confirm mode.
 *
 * @csspart color-picker - The wrapper of the anchor, the label and the helper text.
 * @csspart anchor - The trigger element that opens the picker (the button in default mode, or the swatch prefix in input mode).
 * @csspart empty - Applied alongside `anchor` when no color value is set, rendering a checkered background.
 * @csspart input-mode - Added to the anchor part in input mode.
 * @csspart label - The label: the element after the anchor in default mode, or the label of the text field in input mode.
 * @csspart field - The text field in input mode. Set the `--ig-input-group-*` variables on it to style the field and not the inputs in the picker.
 * @csspart input - The container of the text field in input mode.
 * @csspart native-input - The native input of the text field in input mode.
 * @csspart prefix - The prefix wrapper of the text field in input mode. It holds the anchor.
 * @csspart suffix - The suffix wrapper of the text field in input mode. It holds the clear icon.
 * @csspart clear-icon - The clear icon wrapper in input mode. It shows while a color is set.
 * @csspart picker - The popover container holding the canvas, sliders, inputs and swatches.
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
 * @csspart selected - Added to the swatch part when the swatch has the color of the value.
 * @csspart view-switcher - The view switcher, rendered when `views` has both views.
 * @csspart view-button - A button of the view switcher.
 * @csspart active - Added to the view-button part of the view on screen.
 * @csspart contrast - The contrast readout, rendered when `contrast-against` has a color and the value is not empty.
 * @csspart contrast-ratio - The contrast ratio of the value over `contrast-against`.
 * @csspart contrast-mark - A WCAG level of the contrast readout, AA or AAA.
 * @csspart pass - Added to the contrast-mark part of a level that the ratio passes.
 * @csspart fail - Added to the contrast-mark part of a level that the ratio fails.
 * @csspart footer - The container below the color panel in the popup. It holds the `footer` slot and, in the confirm mode, the actions.
 * @csspart actions - The container of the preview, Cancel and Apply in the confirm mode.
 * @csspart preview - The preview of the initial color and the draft in the confirm mode.
 * @csspart preview-initial - The button that shows the initial color and restores it.
 * @csspart preview-current - The color of the draft.
 * @csspart cancel-button - The Cancel button of the confirm mode.
 * @csspart apply-button - The Apply button of the confirm mode.
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcColorPickerComponent extends I18nMixin(
  FormAssociatedRequiredMixin(
    EventEmitterMixin<
      IgcColorPickerComponentEventMap,
      typeof IgcBaseComboBoxComponent
    >(IgcBaseComboBoxComponent)
  ),
  colorPickerI18nConfig
) {
  public static readonly tagName = 'igc-color-picker';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcColorPickerComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcFocusTrapComponent,
      IgcButtonComponent,
      IgcIconComponent,
      IgcColorPanelComponent,
      IgcValidationContainerComponent,
      IgcVisuallyHiddenComponent
    );
  }

  //#region Internal state and properties

  protected override get __validators() {
    return colorPickerValidators;
  }

  protected readonly _slots = addSlotController(this, { slots: Slots });

  private static readonly _transformers: Partial<
    FormValueTransformers<string>
  > = {
    // The same color in another format is the same value.
    isSameValue: (a, b) =>
      a === b ||
      colorKey(ColorModel.parse(a)) === colorKey(ColorModel.parse(b)),
  };

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
    transformers: IgcColorPickerComponent._transformers,
  });

  private readonly _panelRef = createRef<IgcColorPanelComponent>();
  private readonly _anchorRef = createRef<
    HTMLButtonElement | IgcInputComponent
  >();

  private _color = ColorModel.empty();

  /** The color in the popup in the confirm mode, until Apply. */
  @state()
  private _draft?: ColorModel;

  private readonly _themes = addThemingController(this, all);

  private _activeView: ColorPanelView = 'gradient';

  /** The link of the color panel to this picker. */
  private readonly _pickerContext: ColorPickerContext = {
    setFormat: (format) => {
      this.format = format;
    },
    setActiveView: (view) => {
      this.activeView = view;
    },
    isConfirmMode: () => this._isConfirmMode,
    applyDraft: () => this._handleApply(),
  };

  @query(`#${HELPER_TEXT_ID}`)
  private readonly _helperText!: IgcValidationContainerComponent | null;

  private get _isInputMode(): boolean {
    return this.mode === 'input';
  }

  private get _isConfirmMode(): boolean {
    return this.selectionCommit === 'confirm';
  }

  /** The text input of input mode. After a mode change, the ref keeps the old anchor until the render. */
  private get _inputAnchor(): IgcInputComponent | undefined {
    const anchor = this._anchorRef.value;
    return anchor instanceof IgcInputComponent ? anchor : undefined;
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
   * The value of the component as a CSS color string. Accepts any CSS color,
   * such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named color. A
   * color outside the sRGB gamut is clipped to it.
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

    // The same color keeps the hue of a gray, which a color string does not
    // carry, as in the color panel.
    if (colorKey(color) !== colorKey(this._color)) {
      this._setColor(color);
    }

    this._updateColor();
  }

  public get value(): string {
    return this._formValue.value;
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
   * When the changes of the user in the popup apply. With `confirm`, they
   * change a draft: `value` keeps its color, and the popup shows the initial
   * color beside the draft. Apply, or Enter on the canvas marker, a slider or
   * a swatch, applies the draft with one `igcChange`. Cancel and every other
   * close drop it.
   *
   * @attr selection-commit
   * @default 'immediate'
   */
  @property({ attribute: 'selection-commit' })
  public selectionCommit: ColorPickerSelectionCommit = 'immediate';

  /**
   * Pre-defined color strings. The component renders them as swatches in the
   * swatch list of its popup, in front of the swatch children. An empty
   * string gives the no-color swatch.
   */
  @property({ attribute: false })
  public swatches: string[] = [];

  /**
   * The views of the popup, as a space-separated list of `gradient` and
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
   * The view on screen in the popup: `gradient` or `swatches`. The view
   * switcher sets it and emits no event. A view that `views` does not have
   * gives the first view of `views`.
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
   * The background color of the contrast readout in the popup, as any CSS
   * color. A color that depends on its context, such as a `var()`, resolves
   * from the popup. The readout shows the WCAG 2 contrast ratio of the value
   * over this color, with the AA and AAA levels for normal text. An empty or
   * invalid color hides it.
   *
   * @attr contrast-against
   */
  @property({ attribute: 'contrast-against' })
  public contrastAgainst = '';

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addSafeEventListener(this, 'focusout', this._handleFocusOut);

    addKeybindings(this, { skip: () => this.disabled })
      .set(escapeKey, this._closeToAnchor, { when: () => this.open })
      .set([altKey, arrowDown], this._handleAnchorClick)
      .set([altKey, arrowUp], this._closeToAnchor);

    addContextProvider(this, {
      context: colorPickerContext,
      value: () => this._pickerContext,
    });

    addAriaProjector(this, {
      target: () => this._inputAnchor,
      // A text input cannot have `aria-expanded`. The prefix button has it.
      state: () => ({ hasPopup: 'dialog' }),
    });
  }

  protected override willUpdate(props: PropertyValues<this>): void {
    super.willUpdate(props);

    // Every close but Apply drops the draft, also a close for `disabled`.
    if (
      (props.has('open') || props.has('selectionCommit')) &&
      !(this.open && this._isConfirmMode)
    ) {
      this._draft = undefined;
    }
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('format')) {
      this._serializeInFormat();
    }

    super.update(props);
  }

  /** Waits also for the color panel, which renders after the picker. */
  protected override async getUpdateComplete(): Promise<boolean> {
    const complete = await super.getUpdateComplete();
    const panelComplete = await this._panelRef.value?.updateComplete;

    return complete && (panelComplete ?? true);
  }

  protected override firstUpdated(): void {
    // The helper text renders after the anchor, so a host description misses it.
    if (!this._isInputMode && this.ariaDescribedByElements?.length) {
      this.updateComplete.then(() => this.requestUpdate());
    }
  }

  protected override updated(props: PropertyValues<this>): void {
    super.updated(props);

    if (props.has('open') && this.open) {
      // Wait for the paint, then sync the marker position with the color.
      requestAnimationFrame(() => this._panelRef.value?.[syncMarker]());
    }
  }

  //#endregion

  //#region Form associated overrides

  protected override get _ownedEditors(): (IgcInputComponent | undefined)[] {
    return [this._inputAnchor];
  }

  //#endregion

  //#region Event handlers

  private async _closeToAnchor(): Promise<void> {
    if (await this._hide(true)) {
      this._anchorRef.value?.focus();
    }
  }

  private _handleFocusOut(event: FocusEvent): void {
    if (!focusLeftHost(this, event)) {
      return;
    }

    this._handleBlur();
    this._reportChange(this.value);
  }

  private _handleColorInputChange(event: CustomEvent<string>): void {
    stopPropagation(event);

    const color = parseTypedColor(event.detail);

    if (!color) {
      (event.target as IgcInputComponent).value = this._color.asString(
        this.format
      );
      return;
    }

    this._setColor(color);
    // A commit of the text input, so no `igcInput`.
    this._writeFrom('user', () => this._updateColor());
  }

  private _handlePanelInput(event: CustomEvent<string>): void {
    stopPropagation(event);

    if (this._takePanelColor()) {
      this._emitInputEvent();
    }
  }

  /** The end of a change in the panel. The picker reports it when the focus leaves. */
  private _handlePanelChange(event: CustomEvent<string>): void {
    stopPropagation(event);
    this._takePanelColor();
  }

  /** A clear by the user: `igcInput` now, `igcChange` when the focus leaves. */
  private _handleClearClick(): void {
    if (this.disabled) {
      return;
    }

    this._setColor(ColorModel.empty());
    this._applyUserColor();
  }

  private _handleApply(): void {
    this._writeFrom('user', () => {
      if (this._draft) {
        this._setColor(this._draft);
        this._updateColor();
      }

      this._reportChange(this.value);
    });
    this._closeToAnchor();
  }

  private _handleRestoreClick(): void {
    this._draft = undefined;
  }

  //#endregion

  //#region Internal methods

  private _updateColor(): void {
    this._formValue.setValueAndFormState(this._color.asString(this.format));
    this.requestUpdate();
  }

  /** Writes the current color as a user change, then emits `igcInput`. */
  private _applyUserColor(): void {
    this._writeFrom('user', () => this._updateColor());
    this._emitInputEvent();
  }

  /** A new color ends the draft. */
  private _setColor(color: ColorModel): void {
    this._color = color;
    this._draft = undefined;
  }

  /**
   * Renders the current color in the active format.
   *
   * The `value` attribute can come before `format`, so the first update also
   * runs this. The color does not change, so the pristine state stays.
   */
  private _serializeInFormat(): void {
    const value = this._color.asString(this.format);

    if (value !== this.value) {
      this._writeFrom('normalize', () =>
        this._formValue.setValueAndFormState(value)
      );
    }
  }

  /**
   * Writes the color of the panel as a change of the user, or into the draft
   * in the confirm mode. A disabled picker, or a closed one in the confirm
   * mode, renders its own color into the panel again, for an eye dropper pick
   * that ends after that. Returns whether the value changed.
   */
  private _takePanelColor(): boolean {
    const panel = this._panelRef.value;

    if (!panel) {
      return false;
    }

    if (this.disabled || (this._isConfirmMode && !this.open)) {
      this.requestUpdate();
      return false;
    }

    // The model of the panel keeps the hue of a gray.
    const color = panel[panelColor]();

    if (this._isConfirmMode) {
      this._draft = color;
      return false;
    }

    this._setColor(color);
    this._writeFrom('user', () => this._updateColor());

    return true;
  }

  private _emitInputEvent(): void {
    this.emitEvent('igcInput', { detail: this.value });
  }

  //#endregion

  //#region Public methods

  /* alternateName: focusComponent */
  /** Sets focus on the color picker. */
  public override focus(options?: FocusOptions): void {
    super.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the color picker. */
  public override blur(): void {
    cancelDeferredFocus(this);
    super.blur();
  }

  /**
   * Clears the value and the text of the input. As for a value set from code,
   * the component emits no events.
   */
  public clear(): void {
    this.value = '';
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
   * `--_color-preview` paints the opaque color over the left half.
   * `--_alpha-preview` paints the color with its real alpha over the whole
   * surface. Do not transpose the two. See the `swatch-preview` mixin.
   */
  private _previewStyle(model = this._color): ReturnType<typeof styleMap> {
    const color = colorKey(model);

    return bindIf(
      color,
      styleMap({
        '--_alpha-preview': color,
        '--_color-preview': opaqueColor(model),
      })
    );
  }

  private _renderButtonAnchor(): TemplateResult {
    const label = this.resourceStrings.color_picker_open;

    return html`
      <button
        ${ref(this._anchorRef)}
        ${ariaBindings({
          ...hostAria(this, {
            ownLabel: Boolean(this.label),
            description: this._helperText,
          }),
          describedByRef: HELPER_TEXT_ID,
        })}
        id="trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls="picker"
        aria-expanded=${this.open}
        part=${this._anchorParts}
        slot="anchor"
        style=${this._previewStyle()}
        ?disabled=${this.disabled}
        @click=${this._handleAnchorClick}
      >
        <igc-visually-hidden>${label}</igc-visually-hidden>
      </button>
    `;
  }

  private _renderClearIcon(): TemplateResult | typeof nothing {
    return this._color.isEmpty
      ? nothing
      : renderClearIcon(
          'clear-icon',
          this._handleClearClick,
          this.resourceStrings.color_picker_clear
        );
  }

  private _renderInputAnchor(): TemplateResult {
    return html`
      <igc-input
        ${ref(this._anchorRef)}
        slot="anchor"
        part="field"
        exportparts="container: input, input: native-input, label, prefix, suffix"
        outlined
        placeholder=${formatPlaceholders[this.format]}
        label=${ifDefined(this.label)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        .value=${live(this.value)}
        @igcInput=${stopPropagation}
        @igcChange=${this._handleColorInputChange}
      >
        <div slot="prefix">
          <button
            type="button"
            part=${this._anchorParts}
            aria-label=${this.resourceStrings.color_picker_open}
            aria-haspopup="dialog"
            aria-controls="picker"
            aria-expanded=${this.open}
            style=${this._previewStyle()}
            ?disabled=${this.disabled}
            @click=${this._handleAnchorClick}
          ></button>
        </div>
        ${this._renderClearIcon()}
      </igc-input>
    `;
  }

  //#endregion

  private _renderPicker(): TemplateResult {
    return html`
      <igc-focus-trap ?disabled=${!this.open} .inert=${!this.open}>
        <div
          id="picker"
          part="picker"
          role="dialog"
          aria-label=${this.resourceStrings.color_picker_dialog_label}
          aria-modal="false"
        >
          <igc-color-panel
            ${ref(this._panelRef)}
            exportparts=${exportedPanelParts}
            .format=${this.format}
            .value=${live(this._draft?.asString(this.format) ?? this.value)}
            .showAlpha=${this.showAlpha}
            .hideFormats=${this.hideFormats}
            .swatches=${this.swatches}
            .views=${this.views}
            .activeView=${this.activeView}
            .contrastAgainst=${this.contrastAgainst}
            .resourceStrings=${this.resourceStrings}
            @igcInput=${this._handlePanelInput}
            @igcChange=${this._handlePanelChange}
          >
            <slot></slot>
          </igc-color-panel>
          ${this._renderFooter()}
        </div>
      </igc-focus-trap>
    `;
  }

  private _renderFooter(): TemplateResult {
    const confirm = this._isConfirmMode;

    return html`
      <div
        part="footer"
        ?hidden=${!(confirm || this._slots.hasAssignedElements('footer'))}
      >
        <slot name="footer"></slot>
        ${confirm ? this._renderActions() : nothing}
      </div>
    `;
  }

  private _renderActions(): TemplateResult {
    const strings = this.resourceStrings;
    const draft = this._draft ?? this._color;

    return html`
      <div part="actions">
        <div part="preview">
          <button
            type="button"
            part="preview-initial"
            aria-label=${strings.color_picker_initial_color}
            ?data-empty=${this._color.isEmpty}
            style=${this._previewStyle()}
            @click=${this._handleRestoreClick}
          ></button>
          <span
            part="preview-current"
            ?data-empty=${draft.isEmpty}
            style=${this._previewStyle(draft)}
          ></span>
        </div>
        ${renderConfirmButtons({
          theme: this._themes.theme,
          cancel: {
            part: 'cancel-button',
            label: strings.color_picker_cancel,
            onClick: this._closeToAnchor,
          },
          confirm: {
            part: 'apply-button',
            label: strings.color_picker_apply,
            onClick: this._handleApply,
          },
        })}
      </div>
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
          ${
            this._isInputMode
              ? this._renderInputAnchor()
              : this._renderButtonAnchor()
          }${this._renderPicker()}
        </igc-popover>
        ${
          !this._isInputMode && this.label
            ? html`<label part="label" for="trigger">${this.label}</label>`
            : nothing
        }
        ${IgcValidationContainerComponent.create(this)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-picker': IgcColorPickerComponent;
  }
}
